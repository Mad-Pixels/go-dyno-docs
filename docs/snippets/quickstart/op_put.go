package main

import (
	"context"

	//"{{ path_to_generated_code }}/generated/userprofiles"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func main() {
	//...

	client := dynamodb.NewFromConfig(cfg)

	item, _ := userprofiles.ItemInput(
		userprofiles.SchemaItem{
			UserId:    "user123",
			Timestamp: 1640995200,
			Email:     "user@example.com",
			Age:       25,
			IsActive:  true,
		},
	)

	_ = client.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String(userprofiles.TableName),
		Item:      item,
	})

	// ...
}
