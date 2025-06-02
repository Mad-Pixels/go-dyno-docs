import { defineConfig, type DefaultTheme } from 'vitepress'
import versionsConfig from '../../versions.json'

function createVersionDropdown(locale: string): DefaultTheme.NavItemWithLink[] {
  const items = versionsConfig.versions.map(version => ({
    text: version === versionsConfig.latest ? `${version} (latest)` : version,
    link: `/${locale}/${version}/`
  }))
  
  items.push({
    text: '📋 Changelog',
    link: 'https://github.com/Mad-Pixels/go-dyno-docs/blob/main/CHANGELOG.md',
    //target: '_blank'
  })
  return items
}

export default defineConfig({
  title: "GoDyno",
  description: "DynamoDB Schema to GoLang Code",
  
  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'GoDyno',
      description: 'DynamoDB Schema to GoLang Code',
      themeConfig: {
        nav: [
          { text: 'Home', link: `/en/${versionsConfig.latest}/` },
          { text: 'Guide', link: `/en/${versionsConfig.latest}/guide/` },
          { text: 'Examples', link: `/en/${versionsConfig.latest}/examples/` },
          { text: 'API Reference', link: `/en/${versionsConfig.latest}/api/` },
          {
            text: versionsConfig.latest,
            items: createVersionDropdown('en')
          }
        ],

        sidebar: {
          [`/en/${versionsConfig.latest}/guide/`]: [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: `/en/${versionsConfig.latest}/guide/` },
                { text: 'Installation', link: `/en/${versionsConfig.latest}/guide/installation` },
                { text: 'Quick Start', link: `/en/${versionsConfig.latest}/guide/quick-start` }
              ]
            }
          ]
        },

        socialLinks: [
          { icon: 'github', link: 'https://github.com/Mad-Pixels/go-dyno' }
        ],

        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2025 Mad-Pixels'
        }
      }
    },
    
    ru: {
      label: 'Русский',
      lang: 'ru',
      title: 'GoDyno',
      description: 'Генератор Go кода из схем DynamoDB',
      themeConfig: {
        nav: [
          { text: 'Главная', link: `/ru/${versionsConfig.latest}/` },
          { text: 'Руководство', link: `/ru/${versionsConfig.latest}/guide/` },
          { text: 'Примеры', link: `/ru/${versionsConfig.latest}/examples/` },
          { text: 'API Справка', link: `/ru/${versionsConfig.latest}/api/` },
          {
            text: versionsConfig.latest,
            items: createVersionDropdown('ru')
          }
        ],

        sidebar: {
          [`/ru/${versionsConfig.latest}/guide/`]: [
            {
              text: 'Начало работы',
              items: [
                { text: 'Введение', link: `/ru/${versionsConfig.latest}/guide/` },
                { text: 'Установка', link: `/ru/${versionsConfig.latest}/guide/installation` },
                { text: 'Быстрый старт', link: `/ru/${versionsConfig.latest}/guide/quick-start` }
              ]
            }
          ]
        },

        socialLinks: [
          { icon: 'github', link: 'https://github.com/Mad-Pixels/go-dyno' }
        ],

        footer: {
          message: 'Выпущено под лицензией MIT.',
          copyright: 'Copyright © 2025 Mad-Pixels'
        }
      }
    }
  },

  sitemap: {
    hostname: 'https://go-dyno.madpixels.io/'
  },

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'GoDyno' }]
  ]
})