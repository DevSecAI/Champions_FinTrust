# OWASP ASVS Checklist (Training Reference)

Use this as a reference during Security Champions sessions. FinTrust deliberately fails several items for training.

- [ ] **V1** Architecture – threat model, secure design
- [ ] **V2** Authentication – credential handling, MFA, session
- [ ] **V3** Session** – token validation, logout, timeout
- [ ] **V4** Access control – authorization on every request, no IDOR
- [ ] **V5** Validation – input/output encoding, XSS/injection
- [ ] **V6** Cryptography – TLS, hashing, no hardcoded secrets
- [ ] **V7** Error handling – no stack traces to client
- [ ] **V8** Data protection – encryption at rest, PII
- [ ] **V9** Communication – HTTPS, secure headers
- [ ] **V10** Malicious code – dependencies, SBOM

Map findings to `api/`, `web/`, and `terraform/` as in [session-mapping.md](../session-mapping.md).
