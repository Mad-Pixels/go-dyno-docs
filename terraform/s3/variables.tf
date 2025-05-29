variable "project" {
  description = "Project name"
  type        = string
  sensitive   = true
}

variable "bucket_name" {
  description = "Name of the S3 bucket."
  type        = string
  sensitive   = true
}

variable "force_destroy" {
  description = "Allows Terraform to delete the bucket when removing the resource of set true."
  type        = bool
  default     = true
  sensitive   = true
}

variable "is_website" {
  description = "Specifies if the S3 bucket will host a static website when set to true."
  type        = bool
  default     = false
  sensitive   = true
}

variable "enable_versioning" {
  description = "Enables versioning for the S3 bucket if set true."
  type        = bool
  default     = false
  sensitive   = true
}

variable "index_document" {
  description = "Name of the index document for the S3 static web site."
  type        = string
  default     = "index.html"
  sensitive   =  true
}

variable "error_document" {
  description = "Name of the error document for the S3 static web site."
  type        = string
  default     = "error.html"
  sensitive   = true
}

variable "shared_tags" {
  description = "Tags to add to all resources"
  default     = {}
  sensitive   =  true
}

variable "domain" {
  description = "Domain for CORS"
  type        = string
  sensitive   = true
}

variable "rule" {
  description = "Optional lifecycle rule configuration"
  type = object({
    id     = string
    status = string
    filter = object({
      prefix = string
    })
    transition = optional(object({
      days          = number
      storage_class = string
    }))
    expiration = optional(object({
      days = number
    }))
  })
  default = null
  sensitive = true
}