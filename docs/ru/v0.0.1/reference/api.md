---
outline: [2, 3]
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

## 🔢 Константы

### TableName

```go
const TableName = "table-name"
```

::: info Имя таблицы DynamoDB
:::

### Column

```go
const ColumnId = "id"
const ColumnEmail = "email"
const ColumnTimestamp = "timestamp"
```

::: info Имена столбцов таблицы
:::
::: tip Нейминг колонок
Названия всех описанных в таблице колонок начинаются с `Column` и используют CamelCase синтаксис
:::

### Index

```go
const IndexEmailIndex = "email-index"
```

::: info Имена вторичных индексов
:::
::: tip Нейминг индексов
Названия всех описанных в таблице индексов начинаются с `Index` и используют CamelCase синтаксис
:::

### Attribute

```go
var AttributeNames = []string{"id", "timestamp", "email"}
```

::: info Cлайс строк со всеми именами атрибутов таблицы DynamoDB
:::

### KeyAttribute

```go
var KeyAttributeNames = []string{"id", "timestamp"}
```

::: info Cлайс строк с первичными ключами таблицы DynamoDB
:::

## 🧬 Структуры данных

### SchemaItem

```go
type SchemaItem struct {
  Id        string `dynamodbav:"id"`
  Email     string `dynamodbav:"email"`
  Timestamp int64  `dynamodbav:"timestamp"`
}
```

::: info Структура, которая представляет одну запись в DynamoDB
:::

### TableSchema

```go
var TableSchema = DynamoSchema{
  TableName: "table-name",
  HashKey:   "id",
  RangeKey:  "timestamp",
  // ...
}
```

::: info Глобальная переменная типа `DynamoSchema`, которая содержит всю мета-информацию о таблице
:::
::: details мета дата

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

```go
func NewQueryBuilder() *QueryBuilder
```

::: info Создает новый `QueryBuilder`
:::

### `Обобщенный метод` With

::: warning Влияние на запрос:
Все методы `With` приминяются **`ДО`** чтения данных из DynamoDB.  
_(это быстрее и дешевле чем `Filter`)_
:::

```go
func (qb *QueryBuilder) With(
  field string,
  op OperatorType,
  values ...any,
) *QueryBuilder
```

::: info Добавляет условие для запросов в DynamoDB.
Принимает:

- `field` - имя поля
- `value` - значение
- `op` - тип операции
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

### qb.WithEQ

```go
func (qb *QueryBuilder) WithEQ(field string, value any) *QueryBuilder
```

::: info Добавляет условие `равно` для ключей.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
  ::: details Пример

```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
  WithEQ("created_at", timestamp).

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

### qb.WithGT

```go
func (qb *QueryBuilder) WithGT(field string, value any) *QueryBuilder
```

::: info Добавляет условие `больше` для range key.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.WithLT

```go
func (qb *QueryBuilder) WithLT(field string, value any) *QueryBuilder
```

::: info Добавляет условие `меньше` для range key.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.WithGTE

```go
func (qb *QueryBuilder) WithGTE(field string, value any) *QueryBuilder
```

::: info Добавляет условие `больше или равно` для range key.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.WithLTE

```go
func (qb *QueryBuilder) WithLTE(field string, value any) *QueryBuilder
```

::: info Добавляет условие `меньше или равно` для range key.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.WithBetween

```go
func (qb *QueryBuilder) WithBetween(field string, start, end any) *QueryBuilder
```

::: info Добавляет условие `условие диапазона` для range key.
Принимает:

- `field` - имя поля
- `start` - начальное значение
- `end` - конечное значение
  :::
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

### qb.WithBeginsWith

```go
func (qb *QueryBuilder) WithBeginsWith(field string, value any) *QueryBuilder
```

::: info Добавляет условие `начинается с` для range key.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.WithIndex

```go
func (qb *QueryBuilder) WithIndex(indexName string) *QueryBuilder
```

::: info Принудительно указывает, какой `secondary index` использовать для запроса вместо автоматического выбора.
:::
::: details Пример

```go
query := NewQueryBuilder().
  WithEQ("status", "active").
  WithIndex("status-created-index")

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
::: info Дополнительно
`Без WithIndex:`

