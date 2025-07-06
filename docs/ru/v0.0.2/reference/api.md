---
outline: [2, 5]
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

# Описание API

## Константы
### TableName
Имя таблицы DynamoDB.
```go
const TableName = "table-name"
```

### Column
Имена столбцов таблицы.
```go
const ColumnId = "id"
const ColumnEmail = "email"
const ColumnTimestamp = "timestamp"
```
::: tip Нейминг колонок
Названия всех описанных в таблице колонок начинаются с `Column` и используют CamelCase синтаксис
:::

### Index
Имена вторичных индексов.
```go
const IndexEmailIndex = "email-index"
```
::: tip Нейминг индексов
Названия всех описанных в таблице индексов начинаются с `Index` и используют CamelCase синтаксис
:::

### Attribute
Cлайс строк со всеми именами атрибутов таблицы DynamoDB.
```go
var AttributeNames = []string{"id", "timestamp", "email"}
```

### KeyAttribute
Cлайс строк с первичными ключами таблицы DynamoDB.
```go
var KeyAttributeNames = []string{"id", "timestamp"}
```

## Структуры данных
### SchemaItem
Структура, которая представляет одну запись в DynamoDB.
```go
type SchemaItem struct {
  Id        string `dynamodbav:"id"`
  Email     string `dynamodbav:"email"`
  Timestamp int64  `dynamodbav:"timestamp"`
}
```

### TableSchema
Глобальная переменная типа `DynamoSchema`, которая содержит всю мета-информацию о таблице.
```go
var TableSchema = DynamoSchema{
  TableName: "table-name",
  HashKey:   "id",
  RangeKey:  "timestamp",
  // ...
}
```
::: details Подробнее...
```go
var TableSchema = DynamoSchema{
   TableName: "user-profiles",
   HashKey:   "user_id",
   RangeKey:  "profile_type",
   
   Attributes: []Attribute{
       {Name: "user_id", Type: "S"},
       {Name: "profile_type", Type: "S"},
       {Name: "created_at", Type: "N"},
       {Name: "status", Type: "S"},
   },
   
   CommonAttributes: []Attribute{
       {Name: "email", Type: "S"},
       {Name: "is_active", Type: "BOOL"},
       {Name: "tags", Type: "SS"},
       {Name: "scores", Type: "NS"},
   },
   
   SecondaryIndexes: []SecondaryIndex{
       {
           Name:           "status-created-index",
           HashKey:        "status",
           RangeKey:       "created_at",
           ProjectionType: "ALL",
       },
       {
           Name:           "category-profile-index", 
           HashKey:        "category_id",
           RangeKey:       "profile_type",
           ProjectionType: "INCLUDE",
           NonKeyAttributes: []string{"email", "is_active"},
       },
       {
           Name:             "user-created-lsi",
           HashKey:          "user_id",
           RangeKey:         "created_at",
           ProjectionType:   "KEYS_ONLY",
           HashKeyParts: []CompositeKeyPart{
               {IsConstant: false, Value: "user_id"},
               {IsConstant: true, Value: "PROFILE"},
           },
           RangeKeyParts: []CompositeKeyPart{
               {IsConstant: false, Value: "created_at"},
               {IsConstant: true, Value: "2024"},
           },
       },
   },
   
   FieldsMap: map[string]FieldInfo{
       "user_id": {
           DynamoType:       "S",
           IsKey:            true,
           IsHashKey:        true,
           IsRangeKey:       false,
           AllowedOperators: buildAllowedOperators("S"),
       },
       "profile_type": {
           DynamoType:       "S",
           IsKey:            true,
           IsHashKey:        false,
           IsRangeKey:       true,
           AllowedOperators: buildAllowedOperators("S"),
       },
       "created_at": {
           DynamoType:       "N",
           IsKey:            false,
           IsHashKey:        false,
           IsRangeKey:       false,
           AllowedOperators: buildAllowedOperators("N"),
       },
       "status": {
           DynamoType:       "S",
           IsKey:            false,
           IsHashKey:        false,
           IsRangeKey:       false,
           AllowedOperators: buildAllowedOperators("S"),
       },
       "email": {
           DynamoType:       "S",
           IsKey:            false,
           IsHashKey:        false,
           IsRangeKey:       false,
           AllowedOperators: buildAllowedOperators("S"),
       },
       "is_active": {
           DynamoType:       "BOOL",
           IsKey:            false,
           IsHashKey:        false,
           IsRangeKey:       false,
           AllowedOperators: buildAllowedOperators("BOOL"),
       },
       "tags": {
           DynamoType:       "SS",
           IsKey:            false,
           IsHashKey:        false,
           IsRangeKey:       false,
           AllowedOperators: buildAllowedOperators("SS"),
       },
       "scores": {
           DynamoType:       "NS",
           IsKey:            false,
           IsHashKey:        false,
           IsRangeKey:       false,
           AllowedOperators: buildAllowedOperators("NS"),
       },
   },
}
```
:::

