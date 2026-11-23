import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/apiConfig';

export default function AdminLogin({ showToast }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const backendUrl = API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Please enter both administrator username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/admin/login`, {
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
        showToast?.(`Authenticated as Administrator ${data.admin_username}`, 'success');
        try {
          sessionStorage.setItem('cropling_admin', JSON.stringify({
            admin_username: data.admin_username,
            authenticatedAt: new Date().toISOString()
          }));
        } catch (e) { }
        navigate('/admin/dashboard');
      } else {
        setErrorMsg(data.error || 'Invalid administrator credentials provided.');
        showToast?.(data.error || 'Authentication rejected.', 'error');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMsg('Unable to connect to backend service. Ensure server is running.');
      showToast?.('Connection failure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 'calc(var(--nav-height) + 3rem) 1.5rem 6rem 1.5rem', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        
        {/* Terminal Header */}
        <div style={{
          backgroundColor: 'var(--agri-canvas)',
          border: '1px solid var(--agri-line-strong)',
          borderBottom: 'none',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--agri-danger)', display: 'inline-block' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--agri-accent)', display: 'inline-block' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--agri-line-strong)', display: 'inline-block' }}></span>
            <span className="mono-meta" style={{ marginLeft: '8px', color: 'var(--agri-ink)', fontWeight: 700 }}>
              CROPLING // ROOT CONSOLE
            </span>
          </div>
          <span className="mono-meta" style={{ color: 'var(--agri-accent)', fontSize: '10px', border: '1px solid var(--agri-accent)', padding: '2px 6px' }}>
            ADMIN ACCESS
          </span>
        </div>

        {/* Form Card */}
        <div style={{
          backgroundColor: 'var(--agri-surface)',
          border: '1px solid var(--agri-line-strong)',
          padding: '2.25rem 2rem 2rem 2rem',
          boxShadow: '0 12px 36px rgba(0,0,0,0.06)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--agri-ink)', letterSpacing: '-0.02em', margin: 0 }}>
              System Operator Sign In
            </h1>
            <p style={{ color: 'var(--agri-secondary)', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
              Enter administrator username and password to authenticate.
            </p>
          </div>

          {errorMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--agri-danger)',
              backgroundColor: 'var(--agri-danger-dim)',
              color: 'var(--agri-danger)',
              marginBottom: '1.25rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              lineHeight: 1.4
            }}>
              AUTH_ERROR // {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Field 1: Username */}
            <div className="console-field" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="admin-username">Administrator Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="admin-username"
                  name="username"
                  placeholder="Enter admin username"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="console-field" style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="admin-password">Administrator Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="admin-password"
                  name="password"
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-technical"
              style={{ width: '100%', padding: '14px 20px', backgroundColor: 'var(--agri-ink)' }}
              disabled={loading}
            >
              {loading ? (
                <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> AUTHENTICATING...</span>
              ) : (
                <span><i className="fa-solid fa-shield-halved" style={{ marginRight: '8px' }}></i> SIGN IN TO ADMIN CONSOLE</span>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--agri-line)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/login" style={{ color: 'var(--agri-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: '4px' }}></i> Farmer Portal
            </Link>
            <span className="mono-meta" style={{ fontSize: '10px', color: 'var(--agri-muted)' }}>
              SECURE ADMIN ACCESS
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}
