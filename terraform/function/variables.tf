
variable "name" {
  description = "Name of the CloudFront function"
  type        = string
}

variable "comment" {
  description = "Comment for the CloudFront function"
  type        = string
  default     = ""
}

variable "filepath" {
  description = "Path to the JavaScript file"
  type        = string
}
