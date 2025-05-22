output "iam_role" {
  value       = aws_iam_role.this
  description = "The `aws_iam_role` resource"
}

output "log_group" {
  value       = aws_cloudwatch_log_group.this
  description = "The `aws_cloudwatch_log_group` resource"
}
