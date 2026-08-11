# Codex MCP 全流程使用教程

> 来源：[OpenAI Codex 官方文档](https://developers.openai.com/codex) · [ChatGPT Learn](https://learn.chatgpt.com/docs)

开发者手边从来不缺好用的外部工具：数据库客户端、浏览器调试器、内部 API 面板、CI 状态页……缺的恰恰是让 AI 编程代理**触手可及的统一入口**。没有 MCP 之前，每一个工具都要为每一个 Agent 单独写一遍私有集成，生态互相割裂；有了 MCP 之后，一套接口通吃所有 Agent，工具插上即用。Codex 原生支持 MCP，本章带你从概念、配置到实战案例，走一遍接入外部工具生态的完整流程。

## 一、MCP 核心概念

### 1.1 什么是 MCP（一句话懂）

MCP（Model Context Protocol，模型上下文协议）是 Anthropic 提出的**开放标准协议**，作用是让 AI 应用（如 Codex）以统一的方式连接外部数据源与工具。类比理解：MCP 之于 AI Agent，就像 **USB-C 之于外设**——不再需要每台设备配一套专用充电线，一个标准接口，插上就能用。Codex 通过 MCP 可以读取数据库、驱动浏览器、调用内部 API，把"只会写代码"的 Agent 变成"什么都能做"的工作伙伴。

### 1.2 MCP 的四大核心原语

MCP 协议定义了四类核心对象，理解它们有助于定位你在配置什么：

| 原语 | 作用 | 在 Codex 中的体现 |
| --- | --- | --- |
| 服务器（Server） | 提供能力的独立进程或远程服务，按 id 注册 | `[mcp_servers.<id>]` 中的 `<id>` |
| 工具（Tool） | 可被模型调用的函数，带输入参数和返回结果 | 以 `mcp__<server>__<tool>` 形式暴露 |
| 资源（Resource） | 可读取的数据/文件，向模型提供上下文 | 由服务器声明，供模型按需读取 |
| 提示（Prompt） | 服务器预置的提示模板 | 可复用的对话/指令模板 |

对日常使用来说，**工具是主角**：你注册一个数据库 MCP，本质就是拿到一批"查询表结构""执行 SQL"的工具。资源和提示相对次要，具体支持程度以官方文档为准。

### 1.3 Codex 中 MCP 工具如何暴露

Codex 把来自不同服务器的工具统一命名为：

```
mcp__<server>__<tool>
```

例如你注册了 id 为 `postgres` 的服务器，它提供的 `query` 工具，在 Codex 中就叫 `mcp__postgres__query`。这种三层命名（`mcp__服务器__工具`）保证了**多服务器同名工具不会冲突**，也让你在审批、日志、Hooks 中能精确识别是哪个工具在动作。

### 1.4 与内置工具、直接执行命令的区别

接入外部能力并非只有 MCP 一条路，理解差异能帮你选对方案：

| 方式 | 特点 | 局限 |
| --- | --- | --- |
| Codex 内置工具（Bash、文件编辑等） | 开箱即用、行为受审批与沙箱约束 | 覆盖面固定，接不了专用外部系统 |
| 让 Agent 直接跑命令 | 灵活、无需额外安装 | 每次要手写对接逻辑，输出非结构化，易出错 |
| MCP 工具 | 结构化接入数据库、浏览器、内部 API | 需要先注册对应服务器并管理权限 |

一句话判断：**通用操作交给内置工具，一次性临时对接可以跑命令，需要稳定、结构化、可复用接入时选 MCP**。

![Codex 通过 MCP 连接外部工具](/images/codex/mcp/01-mcp-flow.png)

## 二、配置方法

### 2.1 全局配置：config.toml 的 `[mcp_servers.<id>]`

MCP 服务器注册在配置文件 `~/.codex/config.toml`（全局）或 `.codex/config.toml`（项目级）中，使用 **snake_case 的 `mcp_servers`** 节——注意，不是很多工具习惯的 camelCase 写法的 `mcpServers`，这是最容易踩的第一个坑。

```toml
# ~/.codex/config.toml
[mcp_servers.postgres]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost:5432/mydb"]
env = { PGHOST = "localhost" }
```

每个 `[mcp_servers.<id>]` 节定义一个服务器，`<id>` 是你自己起的、在会话中引用它的名字（对应上面 `mcp__postgres__query` 中的 `postgres`）。

### 2.2 工作区级配置：`.agents/mcp_config.json`

除了 config.toml，Codex 还支持在项目工作区放置 `.agents/mcp_config.json`，把 MCP 配置**跟仓库一起版本化**，团队成员克隆后无需各自手配。这个文件使用 JSON 格式：

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost:5432/mydb"]
    }
  }
}
```

::: tip 层级选择
- **个人偏好、与具体仓库无关**的工具 → 放 `~/.codex/config.toml` 全局配置；
- **跟随项目、团队共享**的工具 → 放项目级 `.codex/config.toml` 或 `.agents/mcp_config.json`，随仓库分发。
:::

### 2.3 两种服务器类型：`command` 与 `url`

MCP 服务器按运行方式分两类，配置的关键字不同：

| 类型 | 配置关键字 | 适用场景 | 优点 |
| --- | --- | --- | --- |
| 本地进程 | `command` + `args` | 跑在本地机器上的服务器（数据库客户端、文件系统等） | 数据不出本机、可调试 |
| 远程服务器 | `url` | 部署在远端、通过 HTTP/SSE 提供的 MCP 服务 | 免安装、多端共享 |

```toml
# 本地进程类型
[mcp_servers.filesystem]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/data"]

