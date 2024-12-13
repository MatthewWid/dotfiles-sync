# Role for Lambda
resource "aws_iam_role" "lambda" {
  name               = "lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

# Allow Lambda to assume role
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# Allow Lambda to log to CloudWatch under its own name
data "aws_iam_policy_document" "logging" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      aws_cloudwatch_log_group.lambda.arn,
      "${aws_cloudwatch_log_group.lambda.arn}:*"
    ]
  }
}

# Policy for logging
resource "aws_iam_policy" "logging" {
  name   = "logging"
  policy = data.aws_iam_policy_document.logging.json
}

# Attach logging policy to Lambda role
resource "aws_iam_role_policy_attachment" "logging" {
  policy_arn = aws_iam_policy.logging.arn
  role       = aws_iam_role.lambda.name
}

# Log group for Lambda output
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.sync.function_name}"
  retention_in_days = 14
}

# Zip source code
data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${path.root}/../dist/main.js"
  output_path = "lambda.zip"
}

# Lambda function definition
resource "aws_lambda_function" "sync" {
  filename      = data.archive_file.lambda.output_path
  function_name = "sync"
  role          = aws_iam_role.lambda.arn
  handler       = "main.handler"
  runtime       = "nodejs22.x"
}

# Call URL to invoke Lambda
resource "aws_lambda_function_url" "sync_url" {
  function_name      = aws_lambda_function.sync.function_name
  authorization_type = "NONE"
}
