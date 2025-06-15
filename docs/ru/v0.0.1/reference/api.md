# API Reference

## Содержание

- [Константы](#константы)
- [Структуры данных](#структуры-данных)
- [QueryBuilder](#querybuilder)
- [ScanBuilder](#scanbuilder)
- [Input Functions](#input-functions)
- [Stream Functions](#stream-functions)
- [Validation Functions](#validation-functions)
- [Operators](#operators)

## Константы

### TableName
```go
const TableName = "table-name"
```
_Имя таблицы DynamoDB._

### Column константы
```go
const ColumnId = "id"
const ColumnEmail = "email"
const ColumnTimestamp = "timestamp"
```
_Имена столбцов таблицы._ 

::: tip
Обращение к колонке: **Column[[ ColumnName ]]**
:::

### Index константы
```go
const IndexEmailIndex = "email-index"
```
_Имена вторичных индексов._

::: tip
Обращение к индексам: Index[[ name ]]
:::

### AttributeNames
```go
var AttributeNames = []string{"id", "timestamp", "email"}
```
_Список всех имен атрибутов._

### KeyAttributeNames
```go
var KeyAttributeNames = []string{"id", "timestamp"}
```
_Список ключевых атрибутов._

## Структуры данных

### SchemaItem
```go
type SchemaItem struct {
  Id        string `dynamodbav:"id"`
  Email     string `dynamodbav:"email"`
  Timestamp int64  `dynamodbav:"timestamp"`
}
```
_Основная структура элемента таблицы._

### TableSchema
```go
var TableSchema = DynamoSchema{
  TableName: "table-name",
  HashKey:   "id",
  RangeKey:  "timestamp",
  // ...
}
```
_Метаданные схемы таблицы._

## QueryBuilder

### NewQueryBuilder
```go
func NewQueryBuilder() *QueryBuilder
```
_Создает новый QueryBuilder._

**Возвращает:** `*QueryBuilder`

### WithEQ
```go
func (qb *QueryBuilder) WithEQ(field string, value any) *QueryBuilder
```
_Добавляет условие равенства для ключей._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### WithGT
```go
func (qb *QueryBuilder) WithGT(field string, value any) *QueryBuilder
```
_Добавляет условие "больше" для range key._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### WithLT
```go
func (qb *QueryBuilder) WithLT(field string, value any) *QueryBuilder
```
_Добавляет условие "меньше" для range key._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### WithGTE
```go
func (qb *QueryBuilder) WithGTE(field string, value any) *QueryBuilder
```
_Добавляет условие "больше или равно" для range key._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### WithLTE
```go
func (qb *QueryBuilder) WithLTE(field string, value any) *QueryBuilder
```
_Добавляет условие "меньше или равно" для range key._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### WithBetween
```go
func (qb *QueryBuilder) WithBetween(field string, start, end any) *QueryBuilder
```
_Добавляет условие диапазона для range key._

**Параметры:**
- `field` - имя поля
- `start` - начальное значение
- `end` - конечное значение

**Возвращает:** `*QueryBuilder`

### WithBeginsWith
```go
func (qb *QueryBuilder) WithBeginsWith(field string, value any) *QueryBuilder
```
_Добавляет условие "начинается с" для range key._

**Параметры:**
- `field` - имя поля
- `value` - префикс

**Возвращает:** `*QueryBuilder`

### Filter
```go
func (qb *QueryBuilder) Filter(field string, op OperatorType, values ...any) *QueryBuilder
```
_Добавляет фильтр с указанным оператором._

**Параметры:**
- `field` - имя поля
- `op` - оператор
- `values` - значения

**Возвращает:** `*QueryBuilder`

### FilterEQ
```go
func (qb *QueryBuilder) FilterEQ(field string, value any) *QueryBuilder
```
_Добавляет фильтр равенства._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### FilterNE
```go
func (qb *QueryBuilder) FilterNE(field string, value any) *QueryBuilder
```
_Добавляет фильтр неравенства._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### FilterGT
```go
func (qb *QueryBuilder) FilterGT(field string, value any) *QueryBuilder
```
_Добавляет фильтр "больше"._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### FilterLT
```go
func (qb *QueryBuilder) FilterLT(field string, value any) *QueryBuilder
```
_Добавляет фильтр "меньше"._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### FilterGTE
```go
func (qb *QueryBuilder) FilterGTE(field string, value any) *QueryBuilder
```
_Добавляет фильтр "больше или равно"._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### FilterLTE
```go
func (qb *QueryBuilder) FilterLTE(field string, value any) *QueryBuilder
```
_Добавляет фильтр "меньше или равно"._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### FilterBetween
```go
func (qb *QueryBuilder) FilterBetween(field string, start, end any) *QueryBuilder
```
_Добавляет фильтр диапазона._

**Параметры:**
- `field` - имя поля
- `start` - начальное значение
- `end` - конечное значение

**Возвращает:** `*QueryBuilder`

### FilterContains
```go
func (qb *QueryBuilder) FilterContains(field string, value any) *QueryBuilder
```
_Добавляет фильтр содержания._

**Параметры:**
- `field` - имя поля
- `value` - искомое значение

**Возвращает:** `*QueryBuilder`

### FilterNotContains
```go
func (qb *QueryBuilder) FilterNotContains(field string, value any) *QueryBuilder
```
_Добавляет фильтр "не содержит"._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*QueryBuilder`

### FilterBeginsWith
```go
func (qb *QueryBuilder) FilterBeginsWith(field string, value any) *QueryBuilder
```
_Добавляет фильтр "начинается с"._

**Параметры:**
- `field` - имя поля
- `value` - префикс

**Возвращает:** `*QueryBuilder`

### FilterIn
```go
func (qb *QueryBuilder) FilterIn(field string, values ...any) *QueryBuilder
```
_Добавляет фильтр "входит в список"._

**Параметры:**
- `field` - имя поля
- `values` - список значений

**Возвращает:** `*QueryBuilder`

### FilterNotIn
```go
func (qb *QueryBuilder) FilterNotIn(field string, values ...any) *QueryBuilder
```
_Добавляет фильтр "не входит в список"._

**Параметры:**
- `field` - имя поля
- `values` - список значений

**Возвращает:** `*QueryBuilder`

### FilterExists
```go
func (qb *QueryBuilder) FilterExists(field string) *QueryBuilder
```
_Добавляет фильтр существования атрибута._

**Параметры:**
- `field` - имя поля

**Возвращает:** `*QueryBuilder`

### FilterNotExists
```go
func (qb *QueryBuilder) FilterNotExists(field string) *QueryBuilder
```
_Добавляет фильтр отсутствия атрибута._

**Параметры:**
- `field` - имя поля

**Возвращает:** `*QueryBuilder`

### WithIndex
```go
func (qb *QueryBuilder) WithIndex(indexName string) *QueryBuilder
```
_Указывает индекс для запроса._

**Параметры:**
- `indexName` - имя индекса

**Возвращает:** `*QueryBuilder`

### OrderByAsc
```go
func (qb *QueryBuilder) OrderByAsc() *QueryBuilder
```
Устанавливает сортировку по возрастанию.

**Возвращает:** `*QueryBuilder`

### OrderByDesc
```go
func (qb *QueryBuilder) OrderByDesc() *QueryBuilder
```
_Устанавливает сортировку по убыванию._

**Возвращает:** `*QueryBuilder`

### Limit
```go
func (qb *QueryBuilder) Limit(limit int) *QueryBuilder
```
_Устанавливает лимит результатов._

**Параметры:**
- `limit` - максимальное количество

**Возвращает:** `*QueryBuilder`

### StartFrom
```go
func (qb *QueryBuilder) StartFrom(lastEvaluatedKey map[string]types.AttributeValue) *QueryBuilder
```
_Устанавливает стартовый ключ для пагинации._

**Параметры:**
- `lastEvaluatedKey` - последний ключ

**Возвращает:** `*QueryBuilder`

### WithProjection
```go
func (qb *QueryBuilder) WithProjection(attributes []string) *QueryBuilder
```
_Устанавливает проекцию атрибутов._

**Параметры:**
- `attributes` - список атрибутов

**Возвращает:** `*QueryBuilder`

### BuildQuery
```go
func (qb *QueryBuilder) BuildQuery() (*dynamodb.QueryInput, error)
```
_Строит DynamoDB QueryInput._

**Возвращает:** `*dynamodb.QueryInput, error`

### Execute
```go
func (qb *QueryBuilder) Execute(ctx context.Context, client *dynamodb.Client) ([]SchemaItem, error)
```
_Выполняет запрос._

**Параметры:**
- `ctx` - контекст
- `client` - DynamoDB клиент

**Возвращает:** `[]SchemaItem, error`

## ScanBuilder

### NewScanBuilder
```go
func NewScanBuilder() *ScanBuilder
```
_Создает новый ScanBuilder._

**Возвращает:** `*ScanBuilder`

### Filter
```go
func (sb *ScanBuilder) Filter(field string, op OperatorType, values ...any) *ScanBuilder
```
_Добавляет фильтр с указанным оператором._

**Параметры:**
- `field` - имя поля
- `op` - оператор
- `values` - значения

**Возвращает:** `*ScanBuilder`

### FilterEQ
```go
func (sb *ScanBuilder) FilterEQ(field string, value any) *ScanBuilder
```
_Добавляет фильтр равенства._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*ScanBuilder`

### FilterNE
```go
func (sb *ScanBuilder) FilterNE(field string, value any) *ScanBuilder
```
_Добавляет фильтр неравенства._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*ScanBuilder`

### FilterGT
```go
func (sb *ScanBuilder) FilterGT(field string, value any) *ScanBuilder
```
_Добавляет фильтр "больше"._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*ScanBuilder`

### FilterLT
```go
func (sb *ScanBuilder) FilterLT(field string, value any) *ScanBuilder
```
_Добавляет фильтр "меньше"._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*ScanBuilder`

### FilterGTE
```go
func (sb *ScanBuilder) FilterGTE(field string, value any) *ScanBuilder
```
_Добавляет фильтр "больше или равно"._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*ScanBuilder`

### FilterLTE
```go
func (sb *ScanBuilder) FilterLTE(field string, value any) *ScanBuilder
```
_Добавляет фильтр "меньше или равно"._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*ScanBuilder`

### FilterBetween
```go
func (sb *ScanBuilder) FilterBetween(field string, start, end any) *ScanBuilder
```
_Добавляет фильтр диапазона._

**Параметры:**
- `field` - имя поля
- `start` - начальное значение
- `end` - конечное значение

**Возвращает:** `*ScanBuilder`

### FilterContains
```go
func (sb *ScanBuilder) FilterContains(field string, value any) *ScanBuilder
```
_Добавляет фильтр содержания._

**Параметры:**
- `field` - имя поля
- `value` - искомое значение

**Возвращает:** `*ScanBuilder`

### FilterNotContains
```go
func (sb *ScanBuilder) FilterNotContains(field string, value any) *ScanBuilder
```
_Добавляет фильтр "не содержит"._

**Параметры:**
- `field` - имя поля
- `value` - значение

**Возвращает:** `*ScanBuilder`

### FilterBeginsWith
```go
func (sb *ScanBuilder) FilterBeginsWith(field string, value any) *ScanBuilder
```
_Добавляет фильтр "начинается с"._

**Параметры:**
- `field` - имя поля
- `value` - префикс

**Возвращает:** `*ScanBuilder`

### FilterIn
```go
func (sb *ScanBuilder) FilterIn(field string, values ...any) *ScanBuilder
```
_Добавляет фильтр "входит в список"._

**Параметры:**
- `field` - имя поля
- `values` - список значений

**Возвращает:** `*ScanBuilder`

### FilterNotIn
```go
func (sb *ScanBuilder) FilterNotIn(field string, values ...any) *ScanBuilder
```
_Добавляет фильтр "не входит в список"._

**Параметры:**
- `field` - имя поля
- `values` - список значений

**Возвращает:** `*ScanBuilder`

### FilterExists
```go
func (sb *ScanBuilder) FilterExists(field string) *ScanBuilder
```
_Добавляет фильтр существования атрибута._

**Параметры:**
- `field` - имя поля

**Возвращает:** `*ScanBuilder`

### FilterNotExists
```go
func (sb *ScanBuilder) FilterNotExists(field string) *ScanBuilder
```
_Добавляет фильтр отсутствия атрибута._

**Параметры:**
- `field` - имя поля

**Возвращает:** `*ScanBuilder`

### WithIndex
```go
func (sb *ScanBuilder) WithIndex(indexName string) *ScanBuilder
```
_Указывает индекс для сканирования._

**Параметры:**
- `indexName` - имя индекса

**Возвращает:** `*ScanBuilder`

### Limit
```go
func (sb *ScanBuilder) Limit(limit int) *ScanBuilder
```
_Устанавливает лимит результатов._

**Параметры:**
- `limit` - максимальное количество

**Возвращает:** `*ScanBuilder`

### StartFrom
```go
func (sb *ScanBuilder) StartFrom(lastEvaluatedKey map[string]types.AttributeValue) *ScanBuilder
```
_Устанавливает стартовый ключ для пагинации._

**Параметры:**
- `lastEvaluatedKey` - последний ключ

**Возвращает:** `*ScanBuilder`

### WithProjection
```go
func (sb *ScanBuilder) WithProjection(attributes []string) *ScanBuilder
```
_Устанавливает проекцию атрибутов._

**Параметры:**
- `attributes` - список атрибутов

**Возвращает:** `*ScanBuilder`

### WithParallelScan
```go
func (sb *ScanBuilder) WithParallelScan(totalSegments, segment int) *ScanBuilder
```
_Настраивает параллельное сканирование._

**Параметры:**
- `totalSegments` - общее количество сегментов
- `segment` - номер сегмента

**Возвращает:** `*ScanBuilder`

### BuildScan
```go
func (sb *ScanBuilder) BuildScan() (*dynamodb.ScanInput, error)
```
_Строит DynamoDB ScanInput._

**Возвращает:** `*dynamodb.ScanInput, error`

### Execute
```go
func (sb *ScanBuilder) Execute(ctx context.Context, client *dynamodb.Client) ([]SchemaItem, error)
```
_Выполняет сканирование._

**Параметры:**
- `ctx` - контекст
- `client` - DynamoDB клиент

**Возвращает:** `[]SchemaItem, error`

## Input Functions

### ItemInput
```go
func ItemInput(item SchemaItem) (map[string]types.AttributeValue, error)
```
_Преобразует SchemaItem в DynamoDB AttributeValue map._

**Параметры:**
- `item` - элемент схемы

**Возвращает:** `map[string]types.AttributeValue, error`

### BatchItemsInput
```go
func BatchItemsInput(items []SchemaItem) ([]map[string]types.AttributeValue, error)
```
_Преобразует массив SchemaItem в массив AttributeValue maps._

**Параметры:**
- `items` - элементы схемы

**Возвращает:** `[]map[string]types.AttributeValue, error`

### KeyInput
```go
func KeyInput(hashKeyValue, rangeKeyValue any) (map[string]types.AttributeValue, error)
```
_Создает ключ из значений hash и range ключей._

**Параметры:**
- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key

**Возвращает:** `map[string]types.AttributeValue, error`

### KeyInputFromRaw
```go
func KeyInputFromRaw(hashKeyValue, rangeKeyValue any) (map[string]types.AttributeValue, error)
```
_Создает ключ из сырых значений с валидацией._

**Параметры:**
- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key

**Возвращает:** `map[string]types.AttributeValue, error`

### KeyInputFromItem
```go
func KeyInputFromItem(item SchemaItem) (map[string]types.AttributeValue, error)
```
_Извлекает ключ из SchemaItem._

**Параметры:**
- `item` - элемент схемы

**Возвращает:** `map[string]types.AttributeValue, error`

### UpdateItemInputFromRaw
```go
func UpdateItemInputFromRaw(hashKeyValue, rangeKeyValue any, updates map[string]any) (*dynamodb.UpdateItemInput, error)
```
_Создает UpdateItemInput из сырых значений._

**Параметры:**
- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key
- `updates` - карта обновлений

**Возвращает:** `*dynamodb.UpdateItemInput, error`

### UpdateItemInputWithCondition
```go
func UpdateItemInputWithCondition(hashKeyValue, rangeKeyValue any, updates map[string]any, conditionExpression string, conditionAttributeNames map[string]string, conditionAttributeValues map[string]types.AttributeValue) (*dynamodb.UpdateItemInput, error)
```
_Создает UpdateItemInput с условным выражением._

**Параметры:**
- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key
- `updates` - карта обновлений
- `conditionExpression` - условное выражение
- `conditionAttributeNames` - имена атрибутов условия
- `conditionAttributeValues` - значения атрибутов условия

**Возвращает:** `*dynamodb.UpdateItemInput, error`

### UpdateItemInputWithExpression
```go
func UpdateItemInputWithExpression(hashKeyValue, rangeKeyValue any, updateBuilder expression.UpdateBuilder, conditionBuilder *expression.ConditionBuilder) (*dynamodb.UpdateItemInput, error)
```
_Создает UpdateItemInput с expression builders._

**Параметры:**
- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key
- `updateBuilder` - построитель обновлений
- `conditionBuilder` - построитель условий

**Возвращает:** `*dynamodb.UpdateItemInput, error`

### DeleteItemInputFromRaw
```go
func DeleteItemInputFromRaw(hashKeyValue, rangeKeyValue any) (*dynamodb.DeleteItemInput, error)
```
_Создает DeleteItemInput из значений ключей._

**Параметры:**
- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key

**Возвращает:** `*dynamodb.DeleteItemInput, error`

### DeleteItemInputWithCondition
```go
func DeleteItemInputWithCondition(hashKeyValue, rangeKeyValue any, conditionExpression string, expressionAttributeNames map[string]string, expressionAttributeValues map[string]types.AttributeValue) (*dynamodb.DeleteItemInput, error)
```
_Создает DeleteItemInput с условным выражением._

**Параметры:**
- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key
- `conditionExpression` - условное выражение
- `expressionAttributeNames` - имена атрибутов условия
- `expressionAttributeValues` - значения атрибутов условия

**Возвращает:** `*dynamodb.DeleteItemInput, error`

### BatchDeleteItemsInput
```go
func BatchDeleteItemsInput(keys []map[string]types.AttributeValue) (*dynamodb.BatchWriteItemInput, error)
```
_Создает BatchWriteItemInput для удаления элементов._

**Параметры:**
- `keys` - ключи элементов

**Возвращает:** `*dynamodb.BatchWriteItemInput, error`

### BatchDeleteItemsInputFromRaw
```go
func BatchDeleteItemsInputFromRaw(items []SchemaItem) (*dynamodb.BatchWriteItemInput, error)
```
_Создает BatchWriteItemInput из SchemaItems._

**Параметры:**
- `items` - элементы схемы

**Возвращает:** `*dynamodb.BatchWriteItemInput, error`

## Stream Functions

### ExtractNewImage
```go
func ExtractNewImage(record events.DynamoDBEventRecord) (*SchemaItem, error)
```
_Извлекает новое состояние элемента из stream record._

**Параметры:**
- `record` - запись stream

**Возвращает:** `*SchemaItem, error`

### ExtractOldImage
```go
func ExtractOldImage(record events.DynamoDBEventRecord) (*SchemaItem, error)
```
_Извлекает старое состояние элемента из stream record._

**Параметры:**
- `record` - запись stream

**Возвращает:** `*SchemaItem, error`

### ExtractKeys
```go
func ExtractKeys(record events.DynamoDBEventRecord) (map[string]types.AttributeValue, error)
```
_Извлекает ключи элемента из stream record._

**Параметры:**
- `record` - запись stream

**Возвращает:** `map[string]types.AttributeValue, error`

### IsInsertEvent
```go
func IsInsertEvent(record events.DynamoDBEventRecord) bool
```
_Проверяет, является ли событие вставкой._

**Параметры:**
- `record` - запись stream

**Возвращает:** `bool`

### IsModifyEvent
```go
func IsModifyEvent(record events.DynamoDBEventRecord) bool
```
_Проверяет, является ли событие модификацией._

**Параметры:**
- `record` - запись stream

**Возвращает:** `bool`

### IsRemoveEvent
```go
func IsRemoveEvent(record events.DynamoDBEventRecord) bool
```
_Проверяет, является ли событие удалением._

**Параметры:**
- `record` - запись stream

**Возвращает:** `bool`

### ExtractChangedAttributes
```go
func ExtractChangedAttributes(record events.DynamoDBEventRecord) ([]string, error)
```
_Возвращает список изменившихся атрибутов._

**Параметры:**
- `record` - запись stream

**Возвращает:** `[]string, error`

### HasAttributeChanged
```go
func HasAttributeChanged(record events.DynamoDBEventRecord, attributeName string) bool
```
_Проверяет, изменился ли конкретный атрибут._

**Параметры:**
- `record` - запись stream
- `attributeName` - имя атрибута

**Возвращает:** `bool`

## Validation Functions

### validateHashKey
```go
func validateHashKey(value any) error
```
_Проверяет значение hash key._

**Параметры:**
- `value` - значение

**Возвращает:** `error`

### validateRangeKey
```go
func validateRangeKey(value any) error
```
_Проверяет значение range key._

**Параметры:**
- `value` - значение

**Возвращает:** `error`

### validateKeyInputs
```go
func validateKeyInputs(hashKeyValue, rangeKeyValue any) error
```
_Проверяет значения ключей._

**Параметры:**
- `hashKeyValue` - значение hash key
- `rangeKeyValue` - значение range key

**Возвращает:** `error`

### validateUpdatesMap
```go
func validateUpdatesMap(updates map[string]any) error
```
_Проверяет карту обновлений._

**Параметры:**
- `updates` - карта обновлений

**Возвращает:** `error`

### validateConditionExpression
```go
func validateConditionExpression(expr string) error
```
_Проверяет условное выражение._

**Параметры:**
- `expr` - выражение

**Возвращает:** `error`

### validateBatchSize
```go
func validateBatchSize(size int, operation string) error
```
_Проверяет размер batch операции._

**Параметры:**
- `size` - размер
- `operation` - тип операции

**Возвращает:** `error`

### validateIncrementValue
```go
func validateIncrementValue(value int) error
```
_Проверяет значение инкремента._

**Параметры:**
- `value` - значение

**Возвращает:** `error`

## Operators

### OperatorType
```go
type OperatorType string
```
_Тип оператора._

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
_Проверяет количество значений для оператора._

**Параметры:**
- `op` - оператор
- `values` - значения

**Возвращает:** `bool`

### IsKeyConditionOperator
```go
func IsKeyConditionOperator(op OperatorType) bool
```
_Проверяет, может ли оператор использоваться в key conditions._

**Параметры:**
- `op` - оператор

**Возвращает:** `bool`

### ValidateOperator
```go
func ValidateOperator(fieldName string, op OperatorType) bool
```
Проверяет совместимость оператора с полем.

**Параметры:**
- `fieldName` - имя поля
- `op` - оператор

**Возвращает:** `bool`

### BuildConditionExpression
```go
func BuildConditionExpression(field string, op OperatorType, values []any) (expression.ConditionBuilder, error)
```
_Создает условие фильтрации._

**Параметры:**
- `field` - имя поля
- `op` - оператор
- `values` - значения

**Возвращает:** `expression.ConditionBuilder, error`

### BuildKeyConditionExpression
```go
func BuildKeyConditionExpression(field string, op OperatorType, values []any) (expression.KeyConditionBuilder, error)
```
_Создает ключевое условие._

**Параметры:**
- `field` - имя поля
- `op` - оператор
- `values` - значения

**Возвращает:** `expression.KeyConditionBuilder, error`
