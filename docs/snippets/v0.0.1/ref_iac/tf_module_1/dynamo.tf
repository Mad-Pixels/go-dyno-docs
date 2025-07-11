locals {
  key_attributes = var.schema.attributes
      
  gsi_indexes = [
    for idx in var.schema.secondary_indexes : idx
    if try(idx.type, "GSI") == "GSI"
  ]

  lsi_indexes = [
    for idx in var.schema.secondary_indexes : idx
    if try(idx.type, "LSI") == "LSI"
  ]
}

# --- >

resource "aws_dynamodb_table" "this" {
  name           = var.schema.table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = var.schema.hash_key
  range_key      = var.schema.range_key

  dynamic "attribute" {
    for_each = local.key_attributes
    content {
      name = attribute.value.name
      type = attribute.value.type
    }
  }

  dynamic "global_secondary_index" {
    for_each = local.gsi_indexes
    content {
      name               = global_secondary_index.value.name
      hash_key           = global_secondary_index.value.hash_key
      range_key          = try(global_secondary_index.value.range_key, null)
      projection_type    = global_secondary_index.value.projection_type
      non_key_attributes = global_secondary_index.value.projection_type == "INCLUDE" ? global_secondary_index.value.non_key_attributes : null
    }
  }

  dynamic "local_secondary_index" {
    for_each = local.lsi_indexes
    content {
      name               = local_secondary_index.value.name
      range_key          = local_secondary_index.value.range_key
      projection_type    = local_secondary_index.value.projection_type
      non_key_attributes = local_secondary_index.value.projection_type == "INCLUDE" ? local_secondary_index.value.non_key_attributes : null
    }
  }

  tags = {
    Name      = var.schema.table_name
    ManagedBy = "go-dyno"
  }
}