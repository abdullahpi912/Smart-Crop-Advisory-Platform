import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main>
      <section style={{ textAlign: 'center', padding: '6rem 1.5rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '5rem', color: 'var(--accent-terracotta)', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>404</div>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', marginBottom: '2rem' }}>
          The field location or advisory page you are searching for does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-terracotta">
          <i className="fa-solid fa-house"></i> Return to Home
        </Link>
      </section>
    </main>
  );
}
