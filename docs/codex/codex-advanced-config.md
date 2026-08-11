# Codex 高级配置教程

基础配置让 Codex"能跑起来"，但一个团队几十号人、十几个项目共用一套配置时，问题立刻浮现：有人想开图像生成，有人坚持不要；生产环境要求沙箱隔离，个人开发又嫌审批太烦；跑一次大规模重构想并行派多个子代理，默认配置却把线程卡死。这些都要靠基础配置之外的三件进阶利器解决——**特性开关（Feature Flags）**、**Profiles 命名预设**与**沙箱安全配置**。本章把它们一次讲透。

## 一、特性开关（Feature Flags）

### 1.1 什么是特性开关

Codex 的新能力默认关闭、分阶段放量，通过**特性开关**控制是否启用。这样你可以按风险接受度自己决定：稳定特性的开关就写在 config.toml，实验特性的开关则建议先小范围试。

![特性开关面板](/images/codex/advanced-config/01-feature-flags.png)

### 1.2 特性管理命令

```bash
codex features list                 # 列出全部特性及开关状态
codex features enable <feature>     # 启用某个特性
codex features disable <feature>    # 禁用某个特性
codex --enable <feature> "prompt"   # 单次会话临时启用（不改配置）
codex --disable <feature> "prompt"  # 单次会话临时禁用
```

对应的持久化配置写在 `[features]` 节：

```toml
[features]
codex_hooks = true            # 稳定：启用 Hooks
collaboration_modes = true    # 稳定：Plan 协作模式
tool_search = true            # 稳定：工具搜索
```

### 1.3 稳定特性（2026）

| 特性 | 作用 | 适用场景 |
| --- | --- | --- |
| `codex_hooks` | 会话生命周期钩子（SessionStart / PreToolUse / Stop 等） | 日志、安全扫描、代码格式化 |
| `collaboration_modes` | Plan 模式，规划与执行分离 | 复杂任务先出计划再动手 |
| `request_rule` | 智能审批规则 | 按规则自动放行/拦截工具 |
| `image_generation` | 图像生成能力 | 生成配图、示意图 |
| `tool_search` | 工具搜索能力 | 工具数量多时快速检索 |

### 1.4 实验特性与废弃特性

实验特性默认关闭，存在行为不稳定或破坏性变更的可能，只建议在验证环境开启：

| 类别 | 特性名 | 说明 |
| --- | --- | --- |
| 实验 | `shell_snapshot` | shell 快照 |
| 实验 | `unified_exec` | 统一执行 |
| 实验 | `apply_patch_freeform` | 自由格式补丁应用 |
| 实验 | `js_repl` | JS 交互解释器 |
| 实验 | `in_app_browser` | 应用内浏览器 |
| 实验 | `remote_models` | 远程模型 |
| 实验 | `fast_mode` | 快速模式 |
| 废弃 | `web_search` | 已废弃，改用 `search_tool` |
| 废弃 | `child_agents_md` | 已废弃，并入 `multi_agent` |

::: warning 实验特性别上生产
实验特性随时可能改行为或下线。上生产环境前，用 `codex features list` 确认特性状态，稳定特性才放心全局开启。
:::

## 二、Profiles 命名配置预设

### 2.1 为什么需要 Profiles

config.toml 只有一套取值，但你的工作不止一种：日常写业务代码要轻量、快；做安全审计要沙箱全开、审批最严；跑批量重构要允许多子代理并行。**Profiles 把多套配置打包成命名预设，用 `--profile` 一键切换**，不必每次手改配置文件。

### 2.2 配置方式

在 config.toml 中用 `[profiles.<name>]` 声明预设，内部支持覆盖任意配置节：

```toml
# 日常开发预设：快速、宽松
[profiles.dev]
model_preset = "gpt-5-codex"
approval_policy = "on_request"
sandbox_mode = "read-only"   # 只读沙箱，改文件前先问

# 生产/审计预设：严格、隔离
[profiles.strict]
approval_policy = "untrusted"
sandbox_mode = "workspace-write"   # 仅工作区可写

# 批量重构预设：允许多子代理并行
[profiles.refactor]
model_preset = "gpt-5"
[profiles.refactor.agents]
max_threads = 8
```

