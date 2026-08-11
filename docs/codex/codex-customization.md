# Codex 项目定制化教程

装好 Codex、跑通第一个 prompt 之后，多数人会有同一种落差感：它"什么都会，但什么都不懂我"。默认状态的 Codex 是通用工程师，你的项目有特有的构建命令、代码风格、领域术语、踩过的坑——它一概不知。本章解决的就是这个问题：把 Codex 从一个"通用实习生"调教成**懂你项目的专属工程师**，从个人、项目、团队三个维度逐层定制。

## 一、定制化分层全景：五大层怎么组合

Codex 的定制能力不是散点，而是清晰分层的。先看全景，再逐层理解：

![五层定制化全景](/images/codex/customization/01-customization-layers.png)

| 层 | 机制 | 管什么 | 类比 |
| --- | --- | --- | --- |
| 项目指导 | AGENTS.md | 工程约定、完成定义、"怎么做" | 入职培训手册 |
| 记忆 | Memory | 之前发生了什么、踩过哪些坑 | 老员工的个人笔记 |
| 工作流 | Skills | 可复用的标准操作流程 | 标准作业流程（SOP） |
| 外部工具 | MCP | 接入数据库、浏览器、内部 API | 工具箱里的专业工具 |
| 委派 | Subagents | 把独立子任务并行交给子代理 | 项目经理分活 |

::: tip 一句话区分
**AGENTS.md 管"按什么规矩做"、记忆管"之前发生了什么"、Skills 管"这类事怎么做"、MCP 管"能调用什么"、Subagents 管"谁来做"**。五层各司其职，组合起来才是一个完整的"专属工程师"。
:::

分层定制还有一个天然好处：**作用域不同，互不干扰**。项目层管项目的事，团队层管团队的事，个人层管你自己的偏好——改动任何一层都不会污染其他项目。

## 二、按项目定制：把项目知识写进 Codex

项目定制是最重要的一层，因为每个项目最痛的就是"通用 Agent 不懂我的代码库"。

### 2.1 AGENTS.md：项目专属指令

AGENTS.md 是**项目级指令文件，会话开始自动加载**，被官方称为"给 Agent 看的 README"。放项目根目录，内容覆盖：仓库结构、构建/测试/lint 命令、工程约定、PR 期望、完成的定义（definition of done）、do-not 规则。

```markdown
<!-- AGENTS.md（项目根目录）示例 -->
# 项目指令

## 仓库结构
- `src/` 业务代码，`tests/` 对应单测
- 工具函数放 `src/utils/`，勿散落各模块

## 命令
- 安装依赖：`pnpm install`
- 跑测试：`pnpm test`（所有改动必须过测试）
- 类型检查：`pnpm typecheck`

## 约定
- TypeScript 严格模式，禁止 `any`（除 DTO 边界）
- 提交信息遵循 Conventional Commits
- 新增功能必须写测试，覆盖主线路径

## 完成定义
- 通过 typecheck + 测试 + lint
- 无遗留 TODO/FIXME（本次改动引入的）

## 不要做
- 不要修改 `dist/`、`node_modules/` 生成物
- 不要未经确认重命名数据库字段
```

::: tip 提示
用 `/init` 斜杠命令可以生成 AGENTS.md 脚手架，但**脚手架的模板只是起点**，真正有价值的是后续根据项目反复迭代补进去的"教训"。保持简短，可复用规则放这里，而不是每次 prompt 重复。
:::

AGENTS.md 支持**嵌套级联**：子目录里再放 AGENTS.md，越靠近工作目录优先级越高。适合在 `src/api/` 下单独约束"路由风格"，在 `docs/` 下约束"写作规范"，互不污染。

### 2.2 `.codex/` 目录：项目级配置中心

项目级配置集中在 `.codex/` 目录，随仓库分发、git 管理：

```text
.codex/
├── config.toml      # 项目级配置（模型、特性、agents 等）
├── hooks.json       # 项目级 hooks
├── AGENTS.md        # Codex 特定补充指令
└── skills/          # 项目级技能
```

- **`.codex/config.toml`**：项目级配置，优先级高于全局配置，成员 clone 下来即生效。
- **`.codex/hooks.json`**：项目级生命周期钩子，比如提交前自动格式化、`PostToolUse` 跑 lint。
- **`.codex/AGENTS.md`**：Codex 特定补充，区别于通用的 AGENTS.md（后者是跨工具标准）。

### 2.3 项目级 Skills 与工作区 MCP

