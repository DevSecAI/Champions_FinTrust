# FinTrust Terraform - Production-ready security controls.
# P88: Encryption at rest (KMS). P85: S3 Block Public Access.

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# P88: Customer-managed KMS key for encryption at rest (S3, RDS)
resource "aws_kms_key" "storage" {
  description             = "FinTrust storage encryption key (S3, RDS)"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "aws_kms_alias" "storage" {
  name          = "alias/fintrust-storage-${var.environment}"
  target_key_id = aws_kms_key.storage.key_id
}

# P85: Account-level S3 Block Public Access (all buckets in account)
resource "aws_s3_account_public_access_block" "this" {
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket: P88 encryption at rest, P85 block public access (bucket-level)
module "s3" {
  source      = "./modules/s3"
  name        = "fintrust-training-bucket-${var.environment}"
  kms_key_arn = aws_kms_key.storage.arn
  depends_on  = [aws_s3_account_public_access_block.this]
}

module "iam" {
  source          = "./modules/iam"
  name            = "fintrust-training-role"
  db_secret_arn   = aws_secretsmanager_secret.db.arn
  s3_bucket_arn   = module.s3.bucket_arn
  kms_key_arn     = aws_kms_key.storage.arn
}

# Database password in Secrets Manager only (wc-1: no hardcoded credentials)
resource "random_password" "db" {
  length           = 32
  override_special = "!#$%&*()-_=+[]{}<>:?"
  special          = true
}

resource "aws_secretsmanager_secret" "db" {
  name       = "fintrust/${var.environment}/rds-admin"
  kms_key_id = aws_kms_key.storage.id
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = "admin"
    password = random_password.db.result
  })
}

# RDS: P88 encryption at rest with KMS; password from Secrets Manager
module "db" {
  source                 = "./modules/db"
  identifier             = "fintrust-${var.environment}"
  kms_key_arn            = aws_kms_key.storage.arn
  db_password_secret_arn  = aws_secretsmanager_secret.db.arn
  depends_on             = [aws_secretsmanager_secret_version.db]
}
