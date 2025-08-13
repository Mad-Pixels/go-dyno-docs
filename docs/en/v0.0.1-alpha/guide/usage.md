# Usage

## Code Generation

### Basic Command

The primary command for generating Go code from a JSON schema:

```bash
godyno gen --cfg schema.json --dest ./generated
```

This command will create a Go file in the `./generated/table_name/table_name.go` directory based on your schema.

### Command Line Options

- **--cfg, -c** - Path to the JSON schema file (required)
- **--dest, -d** - Directory for generated files (required)

### Environment Variables

Instead of flags, you can use environment variables:

```bash
export GODYNO_CFG=./schemas/users.json
export GODYNO_DEST=./generated

godyno gen
```

### Output File Structure

After generation, you will see the following structure:

```bash
./generated/
└── user_posts/           # Package name derived from table_name
    └── user_posts.go     # Generated code
```

The package name and directory are automatically formed from the `table_name` in the schema, converted to a Go-safe format.
::: tip
If your schema includes hyphens, they will be automatically converted to underscores.
:::

## Working with the Generated Code

### Core Structures

Each schema generates several key structures:

**SchemaItem** – the primary struct for working with records:

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
The `dynamodbav` tags are used by the AWS SDK for Go to automatically marshal fields to AttributeValue.
:::

**DynamoSchema** – table metadata:

```go
var TableSchema = DynamoSchema{
  TableName:        "user-posts",
  HashKey:          "user_id",
  RangeKey:         "created_at",
  Attributes:       []Attribute{...},
  SecondaryIndexes: []SecondaryIndex{...},
}
```

### Constants and Metadata

For type-safe usage, the following constants are generated:

```go
// Table and index names
const TableName = "user-posts"
const IndexStatusIndex = "StatusIndex"

// Column names
const ColumnUserId = "user_id"
const ColumnCreatedAt = "created_at"
const ColumnStatus = "status"

// Array of all attributes
var AttributeNames = []string{
  "user_id", "created_at", "status", "title", "content", "views",
}

// Index projections
var IndexProjections = map[string][]string{
  "StatusIndex": {"user_id", "created_at", "status", "title", "content", "views"},
}
```

Using constants instead of hard-coded strings ensures:

- no typos when referring to table or column names
- safety when renaming fields (your IDE will catch all references)

### Creating Items

```go
post := userposts.SchemaItem{
  UserId:    "user123",
  CreatedAt: 1640995200,
  Status:    "published",
  Title:     "Post Title",
  Content:   "Post content...",
  Views:     0,
}

// Marshal for DynamoDB
item, err := userposts.PutItem(post)
if err != nil {
  log.Fatal(err)
}

// Save to DynamoDB
_, err = client.PutItem(ctx, &dynamodb.PutItemInput{
  TableName: aws.String(userposts.TableName),
  Item:      item,
})
if err != nil {
  log.Fatal(err)
}

// Retrieve an item from DynamoDB
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
log.Printf("Fetched item: %+v", fetched)
```

**Creating a Key for Operations:**

```go
// Create a key from values
key, err := userposts.CreateKey("user123", 1640995200)
if err != nil {
  log.Fatal(err)
}

// Create a key from an existing item
key, err := userposts.CreateKeyFromItem(post)
if err != nil {
  log.Fatal(err)
}

// Use the key for GetItem
result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
  TableName: aws.String(userposts.TableName),
  Key:       key,
})
if err != nil {
  log.Fatal(err)
}
```

### Batch Operations

**Prepare a batch of items:**

```go
posts := []userposts.SchemaItem{
  {UserId: "user1", CreatedAt: 1640995200, Title: "Post 1", Status: "published"},
  {UserId: "user2", CreatedAt: 1640995300, Title: "Post 2", Status: "draft"},
  {UserId: "user3", CreatedAt: 1640995400, Title: "Post 3", Status: "published"},
}

batchItems, err := userposts.BatchPutItems(posts)
if err != nil {
  log.Fatal(err)
}
```

**Use AWS BatchWriteItem:**

```go
// Convert to WriteRequest
writeRequests := make([]types.WriteRequest, len(batchItems))
for i, item := range batchItems {
  writeRequests[i] = types.WriteRequest{
    PutRequest: &types.PutRequest{Item: item},
  }
}

// Execute batch write
_, err = client.BatchWriteItem(ctx, &dynamodb.BatchWriteItemInput{
  RequestItems: map[string][]types.WriteRequest{
    userposts.TableName: writeRequests,
  },
})
if err != nil {
  log.Fatal(err)
}
```

## QueryBuilder

### Basic Queries

**Create a QueryBuilder:**

```go
qb := userposts.NewQueryBuilder()
```

**Simple hash key query:**

```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  Execute(ctx, dynamoClient)
```

**Hash + range key query:**

```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithCreatedAt(1640995200).
  Execute(ctx, dynamoClient)
```

### Filter Conditions

**Filter by attributes:**

```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").          // KeyCondition (hash key)
  WithStatus("published").        // KeyCondition (if using StatusIndex) or FilterExpression
  WithTitle("Important News").    // FilterExpression
  Execute(ctx, dynamoClient)
```