- **项目级 skills**：放 `.codex/skills/` 或项目 `.agents/skills/`，只有这个项目能用，随仓库走。适合沉淀项目特有的操作流程，比如"发版流程"、"加字段的完整步骤"。
- **工作区 MCP**：用 `.agents/mcp_config.json` 配置工作区级 MCP 服务器，比如接入项目自己的数据库、内部文档系统，让 Codex 在项目内"手够得着"真实数据。

::: warning 注意
MCP 服务器在 config.toml 里是 `[mcp_servers.<id>]`（**snake_case**），不是 `mcpServers`。工作区级用 `.agents/mcp_config.json`。写错命名会导致配置不生效，这类细节以官方文档为准。
:::

## 三、按团队定制：一套配置，全队一致

个人项目怎么折腾都行，团队协作的核心诉求是**一致**——每个人都用同一套 AGENTS.md、同一批 hooks 和 plugins，产出自然统一。

### 3.1 共享 AGENTS.md

把团队级约定（代码规范、Git 流程、PR 模板、完成定义）放进仓库根 AGENTS.md，随代码分发。新人 clone 即得，不靠口口相传。AGENTS.md 也是跨工具标准（agentsmd.io），**Copilot、Cursor、Windsurf 等同样遵循**——一次编写，多工具共享。

### 3.2 统一 hooks

把"必然要做的检查"固化成 hooks，放 `.codex/hooks.json` 进仓库。比如 `PreToolUse` 拦截危险命令（删除生产环境数据等）、`Stop` 时自动格式化。hooks 是**确定性行为**，不依赖模型心情，团队级别的一致就靠这种"机器把关"。

```json
// .codex/hooks.json（示意：拦截危险命令，以官方文档为准）
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "command",
          "command": "node .codex/guard.js",
          "timeout_seconds": 10
        }
      ]
    }
  ]
}
```

### 3.3 统一 plugins

Plugins 是**可安装的分发单元**，把 skills、MCP、hooks 打成一个包，团队统一安装。相比手动复制一堆文件，插件一次安装全部就位，版本也统一。适合团队把"标准工具箱"做成一个插件仓库，成员装一次，环境即一致。

## 四、按个人定制：把个人偏好藏进全局

团队配置是"大家都要遵守的底线"，个人配置是"只有我自己在乎的习惯"。两者分离，才不会互相踩脚。

### 4.1 全局 AGENTS.md 与个人 skills

- **`~/.codex/AGENTS.md`**：全局级指令，**每次会话都读**。放你的通用偏好，比如"中文回复"、"先给方案再写代码"、"不用 emoji"——这些在任意项目都适用。
- **个人 skills**：放 `~/.codex/skills/`，跨项目可用。比如"代码审查"、"生成变更日志"，你自己的私有工作流放这里。

### 4.2 Profiles：命名预设一键切换

[profiles] 是 config.toml 里的命名预设，用 `codex --profile <name>` 切换。适合把不同场景的配置固化下来：

```toml
# ~/.codex/config.toml 片段
[profiles.fast]
  # 快速模式：更激进的审批，跑日常小任务
  approval_policy = "acceptEdits"

[profiles.strict]
  # 严格模式：高风险操作全审批
  approval_policy = "untrusted"
  sandbox_mode = "default"
```

::: tip 提示
给 **behavioral rules**（有确定性设置的，如审批策略、模型参数）放 config.toml 的 profiles；给**持久规则**（项目结构、命令、约定、完成定义）放 AGENTS.md。这是官方建议的规则分层原则，别混放。
:::

## 五、定制化完整案例：一个 Web 项目的定制组合

假设你要为一个前后端分离的 Web 项目定制 Codex，最终落地形态如下：

![项目专属工程师](/images/codex/customization/02-project-persona.png)

```text
my-web-app/
├── AGENTS.md                  # 团队级：工程约定 + 完成定义 + do-not 规则
├── .codex/
│   ├── config.toml            # 项目级：模型、agents 线程数、skills 开关
│   ├── hooks.json             # 项目级：提交前格式化 + 拦截危险命令
│   ├── AGENTS.md              # Codex 特定：补充 Codex 独有的规则
│   └── skills/
│       ├── add-api-field/     # 项目级 skill：加字段的标准流程
│       └── release-checklist/ # 项目级 skill：发版检查清单
├── .agents/
│   └── mcp_config.json        # 工作区 MCP：接项目数据库
└── .agents/skills/            # 项目级 skills 的另一种挂载位置
```

这个组合的效果：打开项目会话，Codex **自动加载 AGENTS.md** 知道工程规矩，**通过 MCP 能直接查数据库**，遇到"加字段"任务会**自动匹配对应 Skill** 按标准流程走，改完代码 **hooks 自动格式化**，多模块并行改动时 **Subagents 拆活并行**。对一个新开发者，这就是"入职第一天就有十年老工程师陪着你"。

