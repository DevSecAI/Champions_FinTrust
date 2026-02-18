/**
 * Post-login dashboard – accounts, transfer, pay bill, statements.
 * All API calls use JWT; user can only access their own data.
 */

import React, { useState, useEffect } from 'react';
import { escapeForDisplay } from './utils/escape';

const API_BASE = '';

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('overview');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.token) {
      setLoading(false);
      setError('Not signed in.');
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/api/users/me`, { headers: authHeaders(user.token) })
      .then((res) => {
        if (res.status === 401 && onLogout) {
          onLogout();
          return Promise.reject(new Error('Session expired'));
        }
        return res.ok ? res.json() : Promise.reject(new Error('Failed to load account'));
      })
      .then((data) => { if (!cancelled) { setAccount(data); setError(null); } })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load account.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, onLogout]);

  const nav = [
    { id: 'overview', label: 'Overview' },
    { id: 'transfer', label: 'Transfer' },
    { id: 'pay', label: 'Pay a bill' },
    { id: 'statements', label: 'Statements' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Accounts</h2>
          <p className="dashboard-welcome">Welcome back. Here’s an overview of your accounts.</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={onLogout}>
          Sign out
        </button>
      </div>

      <nav className="dashboard-nav" aria-label="Account sections">
        {nav.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`dashboard-nav-btn ${view === id ? 'active' : ''}`}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {loading && <p className="dashboard-loading">Loading…</p>}
      {error && <div className="message">{escapeForDisplay(error)}</div>}

      {account && !loading && (
        <>
          {view === 'overview' && (
            <Overview account={account} />
          )}
          {view === 'transfer' && (
            <Transfer account={account} token={user.token} />
          )}
          {view === 'pay' && (
            <PayBill account={account} token={user.token} />
          )}
          {view === 'statements' && (
            <Statements account={account} token={user.token} />
          )}
        </>
      )}
    </div>
  );
}

function Overview({ account }) {
  return (
    <>
      <div className="account-card">
        <div className="account-card-header">
          <span className="account-type">Current account</span>
          <span className="account-id">**** {escapeForDisplay(account.id)}</span>
        </div>
        <div className="account-balance">
          <span className="account-balance-label">Available balance</span>
          <span className="account-balance-amount">
            £{Number(account.balance).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="account-meta">{escapeForDisplay(account.email)}</div>
      </div>
      <div className="dashboard-section">
        <h3>Recent activity</h3>
        <ul className="activity-list">
          <li>
            <span className="activity-desc">Salary credit</span>
            <span className="activity-amount positive">+£1,200.00</span>
            <span className="activity-date">Today</span>
          </li>
          <li>
            <span className="activity-desc">Card payment – Supermarket</span>
            <span className="activity-amount negative">−£45.32</span>
            <span className="activity-date">Yesterday</span>
          </li>
          <li>
            <span className="activity-desc">Direct debit – Utilities</span>
            <span className="activity-amount negative">−£62.00</span>
            <span className="activity-date">2 days ago</span>
          </li>
        </ul>
      </div>
    </>
  );
}

function Transfer({ account, token }) {
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus(null);
    const recipient = toAccount.trim();
    if (!recipient) {
      setStatus({ type: 'error', message: 'Please specify the recipient account (user ID).' });
      return;
    }
    setSubmitting(true);
    fetch(`${API_BASE}/api/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({
        toUserId: recipient,
        amount: parseFloat(amount) || 0,
        reference: reference.trim() || 'Transfer',
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus({ type: 'success', message: data.message || 'Transfer submitted successfully.', ref: data.transferId });
          setToAccount('');
          setAmount('');
          setReference('');
        } else {
          setStatus({ type: 'error', message: data.message || data.error || 'Transfer failed.' });
        }
      })
      .catch(() => setStatus({ type: 'error', message: 'Transfer failed. Is the API running on port 4000?' }))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="form-card">
      <h3>Transfer money</h3>
      <p className="form-card-desc">Move money to another FinTrust account.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="transfer-from">From account</label>
          <input id="transfer-from" type="text" value={`**** ${account.id} – £${Number(account.balance).toFixed(2)}`} readOnly className="input-readonly" />
        </div>
        <div className="form-group">
          <label htmlFor="transfer-to">To account (user ID)</label>
          <input
            id="transfer-to"
            type="text"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            placeholder="Enter recipient user ID"
            required
            aria-required="true"
          />
        </div>
        <div className="form-group">
          <label htmlFor="transfer-amount">Amount (£)</label>
          <input
            id="transfer-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="transfer-ref">Reference</label>
          <input
            id="transfer-ref"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit transfer'}
        </button>
      </form>
      {status && (
        <div className={`message ${status.type === 'success' ? 'success' : 'error'}`} role="alert">
          {escapeForDisplay(status.message)}
          {status.ref && <div className="message-ref">Ref: {escapeForDisplay(status.ref)}</div>}
        </div>
      )}
    </div>
  );
}

