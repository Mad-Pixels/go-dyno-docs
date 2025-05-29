resource "aws_cloudfront_distribution" "this" {
  origin {
    domain_name = var.bucket_domain
    origin_id   = "S3-${var.bucket_id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  dynamic "custom_error_response" {
    for_each = local.error_responses_list

    content {
      error_caching_min_ttl = 30
      error_code            = custom_error_response.value.error_code
      response_code         = custom_error_response.value.response_code
      response_page_path    = custom_error_response.value.response_page_path
    }
  }

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.bucket_id}"

    dynamic "function_association" {
      for_each = var.req_func_list

      content {
        event_type   = "viewer-request"
        function_arn = function_association.value.function_arn
      }
    }

    dynamic "function_association" {
      for_each = var.resp_func_list

      content {
        event_type   = "viewer-response"
        function_arn = function_association.value.function_arn
      }
    }

    forwarded_values {
      query_string            = length(var.query_string_cache_keys) > 0 ? true : var.query_string
      query_string_cache_keys = var.query_string_cache_keys

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(
    var.shared_tags,
    {
      "TF" = "true",
    }
  )

  comment             = var.description
  aliases             = var.domain_aliases
  default_root_object = var.index_document
  price_class         = "PriceClass_All"
  enabled             = true
}

resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name    = "${var.project}-security-headers"
  comment = "Security headers policy"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      override                   = true
      include_subdomains         = true
      preload                    = true
    }
    
    content_type_options {
      override = true
    }
    
    frame_options {
      override     = true
      frame_option = "DENY"
    }
    
    referrer_policy {
      override        = true
      referrer_policy = "same-origin"
    }
    
    xss_protection {
      override   = true
      mode_block = true
      protection = true
    }
  }
}