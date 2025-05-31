resource "aws_cloudfront_function" "this" {
  name    = var.name
  runtime = "cloudfront-js-2.0"
  comment = var.comment
  publish = true
  code    = file(var.filepath)
}