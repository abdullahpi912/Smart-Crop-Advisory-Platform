import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/apiConfig';

export default function Login({ showToast }) {
  const navigate = useNavigate();

  // Role Tab: 'farmer' | 'admin'
  const [roleTab, setRoleTab] = useState('farmer');

  // Farmer Form State
  const [farmerUsername, setFarmerUsername] = useState('');
  const [farmerPassword, setFarmerPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [farmerLoading, setFarmerLoading] = useState(false);

  // Admin Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFavoriteNumber, setAdminFavoriteNumber] = useState('');
  const [adminSecurityPhrase, setAdminSecurityPhrase] = useState('');
  const [adminHint, setAdminHint] = useState('');
  const [adminHintLoading, setAdminHintLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const backendUrl = API_BASE_URL;

  const fetchAdminHint = async (user) => {
    const trimmed = (user || '').trim();
    if (!trimmed) {
      setAdminHint('');
      return;
    }
    setAdminHintLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/login-hint?username=${encodeURIComponent(trimmed)}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.hint) {
          setAdminHint(data.hint);
        } else {
          setAdminHint('');
        }
      } else {
        setAdminHint('');
      }
    } catch (e) {
      setAdminHint('');
    } finally {
      setAdminHintLoading(false);
    }
  };

  // ── Farmer Login Submit Handler ──────────────────────────────────────────
  const handleFarmerSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!farmerUsername.trim() || !farmerPassword) {
      showToast?.('Please enter your username or email and password.', 'warning');
      return;
    }

    setFarmerLoading(true);

    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: farmerUsername.trim(),
          password: farmerPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast?.(data.message || 'Successfully authenticated session!', 'success');
        try {
          const sessionPayload = JSON.stringify({
            userId: data.user_id,
            username: data.username
          });
          localStorage.setItem('cropling_session', sessionPayload);
          localStorage.setItem('agrisense_session', sessionPayload);

          const userKey = `cropling_history_${data.username}`;
          const existingUserHistory = localStorage.getItem(userKey);
          if (existingUserHistory) {
            localStorage.setItem('cropling_history', existingUserHistory);
            localStorage.setItem('agrisense_history', existingUserHistory);
          } else {
            localStorage.removeItem('cropling_history');
            localStorage.removeItem('agrisense_history');
          }
        } catch (e) { }
        navigate('/dashboard');
      } else {
        const err = data.error || 'Invalid farmer credentials provided.';
        setErrorMsg(err);
        showToast?.(err, 'error');
      }
    } catch (err) {
      console.error('Farmer login error:', err);
      setErrorMsg('Network error: Unable to reach backend server.');
      showToast?.('Network error: Unable to reach backend server.', 'error');
    } finally {
      setFarmerLoading(false);
    }
  };

  // ── Admin Login Submit Handler ───────────────────────────────────────────
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminUsername.trim() || !adminPassword || !adminFavoriteNumber.trim() || !adminSecurityPhrase.trim()) {
      setErrorMsg('Please enter all four required credentials: username, password, favorite number, and security phrase.');
      showToast?.('All 4 credentials are required.', 'warning');
      return;
    }

    setAdminLoading(true);

    try {
      const response = await fetch(`${backendUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword,
          favorite_number: adminFavoriteNumber.trim(),
          security_phrase: adminSecurityPhrase.trim()
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
        const err = data.error || 'Invalid administrator credentials.';
        setErrorMsg(err);
        showToast?.(err, 'error');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMsg('Network error: Unable to reach backend server.');
      showToast?.('Connection failure.', 'error');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <main style={{ padding: 'calc(var(--nav-height) + 2.5rem) 1.5rem 5rem 1.5rem' }}>
      <div className="auth-split-grid" style={{ maxWidth: '600px', gridTemplateColumns: '1fr' }}>
        <div className="auth-form-column">
          
          {/* Header Title Block */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div className="section-meta-row" style={{ marginBottom: '0.5rem' }}>
              <span className="mono-accent">ACCESS • AUTHENTICATION</span>
              <div className="section-meta-rule" style={{ maxWidth: '30px' }}></div>
              <span className="mono-meta">
                {roleTab === 'farmer' ? 'FARMER PORTAL' : 'ROOT CONSOLE'}
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--agri-ink)', margin: 0 }}>
              {roleTab === 'farmer' ? 'Sign In to Cropling' : 'Administrator Sign In'}
            </h1>
            <p style={{ color: 'var(--agri-secondary)', fontSize: '0.92rem', marginTop: '0.4rem', lineHeight: 1.4 }}>
              {roleTab === 'farmer'
                ? 'Access saved farm plots, review historical advisory logs, and run machine learning predictions.'
                : 'Privileged command console for system audit trails, prediction telemetry, and registry management.'}
            </p>
          </div>

          {/* Role Segment Tabs Bar */}
          <div className="modal-tabs-technical" style={{ marginBottom: '1.75rem' }}>
            <button
              type="button"
              className={`modal-tab-btn-technical ${roleTab === 'farmer' ? 'active' : ''}`}
              onClick={() => { setRoleTab('farmer'); setErrorMsg(''); }}
            >
              <i className="fa-solid fa-user-group" style={{ marginRight: '6px' }}></i> 01 • FARMER LOGIN
            </button>
            <button
              type="button"
              className={`modal-tab-btn-technical ${roleTab === 'admin' ? 'active' : ''}`}
              onClick={() => { setRoleTab('admin'); setErrorMsg(''); }}
            >
              <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px' }}></i> 02 • ADMIN LOGIN
            </button>
          </div>

          {/* Inline Error Notice */}
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

          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: FARMER LOGIN FORM
          ══════════════════════════════════════════════════════════════════ */}
          {roleTab === 'farmer' && (
            <form onSubmit={handleFarmerSubmit}>
              <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="farmer-username">Username or Email</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="farmer-username"
                    name="username"
                    placeholder="Enter username or email address"
                    autoComplete="username"
                    required
                    value={farmerUsername}
                    onChange={(e) => setFarmerUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label htmlFor="farmer-password" style={{ margin: 0 }}>Password</label>
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
                    id="farmer-password"
                    name="password"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    value={farmerPassword}
                    onChange={(e) => setFarmerPassword(e.target.value)}
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
                disabled={farmerLoading}
              >
                {farmerLoading ? (
                  <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> AUTHENTICATING...</span>
                ) : (
                  <span><i className="fa-solid fa-arrow-right-to-bracket" style={{ marginRight: '8px' }}></i> SIGN IN TO FARMER PORTAL</span>
                )}
              </button>

              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--agri-line)', paddingTop: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.92rem', color: 'var(--agri-secondary)' }}>
                  Don't have a registered farm profile?{' '}
                  <Link to="/register" style={{ color: 'var(--agri-accent)', fontWeight: 600 }}>
                    Register Plot Profile <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                  </Link>
                </span>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2: ADMIN LOGIN FORM (4-Factor Auth)
          ══════════════════════════════════════════════════════════════════ */}
          {roleTab === 'admin' && (
            <form onSubmit={handleAdminSubmit}>
              {/* Factor 1: Administrator Username */}
              <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="admin-username">1. Administrator Username</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="admin-username"
                    name="adminUsername"
                    placeholder="Enter admin username"
                    autoComplete="username"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    onBlur={() => fetchAdminHint(adminUsername)}
                  />
                </div>
              </div>

              {/* Factor 2: Master Password */}
              <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="admin-password">2. Master Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="admin-password"
                    name="adminPassword"
                    placeholder="Enter administrator password"
                    autoComplete="current-password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
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
                    name="adminFavoriteNumber"
                    placeholder="Enter secret favorite number"
                    autoComplete="off"
                    required
                    value={adminFavoriteNumber}
                    onChange={(e) => setAdminFavoriteNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Factor 4: Security Phrase & Dynamic Hint */}
              <div className="console-field" style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label htmlFor="admin-security-phrase" style={{ margin: 0 }}>4. Security Phrase</label>
                  {adminHintLoading ? (
                    <span className="mono-meta" style={{ fontSize: '10px', color: 'var(--agri-muted)' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '4px' }}></i> Loading hint...
                    </span>
                  ) : adminHint ? (
                    <span className="mono-meta" style={{ fontSize: '11px', color: 'var(--agri-accent)', fontWeight: 600 }}>
                      Hint: {adminHint}
                    </span>
                  ) : null}
                </div>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="admin-security-phrase"
                    name="adminSecurityPhrase"
                    placeholder="Enter secret security phrase"
                    autoComplete="off"
                    required
                    value={adminSecurityPhrase}
                    onChange={(e) => setAdminSecurityPhrase(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary-technical"
                style={{ width: '100%', padding: '14px 20px', backgroundColor: 'var(--agri-ink)' }}
                disabled={adminLoading}
              >
                {adminLoading ? (
                  <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> AUTHENTICATING...</span>
                ) : (
                  <span><i className="fa-solid fa-shield-halved" style={{ marginRight: '8px' }}></i> VERIFY 4-FACTOR AUTH & SIGN IN</span>
                )}
              </button>

              <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--agri-line)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono-meta" style={{ fontSize: '10px', color: 'var(--agri-muted)' }}>
                  CLI PROVISIONED
                </span>
                <span className="mono-meta" style={{ fontSize: '10px', color: 'var(--agri-accent)' }}>
                  4-FACTOR ROOT CONSOLE
                </span>
              </div>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}
