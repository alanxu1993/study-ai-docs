# Hermes Agent Profiles：多实例配置教程

一台机器同时跑多个 Hermes Agent，每个都有自己独立的配置、记忆、技能、cron 和网关——"写代码的 coder"和"盯服务器的 ops"互不干扰，一个跑在 Telegram 上的 bot 出问题不会连累你正在用的终端会话。这是很多 Hermes 重度用户都在用的姿势，而实现这一切的机制就是 **Profiles（多实例配置）**。

没有 Profiles 之前，想让 Hermes 同时扮演"码农助手"和"运维值班员"只有一个办法：多装几台机器，或者反复改配置、清了记忆再重建。Profiles 把"角色分离"变成了一条命令的事：`hermes profile create ops`，然后 `ops chat` 直接开聊。本章带你彻底搞懂 Profiles 是什么、怎么创建、怎么管理，以及它和"每个 profile 跑一个网关"背后的隔离边界到底在哪。

![多 profile 隔离](/images/hermes/profiles/01-profiles-isolation.png)

## 一、Profiles 核心概念

### 1.1 什么是 Profile（一句话懂）

**Profile 就是一份"完整的 Hermes 状态副本"**。每个 Profile 都拥有自己独立的 `config.yaml`、`.env`、`SOUL.md`、记忆、会话、技能、cron 任务和网关状态——它们共用同一个 `hermes` 程序，但各自的"人格、记忆、习惯"完全分开。

可以这样类比：Hermes 程序是"一台能跑多种程序的服务器"，而 Profile 是"服务器上的独立用户账户"。不同账户登录后看到完全不同的桌面、文件和个人设置，但底层是同一台机器、同一个系统。

### 1.2 核心价值（直击痛点）

为什么要花心思拆成多个 Profile？三个最实在的场景：

- **角色分离，互不污染**：`coder` 会话里让 Agent 积累的编码技能、项目记忆，不会流进 `ops` 的运维会话，反之亦然。记忆不串台，Agent 的表现更"专业"。
- **配置隔离，一处一处调**：`coder` 用强的编码模型、默认 local 后端；`ops` 用便宜模型跑 Telegram 网关；`writer` 指定 Docker 后端。一个 Profile 改了配置不影响另一个。
- **网关独立，故障不扩散**：每个 Profile 有独立的网关进程，一个跑 Telegram 的 Profile 抽风，不影响你另一个跑 Discord 或终端交互的 Profile。

### 1.3 隔离边界：状态隔离，文件系统不隔离

这是 Profiles 最重要的边界，也是新手最容易踩的坑：

| 被隔离 | 不被隔离 |
| --- | --- |
| `config.yaml` / `.env` 配置 | 文件系统访问权限 |
| `SOUL.md` 人格文件 | 工作目录里的文件 |
| 记忆（MEMORY.md / USER.md） | 网络、系统命令执行能力 |
| 会话历史 | —— |
| 技能（Skills） | —— |
| cron 任务列表 | —— |
| 网关状态与令牌 | —— |

Profiles **不是沙箱**：默认 `local` 终端后端下，每个 Profile 都以你当前的用户身份运行，和你拥有相同的文件系统读写权限。

::: warning Profiles 不提供安全隔离
Profiles 隔离的是"Hermes 的状态"（记忆、配置、会话），不是"进程的安全边界"。它不是沙箱，不能用来隔离不可信代码或不可信 prompt。真要做到安全隔离，靠的是 Docker/Modal 等隔离后端 + 命令审批策略，而不是拆 Profile。
:::

这也意味着：你完全可以（也应该）让两个 Profile 读写同一个项目目录——比如 `coder` 负责写代码，`reviewer` 负责审查，它们共享工作区但各记各的记忆。

## 二、创建 Profile

### 2.1 前置条件

- 已安装 Hermes 并至少跑通一次 `hermes`（详见快速入门与安装章节）。
- 想清楚这个 Profile 的**角色定位**：它主要干什么？用哪个模型？要不要接网关？角色越清晰，后面配置越省事。

### 2.2 四种创建方式

创建 Profile 的入口统一是 `hermes profile create`，按复制范围不同分四种：

```bash
# 1. 空 Profile，预载技能（最干净的起点）
hermes profile create coder

# 2. 复制当前 Profile 的配置 / skills / SOUL（不含记忆和会话）
hermes profile create coder2 --clone

# 3. 完整复制当前 Profile（配置、技能、SOUL、记忆、会话全带上）
hermes profile create coder-backup --clone-all

# 4. 从指定 Profile 复制
hermes profile create ops --clone-from coder
```

