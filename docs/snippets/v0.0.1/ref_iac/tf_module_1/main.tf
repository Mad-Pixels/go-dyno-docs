terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# --- >

module "schema_table" {
  source = "./modules/dynamodb"
  schema = jsondecode(file("${path.module}/schema.json"))
}

# --- >

output "table_name" {
  value = module.schema_table.table_name
}

output "table_arn" {
  value = module.schema_table.table_arn
}