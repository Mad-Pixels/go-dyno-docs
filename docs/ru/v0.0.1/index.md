---
layout: home

hero:
  name: "GoDyno"
  tagline: "Типобезопасная разработка с DynamoDB"
  actions:
    - theme: brand
      text: Старт
      link: ./guide/quickstart
    - theme: alt
      text: Релизы
      link: https://github.com/Mad-Pixels/go-dyno/releases
    - theme: alt
      text: Docker
      link: https://hub.docker.com/r/madpixels/go-dyno
    - theme: alt
      text: Github
      link: https://github.com/Mad-Pixels/go-dyno
  image: /logo.png

features:
  - icon: 
      src: /icons/develop.png
      alt: Schema-Driven Development
    title: Автоматическая кодогенерация
    details: Чистый Go код из JSON схем DynamoDB без внешних зависимостей, создавая типизированные структуры, константы и билдеры
  - icon: 
      src: /icons/query.png
      alt: Advanced Query Builder
    title: Полная типизация и безопасность
    details: Обеспечивает compile-time проверки, поддержку кастомных типов (int64, int32, float32, uint64, ...), автодополнение IDE и предотвращает runtime ошибки
  - icon: 
      src: /icons/integration.png
      alt: Terraform Integration 
    title: Единая схема для приложения и инфраструктуры
    details: Одна JSON-схема служит источником правды как для генерации Go-кода, так и для IaC-конфигураций, устраняя дублирование описаний и риск рассинхронизации
  - icon: 
      src: /icons/key.png
      alt: Composite Keys Support
    title: Умная оптимизация запросов
    details: Aвтоматически выбирает оптимальные индексы, поддерживает композитные ключи, GSI/LSI, фильтрацию, пагинацию и параллельное сканирование
---

<div v-pre>
  <button onclick="window.scrollTo({ top: 0, behavior: 'smooth' });"
    style="
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;
      background-color: #007bff;
      border: none;
      padding: 0.75rem;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    "
    aria-label="Наверх"
  >
    <img src="/icons/arrow-top.png" alt="Наверх" style="width: 24px; height: 24px;" />
  </button>
</div>

<br><br>

# Как это работает?
CLI инструмент, который трансформирует декларативные JSON схемы DynamoDB в готовые к продакшену Go модули с богатым функционалом для работы с базой данных. Одной командой `godyno gen` получаете полноценные пакеты с валидацией, билдерами запросов, helper-функциями и всей необходимой инфраструктурой для надёжной интеграции с AWS DynamoDB, минуя этап написания повторяющегося кода вручную.

<div align="center" style="margin-top:64px">
  <img src="/go-dyno-schema.png" alt="schema">
</div>

<br><br>

```bash
# генерация GoLang кода из JSON-схемы
$ godyno -c schema.json -d ./gen
# результат - новый файл:
# ./gen/basemixed.go 
# по-умолчанию: генерация всех объектов

# создание DynamoDB таблицы из JSON-схемы (terraform)
$ export TF_VAR_schema=$(cat schema.json)
$ terraform apply
```

::: code-group
<<< @/snippets/v0.0.1/main/schema{json}
<<< @/snippets/v0.0.1/main/generated{go}
<<< @/snippets/v0.0.1/main/terraform{hcl}
:::