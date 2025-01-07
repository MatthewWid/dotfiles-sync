variable "aws_region" {
  type    = string
  default = "ap-southeast-2"
}

variable "aws_profile" {
  type    = string
  default = "personal-iamadmin-development"
}

variable "dropbox_app_key" {
  type      = string
  sensitive = true
}

variable "dropbox_app_secret" {
  type      = string
  sensitive = true
}

variable "dropbox_refresh_token" {
  type      = string
  sensitive = true
}

variable "git_repo_remote_url" {
  type      = string
  sensitive = true
}

variable "lambda_invoke_rate" {
	type    = string
	default = "1 day"
}
