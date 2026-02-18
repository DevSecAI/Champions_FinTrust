/**
 * Shared stub account data. Used by users, payments, and transfers routes.
 * In production, replace with DB lookups.
 */

const users = {
  '1': { id: '1', email: 'alice@example.com', balance: 1000 },
  '2': { id: '2', email: 'bob@example.com', balance: 2500 },
  '3': { id: '3', email: 'charlie@example.com', balance: 500 },
};

function getBalance(userId) {
  const u = users[userId];
  return u != null ? Number(u.balance) : 0;
}

module.exports = { users, getBalance };
