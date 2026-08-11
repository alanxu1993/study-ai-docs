# Codex 示例配置教程

前面几章讲了概念和原理，这一章来点实在的。学 Codex 配置最有效的路径，不是从头看文档，而是**拿一份能跑的完整示例，照着改、删、合并**。本章给你四类可直接复制的资产：最小可用配置、完整配置、hooks 合集、AGENTS.md 合集，外加一个完整 Skill 和社区参考项目。复制到你的机器上，替换占位符，就能跑起来。

## 一、最小可用配置：从零到能跑

所有定制的前提，是有一个能启动的基线。最小配置只需要两件事：**模型**和**授权**。

```toml
# ~/.codex/config.toml —— 最小可用配置
[auth]
# 二选一：
# 方式一：codex login 用 ChatGPT 账号登录（推荐，无需手动填 key）
# 方式二：填 API Key
# api_key = "sk-你的key"

[model]
name = "gpt-5-codex"   # 模型名，具体可用模型以官方文档为准
```

::: tip 提示
安装用 `npm install -g @openai/codex`（当前稳定版可用 `@openai/codex@0.146.1` 锁定），登录用 `codex login`。连模型都没配，先跑通 `codex exec "输出 hello world"` 再谈定制。
:::

这个最小配置能跑，但还没任何项目上下文。往下叠加，才是定制开始。

## 二、完整配置示例：一个能落地的 config.toml

下面是一个覆盖主要配置节的完整示例，配好后**建议逐节注释掉自己不需要的部分**，避免玄学问题。

![配置文件结构总览](/images/codex/examples/01-config-overview.png)

```toml
# .codex/config.toml —— 完整配置示例（项目级，随仓库分发）
# 配置查找顺序：~/.codex/config.toml（全局）→ 项目内 .codex/config.toml
# 更靠近项目的配置优先级更高。

[auth]
api_key = "sk-..."          # 或用 codex login，此处为占位符需替换

[model]
name = "gpt-5-codex"        # 主模型，具体以官方文档为准
temperature = 0.2           # 代码任务建议低温度，结果更稳定
max_tokens = 16000

[features]
codex_hooks = true          # hooks 特性开关（v0.124 起稳定）
collaboration_modes = true  # Plan 模式等协作模式
request_rule = true         # 智能审批
tool_search = true          # 工具搜索
# image_generation = true   # 按需开启，图像生成

[agents]
max_threads = 6             # 子代理并行线程数（默认 6）
max_depth = 1               # 子代理嵌套深度（默认 1）
job_max_runtime_seconds = 600  # 单个子任务最大运行时长

[profiles.fast]
approval_policy = "acceptEdits"    # 快速模式：编辑类操作直接通过
default_tools_approval_mode = "approve"

[profiles.strict]
approval_policy = "untrusted"      # 严格模式：高权限操作需审批
sandbox_mode = "default"           # 默认沙箱隔离

[mcp_servers.local_db]       # 注意 snake_case：mcp_servers，不是 mcpServers
command = "npx"
args = ["-y", "@your-org/mcp-db-server"]  # 替换为真实 MCP 服务器
# 也可用 url 配置 remote MCP：
# [mcp_servers.remote_api]
# url = "https://mcp.example.com/sse"

[[skills.config]]            # 技能开关，enabled = false 即禁用
path = "~/.codex/skills/code-review/SKILL.md"
enabled = true

[[skills.config]]
path = ".codex/skills/add-api-field/SKILL.md"
enabled = false              # 示例：暂时禁用

[sandbox]
# Linux 默认 Landlock/seccomp，WSL2 支持 bwrap；Windows 沙箱为实验性
mode = "default"
```

::: warning 注意
`[mcp_servers.<id>]` 是 **snake_case**，这是社区最常见的拼写踩坑点；写错整个 MCP 静默失效。另外 `permissionDecision: "ask"` 在 hooks 输出中**不受支持**，别照 Claude Code 的习惯写。
:::

### 关键字段速查

