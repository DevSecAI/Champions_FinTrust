# FinTrust Architecture

This diagram shows the high-level architecture of the FinTrust application stack used throughout the Security Champions training programme.

```mermaid
graph TD
  User[User Browser]
  Web[Web Portal (React)]
  API[API Gateway (Node.js)]
  Auth[Auth Service (OAuth2)]
  DB[(PostgreSQL Database)]
  S3[[S3 Bucket]]
  FX[3rd Party: FX API]

  User --> Web
  Web -->|JWT| API
  API --> Auth
  API --> DB
  API --> S3
  API --> FX
```

Components:

- **User Browser** → accesses the Web Portal.
- **Web Portal (React)** → runs on port 3000; sends JWT to API.
- **API Gateway (Node.js)** → runs on port 4000; talks to Auth, DB, S3, and FX.
- **Auth Service (OAuth2)** → runs on port 5000; issues and validates JWT.
- **PostgreSQL**, **S3**, **FX API** → represented in Terraform and training scenarios.