# 远程类型
[mcp_servers.internal-api]
url = "https://mcp.example.com/sse"
```

### 2.4 配置位置速查表

| 配置位置 | 作用域 | 典型用途 | 备注 |
| --- | --- | --- | --- |
| `~/.codex/config.toml` | 全局（所有会话） | 个人常备工具 | snake_case `mcp_servers` |
| `.codex/config.toml` | 项目级 | 跟随仓库的工具 | 同 git 仓库 |
| `.agents/mcp_config.json` | 工作区级 | 团队共享配置 | JSON 格式，`mcpServers` 键 |

![MCP 服务器配置示意](/images/codex/mcp/02-mcp-config.png)

## 三、全流程实操：从注册到使用

### 3.1 前置条件

- 已安装 Codex CLI 并完成登录（`npm install -g @openai/codex` + `codex login`）；
- 目标 MCP 服务器已可用（本地 npx 包或远端 url）；
- 对要授予的能力有清晰边界意识（见 3.5 审批）。

### 3.2 第一步：注册服务器

编辑 `~/.codex/config.toml`，加入服务器节（示例用 Playwright 浏览器 MCP）：

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]
```

### 3.3 第二步：验证服务器

重启 Codex 会话后，用 `/help` 或直接向 Codex 提问来确认工具已加载：

```text
你当前有哪些 mcp__ 开头的工具可用？
```

若配置正确，Codex 会列出类似 `mcp__playwright__navigate`、`mcp__playwright__click` 的工具清单。

::: warning 配置不生效？
改完 config.toml 后**必须重启会话**，MCP 服务器只在会话启动时加载。若仍然看不到工具，先排查路径与写法，详见第六章排查表。
:::

### 3.4 第三步：在会话中使用

工具加载后即可在对话里自然调用。例如已接入数据库 MCP：

```text
请连接 postgres 数据库，查看 orders 表的行数，并统计每个状态的数量。
```

Codex 会自己选择合适的 `mcp__postgres__*` 工具执行查询，把结果整理成回答。你不需要记住每个工具的精确签名——**自然语言描述意图即可**。

这背后其实发生了完整的一条链路：Codex 收到指令 → 从已加载工具中选择匹配的 `mcp__postgres__*` → 调用服务器执行 → 把结构化结果整理成回答。你感知到的只是"说了一句中文，拿到了表格"，但每一步都有命名、审批、日志可查，这也是 MCP 相比"跑命令"更可控的地方。

### 3.5 第四步：审批设置

MCP 工具默认可能触发审批。Codex 通过 `default_tools_approval_mode` 统一控制默认审批行为，也可配合 `approval_policy` 精细到具体工具：

```toml
[features]
default_tools_approval_mode = "approve"

[approval_policy]
deny = ["mcp__postgres__drop_database"]
```

::: danger 权限边界
对数据库、浏览器这类**有副作用**的 MCP 工具，建议先保持审批开启（`"on-request"` 或按工具放行），跑通后再按需放宽。尤其不要把 `drop`、`delete` 类操作默认放行——一次误调用可能毁掉整份数据。
:::

## 四、实战案例

### 4.1 场景一：接入数据库 MCP

把数据库变成 Codex 可查可写的对象。注册 Postgres MCP 后，一句"查一下本月销售趋势"就能让 Codex 完成连库、写 SQL、跑查询、汇总分析的全链路，省掉人肉切工具窗口。

```toml
[mcp_servers.postgres]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost:5432/mydb"]
```

### 4.2 场景二：接入浏览器

