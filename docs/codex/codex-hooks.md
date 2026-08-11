# Codex Hooks 使用教程

AI 编程代理在带来高效的同时，也带来三类典型问题：它可能执行 `rm -rf /` 之类的高危命令；它生成的代码格式五花八门，最后一步才暴露 CI 失败；它的每次会话像"黑箱"，你很难知道它到底做了什么。Hooks 就是 Codex 给出的"自动管家"方案——在会话的生命周期关键节点上，自动执行你预设的逻辑，实现安全拦截、规范统一、过程留痕。

本章覆盖 Codex Hooks 的核心概念、配置位置与格式、核心事件详解、输入输出契约、四个实战案例，以及一组避坑要点和最佳实践。所有配置块均可直接复制使用。

## 一、Hooks 核心概念

### 1.1 什么是 Hooks（一句话懂）

Hooks 是 Codex 的**生命周期事件回调机制**：它监听会话与工具调用的关键事件，在事件发生前或发生后自动执行你配置的命令（command）脚本，并用退出码或 stdout 的 JSON 控制 Codex 的后续行为。

类比理解：就像 Git 的 pre-commit 钩子在提交前自动跑 lint，或者物业管家在"门口有人进来"这个节点替你检查包裹。Codex Hooks 干的也是同一件事——在"工具被调用前""会话结束时"这些节点上插一道自己控制的逻辑。

![Hooks 在生命周期关键节点自动触发](/images/codex/hooks/01-hook-lifecycle.png)

### 1.2 启用方式：codex_hooks 特性开关

Hooks 通过特性开关启用，**自 v0.124 起为稳定特性**。命令方式：

```bash
codex features enable codex_hooks
codex features list          # 查看当前特性状态
```

也可以直接写入全局配置 `~/.codex/config.toml`：

```toml
[features]
codex_hooks = true
```

::: tip 版本提示
`codex_hooks` 是 2026 年已稳定的特性（2026 年中最新 CLI 约 v0.146）。若你的版本较旧，先 `npm install -g @openai/codex` 升级。
:::

### 1.3 Hooks 与其他功能的分工

- **与 Skills 的区别**：Skills 是"增强能力"——给模型一套可复用的工作流指令；Hooks 是"管控流程"——在固定节点执行确定性逻辑（如拦截命令），两者互补。
- **与审批模式的区别**：`approval_policy` / `default_tools_approval_mode` 是 Codex 内置的静态审批策略；Hooks 可以动态检查命令内容——例如"允许用 Bash，但禁止 `rm -rf /`"这类规则，静态审批做不到。
- **与 MCP 的关系**：Hooks 的 PreToolUse/PostToolUse 也能拦截 MCP 暴露的工具（`mcp__*`），两者可以联动。

## 二、配置位置与格式

### 2.1 两个配置位置

| 位置 | 说明 | 适用场景 |
| --- | --- | --- |
| `.codex/hooks.json` | 项目级独立文件，随仓库提交 | 团队统一规则（推荐，可读性最好） |
| `config.toml` 内联 `[[hooks.<Event>]]` 块 | 全局或项目配置内嵌 | 个人全局规则，或想集中管理配置时 |

`.codex/hooks.json` 是推荐的独立文件：结构清晰、便于评审、可独立管理，且无需改动其他配置。

### 2.2 完整示例（可直接复制）

