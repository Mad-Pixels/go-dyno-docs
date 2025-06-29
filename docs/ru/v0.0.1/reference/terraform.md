# Terraform
**Главная фишка go-dyno**: JSON схема напрямую совместима с Terraform!

## Пример TF-модуля для описания DynamoDB таблицы
### Структура
::: code-group
<<< @/snippets/tf_ref/struct{bash}
<<< @/snippets/tf_ref/main{hcl}
<<< @/snippets/tf_ref/variables{hcl}
<<< @/snippets/tf_ref/dynamo{hcl}
<<< @/snippets/tf_ref/outputs{hcl}
:::

### Применение
```bash
terraform init
terraform plan
terraform apply
```

### AWS CLI
```bash
aws dynamodb create-table \
  --table-name user_profiles \
  --attribute-definitions \
    AttributeName=user_id,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=user_id,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

### LocalStack для тестов
```bash
docker run -p 4566:4566 localstack/localstack

aws dynamodb create-table \
  --endpoint-url http://localhost:4566 \
  --table-name user_profiles \
  --attribute-definitions \
    AttributeName=user_id,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=user_id,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```