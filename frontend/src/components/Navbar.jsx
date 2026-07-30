import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('agrisense_theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });
  const location = useLocation();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('agrisense_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    try {
      localStorage.setItem('agrisense_theme', theme);
    } catch (e) { }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem('agrisense_user');
    } catch (e) { }
    setUser(null);
    closeSidebar();
  };

  return (
    <>
      <header>
        <nav className="navbar" aria-label="Main navigation" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 2rem' }}>
          {/* Top Left: Hamburger Button + Theme Switcher Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="sidebar-toggle-btn"
              onClick={toggleSidebar}
              aria-label="Open Navigation Sidebar"
              aria-expanded={isSidebarOpen}
              aria-controls="mobile-sidebar-drawer"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(36, 66, 46, 0.06)',
                transition: 'var(--transition)'
              }}
            >
              <span style={{ width: '22px', height: '2.5px', background: 'var(--primary-dark)', borderRadius: '2px' }}></span>
              <span style={{ width: '22px', height: '2.5px', background: 'var(--primary-dark)', borderRadius: '2px' }}></span>
              <span style={{ width: '22px', height: '2.5px', background: 'var(--primary-dark)', borderRadius: '2px' }}></span>
            </button>

            {/* Side-by-Side Theme Switcher (☀️ Light Mode | 🌙 Dark Mode) */}
            <div
              className="theme-switcher-group"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px',
                borderRadius: '20px',
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(36, 66, 46, 0.08)',
                border: '1px solid var(--border-subtle)',
                gap: '3px'
              }}
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                aria-label="Activate Light Mode"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: theme === 'light' ? 'var(--accent-terracotta)' : 'transparent',
                  color: theme === 'light' ? '#ffffff' : 'var(--primary-dark)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                ☀️ Light Mode
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-label="Activate Dark Mode"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: theme === 'dark' ? '#4ade80' : 'transparent',
                  color: theme === 'dark' ? '#0b120d' : 'var(--primary-dark)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  boxShadow: theme === 'dark' ? '0 2px 8px rgba(74,222,128,0.3)' : 'none'
                }}
              >
                🌙 Dark Mode
              </button>
            </div>
          </div>

          {/* Top Center: Enterprise AGRISENSE Brand Emblem */}
          <Link
            className="logo"
            to="/"
            onClick={closeSidebar}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'var(--transition)'
            }}
          >
            {/* Crisp High-Contrast Icon Badge */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                backgroundColor: 'var(--accent-terracotta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(217, 107, 67, 0.35)',
                flexShrink: 0
              }}
            >
              <i className="fa-solid fa-seedling" style={{ color: '#ffffff', fontSize: '1.15rem' }}></i>
            </div>

            {/* Typography Brand Name & Advisory System Tag */}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  fontSize: '1.35rem',
                  letterSpacing: '2px',
                  color: 'var(--primary-dark)'
                }}
              >
                AGRI<span style={{ color: 'var(--accent-terracotta)' }}>SENSE</span>
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  letterSpacing: '1.8px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}
              >
                Advisory System
              </span>
            </div>
          </Link>

          {/* Main Bar Right: "Get Recommendation" & "Sign In / Profile" */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NavLink
              to="/recommend"
              className="btn btn-terracotta"
              style={{
                padding: '0.6rem 1.4rem',
                fontSize: '0.95rem',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none'
              }}
            >
              <i className="fa-solid fa-wheat-awn"></i> Get Recommendation
            </NavLink>

            {user ? (
              <NavLink
                to="/dashboard"
                style={({ isActive }) => ({
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: isActive ? 'var(--accent-terracotta)' : 'var(--primary-dark)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  backgroundColor: 'rgba(59, 110, 71, 0.12)',
                  border: '1px solid rgba(59, 110, 71, 0.25)',
                  transition: 'var(--transition)'
                })}
              >
                <i className="fa-solid fa-user-check" style={{ color: 'var(--primary-light)' }}></i>
                {user.fullname ? user.fullname.split(' ')[0] : 'Profile'}
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                style={({ isActive }) => ({
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: isActive ? 'var(--accent-terracotta)' : 'var(--primary-dark)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                  backgroundColor: 'rgba(36, 66, 46, 0.05)',
                  transition: 'var(--transition)'
                })}
              >
                <i className="fa-solid fa-right-to-bracket"></i> Sign In
              </NavLink>
            )}
          </div>
        </nav>
      </header>

      {/* Dimmed Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(25, 43, 30, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Off-Canvas Sidebar Drawer */}
      <aside
        id="mobile-sidebar-drawer"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '290px',
          height: '100vh',
          backgroundColor: 'var(--bg-sand)',
          borderRight: '1px solid rgba(36, 66, 46, 0.12)',
          color: 'var(--text-dark)',
          zIndex: 9999,
          boxShadow: '0 20px 40px rgba(25, 43, 30, 0.18)',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '1.5rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(36, 66, 46, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-terracotta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(217, 107, 67, 0.3)',
                flexShrink: 0
              }}
            >
              <i className="fa-solid fa-seedling" style={{ color: '#ffffff', fontSize: '1rem' }}></i>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  letterSpacing: '1.8px',
                  color: 'var(--primary-dark)'
                }}
              >
                AGRI<span style={{ color: 'var(--accent-terracotta)' }}>SENSE</span>
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}
              >
                Advisory System
              </span>
            </div>
          </div>

          <button
            onClick={closeSidebar}
            aria-label="Close Sidebar"
            style={{
              background: 'rgba(36, 66, 46, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--primary-dark)',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* User Profile / Avatar / Sign In Area */}
        {user ? (
          <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid rgba(36, 66, 46, 0.08)', backgroundColor: 'var(--surface-white)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700 }}>
                <i className="fa-solid fa-user"></i>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--primary-dark)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.fullname || 'Farm Profile Active'}</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email || 'AgriSense Farmer Account'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{ background: 'rgba(217, 56, 30, 0.1)', border: 'none', borderRadius: '6px', color: '#d9381e', cursor: 'pointer', fontSize: '0.9rem', padding: '6px 10px', fontWeight: 700, flexShrink: 0 }}
            >
              <i className="fa-solid fa-power-off"></i>
            </button>
          </div>
        ) : (
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(36, 66, 46, 0.08)', backgroundColor: 'var(--surface-white)' }}>
            <Link
              to="/login"
              onClick={closeSidebar}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-terracotta)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <i className="fa-solid fa-right-to-bracket"></i> Sign In to Account
            </Link>
          </div>
        )}

        {/* Sidebar Navigation Links */}
        <div style={{ padding: '1.5rem 1rem', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '0.85rem', paddingLeft: '0.6rem' }}>
            Navigation Menu
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { path: '/', label: 'Home', icon: 'fa-solid fa-house' },
              { path: '/crops', label: 'Crop Library', icon: 'fa-solid fa-book-open' },
              { path: '/dashboard', label: 'History & Dashboard', icon: 'fa-solid fa-gauge-high' },
              { path: '/about', label: 'About', icon: 'fa-solid fa-circle-info' },
              { path: '/contact', label: 'Contact', icon: 'fa-solid fa-envelope' }
            ].map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={closeSidebar}
                  aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    color: isActive ? 'var(--accent-terracotta)' : 'var(--primary-dark)',
                    backgroundColor: isActive ? 'rgba(217, 107, 67, 0.12)' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    borderLeft: isActive ? '4px solid var(--accent-terracotta)' : '4px solid transparent',
                    textDecoration: 'none',
                    fontSize: '0.98rem',
                    transition: 'var(--transition)'
                  })}
                >
                  <i className={item.icon} style={{ width: '20px', textAlign: 'center', color: 'var(--primary-light)' }}></i>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Sidebar Footer Status Widget */}
        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid rgba(36, 66, 46, 0.1)', background: 'var(--surface-white)' }}>
          <div style={{ background: 'var(--bg-warm-tint)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="status-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-sage)', display: 'inline-block' }}></span>
            <div>
              <strong style={{ fontSize: '0.82rem', display: 'block', color: 'var(--primary-dark)' }}>ML Advisory Active</strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AgriSense Soil Platform</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
