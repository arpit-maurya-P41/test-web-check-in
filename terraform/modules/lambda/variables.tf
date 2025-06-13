variable "name" {
  type        = string
  description = "Name of the lambda"
}

variable "description" {
  type        = string
  description = "Description of the lambda"
  default     = null
}

variable "image_uri" {
  type        = string
  description = "Image URI for the Lambda function"
}

variable "timeout_seconds" {
  type        = number
  description = "Amount of time the Lambda Function has to run in seconds"
  default     = 300
}

variable "memory_size_mb" {
  type        = number
  description = "Amount of memory in MB assigned to the Lambda function"
  default     = 256
}

variable "lambda_env" {
  type        = map(string)
  description = "Map of environment variables names to values for the Lambda function"
  default     = {}
}

variable "publish" {
  type        = bool
  description = "Publish the lambda?"
  default     = true
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

variable "reserved_concurrent_executions" {
  type        = number
  description = "Amount of reserved concurrent executions for the lambda function. A value of 0 disables lambda from being triggered and -1 removes any concurrency limitations"
  default     = -1
}

variable "subnet_ids" {
  type        = list(string)
  description = "(Optional) List of subnet IDs to use"
  default     = []
}

variable "security_group_ids" {
  type        = list(string)
  description = "(Optional) List of security group IDs to use"
  default     = []
}

variable "efs_access_point_arn" {
  type        = string
  description = "(Optional) ARN of EFS access point"
  default     = null
}

variable "efs_local_mount_path" {
  type        = string
  description = "(Optional) Local mount path of the EFS filesystem. Must start with `/mnt/`"
  default     = null

  validation {
    condition     = var.efs_local_mount_path == null || startswith(coalesce(var.efs_local_mount_path, "error"), "/mnt/")
    error_message = "`efs_local_mount_path` must start with `/mnt/` ."
  }
}
