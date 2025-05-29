output "domain" {
  value = aws_cloudfront_distribution.this.domain_name
  sensitive = true
}

output "zone_id" {
  value = aws_cloudfront_distribution.this.hosted_zone_id
  sensitive = true
}

output "id" {
  value = aws_cloudfront_distribution.this.id 
  sensitive = false
}