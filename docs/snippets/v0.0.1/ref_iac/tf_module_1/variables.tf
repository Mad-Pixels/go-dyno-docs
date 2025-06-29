variable "schema" {
  type = object({
    table_name           = string
    hash_key             = string
    range_key            = optional(string)
    attributes           = list(object({
      name = string
      type = string
    }))
    common_attributes = optional(list(object({
      name = string
      type = string
    })), [])
    secondary_indexes = optional(list(object({
      name               = string
      type               = optional(string, "GSI")
      hash_key           = optional(string)
      range_key          = optional(string)
      projection_type    = string
      non_key_attributes = optional(list(string), [])
      read_capacity      = optional(number)
      write_capacity     = optional(number)
    })), [])
  })
  description = "DynamoDB table schema from go-dyno JSON"
}