下面是一个覆盖四个核心事件的完整 `.codex/hooks.json`：会话启动注入项目上下文、拦截高危命令、编辑后自动格式化、会话结束写日志。JSON 里的 command 脚本通过读取 stdin 拿到事件数据（详见第四章），用 `jq` 解析：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"{\\\"hookSpecificOutput\\\":{\\\"additionalContext\\\":\\\"项目技术栈：Python 3.12 + FastAPI；测试命令：pytest。\\\"}}\"",
            "timeout": 10
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat)\nCMD=$(echo \"$INPUT\" | jq -r '.tool_input.command // empty')\nif echo \"$CMD\" | grep -qiE 'rm -rf /|git push --force|DROP TABLE|git reset --hard'; then\n  echo \"{\\\"permissionDecision\\\":\\\"deny\\\",\\\"reason\\\":\\\"高危命令已被 Hooks 拦截\\\"}\"\n  exit 0\nfi\nif echo \"$CMD\" | grep -q 'rm -rf dist'; then\n  echo \"{\\\"updatedInput\\\":{\\\"command\\\":\\\"rm -rf dist.bak && mv dist dist.bak\\\"}}\"\n  exit 0\nfi\nexit 0",
            "timeout": 15
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat)\nFILE=$(echo \"$INPUT\" | jq -r '.tool_input.file_path // empty')\nif [ -n \"$FILE\" ] && echo \"$FILE\" | grep -qE '\\.(py|js|ts)$'; then\n  npx prettier --write \"$FILE\" >/dev/null 2>&1 || true\n  echo \"已格式化 $FILE\"\nfi\nexit 0",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat)\nSESSION=$(echo \"$INPUT\" | jq -r '.session_id // \"unknown\"')\nLOG_DIR=/tmp/codex-logs\nmkdir -p \"$LOG_DIR\"\necho \"[$(date '+%Y-%m-%d %H:%M:%S')] session $SESSION 结束\" >> \"$LOG_DIR/sessions.log\"\nexit 0",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

![hooks.json 配置结构](/images/codex/hooks/03-config-structure.png)

::: tip 依赖提示
文中的脚本示例依赖 `jq` 解析 stdin 的 JSON（Codex 的 Linux/沙箱环境通常已内置；本地调试时可用 `apt install jq` / `brew install jq` 安装）。没有 `jq` 时，也可改用 `grep`/`sed` 提取字段，但代码可读性会下降。
:::

### 2.3 结构解析

每个事件名下是一组配置块，每块由 `matcher`（匹配条件，可选）+ `hooks`（要执行的脚本列表）组成：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `matcher` | string | 匹配条件。工具类事件填工具名（如 `Bash`、`Edit\|Write`、`mcp__*`）；会话类事件填 `startup/resume/clear/compact`；全局事件可省略 |
| `type` | string | 执行类型，当前为 `"command"`，即 Shell 脚本 |
| `command` | string | 要执行的 Shell 命令，通过 stdin 读取 JSON 输入，通过 stdout 输出 JSON 结果 |
| `timeout` | number | 超时秒数，防止脚本卡死阻塞会话 |

### 2.4 config.toml 内联写法（备选）

同一套结构也可以用 TOML 数组块内联到 `~/.codex/config.toml` 或项目 `.codex/config.toml`：

```toml
[[hooks.PreToolUse]]
matcher = "Bash"

[[hooks.PreToolUse.hooks]]
type = "command"
command = "INPUT=$(cat)\nCMD=$(echo \"$INPUT\" | jq -r '.tool_input.command // empty')\nif echo \"$CMD\" | grep -qiE 'rm -rf /'; then echo '{\"permissionDecision\":\"deny\",\"reason\":\"拦截\"}'; exit 0; fi\nexit 0"
timeout = 15
```

两种方式等价，按项目习惯选择即可；同一项目建议只选一种，避免维护两处。

::: tip 配置生效
修改 hooks.json 后，新会话即生效。Hooks 脚本以项目 cwd 为工作目录运行，脚本里相对路径相对于项目根目录。
:::

## 三、核心事件详解

Hooks 的可用事件如下：

| 事件 | 触发时机 | matcher 取值 | 典型用途 |
| --- | --- | --- | --- |
| `SessionStart` | 会话创建 / 恢复 / 清空 / 紧凑化 | `startup`、`resume`、`clear`、`compact` | 注入项目上下文、环境初始化 |
| `PreToolUse` | 工具调用之前 | 工具名：`Bash`、`apply_patch`、`Edit`、`Write`、`mcp__*` | 拦截高危命令、重写工具入参 |
| `PostToolUse` | 工具执行之后 | 同上 | 代码格式化、结果校验、记录日志 |
| `SubagentStop` | 子代理完成 | 无 | 汇总子代理结果 |
| `Stop` | 主代理完成 | 无 | 会话总结、完整性检查、写日志 |

![Hooks 拦截高危命令](/images/codex/hooks/02-block-dangerous.png)

### 3.1 SessionStart：会话生命周期入口

`SessionStart` 的 matcher 区分四种会话场景：`startup`（新建）、`resume`（恢复）、`clear`（清空上下文）、`compact`（紧凑化）。示例见 2.2 节——启动时把项目技术栈、测试命令注入 `additionalContext`，让模型一开场就知道关键约定。

### 3.2 PreToolUse / PostToolUse：工具调用前后

**注意拦截范围**：PreToolUse / PostToolUse 只拦截并覆盖 `Bash`、`apply_patch` / `Edit` / `Write`、以及 MCP 暴露的 `mcp__*` 工具，并非所有 shell 路径。配置规则时认准这些工具名。

- **PreToolUse**：调用前触发，可用于拦截或改写工具输入（如把危险的 `rm -rf dist` 改写为先备份再删除）；
- **PostToolUse**：调用后触发，通常用来做副作用——自动格式化、记录日志、校验结果。

### 3.3 SubagentStop 与 Stop

`SubagentStop` 在子代理完成任务时触发（配合 `[agents]` 多代理编排），可用于汇总子代理产物；`Stop` 在主代理完成时触发，是最常见的"会话收尾"事件，适合做完整性检查与会话日志。两者都是全局事件，无需 matcher。

## 四、输入输出契约

Hooks 脚本与 Codex 之间通过 **stdin 传 JSON、stdout 出 JSON、退出码定行为** 三件事通信。这是最容易踩坑、也最值得精读的一节。

### 4.1 输入：stdin 的 snake_case JSON

每次事件触发，Codex 都会把事件上下文以 JSON 形式写入脚本的 stdin，字段统一 snake_case：

| 字段 | 出现范围 | 说明 |
| --- | --- | --- |
| `session_id` | 所有事件 | 会话 ID |
| `transcript_path` | 所有事件 | 会话记录文件路径 |
| `cwd` | 所有事件 | 当前工作目录 |
| `hook_event_name` | 所有事件 | 触发的事件名 |
| `model` | 所有事件 | 当前模型 |
| `permission_mode` | 所有事件 | 权限模式 |
| `tool_name` | 工具事件 | 触发的工具名 |
| `tool_input` | 工具事件 | 工具入参（如 Bash 的 `command`、Edit/Write 的 `file_path`） |
| `tool_use_id` | 工具事件 | 工具调用 ID |
| `tool_response` | PostToolUse | 工具执行结果 |

一个 PreToolUse（Bash）收到的输入示意：

```json
{
  "session_id": "a1b2c3d4",
  "transcript_path": "/home/me/.codex/sessions/a1b2c3d4.jsonl",
  "cwd": "/home/me/projects/my-app",
  "hook_event_name": "PreToolUse",
  "model": "gpt-5-codex",
  "permission_mode": "default",
  "tool_name": "Bash",
  "tool_use_id": "toolu_01h8...",
  "tool_input": {
    "command": "rm -rf /tmp/cache"
  }
}
```

::: tip 精确字段以官方文档为准
`tool_input` 内部的具体字段名（如 Bash 的 `command`、Edit/Write 的 `file_path`）以官方文档为准；示例中用了 `// empty` 兜底，字段缺失时也不会让 `jq` 报错中断脚本。
:::

### 4.2 输出：stdout 的 JSON 结果

脚本可以通过 stdout 输出 JSON 来影响 Codex 行为，核心字段：

| 字段 | 作用 |
| --- | --- |
| `hookSpecificOutput.additionalContext` | 注入额外上下文给模型（不限于 UI） |
| `permissionDecision: "deny"` | 拒绝工具调用，需同时给出 `reason` |
| `updatedInput` | 重写工具输入后再放行 |
| `decision: "block"` | 阻断后续处理 |
| `systemMessage` | 仅显示在 UI，不进入模型（见避坑） |

三个典型用法：

```json
{ "hookSpecificOutput": { "additionalContext": "项目使用 pytest，测试命令：pytest -q" } }
```

```json
{ "permissionDecision": "deny", "reason": "检测到高危命令 rm -rf /，已拦截" }
```

```json
{ "updatedInput": { "command": "rm -rf dist.bak && mv dist dist.bak" } }
```

### 4.3 退出码语义（避坑关键）

退出码决定 Hook 与 Codex 的行为衔接，语义与常见工具不同：

| 退出码 | 语义 |
| --- | --- |
| `0` | 成功。Codex 解析 stdout 的 JSON（若有）作为输出契约 |
| `2` | 特殊事件行为：PreToolUse 时表示阻断工具；Stop / SubagentStop 时表示继续（放行停止流程） |
| 其他非零 | 钩子失败，Codex 继续原流程处理 |

所以两条路都能"拦截"：用 stdout 输出 `permissionDecision: deny` 并 `exit 0`（可携带 reason，推荐），或 PreToolUse 里直接 `exit 2`（简洁，但无法附带结构化原因）。

## 五、实战案例

### 5.1 拦截高危命令（PreToolUse）

见 2.2 完整示例中的 `PreToolUse` 块：先 `cat` 读取 stdin，用 `jq` 取出 `tool_input.command`，命中高危清单（`rm -rf /`、`git push --force`、`DROP TABLE`、`git reset --hard`）就输出 deny JSON 并 `exit 0`；对特定命令 `rm -rf dist` 则用 `updatedInput` 改写为"先备份再删"。企业团队可在清单里追加删库、强制推送等模式，统一拦截。

### 5.2 代码自动格式化（PostToolUse）

见 2.2 完整示例中的 `PostToolUse` 块：编辑 `Edit` / `Write` 工具写完后，对 `.py` / `.js` / `.ts` 文件自动跑 `prettier`。这正好解决官方提到的"最后 10% 问题"——AI 生成完代码、你本地一跑 CI 才发现格式不达标。Hook 在源头把格式统一掉，CI 更稳。

### 5.3 会话日志（Stop / SubagentStop）

见 2.2 完整示例中的 `Stop` 块：会话结束时读取 `session_id`，把结束时间追加到 `/tmp/codex-logs/sessions.log`。企业可在此基础上扩展——记录每条工具调用的 `tool_name` 与时间戳，形成审计轨迹；多代理场景用 `SubagentStop` 分别记录每个子代理的产出。

### 5.4 SessionStart 加载环境

见 2.2 完整示例中的 `SessionStart` 块：`startup` 时把项目技术栈、测试命令写入 `additionalContext`，模型从第一轮就带着这些约定工作，不再需要你每次重复提醒。若需要更复杂的初始化（如拉取环境变量、检查依赖），在 `command` 里执行对应脚本即可——注意环境变量导出类操作以官方文档说明为准，注入信息优先走 `additionalContext`。

## 六、避坑要点

::: warning permissionDecision 不支持 "ask"
`permissionDecision: "ask"` 是不支持的取值。需要"放行但提示"时，用 `deny` + `reason`，或在 `additionalContext` 里说明情况，不要写 `ask`。
:::

::: warning schema 严格校验
Hook 输出的 JSON 受 schema 严格校验，**多余字段会导致整个输出无效**。输出前核对字段名，宁可少写不可乱写；不确定的字段以官方文档为准。
:::

::: warning systemMessage 不进模型
`systemMessage` 只显示在 UI 上，**不会进入模型上下文**。想让模型看到信息，必须用 `hookSpecificOutput.additionalContext`。
:::

::: warning 拦截范围有限
PreToolUse / PostToolUse 只拦截 `Bash`、`apply_patch`/`Edit`/`Write` 和 `mcp__*` 工具，并非所有 shell 路径。安全规则要覆盖全，仍需配合审批模式与沙箱。
:::

::: warning 命令内嵌 JSON 的引号转义
在 `hooks.json` 的 `command` 字符串里内嵌 JSON 输出，双引号必须转义为 `\"`。复制官方/社区示例时最容易在这一点上出错，改完先跑一次真实事件验证。
:::

## 七、最佳实践

- **优先使用 `.codex/hooks.json` 独立文件**：结构清晰、可评审、可随仓库共享，优于把规则埋在 config.toml 里；
- **脚本保持简短，复杂逻辑拆独立脚本**：把可复用的安全清单、格式化逻辑放进 `scripts/` 下的脚本，`command` 只负责调用，便于维护与测试；
- **先配安全，再配效率**：第一优先级是 PreToolUse 拦截高危命令，第二是 PostToolUse 格式化，最后再叠加日志与上下文注入；
- **给关键 Hook 留日志**：拦截与权限类 Hook 用 `echo ... >&2` 输出原因，出问题时能快速定位；
- **新增 Hook 先在本地验证**：手动触发一次真实事件，确认拦截、格式化的行为符合预期，再提交团队共享；
- **别把密钥写进输出**：`additionalContext` 与日志都会留下记录，敏感信息不要通过 Hook 输出；
- **和审批模式、沙箱配合使用**：Hooks 解决"内容级"动态判断，`approval_policy`、`default_tools_approval_mode`、sandbox 解决"权限级"管控，三层叠加才是完整防线。

## 八、总结

Hooks 是 Codex 的"自动管家"：在 `SessionStart`、`PreToolUse` / `PostToolUse`、`SubagentStop`、`Stop` 这些生命周期关键节点自动执行预设逻辑，并通过 stdin 输入、stdout JSON 输出、退出码三件事与 Codex 精确交互。启用只需一条 `codex features enable codex_hooks`（v0.124 起稳定），配置推荐放在 `.codex/hooks.json`。

最值得记住的落点：用 PreToolUse 拦截高危命令守住安全底线，用 PostToolUse 自动格式化解决 CI 的"最后 10%"问题，用 Stop 记录会话轨迹，用 SessionStart 注入项目上下文。避开 `permissionDecision: "ask"`、schema 严格校验、`systemMessage` 不进模型这几个坑，Hooks 就能从"会跑"变成"可靠"，让 AI 开发既高效又可控。
