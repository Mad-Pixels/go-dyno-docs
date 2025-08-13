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

# API Reference

## Constants

### TableName

DynamoDB table name.

```go
const TableName = "table-name"
```

### Column

Table column names.

```go
const ColumnId = "id"
const ColumnEmail = "email"
const ColumnTimestamp = "timestamp"
```

::: tip Column naming convention:  
All defined columns start with `Column` and follow CamelCase syntax.
:::

### Index

Names of secondary indexes.

```go
const IndexEmailIndex = "email-index"
```

::: tip Index naming convention:  
All defined indexes start with `Index` and follow CamelCase syntax.
:::

### Attribute

Slice of strings with all attribute names from the DynamoDB table.

```go
var AttributeNames = []string{"id", "timestamp", "email"}
```

### KeyAttribute

Slice of strings containing the primary key attributes of the DynamoDB table.

```go
var KeyAttributeNames = []string{"id", "timestamp"}
```

## Data Structs

### SchemaItem

Structure representing a single record in DynamoDB.

```go
type SchemaItem struct {
  Id        string `dynamodbav:"id"`
  Email     string `dynamodbav:"email"`
  Timestamp int64  `dynamodbav:"timestamp"`
}
```

### TableSchema

Global variable of type `DynamoSchema` that contains all table metadata.

```go
var TableSchema = DynamoSchema{
  TableName: "table-name",
  HashKey:   "id",
  RangeKey:  "timestamp",
  // ...
}
```

::: details More...

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

- `With` _(WithEQ, WithGT, etc.)_  
  Applied **BEFORE** reading data from DynamoDB and determine which items will be read.

- `Filter` _(FilterEQ, FilterGT, etc.)_  
  Applied **AFTER** reading data and affect only the returned result set.  
  :::

### NewQueryBuilder

Create new `QueryBuilder` object.

```go
func NewQueryBuilder() *QueryBuilder
```

### qb.Limit

Sets a limit on the number of results.

```go
func (qb *QueryBuilder) Limit(limit int) *QueryBuilder
```

::: details Example

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

### qb.WithIndex

Explicitly specifies which `secondary index` to use for the query instead of automatic selection.

```go
func (qb *QueryBuilder) WithIndex(indexName string) *QueryBuilder
```

