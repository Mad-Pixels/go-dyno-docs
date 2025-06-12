# Быстрый старт

Данное руководство поможет вам освоить основы GoDyno. Мы покажем, как создать схему таблицы DynamoDB, сгенерировать Go-код и начать его использовать.  
Если вы еще не установили GoDyno, перейдите к разделу [установки](https://go-dyno.madpixels.io/en/v0.0.1-alpha/guide/installation).

## Создание первой схемы

Создайте файл схемы `user-posts.json` с описанием вашей DynamoDB таблицы:
```json
{
  "table_name": "user-posts",
  "hash_key": "user_id",
  "range_key": "created_at",
  "attributes": [
    {"name": "user_id", "type": "S"},
    {"name": "created_at", "type": "N"},
    {"name": "status", "type": "S"}
  ],
  "common_attributes": [
    {"name": "title", "type": "S"},
    {"name": "content", "type": "S"},
    {"name": "views", "type": "N"}
  ],
  "secondary_indexes": [
    {
      "name": "StatusIndex",
      "hash_key": "status",
      "range_key": "created_at",
      "projection_type": "ALL"
    }
  ]
}
```

Эта схема описывает DynamoDB таблицу постов пользователей с:
- Ключами: `user_id` (hash) и `created_at` (range)
- Атрибутами для индексации: `status` (используется в GSI)
- Обычными полями данных: `title`, `content`, `views`
- Вторичным индексом для запросов по статусу

::: tip
_Секция `attributes` содержит поля, используемые в качестве ключей основной таблицы и GSI-индексов._  
_Секция `common_attributes` включает обычные поля данных, не участвующие в индексации, но необходимые для полноты сгенерированной Go-структуры._
:::

## Генерация Go-кода

Для генерации типобезопасного Go-кода выполните:
```bash
godyno gen --cfg user-posts.json --dest ./generated
```

Эта команда создаст файл `./generated/user_posts/user_posts.go` с полным набором структур и методов.

## Использование сгенерированного кода

После генерации вы получите готовый к использованию Go-код:
```go
package main

import (
  "context"
  "log"

  "github.com/aws/aws-sdk-go-v2/aws"
  "github.com/aws/aws-sdk-go-v2/config"
  "github.com/aws/aws-sdk-go-v2/service/dynamodb"
  "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"

  userposts "your-project/generated/user_posts" // [!code focus]
)

func main() {
  // Настройка AWS клиента
  ctx := context.Background()
  cfg, err := config.LoadDefaultConfig(ctx)
  if err != nil {
    log.Fatal(err)
  }
  client := dynamodb.NewFromConfig(cfg) // [!code focus]

  // Создание нового поста              // [!code focus]
  post := userposts.SchemaItem{         // [!code focus]
    UserId:    "user123",               // [!code focus]
    CreatedAt: 1640995200,              // [!code focus]
    Status:    "published",             // [!code focus]
    Title:     "Мой первый пост",       // [!code focus]
    Content:   "Содержание поста...",   // [!code focus]
    Views:     0,                       // [!code focus]
  }                                     // [!code focus]

  // Сохранение в DynamoDB              // [!code focus]
  item, err := userposts.PutItem(post)  // [!code focus]
  if err != nil {
    log.Fatal(err)
  }

  _, err = client.PutItem(ctx, &dynamodb.PutItemInput{ // [!code focus]
    TableName: aws.String(userposts.TableName),        // [!code focus]
    Item:      item,                                   // [!code focus]
  })                                                   // [!code focus]
  if err != nil {
    log.Fatal(err)
  }

  // Типобезопасные запросы с помощью QueryBuilder // [!code focus]
  posts, err := userposts.NewQueryBuilder().       // [!code focus]
    WithUserId("user123").                         // [!code focus]
    WithStatus("published").                       // [!code focus]
    WithCreatedAtGreaterThan(1640990000).          // [!code focus]
    OrderByDesc().                                 // [!code focus]
    Limit(10).                                     // [!code focus]
    Execute(ctx, client)                           // [!code focus]

  if err != nil {
    log.Fatal(err)
  }

  for _, p := range posts {
    log.Printf("Пост: %s (просмотры: %d)", p.Title, p.Views)
  }
}
```

## Основные возможности

### Константы для безопасности

Используйте сгенерированные константы вместо строковых литералов:
```go
tableName := userposts.TableName        // Вместо "user-posts"
keyName   := userposts.ColumnUserId     // Вместо "user_id"
indexName := userposts.IndexStatusIndex // Вместо "StatusIndex"
```

### Строим запросы

`QueryBuilder` предоставляет fluent API для создания запросов:
```go
query := userposts.NewQueryBuilder().
  WithUserId("user123").               // Основной ключ
  WithCreatedAtBetween(start, end).    // Диапазон дат
  WithStatus("published").             // Фильтр по статусу
  WithViewsGreaterThan(100).           // Популярные посты
  OrderByDesc().                       // Сортировка по убыванию
  Limit(20)                            // Ограничение результатов

posts, err := query.Execute(ctx, dynamoClient)
```

## Интеграция с Terraform

Одно из главных преимуществ GoDyno — возможность использовать одну схему для Terraform и генерации кода:
```tf
# main.tf
module "user_posts_table" {
  source = "./terraform-modules/dynamodb"

  # Используем ту же схему JSON для инфраструктуры
  schema_file = file("./user-posts.json")
}

# Создаем инфраструктуру
terraform apply

# Генерируем код из той же схемы
godyno gen --cfg user-posts.json --dest ./generated
```

> Это гарантирует, что ваша инфраструктура и код всегда синхронизированы!
