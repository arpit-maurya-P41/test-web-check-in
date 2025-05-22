variable "name" {
  type        = string
  description = "Name of the lambda"
}

variable "description" {
  type        = string
  description = "Description of the lambda"
  default     = null
}

variable "image_parameter" {
  type        = string
  description = "Name of an existing SSM parameter containing the Lambda ECR image URI"
}

variable "timeout_seconds" {
  type    = number
  default = 300
}

variable "memory_size_mb" {
  type    = number
  default = 256
}

variable "lambda_env" {
  type    = map(string)
  default = {}
}

variable "alias" {
  type    = string
  default = "default"
}

variable "alias_description" {
  type        = string
  description = "Description of the alias"
  default     = null
}

variable "architecture" {
  type    = string
  default = "arm64"
}

variable "cloudwatch_log_group" {
  type    = string
  default = null
}

variable "log_group_name" {
  type = string
}

variable "iam_role_arn" {
  type = string
}

variable "kms_key_arn" {
  type    = string
  default = null
}
