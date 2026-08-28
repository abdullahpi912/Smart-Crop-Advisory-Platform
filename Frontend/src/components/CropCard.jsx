import React from 'react';
import { Link } from 'react-router-dom';

export default function CropCard({ crop, onOpenDetails }) {
  const modelType = crop.modelType || 'crop';

  const getTestLink = () => {
    if (modelType === 'fertilizer') return '/recommend/fertilizer';
    if (modelType === 'yield') return '/recommend/yield';
    return '/recommend';
  };

  const getTestButtonText = () => {
    if (modelType === 'fertilizer') return 'TEST FERTILIZER ADVISOR';
    if (modelType === 'yield') return 'TEST YIELD PREDICTOR';
    return 'TEST FIELD PROFILE';
  };

  return (
    <article className="crop-index-item" aria-label={crop.title}>
      {/* Top Category */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid var(--agri-line)', paddingBottom: '0.6rem' }}>
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
          {modelType === 'fertilizer' ? (
            <>
              <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
                <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>NPK FORMULA</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.npk}</strong>
              </div>
              <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
                <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>CLIMATE / STAGE</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.temp}</strong>
              </div>
              <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
                <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>SOIL REACTION</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.ph}</strong>
              </div>
              <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
                <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>RELEASE TYPE</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.rainfall}</strong>
              </div>
            </>
          ) : modelType === 'yield' ? (
            <>
              <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
                <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>AVG YIELD</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.npk}</strong>
              </div>
              <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
                <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>BEST SEASON</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.temp}</strong>
              </div>
              <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
                <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>CYCLE DURATION</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.ph}</strong>
              </div>
              <div style={{ padding: '0.6rem 0.75rem', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
                <span className="mono-meta" style={{ display: 'block', fontSize: '9px' }}>WATER DEMAND</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{crop.rainfall}</strong>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Action Buttons: More Details & Test Field Profile */}
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <button
            type="button"
            className="btn-primary-technical"
            onClick={() => onOpenDetails && onOpenDetails(crop)}
            style={{ width: '100%', padding: '10px 16px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-circle-info"></i> MORE DETAILS
          </button>
          <Link
            to={getTestLink()}
            className="btn-secondary-technical"
            style={{ width: '100%', padding: '9px 16px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center' }}
          >
            <i className="fa-solid fa-flask-vial"></i> {getTestButtonText()}
          </Link>
        </div>
      </div>
    </article>
  );
}
