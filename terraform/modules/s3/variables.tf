variable "name" {
  type        = string
  description = "S3 bucket name"
}

variable "kms_key_arn" {
  type        = string
  description = "KMS key ARN for server-side encryption (P88)"
}
