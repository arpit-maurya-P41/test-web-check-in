output "subnets" {
  description = "List of subnet data objects"
  value       = local.subnets
}

output "subnet_ids" {
  description = "List of subnet IDs"
  value       = local.subnet_ids
}

output "subnet_cidrs_ipv4" {
  description = "Map of subnet names to subnet IPv4 CIDRs"
  value       = local.subnet_cidrs_ipv4
}
