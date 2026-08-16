# Hermes Agent 配置教程

装好 Hermes 只是开始，真正决定它"聪不聪明、听不听话"的是配置。很多人困惑的点是：密钥放哪、模型怎么换、命令跑在本机还是 Docker、为什么配置了不生效。Hermes 的配置体系其实很清晰——**一份 `.env` 管密钥/Token，一份 `config.yaml` 管设置，两者职责分离**。这章带你从存储位置、模型提供商、Nous Portal 一键配置、setup 向导、终端后端到会话内切换，把配置一次性讲透。

## 一、配置存储

### 1.1 两份文件，各管各的

Hermes 的配置集中在 `~/.hermes/` 目录下，数据也在其中（Windows 原生为 `%LOCALAPPDATA%\hermes`）：

| 文件 | 内容 | 是否含敏感信息 |
| --- | --- | --- |
| `~/.hermes/.env` | 密钥 / Token（如 API Key） | 是，务必保密 |
| `~/.hermes/config.yaml` | 普通设置（模型、后端、工具等） | 否 |

![配置文件与密钥分离](/images/hermes/config/01-config-files.png)

::: tip 为什么强制分离
把密钥和普通设置分开，是为了让你能安全地分享 `config.yaml`（比如放到团队里统一配置），而 `.env` 永远留在本机。不要把 API Key 写进 config.yaml，也不要提交 `.env` 到 Git。

### 1.2 推荐的配置方式：`hermes config set`

官方推荐用 CLI 而不是手改文件，因为它会自动把配置项归类到正确位置，还能校验值：

```bash
hermes config set model anthropic/claude-opus-4.6
hermes config set terminal.backend docker
hermes config set OPENROUTER_API_KEY sk-or-...
```

用 `hermes config set` 设置的键名即配置项路径，**字母型的键（如 `model`）进 config.yaml，包含 `_API_KEY` 的键自动进 .env**，无需自己判断文件。

::: warning 手改文件的坑
直接手改 config.yaml 时，格式错误、缩进不对、键名拼错都不会在保存时报错，而是静默不生效。能用 `hermes config set` 就用它；手改后务必重启会话再用 `hermes doctor` 验证。

## 二、模型与提供商

### 2.1 提供商无关，随你挑

Hermes 是提供商无关的，支持 15+ 家提供商。最常用的一批：

| 提供商 | 特点 | 适合 |
| --- | --- | --- |
| Nous Portal | 官方平台，一键配置（见第三节），含 Tool Gateway | Hermes 新手、官方生态 |
| OpenRouter | 一个 Key 聚合多家模型 | 想随意切换模型的人 |
| Anthropic | Claude 系列，长上下文、工具调用强 | 复杂任务、编码 |
| OpenAI | GPT 系列 | 通用场景 |
| DeepSeek | 中文友好、价格低 | 中文场景、成本敏感 |
| 本地模型 | 完全离线、零遥测 | 隐私敏感、离线使用 |

### 2.2 用 `hermes model` 选择

```bash
hermes model
```

会引导你选择提供商与具体模型，选完自动写入配置。

![多提供商模型切换](/images/hermes/config/02-model-switch.png)

### 2.3 64K 上下文红线

Hermes 多步工具调用需要"工作记忆"，因此**模型必须支持至少 64K tokens 上下文**。这是配置时最容易踩的坑：选了上下文太短的模型，长任务做一半就"失忆"。

::: danger 64K 是硬性要求
上下文不足 64K 的模型不建议用于 Hermes 的多步任务。本地模型运行时请设置 `--ctx-size 65536`，并确认所选量化版支持该窗口长度。

## 三、Nous Portal 一键配置

如果你不想手动配 Key，Nous Portal 提供一条龙服务。执行：

```bash
hermes setup --portal
```

命令会打开浏览器完成 **OAuth 登录**，之后自动完成三件事：

| 自动配置项 | 说明 |
| --- | --- |
| provider | 设为 Nous Portal |
| model | 选中合适的默认模型 |
| Tool Gateway | 打通工具网关，工具调用开箱即用 |

配置完成后可用下面的命令验证：

```bash
hermes portal info   # 显示 Portal 连接状态与信息
```

