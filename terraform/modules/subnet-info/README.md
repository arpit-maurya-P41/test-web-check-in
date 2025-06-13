# subnet-info

This is a convenience module to fetch and transform information about existing subnets that share a common prefix string on their `Name` tag.

[//]: # (BEGIN_TF_DOCS)





## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_subnet_name_prefix"></a> [subnet\_name\_prefix](#input\_subnet\_name\_prefix) | String prefix used to filter on the `Name` tag of subnets | `string` | n/a | yes |



## Outputs

| Name | Description |
|------|-------------|
| <a name="output_subnet_cidrs_ipv4"></a> [subnet\_cidrs\_ipv4](#output\_subnet\_cidrs\_ipv4) | Map of subnet names to subnet IPv4 CIDRs |
| <a name="output_subnet_ids"></a> [subnet\_ids](#output\_subnet\_ids) | List of subnet IDs |
| <a name="output_subnets"></a> [subnets](#output\_subnets) | List of subnet data objects |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | n/a |



## Resources

| Name | Type |
|------|------|
| [aws_subnet.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/subnet) | data source |
| [aws_subnets.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/subnets) | data source |

[//]: # (END_TF_DOCS)