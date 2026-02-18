# P88: RDS encryption at rest with customer-managed KMS key.
# Credentials from Secrets Manager only; no hardcoded passwords (wc-1).

data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = var.db_password_secret_arn
}

locals {
  # Support RDS-style JSON {"username":"...","password":"..."} or raw string
  db_secret_json = try(jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string), null)
  db_password    = local.db_secret_json != null ? lookup(local.db_secret_json, "password", data.aws_secretsmanager_secret_version.db_password.secret_string) : data.aws_secretsmanager_secret_version.db_password.secret_string
}

resource "aws_db_instance" "this" {
  identifier     = var.identifier
  engine         = "postgres"
  engine_version = "15"
  instance_class = "db.t3.micro"

  allocated_storage = 20
  db_name           = "fintrust"
  username          = "admin"
  password          = local.db_password

  # P88: Encrypt all storage at rest with KMS
  storage_encrypted = true
  kms_key_id        = var.kms_key_arn

  backup_retention_period = 7
  skip_final_snapshot     = true

  publicly_accessible = false
}