::: danger
QueryBuilder automatically determines the type of condition:

- **KeyCondition** – attributes that are keys in the chosen index (efficient)
- **FilterExpression** – all other attributes (inefficient, filters after read)

In the example above:

- `WithUserId` → KeyCondition (main table hash key)
- `WithStatus` → KeyCondition (if StatusIndex is chosen) or FilterExpression
- `WithTitle` → FilterExpression (increases RCU, since DynamoDB reads all user items first, then filters by title)
  :::

**Optimal queries (only KeyConditions):**

```go
// Efficient: uses only StatusIndex
posts, err := userposts.NewQueryBuilder().
  WithStatus("published").        // KeyCondition (StatusIndex hash key)
  WithCreatedAtGreaterThan(ts).   // KeyCondition (StatusIndex range key)
  Execute(ctx, dynamoClient)
```

**Combining conditions:**

```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithStatus("published").
  WithViewsGreaterThan(100).  // Popular posts
  Execute(ctx, dynamoClient)
```

### Range Queries

For numeric attributes, range conditions are available:

**Greater than / less than:**

```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithCreatedAtGreaterThan(1640990000).  // Posts after a date
  Execute(ctx, dynamoClient)

posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithViewsLessThan(1000).  // Posts with fewer views
  Execute(ctx, dynamoClient)
```

**Between values:**

```go
var (
  startDate = 1640995000
  endDate   = 1640999000
)

posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithCreatedAtBetween(startDate, endDate).
  Execute(ctx, dynamoClient)
```

### Sorting and Pagination

**Sort control:**

```go
// Ascending (default)
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  OrderByAsc().
  Execute(ctx, dynamoClient)

// Descending
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  OrderByDesc().
  Execute(ctx, dynamoClient)
```

**Limit results:**

```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  Limit(10).
  Execute(ctx, dynamoClient)
```

**Pagination:**

```go
// First request
qb := userposts.NewQueryBuilder().
  WithUserId("user123").
  Limit(10)

posts, err := qb.Execute(ctx, dynamoClient)

// Retrieve LastEvaluatedKey from DynamoDB result
// (requires directly calling BuildQuery + Query)
queryInput, err := qb.BuildQuery()
result, err := client.Query(ctx, queryInput)

// Next page
if result.LastEvaluatedKey != nil {
  nextPosts, err := userposts.NewQueryBuilder().
    WithUserId("user123").
    StartFrom(result.LastEvaluatedKey).
    Limit(10).
    Execute(ctx, dynamoClient)
}
```

### Composite Key Handling

For schemas with composite keys, special methods are generated:

**Schema with a composite key:**

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

**Use composite key:**

```go
posts, err := userposts.NewQueryBuilder().
  WithCategoryStatusIndexHashKey("tech", "published").  // category="tech", status="published"
  WithCreatedAtGreaterThan(1640990000).
  Execute(ctx, dynamoClient)
```

**Complex composite keys:**

```go
// For key "level#category#status"
posts, err := userposts.NewQueryBuilder().
  WithLevelCategoryStatusIndexHashKey("beginner", "tech", "published").
  OrderByDesc().
  Execute(ctx, dynamoClient)
```

### Index Selection

QueryBuilder automatically picks the most suitable index:

**Index selection principles:**

1. User preference via `WithPreferredSortKey`
2. More complex composite keys take priority
3. Availability of all required attributes in the index

**Manual index selection:**

```go
posts, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithStatus("published").
  WithPreferredSortKey("created_at").  // Force use of index with created_at
  Execute(ctx, dynamoClient)
```

**Build query without execution:**

```go
queryInput, err := userposts.NewQueryBuilder().
  WithUserId("user123").
  WithStatus("published").
  BuildQuery()  // Returns *dynamodb.QueryInput

if err != nil {
  log.Fatal(err)
}

// Check chosen index
if queryInput.IndexName != nil {
  fmt.Printf("Using index: %s
", *queryInput.IndexName)
} else {
  fmt.Println("Using main table")
}

// Execute query manually
result, err := client.Query(ctx, queryInput)
```

## DynamoDB Streams

### Extracting Data from Events

**Manually extract data from a Stream record:**

```go
func processStreamRecord(record events.DynamoDBEventRecord) error {
  item, err := userposts.ExtractFromDynamoDBStreamEvent(record)
  if err != nil {
    return fmt.Errorf("failed to extract item: %w", err)
  }

  log.Printf("Processing record: %+v", item)
  return nil
}
```

**Batch processing Stream events:**

```go
func handleStreamEvent(ctx context.Context, event events.DynamoDBEvent) error {
  for _, record := range event.Records {
    switch record.EventName {
    case "INSERT":
      item, err := userposts.ExtractFromDynamoDBStreamEvent(record)
      if err != nil {
        return err
      }
      log.Printf("New post: %s", item.Title)

    case "MODIFY":
      item, err := userposts.ExtractFromDynamoDBStreamEvent(record)
      if err != nil {
        return err
      }
      log.Printf("Updated post: %s", item.Title)
    }
  }
  return nil
}
```

### Tracking Field Changes

