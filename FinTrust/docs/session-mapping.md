# Session-to-Repo Mapping

How FinTrust maps to DevSecAI Security Champions training sessions.

| Session / Topic        | Repo location              | What to use |
|------------------------|----------------------------|-------------|
| **OWASP Top 10**       | `api/`                     | Broken access control: IDOR in `users.js` (any user/transactions), `transfers.js` (transfer from any account), `payments.js` (no auth). Error disclosure in API. |
| **Secure coding**      | `web/`                     | XSS in `Login.js`, missing CSP, `dangerouslySetInnerHTML`. Transfer/Pay forms: no CSRF tokens. |
| **IaC security**       | `terraform/`               | Public S3, wildcard IAM, unencrypted DB, no backup |
| **CI/CD security**     | `.github/workflows/`       | `ci.yml`, `iac-scan.yml`, `secrets-scan.yml`, `sbom.yml` |
| **Threat modeling**    | `docs/`                    | `architecture.md`, `toolkit/attack-surface-template.png`, `threat-modeling-guide.md` |
| **Pen testing**        | Whole stack                | Run `docker-compose up` or `npm run dev`; use as lab target. Try: change account ID in Statements (IDOR), transfer to another user ID, intercept/modify requests. |

**In-app flows for demos:** Login → Overview (balance) → **Transfer** (from/to any user ID) → **Pay a bill** (no CSRF) → **Statements** (view any account’s transactions by changing ID).

See also: [OWASP ASVS checklist](toolkit/owasp-asvs-checklist.md), [threat modeling guide](toolkit/threat-modeling-guide.md), [maturity baseline](toolkit/maturity-baseline.md).
