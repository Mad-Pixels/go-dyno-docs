import { defineConfig, type DefaultTheme } from 'vitepress'
import versionsConfig from '../../versions.json'

function createVersionDropdown(locale: string): DefaultTheme.NavItemWithLink[] {
  const items = versionsConfig.versions.map(version => ({
    text: version === versionsConfig.latest ? `${version} (latest)` : version,
    link: `/${locale}/${version}/`
  }))
  return items
}

export default defineConfig({
  title: "GoDyno",
  description: "DynamoDB Schema to GoLang Code",

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  locales: {
    en: {
      label: 'English',
      lang: 'en',
      title: 'GoDyno',
      description: 'DynamoDB Schema to GoLang Code',
      themeConfig: {
        logo: {
          src: '/madpixels.png',
          alt: 'GoDyno',
          href: `/en/${versionsConfig.latest}/`
        },
        nav: [
          { text: 'Installation', link: `/en/${versionsConfig.latest}/guide/installation` },
          { text: 'IaC', link: `/en/${versionsConfig.latest}/reference/iac` },
          { text: 'JSON', link: `/en/${versionsConfig.latest}/reference/json` },
          { text: 'CLI', link: `/en/${versionsConfig.latest}/reference/cli` },
          { text: 'API', link: `/en/${versionsConfig.latest}/reference/api` },
          {
            text: "Releases",
            items: createVersionDropdown('en')
          }
        ],
        sidebar: {
          [`/en/${versionsConfig.latest}`]: [
            {
              text: 'Getting Started',
              items: [
                { text: 'Installation', link: `/en/${versionsConfig.latest}/guide/installation` },
                { text: 'Quick Start', link: `/en/${versionsConfig.latest}/guide/quickstart` },
              ]
            },
            {
              text: 'Reference', 
              collapsed: false, 
              items: [
                { text: 'IaC', link: `/en/${versionsConfig.latest}/reference/iac` },
                { text: 'JSON', link: `/en/${versionsConfig.latest}/reference/json` },
                { text: 'CLI', link: `/en/${versionsConfig.latest}/reference/cli` }, 
                { text: 'API', link: `/en/${versionsConfig.latest}/reference/api` },
              ]
            },
            {
              text: 'Product', 
              collapsed: false, 
              items: [
                { text: 'Changelog', link: `/en/${versionsConfig.latest}/product/changelog` },
                { text: '⭐ Give Us a star', link: `https://github.com/Mad-Pixels/go-dyno` },
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
        logo: {
          src: '/madpixels.png',
          alt: 'GoDyno',
          href: `/ru/${versionsConfig.latest}/`
        },
        nav: [
          { text: 'Установка', link: `/ru/${versionsConfig.latest}/guide/installation` },
          { text: 'IaC', link: `/ru/${versionsConfig.latest}/reference/iac` },
          { text: 'JSON', link: `/ru/${versionsConfig.latest}/reference/json` },
          { text: 'CLI', link: `/ru/${versionsConfig.latest}/reference/cli` },
          { text: 'API', link: `/ru/${versionsConfig.latest}/reference/api` },
          {
            text: "Релизы",
            items: createVersionDropdown('ru')
          }
        ],
        sidebar: {
          [`/ru/${versionsConfig.latest}/`]: [
            {
              text: 'Начало работы',
              items: [
                { text: 'Установка', link: `/ru/${versionsConfig.latest}/guide/installation` },
                { text: 'Быстрый старт', link: `/ru/${versionsConfig.latest}/guide/quickstart` },
              ]
            },
            {
              text: 'Референс', 
              collapsed: true, 
              items: [
                { text: 'IaC', link: `/ru/${versionsConfig.latest}/reference/iac` },
                { text: 'JSON', link: `/ru/${versionsConfig.latest}/reference/json` },
                { text: 'CLI', link: `/ru/${versionsConfig.latest}/reference/cli` }, 
                { text: 'API', link: `/ru/${versionsConfig.latest}/reference/api` }, 
              ]
            },
            {
              text: 'Продукт', 
              collapsed: false, 
              items: [
                { text: 'Изменения', link: `/ru/${versionsConfig.latest}/product/changelog` },
                { text: '⭐ Give Us a star', link: `https://github.com/Mad-Pixels/go-dyno` },
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
    ['link', { rel: 'canonical', href: 'https://go-dyno.madpixels.io/' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.png' }],

    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/logo.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/logo.png' }],

    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],

    ['meta', { property: 'og:description', content: 'Generate type-safe Go code from DynamoDB schemas. Fast. Simple. Reliable.' }],
    ['meta', { property: 'og:title', content: 'GoDyno: DynamoDB Schema to GoLang Code' }],
    ['meta', { property: 'og:image', content: 'https://go-dyno.madpixels.io/logo.png' }],
    ['meta', { property: 'og:url', content: 'https://go-dyno.madpixels.io/' }],
    ['meta', { property: 'og:site_name', content: 'GoDyno' }],
    ['meta', { property: 'og:type', content: 'website' }],

    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'GoDyno: DynamoDB → GoLang' }],
    ['meta', { name: 'twitter:description', content: 'Generate type-safe Go code from DynamoDB schemas' }],
    ['meta', { name: 'twitter:image', content: 'https://go-dyno.madpixels.io/logo.png' }],
  ]
})