四种方式的复制范围对比：

| 命令 | 配置 | 技能 | SOUL | 记忆 | 会话 | 适用场景 |
| --- | --- | --- | --- | --- | --- | --- |
| `create <name>` | 无（默认值） | 预载 | 默认 | 无 | 无 | 从零起一个全新角色 |
| `--clone` | ✔ | ✔ | ✔ | ✘ | ✘ | 以现有角色为模板，但记忆/会话清零 |
| `--clone-all` | ✔ | ✔ | ✔ | ✔ | ✔ | 完整备份 / 复制一份一模一样的 |
| `--clone-from <src>` | ✔ | ✔ | ✔ | ✘ | ✘ | 从指定 Profile 复制，不限当前激活项 |

![从已有 profile 克隆](/images/hermes/profiles/03-profile-clone.png)

::: tip 何时该用 --clone 而非 --clone-all？
日常"复制一个角色出来改造"用 `--clone` 就够了——它带上配置、技能和人格，但**不给新 Profile 塞旧记忆**。想象你要给 coder 复制一个"专注前端的新分身"，你肯定不希望它一上来就带着后端项目的全部记忆。真正的 `--clone-all` 更适合做完整备份或迁移。
:::

### 2.3 创建后立即验证

```bash
# 列出所有 Profile，确认新的已出现
hermes profile list

# 直接切过去开聊
hermes profile use coder
hermes
```

创建完成后，每个 Profile 都会自动获得对应的命令别名（见下一节），无需额外注册。

## 三、使用 Profile

### 3.1 命令别名：不用再背参数

创建 Profile 后最省心的福利是**自动生成的命令别名**。`coder` Profile 创建完成，你就直接多了 `coder` 这个命令：

```bash
# 直接用别名进入 coder 的 TUI
coder chat

# 用别名操作 coder 的网关
coder gateway start
coder gateway status
```

习惯之后，"哪个 Profile 用哪条命令"一目了然，甚至可以不关心它背后是不是 Hermes。

### 3.2 通用方式：-p 参数

别名覆盖不了所有场景，这时候用通用参数显式指定 Profile：

```bash
# 一次性对话，指定 profile
hermes -p coder chat -q "帮我 review 一下 src/utils.ts"

# 等价的显式写法
hermes --profile=coder chat -q "帮我 review 一下 src/utils.ts"
```

`-p <name>` / `--profile=<name>` 可以拼在任何 Hermes 子命令前面：`hermes -p ops gateway start`、`hermes -p writer cron list` 都合法。这在不给 Profile 建别名的场景（比如脚本里）很有用。

### 3.3 设置默认 Profile

如果你想大部分时间都固定用某个 Profile，可以把它设成默认：

```bash
hermes profile use ops
```

之后不带 `-p` 直接跑 `hermes`，进入的就是 `ops`。

::: tip 类比理解
`hermes profile use <name>` 类似 `kubectl config use-context`：你把"当前上下文"切到某个配置，之后的命令都默认作用在这个上下文上。切来切去只影响"当前生效的是谁"，不改变任何 Profile 本身的内容。
:::

### 3.4 识别当前激活的 Profile

Hermes 的提示符会直接显示当前激活的 Profile，比如 `coder ❯`。跑 `hermes profile list` 也能看到哪个是当前项（通常带标记）。开多个会话时，先看提示符再操作，避免"我在 coder 里改 ops 的配置"这类错乱。

![profile 命令与别名](/images/hermes/profiles/02-profile-commands.png)

## 四、管理 Profile

### 4.1 管理命令总览

| 命令 | 作用 | 示例 |
| --- | --- | --- |
| `hermes profile list` | 列出所有 Profile，标注当前项 | `hermes profile list` |
| `hermes profile create <name>` | 创建新 Profile（见第二节） | `hermes profile create writer` |
| `hermes profile use <name>` | 切换默认 Profile | `hermes profile use coder` |
| `hermes profile show <name>` | 查看某个 Profile 的详情 | `hermes profile show ops` |
| `hermes profile alias <name> <alias>` | 给 Profile 自定义别名 | `hermes profile alias coder dev` |
| `hermes profile rename <old> <new>` | 重命名 Profile | `hermes profile rename coder2 frontend` |
| `hermes profile delete <name>` | 删除 Profile | `hermes profile delete coder-backup` |
| `hermes profile export <name>` | 导出 Profile 为文件 | `hermes profile export coder -o coder.zip` |
| `hermes profile import <file>` | 从文件导入 Profile | `hermes profile import coder.zip` |

### 4.2 export / import：备份与迁移

