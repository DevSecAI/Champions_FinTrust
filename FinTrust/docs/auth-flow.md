# FinTrust Auth Flow

Optional auth flow used in Security Champions training.

```mermaid
sequenceDiagram
  participant U as User
  participant W as Web
  participant A as Auth
  participant API as API Gateway

  U->>W: Login (email/password)
  W->>A: OAuth2 Request
  A-->>W: JWT token
  W->>API: Request with JWT
  API->>A: Verify token
  API-->>W: Data response
```

Note: In this training repo, the API does **not** verify the JWT for the `/users/:id` route (deliberate IDOR flaw for training).
