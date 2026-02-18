/**
 * Transfers route. Requires JWT auth; transfer is always from the authenticated user's account.
 * Enforces maximum single transfer limit and balance check.
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getBalance } = require('../data/accounts');
const router = express.Router();

// Business rule: max single transfer (configurable via env; must be positive finite number)
const MAX_TRANSFER_AMOUNT = (() => {
  const n = Number(process.env.MAX_TRANSFER_AMOUNT);
  return Number.isFinite(n) && n > 0 ? n : 50000;
})();

router.post('/', authMiddleware, (req, res) => {
  const { toUserId, amount, reference } = req.body || {};
  const from = req.user.sub; // Always use authenticated user; ignore fromUserId from body
  const to = toUserId && /^[1-9]\d*$/.test(String(toUserId).trim()) ? String(toUserId).trim() : null;
  const amt = Number(amount);
  const ref = typeof reference === 'string' ? reference.slice(0, 200).trim() || 'Transfer' : 'Transfer';

  if (!to) {
    return res.status(400).json({ error: 'Invalid request', message: 'Valid to account (user ID) is required.' });
  }
  if (Number.isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Invalid request', message: 'Amount must be a positive number.' });
  }
  if (amt > MAX_TRANSFER_AMOUNT) {
    return res.status(400).json({
      error: 'Invalid request',
      message: `Transfer amount cannot exceed £${MAX_TRANSFER_AMOUNT.toLocaleString()}.`,
    });
  }

  const balance = getBalance(from);
  if (amt > balance) {
    return res.status(400).json({
      error: 'Insufficient funds',
      message: 'Transfer amount exceeds your available balance.',
    });
  }

  res.status(201).json({
    success: true,
    transferId: `T${Date.now()}`,
    fromAccount: from,
    toAccount: to,
    amount: amt,
    reference: ref,
    message: 'Transfer submitted.',
  });
});

module.exports = router;