## QueryBuilder
::: danger `With` / `Filter`  
- `With` _(WithEQ, WithGT и т.д.)_  
Применяются **`ДО`** чтения данных из DynamoDB и определяют какие элементы будут прочитаны.

- `Filter` _(FilterEQ, FilterGT и т.д.)_  
Применяются **`ПОСЛЕ`** чтения данных и влияют только на то, что возвращается в результате.  
:::

### NewQueryBuilder
Создает новый `QueryBuilder`.
```go
func NewQueryBuilder() *QueryBuilder
```

### qb.Limit
Устанавливает лимит результатов.
```go
func (qb *QueryBuilder) Limit(limit int) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  Limit(10)

queryInput, err := query.BuildQuery()
if err != nil {
    return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
    return err
}

for _, item := range items {
    fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

### qb.WithIndex
Принудительно указывает, какой `secondary index` использовать для запроса вместо автоматического выбора.
```go
func (qb *QueryBuilder) WithIndex(indexName string) *QueryBuilder
```
::: danger !!! [Баг](https://github.com/Mad-Pixels/go-dyno/issues/67) в версии клиента v0.0.2.
метод не будет сгенерирован в `min` версии.
:::
::: details Пример
Схема с множеством индексов:
```json

{
  "table_name": "user-orders",
  "hash_key": "user_id",
  "range_key": "order_id", 
  "attributes": [
    {"name": "user_id", "type": "S"},
    {"name": "order_id", "type": "S"},
    {"name": "status", "type": "S"}
  ],
  "secondary_indexes": [
    {
      "name": "lsi_by_status",
      "type": "LSI",
      "hash_key": "user_id",
      "range_key": "status"
    },
    {
      "name": "gsi_by_status", 
      "type": "GSI",
      "hash_key": "status"
    }
  ]
}
```
Примеры запросов:
```go
query1 := userorders.NewQueryBuilder().
  WithEQ("user_id", "user123")

input1, _ := query1.BuildQuery()
fmt.Printf("Auto: %s\n", *input1.IndexName)
// Output: Auto: lsi_by_status

query2 := userorders.NewQueryBuilder().
  WithEQ("user_id", "user123").
  WithEQ("status", "active").
  WithIndex("gsi_by_status")

input2, _ := query2.BuildQuery()
fmt.Printf("Forced: %s\n", *input2.IndexName)
// Output: Forced: gsi_by_status
```
:::
::: tip Дополнительно
`Без WithIndex:`
- QueryBuilder автоматически выбирает оптимальный индекс
- Ищет GSI/LSI который поддерживает твои ключи

`С WithIndex:`
- QueryBuilder принудительно использует указанный индекс
- Игнорирует автоматический выбор
:::

### qb.StartFrom
Устанавливает стартовый ключ для пагинации.
```go
func (qb *QueryBuilder) StartFrom(
  lastEvaluatedKey map[string]types.AttributeValue,
) *QueryBuilder
```
::: details Пример
```go
var lastKey map[string]types.AttributeValue

query1 := userorders.NewQueryBuilder().
    WithEQ("user_id", "user123").
    FilterEQ("status", "active").
    Limit(10)

result1, err := client.Query(ctx, query1Input)
lastKey = result1.LastEvaluatedKey

query2 := userorders.NewQueryBuilder().
    WithEQ("user_id", "user123").
    FilterEQ("status", "active").
    StartFrom(lastKey).
    Limit(10)
```
:::
::: tip **`LastEvaluatedKey`** может быть **`null`** даже если есть больше данных и размер ответа превышает `1MB`.  

_Всегда проверяйте наличие LastEvaluatedKey для продолжения пагинации._
:::

### qb.OrderByDesc
Устанавливает сортировку по убыванию для sort key.
```go
func (qb *QueryBuilder) OrderByDesc() *QueryBuilder
```
::: details Пример
```go
query := userorders.NewQueryBuilder().
    WithEQ("user_id", "user123").
    OrderByDesc()