`export` / `import` 是 Profiles 的"随身行李"，适合两类场景：

- **备份**：把一个重要 Profile 导成文件，出问题随时 `import` 回来。
- **迁移**：换机器、搬到同事机器上时，导出再导入，配置、技能、SOUL 一次带走。

```bash
# 导出（可指定输出路径）
hermes profile export coder -o /path/to/coder-backup.zip

# 在另一台机器上导入
hermes profile import /path/to/coder-backup.zip
```

::: warning delete 不可逆
`hermes profile delete` 会删掉该 Profile 的配置、记忆、技能、cron 和网关状态。删除前如果里面有值得留的东西，先 `export` 备份。该命令没有"回收站"。
:::

### 4.3 管理小技巧

- **命名规范**：用"角色"而不是"设备/日期"命名（`coder`、`ops`、`writer`），因为别名会直接变成命令，越短越好记。
- **定期清理**：`--clone-all` 备份一旦不需要就删掉，Profile 太多会让 `list` 和默认切换都变乱。
- **区分 alias 与 rename**：`alias` 是加一个"外号"，原名保留；`rename` 是真正改名。

### 4.4 Profile 数据都在哪

每个 Profile 的数据都落在 Hermes 数据目录下自己的空间里（Linux/WSL 为 `~/.hermes/`，原生 Windows 为 `%LOCALAPPDATA%\hermes`），按 Profile 隔离存放：

| 数据 | 说明 |
| --- | --- |
| `config.yaml` / `.env` | 配置与密钥，互相独立 |
| `SOUL.md` | 该 Profile 的全局人格文件 |
| `memories/` | 持久记忆（MEMORY.md / USER.md） |
| 会话数据 | 会话历史，按 Profile 隔离 |
| `skills/` | 技能，按 Profile 隔离 |
| `cron/` | 定时任务定义与输出 |
| 网关状态 | 网关令牌与配对信息 |

搞不清某个配置、记忆属于哪个 Profile 时，先想"它落在哪个 Profile 的数据空间"，再回去用对应的 `hermes -p <name>` 操作。想完整搬走某个角色，除了 `export`，整体拷贝对应数据目录也可以。

## 五、网关与系统服务

### 5.1 每个 Profile 独立网关

网关（`hermes gateway`）负责把 Agent 接到 Telegram、Discord、Slack 等消息平台。每个 Profile 的网关是**独立进程、独立令牌**，互不共享：

```bash
# coder 的网关（假设它接了 Telegram）
coder gateway start

# ops 的网关（假设它接了 Discord）
hermes -p ops gateway start
```

这样"coder 的 Telegram bot 和 ops 的 Discord bot"就各自独立运行。一个网关崩了，重新拉起对应 Profile 的网关即可，不影响其他。

### 5.2 token-lock 防冲突

Hermes 用 **token-lock** 机制防止多个网关进程同时争抢同一个令牌/凭证。简单说：某个令牌一旦被一个网关进程占用，其他进程就不能再用它，避免两个 bot 用同一个 token 打架。

::: tip 实践提示
如果你的多个 Profile 要接同一个平台（比如都想用 Telegram），记得给每个 Profile 用**不同的 bot token**，并理解 token-lock 的意义：同 token 想开两个网关会冲突。不同 token、不同 Profile，才能同时在线。
:::

### 5.3 安装为系统服务

想让网关 7×24 常驻、开机自启，可以把 Profile 的网关装成系统服务：

- **Linux**：systemd 服务
- **macOS**：launchd 服务

```bash
# 概念示例（具体子命令/服务名以官方文档为准）
hermes -p ops gateway install --systemd     # Linux 装成 systemd 服务
hermes -p ops gateway install --launchd     # macOS 装成 launchd 服务
```

装成服务后，gateway 崩溃会被自动拉起、开机自启、日志进系统日志。这让"运维值班 Agent"真正像个小 daemon 一样常年在线。

::: warning 服务模式注意
- 系统服务里跑的是无人值守的 Agent，建议配合命令审批策略和更严格的提示词，避免误操作。
- Profiles 不隔离文件系统：服务里的 Profile 和你本机权限相同，别给它留下会乱改生产环境的余量。
- 具体 `install` 子命令与平台细节以官方文档为准。
:::

## 六、实战案例：coder + ops + writer 三足分工

用一个真实的分工来串起全部知识点：一台机器上，同时跑 `coder`、`ops`、`writer` 三个 Profile。

### 6.1 规划三个角色