| 配置节 | 关键字段 | 作用 |
| --- | --- | --- |
| `[auth]` | `api_key` / `codex login` | 授权方式 |
| `[model]` | `name`、`temperature`、`max_tokens` | 模型与生成参数 |
| `[features]` | `codex_hooks`、`collaboration_modes` 等 | 特性开关 |
| `[agents]` | `max_threads`、`max_depth`、`job_max_runtime_seconds` | 子代理编排 |
| `[profiles.<name>]` | `approval_policy`、`sandbox_mode` 等 | 命名预设 |
| `[mcp_servers.<id>]` | `command` / `url` | 外部工具接入 |
| `[[skills.config]]` | `path`、`enabled` | 技能开关 |
| `[sandbox]` | `mode` | 沙箱策略 |

### 2.4 配置优先级：全局与项目如何合并

Codex 的配置不是"非此即彼"，而是**分层合并**：全局 `~/.codex/config.toml` 提供默认值，项目 `.codex/config.toml` 覆盖它。合并规则可以这样理解：

| 位置 | 作用范围 | 优先级 |
| --- | --- | --- |
| `~/.codex/config.toml` | 所有项目（个人默认） | 低 |
| 仓库根 `.codex/config.toml` | 当前项目（团队默认） | 中 |
| 当前目录附近的 `.codex/` | 子模块/子目录 | 高 |

典型用法：个人默认用 `gpt-5-codex` + 宽松审批；某个项目在仓库里覆盖成 `gpt-5` + 严格审批；某个特殊子目录再收紧沙箱。三层叠加，互不冲突。排查"配置不生效"时，先确认是不是被更近一层的配置覆盖了。

## 三、hooks.json 示例合集

hooks 的三个高频用途：**安全拦截、格式化、日志**。以下示例 schema 细节以官方文档为准（stdin 传 JSON、退出码 0/2/非零各有语义）。

### 3.1 安全拦截：在 PreToolUse 拒绝危险命令

```json
// .codex/hooks.json —— 拦截对生产数据的危险操作（示意）
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "command": "node .codex/hooks/guard-shell.js"
    }
  ]
}
```

guard 脚本从 stdin 读取 `tool_name`、`tool_input`，命中危险模式时输出：

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "deny",
    "reason": "禁止在生产环境执行 DROP TABLE"
  }
}
```

::: tip 提示
hooks 输出是**严格 schema 校验**的，多余字段会导致整个输出无效。`permissionDecision: "deny"` 必须带 `reason`；顶层 `decision: "block"` 可阻断整个事件。退出码 2 表示特殊事件行为（PreToolUse 阻断、Stop/SubagentStop 继续）。
:::

### 3.2 格式化：在 Stop 时收尾，避免 CI 最后 10% 失败

```json
// .codex/hooks.json —— 主代理完成时自动格式化（示意）
{
  "Stop": [
    {
      "matcher": "Stop",
      "command": "npx prettier --write . && pnpm lint --fix"
    }
  ]
}
```

把格式、lint 这类**确定性检查**从主代理手里拿走，既省 token，又根治"缩进、换行导致 CI 挂掉"的最后一公里问题。

### 3.3 日志：在 SubagentStop 记录子任务结果

```json
// .codex/hooks.json —— 记录子代理完成情况（示意）
{
  "SubagentStop": [
    {
      "matcher": "SubagentStop",
      "command": "node .codex/hooks/log-subagent.js"
    }
  ]
}
```

子代理完成时，stdin 会带 `session_id`、`transcript_path`、`tool_name` 等 snake_case 字段，适合把执行轨迹落盘做审计或复盘。

::: warning 注意
PreToolUse / PostToolUse 只拦截 Bash、apply_patch/Edit/Write、MCP `mcp__*` 工具，**不是所有 shell 路径**。别指望它拦截纯 shell 内建操作。
:::

### 3.4 不想建文件？hooks 也能内联进 config.toml

不想额外维护 `hooks.json`，可以把 hooks 内联进 config.toml，用 `[[hooks.<事件名>]]` 块：

```toml
# .codex/config.toml 内联 hooks（需开启 codex_hooks 特性）
[[hooks.SessionStart]]
matcher = "startup"
command = "node .codex/hooks/welcome.js"
timeout_seconds = 5
```

两种方式等效，选哪个取决于你的组织习惯：**独立 `hooks.json` 便于单独 review 和复用**，内联在 config.toml 里则所有配置一处集中。混用不冲突，但建议一个项目固定一种，避免两处维护。

## 四、AGENTS.md 示例合集

### 4.1 单项目：一个仓库，一套规矩

```markdown
<!-- AGENTS.md —— 单项目版 -->
# 项目指令

