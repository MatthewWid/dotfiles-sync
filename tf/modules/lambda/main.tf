# Role for Lambda
resource "aws_iam_role" "lambda" {
  name               = "dotfiles_sync_lambda"
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
  name   = "dotfiles_sync_logging"
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

# Allow Lambda to read and write Systems Manager Parameter Store parameters
data "aws_iam_policy_document" "parameters" {
  statement {
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
      "ssm:PutParameter"
    ]

    resources = [
      var.parameter_store_dropbox_cursor_arn
    ]
  }
}

# Policy for parameters
resource "aws_iam_policy" "parameters" {
  name   = "dotfiles_sync_parameters"
  policy = data.aws_iam_policy_document.parameters.json
}

# Attach parameter policy to Lambda role
resource "aws_iam_role_policy_attachment" "parameters" {
  policy_arn = aws_iam_policy.parameters.arn
  role       = aws_iam_role.lambda.name
}

# Zip source code
data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${path.root}/../dist/main.js"
  output_path = "lambda.zip"
}

# Lambda function definition
resource "aws_lambda_function" "sync" {
  filename         = data.archive_file.lambda.output_path
  function_name    = "dotfiles_sync_sync"
  role             = aws_iam_role.lambda.arn
  handler          = "main.handler"
  runtime          = "nodejs22.x"
  timeout          = 30
  source_code_hash = data.archive_file.lambda.output_base64sha256
  # https://github.com/lambci/git-lambda-layer
  layers = ["arn:aws:lambda:ap-southeast-2:553035198032:layer:git-lambda2:8"]
  environment {
    variables = {
      DROPBOX_APP_KEY                     = var.dropbox_app_key
      DROPBOX_APP_SECRET                  = var.dropbox_app_secret
      DROPBOX_REFRESH_TOKEN               = var.dropbox_refresh_token
      DROPBOX_DOTFILES_PATH               = var.dropbox_dotfiles_path
      GIT_REPO_LOCAL_PATH                 = var.git_repo_local_path
      GIT_REPO_REMOTE_URL                 = var.git_repo_remote_url
      GIT_REPO_CONFIG_EMAIL               = var.git_repo_config_email
      GIT_REPO_CONFIG_NAME                = var.git_repo_config_name
      PARAMETER_STORE_DROPBOX_CURSOR_NAME = var.parameter_store_dropbox_cursor_name
    }
  }
}

# Call URL to invoke Lambda
resource "aws_lambda_function_url" "sync_url" {
  function_name      = aws_lambda_function.sync.function_name
  authorization_type = "NONE"
}