::: tip 为什么推荐先用 Portal
一条命令跳过手动填 Key、选模型、配网关的繁琐流程，是最快的"零摩擦上手"路径。熟练后再按需切换到 OpenRouter 等多提供商。

## 四、setup 向导

除了 `--portal`，`hermes setup` 提供三种起步方式：

| 选项 | 行为 | 适合 |
| --- | --- | --- |
| Quick Setup | 快速接入 Nous Portal，一步到位 | 新手、想马上开跑 |
| Full Setup | 手动逐步配置提供商、工具、后端 | 想完全掌控每项设置 |
| Blank Slate | 跳过设置，全部留空自己配 | 高级用户、要写自己的配置 |

```bash
hermes setup   # 进入向导，选择上述任一模式
```

## 五、终端后端配置

Hermes 执行终端命令的运行环境由**后端（backend）**决定，共 6 种：

| 后端 | 说明 | 适合场景 |
| --- | --- | --- |
| `local`（默认） | 在本机直接执行 | 个人日常使用 |
| `docker` | 在容器中执行 | 隔离环境、团队统一 |
| `ssh` | 在远程服务器执行 | 操作远端机器 |
| `singularity` | 在高性能计算环境执行 | HPC 场景 |
| `modal` | serverless 云端，支持持久化与休眠 | 按需弹性算力 |
| `daytona` | serverless 云端，支持持久化与休眠 | 云端开发环境 |

配置命令：

```bash
hermes config set terminal.backend docker   # 切到 Docker
hermes config set terminal.cwd /app         # 设置命令起始目录
```

`terminal.cwd` 控制每条命令的起始工作目录，默认是当前目录，可按项目固定到统一目录。

::: warning Profiles 不提供文件系统沙箱
默认 `local` 后端的 Agent 与你拥有**相同的文件系统访问权限**，Profiles 只隔离配置与状态，**不隔离文件系统**。处理不可信项目时，改用 docker 等隔离后端，别依赖默认后端兜底。

## 六、会话内配置

大多数配置改了要重启会话才生效，但**模型可以在会话内随时切换**：

```text
hermes ❯ /model deepseek/deepseek-chat
```

::: tip 什么适合会话内切模型
编码、分析类任务与预算敏感时切换模型最有用：日常问答用便宜模型，复杂重构切回旗舰模型，全程不用退出会话。注意同样满足 64K 上下文要求。

## 七、最佳实践与常见问题

### 7.1 最佳实践

1. **用 `hermes config set`，别手改文件**：自动归类、自动校验，避免静默不生效。
2. **密钥只进 `.env`**：API Key 永不放 config.yaml、不提交 Git。
3. **选模型先看上下文**：64K 是底线，长任务宁可用贵一点的旗舰模型。
4. **后端按信任程度选**：本机代码用 `local`，陌生/不可信项目用 `docker`。
5. **团队共享用 config.yaml**：模型、后端等普通设置入库，密钥留在个人 `.env`。

### 7.2 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| 模型响应异常 / 频繁截断 | 确认模型支持 ≥64K 上下文；检查 `hermes config set model` 的写法是否含提供商前缀（如 `anthropic/...`） |
| 改了 config 不生效 | 确认用对命令/文件；`hermes config set` 自动归类，手改则检查缩进与键名；重启会话再验证 |
| 切换后端后命令报错 | 检查 docker 是否已启动、SSH 密钥是否就绪；`terminal.cwd` 路径是否存在 |
| Nous Portal 登录失败 | 重新执行 `hermes setup --portal`；用 `hermes portal info` 验证连接 |
| `OPENROUTER_API_KEY` 不生效 | 确认键名完整且已写入 `.env`（`hermes config set` 会自动处理）；重启会话 |

## 总结

这章打通了 Hermes 的配置全链路：`.env` 管密钥、`config.yaml` 管设置的分离体系，`hermes config set` 的推荐用法，15+ 提供商与 64K 上下文红线，`hermes setup --portal` 的一键配置，6 种终端后端的选择，以及会话内 `/model` 的即时切换。配置的本质是回答三个问题——**用哪个模型、跑在哪、谁有权限**——想清楚这三点，Hermes 就能按照你的方式稳定工作。
