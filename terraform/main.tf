provider "aws" {
  region = "us-west-2"
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "execution_role_for_lambda" {
  name               = "lambda_execution_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "archive_file" "lambda_archive_file" {
  type        = "zip"
  source_file = "../dist/index.js"
  output_path = "${path.root}/function.zip"
}

# Create the Lambda function
resource "aws_lambda_function" "copy_s3_to_gcs" {
  filename         = data.archive_file.lambda_archive_file.output_path
  function_name    = "copy_s3_to_gcs"
  role             = aws_iam_role.execution_role_for_lambda.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_archive_file.output_base64sha256

  runtime = "nodejs22.x"

  environment {
    variables = {
      ENVIRONMEMT = "dev"
    }
  }

  tags = {
    Environment = "dev"
    Application = "copy_s3_file_to_gcs_service"
  }
}

# Create an AWS bucket
resource "aws_s3_bucket" "incoming_files" {
  bucket = "emiya-todo-incoming-files"

  tags = {
    Environment = "dev"
  }
}

# Create an AWS bucket for archived files with a 30 day deletion lifecycle rule
resource "aws_s3_bucket" "archived_files" {
  bucket = "emiya-todo-archived-files"

  tags = {
    Environment = "dev"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "archived_files_delete_30_days" {
  bucket     = aws_s3_bucket.archived_files.id
  depends_on = [aws_s3_bucket.archived_files]

  rule {
    id     = "delete-after-30-days"
    status = "Enabled"

    filter {
      prefix = ""
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    expiration {
      days = 90
    }
  }
}