resource "aws_ssm_parameter" "dropbox_cursor" {
  name = "dotfiles_sync_dropbox_cursor"
  type = "String"
	value = "null"
}
