variable "identifier" {
  type        = string
  description = "RDS instance identifier"
}

variable "kms_key_arn" {
  type        = string
  description = "KMS key ARN for RDS storage encryption (P88)"
}

variable "db_password_secret_arn" {
  type        = string
  description = "ARN of AWS Secrets Manager secret containing DB password (JSON key 'password' or raw string). Eliminates hardcoded credentials from code and state."
}
