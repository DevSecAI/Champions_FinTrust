# Threat Modeling Guide (FinTrust)

Quick guide for running threat modeling on the FinTrust stack during Security Champions training.

## Scope

- **Assets**: User data, balances, JWTs, S3 objects.
- **Entry points**: Web login, API routes, Auth service.
- **Trust boundaries**: Browser ↔ Web, Web ↔ API, API ↔ Auth/DB/S3/FX.

## Steps

1. **Diagram** – Use [architecture.md](../architecture.md) and the attack surface template.
2. **Identify threats** – STRIDE per component (Spoofing, Tampering, Repudiation, Information disclosure, DoS, Elevation).
3. **Map to FinTrust** – e.g. IDOR in `api/routes/users.js`, XSS in `web/src/Login.js`, public S3 in `terraform/modules/s3/`.
4. **Prioritise** – Likelihood × impact; align with OWASP Top 10 and ASVS.

## Deliberate Flaws to Discuss

- No JWT check on `/users/:id` → IDOR.
- Raw HTML from user input in Login → XSS.
- Terraform: public bucket, wildcard IAM, DB without encryption/backup.

Use `docs/toolkit/attack-surface-template.png` as a placeholder canvas if needed.
