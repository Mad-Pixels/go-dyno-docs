module "func_redirect" {
  source = "./modules/function"
  
  name        = "${var.project}-redirect"
  comment     = "${var.project} URL rewriting and language redirect"
  code_path   = "${path.root}/.tmp/go-dyno-docs.js"
}

module "s3" {
  source = "./s3"

  project = local.project
  domain  = local.domain

  bucket_name = var.bucket_name
  is_website  = true

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
  depends_on  = [ module.s3 ]
}