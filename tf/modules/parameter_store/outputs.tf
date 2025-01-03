output "dropbox_cursor_name" {
  value = aws_ssm_parameter.dropbox_cursor.name
}

output "dropbox_cursor_arn" {
  value = aws_ssm_parameter.dropbox_cursor.arn
}