**Check if specific fields changed:**

```go
func analyzePostChanges(record events.DynamoDBEventRecord) {
  if record.EventName != "MODIFY" {
    return
  }

  // Check title change
  if userposts.IsFieldModified(record, "title") {
    log.Println("Post title was changed")
  }

  // Check status change
  if userposts.IsFieldModified(record, "status") {
    log.Println("Post status was changed")
  }

  // Check content change
  if userposts.IsFieldModified(record, "content") {
    log.Println("Post content was changed")
  }

  // Check views change
  if userposts.IsFieldModified(record, "views") {
    log.Println("Post views changed")
  }
}
```

## Utilities

**Create a key for DynamoDB operations:**

```go
// From individual values
key, err := userposts.CreateKey("user123", 1640995200)
if err != nil {
  log.Fatal(err)
}

// Use with GetItem
result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
  TableName: aws.String(userposts.TableName),
  Key:       key,
})
```

**Extract a key from an existing item:**

```go
post := userposts.SchemaItem{
  UserId:    "user123",
  CreatedAt: 1640995200,
  Title:     "My post",
}

// GoDyno extracts only key fields
key, err := userposts.CreateKeyFromItem(post)
if err != nil {
  log.Fatal(err)
}

// Use for DeleteItem
_, err = client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
  TableName: aws.String(userposts.TableName),
  Key:       key,
})
```

### Type Conversions

**Boolean values to DynamoDB-compatible numbers:**

```go
dbValue := userposts.BoolToInt(true) // → 1
isActive := userposts.IntToBool(1)   // → true
```

### Helper Functions

**Marshal a single item:**

```go
post := userposts.SchemaItem{
  UserId:    "user123",
  CreatedAt: 1640995200,
  Title:     "Title",
  Content:   "Content",
  Views:     0,
}

// Convert to DynamoDB AttributeValue
item, err := userposts.PutItem(post)
if err != nil {
  log.Fatal(err)
}
```

**Batch conversion:**

```go
posts := []userposts.SchemaItem{
  {UserId: "user1", CreatedAt: 1640995200, Title: "Post 1"},
  {UserId: "user2", CreatedAt: 1640995300, Title: "Post 2"},
  {UserId: "user3", CreatedAt: 1640995400, Title: "Post 3"},
}

// Convert all items for BatchWriteItem
batchItems, err := userposts.BatchPutItems(posts)
if err != nil {
  log.Fatal(err)
}
```

**Convert arbitrary data:**

```go
// Convert map[string]interface{} to DynamoDB AttributeValue
data := map[string]interface{}{
  "title":      "Title",
  "views":      42,
  "is_active":  true,
  "metadata":   map[string]interface{}{"source": "api"},
  "tags":       []interface{}{"go", "dynamodb"},
}

attrs, err := userposts.ConvertMapToAttributeValues(data)
if err != nil {
  log.Fatal(err)
}
```

## AWS Integration

**Example using AWS SDK:**

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
  // Setup
  cfg, _ := config.LoadDefaultConfig(context.TODO())
  client := dynamodb.NewFromConfig(cfg)
  ctx := context.Background()

  // Create a post
  post := userposts.SchemaItem{
    UserId:    "user123",
    CreatedAt: 1640995200,
    Title:     "Test",
    Status:    "published",
    Views:     0,
  }

  item, _ := userposts.PutItem(post)
  client.PutItem(ctx, &dynamodb.PutItemInput{
    TableName: aws.String(userposts.TableName),
    Item:      item,
  })

  // Query posts
  posts, _ := userposts.NewQueryBuilder().
    WithUserId("user123").
    WithStatus("published").
    Execute(ctx, client)

  log.Printf("Found %d posts", len(posts))

  // Update views
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

  log.Println("✅ Done!")
}
```

## Terraform Integration

### Terraform Module for DynamoDB

Create a Terraform module that accepts a JSON schema:

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

### Using JSON Schemas

**Main Terraform file:**

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

## LocalStack Integration

**Example using LocalStack:**

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
  // Configure for LocalStack
  cfg, _ := config.LoadDefaultConfig(context.TODO(),
    config.WithCredentialsProvider(credentials.StaticCredentialsProvider{
      Value: aws.Credentials{AccessKeyID: "test", SecretAccessKey: "test"},
    }),
  )

  client := dynamodb.NewFromConfig(cfg, func(o *dynamodb.Options) {
    o.BaseEndpoint = aws.String("http://localhost:4566")
  })
  ctx := context.Background()

  // Create the table
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

  // Create a post
  post := userposts.SchemaItem{
    UserId: "user123", CreatedAt: 1640995200,
    Title: "LocalStack Test", Status: "published", Views: 0,
  }

  item, _ := userposts.PutItem(post)
  client.PutItem(ctx, &dynamodb.PutItemInput{
    TableName: aws.String(userposts.TableName),
    Item:      item,
  })

  // Query posts
  posts, _ := userposts.NewQueryBuilder().
    WithUserId("user123").
    Execute(ctx, client)

  log.Printf("Found %d posts in LocalStack", len(posts))
  log.Println("✅ LocalStack is working!")
}
```
