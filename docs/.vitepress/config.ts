import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'AI 学习文档',
  description: 'AI 编程工具指南：Claude Code · Zoo Code · Cline · Kilo Code · AI Agent 入门',

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
    siteTitle: 'AI 学习文档',

    nav: [
      { text: '首页', link: '/' },
      { text: 'Claude Code', link: '/claude-code/' },
      { text: 'Zoo Code', link: '/zoo-code/' },
      { text: 'Cline', link: '/cline/' },
      { text: 'Kilo Code', link: '/kilo-code/' },
      { text: 'AI Agent', link: '/ai-agent/' },
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