- QueryBuilder автоматически выбирает оптимальный индекс
- Ищет GSI/LSI который поддерживает твои ключи

`С WithIndex:`

- QueryBuilder принудительно использует указанный индекс
- Игнорирует автоматический выбор
  :::

### `Обобщенный метод` Filter

::: warning Влияние на запрос:
Все методы `Filter` приминяются **`ПОСЛЕ`** чтения данных из DynamoDB.  
_(используйте с умом)_
:::

```go
func (qb *QueryBuilder) Filter(
  field string,
  op OperatorType,
  values ...any,
) *QueryBuilder
```

::: info Добавляет условие для фильтрации полученныйх из DynamoDB значений.
Принимает:

- `field` - имя поля
- `value` - значение
- `op` - тип операции
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

### qb.FilterEQ

```go
func (qb *QueryBuilder) FilterEQ(field string, value any) *QueryBuilder
```

::: info Добавляет фильтр `равенства`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.FilterNE

```go
func (qb *QueryBuilder) FilterNE(field string, value any) *QueryBuilder
```

::: info Добавляет фильтр `неравенства`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.FilterGT

```go
func (qb *QueryBuilder) FilterGT(field string, value any) *QueryBuilder
```

::: info Добавляет фильтр `больше`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.FilterLT

```go
func (qb *QueryBuilder) FilterLT(field string, value any) *QueryBuilder
```

::: info Добавляет фильтр `меньше`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.FilterGTE

```go
func (qb *QueryBuilder) FilterGTE(field string, value any) *QueryBuilder
```

::: info Добавляет фильтр `больше или равно`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.FilterLTE

```go
func (qb *QueryBuilder) FilterLTE(field string, value any) *QueryBuilder
```

::: info Добавляет фильтр `меньше или равно`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.FilterBetween

```go
func (qb *QueryBuilder) FilterBetween(field string, start, end any) *QueryBuilder
```

::: info Добавляет фильтр `диапазона`.
Принимает:

- `field` - имя поля
- `start` - начальное значение
- `end` - конечное значение
  :::
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

### qb.FilterContains

```go
func (qb *QueryBuilder) FilterContains(field string, value any) *QueryBuilder
```

::: info Добавляет фильтр `содержит`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.FilterNotContains

```go
func (qb *QueryBuilder) FilterNotContains(field string, value any) *QueryBuilder
```

::: info Добавляет фильтр `НЕ содержит`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.FilterBeginsWith

```go
func (qb *QueryBuilder) FilterBeginsWith(field string, value any) *QueryBuilder
```

::: info Добавляет фильтр `начинается с`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### qb.FilterIn

```go
func (qb *QueryBuilder) FilterIn(field string, values ...any) *QueryBuilder
```

::: info Добавляет фильтр `входит в список`.
Принимает:

- `field` - имя поля
- `value` - список значений
  :::
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

### qb.FilterNotIn

```go
func (qb *QueryBuilder) FilterNotIn(field string, values ...any) *QueryBuilder
```

::: info Добавляет фильтр `НЕ входит в список`.
Принимает:

- `field` - имя поля
- `value` - список значений
  :::
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

### qb.FilterExists

```go
func (qb *QueryBuilder) FilterExists(field string) *QueryBuilder
```

::: info Добавляет фильтр `НЕ пустое поле`.
Принимает:

- `field` - имя поля
  :::
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

### qb.FilterNotExists

```go
func (qb *QueryBuilder) FilterNotExists(field string) *QueryBuilder
```

::: info Добавляет фильтр `пустое поле`.
Принимает:

- `field` - имя поля
  :::
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

### qb.OrderByAsc

```go
func (qb *QueryBuilder) OrderByAsc() *QueryBuilder
```

::: info Устанавливает сортировку по возрастанию.
:::
::: details Пример

```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
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
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```

:::

### qb.OrderByDesc

```go
func (qb *QueryBuilder) OrderByDesc() *QueryBuilder
```

::: info Устанавливает сортировку по убыванию.
:::
::: details Пример

```go
query := NewQueryBuilder().
  WithEQ("user_id", "123").
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
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```

