/**
 * User and transactions routes. All require JWT auth; users can only access their own data.
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { users } = require('../data/accounts');
const router = express.Router();

const transactions = {
  '1': [
    { id: 'T1', date: new Date().toISOString().slice(0, 10), description: 'Salary credit', amount: 1200, type: 'credit' },
    { id: 'T2', date: new Date(Date.now() - 864e5).toISOString().slice(0, 10), description: 'Card payment – Supermarket', amount: -45.32, type: 'debit' },
    { id: 'T3', date: new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10), description: 'Direct debit – Utilities', amount: -62, type: 'debit' },
    { id: 'T4', date: new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10), description: 'Transfer in', amount: 50, type: 'credit' },
  ],
  '2': [
    { id: 'T5', date: new Date().toISOString().slice(0, 10), description: 'Transfer from Alice', amount: 100, type: 'credit' },
    { id: 'T6', date: new Date(Date.now() - 864e5).toISOString().slice(0, 10), description: 'Card payment', amount: -30, type: 'debit' },
  ],
  '3': [
    { id: 'T7', date: new Date().toISOString().slice(0, 10), description: 'Deposit', amount: 500, type: 'credit' },
  ],
};

// GET /me – current user's profile (auth required). No list-all endpoint to prevent enumeration.
router.get('/me', authMiddleware, (req, res) => {
  const user = users[req.user.sub];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// GET /:id – only allow access to own profile
router.get('/:id', authMiddleware, (req, res, next) => {
  if (req.params.id !== req.user.sub) {
    return res.status(403).json({ error: 'Forbidden', message: 'You can only access your own account.' });
  }
  const user = users[req.params.id];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// GET /:id/transactions – only allow access to own transactions
router.get('/:id/transactions', authMiddleware, (req, res, next) => {
  if (req.params.id !== req.user.sub) {
    return res.status(403).json({ error: 'Forbidden', message: 'You can only access your own transactions.' });
  }
  const list = transactions[req.params.id] || [];
  res.json(list);
});

module.exports = router;
