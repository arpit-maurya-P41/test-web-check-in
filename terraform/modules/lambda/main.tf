locals {
  has_filesystem       = var.efs_access_point_arn != null && var.efs_access_point_arn != "" && var.efs_local_mount_path != null && var.efs_local_mount_path != ""
  efs_local_mount_path = var.efs_local_mount_path == "" ? null : var.efs_local_mount_path
}

resource "aws_lambda_function" "this" {
  package_type  = "Image"
  function_name = var.name
  role          = var.iam_role_arn
  description   = var.description
  image_uri     = var.image_uri
  timeout       = var.timeout_seconds
  memory_size   = var.memory_size_mb

  architectures = [var.architecture]

  kms_key_arn = var.kms_key_arn

  reserved_concurrent_executions = var.reserved_concurrent_executions

  publish = true

  dynamic "file_system_config" {
    for_each = local.has_filesystem ? [1] : []
    content {
      arn              = var.efs_access_point_arn
      local_mount_path = local.efs_local_mount_path
    }
  }

  vpc_config {
    security_group_ids = var.security_group_ids
    subnet_ids         = var.subnet_ids
  }

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
