output "this" {
  value = merge(
    {
      url = aws_lambda_function_url.this.function_url
    },
    module.lambda,
    module.lambda_base,
  )
}
