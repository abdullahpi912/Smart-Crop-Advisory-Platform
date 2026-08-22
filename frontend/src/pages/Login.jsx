import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ showToast }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showToast?.('Please enter your username or email and password.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const backendUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast?.(data.message || 'Successfully authenticated session!', 'success');
        try {
          localStorage.setItem('agrisense_session', JSON.stringify({
            userId: data.user_id,
            username: data.username
          }));
        } catch (e) { }
        navigate('/dashboard');
      } else {
        showToast?.(data.error || 'Invalid credentials provided.', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      showToast?.('Network error: Unable to reach backend server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 'calc(var(--nav-height) + 3rem) 1.5rem 5rem 1.5rem' }}>
      <div className="auth-split-grid" style={{ maxWidth: '580px', gridTemplateColumns: '1fr' }}>
        <div className="auth-form-column">
          <div style={{ marginBottom: '2rem' }}>
            <div className="section-meta-row" style={{ marginBottom: '0.75rem' }}>
              <span className="mono-accent">ACCESS • AUTH</span>
              <div className="section-meta-rule" style={{ maxWidth: '30px' }}></div>
              <span className="mono-meta">SECURE CONSOLE</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--agri-ink)' }}>
              Sign In to AgriSense
            </h1>
            <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Access saved farm plots, review historical advisory logs, and run machine learning predictions.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="console-field" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="username">Username or Email</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter username or email address"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="console-field" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="password" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => showToast?.('Password reset instructions dispatched.', 'info')}
                  className="mono-meta"
                  style={{ background: 'none', border: 'none', color: 'var(--agri-accent)', cursor: 'pointer', fontSize: '10px' }}
                >
                  FORGOT PASSWORD?
                </button>
              </div>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: 'var(--agri-accent)', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '0.88rem', color: 'var(--agri-secondary)', cursor: 'pointer' }}>
                Remember session on this device
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary-technical"
              style={{ width: '100%', padding: '14px 24px' }}
              disabled={loading}
            >
              {loading ? (
                <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> AUTHENTICATING...</span>
              ) : (
                <span><i className="fa-solid fa-arrow-right-to-bracket" style={{ marginRight: '8px' }}></i> SIGN IN TO ACCOUNT</span>
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--agri-line)', paddingTop: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.92rem', color: 'var(--agri-secondary)' }}>
              Don't have a registered farm profile?{' '}
              <Link to="/register" style={{ color: 'var(--agri-accent)', fontWeight: 600 }}>
                Register Plot Profile <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }}></i>
              </Link>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