:::

### qb.Limit

```go
func (qb *QueryBuilder) Limit(limit int) *QueryBuilder
```

::: info Устанавливает лимит результатов.
Принимает:

- `limit` - максимальное количество
  :::
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
  fmt.Printf("User: %s, Created: %s\n", item.UserId, item.CreatedAt)
}
```

:::

### qb.StartFrom

```go
func (qb *QueryBuilder) StartFrom(
  lastEvaluatedKey map[string]types.AttributeValue,
) *QueryBuilder
```

::: warning Пагинация
**`LastEvaluatedKey`** может быть **`null`** даже если есть больше данных и размер ответа превышает `1MB`.

_Всегда проверяйте наличие LastEvaluatedKey для продолжения пагинации._
:::

::: info Устанавливает стартовый ключ для пагинации.
Принимает:

- `lastEvaluatedKey` - последний ключ
  :::
  ::: details Пример

```go
var lastKey map[string]types.AttributeValue

query1 := NewQueryBuilder().
    WithEQ("user_id", "123").
    Limit(10)

result1, err := dynamoClient.Query(ctx, query1Input)
lastKey = result1.LastEvaluatedKey

query2 := NewQueryBuilder().
    WithEQ("user_id", "123").
    StartFrom(lastKey).
    Limit(10)
