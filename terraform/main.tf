provider "aws" {
  region = "us-west-2"
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
  bucket = aws_s3_bucket.archived_files

  rule {
    id     = "delete-after-30-days"
    status = "Enabled"

    transition {
      days          = 10
      storage_class = "STANDARD_IA"
    }

    expiration {
      days = 30
    }
  }
}

# Create an SQS queue to notify GCS of a new file
resource "aws_sqs_queue" "file_transfer_to_gcs_queue" {
  name                      = "emiya-todo-aws-to-gcs-file-queue"
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10

  tags = {
    Environment = "dev"
  }

  policy = {
    "Version" : "2012-10-17",
    "Id" : "example-ID",
    "Statement" : [
      {
        "Sid" : "example-statement-ID",
        "Effect" : "Allow",
        "Principal" : {
          "Service" : "s3.amazonaws.com"
        },
        "Action" : "SQS:SendMessage",
        "Resource" : "RESOURCE",
        "Condition" : {
          "StringEquals" : {
            "aws:SourceAccount" : "AWS"
          },
          "ArnLike" : {
            "aws:SourceArn" : "S3_BUCKET_ARN"
          }
        }
      }
    ]
  }
}