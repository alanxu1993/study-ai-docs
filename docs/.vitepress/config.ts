import { defineConfig } from 'vitepress'

/**
 * 生成 sidebar 配置。
 * VitePress i18n 下，非 root locale 页面的 relativePath 含 locale 前缀
 * （如 /en/claude-code/xxx），因此 sidebar 键与链接都需带前缀 p。
 * p = ''（中文站）或 '/en'（英文站）。
 */
function sidebarFor(p: string) {
  return {
    [`${p}/claude-code/`]: [
      {
        text: '基础入门',
        items: [
          { text: '概述', link: `${p}/claude-code/` },
          { text: '快速上手指南', link: `${p}/claude-code/claude-code-quick-start` },
          { text: '工作原理与使用指南', link: `${p}/claude-code/claude-code-overview` },
          { text: '六大权限模式', link: `${p}/claude-code/claude-code-permissions` },
        ]
      },
      {
        text: '工作流与命令',
        items: [
          { text: '高效工作流', link: `${p}/claude-code/claude-code-workflows` },
          { text: '常用命令教程', link: `${p}/claude-code/claude-code-commands` },
        ]
      },
      {
        text: '进阶功能',
        items: [
          { text: 'Hooks 钩子教程', link: `${p}/claude-code/claude-code-hooks` },
          { text: 'MCP 使用教程', link: `${p}/claude-code/claude-code-mcp` },
          { text: 'Skills 使用教程', link: `${p}/claude-code/claude-code-skills` },
          { text: 'Subagent 子代理指南', link: `${p}/claude-code/claude-code-subagent` },
        ]
      },
      {
        text: '配置与优化',
        items: [
          { text: 'Memory 内存记忆配置', link: `${p}/claude-code/claude-code-memory` },
          { text: '.claude 配置指南', link: `${p}/claude-code/claude-code-config` },
          { text: '扩展选型与配置手册', link: `${p}/claude-code/claude-code-extensions` },
        ]
      },
      {
        text: '实战与技巧',
        items: [
          { text: '插件指南', link: `${p}/claude-code/claude-code-plugins` },
          { text: '最佳实践', link: `${p}/claude-code/claude-code-best-practices` },
          { text: 'Goal 命令指南', link: `${p}/claude-code/claude-code-goal-command` },
          { text: '使用技巧', link: `${p}/claude-code/claude-code-tips` },
        ]
      }
    ],
    [`${p}/codex/`]: [
      {
        text: '基础配置',
        items: [
          { text: 'Codex 完整教程', link: `${p}/codex/` },
          { text: '一、基础配置教程', link: `${p}/codex/codex-basic-config` },
          { text: '二、高级配置教程', link: `${p}/codex/codex-advanced-config` },
          { text: '三、提示词使用教程', link: `${p}/codex/codex-prompts` },
        ]
      },
      {
        text: '核心功能',
        items: [
          { text: '四、Hooks 使用教程', link: `${p}/codex/codex-hooks` },
          { text: '五、MCP 全流程使用教程', link: `${p}/codex/codex-mcp` },
          { text: '六、Skills 使用教程', link: `${p}/codex/codex-skills` },
          { text: '七、Plugins 使用教程', link: `${p}/codex/codex-plugins` },
        ]
      },
      {
        text: '进阶能力',
        items: [
          { text: '八、Rules 使用教程', link: `${p}/codex/codex-rules` },
          { text: '九、Subagent 实用教程', link: `${p}/codex/codex-subagent` },
          { text: '十、记忆功能使用教程', link: `${p}/codex/codex-memory` },
          { text: '十一、AGENTS 加载指令详解', link: `${p}/codex/codex-agents-md` },
        ]
      },
      {
        text: '实战与优化',
        items: [
          { text: '十二、官方工作流指南', link: `${p}/codex/codex-workflows` },
          { text: '十三、项目定制化教程', link: `${p}/codex/codex-customization` },
          { text: '十四、示例配置教程', link: `${p}/codex/codex-examples` },
          { text: '十五、最佳实践', link: `${p}/codex/codex-best-practices` },
        ]
      }
    ],
    [`${p}/hermes/`]: [
      {
        text: '入门与安装',
        items: [
          { text: 'Hermes Agent 完整教程', link: `${p}/hermes/` },
          { text: '一、快速入门教程', link: `${p}/hermes/hermes-quick-start` },
          { text: '二、安装教程', link: `${p}/hermes/hermes-install` },
          { text: '三、配置教程', link: `${p}/hermes/hermes-config` },
        ]
      },
      {
        text: '核心功能',
        items: [
          { text: '四、工具使用教程', link: `${p}/hermes/hermes-tools` },
          { text: '五、会话使用教程', link: `${p}/hermes/hermes-sessions` },
          { text: '六、SubAgent 子代理', link: `${p}/hermes/hermes-subagent` },
          { text: '七、插件使用教程', link: `${p}/hermes/hermes-plugins` },
        ]
      },
      {
        text: '进阶能力',
        items: [
          { text: '八、Hooks 钩子教程', link: `${p}/hermes/hermes-hooks` },
          { text: '九、Profiles 多实例配置教程', link: `${p}/hermes/hermes-profiles` },
          { text: '十、cron 定时任务使用教程', link: `${p}/hermes/hermes-cron` },
          { text: '十一、代码工具使用教程', link: `${p}/hermes/hermes-code-tools` },
          { text: '十二、电脑操控使用教程', link: `${p}/hermes/hermes-computer-use` },
        ]
      },
      {
        text: '生态与实战',
        items: [
          { text: '十三、接入 Claude Code 教程', link: `${p}/hermes/hermes-claude-code` },
          { text: '十四、记忆使用教程', link: `${p}/hermes/hermes-memory` },
          { text: '十五、代理上下文使用教程', link: `${p}/hermes/hermes-context` },
          { text: '十六、代理技能使用教程', link: `${p}/hermes/hermes-skills` },
        ]
      }
    ],
    [`${p}/ai-agent/`]: [
      {
        text: 'AI Agent 入门教程',
        items: [
          { text: '概述', link: `${p}/ai-agent/` },
          { text: '一、AI Agent 简介', link: `${p}/ai-agent/intro` },
          { text: '二、Agent 的构成', link: `${p}/ai-agent/components` },
          { text: '三、核心特征', link: `${p}/ai-agent/features` },
          { text: '四、发展历程', link: `${p}/ai-agent/history` },
          { text: '五、主要类型与应用场景', link: `${p}/ai-agent/types` },
          { text: '六、挑战与局限', link: `${p}/ai-agent/challenges` },
          { text: '七、未来发展趋势', link: `${p}/ai-agent/future` },
        ]
      }
    ],
    [`${p}/zoo-code/`]: [
      {
        text: 'Zoo Code 快速上手',
        items: [
          { text: '概述', link: `${p}/zoo-code/` },
          { text: '一、介绍及核心优势', link: `${p}/zoo-code/intro` },
          { text: '二、安装教程', link: `${p}/zoo-code/install` },
          { text: '三、模式与工作流', link: `${p}/zoo-code/modes` },
          { text: '四、核心特性详解', link: `${p}/zoo-code/features` },
          { text: '五、模型与提供商', link: `${p}/zoo-code/models` },
          { text: '六、总结', link: `${p}/zoo-code/summary` },
        ]
      }
    ],
    [`${p}/cline/`]: [
      {
        text: 'Cline 快速上手',
        items: [
          { text: '概述', link: `${p}/cline/` },
          { text: '一、Cline 介绍', link: `${p}/cline/intro` },
          { text: '二、安装教程', link: `${p}/cline/install` },
          { text: '三、模型选择与配置', link: `${p}/cline/models` },
          { text: '四、上下文管理', link: `${p}/cline/context` },
          { text: '五、核心功能特性', link: `${p}/cline/features` },
          { text: '六、总结', link: `${p}/cline/summary` },
        ]
      }
    ],
    [`${p}/kilo-code/`]: [
      {
        text: 'Kilo Code 快速上手',
        items: [
          { text: '概述', link: `${p}/kilo-code/` },
          { text: '一、Kilo Code 介绍', link: `${p}/kilo-code/intro` },
          { text: '二、安装教程', link: `${p}/kilo-code/install` },
          { text: '三、模式与 Agent', link: `${p}/kilo-code/modes` },
          { text: '四、核心功能', link: `${p}/kilo-code/features` },
          { text: '五、模型配置', link: `${p}/kilo-code/models` },
          { text: '六、总结', link: `${p}/kilo-code/summary` },
        ]
      }
    ],
    [`${p}/agent-dev/`]: [
      {
        text: 'Agent 开发教程',
        items: [
          { text: 'Agent 开发总览', link: `${p}/agent-dev/` },
        ]
      }
    ],
  }
}

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

  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        siteTitle: 'Alan的AI世界',

        nav: [
          { text: '首页', link: '/' },
          { text: 'Prompt图书馆', link: '/prompt-library/' },
          { text: 'MCP工具厂', link: '/mcp-factory/' },
          { text: 'Skill超市', link: '/skills/' },
        ],

        sidebar: sidebarFor(''),

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
        langMenuLabel: '语言',

        notFound: {
          title: '页面未找到',
          quote: '你要找的页面似乎不存在或已被移动。',
          linkLabel: '返回首页',
          linkText: '前往首页',
          code: '404',
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        siteTitle: "Alan's AI World",

        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Prompt Library', link: '/en/prompt-library/' },
          { text: 'MCP Factory', link: '/en/mcp-factory/' },
          { text: 'Skill Store', link: '/en/skills/' },
        ],

        sidebar: sidebarFor('/en'),

        outline: {
          level: [2, 3],
          label: 'On this page',
        },

        docFooter: {
          prev: 'Previous',
          next: 'Next',
        },

        lastUpdated: {
          text: 'Last updated',
          formatOptions: {
            dateStyle: 'short',
            timeStyle: 'medium',
          },
        },

        darkModeSwitchLabel: 'Theme',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Back to top',
        langMenuLabel: 'Language',

        notFound: {
          title: 'PAGE NOT FOUND',
          quote: 'The page you are looking for does not exist or may have been moved.',
          linkLabel: 'Back to home',
          linkText: 'Go to Home',
          code: '404',
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },
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
