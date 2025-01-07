provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

module "parameter_store" {
  source = "./modules/parameter_store"
}

module "lambda" {
  source                              = "./modules/lambda"
  dropbox_app_key                     = var.dropbox_app_key
  dropbox_app_secret                  = var.dropbox_app_secret
  dropbox_refresh_token               = var.dropbox_refresh_token
  git_repo_remote_url                 = var.git_repo_remote_url
  parameter_store_dropbox_cursor_name = module.parameter_store.dropbox_cursor_name
  parameter_store_dropbox_cursor_arn  = module.parameter_store.dropbox_cursor_arn
}

module "scheduler" {
  source             = "./modules/scheduler"
  lambda_arn         = module.lambda.lambda_arn
  lambda_invoke_rate = var.lambda_invoke_rate
}
