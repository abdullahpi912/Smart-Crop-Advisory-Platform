import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main style={{ padding: 'calc(var(--nav-height) + 4rem) 1.5rem 6rem 1.5rem' }}>
      <div className="page-container" style={{ maxWidth: '640px', textAlign: 'center' }}>
        <div className="console-panel" style={{ padding: '4rem 2rem' }}>
          <span className="mono-accent" style={{ color: 'var(--agri-danger)', border: '1px solid var(--agri-danger)', padding: '4px 12px', borderRadius: '9999px' }}>
            ERROR 404
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.04em', margin: '1.5rem 0 0.5rem 0', color: 'var(--agri-ink)' }}>
            Field Not Found
          </h1>
          <p style={{ color: 'var(--agri-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 2rem auto' }}>
            The requested agricultural resource, telemetry route, or advisory plot does not exist or has been relocated within the platform.
          </p>
          <Link to="/" className="btn-primary-technical">
            <i className="fa-solid fa-house" style={{ marginRight: '6px' }}></i> RETURN TO CONSOLE HOME
          </Link>
        </div>
      </div>
    </main>
  );
}
