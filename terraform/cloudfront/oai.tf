resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.bucket_domain}"
}

data "aws_iam_policy_document" "cloudfront_s3_policy" {
  statement {
    principals {
      identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]
      type        = "AWS"
    }
    actions = ["s3:GetObject"]
    resources = [
      "${var.bucket_arn}/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  policy = data.aws_iam_policy_document.cloudfront_s3_policy.json
  bucket = var.bucket_id
}