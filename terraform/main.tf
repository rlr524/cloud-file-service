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

resource "aws_iam_role" "s3_access_role" {
  name               = "s3_access_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_policy" "s3_bucket_access_policy" {
  name        = "s3_bucket_access_policy"
  description = "Allow access to S3 buckets"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
        ]
        Resource = [
          aws_s3_bucket.incoming_files.arn,
          "${aws_s3_bucket.incoming_files.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_s3_policy" {
  role       = aws_iam_role.s3_access_role.name
  policy_arn = aws_iam_policy.s3_bucket_access_policy.arn

}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "../dist"
  output_path = "../lambda_function.zip"
}

resource "aws_s3_object" "lambda_code_upload" {
  bucket = aws_s3_bucket.cloud_file_service_lambda.bucket
  key    = "lambda_function.zip"
  source = data.archive_file.lambda_zip.output_path
  etag   = filebase64sha512(data.archive_file.lambda_zip.output_path)
}

# Create the Lambda function
resource "aws_lambda_function" "copy_s3_to_gcs" {
  function_name    = "copy_s3_to_gcs"
  role             = aws_iam_role.execution_role_for_lambda.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  s3_bucket        = aws_s3_object.lambda_code_upload.bucket
  s3_key           = aws_s3_object.lambda_code_upload.key

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

resource "aws_s3_bucket" "cloud_file_service_lambda" {
  bucket = "cloud-file-service-lambda"

  tags = {
    Environment = "dev"
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