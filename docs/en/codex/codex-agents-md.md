# Codex AGENTS 加载指令详解

如果你只打算给 Codex 做一件事，那就是写好它的 AGENTS.md。它是 Codex 的"灵魂"——一份放在仓库里的项目级指令文件，会话一启动就被自动加载，决定了 Agent 知不知道仓库结构、懂不懂构建命令、守不守工程约定。不会用 AGENTS.md，你调教的每一个 prompt 都只是在给一个"失忆"的 Agent 重复说废话；会用 AGENTS.md，一次配置，长期生效。这一篇带你彻底搞懂它。

## 一、什么是 AGENTS.md

### 1.1 一句话懂：给 Agent 看的 README

AGENTS.md 是**项目级指令文件**，会话开始时自动加载，相当于"给 Agent 看的 README"。你给新人看 README 了解项目，给 Agent 看 AGENTS.md 了解项目该怎么用、代码该怎么写。

![AGENTS.md 是给 Agent 看的 README](/images/codex/agents-md/01-agentsmd-hero.png)

### 1.2 跨工具标准，不是 Codex 私货

AGENTS.md 最大的价值在于它是**跨工具标准**：GitHub Copilot、Cursor、Windsurf、Devin 以及 Codex 都共同遵循（规范见 agentsmd.io）。这意味着你为项目写的一份 AGENTS.md，能在多个 AI 编程工具间通用——"写一次，到处生效"，不会因为换工具而推倒重来。

| 工具 | 是否遵循 AGENTS.md | 用户受益点 |
| --- | --- | --- |
| Codex | 是 | 会话自动加载项目指令 |
| GitHub Copilot | 是 | 补全与建议贴合仓库约定 |
| Cursor | 是 | Agent 模式行为一致 |
| Windsurf / Devin | 是 | 多工具协作不打架 |

::: tip 迁移友好
如果你从 Claude Code / Cursor 迁到 Codex，AGENTS.md 通常**原样可用**——这正是跨工具标准的意义。迁移成本主要在其他配置（config.toml、hooks），而非指令文件。
:::

### 1.3 会话开始自动加载

AGENTS.md 的关键特性是**自动加载**：新会话启动时，Codex 会自动读取作用域内生效的 AGENTS.md，无需你手动指定。你不需要每次 prompt 都复述"记住，测试跑 `npm test`"——写进 AGENTS.md，它就永远在线。

## 二、三级作用域：从全局到子目录

### 2.1 三个层级

AGENTS.md 按作用域分为三级，覆盖面从"所有项目"到"单个子目录"：

| 层级 | 位置 | 生效范围 | 用途 |
| --- | --- | --- | --- |
| 全局 | `~/.codex/AGENTS.md` | 每次会话都读 | 个人通用偏好、通用工作流 |
| 仓库根 | 仓库根目录 `AGENTS.md` | 该仓库所有会话 | 项目级结构、命令、约定 |
| 子目录 | 子目录中的 `AGENTS.md` | 仅该目录作用域 | 模块级特殊规则 |

### 2.2 嵌套级联，越近优先级越高

作用域之间是**嵌套级联**关系：子目录的 AGENTS.md 会叠加在父级之上，且**越靠近当前工作目录的指令优先级越高**。也就是：全局指令给底线，仓库指令给主线，子目录指令做局部覆盖。

![三级作用域级联](/images/codex/agents-md/02-nested-scope.png)

```text
~/.codex/AGENTS.md        ← 全局，最底层底线
repo/AGENTS.md            ← 仓库，主线约定
repo/src/AGENTS.md        ← 子目录，局部规则（优先级最高）
```

::: warning 优先级不是"只读最近的"
级联是**叠加**而非**替换**：子目录指令不会抹掉全局指令，只是"高优先级覆盖低优先级"的冲突项。设计规则时要想清楚哪些是底线（全局）、哪些要局部覆盖（子目录）。
:::

## 三、应该写什么

AGENTS.md 的内容建议覆盖以下六类，但不是都要有——**按项目实际取舍**：

| 类别 | 内容示例 | 价值 |
| --- | --- | --- |
| 仓库结构 | 目录职责、关键模块位置 | 让 Agent 不迷路 |
| 构建/测试/lint 命令 | `npm test`、`pnpm lint`、`make build` | 让 Agent 用对命令 |
| 工程约定 | 命名规范、错误处理风格、组件组织 | 让 Agent 写出的代码"像项目的一部分" |
| PR 期望 | 提交信息规范、PR 描述模板 | 让 Agent 的产出符合审查习惯 |
| 完成定义 | 什么算"做完"（测试通过、文档同步） | 防止"差不多就行" |
| do-not 规则 | 不要碰生成文件、不要改锁定文件、不要删迁移记录 | 划定禁区 |

### 3.1 保持简短

AGENTS.md 最反直觉的规则是：**越短越好**。它是 Agent 每次会话都要读的上下文，写 5000 字只会稀释关键指令、浪费上下文窗口，甚至让 Agent 抓不住重点。

::: danger 过长的 AGENTS.md 会反效果
一份 2000+ 行的 AGENTS.md 会让"最重要的三条规则"淹没在噪音里。判断标准：删掉一行不影响可读性的内容，就是应该删的内容。宁可精炼，不要堆砌。
:::

## 四、实操：生成与读取流程

### 4.1 /init 生成脚手架

对空仓库或没有 AGENTS.md 的项目，用 `/init` 斜杠命令一键生成脚手架：Codex 会扫描仓库结构，自动产出基础版 AGENTS.md，再人工补充项目细节。这是起步最快的路径。

![/init 生成脚手架](/images/codex/agents-md/03-init-scaffold.png)

