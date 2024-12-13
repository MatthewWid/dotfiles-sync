# Invocation URL
output "lambda_url" {
  value = aws_lambda_function_url.sync_url.function_url
}

# Lambda ARN
output "lambda_arn" {
  value = aws_lambda_function.sync.arn
}
