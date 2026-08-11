# Codex Skills 使用教程

> 来源：[OpenAI Codex 官方文档](https://developers.openai.com/codex) · [ChatGPT Learn](https://learn.chatgpt.com/docs)

每次做同类任务都要重新敲一遍"先看结构、再跑测试、再写提交说明"的提示词，是不是很烦？Codex Skills 就是为解决这个问题而生的。它把一套**可复用的工作流指令**打包成一个文件夹，Codex 在合适的时机自动或按需加载它。如果说 AGENTS.md 是"常驻的项目守则"，那 Skill 就是"随时取用的流程工具包"——本章讲清它的概念、结构、安装调用与自建方法。

## 一、Skill 核心概念

### 1.1 什么是 Skill（一句话懂）

Skill（技能）是一份**可复用的工作流指令**，以文件夹形式打包，核心是一份 `SKILL.md`。类比理解：提示词是"手抄的便签"，Skill 是"标准化的操作手册"——便签随手写随手丢，手册结构化、可分享、可自动触发。当你需要让 Codex 稳定地按某套流程做事（比如代码评审、发布检查），就把流程写成 Skill，一劳永逸。

要理解 Skills 的价值，先看它和常见的"复用方式"有什么不同：

| 复用方式 | 形态 | 触发时机 | 适合场景 |
| --- | --- | --- | --- |
| 每次手写 prompt | 对话输入 | 手动，随说随丢 | 一次性、不重复的任务 |
| AGENTS.md | 项目常驻指令 | 会话开始自动加载 | 项目级长期约定（怎么做、Do/Don't） |
| Skill | 文件夹 + SKILL.md | 显式 `$skill-name` / 隐式自动匹配 | 可复用、可分享的完整流程 |

对比可见，AGENTS.md 是"**常驻守则**"，Skill 是"**按需工具包**"：AGENTS.md 每条会话都生效，适合放稳定的工程约定；Skill 只在相关任务出现时才被加载，适合放有明确边界、成体系的流程，两者各司其职、可以互相配合。

### 1.2 SKILL.md 与附属资源

一个 Skill 文件夹包含：

| 组成部分 | 是否必需 | 作用 |
| --- | --- | --- |
| `SKILL.md` | 必需 | 技能主文档：frontmatter + 步骤指令 |
| `scripts/` | 可选 | 可执行脚本，配合指令调用 |
| `references/` | 可选 | 参考文档、示例，供模型按需查阅 |
| `assets/` | 可选 | 图片、模板等资源 |
| `examples/` | 可选 | 输入/输出示例，帮助模型理解预期结果 |

`SKILL.md` 负责"怎么指挥"，`scripts/` 等目录负责"拿什么干活"，两者分离让指令更清晰、也更利于复用。

### 1.3 YAML frontmatter：name 与 description

`SKILL.md` 以 YAML frontmatter 开头，其中两个字段是命脉：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 技能名，**小写连字符**，且须与目录名一致 |
| `description` | 是 | 技能的触发条件描述，**不是给人看的摘要**，而是模型判断"何时该用这个技能"的依据 |
| `license` / `compatibility` / `metadata` / `allowed-tools` | 否 | 声明许可、兼容性、附加信息、允许的工具集 |

```yaml
---
name: code-review
description: 当用户要求进行代码审查、检查代码质量或合并请求时使用
---
```

::: warning description 是触发条件，不是摘要
`description` 会被模型用来做**隐式触发匹配**。写得笼统（如"这是一个评审技能"），模型就不知道何时调用；写得像触发规则（如"当……时使用"），命中率才高。这是 Skill 生效与否的关键。
:::

![Skill 文件夹结构](/images/codex/skills/01-skill-folder.png)

## 二、Skill 目录结构

### 2.1 标准文件夹结构

一个完整的 Skill 长这样：

```
~/.codex/skills/code-review/
├── SKILL.md
├── scripts/
│   └── lint.sh
├── references/
│   └── review-checklist.md
├── assets/
│   └── logo.png
└── examples/
    └── good-review.md
```

`SKILL.md` 是入口，其余目录按需提供支撑材料，各自承担不同职责：

- **scripts/**：放可执行脚本（lint 检查、发布脚本等）。SKILL.md 里的指令可以引用脚本路径，让模型"照着说明书，调用现成的工具"，而不是每次都现场编命令；
- **references/**：放参考文档和检查清单。内容通常较长，不适合塞进 SKILL.md 主流程，而是由模型在需要时按需查阅，避免一次加载过多上下文；
- **assets/**：放图片、模板等资源文件，供指令或文档引用；
- **examples/**：放输入/输出的优秀示例。模型看到"期望的样子"，输出质量会明显更稳——给示例往往比给定义更有效。

::: tip 结构原则
`SKILL.md` 只保留"步骤 + 规则"，把大段参考资料丢进 `references/`，把可执行动作丢进 `scripts/`。这样主文档短而清晰，模型不容易迷失，上下文开销也更小。
:::

### 2.2 agents/openai.yaml：元数据

可选地，Skill 文件夹内可放 `agents/openai.yaml` 声明元数据，控制它在界面与调用层面的行为：

```yaml
name: code-review
description: 代码审查工作流
allow_implicit_invocation: true
dependencies:
  - type: "mcp"
    name: "postgres"
interface:
  - type: "function"
```

| 字段 | 说明 |
| --- | --- |
| `name` / `description` | 与 SKILL.md frontmatter 保持一致 |
| `allow_implicit_invocation` | 是否允许被模型自动隐式调用，`false` 则只能显式调用 |
| `dependencies` | 依赖声明，可含 `type: "mcp"` 引用某个 MCP 服务器 |
| `interface` | 对外接口显示字段 |

其中 `dependencies` 里的 `type: "mcp"` 是 Skills 与 MCP 协作的关键接线——它声明"这个技能需要哪个工具"。

## 三、安装与调用

### 3.1 三种安装位置

Skill 可放在三个层级，作用域不同：

| 位置 | 作用域 | 适用场景 |
| --- | --- | --- |
| `~/.codex/skills/` | 全局 | 个人常用技能，所有项目可用 |
| `.codex/skills/` | 项目级 | 跟随当前项目，随仓库分发 |
| `.agents/skills/` | 工作区/项目 | 团队共享、工作区级技能 |

把 Skill 文件夹放进对应位置即可安装，无需额外注册。

### 3.2 显式调用 vs 隐式调用

| 调用方式 | 触发方式 | 适用场景 |
| --- | --- | --- |
| 显式调用 | `/skills` 查看列表；`$skill-name` 提及 | 明确指定使用某个技能 |
| 隐式调用 | Codex 根据任务自动选择 | 模型根据 `description` 匹配到技能并自动加载 |

```text
# 显式：直接指定
请用 $code-review 技能审查当前分支的改动

# 显式：先看有什么
/skills
```

两种方式各有用途：**显式调用**适合"你明确知道要用哪个流程"的场景，结果可控、可预期；**隐式调用**则省事——Codex 读到你"帮我检查下这次改动的质量"时，如果 `description` 匹配，就会自动加载 `code-review` 技能，无需你点名。隐式调用依赖 `description` 的命中质量，也受 `allow_implicit_invocation` 控制：设为 `false` 后，该技能**只能被显式调用**，防止它在不合适的场景被自动触发（比如某个内部评审技能，就不希望被普通对话误触发）。

::: tip 隐式调用调试思路
如果发现某技能该触发却没触发，先别急着改 `SKILL.md` 主体，优先检查 `description` 是否包含了任务里常见的关键词与意图表达；其次确认它没有被 `enabled = false` 关闭。
:::

![Skill 隐式触发](/images/codex/skills/02-implicit-trigger.png)

### 3.3 禁用技能

不需要的技能可以关闭而不删除，在 config.toml 中用 `[[skills.config]]` 指定路径并 `enabled = false`：

```toml
[[skills.config]]
path = "~/.codex/skills/code-review/SKILL.md"
enabled = false
```

::: tip 何时禁用而非删除
团队成员共享的技能、或偶发冲突的技能，用 `enabled = false` 关闭即可，保留文件方便日后恢复。
:::

## 四、编写自己的 Skill

### 4.1 完整 SKILL.md 示例

以"代码评审"技能为例，展示一个可直接复制改造的完整写法：

```markdown
---
name: code-review
description: 当用户要求审查代码、检查 PR/合并请求、评估代码质量时使用
---

# 代码评审技能

按照以下流程审查代码，输出结构化的评审结论。

## 步骤

1. 用 `git diff` 查看当前分支相对目标分支的改动，确认范围。
2. 逐文件阅读改动，重点关注：
   - 逻辑正确性与边界条件
   - 资源释放与错误处理
   - 与仓库 AGENTS.md 约定的工程规范是否一致
3. 对每个问题给出：文件位置、问题描述、建议修复方向、严重级别。
4. 汇总输出，按严重级别分组。

## 参考

- 详细检查清单见 `references/review-checklist.md`
- 合格评审示例见 `examples/good-review.md`

## 约束

- 只报告明确、可执行的问题，不堆砌泛泛的"建议优化"。
- 不修改代码，只输出评审意见。
```

### 4.2 从验证到沉淀

写好后放进 `~/.codex/skills/code-review/`，重启会话，用 `$code-review` 显式调用验证。跑通后把它当作**已验证 prompt 的持久层**——就像官方建议的那样：一次 prompt 调好了，就编码成 Skill 或 AGENTS.md，避免下次重敲。

一个实用的自检清单：① `name` 与目录名一致、小写连字符；② `description` 是触发条件句式；③ 步骤之间没有歧义，且都能被 Codex 实际执行；④ 输出的格式在 `examples/` 里有对照。四项都过，这个 Skill 才算真正可交付。

::: tip 编写顺序建议
先给最小 `SKILL.md`（name + description + 几步指令），验证有效后再逐步补 `references/`、`scripts/`，别一开始就堆料。
:::

## 五、Skills 与 MCP 的互补关系

### 5.1 分工对比

| 维度 | Skills | MCP |
| --- | --- | --- |
| 本质 | 指令（怎么做、什么流程） | 工具（能做什么） |
| 形态 | `SKILL.md` 文件夹 | 本地进程或远程服务器 |
| 触发 | 显式 `$skill-name` / 隐式自动 | 会话加载后按需调用 |
| 作用 | 教模型按流程做事 | 给模型外部能力 |

一句话总结：**Skills 提供指令，MCP 提供工具**。

### 5.2 组合示例

一个"数据报表"技能可以这么组合：Skill 定义"连接数据库 → 查关键指标 → 生成 Markdown 报表"的流程，MCP 提供 `postgres` 服务器真正执行查询。Skill 里的 `dependencies` 声明 `type: "mcp"`，Codex 加载技能时就知道需要调起对应工具。

![Skills 与 MCP 互补](/images/codex/skills/03-skill-mcp-compose.png)

这种"指令 + 工具"的组合，让技能既能**规定怎么做**，又真正**做得到**——是 Codex 工作流里性价比最高的架构。

## 六、最佳实践与常见问题

### 6.1 最佳实践

1. **description 写成触发规则**：用"当……时使用"句式，别写摘要；
2. **name 小写连字符且与目录一致**：`code-review` 而非 `Code Review`，否则可能匹配失败；
3. **指令可执行、可验证**：给明确步骤和验收标准，别写空话；
4. **资源按需沉淀**：从最小 SKILL.md 起步，验证后再加 references/scripts；
5. **配合 MCP 声明依赖**：需要工具的技能，在 `agents/openai.yaml` 声明 `type: "mcp"` 依赖。

### 6.2 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| 技能不生效 / 找不到 | ① 确认目录名与 `name` 一致且为小写连字符；② 重启会话；③ 检查是否被 `[[skills.config]] enabled = false` 禁用 |
| 隐式调用不触发 | 检查 `allow_implicit_invocation` 是否被设为 `false`；检查 `description` 是否写成了摘要而非触发条件 |
| 调用了但行为不对 | 精简 `SKILL.md` 步骤，逐条核对指令是否歧义；检查 `references/` 是否被正确引用 |
| 技能需要 MCP 却调用失败 | 确认 `agents/openai.yaml` 的 `dependencies` 已声明 `type: "mcp"`，且对应服务器已注册 |

## 总结

Skills 是 Codex 的**可复用工作流机制**：用 `SKILL.md` + 附属资源打包一套流程，靠 `name`（小写连字符、与目录一致）和 `description`（触发条件）驱动显式或隐式调用，装进 `~/.codex/skills/`、`.codex/skills/` 或 `.agents/skills/` 即可生效。它的精髓在于把一次次重复的 prompt **沉淀为可复用、可分享、可自动触发的资产**；再与 MCP 的"指令 + 工具"互补组合，就构成了 Codex 高效工作流的完整拼图。