queryInput, err := query.BuildQuery()
if err != nil {
    return err
}

items, err := query.Execute(ctx, dynamoClient)
if err != nil {
    return err
}

for _, item := range items {
    fmt.Printf("Order: %s, Date: %s\n", item.OrderId, item.CreatedAt)
}
```
:::
::: tip `OrderByDesc` влияет только на сортировку по sort key, не на результаты фильтров.
:::

### qb.OrderByAsc
Устанавливает сортировку по возравстанию для sort key.
```go
func (qb *QueryBuilder) OrderByAsc() *QueryBuilder
```
::: details Пример
```go
query := userorders.NewQueryBuilder().
    WithEQ("user_id", "user123").
    OrderByAsc()

queryInput, err := query.BuildQuery()
if err != nil {
    return err
}

items, err := query.Execute(ctx, dynamoClient)
if err != nil {
    return err
}

for _, item := range items {
    fmt.Printf("Order: %s, Date: %s\n", item.OrderId, item.CreatedAt)
}
```
:::
::: tip `OrderByAsc` влияет только на сортировку по sort key, не на результаты фильтров.
:::

### qb.WithPreferredSortKey
Подсказывает алгоритму выбора индекса предпочтительный sort key.
```go
func (qb *QueryBuilder) WithPreferredSortKey(key string) *QueryBuilder
```
::: details Пример
```go
// Есть несколько индексов с одинаковым hash key:
// - lsi_by_status (sort: status)  
// - lsi_by_created_at (sort: created_at)
// - lsi_by_priority (sort: priority)

query1 := userorders.NewQueryBuilder().
    WithEQ("user_id", "user123").
    WithEQ("status", "active")
// Может выбрать любой из подходящих индексов

query2 := userorders.NewQueryBuilder().
    WithEQ("user_id", "user123").
    WithEQ("status", "active").
    WithPreferredSortKey("created_at")
// Выберет lsi_by_created_at если возможно

items, err := query2.Execute(ctx, dynamoClient)
```
:::
::: tip Когда использовать
Используй WithPreferredSortKey:
- Есть несколько индексов, подходящих для запроса
- Хочешь получить результаты в определенном порядке сортировки
- Знаешь, какой индекс работает лучше для твоего случая
:::

::: warning Важно
WithPreferredSortKey это только подсказка, не принуждение!

✅ Алгоритм предпочтет индекс с указанным sort key  
❌ Но может выбрать другой, если подходящего нет  
🎯 Для принудительного выбора используй `WithIndex(indexName)`
:::

### qb.With
Добавляет условие для запросов в DynamoDB.  
Принимает:
- `field` - имя поля
- `value` - значение
- `op` - тип операции
```go
func (qb *QueryBuilder) With(
  field string, 
  op OperatorType, 
  values ...any,
) *QueryBuilder
```
::: warning Влияние на запрос:
Все методы `With` приминяются **`ДО`** чтения данных из DynamoDB.  
_(это быстрее и дешевле чем `Filter`)_
:::
::: details Пример
```go
query := NewQueryBuilder().With("user_id", EQ, "123")

queryInput, err := query.BuildQuery()
if err != nil {
    return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
    return err
}

