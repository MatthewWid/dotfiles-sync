terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-2"
}

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
  source_file = "dist/main.js"
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

# Output invocation URL
output "lambda_url" {
  value = aws_lambda_function_url.sync_url.function_url
}

# EventBridge Scheduler Schedule definition
resource "aws_scheduler_schedule" "invoke_lambda" {
  name = "invoke_lambda"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression = "rate(2 minute)"

  target {
    arn      = aws_lambda_function.sync.arn
    role_arn = aws_iam_role.scheduler_invoke_lambda.arn
  }
}

# Role for Scheduler
resource "aws_iam_role" "scheduler_invoke_lambda" {
  name               = "schedule_invoke_lambda"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume_role.json
}

# Allow Scheduler to assume role
data "aws_iam_policy_document" "scheduler_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# Allow Scheduler to invoke Lambda
data "aws_iam_policy_document" "invoke" {
	statement {
		effect = "Allow"

		actions = [
			"lambda:InvokeFunction"
		]

		resources = [
			aws_lambda_function.sync.arn
		]
	}
}

# Policy for invoking
resource "aws_iam_policy" "invoke" {
	name   = "invoke"
	policy = data.aws_iam_policy_document.invoke.json
}

# Attach invoke policy to Scheduler role
resource "aws_iam_role_policy_attachment" "invoke" {
	policy_arn = aws_iam_policy.invoke.arn
	role       = aws_iam_role.scheduler_invoke_lambda.name
}
