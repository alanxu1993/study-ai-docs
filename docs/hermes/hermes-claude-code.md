# Hermes Agent 接入 Claude Code 教程

> 来源：[Hermes Agent 官方文档](https://hermes-agent.nousresearch.com/docs/zh-Hans/) · [GitHub: NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

单一 Agent 打天下，总有够不着的地方。**Claude Code** 是交互式编码的行家里手——你在终端里盯着它改代码、逐行 review，体验无出其右；而 **Hermes Agent** 则擅长自主执行长尾任务——定时跑测试、守在 Telegram 里随时待命、把经验沉淀成技能。两者并非二选一，而是**互补拼图**：让 Claude Code 负责"和人高频交互的编码"，让 Hermes 负责"不需要人盯的自主脏活"。本章给出三种接入方式和完整实战组合。

## 一、组合模式：各取所长

### 1.1 为什么要组合（一句话懂）

两个 Agent 各有一项别人替代不了的长板：

| 能力维度 | Claude Code | Hermes Agent |
| --- | --- | --- |
| 强项 | **交互式编码**：逐行改码、即时反馈、精准编辑 | **自主长尾任务**：定时、后台、消息平台待命 |
| 交互形态 | 终端内、以人为中心、一次会话到底 | TUI + 消息网关（Telegram/Discord 等 22 平台） |
| 自主能力 | 偏"配合人" | 偏"放养式"：cron、后台任务、自进化技能 |
| 经验沉淀 | 内存/CLAUDE.md 约定 | 自动沉淀 Skills + 持久记忆 |

简单说：**需要你实时参与、来回确认的细活交给 Claude Code；可以全自动、跑腿、定时重复的粗活丢给 Hermes。**

### 1.2 组合后的效果

一套典型的工作流可能是：白天你开着 Claude Code 写功能；下班前把"今晚每 2 小时跑一次测试，有失败就发 Telegram 通知"丢给 Hermes；第二天早上 Claude Code 直接处理 Hermes 汇总的失败清单。**一个负责"产出"，一个负责"盯梢"，各干各擅长的。**

![双 Agent 协同](/images/hermes/claude-code/01-cooperation.png)

## 二、接入方式一：通过 MCP 连接、共享上下文

### 2.1 思路

让两个 Agent 通过 **MCP（Model Context Protocol）** 共享工具与上下文：一方把能力暴露为标准 MCP 工具，另一方直接调用。这样 Claude Code 可以在会话里"借用"Hermes 的工具集（terminal、cron、网关等），Hermes 也能读取 Claude Code 的工作状态。

### 2.2 配置示意

以在 Claude Code 中挂载 Hermes 提供的 MCP 能力为例，Claude Code 侧使用标准的 `claude mcp add` 命令或 `.mcp.json` 配置：

```bash
claude mcp add hermes -- sse http://localhost:PORT/mcp
```

Hermes 侧的 MCP 服务器地址、认证方式等接入参数以官方文档为准，配置好后重启 Claude Code 会话即可加载 `hermes_*` 工具。

::: tip 什么时候走 MCP
适合"希望把 Hermes 的工具能力直接揉进 Claude Code 会话"的场景——例如你在 Claude Code 里修代码时，顺手让它调度 Hermes 的 cron 去安排一条定时任务。MCP 是三者里耦合最紧的方式。
:::

## 三、接入方式二：子代理互调

### 3.1 Claude Code 调用 Hermes

Claude Code 把 Hermes 当"外包工人"派活，最轻量的是走 Hermes 的一次性对话接口 `hermes chat -q`：

```bash
# 在 Claude Code 的会话里，通过终端让 Hermes 处理一个长尾任务
hermes chat -q "分析 ~/logs/app.log 里的错误日志，把高频报错按次数排序输出"
```

Claude Code 把结果接回来继续自己的编码工作。也可以用 task 工具把这类命令封装为可复用的子任务，让 Hermes 在独立上下文里跑长任务而不挤占 Claude Code 的上下文窗口。

### 3.2 Hermes 调用 Claude Code

反向也可以：Hermes 通过 `terminal` 工具调用本机的 `claude` CLI，把"交互式编码"这类更擅长的工作丢给 Claude Code 完成，再回收结果继续自己的流程。两者互为子代理，谁擅长谁上。

```text
（在 Hermes 会话里）
请调用 claude 帮我重构 src/utils.py 里的重复逻辑，然后把 diff 摘要给我。
```

### 3.3 与 Hermes 子代理体系的关系

Hermes 内部本就有 `delegate_task` 子代理委派机制（并行 fan-out、结果回收）；把 Claude Code 当作"外部子代理"接入，相当于把委派范围扩到了另一个 Agent 生态，思路完全一致。

![接入集成架构](/images/hermes/claude-code/02-integration.png)

## 四、接入方式三：消息网关触发

### 4.1 思路

Hermes 最强的杀手锏是**消息网关**：同一个 Agent 跑在 Telegram、Discord、Slack、WhatsApp 等 22 个平台/版本上。你可以**在手机消息里指挥 Hermes 操作代码库**——路上发一条 Telegram 消息，Hermes 就在服务器上完成部署/测试/巡检，把结果推回给你。

### 4.2 配置

```bash
# 启动消息网关（以 Telegram 为例）
hermes gateway

# 会话内 / 配置中启用网关相关工具，并按需设置命令审批
hermes tools
```

网关模式下支持**命令审批与 DM 配对**：首条消息确认你的身份、敏感命令请求确认，避免"人人都能遥控 Agent 操作生产库"。

### 4.3 触发示例

在 Telegram 里给 Hermes 发：

```text
检查一下 staging 环境健康度，然后把报告发给我。
```

Hermes 通过 terminal/浏览器执行检查 → 汇总 → 把报告推回 Telegram。**你不需要坐在电脑前，代码库随时可以被遥控。**

::: warning 网关权限务必收紧
消息网关把"操作代码库的能力"搬到了手机上，等于把 Agent 的入口对接到外部平台。**务必开启 DM 配对确认身份**，并对高危命令保持审批，防止消息平台账号被盗后连带控制服务器。
:::

## 五、配置细节与权限

| 维度 | 建议 |
| --- | --- |
| 模型 | 两侧都选支持 64K+ 上下文的模型，长链路协作才不"失忆" |
| 审批 | Hermes 侧对部署、删除、写生产库的命令保持审批；Claude Code 侧按项目权限规则收敛 |
| 配置文件 | Hermes 用 `~/.hermes/config.yaml` + `.env`；Claude Code 用自身的设置与权限规则，互不干扰 |
| 多实例 | 需要多套互不影响的 Hermes 时用 Profiles 隔离状态（注意：不隔离文件系统） |
| 凭证 | 两侧 API 密钥分开管理，不要写进随仓库分发的文件 |

## 六、实战案例：Claude Code 写代码 + Hermes 跑定时测试

### 6.1 场景

你在 Claude Code 里开发一个 Web 服务，验收标准是"合代码后持续跑测试、有回归就通知"。人工盯守不现实，组合方案如下：

**步骤 1：Claude Code 写代码与测试。** 正常交互式开发，把功能、单测写好、提交。

**步骤 2：Hermes 建定时测试任务。** 在 Hermes 里创建一个 cron 任务：

```text
（在 Hermes 会话内）
/cron add "0 */2 * * *" "运行 cd ~/myapp && pytest，若失败则通过 Telegram 发送失败摘要给 @me"
```

或走 CLI：

```bash
hermes cron create "every 2h" "运行 ~/myapp 的测试套件并汇报结果" --name nightly-test
```

**步骤 3：Hermes 自动盯梢。** 到点后 Hermes 在新会话中拉取最新代码、跑测试、失败则投递到 Telegram/email。

**步骤 4：Claude Code 处理回归。** 次日打开 Claude Code，按 Hermes 推送的失败摘要定位并修复——"盯梢"和"修复"各自由最合适的 Agent 承担。

### 6.2 为什么这么分工

- 编码的**实时性、确认感**需要人——这是 Claude Code 的主场；
- 测试的**重复性、定时性、跨平台投递**不需要人——这是 Hermes cron + 网关的主场；
- 两者通过"消息"衔接（cron 结果推给 Telegram），Hermes 的经验沉淀（Skills）会让这类巡检越跑越顺。

## 七、最佳实践与常见问题

### 7.1 最佳实践

1. **按"是否需要人"分工**：要你实时参与的给 Claude Code，全自动/定时/消息平台场景给 Hermes；
2. **连接越松越好**：能用 `hermes chat -q` 一次性调用解决的，不必上 MCP 硬耦合；
3. **网关权限收紧**：DM 配对 + 高危命令审批，遥控能力要配安全锁；
4. **上下文各自独立**：长任务放 Hermes 独立上下文，别挤占 Claude Code 的窗口；
5. **凭证分离管理**：两侧密钥分开，敏感项不进仓库。

### 7.2 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| MCP 工具加载不出来 | ① 确认 Hermes MCP 服务已启动且地址正确；② 重启 Claude Code 会话；③ 接入参数以官方文档核对 |
| `hermes chat -q` 返回慢/被截断 | 长任务改在 Hermes 独立会话跑，用 `--continue` 恢复、再取结果 |
| 网关收不到消息 | ① `hermes gateway` 是否在跑；② 检查平台 bot token 与 DM 配对状态 |
| cron 任务没跑 | ① `hermes cron list` / `status` 检查调度；② 确认任务 prompt 自包含（cron 在新会话中运行） |
| 双 Agent 上下文"打架" | 保持各自独立上下文，只通过结果/消息传递，不共享长对话 |

## 总结

Claude Code 与 Hermes 是天然互补的组合：一个擅长**需要人实时参与的交互式编码**，一个擅长**自主的长尾任务与消息平台接入**。三种接入方式——MCP 共享上下文（紧耦合）、子代理互调（轻量外包）、消息网关触发（手机遥控）——覆盖了从"深度协作"到"遥控运维"的全谱系需求。落地时记住：**按需选接入方式、网关权限收紧、上下文各自独立**，你就拥有了一个"白天有人陪写代码、夜里有人替盯梢"的完整双 Agent 工作流。
