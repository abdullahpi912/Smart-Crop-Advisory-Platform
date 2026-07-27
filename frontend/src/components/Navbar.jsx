import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <header>
        <nav className="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 2rem' }}>
          {/* Top Left: Hamburger Button + Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <button
              className="sidebar-toggle-btn"
              onClick={toggleSidebar}
              aria-label="Open Navigation Sidebar"
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

            <Link className="logo" to="/" onClick={closeSidebar} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <i className="fa-solid fa-seedling" style={{ fontSize: '1.5rem', color: 'var(--accent-terracotta)' }}></i>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary-dark)' }}>AgriSense</span>
            </Link>
          </div>

          {/* Main Bar Right: ONLY "Get Recommendation" & "Sign In" */}
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
              <i className="fa-solid fa-wand-magic-sparkles"></i> Get Recommendation
            </NavLink>

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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '290px',
          height: '100vh',
          backgroundColor: '#faf8f3',
          borderRight: '1px solid rgba(36, 66, 46, 0.12)',
          color: 'var(--text-dark)',
          zIndex: 9999,
          boxShadow: '0 20px 40px rgba(25, 43, 30, 0.18)',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '1.5rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(36, 66, 46, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fa-solid fa-seedling" style={{ color: 'var(--accent-terracotta)', fontSize: '1.4rem' }}></i>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary-dark)' }}>AgriSense</span>
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
