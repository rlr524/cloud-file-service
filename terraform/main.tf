provider "aws" {
  region = "us-west-2"
}

# Create an AWS bucket
resource "aws_s3_bucket" "incoming_files" {
  bucket = "todo-incoming-files"

  tags = {
    Environment = "dev"
  }
}