variable "name" {
  type        = string
  description = "Generic service name, used to name module resources"
}

variable "log_group_prefix" {
  description = "The log group prefix"
  type        = string
  default     = "/aws/lambda"
}

variable "log_retention_in_days" {
  description = "The number of days to retain the log events in the log group"
  type        = number
  default     = 90
}

variable "service" {
  description = "The service principal for the role. Can be 'lambda' or 'states'"
  type        = string
  default     = "lambda"
  validation {
    condition     = var.service == "lambda" || var.service == "states"
    error_message = "Service must be either `lambda` or `states`."
  }
}

variable "vpc_permissions_enabled" {
  description = "(Optional) Whether to enable VPC permissions for the execution role"
  type        = bool
  default     = false
}
