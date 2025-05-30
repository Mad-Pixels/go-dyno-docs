output "domain" {
  value = aws_cloudfront_distribution.this.domain_name
}

output "zone_id" {
  value = aws_cloudfront_distribution.this.hosted_zone_id
}

output "id" {
  value = aws_cloudfront_distribution.this.id
}