## 结构
- `app/` React 前端，`server/` Node 后端，`shared/` 公共类型
- 新代码默认放 `app/` 或 `server/` 对应目录，别新增顶层目录

## 命令
- `npm run dev` 本地开发；`npm test` 跑全量测试
- 提交前必须过：`npm run typecheck && npm run lint && npm test`

## 约定
- 一律 TypeScript，业务类型放 `shared/`
- 错误处理：异步必须 try/catch，勿吞错误
- PR 描述按模板填，附改动影响范围

## 完成定义
- 通过全部检查、覆盖新增逻辑的单测、无遗留调试代码
```

### 4.2 多模块：嵌套级联，各管各的

大型仓库把规则分散到子目录，越靠近工作目录优先级越高：

```text
monorepo/
├── AGENTS.md              # 全局规矩：命令、提交规范、完成定义
├── server/
│   └── AGENTS.md          # 后端专属：数据库迁移规范、API 设计约定
└── docs/
    └── AGENTS.md          # 文档专属：写作风格、章节组织规范
```

```markdown
<!-- server/AGENTS.md —— 子目录级指令（作用域：仅 server/） -->
# 后端模块指令

## 数据库
- 结构变更一律走 migration，禁止手改表
- 新增字段必须带索引评估

## API
- 路由用 `/api/v1/...` 前缀
- 响应统一 `{ data, error }` 包裹
```

::: tip 提示
嵌套级联的精髓是"**就近覆盖**"：`docs/` 目录下工作时，加载的是根 AGENTS.md + `docs/AGENTS.md` 的合集，后者优先级更高。多模块仓库用这个机制，能让 Codex 在不同目录自动切换不同心智模型。
:::

## 五、Skills 示例：一个实用 Skill 的完整 SKILL.md

Skill 是"可复用的工作流"，`SKILL.md` 里的 `description` 是模型触发它的依据（写触发条件，不是写摘要）。下面是一个"代码审查"Skill：

```markdown
---
name: code-review
description: >
  当用户要求"审查代码""review 这个 PR"或提到 code review 时使用。
  执行一次基于变更的完整代码审查，输出结构化结论。
license: MIT
---

# 代码审查

## 适用场景
- 审查本地未提交的改动
- 审查某个 PR / 分支的 diff

## 步骤
1. 用 `git diff` 拿到改动范围，聚焦本次变更，勿审查无关代码
2. 逐文件按以下维度检查：
   - 逻辑正确性：边界条件、空值、并发
   - 可读性：命名、复杂度、死代码
   - 测试覆盖：新增逻辑是否有单测
   - 安全：注入、敏感信息泄露
3. 输出结论，按严重程度分组：
   - `严重`：会导致 bug 或安全问题的项
   - `建议`：可改进但非阻塞的项
   - `风格`：偏好类，不强制

## 输出格式
每项给三行：位置（文件:行）、问题、建议改法。
```

```
# 目录结构
code-review/
├── SKILL.md          # 上述文件（必需）
├── scripts/
│   └── get-diff.sh   # 可选：辅助脚本
└── examples/
    └── review.md     # 可选：输出示例
