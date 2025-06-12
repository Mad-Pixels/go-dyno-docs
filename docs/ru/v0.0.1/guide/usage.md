# Использование

## Генерация кода
### Базовая команда

Основная команда для генерации Go-кода из JSON схемы:
```bash
godyno gen --cfg schema.json --dest ./generated
```
Эта команда создаст Go-файл в директории `./generated/table_name/table_name.go` на основе вашей схемы.

### Опции командной строки
- **--cfg, -c** - Путь к JSON файлу схемы (обязательный)
- **--dest, -d** - Директория для сгенерированных файлов (обязательный)

### Переменные окружения
Вместо флагов можно использовать переменные окружения:
```bash
export GODYNO_CFG=./schemas/users.json
export GODYNO_DEST=./generated

godyno gen
```

### Структура выходных файлов
После генерации вы получите следующую структуру:
```bash
./generated/
└── user_posts/           # Имя пакета из table_name
    └── user_posts.go     # Сгенерированный код
```

Имя пакета и директории автоматически формируется из `table_name` в схеме, приводясь к безопасному Go-формату.
::: tip 
Eсли в схеме встречаются дефисы, они автоматически конвертируются в нижнее подчёркивание.
:::

## Работа со сгенерированным кодом
### Основные структуры

Каждая схема генерирует несколько ключевых структур

**SchemaItem** - основная структура для работы с записями:
```go
type SchemaItem struct {
  UserId    string `dynamodbav:"user_id"`
  CreatedAt int    `dynamodbav:"created_at"`
  Status    string `dynamodbav:"status"`
  Title     string `dynamodbav:"title"`
  Content   string `dynamodbav:"content"`
  Views     int    `dynamodbav:"views"`
}
```

::: tip
Тэги `dynamodbav` используются библиотекой AWS SDK для автопреобразования полей в AttributeValue.
:::

**DynamoSchema** - метаданные таблицы:
```go
var TableSchema = DynamoSchema{
  TableName:        "user-posts",
  HashKey:          "user_id",
  RangeKey:         "created_at",
  Attributes:       []Attribute{...},
  SecondaryIndexes: []SecondaryIndex{...},
}
```

### Константы и метаданные
Для типобезопасной работы генерируются константы:
```go
// Имена таблиц и индексов
const TableName = "user-posts"
const IndexStatusIndex = "StatusIndex"

// Имена колонок
const ColumnUserId = "user_id"
const ColumnCreatedAt = "created_at"
const ColumnStatus = "status"

// Массив всех атрибутов
var AttributeNames = []string{
  "user_id", "created_at", "status", "title", "content", "views",
}

// Проекции индексов
var IndexProjections = map[string][]string{
  "StatusIndex": {"user_id", "created_at", "status", "title", "content", "views"},
}
```

Использование констант вместо "жёстко прописанных" строк гарантирует:
- отсутствие опечаток при указании имени таблицы и колонок
- безопасность при переименовании полей (IDE подскажет все упоминания)

### Создание элементов
```go
post := userposts.SchemaItem{
  UserId:    "user123",
  CreatedAt: 1640995200,
  Status:    "published",
  Title:     "Заголовок поста",
  Content:   "Содержание...",
  Views:     0,
}

// Маршалинг для DynamoDB
item, err := userposts.PutItem(post)
if err != nil {
  log.Fatal(err)
}

// Сохранение в DynamoDB
_, err = client.PutItem(ctx, &dynamodb.PutItemInput{
  TableName: aws.String(userposts.TableName),
  Item:      item,
}

// Получение элемента из DynamoDB
key, err := userposts.CreateKey("user123", 1640995200)
if err != nil {
    log.Fatal(err)
}
output, err := client.GetItem(ctx, &dynamodb.GetItemInput{
    TableName: aws.String(userposts.TableName),
    Key:       key,
})
if err != nil {
    log.Fatal(err)
}

var fetched userposts.SchemaItem
err = attributevalue.UnmarshalMap(output.Item, &fetched)
if err != nil {
    log.Fatal(err)
}
log.Printf("Извлечённый элемент: %+v", fetched)
```