接入 Playwright 这类浏览器 MCP 后，Codex 能打开网页、点击元素、读取页面内容，用于做端到端验证、抓取页面信息或复现 Bug：

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]
```

调用示意："打开 http://localhost:3000，点击登录按钮，把页面报错信息读给我"——配合测试工作流，可显著减少人工回归。相比手动复制 URL、切到浏览器、逐项点测，Codex 能一次跑完"打开→交互→读取→归纳"的整条链路，尤其适合快速验证前端改动是否符合预期。

### 4.3 场景三：把 Skills 包装为 MCP 工具

Codex 允许把**已经沉淀好的 Skills 包装成 MCP 工具**暴露出来，让其他 Agent 或工具也能复用同一份工作流。这在团队协作、跨 Agent 复用场景下非常有用：一套评审流程、一套发布清单，写成 Skill 后包装为工具，全团队统一调用。

![Skills 包装为 MCP 工具](/images/codex/mcp/03-skills-to-mcp.png)

::: tip 建议
"指令型"逻辑（怎么做事、步骤、规范）优先写成 Skill；"能力型"逻辑（查数据、操作浏览器）优先接入 MCP。两者的组合详见《Codex Skills 使用教程》第五章，这里先记住这个分工方向即可。
:::

## 五、与 Claude Code / Cursor 的 MCP 生态对比

MCP 是开放标准，各家 Agent 都支持，但配置方式与生态各有侧重：

| 对比项 | Codex | Claude Code | Cursor |
| --- | --- | --- | --- |
| 配置文件 | `config.toml`（snake_case `mcp_servers`） | `.mcp.json` / `claude mcp add`（camelCase `mcpServers`） | `.cursor/mcp.json`（`mcpServers`） |
| 配置层级 | 全局 / 项目级 / 工作区级 | 用户 / 项目级 | 项目级 |
| 工具命名 | `mcp__<server>__<tool>` | `mcp__<server>__<tool>` | `mcp__<server>__<tool>`（同标准） |
| 权限控制 | `default_tools_approval_mode` + `approval_policy` | 权限规则 + 审批 | 每工具批准/忽略 |
| 生态亮点 | 官方插件体系、Skills 可包装为工具 | 官方 MCP 目录、企业级管理 | 原生支持多种云服务连接器 |

三者工具命名都遵循 `mcp__<server>__<tool>` 标准，意味着**同一个 MCP 服务器的配置思路可以平移**，主要差异在配置文件格式与审批体系。若你从 Claude Code / Cursor 迁移过来，把 `mcpServers`（camelCase）改成 `mcp_servers`（snake_case）放进 config.toml 即可，详细对照以各官方文档为准。

## 六、最佳实践与常见问题

### 6.1 最佳实践

1. **工具少而精**：按项目只挂必要服务器，服务器越多，模型选错工具的概率越大；
2. **配置随仓库走**：团队共享的用 `.agents/mcp_config.json` 版本化，新人零成本上手；
3. **审批默认从严**：有副作用的工具保持审批，验证无误后再放宽；
4. **命名要直观**：`<id>` 用 `postgres`、`playwright` 这种一眼可辨的名字，日志和审批提示才看得懂；
5. **安全隔离**：本地敏感库（生产库、凭证）不要写进随仓库分发的配置里。

### 6.2 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| 配置不生效 / 工具找不到 | ① 确认已**重启会话**；② 检查是 `mcp_servers`（snake_case）而非 `mcpServers`；③ 确认配置文件层级（全局/项目）被当前工作目录加载 |
| 服务器启动报错 | 先在终端手动运行 `command + args`，确认 npx 包能独立启动，排除依赖或网络问题 |
| 工具调用被拒绝 | 检查审批模式 `default_tools_approval_mode` 与 `approval_policy` 是否限制了该工具 |
| 与 Claude Code 配置迁移失败 | 把 `mcpServers`（camelCase）改为 `mcp_servers`（snake_case），并核对字段名是否一致 |
| 工具返回异常 | 查看服务器进程日志；对 `url` 类型检查网络与鉴权 |

## 总结

MCP 是 Codex 连接外部工具生态的**标准接口**。本章走通了从概念（服务器/工具/资源/提示）、配置（`mcp_servers` 三处位置、command/url 两类）、实操（注册→验证→使用→审批）到三个实战场景（数据库、浏览器、Skills 包装）的完整流程。核心要记住三点：**snake_case 的 `mcp_servers`、`mcp__<server>__<tool>` 命名、审批默认从严**。配合下一章的 Skills，你就能搭建出"指令 + 工具"双轮驱动的完整工作流。