```bash
codex            # 进入会话
/init            # 生成 AGENTS.md 脚手架
```

### 4.2 codex 自动读取流程

Codex 启动会话时按"全局 → 仓库根 → 子目录"的顺序自动加载生效的 AGENTS.md，无需任何手动开关。验证是否生效的简单方法：新会话里直接问"这个项目的测试命令是什么？"——能答对就说明加载成功。

### 4.3 .codex/AGENTS.md 补充

除了标准位置的 AGENTS.md，Codex 还支持 `.codex/AGENTS.md` 作为 **Codex 特定补充**。适合放 Codex 专属的约定（比如"这个项目用 codex exec 做 CI"），避免污染需要跨工具通用的主 AGENTS.md。

```text
repo/
├── AGENTS.md            # 跨工具通用指令
└── .codex/
    └── AGENTS.md        # Codex 专属补充
```

::: tip 分工建议
跨工具通用的放根 `AGENTS.md`；只对 Codex 生效的细节（CLI 工作流、专属 hooks 配合）放 `.codex/AGENTS.md`，保持主文件纯净。
:::

## 五、与 GitHub 工作流集成

### 5.1 PR 评论 @codex 委派

AGENTS.md 不是孤立文件——它可以和 GitHub 工作流联动：在 PR 评论中 `@codex` 委派任务（如"请审查这个 PR 并给出修改建议"），Codex 结合 AGENTS.md 中的 PR 期望与完成定义来执行。这意味着你的审查标准只写一遍，AI 每次都按同一把尺子执行。

### 5.2 定时漂移检查

项目规范会随开发漂移（新目录出现、命令改名），建议定期用 Codex 跑一次"AGENTS.md 与仓库现状对照"检查，让指令文件与真实仓库保持一致。过时的 AGENTS.md 比没有 AGENTS.md 更有害——它让 Agent 自信地执行错误约定。

## 六、完整示例：一个中型项目的 AGENTS.md

以下是可直接复制修改的完整示例，覆盖"命令 + 结构 + 约定 + do-not + 完成定义"五要素：

```markdown
# Project AGENTS.md

## 概述
这是一个中型 SaaS 后台，前端 React + Vite，后端 Node.js (Express)，
公共组件在 src/components/，核心逻辑在 src/domain/。

## 常用命令
- 安装依赖：`pnpm install`
- 启动开发：`pnpm dev`（前端 5173，后端 3000）
- 运行测试：`pnpm test`（Vitest）
- 代码检查：`pnpm lint`（ESLint + Prettier 严格模式）

## 工程约定
- 组件命名：PascalCase，文件与组件同名（Button.tsx）
- 业务逻辑放 src/domain/，禁止把逻辑写进组件文件
- API 错误统一走 src/lib/apiError.ts 的错误类型
- 样式用 CSS Modules，不使用全局 class 覆盖

## PR 期望
- 提交信息：`feat|fix|refactor(scope): 一句话`
- 每个 PR 必须包含对应测试，改动公共 API 需同步文档

## 完成定义（Definition of Done）
一个任务"做完"的标准：
- `pnpm lint` 无报错
- `pnpm test` 全部通过，新增代码有覆盖
- 无调试日志残留，无死代码

## Do-Not
- 不修改 pnpm-lock.yaml（除非新增/升级依赖）
- 不删除 src/migrations/ 下任何历史迁移文件
- 不手写全局样式覆盖 antd 组件（用主题变量）
- 不提交 .env 及任何含密钥的文件
```

::: tip 从这份模板起步
复制后按项目实际替换命令、路径与约定。规则宁可少而准，不要多而虚。
:::

## 七、最佳实践与常见问题

### 7.1 最佳实践清单

- **写短写准**：只保留每条都"必须被记住"的规则；
- **把已验证的 prompt 编码进来**：一段 prompt 验证有效后，沉淀进 AGENTS.md 作为持久层，避免每次重复；
- **行为规则放 config.toml，持久规则放 AGENTS.md**：有确定性设置（如审批策略）放 config.toml，结构/命令/约定/完成定义放 AGENTS.md；
- **定期漂移检查**：让指令与仓库现状保持一致；
- **三级作用域分工**：全局管底线、仓库管主线、子目录管局部覆盖。

### 7.2 常见问题排查

| 现象 | 可能原因 | 排查步骤 |
| --- | --- | --- |
| 改了 AGENTS.md 但不生效 | 会话在修改前已启动 | 重启会话或 `/resume` 后确认加载 |
| 子目录规则没覆盖到 | 级联优先级理解反了 | 确认该子目录 AGENTS.md 存在且内容冲突项确实更高优先级 |
| Agent 行为"太散" | AGENTS.md 过长失去重点 | 精简规则，只留高价值条目 |
| 换了工具行为不一致 | 用了 Codex 专属写法 | 跨工具内容放根 AGENTS.md，专属细节放 .codex/AGENTS.md |
| /init 生成的太简陋 | 脚手架只是起步 | 按第三章的六类清单人工补齐项目细节 |

## 八、总结

AGENTS.md 是 Codex 的"灵魂"，本质是**给 Agent 看的 README**：它遵循 agentsmd.io 跨工具标准（Copilot、Cursor、Windsurf、Devin 通用），靠全局/仓库/子目录三级级联实现精确控制，会话启动即自动加载。写它要记住三个关键词：**结构（仓库长什么样）、命令（怎么跑）、约定（怎么写才算对）**，并始终维持简短。配合 `/init` 脚手架、`.codex/AGENTS.md` 补充与 GitHub 工作流集成，一份精炼的 AGENTS.md 能让你的 Codex 从"每次新员工"变成"自带项目手册的老手"。
