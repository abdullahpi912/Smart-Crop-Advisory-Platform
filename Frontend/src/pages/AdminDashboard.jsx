import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/apiConfig';

const BACKEND = API_BASE_URL;

export default function AdminDashboard({ showToast }) {
  const navigate = useNavigate();

  // Active Tab: 'login_logs' | 'prediction_logs' | 'users' | 'models'
  const [activeTab, setActiveTab] = useState('login_logs');
  const [adminUser, setAdminUser] = useState('Admin');
  const [loading, setLoading] = useState(true);

  // ── Tab 1: Login Logs State ───────────────────────────────────────────────
  const [loginLogs, setLoginLogs] = useState([]);
  const [loginSearch, setLoginSearch] = useState('');
  const [loginFilterType, setLoginFilterType] = useState('all'); // 'all' | 'farmer' | 'admin'
  const [loginLogsLoading, setLoginLogsLoading] = useState(false);

  // ── Tab 2: Prediction Logs State ──────────────────────────────────────────
  const [predictionLogs, setPredictionLogs] = useState([]);
  const [predSearch, setPredSearch] = useState('');
  const [predFilterType, setPredFilterType] = useState('all');
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [predLogsLoading, setPredLogsLoading] = useState(false);

  // ── Tab 3: User Accounts State ────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // User Modals State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserData, setCreateUserData] = useState({ username: '', password: '', fullname: '', email: '', phone: '', region: '' });
  const [createUserLoading, setCreateUserLoading] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: '', fullname: '', email: '', phone: '', region: '', new_password: '' });
  const [editUserLoading, setEditUserLoading] = useState(false);

  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  // ── Tab 4: Model Tools Interactive Console ────────────────────────────────
  const [modelMode, setModelMode] = useState('crop'); // 'crop' | 'fertilizer' | 'yield'
  const [modelOptions, setModelOptions] = useState({ fertilizer: { districts: [], soilColors: [], crops: [] }, yield: { states: [], seasons: [], crops: [] } });

  // Model Form States
  const [cropInputs, setCropInputs] = useState({ nitrogen: 90, phosphorus: 42, potassium: 43, temperature: 26.5, humidity: 80, ph: 6.5, rainfall: 202 });
  const [fertInputs, setFertInputs] = useState({ district_name: 'Kolhapur', soil_color: 'Black', crop: 'Sugarcane', nitrogen: 50, phosphorus: 25, potassium: 30, ph: 6.5, rainfall: 120, temperature: 28 });
  const [yieldInputs, setYieldInputs] = useState({ state_name: 'Maharashtra', season: 'Kharif', crop: 'Rice', crop_year: 2024, area: 2.5 });

  const [modelResult, setModelResult] = useState(null);
  const [modelRunning, setModelRunning] = useState(false);

  // ── 1. Initial Authentication & Session Check ─────────────────────────────
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/admin/session-check`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && data.authenticated) {
          setAdminUser(data.admin_username || 'Admin');
          setLoading(false);
          fetchTabContent(activeTab);
          fetchModelOptions();
        } else {
          showToast?.('Admin session required. Redirecting to sign in...', 'warning');
          navigate('/login');
        }
      } catch (err) {
        showToast?.('Unable to verify admin session.', 'error');
        navigate('/login');
      }
    };
    checkAdminSession();
  }, []);

  // ── Admin Logout Handler ──────────────────────────────────────────────────
  const handleAdminLogout = async () => {
    try {
      await fetch(`${BACKEND}/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) { }
    try {
      sessionStorage.removeItem('cropling_admin');
    } catch (e) { }
    showToast?.('Signed out of Administrator console.', 'info');
    navigate('/login');
  };

  // Fetch model options for Tab 4
  const fetchModelOptions = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/options`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setModelOptions({
          fertilizer: data.fertilizer || { districts: [], soilColors: [], crops: [] },
          yield: data.yield || { states: [], seasons: [], crops: [] }
        });
        if (data.fertilizer?.districts?.length) {
          setFertInputs(prev => ({
            ...prev,
            district_name: data.fertilizer.districts[0],
            soil_color: data.fertilizer.soilColors[0],
            crop: data.fertilizer.crops[0]
          }));
        }
        if (data.yield?.states?.length) {
          setYieldInputs(prev => ({
            ...prev,
            state_name: data.yield.states[0],
            season: data.yield.seasons[0],
            crop: data.yield.crops[0]
          }));
        }
      }
    } catch (e) { }
  };

  // ── 2. Tab Data Fetching ──────────────────────────────────────────────────
  const fetchTabContent = (tab) => {
    if (tab === 'login_logs') fetchLoginLogs();
    if (tab === 'prediction_logs') fetchPredictionLogs();
    if (tab === 'users') fetchUsers();
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    fetchTabContent(newTab);
  };

  // ── Fetch Login Logs ──
  const fetchLoginLogs = async () => {
    setLoginLogsLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/login-logs`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setLoginLogs(data.logs || []);
      } else {
        showToast?.(data.error || 'Failed to fetch login logs', 'error');
      }
    } catch (err) {
      showToast?.('Network error fetching login audit logs', 'error');
    } finally {
      setLoginLogsLoading(false);
    }
  };

  // ── Fetch Prediction Logs ──
  const fetchPredictionLogs = async () => {
    setPredLogsLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/prediction-logs`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setPredictionLogs(data.logs || []);
      } else {
        showToast?.(data.error || 'Failed to fetch prediction telemetry', 'error');
      }
    } catch (err) {
      showToast?.('Network error fetching prediction logs', 'error');
    } finally {
      setPredLogsLoading(false);
    }
  };

  // ── Fetch Users ──
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/users`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        showToast?.(data.error || 'Failed to fetch farmer accounts', 'error');
      }
    } catch (err) {
      showToast?.('Network error fetching users', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  // ── 4. Account CRUD Handlers ──────────────────────────────────────────────
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setCreateUserLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createUserData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast?.(data.message || 'Farmer account created successfully!', 'success');
        setShowCreateUserModal(false);
        setCreateUserData({ username: '', password: '', fullname: '', email: '', phone: '', region: '' });
        fetchUsers();
      } else {
        showToast?.(data.error || 'Failed to create user account.', 'error');
      }
    } catch (e) {
      showToast?.('Network error creating user.', 'error');
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditUserLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editUserData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast?.(data.message || 'Account updated successfully!', 'success');
        setEditingUser(null);
        fetchUsers();
      } else {
        showToast?.(data.error || 'Failed to update account.', 'error');
      }
    } catch (e) {
      showToast?.('Network error updating account.', 'error');
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleDeleteUserSubmit = async () => {
    if (!deletingUser) return;
    setDeleteUserLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        showToast?.(data.message || 'Account deleted successfully.', 'info');
        setDeletingUser(null);
        fetchUsers();
      } else {
        showToast?.(data.error || 'Failed to delete account.', 'error');
      }
    } catch (e) {
      showToast?.('Network error deleting account.', 'error');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  // ── 5. Model Run Execution ────────────────────────────────────────────────
  const handleExecuteModel = async (e) => {
    e.preventDefault();
    setModelRunning(true);
    setModelResult(null);

    let endpoint = `${BACKEND}/api/predict`;
    let payload = {};

    if (modelMode === 'crop') {
      endpoint = `${BACKEND}/api/predict`;
      payload = cropInputs;
    } else if (modelMode === 'fertilizer') {
      endpoint = `${BACKEND}/api/predict/fertilizer`;
      payload = fertInputs;
    } else if (modelMode === 'yield') {
      endpoint = `${BACKEND}/api/predict/yield`;
      payload = yieldInputs;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setModelResult(data);
        showToast?.('Model executed successfully.', 'success');
      } else {
        showToast?.(data.error || 'Model execution returned error.', 'error');
      }
    } catch (err) {
      showToast?.('Network error executing model.', 'error');
    } finally {
      setModelRunning(false);
    }
  };

  // ── Filtered Data Lists ───────────────────────────────────────────────────
  const filteredLoginLogs = loginLogs.filter(log => {
    const matchesSearch = log.account_name.toLowerCase().includes(loginSearch.toLowerCase());
    const matchesType = loginFilterType === 'all' || log.account_type === loginFilterType;
    return matchesSearch && matchesType;
  });

  const filteredPredictionLogs = predictionLogs.filter(log => {
    const matchesSearch = (log.username || '').toLowerCase().includes(predSearch.toLowerCase()) ||
                          (log.logId || '').toLowerCase().includes(predSearch.toLowerCase()) ||
                          (log.recommendedItem || '').toLowerCase().includes(predSearch.toLowerCase()) ||
                          (log.type || '').toLowerCase().includes(predSearch.toLowerCase());
    const matchesType = predFilterType === 'all' ||
                        (predFilterType === 'crop' && (log.type || '').includes('Crop Match')) ||
                        (predFilterType === 'fertilizer' && (log.type || '').includes('Fertilizer')) ||
                        (predFilterType === 'yield' && (log.type || '').includes('Yield'));
    return matchesSearch && matchesType;
  });

  const filteredUsers = users.filter(u => {
    return (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
           (u.fullname || '').toLowerCase().includes(userSearch.toLowerCase()) ||
           (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
           (u.region || '').toLowerCase().includes(userSearch.toLowerCase());
  });

  if (loading) {
    return (
      <main style={{ padding: 'calc(var(--nav-height) + 4rem) 2rem', textAlign: 'center' }}>
        <div style={{ padding: '3rem', fontFamily: 'var(--font-mono)', color: 'var(--agri-secondary)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> VERIFYING OPERATOR PRIVILEGES...
        </div>
      </main>
    );
  }

  return (
    <div className="admin-dashboard-layout" style={{ display: 'flex', minHeight: 'calc(100vh - var(--nav-height, 60px))', paddingTop: 'var(--nav-height, 60px)' }}>
      
      {/* ══════════════════════════════════════════════════════════════════════
          FIXED ADMIN SIDEBAR (No general farmer links)
      ══════════════════════════════════════════════════════════════════════ */}
      <aside
        className="admin-sidebar"
        style={{
          position: 'fixed',
          top: 'var(--nav-height, 60px)',
          left: 0,
          bottom: 0,
          width: '280px',
          backgroundColor: 'var(--agri-surface)',
          borderRight: '1px solid var(--agri-line-strong)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem 1.2rem',
          zIndex: 40,
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}
      >
        <div>
          {/* Admin Header Monogram */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--agri-line)' }}>
            <span className="cl-logo-badge" style={{ width: '38px', height: '38px', fontSize: '13px', borderRadius: '8px' }}>CL</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '-0.02em', color: 'var(--agri-ink)' }}>Cropling Admin</div>
              <div className="mono-meta" style={{ fontSize: '9px', color: 'var(--agri-accent)', letterSpacing: '0.04em' }}>COMMAND CONSOLE</div>
            </div>
          </div>

          {/* SysAdmin Operator Status Card */}
          <div style={{
            padding: '0.85rem',
            backgroundColor: 'var(--agri-surface-soft, rgba(0,0,0,0.02))',
            border: '1px solid var(--agri-line)',
            borderRadius: '6px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="mono-meta" style={{ fontSize: '9px' }}>OPERATOR</span>
              <span style={{ fontSize: '9px', color: 'var(--agri-accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--agri-accent)' }}></span> LIVE
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--agri-ink)' }}>{adminUser}</div>
            <div className="mono-meta" style={{ fontSize: '9px', color: 'var(--agri-muted)', marginTop: '2px' }}>ROOT ADMINISTRATOR</div>
          </div>

          {/* 4 Admin Navigation Tools */}
          <div style={{ marginBottom: '1rem' }}>
            <div className="mono-meta" style={{ fontSize: '9px', color: 'var(--agri-muted)', marginBottom: '0.6rem', paddingLeft: '0.4rem', letterSpacing: '0.06em' }}>
              CONSOLE TOOLS
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              
              {/* Tab 1: Login Audit Logs */}
              <button
                type="button"
                onClick={() => handleTabChange('login_logs')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: activeTab === 'login_logs' ? '1px solid var(--agri-accent)' : '1px solid transparent',
                  backgroundColor: activeTab === 'login_logs' ? 'var(--agri-accent-dim, rgba(21,128,61,0.08))' : 'transparent',
                  color: activeTab === 'login_logs' ? 'var(--agri-accent)' : 'var(--agri-ink)',
                  fontWeight: activeTab === 'login_logs' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-shield-halved" style={{ width: '16px', textAlign: 'center' }}></i>
                  <span>Login Audit Logs</span>
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'login_logs' ? 'var(--agri-accent)' : 'var(--agri-line)',
                  color: activeTab === 'login_logs' ? '#fff' : 'var(--agri-secondary)'
                }}>
                  {loginLogs.length}
                </span>
              </button>

              {/* Tab 2: Prediction Telemetry */}
              <button
                type="button"
                onClick={() => handleTabChange('prediction_logs')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: activeTab === 'prediction_logs' ? '1px solid var(--agri-accent)' : '1px solid transparent',
                  backgroundColor: activeTab === 'prediction_logs' ? 'var(--agri-accent-dim, rgba(21,128,61,0.08))' : 'transparent',
                  color: activeTab === 'prediction_logs' ? 'var(--agri-accent)' : 'var(--agri-ink)',
                  fontWeight: activeTab === 'prediction_logs' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-chart-pie" style={{ width: '16px', textAlign: 'center' }}></i>
                  <span>Prediction Telemetry</span>
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'prediction_logs' ? 'var(--agri-accent)' : 'var(--agri-line)',
                  color: activeTab === 'prediction_logs' ? '#fff' : 'var(--agri-secondary)'
                }}>
                  {predictionLogs.length}
                </span>
              </button>

              {/* Tab 3: Farmer Registry */}
              <button
                type="button"
                onClick={() => handleTabChange('users')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: activeTab === 'users' ? '1px solid var(--agri-accent)' : '1px solid transparent',
                  backgroundColor: activeTab === 'users' ? 'var(--agri-accent-dim, rgba(21,128,61,0.08))' : 'transparent',
                  color: activeTab === 'users' ? 'var(--agri-accent)' : 'var(--agri-ink)',
                  fontWeight: activeTab === 'users' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-users" style={{ width: '16px', textAlign: 'center' }}></i>
                  <span>Farmer Registry</span>
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'users' ? 'var(--agri-accent)' : 'var(--agri-line)',
                  color: activeTab === 'users' ? '#fff' : 'var(--agri-secondary)'
                }}>
                  {users.length}
                </span>
              </button>

              {/* Tab 4: Model Testing Console */}
              <button
                type="button"
                onClick={() => handleTabChange('models')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: activeTab === 'models' ? '1px solid var(--agri-accent)' : '1px solid transparent',
                  backgroundColor: activeTab === 'models' ? 'var(--agri-accent-dim, rgba(21,128,61,0.08))' : 'transparent',
                  color: activeTab === 'models' ? 'var(--agri-accent)' : 'var(--agri-ink)',
                  fontWeight: activeTab === 'models' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-terminal" style={{ width: '16px', textAlign: 'center' }}></i>
                  <span>Model Console</span>
                </div>
                <span className="mono-meta" style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--agri-accent)',
                  color: '#fff'
                }}>
                  AI
                </span>
              </button>

            </nav>
          </div>
        </div>

        {/* Sidebar Bottom Controls */}
        <div style={{ borderTop: '1px solid var(--agri-line)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => fetchTabContent(activeTab)}
            className="btn-secondary-technical"
            style={{ width: '100%', padding: '9px 12px', fontSize: '11px', justifyContent: 'center' }}
            title="Refresh current dataset"
          >
            <i className="fa-solid fa-arrows-rotate" style={{ marginRight: '6px' }}></i> REFRESH DATA
          </button>

          <button
            type="button"
            onClick={handleAdminLogout}
            className="btn-danger-technical"
            style={{ width: '100%', padding: '9px 12px', fontSize: '11px', justifyContent: 'center' }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: '6px' }}></i> EXIT ROOT
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════════════════════════ */}
      <main
        className="admin-main-content"
        style={{
          marginLeft: '280px',
          flex: 1,
          padding: '2rem 3rem 5rem 3rem',
          maxWidth: 'calc(100vw - 280px)',
          boxSizing: 'border-box'
        }}
      >
        {/* Active Tool Header Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--agri-line-strong)',
          paddingBottom: '1.25rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div className="section-meta-row" style={{ marginBottom: '0.25rem' }}>
              <span className="mono-accent">ROOT CONSOLE // TOOL 0{
                activeTab === 'login_logs' ? '1' : activeTab === 'prediction_logs' ? '2' : activeTab === 'users' ? '3' : '4'
              }</span>
              <div className="section-meta-rule" style={{ maxWidth: '24px' }}></div>
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>OPERATOR: {adminUser.toUpperCase()}</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--agri-ink)', margin: 0 }}>
              {activeTab === 'login_logs' && 'Login Audit Logs'}
              {activeTab === 'prediction_logs' && 'Prediction Telemetry & Advisory History'}
              {activeTab === 'users' && 'Farmer Registry Management'}
              {activeTab === 'models' && 'Model Testing & Verification Console'}
            </h1>
          </div>
        </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: LOGIN AUDIT LOGS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'login_logs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '500px' }}>
              <input
                type="text"
                placeholder="Search account name..."
                value={loginSearch}
                onChange={(e) => setLoginSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--agri-line-strong)',
                  backgroundColor: 'var(--agri-surface)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}
              />
              <select
                value={loginFilterType}
                onChange={(e) => setLoginFilterType(e.target.value)}
                style={{
                  width: '130px',
                  padding: '8px',
                  border: '1px solid var(--agri-line-strong)',
                  backgroundColor: 'var(--agri-surface)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}
              >
                <option value="all">All Accounts</option>
                <option value="farmer">Farmer Only</option>
                <option value="admin">Admin Only</option>
              </select>
            </div>
            <span className="mono-meta">
              SHOWING {filteredLoginLogs.length} OF {loginLogs.length} ATTEMPTS
            </span>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--agri-line-strong)', backgroundColor: 'var(--agri-surface)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--agri-line-strong)', backgroundColor: 'var(--agri-canvas)' }}>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>ID</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>ACCOUNT NAME</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>TYPE</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {loginLogsLoading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--agri-secondary)' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Loading audit stream...
                    </td>
                  </tr>
                ) : filteredLoginLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--agri-secondary)', fontFamily: 'var(--font-mono)' }}>
                      NO LOGIN ATTEMPTS RECORDED MATCHING FILTER.
                    </td>
                  </tr>
                ) : (
                  filteredLoginLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--agri-line)' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--agri-secondary)', fontSize: '11px' }}>
                        #{log.id}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--agri-ink)' }}>
                        {log.account_name}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '2px',
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          backgroundColor: log.account_type === 'admin' ? 'var(--agri-danger-dim)' : 'var(--agri-surface-soft)',
                          color: log.account_type === 'admin' ? 'var(--agri-danger)' : 'var(--agri-accent)',
                          border: `1px solid ${log.account_type === 'admin' ? 'var(--agri-danger)' : 'var(--agri-line-strong)'}`
                        }}>
                          {log.account_type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {log.success ? (
                          <span style={{ color: 'var(--agri-accent)', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>
                            <i className="fa-solid fa-circle-check" style={{ marginRight: '4px' }}></i> SUCCESS
                          </span>
                        ) : (
                          <span style={{ color: 'var(--agri-danger)', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>
                            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '4px' }}></i> REJECTED
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--agri-secondary)', fontSize: '11px' }}>
                        {log.attempted_at}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: PREDICTION TELEMETRY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'prediction_logs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '500px' }}>
              <input
                type="text"
                placeholder="Search log ID, username, or recommended item..."
                value={predSearch}
                onChange={(e) => setPredSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--agri-line-strong)',
                  backgroundColor: 'var(--agri-surface)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}
              />
              <select
                value={predFilterType}
                onChange={(e) => setPredFilterType(e.target.value)}
                style={{
                  width: '140px',
                  padding: '8px',
                  border: '1px solid var(--agri-line-strong)',
                  backgroundColor: 'var(--agri-surface)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}
              >
                <option value="all">All Models</option>
                <option value="crop">Crop Match</option>
                <option value="fertilizer">Fertilizer</option>
                <option value="yield">Yield Forecast</option>
              </select>
            </div>
            <span className="mono-meta">
              TOTAL LOGGED: {filteredPredictionLogs.length} RECORDS
            </span>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--agri-line-strong)', backgroundColor: 'var(--agri-surface)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--agri-line-strong)', backgroundColor: 'var(--agri-canvas)' }}>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>LOG ID</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>USER / INITIATOR</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>MODEL TYPE</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>RECOMMENDED ITEM</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>CONFIDENCE</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>TIMESTAMP</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {predLogsLoading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--agri-secondary)' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Loading prediction telemetry...
                    </td>
                  </tr>
                ) : filteredPredictionLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--agri-secondary)', fontFamily: 'var(--font-mono)' }}>
                      NO PREDICTION RECORDS FOUND.
                    </td>
                  </tr>
                ) : (
                  filteredPredictionLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--agri-line)' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--agri-accent)', fontSize: '11px', fontWeight: 700 }}>
                        {log.logId}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--agri-ink)' }}>
                        {log.username}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '2px',
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          backgroundColor: log.type?.includes('Fertilizer') ? 'var(--agri-warning-dim, #fff8e1)' :
                                           log.type?.includes('Yield') ? 'var(--agri-info-dim, #e8f4fd)' : 'var(--agri-accent-dim)',
                          color: log.type?.includes('Fertilizer') ? 'var(--agri-warning, #b78103)' :
                                 log.type?.includes('Yield') ? 'var(--agri-info, #0288d1)' : 'var(--agri-accent)',
                          border: '1px solid var(--agri-line)'
                        }}>
                          {log.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--agri-ink)' }}>
                        {log.recommendedItem}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {log.confidence}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--agri-secondary)', fontSize: '11px' }}>
                        {log.timestamp}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedLogDetail(log)}
                          className="btn-secondary-technical"
                          style={{ padding: '4px 10px', fontSize: '10px' }}
                        >
                          VIEW JSON
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Detailed Log Modal Portal */}
          {selectedLogDetail && (
            <div className="modal-backdrop-technical" onClick={() => setSelectedLogDetail(null)}>
              <div className="modal-dialog-technical" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-technical">
                  <div>
                    <span className="mono-accent">LOG INSPECTOR // {selectedLogDetail.logId}</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
                      {selectedLogDetail.recommendedItem}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedLogDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--agri-ink)', fontSize: '1.2rem' }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--agri-line)', backgroundColor: 'var(--agri-canvas)' }}>
                      <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>INITIATING USER</span>
                      <strong>{selectedLogDetail.username}</strong>
                    </div>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--agri-line)', backgroundColor: 'var(--agri-canvas)' }}>
                      <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>CATEGORY</span>
                      <strong>{selectedLogDetail.category}</strong>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>ADVISORY / DOSAGE ADVICE</span>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--agri-ink)', lineHeight: 1.4 }}>
                      {selectedLogDetail.dosageAdvice}
                    </p>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>TELEMETRY INPUTS (JSON)</span>
                    <pre style={{
                      padding: '1rem',
                      backgroundColor: 'var(--agri-canvas)',
                      border: '1px solid var(--agri-line-strong)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      overflowX: 'auto',
                      maxHeight: '220px'
                    }}>
                      {JSON.stringify(selectedLogDetail.inputs, null, 2)}
                    </pre>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setSelectedLogDetail(null)} className="btn-primary-technical" style={{ padding: '8px 18px' }}>
                      CLOSE INSPECTOR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: FARMER REGISTRY & ACCOUNT MANAGEMENT
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '450px' }}>
              <input
                type="text"
                placeholder="Search by username, name, email, or location..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--agri-line-strong)',
                  backgroundColor: 'var(--agri-surface)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowCreateUserModal(true)}
              className="btn-primary-technical"
              style={{ padding: '10px 18px', fontSize: '11px' }}
            >
              <i className="fa-solid fa-user-plus" style={{ marginRight: '6px' }}></i> PROVISION FARMER ACCOUNT
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--agri-line-strong)', backgroundColor: 'var(--agri-surface)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--agri-line-strong)', backgroundColor: 'var(--agri-canvas)' }}>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>ID</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>USERNAME</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>FULL NAME</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>EMAIL</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>MOBILE</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>LOCATION</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>JOINED</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--agri-muted)' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--agri-secondary)' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Loading farmer accounts...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--agri-secondary)', fontFamily: 'var(--font-mono)' }}>
                      NO FARMER ACCOUNTS FOUND IN REGISTRY.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--agri-line)' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--agri-secondary)', fontSize: '11px' }}>
                        #{u.id}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--agri-accent)' }}>
                        {u.username}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--agri-ink)' }}>
                        {u.fullname || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--agri-secondary)', fontSize: '12px' }}>
                        {u.email || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {u.phone || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                        {u.region || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--agri-muted)', fontSize: '11px' }}>
                        {u.created_at?.split(' ')[0] || u.created_at}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(u);
                              setEditUserData({
                                username: u.username,
                                fullname: u.fullname || '',
                                email: u.email || '',
                                phone: u.phone || '',
                                region: u.region || '',
                                new_password: ''
                              });
                            }}
                            className="btn-secondary-technical"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            title="Edit profile details or reset password"
                          >
                            <i className="fa-solid fa-pen"></i> EDIT
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            className="btn-danger-technical"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            title="Permanently delete account"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal: Create Farmer Account */}
          {showCreateUserModal && (
            <div className="modal-backdrop-technical" onClick={() => setShowCreateUserModal(false)}>
              <div className="modal-dialog-technical" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-technical">
                  <div>
                    <span className="mono-accent">REGISTRY // NEW PROVISION</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>Create Farmer Account</h3>
                  </div>
                  <button onClick={() => setShowCreateUserModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--agri-ink)', fontSize: '1.2rem' }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <form onSubmit={handleCreateUserSubmit} style={{ padding: '1.75rem' }}>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. farmer_rajesh"
                      value={createUserData.username}
                      onChange={(e) => setCreateUserData({ ...createUserData, username: e.target.value })}
                    />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Initial Password (min 6 chars) *</label>
                    <input
                      type="password"
                      required
                      placeholder="Set account password"
                      value={createUserData.password}
                      onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                    />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={createUserData.fullname}
                      onChange={(e) => setCreateUserData({ ...createUserData, fullname: e.target.value })}
                    />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. rajesh@field.in"
                      value={createUserData.email}
                      onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                    />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={createUserData.phone}
                      onChange={(e) => setCreateUserData({ ...createUserData, phone: e.target.value })}
                    />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1.5rem' }}>
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Palakkad District"
                      value={createUserData.region}
                      onChange={(e) => setCreateUserData({ ...createUserData, region: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" onClick={() => setShowCreateUserModal(false)} className="btn-secondary-technical" style={{ padding: '8px 16px' }}>Cancel</button>
                    <button type="submit" disabled={createUserLoading} className="btn-primary-technical" style={{ padding: '8px 20px' }}>
                      {createUserLoading ? 'Creating Account...' : 'Provision Account'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Farmer Account & Reset Password */}
          {editingUser && (
            <div className="modal-backdrop-technical" onClick={() => setEditingUser(null)}>
              <div className="modal-dialog-technical" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-technical">
                  <div>
                    <span className="mono-accent">ACCOUNT CONFIG // ID #{editingUser.id}</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>Edit Farmer Profile</h3>
                  </div>
                  <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--agri-ink)', fontSize: '1.2rem' }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <form onSubmit={handleEditUserSubmit} style={{ padding: '1.75rem' }}>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Username</label>
                    <input
                      type="text"
                      required
                      value={editUserData.username}
                      onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                    />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editUserData.fullname}
                      onChange={(e) => setEditUserData({ ...editUserData, fullname: e.target.value })}
                    />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={editUserData.email}
                      onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      value={editUserData.phone}
                      onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                    />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>Location</label>
                    <input
                      type="text"
                      value={editUserData.region}
                      onChange={(e) => setEditUserData({ ...editUserData, region: e.target.value })}
                    />
                  </div>
                  <div className="console-field" style={{ marginBottom: '1.5rem', borderTop: '1px dashed var(--agri-line-strong)', paddingTop: '1rem' }}>
                    <label style={{ color: 'var(--agri-accent)' }}>Reset Password (leave empty to keep current password)</label>
                    <input
                      type="password"
                      placeholder="Enter new password to override"
                      value={editUserData.new_password}
                      onChange={(e) => setEditUserData({ ...editUserData, new_password: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary-technical" style={{ padding: '8px 16px' }}>Cancel</button>
                    <button type="submit" disabled={editUserLoading} className="btn-primary-technical" style={{ padding: '8px 20px' }}>
                      {editUserLoading ? 'Saving Changes...' : 'Save Updates'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Delete Confirmation */}
          {deletingUser && (
            <div className="modal-backdrop-technical" onClick={() => setDeletingUser(null)}>
              <div className="modal-dialog-technical" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-technical">
                  <div>
                    <span className="mono-accent" style={{ color: 'var(--agri-danger)' }}>DANGER ZONE // PERMANENT DELETION</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px', color: 'var(--agri-danger)' }}>
                      Delete Farmer Account
                    </h3>
                  </div>
                  <button onClick={() => setDeletingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--agri-ink)', fontSize: '1.2rem' }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <div style={{ padding: '1.75rem' }}>
                  <p style={{ fontSize: '0.92rem', color: 'var(--agri-ink)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    Are you sure you want to permanently delete account <strong>'{deletingUser.username}'</strong> (ID #{deletingUser.id})?
                  </p>
                  <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--agri-danger)', backgroundColor: 'var(--agri-danger-dim)', marginBottom: '1.5rem', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--agri-danger)' }}>
                    CASCADE EFFECT: This will automatically remove all linked farm plot records, advisory recommendations, and advisory logs belonging to this farmer from MySQL.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" onClick={() => setDeletingUser(null)} className="btn-secondary-technical" style={{ padding: '8px 16px' }}>Cancel</button>
                    <button type="button" onClick={handleDeleteUserSubmit} disabled={deleteUserLoading} className="btn-danger-technical" style={{ padding: '8px 20px' }}>
                      {deleteUserLoading ? 'Deleting Account...' : 'Confirm Permanent Deletion'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4: MODEL TESTING CONSOLE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'models' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 450px) 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left: Interactive Input Form */}
          <div style={{ backgroundColor: 'var(--agri-surface)', border: '1px solid var(--agri-line-strong)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                className={`btn-secondary-technical ${modelMode === 'crop' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px 6px', fontSize: '11px', borderColor: modelMode === 'crop' ? 'var(--agri-accent)' : undefined }}
                onClick={() => { setModelMode('crop'); setModelResult(null); }}
              >
                CROP MATCH
              </button>
              <button
                type="button"
                className={`btn-secondary-technical ${modelMode === 'fertilizer' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px 6px', fontSize: '11px', borderColor: modelMode === 'fertilizer' ? 'var(--agri-accent)' : undefined }}
                onClick={() => { setModelMode('fertilizer'); setModelResult(null); }}
              >
                FERTILIZER
              </button>
              <button
                type="button"
                className={`btn-secondary-technical ${modelMode === 'yield' ? 'active' : ''}`}
                style={{ flex: 1, padding: '8px 6px', fontSize: '11px', borderColor: modelMode === 'yield' ? 'var(--agri-accent)' : undefined }}
                onClick={() => { setModelMode('yield'); setModelResult(null); }}
              >
                YIELD FORECAST
              </button>
            </div>

            <form onSubmit={handleExecuteModel}>
              {/* CROP RECOMMENDATION INPUTS */}
              {modelMode === 'crop' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div className="console-field">
                      <label>N (kg/ha)</label>
                      <input type="number" step="any" required value={cropInputs.nitrogen} onChange={(e) => setCropInputs({ ...cropInputs, nitrogen: e.target.value })} />
                    </div>
                    <div className="console-field">
                      <label>P (kg/ha)</label>
                      <input type="number" step="any" required value={cropInputs.phosphorus} onChange={(e) => setCropInputs({ ...cropInputs, phosphorus: e.target.value })} />
                    </div>
                    <div className="console-field">
                      <label>K (kg/ha)</label>
                      <input type="number" step="any" required value={cropInputs.potassium} onChange={(e) => setCropInputs({ ...cropInputs, potassium: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div className="console-field">
                      <label>Temp (°C)</label>
                      <input type="number" step="any" required value={cropInputs.temperature} onChange={(e) => setCropInputs({ ...cropInputs, temperature: e.target.value })} />
                    </div>
                    <div className="console-field">
                      <label>Humidity (%)</label>
                      <input type="number" step="any" required value={cropInputs.humidity} onChange={(e) => setCropInputs({ ...cropInputs, humidity: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div className="console-field">
                      <label>Soil pH</label>
                      <input type="number" step="any" required value={cropInputs.ph} onChange={(e) => setCropInputs({ ...cropInputs, ph: e.target.value })} />
                    </div>
                    <div className="console-field">
                      <label>Rainfall (mm)</label>
                      <input type="number" step="any" required value={cropInputs.rainfall} onChange={(e) => setCropInputs({ ...cropInputs, rainfall: e.target.value })} />
                    </div>
                  </div>
                </>
              )}

              {/* FERTILIZER RECOMMENDATION INPUTS */}
              {modelMode === 'fertilizer' && (
                <>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>District Name</label>
                    <select value={fertInputs.district_name} onChange={(e) => setFertInputs({ ...fertInputs, district_name: e.target.value })}>
                      {modelOptions.fertilizer.districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div className="console-field">
                      <label>Soil Color</label>
                      <select value={fertInputs.soil_color} onChange={(e) => setFertInputs({ ...fertInputs, soil_color: e.target.value })}>
                        {modelOptions.fertilizer.soilColors.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="console-field">
                      <label>Target Crop</label>
                      <select value={fertInputs.crop} onChange={(e) => setFertInputs({ ...fertInputs, crop: e.target.value })}>
                        {modelOptions.fertilizer.crops.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div className="console-field">
                      <label>N</label>
                      <input type="number" step="any" required value={fertInputs.nitrogen} onChange={(e) => setFertInputs({ ...fertInputs, nitrogen: e.target.value })} />
                    </div>
                    <div className="console-field">
                      <label>P</label>
                      <input type="number" step="any" required value={fertInputs.phosphorus} onChange={(e) => setFertInputs({ ...fertInputs, phosphorus: e.target.value })} />
                    </div>
                    <div className="console-field">
                      <label>K</label>
                      <input type="number" step="any" required value={fertInputs.potassium} onChange={(e) => setFertInputs({ ...fertInputs, potassium: e.target.value })} />
                    </div>
                  </div>
                </>
              )}

              {/* CROP YIELD PREDICTION INPUTS */}
              {modelMode === 'yield' && (
                <>
                  <div className="console-field" style={{ marginBottom: '1rem' }}>
                    <label>State Name</label>
                    <select value={yieldInputs.state_name} onChange={(e) => setYieldInputs({ ...yieldInputs, state_name: e.target.value })}>
                      {modelOptions.yield.states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div className="console-field">
                      <label>Season</label>
                      <select value={yieldInputs.season} onChange={(e) => setYieldInputs({ ...yieldInputs, season: e.target.value })}>
                        {modelOptions.yield.seasons.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="console-field">
                      <label>Crop</label>
                      <select value={yieldInputs.crop} onChange={(e) => setYieldInputs({ ...yieldInputs, crop: e.target.value })}>
                        {modelOptions.yield.crops.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div className="console-field">
                      <label>Crop Year</label>
                      <input type="number" required value={yieldInputs.crop_year} onChange={(e) => setYieldInputs({ ...yieldInputs, crop_year: e.target.value })} />
                    </div>
                    <div className="console-field">
                      <label>Area (Hectares)</label>
                      <input type="number" step="any" required value={yieldInputs.area} onChange={(e) => setYieldInputs({ ...yieldInputs, area: e.target.value })} />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn-primary-technical"
                style={{ width: '100%', padding: '12px 18px' }}
                disabled={modelRunning}
              >
                {modelRunning ? (
                  <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> RUNNING MODEL INFERENCE...</span>
                ) : (
                  <span><i className="fa-solid fa-play" style={{ marginRight: '6px' }}></i> RUN MODEL INFERENCE</span>
                )}
              </button>
            </form>
          </div>

          {/* Right: Real-Time Output Console */}
          <div style={{ backgroundColor: 'var(--agri-surface)', border: '1px solid var(--agri-line-strong)', padding: '1.75rem' }}>
            <span className="mono-accent">INFERENCE OUTPUT // TELEMETRY RESPONSE</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px', marginBottom: '1.25rem' }}>
              Execution Result
            </h3>

            {modelResult ? (
              <div>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--agri-canvas)', border: '1px solid var(--agri-line-strong)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>{modelResult.type || 'MODEL OUTPUT'}</span>
                    <span className="mono-meta">{modelResult.confidence || 'CONFIDENCE: OPTIMAL'}</span>
                  </div>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--agri-ink)', display: 'block', marginBottom: '0.5rem' }}>
                    {modelResult.recommendedItem || modelResult.fertilizer || `${modelResult.predicted_production_tonnes} Tonnes`}
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--agri-secondary)', lineHeight: 1.4 }}>
                    {modelResult.dosageAdvice || modelResult.detailedNotes}
                  </p>
                </div>

                <div>
                  <span className="mono-meta" style={{ display: 'block', marginBottom: '6px' }}>RAW JSON PAYLOAD:</span>
                  <pre style={{
                    padding: '1rem',
                    backgroundColor: 'var(--agri-canvas)',
                    border: '1px solid var(--agri-line)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    overflowX: 'auto',
                    maxHeight: '300px'
                  }}>
                    {JSON.stringify(modelResult, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--agri-muted)', fontFamily: 'var(--font-mono)' }}>
                <i className="fa-solid fa-terminal" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem', opacity: 0.5 }}></i>
                AWAITING PARAMETER SUBMISSION...
              </div>
            )}
          </div>

        </div>
      )}

      </main>
    </div>
  );
}
