# Hermes Agent cron 定时任务使用教程

你的 Agent 应该能"定时自己干活"，而不是等你每次开口。早上九点自动生成昨天的工作摘要发到 Telegram、每天半夜做一次备份、每周一审计一遍仓库——这些都不需要你在场。Hermes 内置的 **cron 定时任务**调度器就是干这个的：设定一个时间表，到点它就在新会话里自己运行一段任务，再把结果投递到你想要的地方。

没有 cron 之前，Agent 的所有能力都依赖"你发起对话"。有了 cron，Hermes 从"你叫它才动"变成"到点自己动"。本章从核心概念讲起，带你学会用 TUI 和 CLI 两种方式创建任务、管理任务，理解任务怎么持久化、结果怎么投递，最后给出日报、备份、审计、监控四类实战案例。

![定时任务调度](/images/hermes/cron/01-cron-schedule.png)

## 一、cron 核心概念

### 1.1 什么是 cron 任务（一句话懂）

**cron 任务 = 一条"时间表 + 一段 prompt"的自动化规则**。Hermes 内置调度器到点后，会**开一个全新的会话**，用你写好的 prompt 驱动 Agent 完成任务，结束后把输出保存下来、按需投递出去。

它和传统 Unix cron 的区别在"任务内容"：传统 cron 跑一条固定的 shell 命令，Hermes cron 跑的是**一次完整的 Agent 对话**——Agent 会自己读文件、跑命令、上网查资料、调用工具，最后产出结论。相当于"定时把你的问题丢给一个会干活的 Agent"。

| 维度 | 普通交互会话 | cron 任务 |
| --- | --- | --- |
| 触发方式 | 你发起对话 | 调度器到点自动触发 |
| 上下文 | 复用当前会话上下文 | 全新空会话，prompt 必须自包含 |
| 是否有人值守 | 需要你在场 | 无需你在场 |
| 输出去向 | 终端屏幕 | 落盘（`output/`）+ 按需投递 |

### 1.2 最关键的机制：新会话运行，prompt 必须自包含

cron 任务在一个**全新的、空的会话**里运行，这个机制决定了写 prompt 的黄金法则：

::: danger prompt 必须自包含
cron 任务运行在全新会话里——它**不共享**你交互会话中的上下文、记忆片段和刚才的对话。所以 prompt 必须**自包含**：把任务要做什么、针对哪个目录、产出什么、发到哪里，全部写清楚。指望它"接着上次说的继续"是行不通的。
:::

对比一下两种写法的差别：

| 写法 | 例子 | 结果 |
| --- | --- | --- |
| ❌ 依赖上下文 | `/cron add "every 2h" "继续上次那个任务"` | 新会话里 Agent 一脸懵 |
| ✅ 自包含 | `/cron add "every 2h" "检查 /srv/app 的日志，若出现 ERROR 或 5xx，总结最近 30 分钟的报错并给出修复建议"` | Agent 独立完成 |

自包含的 prompt 是 cron 用得好的第一课：把"上下文"换成"显式的指令"。

### 1.3 核心价值

- **7×24 值班**：监控、巡检类任务不依赖你在线，到点就查、有异常就报告。
- **规律产出**：日报、周报、备份这类"固定节奏"的活儿，交给 Agent 自动做。
- **结果沉淀**：每次运行都有输出落盘（见第四节），历史可回溯。

## 二、创建任务

### 2.1 TUI 内创建：/cron add

在交互会话（TUI）里用斜杠命令创建：

```text
/cron add "0 9 * * 1" "generate a weekly AI summary from the last 7 days of my notes and post it"
```

格式：`/cron add "<调度表达式>" "<prompt>"`。第一个参数是调度时间，第二个参数是任务 prompt。

`"0 9 * * 1"` 是标准的 cron 五段式表达式（分 时 日 月 周）：`0` 分、`9` 时、`*` 任意日、`*` 任意月、`1` 周一——也就是"每周一早上 9 点整"。

![创建 cron 任务](/images/hermes/cron/02-cron-create.png)

### 2.2 CLI 创建：hermes cron create

在终端里（非交互）用 CLI 创建：

