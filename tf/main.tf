provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

module "parameter_store" {
  source = "./modules/parameter_store"
}

module "lambda" {
  source                              = "./modules/lambda"
  parameter_store_dropbox_cursor_name = module.parameter_store.dropbox_cursor_name
  parameter_store_dropbox_cursor_arn  = module.parameter_store.dropbox_cursor_arn
}

# module "scheduler" {
# source = "./modules/scheduler"
# lambda_arn = module.lambda.lambda_arn
# }
