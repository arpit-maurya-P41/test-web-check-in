data "aws_subnets" "this" {
  filter {
    name   = "tag:Name"
    values = ["${var.subnet_name_prefix}*"]
  }
}

data "aws_subnet" "this" {
  for_each = toset(data.aws_subnets.this.ids)
  id       = each.value
}

locals {
  subnet_ids        = data.aws_subnets.this.ids
  subnets           = values(data.aws_subnet.this)
  subnet_cidrs_ipv4 = { for subnet in local.subnets : subnet.tags.Name => subnet.cidr_block }
}
