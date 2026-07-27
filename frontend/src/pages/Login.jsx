import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ showToast }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('farmer@agrisense.io');
  const [password, setPassword] = useState('••••••••');
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast?.('Successfully signed in!', 'success');
    navigate('/dashboard');
  };

  return (
    <main>
      <section className="auth-section">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-badge"><i className="fa-solid fa-shield-halved"></i> Secure Farmer Access</div>
              <h2>Welcome Back to AgriSense</h2>
              <p>Sign in to manage your farm profiles, view past soil recommendations, and run ML advisory models.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="email">Email Address or Username</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="e.g. farmer@agrisense.io"
                    required
                    className="input-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <i className="fa-solid fa-envelope"></i>
                </div>
              </div>

              <div className="form-field">
                <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="password">Password</label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => showToast?.('Password reset instructions sent to your email.', 'info')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-terracotta)', fontSize: '0.85rem' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter password"
                    required
                    className="input-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <i className="fa-solid fa-lock"></i>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Remember my login on this device</span>
                </label>
              </div>

              <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-terracotta btn-block">
                  <i className="fa-solid fa-right-to-bracket"></i> Sign In to Account
                </button>
              </div>
            </form>

            <div className="auth-footer">
              <p>Don't have an account yet? <Link to="/register" className="auth-accent-link">Register New Farm Profile <i className="fa-solid fa-arrow-right"></i></Link></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
