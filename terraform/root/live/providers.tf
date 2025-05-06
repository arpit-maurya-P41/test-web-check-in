variable "aws_region" {
  type    = string
  default = "us-east-1"
}

provider "aws" {
  region = var.aws_region
  assume_role {
    role_arn = "arn:aws:iam::878386473932:role/infrastructure"
  }
}