调用方式：

```bash
codex --profile dev "实现登录接口"
codex --profile strict "审查这个项目的安全风险"
codex --profile refactor "把旧 API 迁移到新 SDK"
```

### 2.3 使用场景

| 场景 | 推荐 Profile 设计 |
| --- | --- |
| 个人多角色切换 | dev（日常）/ strict（审计）/ refactor（重构） |
| 团队按任务分派 | 后端 / 前端 / 数据管线，各自指定模型与审批 |
| 环境区分 | local（宽松）/ staging（中）/ prod（最严） |

::: tip 类比理解
Profile 就像 IDE 的快捷键方案：同一个 Codex，戴上"生产安全帽"就严格隔离，换上"日常工装"就快速放行，随时换装、互不污染。
:::

![Profile 配置预设](/images/codex/advanced-config/02-profiles.png)

## 三、沙箱与安全配置

### 3.1 sandbox_mode：隔离强度

审批模式解决"要不要问"，沙箱解决"真出事了能不能防住"。`sandbox_mode` 控制 Codex 运行命令时的进程隔离级别：

| 模式 | 行为 | 建议 |
| --- | --- | --- |
| `read-only` | 只读沙箱，默认拒绝写操作 | 陌生代码、只读分析 |
| `workspace-write` | 只允许写当前工作区 | 日常开发 |
| `danger-full-access` | 无沙箱限制 | 受控环境，谨慎 |

```toml
[sandbox]
sandbox_mode = "workspace-write"
```

### 3.2 Linux 沙箱：Landlock / seccomp 与 bwrap

Linux 下 Codex 底层使用 **Landlock + seccomp** 做轻量内核级隔离，也支持 **bwrap（bubblewrap）** 作为后备沙箱实现。Landlock 基于内核权限模型，开销小、无需额外工具；seccomp 拦截系统调用。需要更强隔离的场景可配置 bwrap。

### 3.3 WSL2 与 Windows 沙箱

- **WSL2**：在 Windows 上用 WSL2 跑 Codex 可获得完整的 Linux 沙箱支持（Landlock/seccomp/bwrap）。
- **Windows 原生**：提供**实验性 Windows 沙箱**支持，功能仍在完善，生产使用前以官方文档为准并自行验证。

::: warning 沙箱不是万能隔离
沙箱限制的是 Codex 触发的工具执行，不等于把整个进程放进虚拟机。涉及密钥、生产数据的操作，仍应配合审批与最小权限原则，不要把"沙箱开了"当成"安全无忧"。
:::

### 3.4 审批模式进阶

与沙箱配合的审批进阶组合：

```toml
[sandbox]
sandbox_mode = "workspace-write"

[model]
approval_policy = "on_failure"    # 沙箱内默认放行，失败才询问

# 单独管控默认工具的审批
default_tools_approval_mode = "approve"
```

要点：沙箱兜底 + 审批兜意识。沙箱管"能不能执行"，审批管"要不要你知情"，两者组合才能平衡体验与安全。

![沙箱隔离](/images/codex/advanced-config/03-sandbox.png)

## 四、多代理编排配置

### 4.1 [agents] 节

Codex 支持把独立任务委派给**子代理（Subagent）**并行执行。编排能力由 `[agents]` 节控制：

```toml
[agents]
max_threads = 6                    # 并行子代理线程数（默认 6）
max_depth = 1                      # 子代理嵌套深度（默认 1）
job_max_runtime_seconds = 600      # 单个子代理任务最长运行时长
```

| 参数 | 默认值 | 作用 | 调大场景 |
| --- | --- | --- | --- |
| `max_threads` | 6 | 同时并行的子代理数 | 模块众多、彼此独立的重构 |
| `max_depth` | 1 | 子代理能否再派子代理的嵌套层数 | 复杂递归任务（谨慎） |
| `job_max_runtime_seconds` | 无 | 单任务超时保护 | 防止子代理无限挂起 |

