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
  project_name           = "p41-daily-status"
  app_name               = "${local.project_name}-web"
  image_parameter        = "/images/p41-daily-status/web-app"
  kms_policy_name        = "kms-default-readonly-${local.region}"
  kms_key_name           = "p41-default"
  prv_subnet_name_prefix = "main-private-"
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

data "aws_ssm_parameter" "db_security_group_id" {
  name            = "/${local.project_name}/infra/db/security-group-id"
  with_decryption = true
}

module "prv_subnets" {
  source             = "../../modules/subnet-info"
  subnet_name_prefix = local.prv_subnet_name_prefix
}

locals {
  db_credentials       = jsondecode(data.aws_secretsmanager_secret_version.db_credentials.secret_string)
  db_connection_string = "postgresql://${local.db_credentials.username}:${local.db_credentials.password}@${local.db_credentials.host}:${local.db_credentials.port}/${local.db_credentials.dbname}"
  db_security_group_id = data.aws_ssm_parameter.db_security_group_id.value
}

module "lambda_base" {
  source                  = "../lambda-base"
  name                    = local.app_name
  vpc_permissions_enabled = true
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

  security_group_ids = [aws_security_group.this.id]
  subnet_ids         = module.prv_subnets.subnet_ids

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