```bash
# 每 2 小时检查一次服务器状态
hermes cron create "every 2h" "check server status" --name health-check

# 每天凌晨 1 点做备份
hermes cron create "0 1 * * *" "backup the database to /backups and report the result" --name nightly-backup

# 带技能的任务
hermes cron create "0 9 * * 1" "write this week's blog summary" --name weekly-blog --skill blogwatcher
```

CLI 版相比 `/cron add` 多了 `--name`（给任务起名，方便管理）和 `--skill`（附加技能）等参数。

::: tip 注意引号
prompt 里常带空格、路径甚至标点，务必用引号把整个 prompt 包成一个参数（如 `"check server status"`）。不包引号时 shell 会按空格拆成多个参数，任务内容会被截断，运行时才会暴露。
::: 

### 2.3 两种调度表达方式

Hermes 的调度时间既支持标准 cron 表达式，也支持**自然语言**：

| 写法 | 示例 | 说明 |
| --- | --- | --- |
| cron 表达式 | `"0 9 * * 1"` | 标准五段式：分 时 日 月 周，精度到分钟 |
| 自然语言 | `"every 2h"`、`"daily at 9am"` | plain-English 调度，更好读、不用记表达式 |

```bash
# 自然语言同样可用
hermes cron create "daily at 9am" "summarize yesterday's work into today's report"
```

::: tip 用自然语言降低门槛
记不住 `"0 9 * * 1"` 是什么意思？直接写 `"every monday at 9am"` 这类自然语言即可，Hermes 内部会解析成调度计划。复杂规则（比如"每月第一个工作日"）再回头用 cron 表达式精确控制。
:::

**常见调度速查**（cron 五段式：分 时 日 月 周）：

| 意图 | cron 表达式 | 等价的自然语言 |
| --- | --- | --- |
| 每 2 小时一次 | — | `"every 2h"` |
| 每天早上 9 点 | `"0 9 * * *"` | `"daily at 9am"` |
| 每周一 9 点 | `"0 9 * * 1"` | `"every monday at 9am"` |
| 每月 1 号零点 | `"0 0 1 * *"` | `"monthly on the 1st"` |
| 每分钟一次 | `"* * * * *"` | `"every minute"`（慎用） |

日常 90% 的需求用自然语言就能写；需要精确到某一分、或做跨月跨周组合时才动用 cron 表达式。

### 2.4 关键参数详解

| 参数 | 作用 | 示例 |
| --- | --- | --- |
| 调度表达式 | 任务何时运行 | `"every 2h"` / `"0 9 * * 1"` |
| prompt | 任务内容（务必自包含） | `"check server status"` |
| `--name` | 任务名，用于后续管理 | `--name health-check` |
| `--skill` | 附加技能，增强任务能力 | `--skill blogwatcher` |

## 三、管理任务

创建只是开始，真正的日常工作里你会反复用到管理命令。

### 3.1 管理命令总览

| 命令 | 作用 | 说明 |
| --- | --- | --- |
| `hermes cron list` | 列出所有任务 | 含任务名、调度、状态 |
| `hermes cron edit <name>` | 编辑任务 | 改调度或 prompt |
| `hermes cron pause <name>` | 暂停任务 | 临时停掉，不删除 |
| `hermes cron resume <name>` | 恢复任务 | 从暂停状态重新启用 |
| `hermes cron run <name>` | 立即运行一次 | 手动触发，不等调度时间 |
| `hermes cron remove <name>` | 删除任务 | 永久移除 |
| `hermes cron status <name>` | 查看任务状态 | 最近运行、下次运行等 |

### 3.2 典型管理动作

```bash
# 查看全部任务
hermes cron list

# 立即跑一次 health-check，验证 prompt 是否靠谱
hermes cron run health-check

# 出差期间暂停周报
hermes cron pause weekly-blog

# 回来自动继续
hermes cron resume weekly-blog

# 改一下监控任务的时间
hermes cron edit health-check

# 不要的任务删掉
hermes cron remove old-job
```

::: tip 上线前先 run 一次
新任务创建后，强烈建议先 `hermes cron run <name>` 手动跑一遍。这能验证两件事：prompt 是否自包含（Agent 在新会话里能否独立完成）、结果投递是否正常。确认没问题再让它按计划跑，避免定时任务第一次执行就失败、你还不知情。
:::

