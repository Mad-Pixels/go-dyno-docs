locals {
  project     = "go-dyno-docs"
  domain      = "go-dyno.madpixels.io"
  description = "GoDyno docs portal"
  provisioner = "main"

  tags = {
    "Project"     = local.project,
    "Provisioner" = local.provisioner,
    "Github"      = "https://github.com/Mad-Pixels/go-dyno-docs",
  }
}