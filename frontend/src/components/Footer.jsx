import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-technical" role="contentinfo">
      <div className="page-container">
        {/* Top Metadata & Navigation Row */}
        <div className="footer-top-meta">
          <div style={{ maxWidth: '420px' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--agri-ink)' }}>
                AGRISENSE
              </span>
            </Link>
            <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Data-backed precision crop selection and soil fertilizer advisory platform powered by agronomic classification models.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="nav-system-pill">
                <span className="pulse-indicator"></span>
                <span>SYSTEM / ONLINE</span>
              </span>
              <span className="mono-meta" style={{ padding: '2px 8px', border: '1px solid var(--agri-line)' }}>
                ENGINE / CROP CLASSIFIER
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
            &copy; {new Date().getFullYear()} AGRISENSE PRECISION ADVISORY. ALL RIGHTS RESERVED.
          </span>
          <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>
            PRECISION AGRICULTURAL INTELLIGENCE
          </span>
        </div>
      </div>

      {/* Giant Architectural Cropped Wordmark */}
      <div className="footer-wordmark-wrapper" aria-hidden="true">
        <div className="footer-giant-wordmark">
          AGRISENSE
        </div>
      </div>
    </footer>
  );
}
