data "aws_partition" "current" {}
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  partition  = data.aws_partition.current.partition
  region     = data.aws_region.current.name
  account_id = data.aws_caller_identity.current.account_id
  dns_suffix = data.aws_partition.current.dns_suffix
}

locals {
  name            = "p41-daily-status-web"
  image_parameter = "/images/p41-daily-status/web-app"
  kms_policy_name = "kms-default-readonly-${local.region}"
  kms_key_name    = "p41-default"
}

data "aws_iam_policy" "kms_default" {
  name = local.kms_policy_name
}

data "aws_kms_alias" "default" {
  name = "alias/${local.kms_key_name}"
}

data "aws_ssm_parameter" "database_url" {
  name            = "/${local.name}/database_url"
  with_decryption = true
}

data "aws_ssm_parameter" "auth_secret" {
  name            = "/${local.name}/auth_secret"
  with_decryption = true
}

module "lambda_base" {
  source = "../lambda-base"
  name   = local.name
}

resource "aws_iam_role_policy_attachment" "kms_default" {
  role       = module.lambda_base.iam_role.name
  policy_arn = data.aws_iam_policy.kms_default.arn
}

module "lambda" {
  depends_on = [aws_iam_role_policy_attachment.kms_default]

  source          = "../lambda"
  name            = local.name
  image_parameter = local.image_parameter

  iam_role_arn   = module.lambda_base.iam_role.arn
  log_group_name = module.lambda_base.log_group.name

  kms_key_arn = data.aws_kms_alias.default.target_key_arn

  lambda_env = {
    DATABASE_URL = data.aws_ssm_parameter.database_url.value
    AUTH_SECRET  = data.aws_ssm_parameter.auth_secret.value
  }
}

resource "aws_lambda_function_url" "this" {
  function_name      = module.lambda.function.function_name
  qualifier          = module.lambda.alias.name
  authorization_type = "NONE"
}
