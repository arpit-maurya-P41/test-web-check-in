data "aws_partition" "current" {}
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

locals {
  partition  = data.aws_partition.current.partition
  region     = data.aws_region.current.name
  account_id = data.aws_caller_identity.current.account_id
  dns_suffix = data.aws_partition.current.dns_suffix
}

locals {
  log_group_name = "${var.log_group_prefix}${var.name}"
  log_group_arn  = "arn:${local.partition}:logs:${local.region}:${local.account_id}:log-group:${local.log_group_name}:*"

  managed_policy_arn_prefix = "arn:${local.partition}:iam::aws:policy"
}

data "aws_iam_policy_document" "service_trust" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["${var.service}.${local.dns_suffix}"]
    }
  }
}

resource "aws_iam_role" "this" {
  name                  = var.name
  assume_role_policy    = data.aws_iam_policy_document.service_trust.json
  force_detach_policies = true
  tags                  = var.tags
}

data "aws_iam_policy_document" "log_permissions" {
  statement {
    sid = "logs"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${local.log_group_arn}",
      "${local.log_group_arn}:*",
      "${local.log_group_arn}:*:*"
    ]
  }
}

data "aws_iam_policy_document" "vpc_permissions" {
  count = var.vpc_permissions_enabled ? 1 : 0
  statement {
    sid = "vpc"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DescribeSubnets",
      "ec2:DeleteNetworkInterface",
      "ec2:AssignPrivateIpAddresses",
      "ec2:UnassignPrivateIpAddresses"
    ]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "service_permissions" {
  source_policy_documents = compact([
    data.aws_iam_policy_document.log_permissions.json,
    try(data.aws_iam_policy_document.vpc_permissions[0].json, ""),
  ])
}

resource "aws_iam_role_policy" "service_permissions" {
  name   = "service-permissions"
  role   = aws_iam_role.this.id
  policy = data.aws_iam_policy_document.service_permissions.json
}

resource "aws_cloudwatch_log_group" "this" {
  name              = local.log_group_name
  retention_in_days = var.log_retention_in_days
  tags              = var.tags
}

locals {
  default_policy_names = [
    "AWSXrayWriteOnlyAccess",
    "CloudWatchLambdaInsightsExecutionRolePolicy",
  ]

  default_policy_arns = { for n in local.default_policy_names : n => "${local.managed_policy_arn_prefix}/${n}" }
}

resource "aws_iam_role_policy_attachment" "this" {
  for_each   = local.default_policy_arns
  role       = aws_iam_role.this.id
  policy_arn = each.value
}
