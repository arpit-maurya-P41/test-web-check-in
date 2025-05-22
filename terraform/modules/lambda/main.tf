data "aws_ssm_parameter" "image_uri" {
  name            = var.image_parameter
  with_decryption = true
}

locals {
  image_uri = data.aws_ssm_parameter.image_uri.value
}

resource "aws_lambda_function" "this" {
  package_type  = "Image"
  function_name = var.name
  role          = var.iam_role_arn
  description   = var.description
  image_uri     = local.image_uri
  timeout       = var.timeout_seconds
  memory_size   = var.memory_size_mb

  architectures = [var.architecture]

  kms_key_arn = var.kms_key_arn

  publish = true

  tracing_config {
    mode = "Active"
  }

  logging_config {
    log_format = "JSON"
    log_group  = var.log_group_name
  }

  environment {
    variables = var.lambda_env
  }
}

resource "aws_lambda_alias" "this" {
  name             = var.alias
  description      = var.alias_description
  function_name    = aws_lambda_function.this.function_name
  function_version = aws_lambda_function.this.version
}
