variable "name" {
  type        = string
  description = "Name of the IAM role (e.g. fintrust-training-role)."
}

# Optional: scope policy to specific resources (least-privilege). Leave empty to grant no access to that service.
variable "db_secret_arn" {
  type        = string
  default     = ""
  description = "ARN of Secrets Manager secret for DB credentials (e.g. RDS). Enables secretsmanager:GetSecretValue on this secret only."
}

variable "s3_bucket_arn" {
  type        = string
  default     = ""
  description = "ARN of S3 bucket the role may access. Enables s3:GetObject, s3:PutObject, s3:ListBucket on this bucket only."
}

variable "kms_key_arn" {
  type        = string
  default     = ""
  description = "ARN of KMS key used by Secrets Manager and/or S3. Enables kms:Decrypt, kms:GenerateDataKey on this key only."
}
