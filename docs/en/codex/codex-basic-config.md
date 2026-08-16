# Codex 基础配置教程

Codex 是 OpenAI 推出的终端原生 AI 编程 Agent：装上它，在命令行里输入一句"帮我实现这个登录接口"，它就能自己读代码、改文件、跑测试。但第一次上手时，绝大多数人都会卡在配置上——装完包不知道要不要登录、模型选哪个、为什么每次执行工具都要弹审批、改配置文件后到底有没有生效。这些困惑的核心，是没有理解 Codex 的**配置分层**与**授权体系**。本章带你一次性走通从安装到可用的完整流程，让"装好就能干活"。

## 一、安装与登录

### 1.1 安装 Codex CLI

Codex CLI 是开源终端工具，包名 `@openai/codex`，用 Rust 实现，通过 npm 全局安装：

```bash
# 安装最新版
npm install -g @openai/codex

# 指定版本安装（2026 年中最新约 v0.146，此处以官方发布为准）
npm install -g @openai/codex@0.146.1
```

::: tip 为什么用 npm 装而不是直接下载二进制？
Codex CLI 以 npm 包形式发布，安装即获得版本管理、升级、shell 补全等完整配套。后续可用 `npm install -g @openai/codex@latest` 平滑升级。
:::

安装完成后验证：

```bash
codex --version   # 打印版本号即安装成功
codex --help      # 查看全部可用命令
```

### 1.2 登录与授权

Codex 提供两条授权路径，二选一即可：

| 方式 | 适用场景 | 命令 / 配置 |
| --- | --- | --- |
| ChatGPT 账号登录 | 个人开发者，走订阅额度 | `codex login` |
| API Key | 按量付费、团队统一管理 | 写入 `~/.codex/config.toml` 的 `[auth]` 节 |

**方式一：ChatGPT 账号登录（推荐个人使用）**

```bash
codex login
```

命令会打开浏览器引导你登录 ChatGPT 账号并授权 Codex 使用额度。登录后凭证保存在本机，无需每次输入。

**方式二：API Key 配置**

```bash
codex logout  # 先退出账号登录，避免两种方式冲突
```

然后在配置文件（见下一节）中写入：

```toml
[auth]
api_key = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

::: warning API Key 安全
API Key 等同你的付费凭证，请勿提交到 Git、写入项目级 `config.toml` 或分享给任何人。优先用 `codex login`，需要 API Key 时也请只写在全局 `~/.codex/config.toml`。
:::

### 1.3 验证配置是否生效

```bash
codex "你好，请确认你的身份"   # 进入交互会话，能正常回复即配置成功
```

看到 Codex 正常响应后，按 `Ctrl+C` 退出，基础安装完成。

## 二、config.toml 基础配置

安装只是第一步，Codex 的行为完全由 **config.toml** 控制。这是整个配置体系的地基。

![Codex 三层配置结构](/images/codex/basic-config/01-config-layers.png)

### 2.1 配置文件位置：全局与项目级

Codex 配置分两层，理解这层关系能解决"我改了怎么不生效"的大半问题：

| 层级 | 路径 | 作用范围 | 是否建议入库 |
| --- | --- | --- | --- |
| 全局配置 | `~/.codex/config.toml` | 你所有的项目 | 否（含个人授权信息） |
| 项目级配置 | 仓库内 `.codex/config.toml` | 仅当前项目 | 是（可共享给团队） |

两层配置会自动合并：项目级覆盖全局同名配置项。Codex 会从当前工作目录向上查找 `.codex/config.toml`，因此也支持把配置文件放在 git 仓库内的任意位置，按仓库根目录解析。

::: tip 类比理解
全局配置像"你的个人默认设置"，项目配置像"这个项目的班规"——班规优先，但没规定的都按你的默认来。
:::

### 2.2 [auth] 认证节

控制 Codex 用什么凭证访问模型：

```toml
[auth]
api_key = "sk-..."   # 使用 API Key 时填写；已 codex login 可留空
```

用 `codex login` 登录过的，这一节通常无需手动配置；使用 API Key 的团队场景才需要显式写入。

### 2.3 [model] 模型节

指定默认模型与生成参数：

```toml
[model]
name = "gpt-5-codex"       # 模型名，以官方文档为准
temperature = 0.0          # 采样温度，编码任务建议低值
max_tokens = 16384         # 单次回复最大输出 token 数
```

### 2.4 [features] 特性节

开关 Codex 的可选特性（详见高级教程）：

```toml
[features]
codex_hooks = true          # 启用 Hooks 生命周期钩子
collaboration_modes = true  # 启用 Plan 协作模式
```

## 三、模型与授权

### 3.1 模型选择

`[model].name` 决定 Codex 背后的大脑。常见选择（以官方文档为准）：

| 模型 | 定位 | 建议场景 |
| --- | --- | --- |
| `gpt-5-codex` | 为编码 Agent 调优的模型 | 日常编码主力 |
| `gpt-5` | 通用旗舰模型 | 通用问答、复杂推理 |

::: tip 模型写哪一层？
模型名写全局配置则所有项目统一，写项目级配置则单个项目指定。需要"项目 A 用轻量模型省额度、项目 B 用旗舰模型冲质量"时，在各自项目级 config.toml 中设置即可。
:::

### 3.2 temperature 与 max_tokens

- **temperature**：控制随机性。编码任务建议 `0.0`～`0.2`，输出更稳定、更符合规范；创意写作才需要较高值。
- **max_tokens**：单次回复的输出上限。大文件重构、长文档生成时不够用会导致截断，可按需调大；设得过大在普通对话中浪费额度。

### 3.3 approval_policy 审批模式

Codex 执行工具（改文件、跑命令）时是否征求你同意，由审批模式决定：

```toml
# 全局审批策略
approval_policy = "on_request"   # 仅高风险操作时询问