```

::: tip 提示
Skill 放 `~/.codex/skills/`（个人）、`.codex/skills/`（项目）或 `.agents/skills/`。`name` 必须小写连字符且与目录名一致。想在团队统一分发，把它打进 Plugin 再统一安装。
:::

## 六、参考项目：codex-starter-kit 目录结构解析

社区里 VKirill 的 **codex-starter-kit** 是一份公认的完整基线参考，集成了自定义 agents、skills、AGENTS.md、hooks、MCP docs servers、Superpowers/GitHub plugin 配置，并提供一键基线安装。它展示了一个"重度定制"的 Codex 项目长什么样：

![starter-kit 目录结构](/images/codex/examples/02-starter-kit.png)

```text
codex-starter-kit/
├── AGENTS.md               # 顶层项目指令
├── .codex/
│   ├── config.toml         # 完整配置：模型、特性、agents、profiles
│   ├── hooks.json          # 项目级 hooks
│   └── skills/             # 内置技能集
├── agents/                 # 自定义 agent 定义
├── plugins/                # 插件配置（如 Superpowers、GitHub）
└── README.md               # 安装与使用说明
```

::: warning 提示
参考项目的价值在**借鉴结构**，不在原样照搬。克隆下来后逐文件理解用途，删掉与你项目无关的部分，只保留对你工程约定有意义的骨架——完整配置清单以官方文档为准。
:::

### 6.1 starter-kit 各部件对应当前示例

把 starter-kit 的每个目录和本章已有的示例对应起来，你就知道它为什么这么组织：

| starter-kit 部件 | 说明 | 对应本章示例 |
| --- | --- | --- |
| `AGENTS.md` | 顶层项目指令 | 第四节 AGENTS.md 示例 |
| `.codex/config.toml` | 模型/特性/agents/profiles 配置 | 第二节完整配置示例 |
| `.codex/hooks.json` | 生命周期钩子 | 第三节 hooks 合集 |
| `.codex/skills/` | 内置技能集 | 第五节 Skill 示例 |
| `agents/` | 自定义 agent 定义 | 定制化章节的委派层 |
| `plugins/` | Superpowers、GitHub 插件配置 | 团队统一安装的分发单元 |
| 一键安装脚本 | 克隆后一条命令装好基线 | 适合团队新成员 onboarding |

读 starter-kit 的顺序建议：**先看 config.toml 和 AGENTS.md，再翻 hooks 和 skills**——前两个决定"Codex 是什么性格"，后两个决定"它会做什么动作"。

## 七、最佳实践与常见问题

### 最佳实践

1. **从最小配置起步**：先跑通，再逐节叠加，每加一节验证一次，避免"一次配错不知道错在哪"。
2. **示例是起点，不是终点**：config.toml / hooks / AGENTS.md 都要按项目反复迭代，把踩坑教训沉淀进去。
3. **占位符显式标记**：所有示例里的 `sk-...`、`@your-org/...` 都是占位符，复制后必须替换，别忘。
4. **测试 Skill 的触发**：改完 `description` 后，用一个真实任务验证它能否被自动选中。

### 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| 配置不生效 | 检查文件位置（全局 vs 项目）、`codex features list` 看特性是否开启、重启会话 |
| MCP 没接上 | 检查 `mcp_servers`（snake_case）拼写、`codex` 命令是否正确启动服务器、看 MCP 日志 |
| Skill 不触发 | 检查 `name` 与目录名一致、`description` 是否含触发关键词、`[[skills.config]]` 是否禁用 |
| hooks 静默失败 | 先跑一个最小 hook 验证 schema；检查退出码（0/2/非零）与 stdout JSON 合法性 |
| 授权失效 | `codex logout` 后重新 `codex login`，或核对 API Key 是否过期 |

## 总结

这一章给你的是"拿来即用"的起点：**最小配置让你能跑，完整配置让你看清全貌，hooks/AGENTS.md/Skills 合集让你各取所需，starter-kit 给你参考坐标系**。所有示例都留了显式占位符，替换后即可落地。记住：示例的价值是缩短你的启动时间，而定制化是否成功，最终取决于你能不能把这套骨架喂进自己项目的真实血肉。最后一章，我们来总结把这些都用好的顶层方法论。