**Создание ключа для операций:**
```go
// Создание ключа из значений
key, err := userposts.CreateKey("user123", 1640995200)
if err != nil {
  log.Fatal(err)
}

// Извлечение ключа из существующего элемента
key, err := userposts.CreateKeyFromItem(post)
if err != nil {
  log.Fatal(err)
}

// Использование для GetItem
result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
  TableName: aws.String(userposts.TableName),
  Key:       key,
})
```

### Пакетные операции

**Подготовка пакета элементов:**
```go
posts := []userposts.SchemaItem{
  {UserId: "user1", CreatedAt: 1640995200, Title: "Пост 1", Status: "published"},
  {UserId: "user2", CreatedAt: 1640995300, Title: "Пост 2", Status: "draft"},
  {UserId: "user3", CreatedAt: 1640995400, Title: "Пост 3", Status: "published"},
}

batchItems, err := userposts.BatchPutItems(posts)
if err != nil {
  log.Fatal(err)
}
```

**Использование с AWS BatchWriteItem:**
```go
// Конвертация в WriteRequest
writeRequests := make([]types.WriteRequest, len(batchItems))
for i, item := range batchItems {
  writeRequests[i] = types.WriteRequest{
    PutRequest: &types.PutRequest{Item: item},
  }
}

// Выполнение пакетной записи
_, err = client.BatchWriteItem(ctx, &dynamodb.BatchWriteItemInput{
  RequestItems: map[string][]types.WriteRequest{
    userposts.TableName: writeRequests,
  },
})
```

## QueryBuilder
### Базовые запросы

**Создание QueryBuilder:**
```go
qb := userposts.NewQueryBuilder()
```

**Простой запрос по hash key:**
```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  Execute(ctx, dynamoClient)
```

**Запрос с hash и range key:**
```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithCreatedAt(1640995200).
  Execute(ctx, dynamoClient)
```

### Условия фильтрации

**Фильтрация по атрибутам:**
```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").          // KeyCondition (hash key)
  WithStatus("published").        // KeyCondition (если StatusIndex) ИЛИ FilterExpression  
  WithTitle("Важная новость").    // FilterExpression
  Execute(ctx, dynamoClient)
```

::: danger
QueryBuilder автоматически определяет тип условия:
- **KeyCondition** - атрибуты, которые являются ключами в выбранном индексе (эффективно)
- **FilterExpression** - все остальные атрибуты (неэффективно, фильтрация после чтения)

В примере выше:
- `WithUserId` → KeyCondition (hash key основной таблицы)
- `WithStatus` → KeyCondition (если выбран StatusIndex) или FilterExpression
- `WithTitle` → FilterExpression (увеличивает RCU, так как DynamoDB сначала читает все записи пользователя, потом фильтрует по заголовку)
:::

**Оптимальные запросы (только KeyConditions):**
```go
// Эффективно: используется только StatusIndex
posts, err := userposts.NewQueryBuilder().
  WithStatus("published").        // KeyCondition (StatusIndex hash key)
  WithCreatedAtGreaterThan(ts).   // KeyCondition (StatusIndex range key)
  Execute(ctx, dynamoClient)
```

**Комбинирование условий:**
```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithStatus("published").
  WithViewsGreaterThan(100).  // Популярные посты
  Execute(ctx, dynamoClient)
```

### Диапазонные запросы
Для числовых атрибутов доступны диапазонные условия:

**Больше/меньше:**
```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithCreatedAtGreaterThan(1640990000).  // Посты после даты
  Execute(ctx, dynamoClient)

posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithViewsLessThan(1000).  // Посты с малым количеством просмотров
  Execute(ctx, dynamoClient)
```

**Диапазон между значениями:**
```go
var(
  startDate = 1640995000
  endDate   = 1640999000
)

posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithCreatedAtBetween(startDate, endDate). 
  Execute(ctx, dynamoClient)
```

### Сортировка и пагинация

**Управление сортировкой:**
```go
// По возрастанию (по умолчанию)
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  OrderByAsc().
  Execute(ctx, dynamoClient)

// По убыванию
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  OrderByDesc().
  Execute(ctx, dynamoClient)
```

**Ограничение результатов:**
```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  Limit(10).
  Execute(ctx, dynamoClient)
```