管理命令同样支持 `-p <profile>` 指定作用目标，例如 `hermes -p ops cron list` 查看的是 `ops` Profile 的任务表。多 Profile 场景下先想清楚"我要管的是哪一份任务表"，再动手。

### 3.3 状态与暂停

- **暂停 ≠ 删除**：`pause` 只是停止调度，任务和配置都还在，`resume` 即可恢复，适合出差、维护期这类临时场景。
- **status 看运行轨迹**：`hermes cron status <name>` 能看任务最近一次运行、下次调度时间，是排查"它到底跑没跑"的第一入口。

## 四、任务持久化与输出

### 4.1 任务定义持久化

所有 cron 任务的定义保存在本机数据目录：

```text
~/.hermes/cron/jobs.json
```

任务列表、调度表达式、prompt、状态都存这里。

### 4.2 运行输出持久化

每次任务运行的输出保存在独立目录：

```text
~/.hermes/cron/output/
```

#### 4.3 重启保留

`jobs.json` 和 `output/` 都在磁盘上，**Hermes 重启后任务依然存在、依然按计划运行**。这也是 cron 能"7×24 值班"的前提——它不依赖某个还活着的会话。

::: tip 数据都在这，放心重启
cron 任务不挂在会话上，而是挂在磁盘上。升级 Hermes（`hermes update`）、重启电脑、重开终端，任务都会自动恢复。数据在 `~/.hermes/`，做备份时记得带上 `cron/` 目录。
:::

::: warning 排查任务"神秘消失"先看 jobs.json
如果任务不见了，先检查 `~/.hermes/cron/jobs.json` 是否被意外覆盖、数据目录权限是否正确。也确认你查的是**同一个 Profile** 的 cron——不同 Profile 的 cron 任务互相独立（见 Profiles 章节）。
:::

### 4.3 与 Profiles 的关系

每个 Profile 的 cron 任务列表是独立的。`coder` 的定时编码任务和 `ops` 的定时监控任务互不干扰，都各自存在各自的 `~/.hermes/`（或对应 Profile 数据目录）下。

## 五、结果投递

任务跑完了，结果怎么送到你手上？

### 5.1 投递到消息平台

cron 任务的输出可以投递到**任何已配置的消息平台**（Telegram、email 等）。你平时用 `hermes gateway` 接哪些平台，任务结果就能推到哪些平台：

```text
# 示例：把每天的监控结果推到 Telegram
/cron add "daily at 8am" "check all services and post the health report to my Telegram"
```

具体投递目标在 prompt 里用自然语言说明即可（"post to my Telegram"），Agent 会调用对应的平台工具完成投递。要让投递可用，前提是对应平台的网关/凭证已配置好。

::: warning 投递不通时先查网关
任务想推 Telegram，但 Telegram 网关没启动、token 没配，投递会失败——此时任务的**输出仍然落盘**，只是送不到你手上。所以给"值班类"任务配投递前，先手动 `cron run` 一次，确认投递通道是通的，再放行调度。
:::

![任务结果投递多平台](/images/hermes/cron/03-cron-delivery.png)

### 5.2 附加技能（--skill）

任务可以挂载技能，让 Agent 用"别人沉淀好的做法"执行任务：

```bash
# 用 blogwatcher 技能每周写博客摘要
hermes cron create "0 9 * * 1" "write this week's blog summary" --name weekly-blog --skill blogwatcher
```

技能是 Hermes 自进化体系里的"程序性记忆"（怎么做一件事的步骤），挂上技能相当于给任务配了一个"最佳实践手册"。

### 5.3 投递方式小结

| 投递方式 | 用法 | 适用场景 |
| --- | --- | --- |
| 直接写进 prompt | prompt 里说 "post result to my Telegram/email" | 最常见，配合已配置的网关 |
| 附加技能增强 | `--skill <name>` | 任务有固定套路时复用技能 |
| 落盘查看 | `~/.hermes/cron/output/` | 结果不需要推送，事后翻看 |

## 六、实战案例

### 6.1 每日报告

每天早 9 点，把昨天的工作汇总成日报，推到 Telegram：

```bash
hermes cron create "0 9 * * *" "review yesterday's commits and todos, write a one-page daily report, and post it to my Telegram" --name daily-report
```

