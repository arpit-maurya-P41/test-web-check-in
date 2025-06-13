
resource "aws_security_group" "this" {
  name        = local.app_name
  description = local.app_name
  vpc_id      = module.prv_subnets.subnets[0].vpc_id

  tags = {
    Name = local.app_name
  }
}

resource "aws_vpc_security_group_egress_rule" "app_to_db" {
  security_group_id = aws_security_group.this.id
  description       = "Allow access to ${local.db_credentials.DB_INSTANCE_IDENTIFIER} DB"
  ip_protocol       = "tcp"
  from_port         = local.db_credentials.DB_PORT
  to_port           = local.db_credentials.DB_PORT

  referenced_security_group_id = local.db_security_group_id

  tags = {
    Name = "${local.app_name}-db-access"
  }
}

resource "aws_vpc_security_group_ingress_rule" "db_from_app" {
  security_group_id = local.db_security_group_id
  description       = "Allow access from ${local.app_name}"
  ip_protocol       = "tcp"
  from_port         = local.db_credentials.DB_PORT
  to_port           = local.db_credentials.DB_PORT

  referenced_security_group_id = aws_security_group.this.id

  tags = {
    Name = "${local.db_credentials.DB_INSTANCE_IDENTIFIER}-web-app-access"
  }
}
