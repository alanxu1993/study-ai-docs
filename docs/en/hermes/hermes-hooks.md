# Hermes Agent Hooks 钩子教程

你希望 Hermes 每次启动会话时自动加载环境变量、每次执行工具前自动检查命令白名单、每次工具调用后自动记录日志……这些"在特定时间点自动执行"的需求，靠给 Agent 口头叮嘱是记不住的——它们是确定性逻辑，应该由框架本身在**生命周期事件**发生时执行。这就是 Hooks 钩子。

Hooks 是一种"事件 → 动作"的挂载机制：当会话启动、工具调用前/后等事件发生时，自动触发你预定义的一段逻辑，不需要 Agent 每次都"记得"去做。本章讲清楚 Hooks 的思想来源、在哪里配置、有哪些常见事件，以及两个能立刻上手的实战案例。

## 一、Hooks 核心概念

### 1.1 与 Claude Code / Codex Hooks 同源的思想

![Hooks 生命周期事件](/images/hermes/hooks/01-hook-events.png)

如果你用过 Claude Code 或 Codex 的 hooks，会发现 Hermes 的思路非常熟悉：**把 Agent 的"生命周期"剖成一个个可观测的事件节点，在这些节点上插入确定性的旁路逻辑**。这类"生命周期钩子"思想源于 shell 的 trap、Git 的 hooks——Agent 工具把这一模式引入了 AI 编程领域，Hermes 沿用了同一思想，并落到自己的配置体系里。

| 工具 | Hooks 事件来源 | 典型用途 |
| --- | --- | --- |
| Hermes Agent | 会话启动、工具调用等 | 环境加载、调用前后校验、审计日志 |
| Claude Code | SessionStart、PreToolUse 等 | 环境准备、安全校验、审计日志 |
| Codex | 工具调用、消息周期等 | 策略注入、拦截检查 |

### 1.2 为什么要用 Hooks

- **确定性**：Agent 可能"忘"，钩子不会。只要事件发生，动作必然执行。
- **一致性**：环境加载、安全校验这类事应当每会话都发生，交给钩子保证，而不是依赖某次提醒。
- **可审计**：把关键操作记录下来，满足安全与合规需求，出问题时也有据可查。

## 二、配置位置与结构

### 2.1 配置在哪里

Hooks 配置在 **`~/.hermes/config.yaml`**（原生 Windows 为 `%LOCALAPPDATA%\hermes` 下的对应配置）。这是 Hermes 的普通设置文件，与存放密钥的 `.env` 分开——**钩子里只放逻辑与路径，不放明文密钥**。

### 2.2 配置结构示例

![Hooks 配置结构](/images/hermes/hooks/02-hook-config.png)

```yaml
# ~/.hermes/config.yaml
hooks:
  SessionStart:
    - command: "source ~/.env.hermes"
      description: "会话启动时加载环境变量"
  PreToolUse:
    - command: "~/.hermes/hooks/check-command.sh"
      description: "工具调用前执行白名单校验"
  PostToolUse:
    - command: "~/.hermes/hooks/log-tool.sh"
      description: "工具调用后记录审计日志"
```

::: warning 配置结构以官方文档为准
Hooks 支持的事件名、命令字段名与传给钩子的参数，各 Agent 工具实现不完全相同。上例给出的是直观可读的结构，接入实际环境前，请以 `~/.hermes/config.yaml` 的官方 schema 与文档为准，避免字段名对不上导致钩子静默不生效。
:::

### 2.3 改动后如何生效

- 修改配置后，**新会话**生效；正在运行中的会话通常不会重新读取配置。
- 可执行 `hermes doctor` 做一次健康检查，确认配置与依赖没有问题。

## 三、常见事件与用途

| 事件 | 触发时机 | 常见用途 |
| --- | --- | --- |
| SessionStart | 每次会话启动 | 加载环境变量、准备目录、打印上下文 |
| PreToolUse | 工具调用前 | 命令 / 路径白名单校验、安全拦截、配额检查 |
| PostToolUse | 工具调用后 | 记录日志、结果归档、用量统计 |
| 其他生命周期事件 | 按官方文档 | 会话结束清理、权限变更通知等 |

