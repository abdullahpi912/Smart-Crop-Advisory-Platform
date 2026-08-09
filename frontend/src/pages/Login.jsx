import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ showToast }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showToast?.('Please enter your username or email and password.', 'warning');
      return;
    }

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
        showToast?.(data.message || 'Successfully signed in!', 'success');
        try {
          localStorage.setItem('agrisense_session', JSON.stringify({
            userId: data.user_id,
            username: data.username
          }));
        } catch (e) {}
        navigate('/dashboard');
      } else {
        showToast?.(data.error || 'Invalid username or password.', 'error');
      }
    } catch (err) {
      console.error('Login connection error:', err);
      showToast?.('Network error: Unable to connect to Flask backend server.', 'error');
    }
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
                <label htmlFor="username">Username or Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="e.g. agrisense_user1 or farmer@example.com"
                    required
                    className="input-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <i className="fa-solid fa-user"></i>
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
