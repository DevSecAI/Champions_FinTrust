import React, { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import { escapeForDisplay } from './utils/escape';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <header className="header">
        <h1 className="logo">FinTrust</h1>
        <div className="header-links">
          <a href="#personal">Personal</a>
          <a href="#business">Business</a>
          {user && <span className="header-email">{escapeForDisplay(user.email)}</span>}
          <span className="training-badge">Security Champions training only</span>
        </div>
      </header>
      <main className="main">
        {!user ? (
          <>
            <section className="welcome-panel" aria-label="Welcome">
              <h2>Welcome to FinTrust</h2>
              <p>Sign in to manage your accounts, pay bills, and more. We're here to keep your finances simple and secure.</p>
              <ul className="trust-list">
                <li>24/7 access to your accounts</li>
                <li>Secure payments and transfers</li>
                <li>Protected by industry-standard encryption</li>
              </ul>
            </section>
            <section className="login-panel" aria-label="Sign in">
              <Login onSuccess={(token, email) => setUser({ token, email })} />
            </section>
          </>
        ) : (
          <section className="dashboard-panel" aria-label="Accounts">
            <Dashboard user={user} onLogout={() => setUser(null)} />
          </section>
        )}
      </main>
      <footer className="app-footer">
        <a href="#help">Help</a>
        {' · '}
        <a href="#privacy">Privacy</a>
        {' · '}
        <a href="#terms">Terms of use</a>
        {' · '}
        © FinTrust. For training use only.
      </footer>
    </div>
  );
}

export default App;
