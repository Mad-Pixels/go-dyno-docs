import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "GoDyno",
  description: "DynamoDB Schema to GoLang Code",
  
  locales: {
    en: {
      label: 'English',
      lang: 'en',
      title: 'GoDyno',
      description: 'DynamoDB Schema to GoLang Code',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guide', link: '/en/guide/' },
          { text: 'Examples', link: '/en/examples/' },
          { text: 'API Reference', link: '/en/api/' }
        ],

        sidebar: {
          '/en/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/en/guide/' },
                { text: 'Installation', link: '/en/guide/installation' },
                { text: 'Quick Start', link: '/en/guide/quick-start' }
              ]
            },
            {
              text: 'Core Concepts',
              items: [
                { text: 'Schema Definition', link: '/en/guide/schema' },
                { text: 'Code Generation', link: '/en/guide/generation' },
                { text: 'Query Builder', link: '/en/guide/querybuilder' }
              ]
            },
            {
              text: 'Advanced',
              items: [
                { text: 'Terraform Integration', link: '/en/guide/terraform' },
                { text: 'Composite Keys', link: '/en/guide/composite-keys' },
                { text: 'Secondary Indexes', link: '/en/guide/indexes' }
              ]
            }
          ],
          '/en/examples/': [
            {
              text: 'Examples',
              items: [
                { text: 'Simple Table', link: '/en/examples/simple' },
                { text: 'E-commerce', link: '/en/examples/ecommerce' },
                { text: 'Social Media', link: '/en/examples/social' },
                { text: 'Analytics', link: '/en/examples/analytics' }
              ]
            }
          ],
          '/en/api/': [
            {
              text: 'API Reference',
              items: [
                { text: 'CLI Commands', link: '/en/api/cli' },
                { text: 'Schema Format', link: '/en/api/schema' },
                { text: 'Generated Code', link: '/en/api/generated' }
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
          { text: 'API Справка', link: '/ru/api/' }
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

  rewrites: {
    '^/$': '/en/'
  }
})