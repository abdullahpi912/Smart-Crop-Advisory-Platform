import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard({ showToast }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Default initial mock history items if none saved yet
  const defaultHistory = [
    {
      logId: '#LOG-8942',
      timestamp: '2026-07-24 14:30',
      npkSummary: 'N: 90 | P: 42 | K: 43',
      climateSummary: 'pH 6.5 | 202 mm | 26.5°C',
      type: 'Crop Match',
      badgeClass: 'badge-crop',
      recommendedItem: '🌾 Paddy Rice',
      confidence: '99.2%',
      inputs: { nitrogen: 90, phosphorus: 42, potassium: 43, temperature: 26.5, humidity: 80, ph: 6.5, rainfall: 202, mode: 'crop' }
    },
    {
      logId: '#LOG-8941',
      timestamp: '2026-07-22 09:15',
      npkSummary: 'N: 100 | P: 20 | K: 30',
      climateSummary: 'pH 5.8 | 1600 mm | 25.0°C',
      type: 'Crop Match',
      badgeClass: 'badge-crop',
      recommendedItem: '☕ Highland Coffee',
      confidence: '97.8%',
      inputs: { nitrogen: 100, phosphorus: 20, potassium: 30, temperature: 25.0, humidity: 75, ph: 5.8, rainfall: 1600, mode: 'crop' }
    },
    {
      logId: '#LOG-8938',
      timestamp: '2026-07-19 16:45',
      npkSummary: 'N: 35 | P: 40 | K: 35',
      climateSummary: 'pH 6.2 | 180 mm | 24.0°C',
      type: 'Fertilizer Match',
      badgeClass: 'badge-fertilizer',
      recommendedItem: 'Urea (46% Nitrogen Boost)',
      confidence: '98.8%',
      inputs: { nitrogen: 35, phosphorus: 40, potassium: 35, temperature: 24.0, humidity: 70, ph: 6.2, rainfall: 180, mode: 'fertilizer' }
    }
  ];

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('agrisense_user');
      if (storedUser) {
        setUserProfile(JSON.parse(storedUser));
      }

      const stored = localStorage.getItem('agrisense_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory(defaultHistory);
        localStorage.setItem('agrisense_history', JSON.stringify(defaultHistory));
      }
    } catch (err) {
      setHistory(defaultHistory);
    }
  }, []);

  const handleDeleteItem = (logId) => {
    const updated = history.filter((item) => item.logId !== logId);
    setHistory(updated);
    localStorage.setItem('agrisense_history', JSON.stringify(updated));
    showToast?.(`Removed log entry ${logId}`, 'info');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history records?')) {
      setHistory([]);
      localStorage.removeItem('agrisense_history');
      showToast?.('Recommendation history cleared', 'info');
    }
  };

  const handleRerun = (item) => {
    navigate('/recommend', { state: item.inputs });
    showToast?.(`Rerunning advisory for ${item.logId}`, 'info');
  };

  // Calculate dynamic stats
  const totalRuns = history.length;
  const topCropItem = history.length > 0 ? history[0].recommendedItem : 'Paddy Rice';

  return (
    <main>
      <section id="dashboard">
        <div className="section-header">
          <span className="section-tag"><i className="fa-solid fa-gauge-high"></i> Farm Advisory Dashboard</span>
          <h2 className="section-title">Farm Dashboard &amp; Recommendation History</h2>
          <p className="section-subtitle">
            Review your field soil chemical logs, track crop recommendation accuracy over time, and rerun past agricultural advisories.
          </p>
        </div>

        {/* Stats & Profile Overview Widgets */}
        <div className="dashboard-widgets-grid">
          <div className="widget-card profile-widget">
            <div className="widget-header">
              <span className="widget-badge"><i className="fa-solid fa-location-dot"></i> Primary Plot</span>
              <Link to="/register" className="widget-link"><i className="fa-solid fa-pen-to-square"></i> Edit Profile</Link>
            </div>
            <div className="profile-info-body">
              <h3>{userProfile?.fullname || 'Green Valley Plot A'}</h3>
              <p className="profile-meta"><i className="fa-solid fa-map"></i> {userProfile?.region || 'Palakkad Agronomic Belt, Kerala'}</p>
              <div className="profile-tags">
                <span className="tag"><i className="fa-solid fa-mound"></i> {userProfile?.soilType ? `${userProfile.soilType.toUpperCase()} Soil` : 'Clay-Loam Soil'}</span>
                {userProfile?.phone && <span className="tag"><i className="fa-solid fa-phone"></i> {userProfile.phone}</span>}
                <span className="tag"><i className="fa-solid fa-vial"></i> Active Season</span>
              </div>
            </div>
          </div>

          <div className="widget-card stat-widget">
            <div className="stat-icon" style={{ background: 'rgba(59, 110, 71, 0.15)', color: 'var(--primary-light)' }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div className="stat-details">
              <span className="stat-number">{totalRuns}</span>
              <span className="stat-label">Total Soil Advisories Run</span>
              <span className="stat-subtext"><i className="fa-solid fa-arrow-trend-up"></i> 100% Soil Data Match</span>
            </div>
          </div>

          <div className="widget-card stat-widget">
            <div className="stat-icon" style={{ background: 'rgba(217, 107, 67, 0.15)', color: 'var(--accent-terracotta)' }}>
              <i className="fa-solid fa-wheat-awn"></i>
            </div>
            <div className="stat-details">
              <span className="stat-number" style={{ fontSize: '1.25rem', fontWeight: 800 }}>{topCropItem}</span>
              <span className="stat-label">Top High-Yield Match</span>
              <span className="stat-subtext">99.2% Avg Confidence</span>
            </div>
          </div>

          <div className="widget-card stat-widget">
            <div className="stat-icon" style={{ background: 'rgba(229, 169, 60, 0.15)', color: 'var(--accent-gold)' }}>
              <i className="fa-solid fa-server"></i>
            </div>
            <div className="stat-details">
              <span className="stat-number" style={{ fontSize: '1.2rem', color: 'var(--primary-dark)' }}>AI Model Online</span>
              <span className="stat-label">Real-Time ML Engine</span>
              <span className="stat-subtext"><i className="fa-solid fa-circle-check"></i> Model Endpoint Ready</span>
            </div>
          </div>
        </div>

        {/* History Table Section */}
        <div className="history-card">
          <div className="history-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="history-title-group">
              <h3><i className="fa-solid fa-clock-rotate-left"></i> Soil Advisory History Log</h3>
              <p>Historical advisory logs saved to your secure farm profile.</p>
            </div>
            <div className="history-actions" style={{ display: 'flex', gap: '0.75rem' }}>
              {history.length > 0 && (
                <button type="button" className="btn-outline" onClick={handleClearHistory} style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}>
                  <i className="fa-solid fa-trash-can"></i> Clear All
                </button>
              )}
              <Link to="/recommend" className="btn btn-terracotta">
                <i className="fa-solid fa-plus"></i> Run New Advisory
              </Link>
            </div>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>Log ID</th>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>Date &amp; Time</th>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>Field NPK</th>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>pH / Climate</th>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>Advisory Type</th>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>Recommendation</th>
                  <th style={{ padding: '0.85rem', textAlign: 'left' }}>Confidence</th>
                  <th style={{ padding: '0.85rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((item, idx) => (
                    <tr key={item.logId || idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem' }}><code>{item.logId}</code></td>
                      <td style={{ padding: '0.85rem', fontSize: '0.9rem' }}>{item.timestamp}</td>
                      <td style={{ padding: '0.85rem' }}><span className="npk-badge">{item.npkSummary}</span></td>
                      <td style={{ padding: '0.85rem', fontSize: '0.9rem' }}>{item.climateSummary}</td>
                      <td style={{ padding: '0.85rem' }}>
                        <span className={`type-badge ${item.badgeClass || 'badge-crop'}`} style={{ padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
                          {item.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem' }}><strong>{item.recommendedItem}</strong></td>
                      <td style={{ padding: '0.85rem' }}><span className="confidence-pill high">{item.confidence}</span></td>
                      <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => handleRerun(item)}
                            title="Rerun with these parameters"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-light)' }}
                          >
                            <i className="fa-solid fa-rotate-right"></i>
                          </button>
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => handleDeleteItem(item.logId)}
                            title="Delete log entry"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-terracotta)' }}
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No history records found. <Link to="/recommend" style={{ color: 'var(--accent-terracotta)', fontWeight: 700 }}>Run your first recommendation!</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
