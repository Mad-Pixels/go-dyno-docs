module "func_redirect" {
  source = "./function"

  name     = "${local.project}-redirect"
  filepath = local.function
  comment  = local.description
}

module "s3" {
  source = "./s3"

  project = local.project
  domain  = local.domain

  bucket_name = var.bucket_name
  shared_tags = local.tags
}

module "cf" {
  source = "./cloudfront"

  bucket_id     = module.s3.id
  bucket_arn    = module.s3.arn
  bucket_domain = module.s3.domain

  project        = local.project
  description    = local.description
  domain_aliases = [local.domain]

  acm_certificate_arn = var.acm_crt

  req_func_list = [
    {
      function_arn = module.func_redirect.function_arn
    }
  ]

  shared_tags = local.tags
  depends_on  = [module.s3]
}