::: danger !!! [Bug](https://github.com/Mad-Pixels/go-dyno/issues/67) in v0.0.2 version.
method will not generate with `min` mode.
:::
::: details Example
Multiple indexes schema:

```json
{
  "table_name": "user-orders",
  "hash_key": "user_id",
  "range_key": "order_id",
  "attributes": [
    { "name": "user_id", "type": "S" },
    { "name": "order_id", "type": "S" },
    { "name": "status", "type": "S" }
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

Query examples:

```go
query1 := userorders.NewQueryBuilder().
  WithEQ("user_id", "user123").
  WithEQ("status", "active")

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
::: tip Additional Notes  
`Without WithIndex:`

- QueryBuilder automatically selects the optimal index
- Searches for a GSI/LSI that supports your keys

`With WithIndex:`

- QueryBuilder forcibly uses the specified index
- Ignores automatic selection  
  :::

### qb.StartFrom

Sets the starting key for pagination.

```go
func (qb *QueryBuilder) StartFrom(
  lastEvaluatedKey map[string]types.AttributeValue,
) *QueryBuilder
```

::: details Example

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
::: tip **`LastEvaluatedKey`** can be **`null`** even if more data exists and the response size exceeds `1MB`.

_Always check for LastEvaluatedKey to continue pagination._
:::

### qb.OrderByDesc

Sets descending order.

```go
func (qb *QueryBuilder) OrderByDesc() *QueryBuilder
```

::: details Example

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
::: tip `OrderByDesc` only affects sorting by the sort key, not the filter results.
:::

### qb.OrderByAsc

Sets ascending order.

```go
func (qb *QueryBuilder) OrderByAsc() *QueryBuilder
```

::: details Example

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
::: tip `OrderByAsc` only affects sorting by the sort key, not the filter results.
:::

### qb.WithPreferredSortKey

Indicates to the index selection algorithm a preferred sort key.

```go
func (qb *QueryBuilder) WithPreferredSortKey(key string) *QueryBuilder
```

::: details Example

```go
// There are multiple indexes with the same hash key:
// - lsi_by_status (sort key: status)
// - lsi_by_created_at (sort key: created_at)
// - lsi_by_priority (sort key: priority)

query1 := userorders.NewQueryBuilder().
    WithEQ("user_id", "user123").
    WithEQ("status", "active")
// Can choose any matching index (e.g., lsi_by_status or lsi_by_created_at)

query2 := userorders.NewQueryBuilder().
    WithEQ("user_id", "user123").
    WithEQ("status", "active").
    WithPreferredSortKey("created_at")
// Hints to prefer lsi_by_created_at if applicable

items, err := query2.Execute(ctx, dynamoClient)
```

:::
::: tip When to Use WithPreferredSortKey
Use WithPreferredSortKey when:

- There are multiple indexes matching the query's partition key
- You want the results to be sorted by a specific sort key
- You know which index is more efficient or relevant for your use case
  :::
  ::: warning Important
  WithPreferredSortKey Is a Hint, Not a Requirement

✅ The query planner prefers an index with the specified sort key  
❌ But it may choose a different one if no suitable index is found  
🎯 To force a specific index, use `WithIndex(indexName)` instead
:::

### qb.With

Adds a condition for DynamoDB queries.  
Accepts:

- `field` - field name
- `value` - value
- `op` - operator type

```go
func (qb *QueryBuilder) With(
  field string,
  op OperatorType,
  values ...any,
) *QueryBuilder
```

::: warning Query impact:  
All `With` methods are applied **BEFORE** reading data from DynamoDB.  
_(This is faster and cheaper than using `Filter`)_
:::
::: details Example

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

#### Sugar

::: tip Methods are only generated when using the `all` generation type:

```bash
godyno -s schema.json -o ./gen -mode all
godyno -s schema.json -o ./gen
```

In `min` mode, use the generic `With` method instead:

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

Adds an `equal` condition for keys.

```go
func (qb *QueryBuilder) WithEQ(field string, value any) *QueryBuilder
```

::: details Example

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

##### qb.WithGT

Adds a `greater than` condition for the range key.

```go
func (qb *QueryBuilder) WithGT(field string, value any) *QueryBuilder
```

::: details Example

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

Adds a `less than` condition for the range key.

```go
func (qb *QueryBuilder) WithLT(field string, value any) *QueryBuilder
```

::: details Example

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

Adds a `greater than or equal to` condition for the range key.

```go
func (qb *QueryBuilder) WithGTE(field string, value any) *QueryBuilder
```

::: details Example

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

Adds a `less than or equal to` condition for the range key.

```go
func (qb *QueryBuilder) WithLTE(field string, value any) *QueryBuilder
```

::: details Example

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

Adds a `range condition` for the range key.

```go
func (qb *QueryBuilder) WithBetween(field string, start, end any) *QueryBuilder
```

::: details Example

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

Adds a `begins with` condition for the range key.

```go
func (qb *QueryBuilder) WithBeginsWith(field string, value any) *QueryBuilder
```

::: details Example

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

Specifies which exact fields to return from DynamoDB instead of retrieving the entire item.

```go
func (qb *QueryBuilder) WithProjection(attributes []string) *QueryBuilder
```

::: details Example

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
Without WithProjection:

```go
type SchemaItem struct {
    Id          string   // ✅
    Name        string   // ✅
    Email       string   // ✅
    Description string   // ✅ (not needed, but will be returned)
    Content     string   // ✅ (not needed, but will be returned)
    Tags        []string // ✅ (not needed, but will be returned)
    ViewCount   int      // ✅ (not needed, but will be returned)
}
```

With WithProjection:

```go
// Only the specified fields will be returned
WithProjection([]string{"id", "name", "email"})

// Resulting struct:
type PartialItem struct {
    Id    string  // ✅
    Name  string  // ✅
    Email string  // ✅
    // Description - omitted
    // Content - omitted
    // Tags - omitted
    // ViewCount - omitted
}
```

:::
::: warning Projection reduces `bandwidth` usage but does NOT reduce `RCU` cost — you're still billed for reading the full item.
:::

### qb.Filter

Adds a condition for filtering values retrieved from DynamoDB.  
Accepts:

- `field` - field name
- `value` - value
- `op` - operator type

```go
func (qb *QueryBuilder) Filter(
  field string,
  op OperatorType,
  values ...any,
) *QueryBuilder
```

::: warning Query impact:  
All `Filter` methods are applied **AFTER** reading data from DynamoDB.  
_(use with caution)_
:::
::: details Example

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

#### Sugar

::: tip Methods are only generated when using the `all` generation type:

```bash
godyno -s schema.json -o ./gen -mode all
godyno -s schema.json -o ./gen
```

In `min` mode, use the generic `Filter` method instead:

```go
query
  .Filter("status", EQ, "active")
  .Filter("priority", BETWEEN, 80, 100)
```

:::

##### qb.FilterEQ

Adds an `equality` filter.

```go
func (qb *QueryBuilder) FilterEQ(field string, value any) *QueryBuilder
```

::: details Example

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

Adds an `inequality` filter.

```go
func (qb *QueryBuilder) FilterNE(field string, value any) *QueryBuilder
```

::: details Example

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

Adds a `greater than` filter.

```go
func (qb *QueryBuilder) FilterGT(field string, value any) *QueryBuilder
```

::: details Example

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

Adds a `less than` filter.

```go
func (qb *QueryBuilder) FilterLT(field string, value any) *QueryBuilder
```

::: details Example

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

Adds a `greater than or equal to` filter.

```go
func (qb *QueryBuilder) FilterGTE(field string, value any) *QueryBuilder
```

::: details Example

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

Adds a `less than or equal to` filter.

```go
func (qb *QueryBuilder) FilterLTE(field string, value any) *QueryBuilder
```

::: details Example

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

Adds a `range` filter.

```go
func (qb *QueryBuilder) FilterBetween(field string, start, end any) *QueryBuilder
```

::: details Example

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

Adds a `contains` filter.

```go
func (qb *QueryBuilder) FilterContains(field string, value any) *QueryBuilder
```

::: details Example

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

Adds a `not contains` filter.

```go
func (qb *QueryBuilder) FilterNotContains(field string, value any) *QueryBuilder
```

::: details Example

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

Adds a `begins with` filter.

```go
func (qb *QueryBuilder) FilterBeginsWith(field string, value any) *QueryBuilder
```

::: details Example

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

Adds an `in list` filter.

```go
func (qb *QueryBuilder) FilterIn(field string, values ...any) *QueryBuilder
```

::: details Example

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

Adds a `not in list` filter.

```go
func (qb *QueryBuilder) FilterNotIn(field string, values ...any) *QueryBuilder
```

::: details Example

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

Adds a `field exists` filter.

```go
func (qb *QueryBuilder) FilterExists(field string) *QueryBuilder
```

::: details Example

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

Adds a `field does not exist` filter.

```go
func (qb *QueryBuilder) FilterNotExists(field string) *QueryBuilder
```

::: details Example

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

Builds a DynamoDB `QueryInput`.

```go
func (qb *QueryBuilder) BuildQuery() (*dynamodb.QueryInput, error)
```

### qb.Execute

Executes the query.

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

::: warning Scan reads the entire table.
:::

### NewScanBuilder

Create new `ScanBuilder`.

```go
func NewScanBuilder() *ScanBuilder
```

### sb.WithIndex

Explicitly specifies which secondary index to use for the query, overriding automatic index selection.

```go
func (sb *ScanBuilder) WithIndex(indexName string) *ScanBuilder
```

::: info Performs a scan on a specific index

- **GSI** (Global Secondary Index) has its own RCU/WCU configuration
- **LSI** (Local Secondary Index) shares RCU/WCU with the base table
  :::
  ::: details Example

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

Sets the maximum number of items.

```go
func (sb *ScanBuilder) Limit(limit int) *ScanBuilder
```

::: details Example

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

Sets the starting key for pagination.

```go
func (sb *ScanBuilder) StartFrom(
  lastEvaluatedKey map[string]types.AttributeValue,
) *ScanBuilder
```

::: warning Pagination  
**`LastEvaluatedKey`** can be **`null`** even if there is more data and the response size exceeds `1MB`.

_Always check for LastEvaluatedKey to continue pagination._  
:::
::: details Example

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

Specifies which exact fields to return from DynamoDB instead of all item attributes.

```go
func (sb *ScanBuilder) WithProjection(attributes []string) *ScanBuilder
```

::: info
Without WithProjection:

```go
type SchemaItem struct {
    Id          string   // ✅
    Name        string   // ✅
    Email       string   // ✅
    Description string   // ✅ (not needed, but will be returned)
    Content     string   // ✅ (not needed, but will be returned)
    Tags        []string // ✅ (not needed, but will be returned)
    ViewCount   int      // ✅ (not needed, but will be returned)
}
```

With WithProjection:

```go
// Returns ONLY the specified fields
WithProjection([]string{"id", "name", "email"})

// As a result, only:
type PartialItem struct {
    Id    string  // ✅
    Name  string  // ✅
    Email string  // ✅
    // Description - missing
    // Content - missing
    // Tags - missing
    // ViewCount - missing
}
```

:::
::: warning Projection **reduces `bandwidth` usage** but **does NOT reduce `RCU`** — you are billed for reading all item attributes.
:::
::: details Example

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

::: warning Parallel Scan
Increases RCU consumption proportionally to the number of segments.

_Use with caution in production environments._
:::

### sb.Filter

Adds a condition to filter the values retrieved from DynamoDB.  
Accept:

- `field` - field name
- `value` - value
- `op` - operator type

```go
func (sb *ScanBuilder) Filter(
  field string,
  op OperatorType,
  values ...any,
) *ScanBuilder
```

::: details Example

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

#### Sugar

::: tip Methods are only generated when using the `all` generation type:

```bash
godyno -s schema.json -o ./gen -mode all
godyno -s schema.json -o ./gen
```

In `min` mode, use the generic `Filter` method instead:

```go
scan
  .Filter("status", EQ, "active")
  .Filter("priority", BETWEEN, 80, 100)
```

:::

##### sb.FilterEQ

Adds an `equality` filter.

```go
func (sb *ScanBuilder) FilterEQ(field string, value any) *ScanBuilder
```

::: details Example

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

Adds a `not equal` filter.

```go
func (sb *ScanBuilder) FilterNE(field string, value any) *ScanBuilder
```

::: details Example

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

Adds a `greater than` filter.

```go
func (sb *ScanBuilder) FilterGT(field string, value any) *ScanBuilder
```

::: details Example

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

Adds a `less than` filter.

```go
func (sb *ScanBuilder) FilterLT(field string, value any) *ScanBuilder
```

::: details Example

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

Adds a `greater than or equal` filter.

```go
func (sb *ScanBuilder) FilterGTE(field string, value any) *ScanBuilder
```

::: details Example

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

Adds a `less than or equal` filter.

```go
func (sb *ScanBuilder) FilterLTE(field string, value any) *ScanBuilder
```

::: details Example

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

Adds a `between` filter.

```go
func (sb *ScanBuilder) FilterBetween(
  field string,
  start,
  end any,
) *ScanBuilder
```

::: details Example

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

Adds a `contains` filter.

```go
func (sb *ScanBuilder) FilterContains(field string, value any) *ScanBuilder
```

::: details Example

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

Adds a `not contains` filter.

```go
func (sb *ScanBuilder) FilterNotContains(
  field string,
  value any,
) *ScanBuilder
```

::: details Example

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

Adds a `begins with` filter.

```go
func (sb *ScanBuilder) FilterBeginsWith(field string, value any) *ScanBuilder
```

::: details Example

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

Adds an `IN list` filter.

```go
func (sb *ScanBuilder) FilterIn(field string, values ...any) *ScanBuilder
```

::: details Example

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

Adds a `NOT IN list` filter.

```go
func (sb *ScanBuilder) FilterNotIn(field string, values ...any) *ScanBuilder
```

::: details Example

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

Adds a `NOT NULL` filter.

```go
func (sb *ScanBuilder) FilterExists(field string) *ScanBuilder
```

::: details Example

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

Adds a `Empty` filter.

```go
func (sb *ScanBuilder) FilterNotExists(field string) *ScanBuilder
```

::: details Example

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

Builds a DynamoDB ScanInput.

```go
func (sb *ScanBuilder) BuildScan() (*dynamodb.ScanInput, error)
```

### sb.Execute

Executes the scan operation.

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

Converts a `SchemaItem` into a DynamoDB `AttributeValue` map.

```go
func ItemInput(item SchemaItem) (map[string]types.AttributeValue, error)
```

### KeyInput

Creates a key from hash and range key values.

```go
func KeyInput(
  hashKeyValue,
  rangeKeyValue any,
) (
  map[string]types.AttributeValue,
  error,
)
```

::: info `rangeKeyValue` can be **`nil`** if the table uses only a hash key\_
:::

### KeyInputFromRaw

Creates a key from raw values with validation.

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

Extracts the key from a SchemaItem.

```go
func KeyInputFromItem(
  item SchemaItem
) (
  map[string]types.AttributeValue,
  error,
)
```

### UpdateItemInput

Converts a SchemaItem into a DynamoDB UpdateItemInput.

```go
UpdateItemInput(item SchemaItem) (*dynamodb.DeleteItemInput, error)
```

### UpdateItemInputFromRaw

Creates an UpdateItemInput from raw values.

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

Creates an UpdateItemInput with a condition expression.

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

Creates an UpdateItemInput using expression builders.

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

Converts a SchemaItem into a DynamoDB DeleteItemInput.

```go
DeleteItemInput(item SchemaItem) (*dynamodb.DeleteItemInput, error)
```

### DeleteItemInputFromRaw

Creates a DeleteItemInput from key values.

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

Creates a DeleteItemInput with a condition expression.

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

Converts a slice of `SchemaItem` into a slice of `AttributeValue` maps.

```go
func BatchItemsInput(
  items []SchemaItem,
) (
  []map[string]types.AttributeValue,
  error,
)
```

::: warning Maximum **`25`** items per batch operation.

_Exceeding the limit will result in an error._
:::

### BatchDeleteItemsInput

Creates `BatchWriteItemInput` for deleting items.

```go
func BatchDeleteItemsInput(
  keys []map[string]types.AttributeValue,
) (
  *dynamodb.BatchWriteItemInput,
  error,
)
```

::: warning Maximum of **`25`** items per batch operation.  
_Exceeding the limit will result in an error._
:::

### BatchDeleteItemsInputFromRaw

Creates `BatchWriteItemInput` from SchemaItems.

```go
func BatchDeleteItemsInputFromRaw(
  items []SchemaItem,
) (
  *dynamodb.BatchWriteItemInput,
  error,
)
```

::: warning Maximum of **`25`** items per batch operation.  
_Exceeding the limit will result in an error._
:::

## Stream Functions

::: tip Methods are generated only when using the `all` generation type.

```bash
godyno -s schema.json -o ./gen -mode all
godyno -s schema.json -o ./gen
```

:::

### ExtractFromDynamoDBStreamEvent

Extracts the new state of the item from a stream record.

```go
func ExtractFromDynamoDBStreamEvent(dbEvent events.DynamoDBEventRecord) (*SchemaItem, error)
```

### ExtractOldFromDynamoDBStreamEvent

Extracts the old state of the item from a stream record.

```go
func ExtractOldFromDynamoDBStreamEvent(dbEvent events.DynamoDBEventRecord) (*SchemaItem, error)
```

### ExtractBothFromDynamoDBStreamEvent

Extracts the old and new state of the item from a stream record.

```go
func ExtractBothFromDynamoDBStreamEvent(
  dbEvent events.DynamoDBEventRecord,
) (
  *SchemaItem,
  *SchemaItem,
  error,
)
```

#### CreateTriggerHandler

Create DynamoDB Event Handler.

```go
func CreateTriggerHandler(
  onInsert func(context.Context, *SchemaItem) error,
  onModify func(context.Context, *SchemaItem, *SchemaItem) error,
  onDelete func(context.Context, map[string]events.DynamoDBAttributeValue) error,
) func(ctx context.Context, event events.DynamoDBEvent) error
```

::: tip

- onInsert — called for INSERT events, receives the new SchemaItem
- onModify — called for MODIFY events, receives the old and new SchemaItem
- onDelete — called for REMOVE events, receives the keys of the deleted item
  :::

#### IsFieldModified

Checks whether a given attribute was actually changed in a DynamoDB MODIFY stream event. It compares the old and new images and returns true only if the field was added, removed, or its value differs.

```go
func IsFieldModified(
  record events.DynamoDBEventRecord,
  fieldName string,
) bool
```

::: tip return `true` if:

- the event is MODIFY and the field previously did not exist but now does
- the event is MODIFY and the field previously existed but now does not
- the event is MODIFY and the field existed in both images and its serialized value differs
  :::

## Operators

::: warning Key Conditions VS Filters  
**Key Conditions** - applied `BEFORE` reading:

- Define which items to read from DynamoDB
- Affect the cost of the operation (RCU)
- Only support: [`EQ`, `GT`, `LT`, `GTE`, `LTE`, `BETWEEN`, `BEGINS_WITH`]
- `EQ` is required for the partition key
- Other operators apply only to the sort key

**Filter Expressions** - applied `AFTER` reading:

- Filter the data after it has been read
- Do NOT affect the cost (you pay for all read items)
- Support ALL operators
- Filter-only operators: [`CONTAINS`, `NOT_CONTAINS`, `IN`, `NOT_IN`, `EXISTS`, `NOT_EXISTS`, `NE`]

**Recommendation:**

Use key conditions as much as possible, and filters only for additional refinement.  
:::

### OperatorType

```go
type OperatorType string
```

### Constants

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

Validates the number of values for an operator.

```go
func ValidateValues(op OperatorType, values []any) bool
```

### IsKeyConditionOperator

Checks if the operator can be used in key conditions.

```go
func IsKeyConditionOperator(op OperatorType) bool
```

### ValidateOperator

Checks if the operator is compatible with the field.

```go
func ValidateOperator(fieldName string, op OperatorType) bool
```

### BuildConditionExpression

Creates a filter condition.

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

Creates a key condition.

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
