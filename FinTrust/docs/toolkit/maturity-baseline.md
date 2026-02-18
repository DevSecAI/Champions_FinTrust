# Maturity Baseline (Training)

A simple baseline to compare before/after Security Champions improvements. FinTrust starts at “training / deliberately weak”.

| Area           | Current (training)     | Target (post-training)        |
|----------------|------------------------|-------------------------------|
| Auth           | No JWT check on API    | Verify JWT on protected routes |
| Access control | IDOR on /users/:id     | Authorise by resource owner   |
| Input/output   | XSS via innerHTML      | Sanitise / no dangerous HTML  |
| Headers        | No CSP                 | CSP, HSTS, X-Frame-Options    |
| IaC            | Public S3, wildcard IAM| Least privilege, no public    |
| Secrets        | Placeholders in .env   | No secrets in repo, vault     |
| CI             | SAST/IaC/secrets/SBOM  | Fail pipeline on high/critical|

Use with OWASP SAMM or your own maturity model.
