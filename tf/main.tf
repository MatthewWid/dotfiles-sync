provider "aws" {
  region = var.aws_region
	profile = var.aws_profile
}

module "lambda" {
	source = "./modules/lambda"
}

module "scheduler" {
	source = "./modules/scheduler"
	lambda_arn = module.lambda.lambda_arn
}
