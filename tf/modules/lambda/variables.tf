variable "dropbox_app_key" {
  type = string
}

variable "dropbox_app_secret" {
  type = string
}

variable "dropbox_refresh_token" {
  type = string
}

variable "dropbox_dotfiles_path" {
  type    = string
  default = "/dotfiles"
}

variable "git_repo_local_path" {
  type    = string
  default = "/tmp/dotfiles"
}

variable "git_repo_remote_url" {
  type = string
}

variable "git_repo_config_name" {
  type    = string
  default = "Matthew W."
}

variable "git_repo_config_email" {
  type    = string
  default = "matthew.widdi@gmail.com"
}

variable "parameter_store_dropbox_cursor_name" {
  type = string
}

variable "parameter_store_dropbox_cursor_arn" {
  type = string
}
