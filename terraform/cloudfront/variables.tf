variable "project" {
  description = "Project name"
  type        = string
}

variable "description" {
  description = "CloudFront description."
  type        = string
}

variable "bucket_arn" {
  description = "CloudFront distribution S3 bucket ARN."
  type        = string
}

variable "bucket_id" {
  description = "CloudFront distribution S3 bucket ID."
  type        = string
}

variable "bucket_domain" {
  description = "CloudFront distribution S3 bucket domain."
  type        = string
}

variable "acm_certificate_arn" {
  description = "CloudFront certificate arn."
  type        = string
}

variable "domain_aliases" {
  description = "CloudFront domain aliases."
  type        = list(string)
  default     = []
}

variable "index_document" {
  description = "Name of the index document for the S3 static site."
  type        = string
  default     = "index.html"
}

variable "error_responses" {
  description = "Error responses configuration"
  type        = map(object({
    response_code      = number
    response_page_path = string
  }))
  default     = {}
}

variable "shared_tags" {
  description = "Shared labels to add to all resources."
  type        = map(string)
  default     = {}
}

variable "query_string" {
  description = "Forward query strings to the origin."
  type        = bool
  default     = false
}

variable "query_string_cache_keys" {
  description = "List of queries params for cache."
  type        = list(string)
  default     = []
}

variable "req_func_list" {
  description = "List of viewer-request functions"
  type = list(object({
    function_arn = string
  }))
  default = []
}

variable "resp_func_list" {
  description = "List of viewer-response functions"
  type = list(object({
    function_arn = string
  }))
  default = []
}