### 6.2 夜间备份

每天凌晨 1 点做数据库备份并汇报结果：

```bash
hermes cron create "0 1 * * *" "backup the PostgreSQL database to /backups, verify the backup file size, and report the result" --name nightly-backup
```

### 6.3 周审计

每周一早上审计仓库，找出问题：

```bash
hermes cron create "0 10 * * 1" "audit the repo for uncommitted changes, failing tests, and outdated dependencies, then write a summary report" --name weekly-audit
```

### 6.4 监控摘要

每 2 小时检查一次服务健康并做摘要（自包含 prompt 的典型）：

```bash
hermes cron create "every 2h" "check the services running on localhost, report any that are down or returning errors, summarize the last 30 minutes of the app log" --name health-check
```

| 场景 | 调度 | 关键点 |
| --- | --- | --- |
| 每日报告 | `"0 9 * * *"` | 明确日期范围、投递目标 |
| 夜间备份 | `"0 1 * * *"` | 指定备份路径，要求验证结果 |
| 周审计 | `"0 10 * * 1"` | 写清楚审计范围 |
| 监控摘要 | `"every 2h"` | prompt 自包含，给目录给范围 |

### 6.5 组合玩法：cron × Profiles

cron 和 Profiles 是绝配：给每个角色各自配一套定时任务，运维 Profile 负责监控、写作 Profile 负责周报，各跑各的调度表，互不干扰。值班类任务还能把对应 Profile 的网关装成系统服务（见 Profiles 章节），让"定时任务 + 消息投递"一起 7×24 常驻。真正无人值守的自动化体系，往往就是 cron 与 Profiles 叠加出来的。

## 七、最佳实践与常见问题

### 7.1 最佳实践清单

1. **prompt 一律自包含**。新会话没有你的上下文，把目录、范围、产出、投递目标全部写进 prompt。
2. **上线前先 `cron run` 验证一次**。别让一个注定失败的 prompt 天天失败。
3. **给任务起有意义的 `--name`**。`health-check` 比 `job3` 好排查一百倍。
4. **临时停用用 `pause`，不要急着 `remove`**。
5. **投递结果要有"落盘兜底"**。即使投递平台出问题，`~/.hermes/cron/output/` 里也有记录。
6. **用自然语言调度，复杂规则再用 cron 表达式**。可读性优先。
7. **别忘了 Profile 隔离**。监控任务和编码任务分开建，别混在一个 Profile 里互相干扰。
8. **定期清理 output 目录**。每次运行都留输出，经年累月会攒下不少文件；定期归档或清理，别让磁盘悄悄占满。

### 7.2 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| 任务到点没跑 | `hermes cron list` 确认任务还在、状态非暂停；`hermes cron status <name>` 看下次调度时间；确认 Profile 对得上 |
| 任务跑了但结果不对 | prompt 多半不自包含——新会话没有上下文；重写 prompt，把必要信息全写进去 |
| 结果没投递到 Telegram/email | 确认对应平台网关已启动、凭证已配置；在 prompt 里明确写明投递目标 |
| 重启后任务还在吗 | 在。任务在 `~/.hermes/cron/jobs.json`，输出在 `~/.hermes/cron/output/`，不依赖会话存活 |
| 多个 Profile 的任务互相干扰 | 不会——每个 Profile 的 cron 独立；确保你在正确 Profile 下管理任务 |
| 想确认任务能跑通 | 手动 `hermes cron run <name>`，观察输出目录与投递结果 |

## 八、总结

Hermes 的 cron 定时任务把 Agent 从"被动应答"变成"定时自驱"：你只需定好调度和一段自包含的 prompt，到点它就在全新会话里独立完成任务，输出存进 `~/.hermes/cron/output/`、结果可投递到 Telegram/email 等平台，任务定义持久化在 `~/.hermes/cron/jobs.json`，重启不丢。掌握 `/cron add`、`hermes cron create` 到 list/edit/pause/resume/run/remove 全套管理命令，再配合 Profiles 的角色隔离，你就能搭出一套"无人值守、各司其职"的自动化体系。

核心记住一句话：**prompt 自包含是 cron 的第一原理**。写清楚、先验证、再放行，你的 Agent 就能在夜深人静时默默把活干完，把日报递到你手机上。
