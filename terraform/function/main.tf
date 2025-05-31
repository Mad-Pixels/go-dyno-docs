resource "aws_cloudfront_function" "this" {
  name    = var.name
  comment = var.comment
  code    = file(var.filepath)

  runtime = "cloudfront-js-2.0"
  publish = true

}