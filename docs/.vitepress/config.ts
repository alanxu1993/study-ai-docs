import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Alan的AI世界',
  description: 'Alan的AI世界：AI 编程工具指南 · Claude Code · Zoo Code · Cline · Kilo Code · AI Agent 入门',

  ignoreDeadLinks: true,
  vite: {
    server: {
      port: 3001,
    },
  },
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#1A1C20' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Alan的AI世界',

    nav: [
      { text: '首页', link: '/' },
      { text: 'Prompt图书馆', link: '/prompt-library/' },
      { text: 'MCP工具厂', link: '/mcp-factory/' },
      { text: 'Skill超市', link: '/skills/' },
          ],

    sidebar: {
      '/claude-code/': [
        {
          text: '基础入门',
          items: [
            { text: '概述', link: '/claude-code/' },
            { text: '快速上手指南', link: '/claude-code/claude-code-quick-start' },
            { text: '工作原理与使用指南', link: '/claude-code/claude-code-overview' },
            { text: '六大权限模式', link: '/claude-code/claude-code-permissions' },
          ]
        },
        {
          text: '工作流与命令',
          items: [
            { text: '高效工作流', link: '/claude-code/claude-code-workflows' },
            { text: '常用命令教程', link: '/claude-code/claude-code-commands' },
          ]
        },
        {
          text: '进阶功能',
          items: [
            { text: 'Hooks 钩子教程', link: '/claude-code/claude-code-hooks' },
            { text: 'MCP 使用教程', link: '/claude-code/claude-code-mcp' },
            { text: 'Skills 使用教程', link: '/claude-code/claude-code-skills' },
            { text: 'Subagent 子代理指南', link: '/claude-code/claude-code-subagent' },
          ]
        },
        {
          text: '配置与优化',
          items: [
            { text: 'Memory 内存记忆配置', link: '/claude-code/claude-code-memory' },
            { text: '.claude 配置指南', link: '/claude-code/claude-code-config' },
            { text: '扩展选型与配置手册', link: '/claude-code/claude-code-extensions' },
          ]
        },
        {
          text: '实战与技巧',
          items: [
            { text: '插件指南', link: '/claude-code/claude-code-plugins' },
            { text: '最佳实践', link: '/claude-code/claude-code-best-practices' },
            { text: 'Goal 命令指南', link: '/claude-code/claude-code-goal-command' },
            { text: '使用技巧', link: '/claude-code/claude-code-tips' },
          ]
        }
      ],
            '/codex/': [
        {
          text: '基础配置',
          items: [
            { text: 'Codex 完整教程', link: '/codex/' },
            { text: '一、基础配置教程', link: '/codex/codex-basic-config' },
            { text: '二、高级配置教程', link: '/codex/codex-advanced-config' },
            { text: '三、提示词使用教程', link: '/codex/codex-prompts' },
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '四、Hooks 使用教程', link: '/codex/codex-hooks' },
            { text: '五、MCP 全流程使用教程', link: '/codex/codex-mcp' },
            { text: '六、Skills 使用教程', link: '/codex/codex-skills' },
            { text: '七、Plugins 使用教程', link: '/codex/codex-plugins' },
          ]
        },
        {
          text: '进阶能力',
          items: [
            { text: '八、Rules 使用教程', link: '/codex/codex-rules' },
            { text: '九、Subagent 实用教程', link: '/codex/codex-subagent' },
            { text: '十、记忆功能使用教程', link: '/codex/codex-memory' },
            { text: '十一、AGENTS 加载指令详解', link: '/codex/codex-agents-md' },
          ]
        },
        {
          text: '实战与优化',
          items: [
            { text: '十二、官方工作流指南', link: '/codex/codex-workflows' },
            { text: '十三、项目定制化教程', link: '/codex/codex-customization' },
            { text: '十四、示例配置教程', link: '/codex/codex-examples' },
            { text: '十五、最佳实践', link: '/codex/codex-best-practices' },
          ]
        }
      ],
      '/hermes/': [
        {
          text: '入门与安装',
          items: [
            { text: 'Hermes Agent 完整教程', link: '/hermes/' },
            { text: '一、快速入门教程', link: '/hermes/hermes-quick-start' },
            { text: '二、安装教程', link: '/hermes/hermes-install' },
            { text: '三、配置教程', link: '/hermes/hermes-config' },
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '四、工具使用教程', link: '/hermes/hermes-tools' },
            { text: '五、会话使用教程', link: '/hermes/hermes-sessions' },
            { text: '六、SubAgent 子代理', link: '/hermes/hermes-subagent' },
            { text: '七、插件使用教程', link: '/hermes/hermes-plugins' },
          ]
        },
        {
          text: '进阶能力',
          items: [
            { text: '八、Hooks 钩子教程', link: '/hermes/hermes-hooks' },
            { text: '九、Profiles 多实例配置教程', link: '/hermes/hermes-profiles' },
            { text: '十、cron 定时任务使用教程', link: '/hermes/hermes-cron' },
            { text: '十一、代码工具使用教程', link: '/hermes/hermes-code-tools' },
            { text: '十二、电脑操控使用教程', link: '/hermes/hermes-computer-use' },
          ]
        },
        {
          text: '生态与实战',
          items: [
            { text: '十三、接入 Claude Code 教程', link: '/hermes/hermes-claude-code' },
            { text: '十四、记忆使用教程', link: '/hermes/hermes-memory' },
            { text: '十五、代理上下文使用教程', link: '/hermes/hermes-context' },
            { text: '十六、代理技能使用教程', link: '/hermes/hermes-skills' },
          ]
        }
      ],
      '/ai-agent/': [
        {
          text: 'AI Agent 入门教程',
          items: [
            { text: '概述', link: '/ai-agent/' },
            { text: '一、AI Agent 简介', link: '/ai-agent/intro' },
            { text: '二、Agent 的构成', link: '/ai-agent/components' },
            { text: '三、核心特征', link: '/ai-agent/features' },
            { text: '四、发展历程', link: '/ai-agent/history' },
            { text: '五、主要类型与应用场景', link: '/ai-agent/types' },
            { text: '六、挑战与局限', link: '/ai-agent/challenges' },
            { text: '七、未来发展趋势', link: '/ai-agent/future' },
          ]
        }
      ],
      '/zoo-code/': [
        {
          text: 'Zoo Code 快速上手',
          items: [
            { text: '概述', link: '/zoo-code/' },
            { text: '一、介绍及核心优势', link: '/zoo-code/intro' },
            { text: '二、安装教程', link: '/zoo-code/install' },
            { text: '三、模式与工作流', link: '/zoo-code/modes' },
            { text: '四、核心特性详解', link: '/zoo-code/features' },
            { text: '五、模型与提供商', link: '/zoo-code/models' },
            { text: '六、总结', link: '/zoo-code/summary' },
          ]
        }
      ],
      '/cline/': [
        {
          text: 'Cline 快速上手',
          items: [
            { text: '概述', link: '/cline/' },
            { text: '一、Cline 介绍', link: '/cline/intro' },
            { text: '二、安装教程', link: '/cline/install' },
            { text: '三、模型选择与配置', link: '/cline/models' },
            { text: '四、上下文管理', link: '/cline/context' },
            { text: '五、核心功能特性', link: '/cline/features' },
            { text: '六、总结', link: '/cline/summary' },
          ]
        }
      ],
      '/kilo-code/': [
        {
          text: 'Kilo Code 快速上手',
          items: [
            { text: '概述', link: '/kilo-code/' },
            { text: '一、Kilo Code 介绍', link: '/kilo-code/intro' },
            { text: '二、安装教程', link: '/kilo-code/install' },
            { text: '三、模式与 Agent', link: '/kilo-code/modes' },
            { text: '四、核心功能', link: '/kilo-code/features' },
            { text: '五、模型配置', link: '/kilo-code/models' },
            { text: '六、总结', link: '/kilo-code/summary' },
          ]
        }
      ],
      '/agent-dev/': [
        {
          text: 'Agent 开发教程',
          items: [
            { text: 'Agent 开发总览', link: '/agent-dev/' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
      label: '本页目录',
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    darkModeSwitchLabel: '主题切换',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
  },

  markdown: {
    lineNumbers: true,
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息',
    },
  },
})