```toml
# .codex/config.toml（项目级示意）
[model]
name = "gpt-5-codex"          # 以官方文档为准

[agents]
max_threads = 4               # 并行子代理线程数
max_depth = 1                 # 嵌套深度

[[skills.config]]
path = ".codex/skills/add-api-field/SKILL.md"
enabled = true
```

这个组合每一层都对应一个具体的痛点，落地之后的效果对照如下：

| 定制项 | 解决的问题 | 落地前（默认状态） | 落地后 |
| --- | --- | --- | --- |
| 根目录 AGENTS.md | 不知道工程约定 | 乱用命令、乱建目录 | 构建/测试命令、完成定义一步到位 |
| `.codex/hooks.json` | 格式与规范靠运气 | 每次靠人提醒改格式 | 提交前自动格式化，CI 不再红 |
| `.codex/skills/` | 项目流程无法复用 | 每次重新描述流程 | `/skills` 一调即得标准流程 |
| `.agents/mcp_config.json` | 够不到真实数据 | Agent 只能"猜"数据库结构 | 直接查库，方案基于真实 schema |
| `[agents]` 配置 | 大任务串行低效 | 一个会话从头干到尾 | 子代理并行拆活，多模块同时推进 |

### 5.2 组合效果：从"通用助手"到"专属工程师"

定制前，Codex 每接到一个任务都从零理解你的项目；定制后，它**打开会话就带着全部上下文**：规矩（AGENTS.md）、历史（记忆）、流程（Skills）、工具（MCP）、分工（Subagents）。差异不是"偶尔更准"，而是**每一轮交互的质量下限被抬高了**——最坏的情况也比默认状态好一截，因为规则和工具已经替你兜住了最常见的错误。

## 六、最佳实践与常见问题

### 如何验证定制是否生效

定制完别急着用，先做一次 30 秒的"体检"：

1. **指令加载**：新开会话，问 Codex"这个项目的构建命令是什么"，能答出 AGENTS.md 里的命令，说明加载成功。
2. **工具可用**：问"你现在能连哪些 MCP 工具"，确认 `mcp__*` 工具被暴露。
3. **Skill 触发**：用一个典型任务（比如"加一个字段"）看它是否自动选用对应 Skill，不行就检查 `description`。
4. **Hooks 生效**：故意写一段未格式化的代码再触发 Stop，看 hooks 是否自动修正。

体检发现的任何一项没生效，按下面的排查表定位。

### 最佳实践

1. **分层优先**：项目层、团队层、个人层职责清晰，别把个人偏好塞进团队 AGENTS.md，也别把项目细节写进全局配置。
2. **AGENTS.md 保持简短**：写"必要的规矩"而不是"完整的小说"，太长会被稀释，Agent 反而不遵守。
3. **随仓库版本管理**：`.codex/` 和 AGENTS.md 进 git，改造成本一次、收益全队共享。
4. **规则来自反复犯错**：每次 Agent 犯错，把教训补进 AGENTS.md——这是官方推荐的反馈闭环，AGENTS.md 是"已验证 prompt 的持久层"。

### 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| 项目级配置不生效 | 确认在 `.codex/config.toml` 而非全局；确认拼写（`mcp_servers` 是 snake_case）；重启会话 |
| 子目录规则没起作用 | 检查嵌套 AGENTS.md 的位置是否覆盖工作目录；确认没被更近层级的规则覆盖 |
| Skill 不被自动触发 | 检查 SKILL.md 的 `description` 是否写成了摘要而不是触发条件；显式用 `/skills` 或 `$skill-name` 调用 |
| 全团队配置不同步 | 确认 `.codex/` 在 git 仓库内且被 clone；hooks/plugins 由仓库分发而非口头拷贝 |
| 个人配置污染项目 | 检查是否有同名全局/项目配置冲突；个人偏好只放 `~/.codex/AGENTS.md` 和 `~/.codex/skills/` |

## 总结

定制化的本质，是把"你脑子里的项目知识"显式地交给 Codex：**AGENTS.md 给规矩、记忆给历史、Skills 给流程、MCP 给工具、Subagents 给分工**。按项目、团队、个人三层作用域分别安置，既互相独立又不打架。做好这一步，Codex 才真正从"什么都会的通用助手"变成"只懂你这个项目的专属工程师"。下一章，我们用完整的可复制示例，把这里讲到的每一层配置落到实际文件。