function PayBill({ account, token }) {
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    fetch(`${API_BASE}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({
        payeeName: payee,
        amount: parseFloat(amount) || 0,
        reference: reference || 'Bill payment',
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus({ type: 'success', message: data.message || 'Payment scheduled.', ref: data.paymentId });
          setPayee('');
          setAmount('');
          setReference('');
        } else {
          setStatus({ type: 'error', message: data.message || data.error || 'Payment failed.' });
        }
      })
      .catch(() => setStatus({ type: 'error', message: 'Payment failed. Is the API running?' }))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="form-card">
      <h3>Pay a bill</h3>
      <p className="form-card-desc">Set up a payment from your account.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="payee">Payee name</label>
          <input
            id="payee"
            type="text"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
            placeholder="e.g. British Gas"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="pay-amount">Amount (£)</label>
          <input
            id="pay-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="pay-ref">Reference</label>
          <input
            id="pay-ref"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Account or reference"
          />
        </div>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Schedule payment'}
        </button>
      </form>
      {status && (
        <div className={`message ${status.type === 'success' ? 'success' : 'error'}`} role="alert">
          {escapeForDisplay(status.message)}
          {status.ref && <div className="message-ref">Ref: {escapeForDisplay(status.ref)}</div>}
        </div>
      )}
    </div>
  );
}

function Statements({ account, token }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const loadTransactions = () => {
    setLoading(true);
    setLoadError(null);
    fetch(`${API_BASE}/api/users/${account.id}/transactions`, { headers: authHeaders(token) })
      .then((res) => {
        if (res.status === 403) return Promise.reject(new Error('You can only view your own account.'));
        return res.ok ? res.json() : Promise.reject(new Error('Failed to load'));
      })
      .then((data) => { setTransactions(Array.isArray(data) ? data : []); })
      .catch((err) => { setLoadError(err.message || 'Could not load transactions.'); setTransactions([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTransactions(); }, [account.id, token]);

  return (
    <div className="form-card">
      <h3>Statements &amp; transactions</h3>
      <p className="form-card-desc">
        View transactions for account **** {escapeForDisplay(account.id)}.
      </p>
      {loadError && <div className="message">{escapeForDisplay(loadError)}</div>}
      {loading && <p className="dashboard-loading">Loading…</p>}
      {transactions.length > 0 && (
        <ul className="activity-list" style={{ marginTop: '1rem' }}>
          {transactions.map((t) => (
            <li key={t.id}>
              <span className="activity-desc">{escapeForDisplay(t.description)}</span>
              <span className={`activity-amount ${t.amount >= 0 ? 'positive' : 'negative'}`}>
                {t.amount >= 0 ? '+' : ''}£{Number(t.amount).toFixed(2)}
              </span>
              <span className="activity-date">{escapeForDisplay(t.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
