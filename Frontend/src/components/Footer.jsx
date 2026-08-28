import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('cropling_theme') || localStorage.getItem('agrisense_theme') || 'light';
    } catch (_) {
      return 'light';
    }
  });

  useEffect(() => {
    const updateTheme = () => {
      const current = document.documentElement.getAttribute('data-theme') || (document.body.classList.contains('dark-mode') ? 'dark' : 'light');
      setTheme(current);
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <footer className="footer-technical" role="contentinfo">
      <div className="page-container">
        {/* Top Metadata & Navigation Row */}
        <div className="footer-top-meta">
          <div style={{ maxWidth: '420px' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '1.15rem' }} aria-label="Cropling Home">
              <img
                src={theme === 'dark' ? "/Logo/Logo%20For%20Dark%20Mode.png" : "/Logo/Logo%20For%20Light%20mode.png"}
                alt="Cropling"
                className="footer-logo-img"
              />
            </Link>
            <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Data-backed precision crop selection, fertilizer advisory, and yield forecasting platform powered by a 3-model agronomic engine.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="nav-system-pill">
                <span className="pulse-indicator"></span>
                <span>SYSTEM / ONLINE</span>
              </span>
              <span className="mono-meta" style={{ padding: '2px 8px', border: '1px solid var(--agri-line)' }}>
                ENGINE / 3-MODEL SUITE
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div style={{ display: 'flex', gap: '3.5rem', flexWrap: 'wrap' }}>
            <div>
              <div className="mono-meta" style={{ marginBottom: '1rem', color: 'var(--agri-ink)', fontWeight: 600 }}>
                PLATFORM
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li>
                  <Link to="/recommend" className="mono-meta" style={{ color: 'var(--agri-secondary)', transition: 'color 0.2s' }}>
                    FIELD SIMULATOR
                  </Link>
                </li>
                <li>
                  <Link to="/crops" className="mono-meta" style={{ color: 'var(--agri-secondary)', transition: 'color 0.2s' }}>
                    CROP DATABASE
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="mono-meta" style={{ color: 'var(--agri-secondary)', transition: 'color 0.2s' }}>
                    FARM DASHBOARD
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="mono-meta" style={{ marginBottom: '1rem', color: 'var(--agri-ink)', fontWeight: 600 }}>
                SYSTEM
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <li>
                  <Link to="/how-it-works" className="mono-meta" style={{ color: 'var(--agri-secondary)', transition: 'color 0.2s' }}>
                    HOW IT WORKS (GUIDE)
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="mono-meta" style={{ color: 'var(--agri-secondary)', transition: 'color 0.2s' }}>
                    ABOUT ARCHITECTURE
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="mono-meta" style={{ color: 'var(--agri-secondary)', transition: 'color 0.2s' }}>
                    FIELD SUPPORT
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="mono-meta" style={{ color: 'var(--agri-secondary)', transition: 'color 0.2s' }}>
                    FARMER ACCESS
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal Line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.75rem 0' }}>
          <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>
            &copy; {new Date().getFullYear()} CROPLING PRECISION ADVISORY. ALL RIGHTS RESERVED.
          </span>
          <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>
            PRECISION AGRICULTURAL INTELLIGENCE
          </span>
        </div>
      </div>

      {/* Giant Architectural Cropped Wordmark */}
      <div className="footer-wordmark-wrapper" aria-hidden="true">
        <div className="footer-giant-wordmark">
          CROPLING
        </div>
      </div>
    </footer>
  );
}