# 默认工具审批
default_tools_approval_mode = "approve"   # 对默认工具自动批准
```

| 策略 | 行为 | 适合 |
| --- | --- | --- |
| `on_request` | 只在工具主动请求时询问 | 个人日常开发 |
| `on_failure` | 失败时询问 | 谨慎的场景 |
| `untrusted` | 默认拒绝，仅信任的批准 | 处理不可信代码 |
| `never` | 从不询问，全部自动执行 | 受控 CI 管线 |

会话内用 `Shift+Tab` 可循环切换审批选项，临时调整无需改配置。

::: warning 审批模式不是安全边界
`approval_policy` 解决的是"操作要不要你确认"的体验问题，不是沙箱隔离。真正的进程隔离靠 `sandbox_mode`（见高级教程）。对待陌生仓库，别盲目设 `never`。
:::

## 四、CLI 常用命令与斜杠命令

![Codex CLI 常用命令](/images/codex/basic-config/02-cli-commands.png)

### 4.1 常用 CLI 命令

| 命令 | 作用 |
| --- | --- |
| `codex` | 进入交互式会话 |
| `codex exec "<prompt>"` | 非交互执行，适合脚本与 CI 管线 |
| `codex login` / `codex logout` | 登录 / 退出账号 |
| `codex features` | 特性开关管理（见高级教程） |
| `codex config` | 配置管理 |
| `codex install` | 安装 shell 补全等配套 |
| `codex --version` | 查看版本 |

**`codex exec` 是自动化的灵魂**：不需要终端交互，一条命令跑完返回结果，非常适合写进 Git pre-commit 钩子或 CI 做代码审查、测试修复：

```bash
codex exec "运行测试，修复失败的用例"
```

### 4.2 斜杠命令

交互会话内部使用斜杠命令（以 `/` 开头）：

| 命令 | 作用 |
| --- | --- |
| `/fork` | 复制当前会话为新的分支会话 |
| `/resume` | 恢复之前的会话 |
| `/memories` | 查看记忆 |
| `/init` | 生成 AGENTS.md 脚手架 |
| `/skills` | 列出可用技能 |
| `/help` | 帮助 |

::: tip /init 值得一用
新项目首次进入时执行 `/init`，Codex 会扫描仓库结构并生成 AGENTS.md 脚手架，让后续会话自动理解项目约定，少写大量重复 prompt。
:::

## 五、最佳实践与常见问题排查

### 5.1 最佳实践

1. **个人凭证只放全局**：`api_key`、登录态放在 `~/.codex/config.toml`，项目级 config.toml 只放团队共享的行为配置。
2. **模型与审批分开管理**：模型名按项目需求覆盖，审批模式按信任程度设置，别混为一谈。
3. **把验证过的 prompt 沉淀下来**：一旦某段 prompt 屡试不爽，写进 AGENTS.md（用 `/init` 起步），而不是每次重新输入。
4. **先跑通最小配置再叠加**：刚安装时只配 `[auth]` + `[model]`，验证能干活后再上 Hooks、MCP 等高级能力，避免一次引入多个变量难排查。

### 5.2 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| `codex` 命令找不到 | 确认安装成功：`npm ls -g @openai/codex`；检查 npm 全局 bin 是否在 PATH |
| 提示未登录 / 认证失败 | 重跑 `codex login`；若用 API Key，检查 `[auth].api_key` 是否写入全局配置且格式正确 |
| 改了 config.toml 不生效 | 确认改的是生效层级（项目级覆盖全局）；检查文件是否在 `.codex/config.toml` 或仓库根被识别；重启会话 |
| 模型响应异常 / 频繁截断 | 检查 `[model].name` 是否有效（以官方文档为准）；调大 `max_tokens` |
| 工具操作弹窗太频繁 | 调整 `approval_policy` 与 `default_tools_approval_mode`，或在会话内 `Shift+Tab` 切换 |

## 六、总结

本章建立了 Codex 的配置地基：理解全局与项目级双层 config.toml 的分工，用 `codex login` 或 `[auth].api_key` 完成授权，按场景选择模型与审批策略，再掌握 `codex exec` 与斜杠命令这套日常操作。到这里，你已经能让 Codex"装好即用"。下一章将进入特性开关、Profiles 预设与沙箱安全等进阶配置，把 Codex 从"能用"推向"好用、可控、可团队复制"。
