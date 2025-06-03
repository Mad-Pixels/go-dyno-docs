# Quick Start

This guide will help you get started with GoDyno. You'll learn how to create a DynamoDB table schema, generate Go code, and start using it in your project.  
If you haven't installed GoDyno yet, head to the [installation section](https://go-dyno.madpixels.io/en/v0.0.1-alpha/guide/installation).

## Creating Your First Schema

Create a file called `user-posts.json` describing your DynamoDB table:
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

This schema defines a DynamoDB table for user posts with:
- Keys: `user_id` (hash) and `created_at` (range)
- Indexing attribute: `status` (used in the GSI)
- Regular data fields: `title`, `content`, `views`
- A secondary index for querying by status

> **Note:**  
> _The `attributes` section includes fields used as primary keys and in GSI indexes._  
> _The `common_attributes` section contains regular data fields that are not indexed but are included in the generated Go struct for completeness._

## Generating Go Code

To generate type-safe Go code, run:
```bash
godyno gen --cfg user-posts.json --dest ./generated
```

This command will generate `./generated/user_posts/user_posts.go` with a full set of types and methods.

## Using the Generated Code

Once generated, you can start using the code in your application:
```go
package main

import (
    "context"
    "log"
       
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/dynamodb"
       
    userposts "your-project/generated/user_posts"
)

func main() {
    // Configure AWS client
    cfg, err := config.LoadDefaultConfig(context.TODO())
    if err != nil {
        log.Fatal(err)
    }
    client := dynamodb.NewFromConfig(cfg)

    // Create a new post
    post := userposts.SchemaItem{
        UserId:    "user123",
        CreatedAt: 1640995200,
        Status:    "published",
        Title:     "Мой первый пост",
        Content:   "Содержание поста...",
        Views:     0,
    }

    // Save to DynamoDB
    item, err := userposts.PutItem(post)
    if err != nil {
        log.Fatal(err)
    }

    _, err = client.PutItem(ctx, &dynamodb.PutItemInput{
        TableName: aws.String(userposts.TableName),
        Item:      item,
    })
    if err != nil {
        log.Fatal(err)
    }

    // Type-safe query using QueryBuilder
    posts, err := userposts.NewQueryBuilder().
        WithUserId("user123").
        WithStatus("published").
        WithCreatedAtGreaterThan(1640990000).
        OrderByDesc().
        Limit(10).
        Execute(ctx, client)

    if err != nil {
        log.Fatal(err)
    }

    for _, post := range posts {
        log.Printf("Пост: %s (просмотры: %d)", post.Title, post.Views)
    }
}
```

## Key Features
### Safe Constants

Use generated constants instead of string literals:
```go
tableName := userposts.TableName        // Instead of "user-posts"
keyName   := userposts.ColumnUserId     // Instead of "user_id"
indexName := userposts.IndexStatusIndex // Instead of "StatusIndex"
```

### Building Queries
The QueryBuilder provides a fluent API for constructing queries:
```go
query := userposts.NewQueryBuilder().
    WithUserId("user123").                   // Partition key
    WithCreatedAtBetween(start, end).        // Date range
    WithStatus("published").                 // Filter by status
    WithViewsGreaterThan(100).               // Popular posts
    OrderByDesc().                           // Sort descending
    Limit(20)                                // Limit results

posts, err := query.Execute(ctx, dynamoClient)
```

## Terraform Integration
One of GoDyno's core features is using the same schema for both Terraform and code generation:
```tf
# main.tf
module "user_posts_table" {
    source = "./terraform-modules/dynamodb"

    # Используем ту же схему JSON для инфраструктуры
    schema_file = file("./user-posts.json")
}

# Apply infrastructure
terraform apply

# Generate Go code from the same schema
godyno gen --cfg user-posts.json --dest ./generated
```

#### This ensures your infrastructure and application code stay perfectly in sync!