import { defineConfig, type DefaultTheme } from 'vitepress'

async function getVersionsFromGitHub() {
  try {
    const response = await fetch('https://api.github.com/repos/Mad-Pixels/go-dyno-docs/releases')
    const releases = await response.json()
    
    const versions = releases
      .filter(release => !release.draft)
      .map(release => release.tag_name)
    
    return {
      versions,
      latestVersion: versions[0] || 'v1.0.0'
    }
  } catch (error) {
    return {
      versions: ['v1.0.0'],
      latestVersion: 'v1.0.0'
    }
  }
}

const { versions, latestVersion } = await getVersionsFromGitHub()

function createVersionDropdown(): DefaultTheme.NavItemWithLink[] {
  const items = versions.map(version => ({
    text: version === latestVersion ? `${version} (latest)` : version,
    link: `/versions/${version}/`
  }))
  
  items.push({
    text: '📋 Changelog',
    link: 'https://github.com/Mad-Pixels/go-dyno-docs/blob/main/CHANGELOG.md',
    target: '_blank'
  })
  return items
}

export default defineConfig({
  title: "GoDyno",
  description: "DynamoDB Schema to GoLang Code",
  
  rewrites: {
    'en/:rest*': ':rest*'
  },

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
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/guide/' },
          { text: 'Examples', link: '/examples/' },
          { text: 'API Reference', link: '/api/' },
          {
            text: latestVersion,
            items: createVersionDropdown()
          }
        ],

        sidebar: {
          '/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/guide/' },
                { text: 'Installation', link: '/guide/installation' },
                { text: 'Quick Start', link: '/guide/quick-start' }
              ]
            },
            {
              text: 'Core Concepts',
              items: [
                { text: 'Schema Definition', link: '/guide/schema' },
                { text: 'Code Generation', link: '/guide/generation' },
                { text: 'Query Builder', link: '/guide/querybuilder' }
              ]
            },
            {
              text: 'Advanced',
              items: [
                { text: 'Terraform Integration', link: '/guide/terraform' },
                { text: 'Composite Keys', link: '/guide/composite-keys' },
                { text: 'Secondary Indexes', link: '/guide/indexes' }
              ]
            }
          ],
          '/examples/': [
            {
              text: 'Examples',
              items: [
                { text: 'Simple Table', link: '/examples/simple' },
                { text: 'E-commerce', link: '/examples/ecommerce' },
                { text: 'Social Media', link: '/examples/social' },
                { text: 'Analytics', link: '/examples/analytics' }
              ]
            }
          ],
          '/api/': [
            {
              text: 'API Reference',
              items: [
                { text: 'CLI Commands', link: '/api/cli' },
                { text: 'Schema Format', link: '/api/schema' },
                { text: 'Generated Code', link: '/api/generated' }
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
          { text: 'Главная', link: '/ru/' },
          { text: 'Руководство', link: '/ru/guide/' },
          { text: 'Примеры', link: '/ru/examples/' },
          { text: 'API Справка', link: '/ru/api/' },
          {
            text: latestVersion,
            items: createVersionDropdown().map(item => ({
              ...item,
              link: item.link.startsWith('http') ? item.link : `/ru${item.link}`
            }))
          }
        ],

        sidebar: {
          '/ru/guide/': [
            {
              text: 'Начало работы',
              items: [
                { text: 'Введение', link: '/ru/guide/' },
                { text: 'Установка', link: '/ru/guide/installation' },
                { text: 'Быстрый старт', link: '/ru/guide/quick-start' }
              ]
            },
            {
              text: 'Основные понятия',
              items: [
                { text: 'Описание схемы', link: '/ru/guide/schema' },
                { text: 'Генерация кода', link: '/ru/guide/generation' },
                { text: 'Query Builder', link: '/ru/guide/querybuilder' }
              ]
            },
            {
              text: 'Продвинутое',
              items: [
                { text: 'Интеграция с Terraform', link: '/ru/guide/terraform' },
                { text: 'Составные ключи', link: '/ru/guide/composite-keys' },
                { text: 'Вторичные индексы', link: '/ru/guide/indexes' }
              ]
            }
          ],
          '/ru/examples/': [
            {
              text: 'Примеры',
              items: [
                { text: 'Простая таблица', link: '/ru/examples/simple' },
                { text: 'E-commerce', link: '/ru/examples/ecommerce' },
                { text: 'Социальные сети', link: '/ru/examples/social' },
                { text: 'Аналитика', link: '/ru/examples/analytics' }
              ]
            }
          ],
          '/ru/api/': [
            {
              text: 'API Справка',
              items: [
                { text: 'CLI команды', link: '/ru/api/cli' },
                { text: 'Формат схемы', link: '/ru/api/schema' },
                { text: 'Сгенерированный код', link: '/ru/api/generated' }
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