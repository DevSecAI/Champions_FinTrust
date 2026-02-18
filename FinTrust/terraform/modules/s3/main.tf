# P85: Block public access. P88: Encryption at rest with KMS.
# For public content use CloudFront with OAI; never use ACL public-read.

resource "aws_s3_bucket" "this" {
  bucket = var.name
}

# P88: Encrypt all storage at rest using customer-managed KMS key
resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = var.kms_key_arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# P85: Block public access at bucket level (account-level recommended as well)
resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Private ACL only; no public-read
resource "aws_s3_bucket_acl" "this" {
  bucket = aws_s3_bucket.this.id
  acl    = "private"
}
