# Lambda ARN
output "lambda_arn" {
  value = aws_lambda_function.sync.arn
}