**Пагинация:**
```go
// Первый запрос
qb := userposts.NewQueryBuilder().
  WithUserId("user123").
  Limit(10)

posts, err := qb.Execute(ctx, dynamoClient)

// Получение LastEvaluatedKey из результата DynamoDB
// (требует прямого вызова BuildQuery + Query)
queryInput, err := qb.BuildQuery()
result, err := client.Query(ctx, queryInput)

// Следующая страница
if result.LastEvaluatedKey != nil {
  nextPosts, err := userposts.NewQueryBuilder().
    WithUserId("user123").
    StartFrom(result.LastEvaluatedKey).
    Limit(10).
    Execute(ctx, dynamoClient)
}
```

### Работа с композитными ключами
Для схем с композитными ключами генерируются специальные методы:

**Схема с композитным ключом:**
```json
"secondary_indexes": [
  {
    "name": "CategoryStatusIndex",
    "hash_key": "category#status",
    "range_key": "created_at",
    "projection_type": "ALL"
  }
]
```

**Использование композитного ключа:**
```go
posts, err := userposts.NewQueryBuilder().
  WithCategoryStatusIndexHashKey("tech", "published").  // category="tech", status="published"
  WithCreatedAtGreaterThan(1640990000).
  Execute(ctx, dynamoClient)
```

**Сложные композитные ключи:**
```go
// Для ключа "level#category#status"
posts, err := userposts.NewQueryBuilder().
  WithLevelCategoryStatusIndexHashKey("beginner", "tech", "published").
  OrderByDesc().
  Execute(ctx, dynamoClient)
```

### Выбор индексов
QueryBuilder автоматически выбирает наиболее подходящий индекс:

**Принципы выбора индекса:**
1. Предпочтение пользовательскому выбору через `WithPreferredSortKey`
2. Более сложные композитные ключи имеют приоритет
3. Доступность всех необходимых атрибутов в индексе

**Ручной выбор индекса:**
```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithStatus("published").
  WithPreferredSortKey("created_at").  // Принудительно использовать индекс с created_at
  Execute(ctx, dynamoClient)
```

**Построение запроса без выполнения:**
```go
queryInput, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithStatus("published").
  BuildQuery()  // Возвращает *dynamodb.QueryInput

if err != nil {
  log.Fatal(err)
}

// Проверка выбранного индекса
if queryInput.IndexName != nil {
  fmt.Printf("Используется индекс: %s\n", *queryInput.IndexName)
} else {
  fmt.Println("Используется основная таблица")
}

// Ручное выполнение запроса
result, err := client.Query(ctx, queryInput)
```

## DynamoDB Streams
### Извлечение данных из событий

**Ручное извлечение данных из Stream записи:**
```go
func processStreamRecord(record events.DynamoDBEventRecord) error {
  item, err := userposts.ExtractFromDynamoDBStreamEvent(record)
  if err != nil {
    return fmt.Errorf("failed to extract item: %w", err)
  }

  log.Printf("Обработка записи: %+v", item)
  return nil
}
```

**Пакетная обработка Stream событий:**
```go
func handleStreamEvent(ctx context.Context, event events.DynamoDBEvent) error {
  for _, record := range event.Records {
    switch record.EventName {
    case "INSERT":
      item, err := userposts.ExtractFromDynamoDBStreamEvent(record)
      if err != nil {
        return err
      }
      log.Printf("Новый пост: %s", item.Title)
                
    case "MODIFY":
      item, err := userposts.ExtractFromDynamoDBStreamEvent(record)
        if err != nil {
          return err
        }
        log.Printf("Изменен пост: %s", item.Title)
      }
      return nil
  }
}
```

### Отслеживание изменений
**Проверка изменения конкретных полей:**
```go
func analyzePostChanges(record events.DynamoDBEventRecord) {
  if record.EventName != "MODIFY" {
    return
  }
       
  // Проверка изменения заголовка
  if userposts.IsFieldModified(record, "title") {
    log.Println("Заголовок поста был изменен")
  }
       
  // Проверка изменения статуса
  if userposts.IsFieldModified(record, "status") {
    log.Println("Статус поста был изменен")
  }
       
  // Проверка изменения содержимого
  if userposts.IsFieldModified(record, "content") {
    log.Println("Содержимое поста было изменено")
  }
       
  // Проверка изменения количества просмотров
  if userposts.IsFieldModified(record, "views") {
    log.Println("Количество просмотров изменилось")
  }
}
```

