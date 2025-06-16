---
layout: home

hero:
  name: "GoDyno"
  text: "Из схемы DynamoDB в Go-код"
  tagline: "Типобезопасная разработка с DynamoDB"
  actions:
    - theme: brand
      text: Старт
      link: ./guide/quickstart
    - theme: alt
      text: Релизы
      link: https://github.com/Mad-Pixels/go-dyno/releases
    - theme: alt
      text: Образы
      link: https://hub.docker.com/r/madpixels/go-dyno
    - theme: alt
      text: Код
      link: https://github.com/Mad-Pixels/go-dyno
  image: /logo.png

features:
  - icon: 
      src: /icons/develop.png
      alt: Schema-Driven Development
    title: Код из конфига
    details: Автоматически превращайте конфигурации таблиц DynamoDB в Go-код с полной типобезопасностью
  - icon: 
      src: /icons/query.png
      alt: Advanced Query Builder
    title: Конструктор запросов
    details: Удобный API с автоопределением индекса, поддержкой диапазонов и составных ключей
  - icon: 
      src: /icons/integration.png
      alt: Terraform Integration 
    title: Синхронизация с Terraform
    details: Один JSON-файл — и для инфраструктуры, и для приложения. Максимальная согласованность
  - icon: 
      src: /icons/key.png
      alt: Composite Keys Support
    title: Поддержка составных ключей
    details: Умное распознавание и работа с составными ключами и сложными запросами
---
