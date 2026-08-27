import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../lib/apiConfig';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('cropling_theme') || localStorage.getItem('agrisense_theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cropling_user') || localStorage.getItem('agrisense_user') ||
                     localStorage.getItem('cropling_session') || localStorage.getItem('agrisense_session');
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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    try {
      localStorage.setItem('cropling_theme', theme);
    } catch (e) { }
  }, [theme]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) { }

    try {
      localStorage.removeItem('cropling_user');
      localStorage.removeItem('agrisense_user');
      localStorage.removeItem('cropling_session');
      localStorage.removeItem('agrisense_session');
      localStorage.removeItem('cropling_history');
      localStorage.removeItem('agrisense_history');
      sessionStorage.removeItem('cropling_admin');
    } catch (e) { }

    setUser(null);
    setIsProfileDropdownOpen(false);
    closeSidebar();

    // Trigger full clean page reload to reset all component states to signed-out view
    window.location.href = '/';
  };

  // Distinct Platform Features with clean line icons matching CodingLab template
  const menuFeatures = [
    { path: '/', label: 'Dashboard', icon: 'fa-solid fa-house' },
    { path: '/recommend', label: 'Crop Advisory', icon: 'fa-solid fa-chart-simple', badge: 'AI', badgeColor: '#15803D' },
    { path: '/crops', label: 'Crop Library', icon: 'fa-solid fa-seedling' },
    { path: '/dashboard', label: 'Farm Analytics', icon: 'fa-solid fa-chart-line' },
    { path: '/about', label: 'Architecture', icon: 'fa-solid fa-chart-pie' },
    { path: '/contact', label: 'Field Support', icon: 'fa-solid fa-headset' }
  ];

  const filteredFeatures = menuFeatures.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Fixed Top Header */}
      <header className="navbar-fixed" role="banner">
        <div className="nav-inner nav-inner-centered">
          {/* Left: Sidebar Toggle Menu Button or Admin Console Label */}
          <div className="nav-left-section">
            {isAdminRoute ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="cl-logo-badge" style={{ width: '28px', height: '28px', fontSize: '11px' }}>CL</span>
                <span className="mono-meta" style={{ color: 'var(--agri-accent)', fontWeight: 700 }}>
                  ROOT CONSOLE
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="sidebar-trigger-btn"
                onClick={toggleSidebar}
                aria-label="Open Navigation Sidebar"
                aria-expanded={isSidebarOpen}
                aria-controls="codinglab-sidebar"
              >
                <i className="fa-solid fa-bars-staggered"></i>
                <span className="sidebar-trigger-label">MENU</span>
              </button>
            )}
          </div>

          {/* Center: Brand Title */}
          <div className="nav-center-brand">
            <Link className="nav-brand-centered" to="/" onClick={closeSidebar} aria-label="Cropling Home">
              CROPLING
            </Link>
          </div>

          {/* Right: Theme Toggle + User Controls */}
          <div className="nav-controls">
            {/* Dual Segmented Light/Dark Mode Switcher */}
            <div className="topbar-theme-segment" role="group" aria-label="Theme Mode Switcher">
              <button
                type="button"
                className={`topbar-theme-tab ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                aria-label="Switch to Light Mode"
                aria-pressed={theme === 'light'}
              >
                <i className="fa-regular fa-sun"></i>
                <span>Light</span>
              </button>
              <button
                type="button"
                className={`topbar-theme-tab ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                aria-label="Switch to Dark Mode"
                aria-pressed={theme === 'dark'}
              >
                <i className="fa-regular fa-moon"></i>
                <span>Dark</span>
              </button>
            </div>

            {/* Authentication / Profile Status */}
            {user ? (
              <div className="nav-profile-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="nav-profile-circle-btn"
                  onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                  aria-label="User Account Menu"
                  aria-expanded={isProfileDropdownOpen}
                  title={user.fullname || user.username || 'Account'}
                >
                  {user.fullname ? user.fullname.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : 'A')}
                </button>

                {isProfileDropdownOpen && (
                  <div className="nav-profile-dropdown" role="menu">
                    <div className="nav-dropdown-header">
                      <div className="nav-dropdown-avatar">
                        {user.fullname ? user.fullname.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : 'A')}
                      </div>
                      <div className="nav-dropdown-user-details">
                        <strong className="nav-dropdown-name">{user.fullname || user.username}</strong>
                        <span className="nav-dropdown-email">{user.email || 'farmer@cropling.io'}</span>
                      </div>
                    </div>

                    <div className="nav-dropdown-divider"></div>

                    <Link
                      to="/dashboard"
                      className="nav-dropdown-link"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      role="menuitem"
                    >
                      <i className="fa-solid fa-chart-line"></i>
                      <span>Farm Dashboard</span>
                    </Link>

                    <Link
                      to="/recommend"
                      className="nav-dropdown-link"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      role="menuitem"
                    >
                      <i className="fa-solid fa-seedling"></i>
                      <span>Crop Advisory</span>
                    </Link>

                    <div className="nav-dropdown-divider"></div>

                    <button
                      type="button"
                      className="nav-dropdown-logout-btn"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/login" className="btn-nav-action">
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                <span>SIGN IN</span>
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* Dimmed Overlay Backdrop (Non-Admin routes only) */}
      {!isAdminRoute && isSidebarOpen && (
        <div
          className="cl-sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* CodingLab Dashboard Sidebar Menu (Non-Admin routes only) */}
      {!isAdminRoute && (
        <nav
          id="codinglab-sidebar"
          className={`cl-sidebar ${isSidebarOpen ? 'open' : ''} ${isCollapsed ? 'close' : ''}`}
          aria-label="Dashboard Sidebar Menu"
        >
          {/* Header: Monogram Logo, Brand Text & Edge Circular Toggle Chevron Button */}
          <header className="cl-header">
            <div className="cl-image-text">
              <span className="cl-image">
                <span className="cl-logo-badge">CL</span>
              </span>

              <div className="cl-text cl-header-text">
                <span className="cl-name">Cropling</span>
                <span className="cl-profession">
                  {user?.fullname || user?.username || 'Advisory Platform'}
                </span>
              </div>
            </div>

            {/* Circular Edge Toggle Chevron Button */}
            <button
              type="button"
              className="cl-toggle-btn"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <i className="fa-solid fa-chevron-right cl-toggle-icon"></i>
            </button>
          </header>

          {/* Sidebar Menu Body */}
          <div className="cl-menu-bar">
            <div className="cl-menu">
              {/* Search Box Pill */}
              <li
                className="cl-search-box"
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                }}
              >
                <i className="fa-solid fa-magnifying-glass cl-icon"></i>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search navigation items"
                />
              </li>

              {/* Nav Menu Links */}
              <ul className="cl-menu-links">
                {filteredFeatures.map((item) => (
                  <li className="cl-nav-link" key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `cl-link ${isActive && location.pathname === item.path ? 'active' : ''}`
                      }
                      onClick={closeSidebar}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <i className={`${item.icon} cl-icon`}></i>
                      <span className="cl-text cl-nav-text">{item.label}</span>
                      {item.badge && (
                        <span
                          className="cl-badge"
                          style={{ backgroundColor: item.badgeColor }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Content: Logout & Mode Switcher */}
            <div className="cl-bottom-content">
              {/* Logout / Login Action */}
              <li className="cl-nav-link">
                {user ? (
                  <button
                    type="button"
                    className="cl-link cl-logout-btn"
                    onClick={handleLogout}
                    title={isCollapsed ? "Logout" : undefined}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket cl-icon"></i>
                    <span className="cl-text cl-nav-text">Logout</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="cl-link"
                    onClick={closeSidebar}
                    title={isCollapsed ? "Sign In" : undefined}
                  >
                    <i className="fa-solid fa-arrow-right-to-bracket cl-icon"></i>
                    <span className="cl-text cl-nav-text">Sign In</span>
                  </Link>
                )}
              </li>

              {/* Dark Mode / Light Mode Switch */}
              <li
                className="cl-mode"
                onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                title={isCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
              >
                <div className="cl-sun-moon">
                  <i className={`fa-regular ${theme === 'light' ? 'fa-moon' : 'fa-sun'} cl-icon`}></i>
                </div>
                <span className="cl-mode-text cl-text">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>

                <div className="cl-toggle-switch">
                  <span className={`cl-switch ${theme === 'dark' ? 'active' : ''}`}></span>
                </div>
              </li>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