## Утилиты

**Создание ключа для DynamoDB операций:**
```go
// Из отдельных значений
key, err := userposts.CreateKey("user123", 1640995200)
if err != nil {
  log.Fatal(err)
}
   
// Использование с GetItem
result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
  TableName: aws.String(userposts.TableName),
  Key:       key,
})
```

**Извлечение ключа из существующего элемента:**
```go
post := userposts.SchemaItem{
  UserId:    "user123",
  CreatedAt: 1640995200,
  Title:     "Мой пост",
}
   
// GoDyno извлекает только ключевые поля
key, err := userposts.CreateKeyFromItem(post)
if err != nil {
  log.Fatal(err)
}
   
// Использование для DeleteItem
_, err = client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
  TableName: aws.String(userposts.TableName),
  Key:       key,
})
```

### Конвертация типов

**Булевые значения в DynamoDB-совместимые числа:**
```go
dbValue := userposts.BoolToInt(true) // → 1
isActive := userposts.IntToBool(1)   // → true
```

### Вспомогательные функции

**Маршалинг одного элемента:**
```go
post := userposts.SchemaItem{
  UserId:    "user123",
  CreatedAt: 1640995200,
  Title:     "Заголовок",
  Content:   "Содержание",
  Views:     0,
}

// Преобразование в DynamoDB AttributeValue
item, err := userposts.PutItem(post)
if err != nil {
  log.Fatal(err)
}
```

**Пакетное преобразование:**
```go
posts := []userposts.SchemaItem{
  {UserId: "user1", CreatedAt: 1640995200, Title: "Пост 1"},
  {UserId: "user2", CreatedAt: 1640995300, Title: "Пост 2"},
  {UserId: "user3", CreatedAt: 1640995400, Title: "Пост 3"},
}
   
// Преобразование всех элементов для BatchWriteItem
batchItems, err := userposts.BatchPutItems(posts)
if err != nil {
  log.Fatal(err)
}
```

**Конвертация произвольных данных:**
```go
// Преобразование map[string]any в DynamoDB AttributeValue
data := map[string]any{
  "title":      "Заголовок",
  "views":      42,
  "is_active":  true,
  "metadata":   map[string]any{"source": "api"},
  "tags":       []any{"go", "dynamodb"},
}
   
attrs, err := userposts.ConvertMapToAttributeValues(data)
if err != nil {
  log.Fatal(err)
}
```

## AWS интеграция
**Пример работы с AWS sdk:**
```go
package main
   
import (
  "context"
  "log"
       
  "github.com/aws/aws-sdk-go-v2/aws"
  "github.com/aws/aws-sdk-go-v2/config"
  "github.com/aws/aws-sdk-go-v2/service/dynamodb"
  "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
       
  userposts "your-project/generated/user_posts"
)
   
func main() {
  // Настройка
  cfg, _ := config.LoadDefaultConfig(context.TODO())
  client := dynamodb.NewFromConfig(cfg)
  ctx := context.Background()
       
  // Создание поста
  post := userposts.SchemaItem{
    UserId:    "user123",
    CreatedAt: 1640995200, 
    Title:     "Тест", 
    Status:    "published", 
    Views:     0,
  }
       
  item, _ := userposts.PutItem(post)
  client.PutItem(ctx, &dynamodb.PutItemInput{
    TableName: aws.String(userposts.TableName),
    Item:      item,
  })
       
  // Поиск постов
  posts, _ := userposts.NewQueryBuilder().
    WithUserId("user123").
    WithStatus("published").
    Execute(ctx, client)
       
  log.Printf("Найдено %d постов", len(posts))
       
  // Обновление просмотров
  key, _ := userposts.CreateKeyFromItem(post)
  client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
    TableName: aws.String(userposts.TableName),
    Key:       key,
    UpdateExpression: aws.String("ADD #views :inc"),
    ExpressionAttributeNames: map[string]string{
      "#views": userposts.ColumnViews,
    },
    ExpressionAttributeValues: map[string]types.AttributeValue{
      ":inc": &types.AttributeValueMemberN{Value: "1"},
    },
  })
   
  log.Println("✅ Готово!")
}
```

