# Hermes Agent 代码工具使用教程

> 来源：[Hermes Agent 官方文档](https://hermes-agent.nousresearch.com/docs/zh-Hans/) · [GitHub: NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

一个只会聊天、不会动手的 Agent，价值大打折扣。Hermes Agent 的价值正在于它是**能真正干活的 Agent**：写 Python 跑数据分析、批量重命名几百个文件、在仓库里搜代码、执行 shell 完成部署——你只需说一句自然语言，它自己拆解成"执行代码 → 操作文件 → 跑终端命令"的组合拳。本章吃透 Hermes 的三套代码工具（`code_execution`、`file`、`terminal`），从概念、实战到安全隔离，一次讲清。

## 一、code_execution 工具集：代码执行与沙箱

### 1.1 什么是 code_execution（一句话懂）

`code_execution` 工具集负责**执行 Python 代码**。类比理解：它像给 Agent 装了"随身 Jupyter 内核"——你不用自己开终端、装依赖、写脚本，Hermes 会基于对话目标自动生成 Python，在隔离环境运行，把结果（stdout、stderr、返回值、生成文件等）回传给自己继续推理。

它在三种情况下特别好用：

| 场景 | 为什么用代码执行而不是别的 |
| --- | --- |
| 数据计算 | 聚合、统计、格式转换，Python 比 shell 表达力强 |
| 算法/逻辑验证 | 写一段算法跑通再落地，比凭空推理可靠 |
| 生成文件/图表 | 直接输出 CSV、JSON、图表文件，随后交给 `file` 工具落盘 |

### 1.2 沙箱与运行结果回传

`code_execution` 的 Python 代码运行在**沙箱环境**中：Hermes 为每次执行搭建隔离的运行容器，避免临时脚本污染宿主。运行结束后，stdout、stderr、返回值及生成的文件都会**流式回传**给 Agent，Hermes 依据结果决定下一步动作。

例如你让 Hermes 算一批数字：

```text
帮我统计 1 到 100 之间能被 7 整除的数之和。
```

Hermes 会生成一段 Python、执行、把结果回传并给出答案，全程无需你开终端。

### 1.3 启用与配置

代码执行工具属于工具系统的一部分，启用状态用 `hermes tools` 管理：

```bash
hermes tools
```

在这个交互界面里，你可以勾选 / 取消 `code_execution` 等工具集。如果你的模型上下文较小，建议优先保证 `code_execution`、`terminal`、`file` 这三个"干活核心"处于启用状态。

::: warning 模型上下文门槛
Hermes 的模型需至少支持 **64K tokens 上下文**——多步工具调用（执行代码 → 看结果 → 改代码再跑）需要"工作记忆"。本地运行时用 `hermes config set` 或 CLI 参数设置 `--ctx-size 65536`，否则长任务容易中途失忆。
:::

## 二、file 工具集：读写、搜索、结构化操作

### 2.1 读写与搜索

`file` 工具集让 Agent 像你一样浏览和处理文件系统，典型操作：

- **读写**：读取配置文件、修改某个源码文件、新建 `.md` / `.py` / `.json` 文档；
- **搜索**：在目录里按文件名或内容关键词搜索，定位"这段逻辑写在哪"。

实际对话示意：

```text
在 ~/project/src 里搜一下所有出现 "TODO" 的文件，并把它们列出来。
```

Hermes 会调用 `file` 工具集的搜索能力递归扫描，返回带路径的匹配清单。

### 2.2 结构化操作

相比简单读写，`file` 的进阶价值在**结构化操作**：对 JSON、YAML、Markdown 这类有结构的文件做**局部修改**而非整文件覆盖——只更新 YAML 的某个键、往 JSON 数组追加一项、在 Markdown 某小节插入内容。既精准又安全，避免误改无关内容。

### 2.3 三套工具集的定位对比

| 工具集 | 职责 | 典型动作 | 适合的场景 |
| --- | --- | --- | --- |
| `code_execution` | 运行 Python 代码 | 执行代码、计算、生成结果 | 数据分析、算法验证、脚本化产出 |
| `file` | 操作文件系统 | 读、写、搜索、结构化修改 | 改配置、查代码、批量整理文件 |
| `terminal` | 运行 shell 命令 | 执行命令、管道、装依赖 | 构建、部署、系统管理 |

![代码执行沙箱](/images/hermes/code-tools/01-code-exec.png)

## 三、terminal 工具集：shell 命令与终端后端

### 3.1 shell 命令

`terminal` 工具集让 Hermes 直接**运行 shell 命令**——`git`、`npm`、`pip`、`docker`、`make`，你能在终端里干的它都能干：clone 仓库、装依赖、跑测试、构建、部署。

```text
请克隆 myorg/myapp 仓库，执行 npm install，然后跑一遍测试并把失败的用例列出来。
```

Hermes 会依次调用 `terminal` 执行 `git clone`、`npm install`、`npm test`，根据每步输出决定下一步。

### 3.2 终端后端（6 种）

`terminal` 的执行环境**不是只能在本机跑**，Hermes 提供 6 种终端后端，用 `terminal.backend` 配置：

| 后端 | 运行位置 | 适合场景 |
| --- | --- | --- |
| `local`（默认） | 本机 | 日常开发，直接操作当前文件系统 |
| `docker` | Docker 容器 | 隔离、可复现、环境干净 |
| `ssh` | 远程服务器 | 管理远端机器、部署 |
| `singularity` | 容器（HPC 常用） | 超算/科研环境 |
| `modal` | Serverless 云端 | 无服务器持久化、弹性扩缩 |
| `daytona` | Serverless 云端 | 云端开发环境，休眠省成本 |

```bash
# 切换到 Docker 后端，命令在容器里跑
hermes config set terminal.backend docker

# 控制命令的起始目录（避免误跑在错误路径）
hermes config set terminal.cwd ~/project
```

::: tip 为什么要有这么多后端？
同一套 Hermes，可以"本机写代码、Docker 验证、SSH 部署、Modal 跑重活"——代码逻辑不变，只是换个执行环境。Modal/Daytona 这类 serverless 后端还提供**持久化与休眠**，跑完即睡、唤醒再用，适合重计算任务。
:::

## 四、实战案例

### 4.1 场景一：数据分析脚本

让 Hermes 完成一次完整的数据分析，三套工具自然协同：

```text
读一下 ~/data/sales.csv，按月份统计销售额，画一张折线图保存为 sales_trend.png，并总结趋势。
```

执行链路通常是：`file` 读取 CSV → `code_execution` 用 pandas 统计并画图 → `file` 写出图片和总结文件。一次对话，从原始数据到成品图全自动。

### 4.2 场景二：批量文件重命名

```text
把 ~/photos 目录下所有 "IMG_*.jpg" 按拍摄日期重命名为 "2026-08-10-序号.jpg"。
```

Hermes 会先用 `file` 工具扫描目录、提取每张图的信息，再用 `code_execution` 生成重命名脚本，最后执行并回传结果清单。几百个文件手动改可能要半小时，这里只需一句话。

### 4.3 场景三：代码调试辅助

```text
跑一下 test/test_api.py，报错的话帮我定位原因并给出修复建议。
```

Hermes 用 `terminal` 跑测试 → 读到报错栈 → 用 `file` 打开相关源码 → 定位问题点 → 给出（甚至直接应用）修复。**调试不再是"贴报错 + 等回答"，而是 Agent 自己复现、自己查、自己改的闭环。**

![终端与文件协作](/images/hermes/code-tools/02-terminal-file.png)

## 五、安全与隔离

代码执行能力是把双刃剑——能跑你的代码，就意味着能碰你的机器。Hermes 为此做了多层防护。

### 5.1 容器加固

对于需要隔离的执行环境，Hermes 采用**容器加固**策略，典型手段：

| 加固项 | 作用 |
| --- | --- |
| 只读根文件系统（read-only root） | 容器内系统分区不可写，恶意/误操作改不动系统 |
| drop capabilities | 剥离容器默认的 Linux 能力（capabilities），降低提权风险 |
| PID 限制 | 限制容器内进程数量，防止 fork 炸弹式资源耗尽 |

这意味着即使某次执行跑了可疑代码，它也被关在加固过的"笼子"里，难以越狱影响宿主。

### 5.2 命令审批

Hermes 内置**命令审批**机制：敏感操作（涉及系统级命令、危险 shell 命令等）执行前会请求你确认。你可以在 `hermes tools` 或配置中管理审批策略，把高危命令设为必须确认，把安全命令放行。

### 5.3 最大的坑：Profiles 不沙箱

::: danger 必须记住
**Profiles（多实例配置）只隔离 Hermes 的状态（配置、记忆、会话），不隔离文件系统访问。** 默认 `local` 后端下，Agent 与你的用户有**相同的文件系统访问权限**——你以为开了个"独立 Agent"就安全了？它照样能读你 `~/.ssh`、`/etc` 里的文件。真正要隔离，请用 `docker`、`ssh` 等远端后端或容器加固。
:::

## 六、最佳实践与常见问题

### 6.1 最佳实践

1. **明确执行环境**：要可复现、不污染本机，就显式 `hermes config set terminal.backend docker`，别默认 local 跑到底；
2. **依赖先装再跑**：让 Hermes 先执行 `pip install` / `npm install` 再跑业务脚本，避免"找不到模块"连环报错；
3. **给足上下文**：长任务确保模型支持 64K+ 上下文，必要时加大 `--ctx-size`；
4. **敏感路径慎放权**：`file` 读写范围默认很宽，避免让 Agent 操作生产目录；
5. **审批别全关**：高危命令保持审批，跑通后再按需放宽。

### 6.2 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| 代码执行报"找不到依赖" | 先单独装依赖；注意依赖要装到 `code_execution` 的执行环境里 |
| terminal 跑错目录 | 检查 `terminal.cwd` 是否指向期望的起始目录 |
| Docker 隔离不生效 | ① 确认 `terminal.backend` 已设为 `docker`；② 确认本机 Docker 可用（`docker ps`） |
| Agent 改错文件 | 检查 local 后端下的高权限操作，生产目录改用受限权限或远端后端 |
| 工具未启用 | 运行 `hermes tools` 检查三个工具集是否勾选 |
| 长任务中途"失忆" | 模型上下文不足，改用 64K+ 上下文模型或加大 `--ctx-size` |

## 总结

Hermes 的代码能力由 `code_execution`（执行 Python、沙箱隔离）、`file`（读写、搜索、结构化操作）、`terminal`（shell 命令、6 种终端后端）三套工具集组成，配合起来就是一台"能算、能改、能部署"的自动化工作站。记住三个要点：**用 `terminal.backend` 选择执行环境、用容器加固 + 命令审批兜底安全、时刻警惕 Profiles 不隔离文件系统**。把这三套工具用熟，Hermes 就从"聊天机器人"升级成真正替你写代码、跑任务、管文件的数字员工。
