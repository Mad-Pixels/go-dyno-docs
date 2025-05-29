---
layout: doc
title: Quick Start
---

# Quick Start

Get up and running with GoDyno in minutes. Transform your DynamoDB schemas into production-ready Go code.

## Installation

### Download Binary

Download the latest release for your platform:

::: code-group
```bash
curl -L https://github.com/Mad-Pixels/go-dyno/releases/latest/download/godyno_darwin_amd64 -o godyno
chmod +x godyno
```

```bash
curl -L https://github.com/Mad-Pixels/go-dyno/releases/latest/download/godyno_darwin_arm64 -o godyno
chmod +x godyno
```

```bash
curl -L https://github.com/Mad-Pixels/go-dyno/releases/latest/download/godyno_linux_amd64 -o godyno
chmod +x godyno
```
:::

### Using Docker

```bash
docker pull madpixels/go-dyno:latest
```

### Build from Source

```bash
git clone https://github.com/Mad-Pixels/go-dyno.git
cd go-dyno
go build -o godyno ./cmd/dyno
```

## Your First Schema

Create a simple DynamoDB table schema. Save this as `user-table.json`:

```json
{
  "table_name": "user-table",
  "hash_key": "user_id",
  "range_key": "created_at",
  "attributes": [
    { "name": "user_id", "type": "S" },
    { "name": "created_at", "type": "N" }
  ],
  "common_attributes": [
    { "name": "email", "type": "S" },
    { "name": "name", "type": "S" },
    { "name": "age", "type": "N" }
  ],
  "secondary_indexes": [
    {
      "name": "EmailIndex",
      "hash_key": "email",
      "projection_type": "KEYS_ONLY"
    }
  ]
}
```

## Generate Go Code

Run GoDyno to generate your Go code:

::: code-group
```bash
./godyno gen --cfg user-table.json --dest ./generated
```

```bash
docker run --rm -v $(pwd):/workspace madpixels/go-dyno:latest \
  gen --cfg /workspace/user-table.json --dest /workspace/generated
```
:::

This creates `generated/user_table/user_table.go` with:

::: info Generated Code Features

- Type-safe structs for your DynamoDB items  
- Fluent QueryBuilder with method chaining  
- Utility functions for CRUD operations  
- Constants for table and column names  
- Stream handlers for DynamoDB Streams  

:::

## Using Generated Code

### Basic Operations

```go
package main

import (
    "context"
    "log"

    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/dynamodb"
    "your-project/generated/user_table"
)

func main() {
    cfg, err := config.LoadDefaultConfig(context.TODO())
    if err != nil {
        log.Fatal(err)
    }
    client := dynamodb.NewFromConfig(cfg)

    ctx := context.Background()

    user := user_table.SchemaItem{
        UserId:    "user123",
        CreatedAt: 1640995200,
        Email:     "john@example.com",
        Name:      "John Doe",
        Age:       30,
    }

    av, err := user_table.PutItem(user)
    if err != nil {
        log.Fatal(err)
    }

    _, err = client.PutItem(ctx, &dynamodb.PutItemInput{
        TableName: aws.String(user_table.TableName),
        Item:      av,
    })
    if err != nil {
        log.Fatal(err)
    }

    log.Println("User created successfully!")
}
```

### Query with Generated Builder

```go
query := user_table.NewQueryBuilder().
    WithEmail("john@example.com").
    OrderByDesc().
    Limit(10)

items, err := query.Execute(ctx, client)
if err != nil {
    log.Fatal(err)
}

for _, item := range items {
    fmt.Printf("User: %s (%s)\n", item.Name, item.Email)
}
```

### Advanced Queries

```go
query := user_table.NewQueryBuilder().
    WithUserId("user123").
    WithCreatedAtGreaterThan(1640995000).
    OrderByDesc()

items, err := query.Execute(ctx, client)
```

::: tip Pro Tip
The QueryBuilder automatically selects the most efficient DynamoDB index based on your query parameters!
:::

### Batch Operations