## Terraform интеграция
### Модуль для DynamoDB
Создайте Terraform модуль, который принимает JSON схему:

**terraform/modules/dynamodb/main.tf:**
```tf
locals {
  schema = jsondecode(file(var.schema_file))
}

resource "aws_dynamodb_table" "this" {
  name             = local.schema.table_name
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = local.schema.hash_key
  range_key        = local.schema.range_key
  stream_enabled   = var.enable_streams
  stream_view_type = var.enable_streams ? "NEW_AND_OLD_IMAGES" : null

  dynamic "attribute" {
    for_each = local.schema.attributes

    content {
      name = attribute.value.name
      type = attribute.value.type
    }
  }

  dynamic "global_secondary_index" {
    for_each = local.schema.secondary_indexes

    content {
      name               = global_secondary_index.value.name
      hash_key           = global_secondary_index.value.hash_key
      range_key          = try(global_secondary_index.value.range_key, null)
      projection_type    = global_secondary_index.value.projection_type
      non_key_attributes = try(global_secondary_index.value.non_key_attributes, null)
    }
  }

  tags = var.tags
}
```

**terraform/modules/dynamodb/variables.tf:**
```tf
variable "schema_file" {
  description = "Path to JSON schema file"
  type        = string
}

variable "enable_streams" {
  description = "Enable DynamoDB Streams"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
```

### Использование JSON схем

**Основной Terraform файл:**
```tf
module "user_posts_table" {
  source = "./terraform/modules/dynamodb"

  schema_file    = "${path.module}/schemas/user-posts.json"
  enable_streams = true

  tags = {
    Environment = "production"
    Project     = "blog-platform"
  }
}

module "categories_table" {
  source = "./terraform/modules/dynamodb"

  schema_file = "${path.module}/schemas/categories.json"

  tags = {
    Environment = "production"
    Project     = "blog-platform"
  }
}
```

## LocakStack интеграция
**Пример работы с localstack:**
```go
package main
   
import (
  "context"
  "log"
       
  "github.com/aws/aws-sdk-go-v2/aws"
  "github.com/aws/aws-sdk-go-v2/config"
  "github.com/aws/aws-sdk-go-v2/credentials"
  "github.com/aws/aws-sdk-go-v2/service/dynamodb"
  "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
       
  userposts "your-project/generated/user_posts"
)
   
func main() {
  // Настройка для LocalStack
  cfg, _ := config.LoadDefaultConfig(context.TODO(),
    config.WithCredentialsProvider(credentials.StaticCredentialsProvider{
      Value: aws.Credentials{AccessKeyID: "test", SecretAccessKey: "test"},
    }),
  )
       
  client := dynamodb.NewFromConfig(cfg, func(o *dynamodb.Options) {
    o.BaseEndpoint = aws.String("http://localhost:4566")
  })
  ctx := context.Background()
       
  // Создание таблицы
  schema := userposts.TableSchema
  client.CreateTable(ctx, &dynamodb.CreateTableInput{
    TableName: aws.String(schema.TableName),
    KeySchema: []types.KeySchemaElement{
      {AttributeName: aws.String(schema.HashKey), KeyType: types.KeyTypeHash},
      {AttributeName: aws.String(schema.RangeKey), KeyType: types.KeyTypeRange},
    },
    AttributeDefinitions: []types.AttributeDefinition{
      {AttributeName: aws.String(schema.HashKey), AttributeType: types.ScalarAttributeTypeS},
      {AttributeName: aws.String(schema.RangeKey), AttributeType: types.ScalarAttributeTypeN},
    },
    BillingMode: types.BillingModePayPerRequest,
  })
       
  // Создание поста 
  post := userposts.SchemaItem{
    UserId: "user123", CreatedAt: 1640995200,
    Title: "LocalStack тест", Status: "published", Views: 0,
  }
       
  item, _ := userposts.PutItem(post)
  client.PutItem(ctx, &dynamodb.PutItemInput{
    TableName: aws.String(userposts.TableName),
    Item:      item,
  })
       
  // Поиск постов
  posts, _ := userposts.NewQueryBuilder().
    WithUserId("user123").
    Execute(ctx, client)
       
  log.Printf("В LocalStack найдено %d постов", len(posts))
  log.Println("✅ LocalStack работает!")
}
```