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