```

:::

### qb.WithProjection

```go
func (qb *QueryBuilder) WithProjection(attributes []string) *QueryBuilder
```

::: info Указывает какие конкретные поля вернуть из DynamoDB вместо всех полей записи.
Принимает:

- `attributes` - список полей

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

### qb.BuildQuery

```go
func (qb *QueryBuilder) BuildQuery() (*dynamodb.QueryInput, error)
```

::: info Строит DynamoDB QueryInput.
**Возвращает:** `*dynamodb.QueryInput, error`
:::

### qb.Execute

```go
func (qb *QueryBuilder) Execute(
  ctx context.Context,
  client *dynamodb.Client,
) (
  []SchemaItem,
  error,
)
```

::: info Выполняет запрос.
Принимает:

- `ctx` - контекст
- `client` - DynamoDB клиент
  :::

## 🧭 ScanBuilder

::: warning Scan читает всю таблицу.
:::

### NewScanBuilder

```go
func NewScanBuilder() *ScanBuilder
```

::: info Создает новый `ScanBuilder`
:::

### `Обобщенный метод` Filter

```go
func (sb *ScanBuilder) Filter(
  field string,
  op OperatorType,
  values ...any,
) *ScanBuilder
```

::: info Добавляет условие для фильтрации полученныйх из DynamoDB значений.
Принимает:

- `field` - имя поля
- `value` - значение
- `op` - тип операции
  :::
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

### sb.FilterEQ

```go
func (sb *ScanBuilder) FilterEQ(field string, value any) *ScanBuilder
```

::: info Добавляет фильтр `равенства`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### sb.FilterNE

```go
func (sb *ScanBuilder) FilterNE(field string, value any) *ScanBuilder
```

::: info Добавляет фильтр `неравенства`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### sb.FilterGT

```go
func (sb *ScanBuilder) FilterGT(field string, value any) *ScanBuilder
```

::: info Добавляет фильтр `больше`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### sb.FilterLT

```go
func (sb *ScanBuilder) FilterLT(field string, value any) *ScanBuilder
```

::: info Добавляет фильтр `меньше`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### sb.FilterGTE

```go
func (sb *ScanBuilder) FilterGTE(field string, value any) *ScanBuilder
```

::: info Добавляет фильтр `больше или равно`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### sb.FilterLTE

```go
func (sb *ScanBuilder) FilterLTE(field string, value any) *ScanBuilder
```

::: info Добавляет фильтр `меньше или равно`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### sb.FilterBetween

```go
func (sb *ScanBuilder) FilterBetween(
  field string,
  start,
  end any,
) *ScanBuilder
```

::: info Добавляет фильтр `диапазона`.
Принимает:

- `field` - имя поля
- `start` - начальное значение
- `end` - конечное значение
  :::
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

### sb.FilterContains

```go
func (sb *ScanBuilder) FilterContains(field string, value any) *ScanBuilder
```

::: info Добавляет фильтр `содержит`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### sb.FilterNotContains

```go
func (sb *ScanBuilder) FilterNotContains(
  field string,
  value any,
) *ScanBuilder
```

::: info Добавляет фильтр `НЕ содержит`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### sb.FilterBeginsWith

```go
func (sb *ScanBuilder) FilterBeginsWith(field string, value any) *ScanBuilder
```

::: info Добавляет фильтр `начинается С`.
Принимает:

- `field` - имя поля
- `value` - значение
  :::
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

### sb.FilterIn

```go
func (sb *ScanBuilder) FilterIn(field string, values ...any) *ScanBuilder
```

::: info Добавляет фильтр `входит в список`.
Принимает:

- `field` - имя поля
- `value` - список значений
  :::
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

### sb.FilterNotIn

```go
func (sb *ScanBuilder) FilterNotIn(field string, values ...any) *ScanBuilder
```

::: info Добавляет фильтр `НЕ входит в список`.
Принимает:

- `field` - имя поля
- `value` - список значений
  :::
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

### sb.FilterExists

```go
func (sb *ScanBuilder) FilterExists(field string) *ScanBuilder
```

::: info Добавляет фильтр `НЕ пустое поле`.
Принимает:

- `field` - имя поля
  :::
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

### sb.FilterNotExists

```go
func (sb *ScanBuilder) FilterNotExists(field string) *ScanBuilder
```

::: info Добавляет фильтр `пустое поле`.
Принимает:

- `field` - имя поля
  :::
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

### sb.WithIndex

```go
func (sb *ScanBuilder) WithIndex(indexName string) *ScanBuilder
```

::: info Выполняем сканирование по конкретному индексу

- **GSI** (Global Secondary Index) имеют отдельные RCU/WCU настройки.
- **LSI** (Local Secondary Index) используют RCU/WCU основной таблицы.

Принимает:

- `indexName` - имя индекса
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

::: info Устанавливает лимит результатов.
Принимает:

- `limit` - максимальное количество
  :::
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
::: info Устанавливает стартовый ключ для пагинации.
Принимает:

- `lastEvaluatedKey` - последний ключ
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

```go
func (sb *ScanBuilder) WithProjection(attributes []string) *ScanBuilder
```

::: info Указывает какие конкретные поля вернуть из DynamoDB вместо всех полей записи.
Принимает:

- `attributes` - список полей

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

### sb.BuildScan

```go
func (sb *ScanBuilder) BuildScan() (*dynamodb.ScanInput, error)
```

::: info Строит DynamoDB ScanInput.
**Возвращает:** `*dynamodb.ScanInput, error`
:::

### sb.Execute

```go
func (sb *ScanBuilder) Execute(
  ctx context.Context,
  client *dynamodb.Client,
) (
  []SchemaItem,
  error,
)
```

::: info Выполняет сканирование.
Принимает:

- `ctx` - контекст
- `client` - DynamoDB клиент
  :::

## 📥 Input Functions

### ItemInput

```go
func ItemInput(item SchemaItem) (map[string]types.AttributeValue, error)
```

::: info Преобразует SchemaItem в DynamoDB AttributeValue map.
Принимает:

- `item` - элемент схемы

Возвращает:

- `map[string]types.AttributeValue`
- `error`
  :::

### BatchItemsInput

::: warning Максимум **`25`** элементов в одной batch операции.

_Превышение лимита вернет ошибку._
:::

```go
func BatchItemsInput(
  items []SchemaItem,
) (
  []map[string]types.AttributeValue,
  error,
)
```

::: info Преобразует массив SchemaItem в массив AttributeValue maps.
Принимает:

- `items` - элементы схемы (список)

Возвращает:

- `[]map[string]types.AttributeValue`
- `error`
  :::

### KeyInput

```go
func KeyInput(
  hashKeyValue,
  rangeKeyValue any,
) (
  map[string]types.AttributeValue,
  error,
)
```

::: info Создает ключ из значений hash и range ключей.
_`rangeKeyValue` может быть **`nil`** если таблица использует только hash key_

Принимает:

- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key

Возвращает:

- `map[string]types.AttributeValue`
- `error`
  :::

### KeyInputFromRaw

```go
func KeyInputFromRaw(
  hashKeyValue,
  rangeKeyValue any,
) (
  map[string]types.AttributeValue,
  error,
)
```

::: info Создает ключ из сырых значений с валидацией.
Принимает:

- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key

Возвращает:

- `map[string]types.AttributeValue`
- `error`
  :::

### KeyInputFromItem

```go
func KeyInputFromItem(item SchemaItem) (map[string]types.AttributeValue, error)
```

::: info Извлекает ключ из SchemaItem.
Принимает:

- `item` - элемент схемы

Возвращает:

- `map[string]types.AttributeValue`
- `error`
  :::

### UpdateItemInputFromRaw

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

::: info Создает UpdateItemInput из сырых значений.
Принимает:

- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key
- `updates` - карта обновлений

Возвращает:

- `*dynamodb.UpdateItemInput`
- `error`
  :::

### UpdateItemInputWithCondition

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

::: info Создает UpdateItemInput с условным выражением.
Принимает:

- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key
- `updates` - карта обновлений
- `conditionExpression` - условное выражение
- `conditionAttributeNames` - имена атрибутов условия
- `conditionAttributeValues` - значения атрибутов условия

Возвращает:

- `*dynamodb.UpdateItemInput`
- `error`
  :::

### UpdateItemInputWithExpression

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

::: info Создает UpdateItemInput с expression builders.
Принимает:

- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key
- `updateBuilder` - построитель обновлений
- `conditionBuilder` - построитель условий

Возвращает:

- `*dynamodb.UpdateItemInput`
- `error`
  :::

### DeleteItemInputFromRaw

```go
func DeleteItemInputFromRaw(
  hashKeyValue,
  rangeKeyValue any,
) (
  *dynamodb.DeleteItemInput,
  error,
)
```

::: info Создает DeleteItemInput из значений ключей.
Принимает:

- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key

Возвращает:

- `*dynamodb.DeleteItemInput`
- `error`
  :::

### DeleteItemInputWithCondition

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

::: info Создает DeleteItemInput с условным выражением.
Принимает:

- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key
- `conditionExpression` - условное выражение
- `expressionAttributeNames` - имена атрибутов условия
- `expressionAttributeValues` - значения атрибутов условия

Возвращает:

- `*dynamodb.DeleteItemInput`
- `error`
  :::

### BatchDeleteItemsInput

```go
func BatchDeleteItemsInput(
  keys []map[string]types.AttributeValue,
) (
  *dynamodb.BatchWriteItemInput,
  error,
)
```

::: warning Максимум **`25`** элементов в одной batch операции. Превышение лимита вернет ошибку.
:::
::: info Создает BatchWriteItemInput для удаления элементов.
Принимает:

- `keys` - ключи элементов

Возвращает:

- `*dynamodb.BatchWriteItemInput`
- `error`
  :::

### BatchDeleteItemsInputFromRaw

```go
func BatchDeleteItemsInputFromRaw(
  items []SchemaItem,
) (
  *dynamodb.BatchWriteItemInput,
  error,
)
```

::: warning Максимум **`25`** элементов в одной batch операции. Превышение лимита вернет ошибку.
:::
::: info Создает BatchWriteItemInput из SchemaItems.
Принимает:

- `items` - элементы схемы

Возвращает:

- `*dynamodb.BatchWriteItemInput`
- `error`
  :::

## 🔁 Stream Functions

### ExtractNewImage

```go
func ExtractNewImage(record events.DynamoDBEventRecord) (*SchemaItem, error)
```

::: info Извлекает новое состояние элемента из stream record.
Принимает:

- `record` - запись stream

Возвращает:

- `*SchemaItem`
- `error`
  :::

### ExtractOldImage

```go
func ExtractOldImage(record events.DynamoDBEventRecord) (*SchemaItem, error)
```

::: info Извлекает старое состояние элемента из stream record.
Принимает:

- `record` - запись stream

Возвращает:

- `*SchemaItem`
- `error`
  :::

### ExtractKeys

```go
func ExtractKeys(
  record events.DynamoDBEventRecord,
) (
  map[string]types.AttributeValue,
  error,
)
```

::: info Извлекает ключи элемента из stream record.
Принимает:

- `record` - запись stream

Возвращает:

- `map[string]types.AttributeValue`
- `error`
  :::

### IsInsertEvent

```go
func IsInsertEvent(record events.DynamoDBEventRecord) bool
```

::: info Проверяет, является ли событие вставкой.
Принимает:

- `record` - запись stream

Возвращает:

- `bool`
  :::

### IsModifyEvent

```go
func IsModifyEvent(record events.DynamoDBEventRecord) bool
```

::: info Проверяет, является ли событие модификацией.
Принимает:

- `record` - запись stream

Возвращает:

- `bool`
  :::

### IsRemoveEvent

```go
func IsRemoveEvent(record events.DynamoDBEventRecord) bool
```

::: info Проверяет, является ли событие удалением.
Принимает:

- `record` - запись stream

Возвращает:

- `bool`
  :::

### ExtractChangedAttributes

````go
func ExtractChangedAttributes(
  record events.DynamoDBEventRecord,
) (
  []string,
  error,
)```
::: info Возвращает список изменившихся атрибутов.
Принимает:
- `record` - запись stream

