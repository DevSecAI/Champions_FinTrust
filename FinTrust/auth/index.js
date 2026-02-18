/**
 * JWT issuer for FinTrust with credential validation.
 * Validates email/password against a user store before issuing tokens.
 */

const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5001;

// JWT_SECRET is required in all environments (no predictable fallback). Generate with: openssl rand -hex 32
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || typeof JWT_SECRET !== 'string' || JWT_SECRET.trim().length === 0) {
  console.error('FATAL: JWT_SECRET must be set in the environment (e.g. .env or Secrets Manager).');
  console.error('Generate a secret with: openssl rand -hex 32');
  process.exit(1);
}
const resolvedJwtSecret = JWT_SECRET.trim();

// User store: email -> { id, passwordHash }. IDs align with api/routes/users.js (1=alice, 2=bob, 3=charlie).
// In production, replace with DB lookup and use async bcrypt.compare.
const USER_STORE = (function () {
  const rounds = 10;
  const entries = [
    { email: 'alice@example.com', id: '1', password: 'Password1' },
    { email: 'bob@example.com', id: '2', password: 'Password2' },
    { email: 'charlie@example.com', id: '3', password: 'Password3' },
  ];
  const map = new Map();
  entries.forEach(({ email, id, password }) => {
    map.set(email.toLowerCase().trim(), { id, passwordHash: bcrypt.hashSync(password, rounds) });
  });
  return map;
})();

// Dummy hash (same cost as real hashes) used when user is not found, so bcrypt.compare runs
// and response time does not leak whether the email exists (prevents user enumeration via timing).
const DUMMY_HASH = bcrypt.hashSync('dummy-constant-time-compare', 10);

// Input validation limits (prevent DoS and injection)
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 1024;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeString(value) {
  if (value == null) return '';
  return String(value).trim();
}

function validateLoginInput(body) {
  const email = normalizeString(body && body.email);
  const password = body && body.password;
  const pwStr = password != null ? String(password) : '';

  if (!email || email.length === 0) {
    return { valid: false, error: 'Email is required.' };
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: 'Invalid credentials.' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Invalid credentials.' };
  }
  if (pwStr.length === 0) {
    return { valid: false, error: 'Invalid credentials.' };
  }
  if (pwStr.length > MAX_PASSWORD_LENGTH) {
    return { valid: false, error: 'Invalid credentials.' };
  }
  return { valid: true, email: email.toLowerCase(), password: pwStr };
}

// Rate limit for login: reduce brute force risk (configurable via env)
const LOGIN_RATE_LIMIT_WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 min
const LOGIN_RATE_LIMIT_MAX = (() => {
  const n = Number(process.env.LOGIN_RATE_LIMIT_MAX);
  return Number.isFinite(n) && n > 0 ? n : 10;
})();
const loginLimiter = rateLimit({
  windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
  max: LOGIN_RATE_LIMIT_MAX,
  message: { error: 'Too many login attempts. Please try again later.', message: 'Rate limit exceeded.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json({ limit: '2kb' })); // cap body size for /login

app.post('/login', loginLimiter, async (req, res) => {
  try {
    const validation = validateLoginInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error, message: validation.error });
    }
    const { email, password } = validation;

    const user = USER_STORE.get(email);
    const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
    const match = await bcrypt.compare(password, hashToCompare);
    if (!user || !match) {
      return res.status(401).json({ error: 'Invalid User ID or password. Please try again.', message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { sub: user.id, email },
      resolvedJwtSecret,
      { expiresIn: '1h' }
    );
    return res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error('Auth error:', err);
  res.status(500).json({ error: 'Internal error', message: err.message });
});

app.listen(PORT, () => console.log(`FinTrust Auth on port ${PORT}`));
