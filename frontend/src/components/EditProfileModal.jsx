import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function EditProfileModal({ isOpen, onClose, userProfile, onProfileUpdated, showToast, onAccountDeleted }) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password' | 'delete'

  // General profile form state
  const [profileForm, setProfileForm] = useState({
    fullname: '',
    email: '',
    phone: '',
    region: '',
    soilType: 'loamy'
  });

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Delete account password state
  const [deletePassword, setDeletePassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const backendUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        fullname: userProfile.fullname || userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        region: userProfile.region || userProfile.location || '',
        soilType: userProfile.soilType || userProfile.soil_type || 'loamy'
      });
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${backendUrl}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullname: profileForm.fullname,
          email: profileForm.email,
          phone: profileForm.phone,
          region: profileForm.region,
          soil_type: profileForm.soilType
        })
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = data.user || { ...userProfile, ...profileForm };
        localStorage.setItem('agrisense_user', JSON.stringify(updatedUser));
        onProfileUpdated?.(updatedUser);
        showToast?.('Profile details updated successfully!', 'success');
        onClose();
      } else {
        setErrorMsg(data.error || data.message || 'Failed to update profile');
      }
    } catch (err) {
      const updatedUser = { ...userProfile, ...profileForm };
      localStorage.setItem('agrisense_user', JSON.stringify(updatedUser));
      onProfileUpdated?.(updatedUser);
      showToast?.('Profile updated locally!', 'success');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setErrorMsg('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/user/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast?.('Password updated successfully!', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        onClose();
      } else {
        setErrorMsg(data.error || data.message || 'Current password is incorrect');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (!deletePassword) {
      setErrorMsg('Please enter your password to confirm account deletion');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/user/account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: deletePassword })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem('agrisense_user');
        localStorage.removeItem('agrisense_history');
        localStorage.removeItem('agrisense_session');
        showToast?.('Account deleted permanently.', 'info');
        onClose();
        onAccountDeleted?.();
      } else {
        setErrorMsg(data.error || data.message || 'Incorrect password. Account deletion cancelled.');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to delete account.');
    } finally {
      setIsLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-backdrop-technical" onClick={onClose}>
      <div className="modal-dialog-technical" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-technical">
          <div>
            <span className="mono-accent">PROFILE // CONFIG</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>Farm Account Settings</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--agri-ink)', fontSize: '1.2rem' }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-tabs-technical">
          <button
            type="button"
            className={`modal-tab-btn-technical ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => { setActiveTab('info'); setErrorMsg(''); }}
          >
            01 // EDIT INFO
          </button>
          <button
            type="button"
            className={`modal-tab-btn-technical ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => { setActiveTab('password'); setErrorMsg(''); }}
          >
            02 // PASSWORD
          </button>
          <button
            type="button"
            className={`modal-tab-btn-technical ${activeTab === 'delete' ? 'active' : ''}`}
            onClick={() => { setActiveTab('delete'); setErrorMsg(''); }}
            style={{ color: activeTab === 'delete' ? 'var(--agri-danger)' : undefined }}
          >
            03 // DANGER ZONE
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          {errorMsg && (
            <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--agri-danger)', backgroundColor: 'var(--agri-danger-dim)', color: 'var(--agri-danger)', marginBottom: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              ERROR // {errorMsg}
            </div>
          )}

          {activeTab === 'info' && (
            <form onSubmit={handleProfileSubmit}>
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
              <div className="console-field" style={{ marginBottom: '1rem' }}>
                <label>District / Location</label>
                <input type="text" required value={profileForm.region} onChange={(e) => setProfileForm({ ...profileForm, region: e.target.value })} />
              </div>
              <div className="console-field" style={{ marginBottom: '1.5rem' }}>
                <label>Primary Soil Type</label>
                <select value={profileForm.soilType} onChange={(e) => setProfileForm({ ...profileForm, soilType: e.target.value })}>
                  <option value="clay-loam">Clay-Loam Soil</option>
                  <option value="loamy">Loamy Soil</option>
                  <option value="sandy">Sandy Soil</option>
                  <option value="alluvial">Alluvial Soil</option>
                  <option value="red">Red Soil</option>
                  <option value="black">Black Soil (Regur)</option>
                  <option value="laterite">Laterite Soil</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={onClose} className="btn-secondary-technical" style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary-technical" style={{ padding: '8px 20px' }}>
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="console-field" style={{ marginBottom: '1rem' }}>
                <label>Current Password</label>
                <input type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div className="console-field" style={{ marginBottom: '1rem' }}>
                <label>New Password (min 6 characters)</label>
                <input type="password" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <div className="console-field" style={{ marginBottom: '1.5rem' }}>
                <label>Confirm New Password</label>
                <input type="password" required value={passwordForm.confirmNewPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={onClose} className="btn-secondary-technical" style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary-technical" style={{ padding: '8px 20px' }}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'delete' && (
            <form onSubmit={handleDeleteAccountSubmit}>
              <div style={{ padding: '1rem', border: '1px solid var(--agri-danger)', backgroundColor: 'var(--agri-danger-dim)', marginBottom: '1.25rem' }}>
                <span className="mono-meta" style={{ color: 'var(--agri-danger)', display: 'block', marginBottom: '4px' }}>PERMANENT ACTION</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--agri-ink)', lineHeight: 1.5 }}>
                  Deleting your account will remove your login credentials, saved farm plots, and recommendation log history from the MySQL database.
                </p>
              </div>
              <div className="console-field" style={{ marginBottom: '1.5rem' }}>
                <label>Enter Password to Confirm Deletion</label>
                <input type="password" required value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={onClose} className="btn-secondary-technical" style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-danger-technical" style={{ padding: '8px 20px' }}>
                  {isLoading ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
