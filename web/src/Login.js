/**
 * Login form. User input is rendered as plain text only (no raw HTML) to prevent XSS.
 */

import React, { useState } from 'react';
import { escapeForDisplay } from './utils/escape';

// Use relative URL so React dev server proxies to auth (no CORS). Fallback for Docker/build.
const AUTH_URL = process.env.REACT_APP_AUTH_URL || '';

const LockIcon = () => (
  <svg className="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');
  const [userInput, setUserInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      const isSuccess = !!data.token;
      if (isSuccess && onSuccess) {
        onSuccess(data.token, email || 'you@example.com');
        return;
      }
      setMessage(data.error || 'Invalid User ID or password. Please try again.');
    } catch (err) {
      setMessage("We're unable to complete your request. Please try again later.");
    }
  };

  const hasMessage = message.length > 0;
  const isSuccess = message.includes('successful');

  return (
    <div className="card">
      <div className="card-header">
        <LockIcon />
        <h2>Secure sign in</h2>
      </div>
      <p className="subtitle">Enter your User ID and password to access your accounts.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userid">User ID</label>
          <input
            id="userid"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your User ID or email"
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>
        <div className="remember-row">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label htmlFor="remember">Remember my User ID</label>
        </div>
        <button type="submit" className="btn">Sign in</button>
      </form>

      {hasMessage && (
        <div className={`message ${isSuccess ? 'success' : 'error'}`} role="alert">
          {escapeForDisplay(message)}
        </div>
      )}

      <div className="card-footer">
        <a href="#forgot">Forgot User ID or Password?</a>
        <br />
        Enrolled? <a href="#register">Register for online access</a>.
      </div>

      <div className="xss-demo">
        <label htmlFor="xss-input">Display name</label>
        <p className="xss-notice">Your display name is shown below as plain text.</p>
        <input
          id="xss-input"
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g. Your name"
          maxLength={200}
          aria-describedby="display-name-output"
        />
        <div id="display-name-output" className="output" role="status">
          {userInput ? escapeForDisplay(userInput) : '(empty)'}
        </div>
      </div>
    </div>
  );
}