```go
users := []user_table.SchemaItem{
    {UserId: "user1", CreatedAt: 1640995200, Email: "user1@example.com", Name: "User 1", Age: 25},
    {UserId: "user2", CreatedAt: 1640995300, Email: "user2@example.com", Name: "User 2", Age: 30},
    {UserId: "user3", CreatedAt: 1640995400, Email: "user3@example.com", Name: "User 3", Age: 35},
}

batchItems, err := user_table.BatchPutItems(users)
if err != nil {
    log.Fatal(err)
}
```

## Terraform Integration

::: warning The Killer Feature
Use the same schema for both infrastructure and code - perfect sync guaranteed!
:::

### 1. Terraform Module

```hcl
module "user_table" {
  source = "terraform-aws-modules/dynamodb-table/aws"

  name             = jsondecode(file("./user-table.json")).table_name
  hash_key         = jsondecode(file("./user-table.json")).hash_key
  range_key        = jsondecode(file("./user-table.json")).range_key
  billing_mode     = "PAY_PER_REQUEST"

  attributes = jsondecode(file("./user-table.json")).attributes

  global_secondary_indexes = [
    for idx in jsondecode(file("./user-table.json")).secondary_indexes : {
      name            = idx.name
      hash_key        = idx.hash_key
      range_key       = try(idx.range_key, null)
      projection_type = idx.projection_type
    }
  ]

  tags = {
    Environment = "production"
    Project     = "my-app"
  }
}
```

### 2. Deploy Infrastructure

```bash
terraform init
terraform apply
```

### 3. Generate Application Code

```bash
./godyno gen --cfg user-table.json --dest ./generated
```

::: info Perfect Sync
Result: Your infrastructure and application code are always in perfect sync! 🎯
:::

## Advanced Schema Example

::: details Complex Schema with Composite Keys

```json
{
  "table_name": "blog-posts",
  "hash_key": "user_id",
  "range_key": "post_id",
  "attributes": [
    { "name": "user_id", "type": "S" },
    { "name": "post_id", "type": "S" },
    { "name": "created_at", "type": "N" },
    { "name": "is_published", "type": "N" },
    { "name": "category#is_published", "type": "S" },
    { "name": "tag#is_published", "type": "S" }
  ],
  "common_attributes": [
    { "name": "title", "type": "S" },
    { "name": "content", "type": "S" },
    { "name": "category", "type": "S" },
    { "name": "tag", "type": "S" },
    { "name": "views", "type": "N" }
  ],
  "secondary_indexes": [
    {
      "name": "PublishedByDateIndex",
      "hash_key": "is_published",
      "range_key": "created_at",
      "projection_type": "ALL"
    },
    {
      "name": "CategoryPublishedIndex",
      "hash_key": "category#is_published",
      "range_key": "created_at",
      "projection_type": "INCLUDE",
      "non_key_attributes": ["title", "views"]
    }
  ]
}
```

:::

```go
query := blog_posts.NewQueryBuilder().
    WithCategoryPublishedIndexHashKey("tech", 1).
    WithCreatedAtGreaterThan(1640995000).
    OrderByDesc().
    Limit(20)

items, err := query.Execute(ctx, client)
```

## Environment Variables

```bash
export GODYNO_CFG=./schemas/my-table.json
export GODYNO_DEST=./generated

./godyno gen
```

## Testing Generated Code

::: info Quality Assurance
GoDyno includes comprehensive test utilities. Generated code is tested automatically:
- ✅ Go formatting (gofmt, goimports, gofumpt)
- ✅ Compilation validation
- ✅ Static analysis (go vet)
- ✅ Template rendering correctness
:::

## Common Patterns

### User Management System
- Hash key: user_id
- Range key: created_at
- GSI: Email lookup, Status filtering

### E-commerce Orders
- Hash key: user_id
- Range key: order_id
- GSI: Order status, Date ranges

### Social Media Posts
- Hash key: user_id
- Range key: post_id
- GSI: Public posts, Category filtering

### Analytics Events
- Hash key: session_id
- Range key: timestamp
- GSI: Event type, User aggregation

## Next Steps

Ready to dive deeper? Check out these resources:

- **Schema Reference** - Complete schema format documentation  
- **Generated Code Reference** - Understanding generated code structure  
- **Advanced Examples** - Complex real-world schemas  
- **Terraform Integration Guide** - Deep dive into infrastructure sync  

::: tip Ready to Build?
Start with a simple schema and iterate. GoDyno grows with your complexity needs! 🚀
:::
