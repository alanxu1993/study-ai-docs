# Hermes Agent 工具使用教程

装了 Hermes、能对话，和让它真正替你干活，是两回事。很多新手只会"聊天"，遇到要它上网查资料、改文件、跑脚本就无从下手——因为没有理解 Hermes 的**工具（Tools）系统**。Hermes 内置 70+ 个工具，分门别类覆盖网页、浏览器、终端、文件、代码、视觉、图像、委派、定时、记忆等能力。掌握工具系统，就是解锁 Agent 的"手"，让它从"会聊天的 AI"变成"能动手做事的 AI"。本章讲清工具集的组织方式与调用流程，并给出可复制的配置和实战用例。

## 一、工具系统核心概念

### 1.1 工具与工具集：从"一根手指"到"一双手"

Hermes 的工具不是零散堆在一起，而是按**工具集（toolsets）**组织。每个工具集围绕一类能力打包多个具体工具，就像工具箱里的抽屉：`web` 抽屉装搜索和提取，`terminal` 抽屉装 shell 命令，`file` 抽屉装文件读写。官方描述为 40+ 核心能力、70+ 内置工具，具体以官方文档为准。

![Hermes 的工具集分类](/images/hermes/tools/01-toolsets.png)

| 工具集 | 能力范围 | 典型用途 |
| --- | --- | --- |
| `web` | 网页搜索与内容提取 | 查资料、读文档、抓页面正文 |
| `browser` | 浏览器自动化 | 导航、点击、输入、截图 |
| `terminal` | 终端命令执行 | 跑 shell、装依赖、启服务 |
| `file` | 文件操作 | 读写、搜索项目文件 |
| `code_execution` | 代码执行与沙箱 | 跑 Python、数据分析 |
| `vision` | 视觉分析 | 读图、理解截图 |
| `image_gen` | 图像生成 | 生成配图与素材 |
| `delegation` | 任务委派 | 委派子代理并行执行 |
| `cronjob` | 定时任务 | 按计划运行 Agent 任务 |
| `memory` | 持久记忆 | 跨会话读写记忆 |

**为什么按工具集组织？** 它让"开关能力"可控——可整体启用或禁用某个工具集，而非逐个管理几百个工具；也让模型规划更清晰，只需判断"这件事走哪个抽屉"。

::: tip 类比理解
工具集像"能力开关"。抽屉全开最方便，但只想让 Agent 做纯对话总结这类轻活时，关掉重工具集能省上下文、更聚焦。
:::

### 1.2 工具调用流程：Agent 的"感知—决策—行动"循环

1. **接收任务**：你给出目标，例如"调研三款主流 AI 编码 Agent 的定价"。
2. **规划步骤**：模型判断需要哪些工具集——先 `web` 搜索，必要时 `browser` 打开页面。
3. **发起工具调用**：Agent 发出结构化请求（调哪个工具、传什么参数）。
4. **执行并返回结果**：工具真实执行（真搜索、真写文件），结果回传给模型。
5. **消化结果**：模型判断是否足够，不够则继续调用，够了则总结输出。

这五步循环执行直到任务完成。因为每一步工具结果都进入模型上下文，Hermes 要求模型至少支持 **64K tokens 上下文**——上下文太小，多轮工具调用的中间结果会把记忆撑爆。

![Agent 调用工具的循环](/images/hermes/tools/02-tool-loop.png)

::: warning 为什么是"循环"而不是"一步到位"？
真实任务很少一击命中：网页可能反爬、路径可能写错、命令可能缺依赖。Agent 靠"调用—看结果—再调用"的闭环自我纠错，这正是它比一次性提示词可靠的原因。
:::

## 二、核心工具集详解

- **web**：联网搜索与提取，过滤页面噪音，把有价值内容带回上下文。场景：查新闻、读文档、搜报错方案。
- **browser**：搜索摘要不够、必须真实操作网页时（登录查询、填表单、翻页）用它。支持 Browserbase、Camofox 或本地 Chromium，可导航、点击、输入、截图。
- **terminal**：直接执行 shell 命令。后端可在 `local`、`docker`、`ssh`、`singularity`、`modal`、`daytona` 间切换，`terminal.cwd` 控制起始目录。
- **file**：读写、搜索文件，批量整理目录，常与其他工具集配合（调研结果写进本地 `.md`）。
- **code_execution**：在沙箱里执行 Python 等代码看结果，适合数据分析、脚本验证，比裸终端命令更安全。
- **vision**：读取图片内容，识别截图报错、理解流程图；配合 `browser` 可对网页截图做视觉检查。
- **image_gen**：根据描述生成配图与示意素材。
- **delegation**：通过 `delegate_task` 把任务委派给子代理并行执行并回收结果，适合 fan-out 拆分长耗时任务。
- **cronjob**：内置调度器，按计划在新会话中运行任务。注意运行在新会话里，**prompt 必须自包含**。
- **memory**：读写跨会话记忆（add / replace / remove），是"Agent 越用越懂你"的基石。

::: tip 选择原则
纯查信息用 `web`，需真实操作页面才上 `browser`，跑代码用 `code_execution`，要改动本机状态才用 `terminal`。工具集越重，安全影响越大。
:::

## 三、工具配置与管理

### 3.1 启用 / 禁用工具集

```bash
hermes tools          # 打开工具配置，勾选/取消启用的工具集
```

