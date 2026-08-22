import React from 'react';
import { Link } from 'react-router-dom';

export default function ResultCard({ result, isLoading, processingStage, mode = 'crop' }) {
  if (isLoading) {
    const stageNames = mode === 'yield' ? [
      'READING STATE & CROP DATA',
      'VALIDATING ACREAGE INPUTS',
      'APPLYING LOG1P TRANSFORMS',
      'RUNNING XGBOOST REGRESSOR',
      'CONVERTING EXPM1 PRODUCTION'
    ] : (mode === 'fertilizer' ? [
      'READING DISTRICT & SOIL DATA',
      'VALIDATING FIELD VECTORS',
      'ONE-HOT ENCODING FEATURES',
      'RUNNING DECISION TREE MODEL',
      'RANKING TOP-3 FORMULATIONS'
    ] : [
      'READING FIELD DATA',
      'VALIDATING INPUTS',
      'NORMALISING FEATURES',
      'RUNNING ADVISORY MODEL',
      'GENERATING REPORT'
    ]);

    return (
      <div className="processing-console">
        <span className="mono-accent" style={{ marginBottom: '1rem' }}>
          <span className="pulse-indicator" style={{ marginRight: '6px' }}></span>
          {mode === 'yield' ? 'YIELD PREDICTION IN PROGRESS' : (mode === 'fertilizer' ? 'FERTILIZER ADVISORY COMPUTATION' : 'ADVISORY COMPUTATION IN PROGRESS')}
        </span>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--agri-ink)' }}>
          {mode === 'yield' ? 'Evaluating Historical Crop Production' : (mode === 'fertilizer' ? 'Evaluating Soil Nutrient Deficiencies' : 'Evaluating Agronomic Vectors')}
        </h3>

        <ul className="processing-step-list">
          {stageNames.map((stageName, idx) => {
            const isDone = (processingStage || 0) > idx;
            const isActive = (processingStage || 0) === idx;
            return (
              <li
                key={stageName}
                className={`processing-step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              >
                <span>{`0${idx + 1}`} • {stageName}</span>
                <span>
                  {isDone ? (
                    <i className="fa-solid fa-check" style={{ color: 'var(--agri-success)' }}></i>
                  ) : isActive ? (
                    <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--agri-accent)' }}></i>
                  ) : (
                    '--'
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (!result) {
    const emptyDesc = mode === 'yield'
      ? 'Select the State, Season, Crop species, and Farm Area (ha) on the left to predict estimated agricultural harvest output.'
      : (mode === 'fertilizer'
        ? 'Select the District, Soil Color, Crop, and N-P-K parameters on the left to compute targeted fertilizer dosages and top candidates.'
        : 'Enter the 7 soil and climate parameters on the left or select a preset to generate a data-backed crop advisory report.');

    return (
      <div className="console-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <span className="mono-meta" style={{ color: 'var(--agri-muted)', display: 'block', marginBottom: '1rem' }}>
          AWAITING SIMULATION TRIGGER
        </span>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--agri-ink)', marginBottom: '0.75rem' }}>
          Field Telemetry Ready
        </h3>
        <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', maxWidth: '380px', margin: '0 auto' }}>
          {emptyDesc}
        </p>
      </div>
    );
  }

  const isYield = mode === 'yield' || result.type?.includes('Yield') || result.predicted_production_tonnes !== undefined;
  const isFertilizer = mode === 'fertilizer' || result.type?.includes('Fertilizer') || result.top3 !== undefined;

  return (
    <article className="report-card" aria-label="Machine Generated Field Advisory Report">
      {/* Header Telemetry */}
      <div className="report-header-meta">
        <div>
          <span className="mono-accent">
            {result.type ? result.type.toUpperCase() : 'ADVISORY OUTPUT'}
          </span>
          <div className="mono-meta" style={{ marginTop: '2px' }}>
            LOG ID: {result.logId || result.recId || '#LOG-8942'} • {result.timestamp || 'REAL-TIME'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className="mono-meta" style={{ display: 'block', color: 'var(--agri-muted)' }}>
            CONFIDENCE
          </span>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--agri-accent)' }}>
            {result.confidence || '99.0%'}
          </strong>
        </div>
      </div>

      {/* ── CASE 1: CROP YIELD PREDICTION RESULT ── */}
      {isYield && (
        <div>
          <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>ESTIMATED PRODUCTION OUTPUT</span>
          <h2 className="report-crop-name" style={{ color: 'var(--agri-ink)' }}>
            {result.crop || result.inputs?.crop || 'Selected Crop'}
          </h2>

          <div className="yield-hero-card">
            <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>TOTAL PREDICTED HARVEST</span>
            <div className="yield-hero-val">
              {typeof result.predicted_production_tonnes === 'number' ? result.predicted_production_tonnes.toFixed(2) : result.predicted_production_tonnes} <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--agri-ink)' }}>Tonnes</span>
            </div>
            <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>
              ESTIMATED YIELD DENSITY: {result.yield_per_hectare ? `${result.yield_per_hectare} T/ha` : `${((result.predicted_production_tonnes || 0) / (result.inputs?.area || 1)).toFixed(2)} T/ha`}
            </span>
          </div>

          <p style={{ fontSize: '0.98rem', color: 'var(--agri-secondary)', lineHeight: 1.6 }}>
            {result.detailedNotes || result.dosageAdvice || `Estimated crop production for ${result.crop} cultivation.`}
          </p>

          <div className="yield-disclaimer-note">
            <i className="fa-solid fa-circle-info" style={{ marginRight: '6px', color: 'var(--agri-warning)' }}></i>
            <strong>Historical Pattern Model:</strong> Yield output is an estimate in tonnes based on historical regional and seasonal cultivation trends, not a guarantee.
          </div>

          {/* Structured Telemetry Grid */}
          <div className="report-specs-grid">
            <div className="report-spec-cell">
              <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>FARM ACREAGE</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--agri-ink)' }}>
                {result.inputs?.area ? `${result.inputs.area} Hectares` : '10.0 Hectares'}
              </strong>
            </div>

            <div className="report-spec-cell">
              <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>SEASON &amp; YEAR</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--agri-ink)' }}>
                {result.inputs?.season || 'Kharif'} • {result.inputs?.crop_year || 2024}
              </strong>
            </div>

            <div className="report-spec-cell" style={{ gridColumn: '1 / -1' }}>
              <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>STATE / REGION</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--agri-accent)' }}>
                {result.inputs?.state_name || 'Maharashtra'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* ── CASE 2: FERTILIZER ADVISORY RESULT ── */}
      {isFertilizer && !isYield && (
        <div>
          <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>PRIMARY FERTILIZER RECOMMENDATION</span>
          <h2 className="report-crop-name">
            {result.fertilizer || result.recommendedItem || 'Fertilizer Match'}
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--agri-secondary)', lineHeight: 1.6 }}>
            {result.dosageAdvice || result.detailedNotes || 'Optimal soil nutrient replenishment.'}
          </p>

          {/* Top-3 Shortlist Probability Distribution */}
          {result.top3 && result.top3.length > 0 && (
            <div className="fertilizer-top3-section">
              <div className="fertilizer-top3-header">
                <span className="mono-accent">TOP-3 CANDIDATE FORMULATIONS</span>
                <span className="mono-meta">PROBABILITY SPREAD</span>
              </div>
              <div className="fertilizer-top3-list">
                {result.top3.map((cand, idx) => {
                  const confVal = typeof cand.confidence === 'number' ? cand.confidence : parseFloat(cand.confidence) || 0;
                  return (
                    <div key={cand.name || idx} className="fertilizer-top3-item">
                      <div className="fertilizer-top3-row">
                        <span>
                          <span className="fertilizer-top3-badge">{`#0${idx + 1}`}</span>
                          <strong style={{ color: 'var(--agri-ink)', fontWeight: 700 }}>{cand.name}</strong>
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: idx === 0 ? 'var(--agri-accent)' : 'var(--agri-muted)' }}>
                          {confVal.toFixed(1)}%
                        </span>
                      </div>
                      <div className="fertilizer-top3-bar-track">
                        <div
                          className="fertilizer-top3-bar-fill"
                          style={{
                            width: `${Math.max(4, Math.min(100, confVal))}%`,
                            backgroundColor: idx === 0 ? 'var(--agri-accent)' : (idx === 1 ? 'var(--agri-signal)' : 'var(--agri-muted)')
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Structured Telemetry Grid */}
          <div className="report-specs-grid">
            <div className="report-spec-cell">
              <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>DISTRICT &amp; CROP</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--agri-ink)' }}>
                {result.inputs?.district_name || 'Kolhapur'} • {result.crop || result.inputs?.crop || 'Sugarcane'}
              </strong>
            </div>

            <div className="report-spec-cell">
              <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>SOIL COLOR &amp; pH</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--agri-ink)' }}>
                {result.inputs?.soil_color || 'Black'} • pH {result.inputs?.ph || 6.5}
              </strong>
            </div>

            <div className="report-spec-cell" style={{ gridColumn: '1 / -1' }}>
              <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>SOIL N-P-K NUTRIENT PROFILE</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--agri-accent)' }}>
                {result.npkSummary || `N: ${result.inputs?.nitrogen || 50} | P: ${result.inputs?.phosphorus || 20} | K: ${result.inputs?.potassium || 30}`}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* ── CASE 3: CROP SELECTION RECOMMENDATION RESULT ── */}
      {!isYield && !isFertilizer && (
        <div>
          <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>RECOMMENDED MATCH</span>
          <h2 className="report-crop-name">
            {result.recommendedItem || result.crop_name}
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--agri-secondary)', lineHeight: 1.6 }}>
            {result.detailedNotes || result.dosageAdvice || result.notes || 'Optimal yield predicted under current environmental and soil nutrient bounds.'}
          </p>

          {/* Structured Telemetry Grid */}
          <div className="report-specs-grid">
            <div className="report-spec-cell">
              <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>SOIL N-P-K</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--agri-ink)' }}>
                {result.npkSummary || `N:${result.inputs?.nitrogen || 90} | P:${result.inputs?.phosphorus || 42} | K:${result.inputs?.potassium || 43}`}
              </strong>
            </div>

            <div className="report-spec-cell">
              <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>CLIMATE &amp; pH</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--agri-ink)' }}>
                {result.climateSummary || `pH ${result.inputs?.ph || 6.5} | ${result.inputs?.rainfall || 202}mm`}
              </strong>
            </div>

            <div className="report-spec-cell" style={{ gridColumn: '1 / -1' }}>
              <span className="mono-meta" style={{ display: 'block', marginBottom: '4px' }}>SOIL CHEMISTRY STATUS</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--agri-accent)' }}>
                {result.soilHealth || 'Optimal Balanced Soil Profile'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Report Action Links */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/dashboard" className="btn-primary-technical" style={{ flex: 1 }}>
          <i className="fa-solid fa-database"></i> VIEW IN DASHBOARD LOG
        </Link>
      </div>
    </article>
  );
}
