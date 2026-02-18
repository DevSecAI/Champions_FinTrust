/**
 * JWT authentication middleware.
 * Verifies Authorization: Bearer <token> and sets req.user = { sub, email } from the payload.
 * Returns 401 when missing or invalid.
 */

const jwt = require('jsonwebtoken');

// JWT_SECRET required in all environments; must match auth service. No predictable fallback.
const JWT_SECRET = process.env.JWT_SECRET && String(process.env.JWT_SECRET).trim()
  ? String(process.env.JWT_SECRET).trim()
  : null;

function authMiddleware(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const sub = decoded.sub != null ? String(decoded.sub) : null;
    const email = typeof decoded.email === 'string' ? decoded.email : '';
    if (!sub) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token payload.' });
    }
    req.user = { sub, email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token.' });
  }
}

module.exports = { authMiddleware };