::: tip 三个事件串起来就是一整条可审计链
SessionStart 把环境准备好 → PreToolUse 把风险挡在门外 → PostToolUse 把每次操作留下记录。三个阶段各司其职，是大多数团队最常用的组合。
:::

## 四、实战案例

### 4.1 案例一：会话启动自动加载环境

很多项目需要在会话一开始就注入环境变量、切换工作目录或校验依赖。用 SessionStart 钩子做掉：

```yaml
hooks:
  SessionStart:
    - command: "source ~/.env.hermes && hermes config set terminal.cwd /path/to/project"
      description: "启动即注入环境并定位到项目目录"
```

效果：每次 `hermes` 进入会话，环境与目录都已就绪，无需再口头叮嘱 Agent"先配置环境"。

### 4.2 案例二：工具调用前后校验

对涉及文件修改、命令执行的场景，在 PreToolUse 校验路径与命令，在 PostToolUse 留下审计记录：

```yaml
hooks:
  PreToolUse:
    - command: "~/.hermes/hooks/guard.sh"
      description: "拦截未批准的命令执行"
  PostToolUse:
    - command: "~/.hermes/hooks/audit.sh"
      description: "把工具调用写入审计日志"
```

guard.sh 返回非零退出码时，该次工具调用会被拦下——这是把"命令审批"从人的记忆里解放出来、交给确定性逻辑的方式。

### 4.3 与拦截结合形成的完整闭环

![Hooks 拦截自动执行](/images/hermes/hooks/03-hook-automation.png)

一个完整闭环是：**启动加载 → 调用前校验 → 调用后记录**。工具调用前有拦截、调用后有留痕，配合 Hermes 本身的命令审批能力，层层叠加后对关键操作形成完整防线——即使 Agent 在长会话中"状态漂移"，钩子始终按既定规则执行。

## 五、最佳实践与常见问题

### 5.1 最佳实践

1. **钩子保持短小**：每个钩子只做一件事，把复杂逻辑拆到独立脚本，命令字段只写一行调用。
2. **逻辑放脚本、路径写绝对**：命令写成 `~/.hermes/hooks/xxx.sh`，别把一大段内联脚本塞进 YAML，便于排查与复用。
3. **不要放明文密钥**：密钥放 `~/.hermes/.env`，钩子里只引用环境变量，避免配置泄漏。
4. **先隔离验证再接入**：新增钩子前，先单独跑一遍脚本确认退出码正确，再接进 Hooks 配置，避免"钩子静默失败"难排查。

### 5.2 常见问题排查

| 问题 | 排查步骤 |
| --- | --- |
| 钩子没生效 | 确认改的是 `~/.hermes/config.yaml`；重启会话（修改不作用于运行中会话）；`hermes doctor` 检查配置 |
| 钩子报错但会话没感知 | 钩子命令退出码非零时可能被静默吞掉；先手动执行脚本确认行为，再接入配置 |
| 命令字段名对不上 | 以官方 schema 为准；对照官方文档核对事件名与字段名，避免大小写 / 命名不一致 |
| 钩子影响正常操作 | 收紧钩子逻辑（如只对特定路径 / 命令生效）；临时移除该钩子，比对是否由其引起 |

## 总结

Hooks 让 Hermes 在"会话启动、工具调用前 / 后"等生命周期节点上自动执行确定性逻辑，与 Claude Code / Codex 的 Hooks 同源。配置集中在 `~/.hermes/config.yaml`，三个常用事件就能搭出"启动加载 → 调用前校验 → 调用后留痕"的完整闭环。核心心法是：**凡是"每次都该发生、不该靠 Agent 记得"的确定性动作，都放进钩子**——既保证行为一致，又给安全与审计留了抓手。