### 4.2 编排策略

- **并行 fan-out**：把"跑全仓测试""逐模块重构"拆成独立任务并行下发，充分利用 `max_threads`。
- **Plan 模式协同**：开启 `collaboration_modes` 后，主代理先出计划，再按计划派子代理执行，规划与执行分离，适合大型任务。
- **深度克制**：`max_depth` 每加一层，调试复杂度成倍上升。绝大多数场景保持 1，确有需要再调。

::: tip 类比理解
子代理像给团队派活：`max_threads` 是同时干活的同事数，`max_depth` 是允许"同事再带实习生"的层级，`job_max_runtime_seconds` 是每个人最长加班时长。人多了调度成本高，层级深了难回溯。
:::

## 五、实战案例：团队统一特性配置 + 个人 Profile

一个中型前端团队落地这套配置的完整方案：

**第 1 步：团队共享配置入库（项目级 .codex/config.toml）**

```toml
# 团队统一：稳定特性全开，成员无需各自折腾
[features]
codex_hooks = true
collaboration_modes = true
request_rule = true
image_generation = false   # 团队不开放图像生成，控制成本

[agents]
max_threads = 4
job_max_runtime_seconds = 600
```

**第 2 步：个人覆盖（全局 ~/.codex/config.toml）**

```toml
[auth]
# 个人 API Key 只留在全局，不入库

[profiles.dev]
model_preset = "gpt-5-codex"
approval_policy = "on_request"
sandbox_mode = "workspace-write"

[profiles.strict]
approval_policy = "untrusted"
sandbox_mode = "read-only"
```

**第 3 步：按需切换**

```bash
codex --profile dev "实现组件并补测试"      # 日常开发
codex --profile strict "审查依赖安全"       # 安全审查
codex exec "运行团队配置下全量测试"          # CI 走项目级默认配置
```

这样团队约定沉淀在仓库里，个人偏好留在全局，互不污染，新人 clone 仓库即获得一致的 Codex 行为。

## 六、最佳实践与常见问题

### 6.1 最佳实践

1. **稳定特性团队统一，实验特性个人尝鲜**：`codex features list` 先看状态，稳定特性写项目级 config 共享，实验特性用 `--enable` 单次试验。
2. **Profile 按"风险等级"而不是"人"设计**：dev / strict 这种按任务风险划分，比按人名划分更可复用、更可交接。
3. **沙箱 + 审批双层防线**：陌生仓库 `read-only` 起步，`workspace-write` 日常，`danger-full-access` 仅受控环境。
4. **子代理先小后大**：调大 `max_threads` 前先在小范围验证，避免并行失控刷屏、乱改文件。
5. **团队约定与个人偏好严格分离**：入库只放团队共享项，个人凭证与 Profile 留全局。

### 6.2 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| 特性开了没生效 | `codex features list` 确认状态；确认写的是 `[features]` 节且重启了会话 |
| `--profile` 不起作用 | 确认 Profile 名与 `[profiles.<name>]` 一一对应；命令行 `--profile` 优先级高于配置 |
| 沙箱拒绝写文件 | 检查 `sandbox_mode` 是 `read-only` 还是 `workspace-write`；确认目标文件在工作区内 |
| 子代理不动 / 并行不起来 | 确认 `collaboration_modes` 或 `multi_agent` 已启用；检查 `max_threads` 是否被意外调低 |
| 用到已废弃特性 | 用 `codex features list` 核对，`web_search` 改用 `search_tool`，`child_agents_md` 并入 `multi_agent` |

## 七、总结

高级配置的价值在于把 Codex 从"一个人的工具"变成"一个团队可控的体系"：特性开关让你按风险精准取舍能力，Profiles 让多套行为预设即换即用，沙箱配置给自动化操作套上隔离防线，多代理编排让大规模任务真正并行起来。三者叠加，再配合"团队共享入库、个人偏好留全局"的纪律，Codex 就能在个人效率与团队一致性之间找到平衡。更深入的 Hooks 自动化、MCP 外部工具与 Skills 技能，将在后续章节展开。