| Profile | 角色 | 模型取向 | 后端 | 网关 |
| --- | --- | --- | --- | --- |
| `coder` | 编码助手 | 强的编码模型 | local | 无（终端用） |
| `ops` | 运维值班 | 便宜的通用模型 | local | Telegram（独立 token） |
| `writer` | 写作分身 | 通用模型 | docker（隔离） | 无（终端用） |

### 6.2 逐步搭建

```bash
# 1. 三个全新 Profile
hermes profile create coder
hermes profile create ops
hermes profile create writer

# 2. 给 ops 配 Telegram 网关 token（示例占位，以实际 token 为准）
hermes -p ops config set TELEGRAM_BOT_TOKEN 123456:xxxxx
hermes -p ops config set gateway.platforms telegram

# 3. writer 用隔离后端，避免直接碰本地文件
hermes -p writer config set terminal.backend docker

# 4. 各自设好模型
hermes -p coder config set model anthropic/claude-opus-4.6
hermes -p ops  config set model deepseek/deepseek-chat

# 5. 把 ops 网关装成系统服务，常驻值班
hermes -p ops gateway install --systemd
```

### 6.3 日常使用

```bash
# 终端里分开用
coder chat          # 写代码
writer chat         # 写文档

# ops 在 Telegram 上值班，你随时手机@它
# 需要一次性让 ops 干活时：
hermes -p ops chat -q "检查服务器负载并报告"
```

三个 Agent 各干各的、各记各的：coder 记住了你的代码库约定，writer 记着你的文风，ops 记着你的服务器清单——互不串台，共用一个项目目录也毫无压力。

::: tip 类比理解：一个工具箱，三个工位
Profiles 更像是"给同一套工具配了三个工位"：工具（Hermes 程序）是同一套，但每个工位各有自己顺手摆放的习惯（配置）、备忘录（记忆）和工作手册（技能）。人换到哪个工位坐下，桌面摆的还是自己那摊东西。这也解释了为什么 Profiles 隔离状态却不隔离文件系统——工位不同，但车间是同一个。
:::

## 七、最佳实践与常见问题

### 7.1 最佳实践清单

1. **一个角色一个 Profile，别塞多个身份**。Profile 的价值在于"状态纯净"，塞得太多又变回一个大杂烩。
2. **用 `--clone` 起步、按需再补配置**。新角色先用 `--clone` 复制现成的技能/人格，再改模型和 token，比从空 Profile 全手动配快得多。
3. **命名要能当命令用**。别名 = 命令，`coder`、`ops`、`writer` 这种短名词最顺手。
4. **网关 token 按 Profile 分开**。同 token 会被 token-lock 挡下，多 Profile 接同一平台务必用不同 token。
5. **定期 export 重要 Profile**。配置、技能、记忆都是心血，导出一份不占多少空间。
6. **牢记 Profiles 不沙箱**。需要安全隔离的任务，用 Docker/Modal 后端 + 审批策略，别指望拆 Profile 兜底。

### 7.2 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| 建了 Profile 但 `coder chat` 说找不到命令 | 确认 Profile 创建成功：`hermes profile list`；新开的终端里是否已生效（必要时 `source ~/.bashrc`） |
| `hermes` 进去发现不是我想要的 Profile | 检查当前默认：`hermes profile list`，用 `hermes profile use <name>` 切换 |
| 两个网关起不来 / 报令牌冲突 | 检查是否用了同一个 bot token——token-lock 会阻止同 token 的第二个网关；换成独立 token |
| 在错误的 Profile 里改了配置 | 看提示符（`coder ❯`）确认当前 Profile；用 `hermes -p <name> config set` 精确指定目标 |
| 想找回删除的 Profile | `delete` 不可逆。若无备份，只能重建；所以重要 Profile 先 `export` |
| 换机器后配置全没了 | 用 `export`/`import` 迁移；数据目录在 `~/.hermes/`，跨机器整体拷贝也可行 |

## 八、总结

Profiles 让"一台机器跑多个独立 Hermes Agent"从口号变成了日常操作：每个 Profile 拥有独立的配置、`.env`、`SOUL.md`、记忆、会话、技能、cron 和网关状态，用 `hermes profile create` 一键创建、`--clone`/`--clone-all`/`--clone-from` 控制复制范围、自动命令别名 + `-p` 参数 + `profile use` 三管齐下地使用、`export`/`import` 完成备份迁移。记住最关键的两条边界：**状态隔离、文件系统不隔离**——Profiles 是"角色分离"工具，不是"安全沙箱"。

掌握了 Profiles，你的 Hermes 就能同时扮演编码助手、运维值班员、写作分身，各司其职、互不干扰。下一步，可以学习 cron 定时任务，让这些 Profile 在你不盯着的时候自动干活。