关掉用不到的工具集（如 `image_gen`）能减少上下文开销、降低误用风险。修改后重启会话生效。

### 3.2 命令审批：给高风险操作设一道闸

覆盖文件、跑陌生脚本这类高风险操作，Hermes 支持**命令审批**：Agent 发起操作时先停下来，等你确认才执行。"放权"与"可控"兼得——低风险操作照常自动执行，高危操作必须你点头。

![命令审批与授权](/images/hermes/tools/03-tool-approval.png)

### 3.3 DM 配对：为消息网关设备授信

接入 Telegram、Discord 等消息网关后，给常用设备做 **DM 配对**，本质是设备级授权：只有配对的设备/账号能向 Agent 发指令，避免陌生账号驱动 Agent 执行危险操作。换机后重新配对即可。

### 3.4 调整终端后端

默认 `terminal` 走本机 `local` 后端。想要隔离或云端执行，用 `hermes config set` 切换：

```bash
hermes config set terminal.backend docker   # 命令在容器里执行，多一层隔离
hermes config set terminal.backend local    # 切回本机
```

## 四、实战案例：一次完整的"调研—整理—执行"任务

目标是：**调研 AI 编码 Agent 的价格，整理成表格文件，并用代码统计均价**。

**第一步：网页调研（web）**

```bash
hermes "调研 Claude Code、Codex、Hermes Agent 三款工具的最新订阅价格"
```

Agent 用 `web` 搜索官方定价页，把价格、额度带回上下文。

**第二步：整理成文件（file）**

```bash
hermes "把刚才的价格结果整理成 markdown 表格，写入 pricing.md"
```

Agent 调用 `file` 创建并写入 `pricing.md`。

**第三步：代码统计（code_execution）**

```bash
hermes "读取 pricing.md，用 Python 算出三款工具月费的均值，并说明每个方案"
```

Agent 调 `file` 读取，再调 `code_execution` 跑 Python 完成计算。这三步完全可以一个 prompt 一气呵成，让 Agent 自动编排工具链：

```bash
hermes "调研 Claude Code、Codex、Hermes Agent 的订阅价格，写入 pricing.md，
        再用 Python 算出月费均值，最后用中文给我一份对比总结"
```

::: tip 把复杂任务交给一个 prompt
工具链的魅力在于：Agent 会自动决定"先 web 再 file 再 code_execution"，你只管说清目标，规划交给它。
:::

## 五、工具安全

- **审批是信任边界**：按工具集信任——低风险工具集（web、vision、image_gen）可放开，涉及修改本机状态的（terminal、file 覆盖、delegation）建议保留审批，陌生仓库更要收紧。
- **沙箱与容器加固**：`code_execution` 在受限沙箱执行；容器化部署支持只读根文件系统、drop capabilities、PID 限制；把 `terminal.backend` 切到 docker/modal/daytona 可让命令在独立环境运行。
- **零遥测**：所有数据在本机 `~/.hermes/`，不会上传；但派到远程后端（Modal、Daytona、SSH）时数据会离开本机，敏感信息需评估。

::: danger 关键提醒：Profiles 不沙箱文件系统
Profiles（多实例）只隔离 Agent 状态（配置、记忆、会话），**不隔离文件系统访问**。默认 `local` 后端与你有相同的文件系统权限——依赖审批 + 隔离后端，而不是假设"多开个 profile 就安全了"。
:::

## 六、最佳实践与常见问题

### 6.1 最佳实践

1. **按任务选工具集，别全开**：不需要图像、委派时关掉对应工具集。
2. **高危操作保留审批**：覆盖文件、跑陌生脚本前让 Agent 先请示。
3. **敏感信息不进 prompt**：密钥、Token 走 `~/.hermes/.env`。
4. **跑不动就 `hermes doctor`**：工具异常先诊断，别反复试错浪费上下文。

### 6.2 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| 提示"工具不可用 / 未启用" | `hermes tools` 确认对应工具集已启用，重启会话生效 |
| 工具调用超时 | 任务跨多轮工具循环，检查模型上下文是否 ≥64K；拆小任务 |
| 命令审批迟迟不通过 | 审批需你在 TUI 里确认，检查是否错过了提示 |
| `code_execution` 报环境错 | 沙箱内可能缺依赖，改用 `terminal` 在可配置环境执行 |
| 浏览器自动化失败 | 检查 `browser` 后端（本地 Chromium 是否安装，或改用 Browserbase/Camofox） |
| 工具结果异常 | 先 `hermes doctor` 诊断，再按输出处理 |

::: warning 未知项以官方文档为准
Hermes 迭代很快，具体工具子命令、参数在不同版本可能有差异。本章命令为通用用法，精确参数请查阅官方文档（hermes-agent.nousresearch.com/docs/zh-Hans/）。
:::

## 七、总结

工具系统是 Hermes 从"聊天机器人"蜕变为"干活 Agent"的关键。你已掌握：工具按**工具集**组织（web、browser、terminal、file、code_execution、vision、image_gen、delegation、cronjob、memory 等），Agent 通过"规划→调用→看结果→再调用"的闭环自主完成任务；用 `hermes tools` 开关能力，用命令审批和 DM 配对把住安全关，按信任等级调整终端后端与沙箱策略。一次 prompt 就能驱动"搜索→写文件→算数据"的完整工具链。下一章我们聚焦**会话**——工具在一个会话里连续干活，理解会话机制才能让工具链跑得又稳又长。
