import React from 'react';
import { Link } from 'react-router-dom';

export default function CropCard({ crop, index }) {
  const formattedIndex = index !== undefined ? (index < 9 ? `0${index + 1}` : `${index + 1}`) : '01';

  return (
    <article className="crop-index-item" aria-label={crop.title}>
      {/* Top Index & Category */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--agri-line)', paddingBottom: '0.6rem' }}>
          <span className="mono-accent">{formattedIndex} // INDEX</span>
          <span className="mono-meta">{crop.category.toUpperCase()}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem' }}>{crop.icon}</span>
          <h3 className="crop-index-title" style={{ margin: 0 }}>
            {crop.title}
          </h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--agri-secondary)', lineHeight: 1.5, marginTop: '0.75rem' }}>
          {crop.tagline}
        </p>
      </div>

      {/* Specifications Telemetry Matrix */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ borderTop: '1px solid var(--agri-line)', borderLeft: '1px solid var(--agri-line)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
            <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>IDEAL N-P-K</span>
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.npk}</strong>
          </div>
          <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
            <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>TEMP RANGE</span>
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.temp}</strong>
          </div>
          <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
            <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>SOIL pH</span>
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.ph}</strong>
          </div>
          <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
            <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>PRECIPITATION</span>
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.rainfall}</strong>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem' }}>
          <Link
            to="/recommend"
            className="btn-secondary-technical"
            style={{ width: '100%', padding: '10px 16px', fontSize: '11px' }}
          >
            <i className="fa-solid fa-flask-vial"></i> TEST FIELD PROFILE
          </Link>
        </div>
      </div>
    </article>
  );
}
