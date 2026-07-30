import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-centered">
      <div className="footer-content-centered">
        <Link className="logo" to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '0.75rem' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
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
        <p className="footer-tagline">Smart soil-to-crop advisory platform powered by machine learning.</p>
        <p className="footer-copyright">&copy; {new Date().getFullYear()} AgriSense Precision Advisory. All rights reserved.</p>
      </div>
    </footer>
  );
}
