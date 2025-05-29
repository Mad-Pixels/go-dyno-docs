resource "aws_s3_bucket" "this" {
  bucket        = "${var.project}-${var.bucket_name}"
  force_destroy = var.force_destroy

  tags = merge(
    var.shared_tags,
    {
      "TF" = "true",
    }
  )
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_website_configuration" "this" {
  count  = var.is_website ? 1 : 0
  bucket = aws_s3_bucket.this.id

  index_document {
    suffix = var.index_document
  }
  error_document {
    key = var.error_document
  }
}

resource "aws_s3_bucket_cors_configuration" "this" {
  bucket = aws_s3_bucket.this.id
  
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["https://${var.domain}"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "this" {
  count  = var.rule != null ? 1 : 0
  bucket = aws_s3_bucket.this.id

  rule {
    id     = var.rule.id
    status = var.rule.status

    filter {
      prefix = var.rule.filter.prefix
    }

    dynamic "transition" {
      for_each = var.rule.transition != null ? [var.rule.transition] : []
      content {
        days          = transition.value.days
        storage_class = transition.value.storage_class
      }
    }

    dynamic "expiration" {
      for_each = var.rule.expiration != null ? [var.rule.expiration] : []
      content {
        days = expiration.value.days
      }
    }
  }
}