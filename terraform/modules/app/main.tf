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
  project_name    = "p41-daily-status"
  app_name        = "${local.project_name}-web"
  image_parameter = "/images/p41-daily-status/web-app"
  kms_policy_name = "kms-default-readonly-${local.region}"
  kms_key_name    = "p41-default"
}

data "aws_ssm_parameter" "image_uri" {
  name            = local.image_parameter
  with_decryption = true
}

locals {
  image_uri = data.aws_ssm_parameter.image_uri.value
}

data "aws_iam_policy" "kms_default" {
  name = local.kms_policy_name
}

data "aws_kms_alias" "default" {
  name = "alias/${local.kms_key_name}"
}

data "aws_ssm_parameter" "auth_secret" {
  name            = "/${local.project_name}/auth-secret"
  with_decryption = true
}

data "aws_secretsmanager_secret" "db_credentials" {
  name = "/${local.project_name}/db"
}

data "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = data.aws_secretsmanager_secret.db_credentials.id
}

locals {
  db_credentials       = jsondecode(data.aws_secretsmanager_secret_version.db_credentials.secret_string)
  db_connection_string = "postgresql://${local.db_credentials.DB_USER}:${local.db_credentials.DB_PASSWORD}@${local.db_credentials.DB_HOST}:${local.db_credentials.DB_PORT}/${local.db_credentials.DB_NAME}"
}

module "lambda_base" {
  source = "../lambda-base"
  name   = local.app_name
}

resource "aws_iam_role_policy_attachment" "kms_default" {
  role       = module.lambda_base.iam_role.name
  policy_arn = data.aws_iam_policy.kms_default.arn
}

module "lambda" {
  depends_on = [aws_iam_role_policy_attachment.kms_default]

  source    = "../lambda"
  name      = local.app_name
  image_uri = local.image_uri

  iam_role_arn   = module.lambda_base.iam_role.arn
  log_group_name = module.lambda_base.log_group.name

  kms_key_arn = data.aws_kms_alias.default.target_key_arn

  lambda_env = {
    DATABASE_URL = local.db_connection_string
    AUTH_SECRET  = data.aws_ssm_parameter.auth_secret.value
  }
}

resource "aws_lambda_function_url" "this" {
  function_name      = module.lambda.function.function_name
  qualifier          = module.lambda.alias.name
  authorization_type = "NONE"
}
