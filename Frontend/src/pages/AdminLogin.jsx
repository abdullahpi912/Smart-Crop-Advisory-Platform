import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminLogin({ showToast }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [favoriteNumber, setFavoriteNumber] = useState('');
  const [securityPhrase, setSecurityPhrase] = useState('');
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const backendUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';

  const fetchHint = async (user) => {
    const trimmed = (user || '').trim();
    if (!trimmed) {
      setHint('');
      return;
    }
    setHintLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/login-hint?username=${encodeURIComponent(trimmed)}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.hint) {
          setHint(data.hint);
        } else {
          setHint('');
        }
      } else {
        setHint('');
      }
    } catch (e) {
      setHint('');
    } finally {
      setHintLoading(false);
    }
  };

  const handleUsernameBlur = () => {
    fetchHint(username);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password || !favoriteNumber.trim() || !securityPhrase.trim()) {
      setErrorMsg('Please enter all four required credentials: username, password, favorite number, and security phrase.');
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
          password: password,
          favorite_number: favoriteNumber.trim(),
          security_phrase: securityPhrase.trim()
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
            4-FACTOR RESTRICTED
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
            <div className="section-meta-row" style={{ marginBottom: '0.4rem' }}>
              <span className="mono-accent">ADMINISTRATION • PRIVILEGED ACCESS</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--agri-ink)', letterSpacing: '-0.02em', margin: 0 }}>
              System Operator Sign In
            </h1>
            <p style={{ color: 'var(--agri-secondary)', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: 1.4 }}>
              Enter all four administrator security factors to authenticate.
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
            {/* Factor 1: Username */}
            <div className="console-field" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="admin-username">1. Administrator Username</label>
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
                  onBlur={handleUsernameBlur}
                />
              </div>
            </div>

            {/* Factor 2: Password */}
            <div className="console-field" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="admin-password">2. Master Password</label>
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

            {/* Factor 3: Favorite Number */}
            <div className="console-field" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="admin-fav-number">3. Favorite Number</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="admin-fav-number"
                  name="favorite_number"
                  placeholder="Enter secret favorite number"
                  autoComplete="off"
                  required
                  value={favoriteNumber}
                  onChange={(e) => setFavoriteNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Factor 4: Security Phrase & Dynamic Hint */}
            <div className="console-field" style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label htmlFor="admin-security-phrase" style={{ margin: 0 }}>4. Security Phrase</label>
                {hintLoading ? (
                  <span className="mono-meta" style={{ fontSize: '10px', color: 'var(--agri-muted)' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '4px' }}></i> Loading hint...
                  </span>
                ) : hint ? (
                  <span className="mono-meta" style={{ fontSize: '11px', color: 'var(--agri-accent)', fontWeight: 600 }}>
                    Hint: {hint}
                  </span>
                ) : null}
              </div>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="admin-security-phrase"
                  name="security_phrase"
                  placeholder="Enter secret security phrase"
                  autoComplete="off"
                  required
                  value={securityPhrase}
                  onChange={(e) => setSecurityPhrase(e.target.value)}
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
                <span><i className="fa-solid fa-shield-halved" style={{ marginRight: '8px' }}></i> VERIFY 4-FACTOR AUTH & SIGN IN</span>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--agri-line)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/login" style={{ color: 'var(--agri-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: '4px' }}></i> Farmer Portal
            </Link>
            <span className="mono-meta" style={{ fontSize: '10px', color: 'var(--agri-muted)' }}>
              HASH-SECURED 4FA
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}
