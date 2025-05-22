# lambda

[//]: # (BEGIN_TF_DOCS)





## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_alias"></a> [alias](#input\_alias) | n/a | `string` | `"default"` | no |
| <a name="input_alias_description"></a> [alias\_description](#input\_alias\_description) | Description of the alias | `string` | `null` | no |
| <a name="input_architecture"></a> [architecture](#input\_architecture) | n/a | `string` | `"arm64"` | no |
| <a name="input_cloudwatch_log_group"></a> [cloudwatch\_log\_group](#input\_cloudwatch\_log\_group) | n/a | `string` | `null` | no |
| <a name="input_description"></a> [description](#input\_description) | Description of the lambda | `string` | `null` | no |
| <a name="input_iam_role_arn"></a> [iam\_role\_arn](#input\_iam\_role\_arn) | n/a | `string` | n/a | yes |
| <a name="input_image_parameter"></a> [image\_parameter](#input\_image\_parameter) | Name of an existing SSM parameter containing the Lambda ECR image URI | `string` | n/a | yes |
| <a name="input_kms_key_arn"></a> [kms\_key\_arn](#input\_kms\_key\_arn) | n/a | `string` | `null` | no |
| <a name="input_lambda_env"></a> [lambda\_env](#input\_lambda\_env) | n/a | `map(string)` | `{}` | no |
| <a name="input_log_group_name"></a> [log\_group\_name](#input\_log\_group\_name) | n/a | `string` | n/a | yes |
| <a name="input_memory_size_mb"></a> [memory\_size\_mb](#input\_memory\_size\_mb) | n/a | `number` | `256` | no |
| <a name="input_name"></a> [name](#input\_name) | Name of the lambda | `string` | n/a | yes |
| <a name="input_timeout_seconds"></a> [timeout\_seconds](#input\_timeout\_seconds) | n/a | `number` | `300` | no |



## Outputs

| Name | Description |
|------|-------------|
| <a name="output_alias"></a> [alias](#output\_alias) | n/a |
| <a name="output_function"></a> [function](#output\_function) | n/a |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | n/a |



## Resources

| Name | Type |
|------|------|
| [aws_lambda_alias.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_alias) | resource |
| [aws_lambda_function.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function) | resource |
| [aws_ssm_parameter.image_uri](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ssm_parameter) | data source |

[//]: # (END_TF_DOCS)