for _, item := range items {
    fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

#### Сахар
::: tip Методы генерируются только при генерации с типом `all`:
```bash
godyno -s schema.json -o ./gen -mode all
godyno -s schema.json -o ./gen
```

В min режиме используй универсальный метод With:
```go
query
  .With("user_id", EQ, "123")
  .With("created_at", GT, timestamp)

query
  .With("status", BETWEEN, "active", "pending")
  .With("priority", LTE, 100)
```
:::

##### qb.WithEQ
Добавляет условие `равно` для sort key.
```go
func (qb *QueryBuilder) WithEQ(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  WithEQ("created_at", timestamp)

queryInput, err := query.BuildQuery()
if err != nil {
    return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
    return err
}

for _, item := range items {
    fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

##### qb.WithGT
Добавляет условие `больше` для sort key.
```go
func (qb *QueryBuilder) WithGT(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().WithGT("created_at", yesterdayTimestamp)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.WithLT
Добавляет условие `меньше` для sort key.
```go
func (qb *QueryBuilder) WithLT(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().WithLT("created_at", yesterdayTimestamp)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.WithGTE
Добавляет условие `больше или равно` для sort key.
```go
func (qb *QueryBuilder) WithGTE(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().WithGTE("created_at", yesterdayTimestamp)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.WithLTE
Добавляет условие `меньше или равно` для sort key.
```go
func (qb *QueryBuilder) WithLTE(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().WithLTE("created_at", yesterdayTimestamp)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.WithBetween
Добавляет `условие диапазона` для sort key.
```go
func (qb *QueryBuilder) WithBetween(field string, start, end any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().WithBetween("created_at", yesterdayTimestamp, todayTimestamp)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.WithBeginsWith
Добавляет условие `начинается с` для sort key.
```go
func (qb *QueryBuilder) WithBeginsWith(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().WithBeginsWith("created_at", yesterdayTimestamp)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

### qb.WithProjection
Указывает какие конкретные поля вернуть из DynamoDB вместо всех полей записи.
```go
func (qb *QueryBuilder) WithProjection(attributes []string) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
    WithEQ("user_id", "123").
    WithProjection([]string{"id", "email", "created_at"})

queryInput, err := query.BuildQuery()
if err != nil {
    return err
}

items, err := query.Execute(ctx, dynamoClient)
if err != nil {
    return err
}

for _, item := range items {
    fmt.Printf("ID: %s, Email: %s, Created: %s\n", 
        item.Id, item.Email, item.CreatedAt)
}
```
:::
::: tip 
Без WithProjection:
```go
type SchemaItem struct {
    Id          string   // ✅
    Name        string   // ✅ 
    Email       string   // ✅
    Description string   // ✅ (не нужно, но вернётся)
    Content     string   // ✅ (не нужно, но вернётся)
    Tags        []string // ✅ (не нужно, но вернётся)
    ViewCount   int      // ✅ (не нужно, но вернётся)
}
```

С WithProjection:
```go
// Возвращает ТОЛЬКО указанные поля
WithProjection([]string{"id", "name", "email"})

// В результате будут только:
type PartialItem struct {
    Id    string  // ✅
    Name  string  // ✅
    Email string  // ✅
    // Description - отсутствует
    // Content - отсутствует  
    // Tags - отсутствует
    // ViewCount - отсутствует
}
```
:::
::: warning Проекция **снижает потребление `bandwidth`** но **НЕ снижает `RCU`** - вы платите за чтение всех атрибутов элемента.
:::

### qb.Filter
Добавляет условие для фильтрации полученныйх из DynamoDB значений.  
Принимает:
- `field` - имя поля
- `value` - значение
- `op` - тип операции
```go
func (qb *QueryBuilder) Filter(
  field string, 
  op OperatorType, 
  values ...any,
) *QueryBuilder
```
::: warning Влияние на запрос:
Все методы `Filter` приминяются **`ПОСЛЕ`** чтения данных из DynamoDB.  
_(используйте с умом)_
:::
::: details Пример
```go
query := NewQueryBuilder().
  With("user_id", EQ, "123").
  Filter("status", CONTAINS, "active")

queryInput, err := query.BuildQuery()
if err != nil {
    return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
    return err
}

for _, item := range items {
    fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

#### Сахар
::: tip Методы генерируются только при генерации с типом `all`
```bash
godyno -s schema.json -o ./gen -mode all
godyno -s schema.json -o ./gen
```
В min режиме используй универсальный метод Filter:
```go
query
  .Filter("status", EQ, "active")
  .Filter("priority", BETWEEN, 80, 100)
```
:::

##### qb.FilterEQ
Добавляет фильтр `равенства`.
```go
func (qb *QueryBuilder) FilterEQ(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterEQ("age", 18)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterNE
Добавляет фильтр `неравенства`.
```go
func (qb *QueryBuilder) FilterNE(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterNE("age", 18)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterGT
Добавляет фильтр `больше`.
```go
func (qb *QueryBuilder) FilterGT(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterGT("age", 18)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterLT
Добавляет фильтр `меньше`.
```go
func (qb *QueryBuilder) FilterLT(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterLT("age", 18)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterGTE
Добавляет фильтр `больше или равно`.
```go
func (qb *QueryBuilder) FilterGTE(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterGTE("age", 18)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterLTE
Добавляет фильтр `меньше или равно`.
```go
func (qb *QueryBuilder) FilterLTE(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterLTE("age", 18)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterBetween
Добавляет фильтр `диапазона`.
```go
func (qb *QueryBuilder) FilterBetween(field string, start, end any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterBetween("age", 18, 35)

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterContains
Добавляет фильтр `содержит`.
```go
func (qb *QueryBuilder) FilterContains(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterContains("email", "@gmail.com")

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterNotContains
Добавляет фильтр `НЕ содержит`.
```go
func (qb *QueryBuilder) FilterNotContains(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterNotContains("email", "@gmail.com")

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterBeginsWith
Добавляет фильтр `начинается с`.
```go
func (qb *QueryBuilder) FilterBeginsWith(field string, value any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterBeginsWith("email", "alex")

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterIn
Добавляет фильтр `входит в список`.
```go
func (qb *QueryBuilder) FilterIn(field string, values ...any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterIn("email", []string{"alex@gmail.com", "john@gmail.com"})

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterNotIn
Добавляет фильтр `НЕ входит в список`.
```go
func (qb *QueryBuilder) FilterNotIn(field string, values ...any) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterNotIn("email", []string{"alex@gmail.com", "john@gmail.com"})

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterExists
Добавляет фильтр `НЕ пустое поле`.
```go
func (qb *QueryBuilder) FilterExists(field string) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterExists("email")

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### qb.FilterNotExists
Добавляет фильтр `пустое поле`.
```go
func (qb *QueryBuilder) FilterNotExists(field string) *QueryBuilder
```
::: details Пример
```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  FilterNotExists("email")

queryInput, err := query.BuildQuery()
if err != nil {
  return err
}
items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

### qb.BuildQuery
Строит DynamoDB QueryInput.
```go
func (qb *QueryBuilder) BuildQuery() (*dynamodb.QueryInput, error)
```

### qb.Execute
Выполняет запрос.
```go
func (qb *QueryBuilder) Execute(
  ctx context.Context, 
  client *dynamodb.Client,
) (
  []SchemaItem, 
  error,
)
```

## ScanBuilder
::: warning Scan читает всю таблицу.
:::
### NewScanBuilder
Создает новый `ScanBuilder`.
```go
func NewScanBuilder() *ScanBuilder
```

### sb.WithIndex
Принудительно указывает, какой `secondary index` использовать для запроса вместо автоматического выбора.
```go
func (sb *ScanBuilder) WithIndex(indexName string) *ScanBuilder
```
::: info Выполняем сканирование по конкретному индексу
- **GSI** (Global Secondary Index) имеют отдельные RCU/WCU настройки.  
- **LSI** (Local Secondary Index) используют RCU/WCU основной таблицы.
:::
::: details Пример
```go
scan := NewScanBuilder().
  WithIndex("status-index").
  FilterEQ("status", "active")

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

### sb.Limit
```go
func (sb *ScanBuilder) Limit(limit int) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterEQ("status", "active").
  Limit(10)

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

### sb.StartFrom
```go
func (sb *ScanBuilder) StartFrom(
  lastEvaluatedKey map[string]types.AttributeValue,
) *ScanBuilder
```
::: warning Пагинация
**`LastEvaluatedKey`** может быть **`null`** даже если есть больше данных и размер ответа превышает `1MB`.  

_Всегда проверяйте наличие LastEvaluatedKey для продолжения пагинации._
:::
::: details Пример
```go
var lastKey map[string]types.AttributeValue

scan1 := NewScanBuilder().
   FilterEQ("status", "active").
   Limit(10)

result1, err := dynamoClient.Scan(ctx, scan1Input)
lastKey = result1.LastEvaluatedKey

scan2 := NewScanBuilder().
   FilterEQ("status", "active").
   StartFrom(lastKey).
   Limit(10)
```
:::

### sb.WithProjection
Указывает какие конкретные поля вернуть из DynamoDB вместо всех полей записи.
```go
func (sb *ScanBuilder) WithProjection(attributes []string) *ScanBuilder
```
::: info 
Без WithProjection:
```go
type SchemaItem struct {
    Id          string   // ✅
    Name        string   // ✅ 
    Email       string   // ✅
    Description string   // ✅ (не нужно, но вернётся)
    Content     string   // ✅ (не нужно, но вернётся)
    Tags        []string // ✅ (не нужно, но вернётся)
    ViewCount   int      // ✅ (не нужно, но вернётся)
}
```

С WithProjection:
```go
// Возвращает ТОЛЬКО указанные поля
WithProjection([]string{"id", "name", "email"})

// В результате будут только:
type PartialItem struct {
    Id    string  // ✅
    Name  string  // ✅
    Email string  // ✅
    // Description - отсутствует
    // Content - отсутствует  
    // Tags - отсутствует
    // ViewCount - отсутствует
}
```
:::
::: warning Проекция **снижает потребление `bandwidth`** но **НЕ снижает `RCU`** - вы платите за чтение всех атрибутов элемента.
:::
::: details Пример
```go
scan := NewScanBuilder().
   FilterEQ("status", "active").
   WithProjection([]string{"id", "email", "created_at"})

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
   return err
}

for _, item := range items {
   fmt.Printf("ID: %s, Email: %s, Created: %s\n", 
       item.Id, item.Email, item.CreatedAt)
}
```
:::

### sb.WithParallelScan
```go
func (sb *ScanBuilder) WithParallelScan(
  totalSegments, 
  segment int,
) *ScanBuilder
```
::: warning Параллельное сканирование
Увеличивает потребление RCU пропорционально количеству сегментов. 

_Используйте осторожно в production среде._
:::

### sb.Filter
Добавляет условие для фильтрации полученныйх из DynamoDB значений.  
Принимает:
- `field` - имя поля
- `value` - значение
- `op` - тип операции
```go
func (sb *ScanBuilder) Filter(
  field string, 
  op OperatorType, 
  values ...any,
) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  Filter("user_id", EQ, "123").
  Filter("status", CONTAINS, "active")

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

#### Сахар
::: tip Методы генерируются только при генерации с типом `all`
```bash
godyno -s schema.json -o ./gen -mode all
godyno -s schema.json -o ./gen
```
В `min` режиме используй универсальный метод `Filter`:
```go
scan
  .Filter("status", EQ, "active")
  .Filter("priority", BETWEEN, 80, 100)
```
:::

##### sb.FilterEQ
Добавляет фильтр `равенства`.
```go
func (sb *ScanBuilder) FilterEQ(field string, value any) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterEQ("user_id", "123").

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

##### sb.FilterNE
Добавляет фильтр `неравенства`.
```go
func (sb *ScanBuilder) FilterNE(field string, value any) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterNE("user_id", "123").

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

##### sb.FilterGT
Добавляет фильтр `больше`.
```go
func (sb *ScanBuilder) FilterGT(field string, value any) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterGT("age", 18).

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

##### sb.FilterLT
Добавляет фильтр `меньше`.
```go
func (sb *ScanBuilder) FilterLT(field string, value any) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterLT("age", 18).

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

##### sb.FilterGTE
Добавляет фильтр `больше или равно`.
```go
func (sb *ScanBuilder) FilterGTE(field string, value any) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterGTE("age", 18).

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

##### sb.FilterLTE
Добавляет фильтр `меньше или равно`.
```go
func (sb *ScanBuilder) FilterLTE(field string, value any) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterLTE("age", 18).

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

##### sb.FilterBetween
Добавляет фильтр `диапазона`.
```go
func (sb *ScanBuilder) FilterBetween(
  field string, 
  start, 
  end any,
) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterBetween("age", 18, 35).

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

##### sb.FilterContains
Добавляет фильтр `содержит`.
```go
func (sb *ScanBuilder) FilterContains(field string, value any) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterContains("email", "@gmail.com").

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

##### sb.FilterNotContains
Добавляет фильтр `НЕ содержит`.
```go
func (sb *ScanBuilder) FilterNotContains(
  field string, 
  value any,
) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterContains("email", "@gmail.com").

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

##### sb.FilterBeginsWith
Добавляет фильтр `начинается С`.
```go
func (sb *ScanBuilder) FilterBeginsWith(field string, value any) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterBeginsWith("email", "alex").

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Status: %s\n", item.UserId, item.Status)
}
```
:::

##### sb.FilterIn
Добавляет фильтр `входит в список`.
```go
func (sb *ScanBuilder) FilterIn(field string, values ...any) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterIn("email", []string{"alex@gmail.com", "john@gmail.com"})

items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### sb.FilterNotIn
Добавляет фильтр `НЕ входит в список`.
```go
func (sb *ScanBuilder) FilterNotIn(field string, values ...any) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterNotIn("email", []string{"alex@gmail.com", "john@gmail.com"})

items, err := query.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### sb.FilterExists
Добавляет фильтр `НЕ пустое поле`.
```go
func (sb *ScanBuilder) FilterExists(field string) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterExists("email")

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

##### sb.FilterNotExists
Добавляет фильтр `пустое поле`.
```go
func (sb *ScanBuilder) FilterNotExists(field string) *ScanBuilder
```
::: details Пример
```go
scan := NewScanBuilder().
  FilterNotExists("email")

items, err := scan.Execute(ctx, dynamoClient)
if err != nil {
  return err
}

for _, item := range items {
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```
:::

### sb.BuildScan
info Строит DynamoDB ScanInput.
```go
func (sb *ScanBuilder) BuildScan() (*dynamodb.ScanInput, error)
```

### sb.Execute
Выполняет сканирование всей таблице.
```go
func (sb *ScanBuilder) Execute(
  ctx context.Context, 
  client *dynamodb.Client,
) (
  []SchemaItem, 
  error,
)
```

## Input Functions
### ItemInput
Преобразует SchemaItem в DynamoDB AttributeValue map.
```go
func ItemInput(item SchemaItem) (map[string]types.AttributeValue, error)
```

### KeyInput
Создает ключ из значений hash и range ключей.
```go
func KeyInput(
  hashKeyValue, 
  rangeKeyValue any,
) (
  map[string]types.AttributeValue, 
  error,
)
```
::: info `rangeKeyValue` может быть **`nil`** если таблица использует только hash key.
:::

### KeyInputFromRaw
Создает ключ из сырых значений с валидацией.
```go
func KeyInputFromRaw(
  hashKeyValue, 
  rangeKeyValue any,
) (
  map[string]types.AttributeValue, 
  error,
)
```

### KeyInputFromItem
Извлекает ключ из SchemaItem.
```go
func KeyInputFromItem(
  item SchemaItem,
) (
  map[string]types.AttributeValue, 
  error,
)
```

### UpdateItemInput
Преобразует SchemaItem в DynamoDB UpdateItemInput.
```go
UpdateItemInput(item SchemaItem) (*dynamodb.DeleteItemInput, error)
```

### UpdateItemInputFromRaw
Создает UpdateItemInput из сырых значений.
```go
func UpdateItemInputFromRaw(
  hashKeyValue, 
  rangeKeyValue any, 
  updates map[string]any,
) (
  *dynamodb.UpdateItemInput, 
  error,
)
```

### UpdateItemInputWithCondition
Создает UpdateItemInput с условным выражением.
```go
func UpdateItemInputWithCondition(
  hashKeyValue, 
  rangeKeyValue any, 
  updates map[string]any, 
  conditionExpression string, 
  conditionAttributeNames map[string]string, 
  conditionAttributeValues map[string]types.AttributeValue,
) (
  *dynamodb.UpdateItemInput, 
  error,
)
```

### UpdateItemInputWithExpression
Создает UpdateItemInput с expression builders.
```go
func UpdateItemInputWithExpression(
  hashKeyValue, 
  rangeKeyValue any, 
  updateBuilder expression.UpdateBuilder, 
  conditionBuilder *expression.ConditionBuilder,
) (
  *dynamodb.UpdateItemInput, 
  error,
)
```

### DeleteItemInput
Преобразует SchemaItem в DynamoDB DeleteItemInput.
```go
DeleteItemInput(item SchemaItem) (*dynamodb.DeleteItemInput, error)
```

### DeleteItemInputFromRaw
Создает DeleteItemInput из значений ключей.
```go
func DeleteItemInputFromRaw(
  hashKeyValue, 
  rangeKeyValue any,
) (
  *dynamodb.DeleteItemInput, 
  error,
)
```

### DeleteItemInputWithCondition
Создает DeleteItemInput с условным выражением.
```go
func DeleteItemInputWithCondition(
  hashKeyValue, 
  rangeKeyValue any, 
  conditionExpression string, 
  expressionAttributeNames map[string]string, 
  expressionAttributeValues map[string]types.AttributeValue,
) (
  *dynamodb.DeleteItemInput, 
  error,
)
```

### BatchItemsInput
Преобразует массив SchemaItem в массив AttributeValue maps.
```go
func BatchItemsInput(
  items []SchemaItem,
) (
  []map[string]types.AttributeValue, 
  error,
)
```
::: warning Максимум **`25`** элементов в одной batch операции. 

_Превышение лимита вернет ошибку._
:::

### BatchDeleteItemsInput
Создает BatchWriteItemInput для удаления элементов.
```go
func BatchDeleteItemsInput(
  keys []map[string]types.AttributeValue,
) (
  *dynamodb.BatchWriteItemInput, 
  error,
)
```
::: warning Максимум **`25`** элементов в одной batch операции. 

_Превышение лимита вернет ошибку._
:::

### BatchDeleteItemsInputFromRaw
Создает BatchWriteItemInput из SchemaItems.
```go
func BatchDeleteItemsInputFromRaw(
  items []SchemaItem,
) (
  *dynamodb.BatchWriteItemInput, 
  error,
)
```
::: warning Максимум **`25`** элементов в одной batch операции. 

_Превышение лимита вернет ошибку._
:::

## Stream Functions
::: tip Методы генерируются только при генерации с типом `all`
```bash
godyno -s schema.json -o ./gen -mode all
godyno -s schema.json -o ./gen
```
:::

### ExtractNewImage
Извлекает новое состояние элемента из stream record.
```go
func ExtractNewImage(record events.DynamoDBEventRecord) (*SchemaItem, error)
```

### ExtractOldImage
Извлекает старое состояние элемента из stream record.
```go
func ExtractOldImage(record events.DynamoDBEventRecord) (*SchemaItem, error)
```

### ExtractKeys
Извлекает ключи элемента из stream record.
```go
func ExtractKeys(
  record events.DynamoDBEventRecord,
) (
  map[string]types.AttributeValue, 
  error,
)
```

### IsInsertEvent
Проверяет, является ли событие вставкой.
```go
func IsInsertEvent(record events.DynamoDBEventRecord) bool
```

### IsModifyEvent
Проверяет, является ли событие модификацией.
```go
func IsModifyEvent(record events.DynamoDBEventRecord) bool
```

### IsRemoveEvent
Проверяет, является ли событие удалением.
```go
func IsRemoveEvent(record events.DynamoDBEventRecord) bool
```

### ExtractChangedAttributes
Возвращает список изменившихся атрибутов.
```go
func ExtractChangedAttributes(
  record events.DynamoDBEventRecord,
) (
  []string, 
  error,
)
```

### HasAttributeChanged
Проверяет, изменился ли конкретный атрибут.
```go
func HasAttributeChanged(
  record events.DynamoDBEventRecord, 
  attributeName string,
) bool
```

## Operators
::: warning Ключевые условия VS Фильтры
**Ключевые условия (Key Conditions)** - применяются `ДО` чтения:
- Определяют какие элементы читать из DynamoDB
- Влияют на стоимость операции (RCU)
- Поддерживают только: [`EQ`, `GT`, `LT`, `GTE`, `LTE`, `BETWEEN`, `BEGINS_WITH`]
- `EQ` обязателен для partition key
- Остальные операторы только для sort key

**Фильтры (Filter Expressions)** - применяются `ПОСЛЕ` чтения:
- Фильтруют уже прочитанные данные
- НЕ влияют на стоимость операции (платите за все прочитанное)
- Поддерживают ВСЕ операторы
- Операторы только для фильтров: [`CONTAINS`, `NOT_CONTAINS`, `IN`, `NOT_IN`, `EXISTS`, `NOT_EXISTS`, `NE`]

**Рекомендация:** 

Используйте ключевые условия максимально, а фильтры - только для дополнительной фильтрации.
:::

### OperatorType
```go
type OperatorType string
```
### Константы операторов
```go
const (
  EQ          OperatorType = "="
  NE          OperatorType = "<>"
  GT          OperatorType = ">"
  LT          OperatorType = "<"
  GTE         OperatorType = ">="
  LTE         OperatorType = "<="
  BETWEEN     OperatorType = "BETWEEN"
  CONTAINS    OperatorType = "CONTAINS"
  NOT_CONTAINS OperatorType = "NOT_CONTAINS"
  BEGINS_WITH OperatorType = "BEGINS_WITH"
  IN          OperatorType = "IN"
  NOT_IN      OperatorType = "NOT_IN"
  EXISTS      OperatorType = "EXISTS"
  NOT_EXISTS  OperatorType = "NOT_EXISTS"
)
```

### ValidateValues
Проверяет количество значений для оператора.
```go
func ValidateValues(op OperatorType, values []any) bool
```

### IsKeyConditionOperator
Проверяет, может ли оператор использоваться в key conditions.
```go
func IsKeyConditionOperator(op OperatorType) bool
```

### ValidateOperator
Проверяет совместимость оператора с полем.
```go
func ValidateOperator(fieldName string, op OperatorType) bool
```

### BuildConditionExpression
Создает условие фильтрации.
```go
func BuildConditionExpression(
  field string, 
  op OperatorType, 
  values []any,
) (
  expression.ConditionBuilder, 
  error,
)
```

### BuildKeyConditionExpression
Создает ключевое условие.
```go
func BuildKeyConditionExpression(
  field string, 
  op OperatorType, 
  values []any,
) (
  expression.KeyConditionBuilder, 
  error,
)
```