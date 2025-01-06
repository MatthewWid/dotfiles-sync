# EventBridge Scheduler Schedule definition
resource "aws_scheduler_schedule" "invoke_lambda" {
  name = "dotfiles_sync_invoke_lambda"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression = "rate(${var.lambda_invoke_rate})"

  target {
    arn      = var.lambda_arn
    role_arn = aws_iam_role.scheduler_invoke_lambda.arn
  }
}

# Role for Scheduler
resource "aws_iam_role" "scheduler_invoke_lambda" {
  name               = "dotfiles_sync_schedule_invoke_lambda"
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
			var.lambda_arn
		]
	}
}

# Policy for invoking
resource "aws_iam_policy" "invoke" {
	name   = "dotfiles_sync_invoke"
	policy = data.aws_iam_policy_document.invoke.json
}

# Attach invoke policy to Scheduler role
resource "aws_iam_role_policy_attachment" "invoke" {
	policy_arn = aws_iam_policy.invoke.arn
	role       = aws_iam_role.scheduler_invoke_lambda.name
}
