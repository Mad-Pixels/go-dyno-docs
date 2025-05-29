module "s3" {
  source = "../../modules/s3"

  project = local.project
  domain  = local.domain

  bucket_name = var.bucket_name
  is_website  = true

  shared_tags = local.tags
}

module "cf" {
  source = "../../modules/cloudfront"

  bucket_id     = module.s3.id
  bucket_arn    = module.s3.arn
  bucket_domain = module.s3.domain

  project        = local.project
  description    = local.description
  domain_aliases = [local.domain]

  acm_certificate_arn = var.acm_crt  

  shared_tags = local.tags
  depends_on  = [ module.s3 ]
}