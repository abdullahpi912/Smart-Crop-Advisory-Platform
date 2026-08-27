import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { formatTimestamp } from '../lib/formatters';
import { API_BASE_URL } from '../lib/apiConfig';

const BACKEND = API_BASE_URL;

export default function Dashboard({ showToast }) {
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────
  const [history, setHistory]                   = useState([]);
  const [userProfile, setUserProfile]           = useState(null);

  // Edit-profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab]             = useState('info'); // 'info' | 'password' | 'delete'
  const [profileForm, setProfileForm]           = useState({ fullname: '', email: '', phone: '', region: '' });
  const [pwdForm, setPwdForm]                   = useState({ current: '', next: '', confirm: '' });
  const [delPwd, setDelPwd]                     = useState('');
  const [modalError, setModalError]             = useState('');
  const [modalLoading, setModalLoading]         = useState(false);

  // Edit-notes modal
  const [editingItem, setEditingItem]           = useState(null);
  const [noteText, setNoteText]                 = useState('');
  const [savingNotes, setSavingNotes]           = useState(false);

  // Clear-history modal
  const [showClearModal, setShowClearModal]     = useState(false);

  // ── Seed data ─────────────────────────────────────────────
  const defaultHistory = [
    {
      logId: '#LOG-8942',
      timestamp: '2026-07-24T14:30:00Z',
      npkSummary: 'N: 90.0 | P: 42.0 | K: 43.0',
      climateSummary: 'pH 6.5 | 202 mm | 26.5°C',
      type: 'Crop Match (ML)',
      badgeClass: 'badge-crop',
      recommendedItem: '🌾 Paddy Rice',
      confidence: '99.2%',
      inputs: { nitrogen: 90, phosphorus: 42, potassium: 43, temperature: 26.5, humidity: 80, ph: 6.5, rainfall: 202, mode: 'crop' }
    },
    {
      logId: '#LOG-8938',
      timestamp: '2026-07-22T16:45:00Z',
      npkSummary: 'N: 50.0 | P: 20.0 | K: 30.0',
      climateSummary: 'pH 6.5 | 120 mm | 28.0°C',
      type: 'Fertilizer Recommendation (ML)',
      badgeClass: 'badge-fertilizer',
      recommendedItem: '12:32:16 NPK',
      confidence: '96.4%',
      inputs: { district_name: 'Kolhapur', soil_color: 'Black', crop: 'Sugarcane', nitrogen: 50, phosphorus: 20, potassium: 30, ph: 6.5, rainfall: 120, temperature: 28, mode: 'fertilizer' }
    },
    {
      logId: '#LOG-8935',
      timestamp: '2026-07-19T11:20:00Z',
      npkSummary: 'Area: 10.0 ha | Year: 2024',
      climateSummary: 'State: Maharashtra | Season: Kharif',
      type: 'Crop Yield Prediction (ML)',
      badgeClass: 'badge-yield',
      recommendedItem: 'Rice: 24.50 Tonnes',
      confidence: 'ML Regressor',
      inputs: { state_name: 'Maharashtra', season: 'Kharif', crop: 'Rice', crop_year: 2024, area: 10.0, mode: 'yield' }
    }
  ];

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      // Load profile from localStorage first
      try {
        const stored = localStorage.getItem('cropling_user') || localStorage.getItem('agrisense_user') ||
                       localStorage.getItem('cropling_session') || localStorage.getItem('agrisense_session');
        if (stored) setUserProfile(JSON.parse(stored));
      } catch (_) {}

      // Refresh from backend
      try {
        const r = await fetch(`${BACKEND}/profile`, { credentials: 'include' });
        if (r.ok) {
          const d = await r.json();
          if (d.user) {
            setUserProfile(d.user);
            localStorage.setItem('cropling_user', JSON.stringify(d.user));
            localStorage.setItem('agrisense_user', JSON.stringify(d.user));
          }
        }
      } catch (_) {}

      // Load history
      try {
        const r = await fetch(`${BACKEND}/api/recommendations`, { credentials: 'include' });
        if (r.ok) {
          const d = await r.json();
          if (d.recommendations?.length) {
            setHistory(d.recommendations);
            localStorage.setItem('cropling_history', JSON.stringify(d.recommendations));
            localStorage.setItem('agrisense_history', JSON.stringify(d.recommendations));
            return;
          }
        }
        const r2 = await fetch(`${BACKEND}/api/logs`, { credentials: 'include' });
        if (r2.ok) {
          const d2 = await r2.json();
          if (d2.logs?.length) {
            setHistory(d2.logs);
            localStorage.setItem('cropling_history', JSON.stringify(d2.logs));
            localStorage.setItem('agrisense_history', JSON.stringify(d2.logs));
            return;
          }
        }
      } catch (_) {}

      try {
        const cached = localStorage.getItem('cropling_history') || localStorage.getItem('agrisense_history');
        setHistory(cached ? JSON.parse(cached) : defaultHistory);
        if (!localStorage.getItem('cropling_history') && !localStorage.getItem('agrisense_history')) {
          localStorage.setItem('cropling_history', JSON.stringify(defaultHistory));
          localStorage.setItem('agrisense_history', JSON.stringify(defaultHistory));
        }
      } catch (_) { setHistory(defaultHistory); }
    };
    fetchData();
  }, []);

  // Sync profile form whenever userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        fullname: userProfile.fullname || userProfile.name || '',
        email:    userProfile.email || '',
        phone:    userProfile.phone || '',
        region:   userProfile.region || userProfile.location || ''
      });
    }
  }, [userProfile]);

  // ── Handlers ──────────────────────────────────────────────
  const openProfileModal = () => {
    setProfileTab('info');
    setModalError('');
    setPwdForm({ current: '', next: '', confirm: '' });
    setDelPwd('');
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setModalError('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setModalLoading(true); setModalError('');
    try {
      const r = await fetch(`${BACKEND}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullname: profileForm.fullname, email: profileForm.email, phone: profileForm.phone, region: profileForm.region })
      });
      const d = await r.json();
      if (r.ok) {
        const updated = d.user || { ...userProfile, ...profileForm };
        setUserProfile(updated);
        localStorage.setItem('cropling_user', JSON.stringify(updated));
        localStorage.setItem('agrisense_user', JSON.stringify(updated));
        showToast?.('Profile updated successfully!', 'success');
        closeProfileModal();
      } else {
        setModalError(d.error || 'Failed to update profile');
      }
    } catch (_) {
      const updated = { ...userProfile, ...profileForm };
      setUserProfile(updated);
      localStorage.setItem('cropling_user', JSON.stringify(updated));
      localStorage.setItem('agrisense_user', JSON.stringify(updated));
      showToast?.('Profile updated locally!', 'success');
      closeProfileModal();
    } finally { setModalLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setModalError('');
    if (pwdForm.next !== pwdForm.confirm) { setModalError('New passwords do not match'); return; }
    if (pwdForm.next.length < 6) { setModalError('New password must be at least 6 characters'); return; }
    setModalLoading(true);
    try {
      const r = await fetch(`${BACKEND}/api/user/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: pwdForm.current, newPassword: pwdForm.next })
      });
      const d = await r.json();
      if (r.ok) { showToast?.('Password changed successfully!', 'success'); closeProfileModal(); }
      else { setModalError(d.error || 'Current password is incorrect'); }
    } catch (_) { setModalError('Network error. Please try again.'); }
    finally { setModalLoading(false); }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!delPwd) { setModalError('Please enter your password to confirm deletion'); return; }
    setModalLoading(true); setModalError('');
    try {
      const r = await fetch(`${BACKEND}/api/user/account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: delPwd })
      });
      const d = await r.json();
      if (r.ok) {
        localStorage.removeItem('cropling_user');
        localStorage.removeItem('agrisense_user');
        localStorage.removeItem('cropling_history');
        localStorage.removeItem('agrisense_history');
        localStorage.removeItem('cropling_session');
        localStorage.removeItem('agrisense_session');
        showToast?.('Account permanently deleted.', 'info');
        closeProfileModal();
        navigate('/login');
      } else { setModalError(d.error || 'Incorrect password. Deletion cancelled.'); }
    } catch (_) { setModalError('Network error. Failed to delete account.'); }
    finally { setModalLoading(false); }
  };

  const handleDeleteItem = async (logId) => {
    const cleanId = (logId || '').replace('#', '');
    try {
      let r = await fetch(`${BACKEND}/api/recommendations/${cleanId}`, { method: 'DELETE', credentials: 'include' });
      if (!r.ok) await fetch(`${BACKEND}/api/logs/${cleanId}`, { method: 'DELETE', credentials: 'include' });
    } catch (_) {}
    const updated = history.filter(h => (h.logId || h.recId) !== logId);
    setHistory(updated);
    localStorage.setItem('cropling_history', JSON.stringify(updated));
    localStorage.setItem('agrisense_history', JSON.stringify(updated));
    showToast?.(`Removed advisory log ${logId}`, 'info');
  };

  const handleOpenEditNotes = (item) => {
    setEditingItem(item);
    setNoteText(item.notes || item.detailedNotes || item.dosageAdvice || '');
  };

  const handleSaveNotes = async () => {
    if (!editingItem) return;
    setSavingNotes(true);
    const itemId = editingItem.logId || editingItem.recId || '';
    const cleanId = itemId.replace('#', '');
    try {
      let r = await fetch(`${BACKEND}/api/recommendations/${cleanId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ notes: noteText }) });
      if (!r.ok) r = await fetch(`${BACKEND}/api/logs/${cleanId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ detailedNotes: noteText }) });
    } catch (_) {}
    const updated = history.map(h => (h.logId || h.recId) === itemId ? { ...h, notes: noteText, detailedNotes: noteText } : h);
    setHistory(updated);
    localStorage.setItem('cropling_history', JSON.stringify(updated));
    localStorage.setItem('agrisense_history', JSON.stringify(updated));
    showToast?.(`Agronomic notes saved for ${itemId}`, 'success');
    setEditingItem(null); setSavingNotes(false);
  };

  const handleRerun = (item) => {
    const itemInputs = item.inputs || {};
    const mode = itemInputs.mode || (item.type?.includes('Fertilizer') ? 'fertilizer' : (item.type?.includes('Yield') ? 'yield' : 'crop'));
    navigate('/recommend', { state: { ...itemInputs, mode } });
    showToast?.(`Rerunning ${mode.toUpperCase()} advisory for ${item.logId || item.recId}`, 'info');
  };

  const handleConfirmClear = async () => {
    try { await fetch(`${BACKEND}/api/logs`, { method: 'DELETE', credentials: 'include' }); } catch (_) {}
    setHistory([]);
    localStorage.removeItem('cropling_history');
    localStorage.removeItem('agrisense_history');
    showToast?.('History cleared successfully', 'info'); setShowClearModal(false);
  };

  const totalRuns = history.length;
  const topCropItem = history.length > 0 ? (history[0].recommendedItem || history[0].crop_name) : 'Paddy Rice';

  return (
    <>
      <main style={{ padding: 'calc(var(--nav-height) + 2rem) 0 5rem 0' }}>
        <div className="page-container">
          {/* Header */}
          <div className="section-header-editorial">
            <div className="section-meta-row">
              <span className="mono-accent">CONSOLE • DASHBOARD</span>
              <div className="section-meta-rule"></div>
              <span className="mono-meta">FARM INTELLIGENCE TELEMETRY</span>
            </div>
            <h1 className="section-title-large">Farm Dashboard &amp; Recommendation History</h1>
            <p className="section-desc-editorial">
              Review field soil chemical logs, track crop recommendations, fertilizer applications, and regional yield outputs across planting seasons.
            </p>
          </div>

          {/* Telemetry Summary Cards */}
          <div className="dashboard-telemetry-grid">
            {/* Active Plot Cell */}
            <div className="dashboard-stat-cell">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>PRIMARY PLOT</span>
                <button
                  type="button"
                  onClick={openProfileModal}
                  className="mono-meta"
                  style={{ background: 'none', border: '1px solid var(--agri-line)', padding: '3px 8px', cursor: 'pointer', borderRadius: '9999px' }}
                >
                  <i className="fa-solid fa-pen" style={{ marginRight: '4px' }}></i> EDIT
                </button>
              </div>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--agri-ink)', display: 'block', lineHeight: 1.1 }}>
                {userProfile?.fullname || 'Green Valley Plot A'}
              </strong>
              <span className="mono-meta" style={{ display: 'block', marginTop: '6px', color: 'var(--agri-muted)' }}>
                {userProfile?.region || 'Palakkad Agronomic Belt'}
              </span>
            </div>

            {/* Total Advisories */}
            <div className="dashboard-stat-cell">
              <span className="mono-meta" style={{ display: 'block', marginBottom: '0.75rem' }}>TOTAL ADVISORIES RUN</span>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--agri-ink)', lineHeight: 1 }}>
                {totalRuns}
              </strong>
              <span className="mono-meta" style={{ display: 'block', marginTop: '8px', color: 'var(--agri-accent)' }}>
                MULTI-MODEL TELEMETRY
              </span>
            </div>

            {/* Top Match */}
            <div className="dashboard-stat-cell">
              <span className="mono-meta" style={{ display: 'block', marginBottom: '0.75rem' }}>LATEST ADVISORY MATCH</span>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--agri-ink)', lineHeight: 1.1, display: 'block' }}>
                {topCropItem}
              </strong>
              <span className="mono-meta" style={{ display: 'block', marginTop: '6px', color: 'var(--agri-muted)' }}>
                AVG CONFIDENCE: 98.6%
              </span>
            </div>

            {/* Engine Telemetry */}
            <div className="dashboard-stat-cell">
              <span className="mono-meta" style={{ display: 'block', marginBottom: '0.75rem' }}>ADVISORY ENGINE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="pulse-indicator"></span>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--agri-ink)' }}>
                  OPERATIONAL
                </strong>
              </div>
              <span className="mono-meta" style={{ display: 'block', marginTop: '8px', color: 'var(--agri-accent)' }}>
                3 ML MODELS ONLINE
              </span>
            </div>
          </div>

          {/* History Telemetry Table */}
          <div className="console-panel" style={{ padding: 0 }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--agri-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="mono-accent">TELEMETRY LOGS</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '2px' }}>Soil, Fertilizer &amp; Yield Advisory History</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowClearModal(true)}
                    className="btn-secondary-technical"
                    style={{ padding: '8px 16px', fontSize: '11px' }}
                  >
                    <i className="fa-solid fa-trash-can"></i> CLEAR ALL
                  </button>
                )}
                <Link
                  to="/recommend"
                  className="btn-primary-technical"
                  style={{ padding: '8px 18px', fontSize: '11px' }}
                >
                  <i className="fa-solid fa-plus"></i> NEW ADVISORY
                </Link>
              </div>
            </div>

            <div className="dashboard-table-wrapper" style={{ border: 'none' }}>
              <table className="telemetry-table">
                <thead>
                  <tr>
                    <th>LOG ID</th>
                    <th>TIMESTAMP</th>
                    <th>PRIMARY VECTORS</th>
                    <th>LOCATION / CLIMATE</th>
                    <th>TYPE</th>
                    <th>RECOMMENDATION</th>
                    <th>CONFIDENCE</th>
                    <th style={{ textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((item, idx) => {
                      const badge = item.badgeClass || (
                        item.type?.includes('Fertilizer')
                          ? 'badge-fertilizer'
                          : (item.type?.includes('Yield') ? 'badge-yield' : 'badge-crop')
                      );

                      return (
                        <tr key={item.logId || item.recId || idx}>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--agri-accent)' }}>
                              {item.logId || item.recId || `#LOG-${8940 - idx}`}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', fontWeight: 600, color: 'var(--agri-secondary)' }}>
                              {formatTimestamp(item.timestamp || item.created_at)}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--agri-ink)' }}>
                              {item.npkSummary || `N:${item.nitrogen || 90} | P:${item.phosphorus || 42} | K:${item.potassium || 43}`}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--agri-secondary)' }}>
                              {item.climateSummary || `pH ${item.ph || 6.5} | ${item.rainfall || 202}mm`}
                            </span>
                          </td>
                          <td>
                            <span className={`mono-meta ${badge}`} style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', whiteSpace: 'nowrap' }}>
                              {item.type || 'Crop Match'}
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '14.5px', fontWeight: 700, color: 'var(--agri-ink)' }}>
                              {item.recommendedItem || item.fertilizer || item.crop_name}
                            </strong>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13.5px', fontWeight: 800, color: 'var(--agri-accent)' }}>
                              {item.confidence || '99.0%'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditNotes(item)}
                                title="Edit agronomic field notes"
                                style={{ background: 'none', border: '1px solid var(--agri-line)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', color: 'var(--agri-ink)' }}
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRerun(item)}
                                title="Rerun advisory with saved parameters"
                                style={{ background: 'none', border: '1px solid var(--agri-line)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', color: 'var(--agri-accent)' }}
                              >
                                <i className="fa-solid fa-rotate-right"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.logId || item.recId)}
                                title="Delete log record"
                                style={{ background: 'none', border: '1px solid var(--agri-line)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', color: 'var(--agri-danger)' }}
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--agri-muted)' }}>
                        <span className="mono-meta" style={{ display: 'block', marginBottom: '0.5rem' }}>NO HISTORY FOUND</span>
                        <span>No recommendation history logs available. </span>
                        <Link to="/recommend" style={{ color: 'var(--agri-accent)', fontWeight: 600 }}>Run your first advisory</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ── PORTAL: EDIT PROFILE MODAL ── */}
      {showProfileModal && ReactDOM.createPortal(
        <div className="modal-backdrop-technical" onClick={closeProfileModal}>
          <div className="modal-dialog-technical" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-technical">
              <div>
                <span className="mono-accent">PROFILE • CONFIG</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>Farm Account Settings</h3>
              </div>
              <button onClick={closeProfileModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--agri-ink)', fontSize: '1.2rem' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-tabs-technical">
              <button
                type="button"
                className={`modal-tab-btn-technical ${profileTab === 'info' ? 'active' : ''}`}
                onClick={() => { setProfileTab('info'); setModalError(''); }}
              >
                01 • EDIT INFO
              </button>
              <button
                type="button"
                className={`modal-tab-btn-technical ${profileTab === 'password' ? 'active' : ''}`}
                onClick={() => { setProfileTab('password'); setModalError(''); }}
              >
                02 • PASSWORD
              </button>
              <button
                type="button"
                className={`modal-tab-btn-technical ${profileTab === 'delete' ? 'active' : ''}`}
                onClick={() => { setProfileTab('delete'); setModalError(''); }}
                style={{ color: profileTab === 'delete' ? 'var(--agri-danger)' : undefined }}
              >
                03 • DANGER ZONE
              </button>
            </div>

            <div style={{ padding: '2rem' }}>
              {modalError && (
                <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--agri-danger)', backgroundColor: 'var(--agri-danger-dim)', color: 'var(--agri-danger)', marginBottom: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  ERROR: {modalError}
                </div>
              )}

              {profileTab === 'info' && (
                <form onSubmit={handleSaveProfile}>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Full Name</label>
                    <input type="text" required value={profileForm.fullname} onChange={(e) => setProfileForm({ ...profileForm, fullname: e.target.value })} />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Email Address</label>
                    <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Mobile Number</label>
                    <input type="tel" required value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1.5rem' }}>
                    <label>Location</label>
                    <input type="text" required value={profileForm.region} onChange={(e) => setProfileForm({ ...profileForm, region: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" onClick={closeProfileModal} className="btn-secondary-technical" style={{ padding: '8px 16px' }}>Cancel</button>
                    <button type="submit" disabled={modalLoading} className="btn-primary-technical" style={{ padding: '8px 20px' }}>
                      {modalLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              )}

              {profileTab === 'password' && (
                <form onSubmit={handleChangePassword}>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Current Password</label>
                    <input type="password" required value={pwdForm.current} onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>New Password (min 6 characters)</label>
                    <input type="password" required value={pwdForm.next} onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })} />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1.5rem' }}>
                    <label>Confirm New Password</label>
                    <input type="password" required value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" onClick={closeProfileModal} className="btn-secondary-technical" style={{ padding: '8px 16px' }}>Cancel</button>
                    <button type="submit" disabled={modalLoading} className="btn-primary-technical" style={{ padding: '8px 20px' }}>
                      {modalLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}

              {profileTab === 'delete' && (
                <form onSubmit={handleDeleteAccount}>
                  <div style={{ padding: '1rem', border: '1px solid var(--agri-danger)', backgroundColor: 'var(--agri-danger-dim)', marginBottom: '1.25rem' }}>
                    <span className="mono-meta" style={{ color: 'var(--agri-danger)', display: 'block', marginBottom: '4px' }}>PERMANENT ACTION</span>
                    <p style={{ fontSize: '0.88rem', color: 'var(--agri-ink)', lineHeight: 1.5 }}>
                      Deleting your account will remove your farm credentials, saved plots, and all historical recommendation telemetry from the database.
                    </p>
                  </div>
                  <div className="console-field" style={{ marginBottom: '1.5rem' }}>
                    <label>Enter Password to Confirm</label>
                    <input type="password" required value={delPwd} onChange={(e) => setDelPwd(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" onClick={closeProfileModal} className="btn-secondary-technical" style={{ padding: '8px 16px' }}>Cancel</button>
                    <button type="submit" disabled={modalLoading} className="btn-danger-technical" style={{ padding: '8px 20px' }}>
                      {modalLoading ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── PORTAL: EDIT NOTES MODAL ── */}
      {editingItem && ReactDOM.createPortal(
        <div className="modal-backdrop-technical" onClick={() => setEditingItem(null)}>
          <div className="modal-dialog-technical" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-technical">
              <div>
                <span className="mono-accent">{editingItem.logId || editingItem.recId}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>Update Field Notes</h3>
              </div>
              <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--agri-ink)' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div style={{ padding: '1.75rem' }}>
              <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                <label>Agronomic Notes &amp; Observations</label>
                <textarea
                  rows="4"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter custom field observations, soil adjustments, or harvest notes..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary-technical" style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="button" onClick={handleSaveNotes} disabled={savingNotes} className="btn-primary-technical" style={{ padding: '8px 20px' }}>
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── PORTAL: CLEAR HISTORY CONFIRM MODAL ── */}
      {showClearModal && ReactDOM.createPortal(
        <div className="modal-backdrop-technical" onClick={() => setShowClearModal(false)}>
          <div className="modal-dialog-technical" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-technical">
              <div>
                <span className="mono-meta" style={{ color: 'var(--agri-danger)' }}>DANGER • CLEAR DATA</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>Clear Advisory Logs?</h3>
              </div>
              <button onClick={() => setShowClearModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--agri-ink)' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div style={{ padding: '1.75rem' }}>
              <p style={{ fontSize: '0.92rem', color: 'var(--agri-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Are you sure you want to permanently clear all soil advisory history logs? This action cannot be reversed.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowClearModal(false)} className="btn-secondary-technical" style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="button" onClick={handleConfirmClear} className="btn-danger-technical" style={{ padding: '8px 20px' }}>Clear All History</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