Возвращает:
- `[]string`
- `error`
:::

### HasAttributeChanged
```go
func HasAttributeChanged(
  record events.DynamoDBEventRecord,
  attributeName string,
) bool
````

::: info Проверяет, изменился ли конкретный атрибут.
Принимает:

- `record` - запись stream
- `attributeName` - имя атрибута

Возвращает:

- `bool`
  :::

## 🛡️ Validation Functions

### validateHashKey

```go
func validateHashKey(value any) error
```

::: info Проверяет значение hash key.
Принимает:

- `value` - значение

Возвращает:

- `error`
  :::

### validateRangeKey

```go
func validateRangeKey(value any) error
```

::: info Проверяет значение range key.
Принимает:

- `value` - значение

Возвращает:

- `error`
  :::

### validateKeyInputs

```go
func validateKeyInputs(hashKeyValue, rangeKeyValue any) error
```

::: info Проверяет значения ключей.
Принимает:

- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key

Возвращает:

- `error`
  :::

### validateUpdatesMap

```go
func validateUpdatesMap(updates map[string]any) error
```

::: info Проверяет карту обновлений.
Принимает:

- `updates` - карта обновлений

Возвращает:

- `error`
  :::

### validateConditionExpression

```go
func validateConditionExpression(expr string) error
```

::: info Проверяет условное выражение.
Принимает:

- `expr` - выражение

Возвращает:

- `error`
  :::

### validateBatchSize

```go
func validateBatchSize(size int, operation string) error
```

::: info Проверяет размер batch операции.
Принимает:

- `size` - размер
- `operation` - тип операции

Возвращает:

- `error`
  :::

## ⚖️ Operators

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

```go
func ValidateValues(op OperatorType, values []any) bool
```

::: info Проверяет количество значений для оператора.
Принимает:

- `op` - оператор
- `values` - значения

Возвращает:

- `bool`
  :::

### IsKeyConditionOperator

```go
func IsKeyConditionOperator(op OperatorType) bool
```

::: info Проверяет, может ли оператор использоваться в key conditions.
Принимает:

- `op` - оператор

Возвращает:

- `bool`
  :::

### ValidateOperator

```go
func ValidateOperator(fieldName string, op OperatorType) bool
```

::: info Проверяет совместимость оператора с полем.
Принимает:

- `fieldName` - имя поля
- `op` - оператор

Возвращает:

- `bool`
  :::

### BuildConditionExpression

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

::: info Создает условие фильтрации.
Принимает:

- `field` - имя поля
- `op` - оператор
- `values` - значения

Возвращает:

- `expression.ConditionBuilder`
- `error`
  :::

### BuildKeyConditionExpression

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

::: info Создает ключевое условие.
Принимает:

- `field` - имя поля
- `op` - оператор
- `values` - значения

Возвращает:

- `expression.KeyConditionBuilder`
- `error`
  :::
