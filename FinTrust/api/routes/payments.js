/**
 * Bill payments route. Requires JWT auth; payment is always from the authenticated user's account.
 * Enforces maximum single payment limit and balance check.
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getBalance } = require('../data/accounts');
const router = express.Router();

// Business rule: max single payment (configurable via env; must be positive finite number)
const MAX_PAYMENT_AMOUNT = (() => {
  const n = Number(process.env.MAX_PAYMENT_AMOUNT);
  return Number.isFinite(n) && n > 0 ? n : 50000;
})();

router.post('/', authMiddleware, (req, res) => {
  const { payeeName, amount, reference } = req.body || {};
  const fromAccountId = req.user.sub; // Always use authenticated user; ignore fromAccountId from body
  const payee = typeof payeeName === 'string' ? payeeName.slice(0, 200).trim() : '';
  const amt = Number(amount);
  const ref = typeof reference === 'string' ? reference.slice(0, 200).trim() || 'Bill payment' : 'Bill payment';

  if (!payee) {
    return res.status(400).json({ error: 'Invalid request', message: 'Payee name is required.' });
  }
  if (Number.isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Invalid request', message: 'Amount must be a positive number.' });
  }
  if (amt > MAX_PAYMENT_AMOUNT) {
    return res.status(400).json({
      error: 'Invalid request',
      message: `Payment amount cannot exceed £${MAX_PAYMENT_AMOUNT.toLocaleString()}.`,
    });
  }

  const balance = getBalance(fromAccountId);
  if (amt > balance) {
    return res.status(400).json({
      error: 'Insufficient funds',
      message: 'Payment amount exceeds your available balance.',
    });
  }

  res.status(201).json({
    success: true,
    paymentId: `P${Date.now()}`,
    payee,
    amount: amt,
    reference: ref,
    message: 'Payment scheduled.',
  });
});

module.exports = router;
