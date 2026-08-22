import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main style={{ padding: 'calc(var(--nav-height) + 2rem) 0 5rem 0' }}>
      <div className="page-container">
        {/* Editorial Header */}
        <div className="section-header-editorial">
          <div className="section-meta-row">
            <span className="mono-accent">ABOUT • ARCHITECTURE</span>
            <div className="section-meta-rule"></div>
            <span className="mono-meta">PRECISION SOIL INTELLIGENCE</span>
          </div>
          <h1 className="section-title-large">Data-Backed Agronomic Intelligence</h1>
          <p className="section-desc-editorial">
            Empowering agricultural growers and agronomy advisors with multivariate machine learning models to maximize crop yields and protect long-term soil health.
          </p>
        </div>

        {/* Overview Split Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3.5rem', alignItems: 'center', marginBottom: '4rem' }}>
          <div>
            <span className="mono-accent">01 • THE CHALLENGE</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.75rem 0 1rem 0', letterSpacing: '-0.03em' }}>
              Eliminating Seasonal Guesswork
            </h2>
            <p style={{ color: 'var(--agri-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Traditional farming heavily depends on inherited seasonal intuition or past crop choices. However, unpredictable climate fluctuations and localized soil chemical degradation frequently result in lower yields and wasted fertilizer expenditure.
            </p>
            <p style={{ color: 'var(--agri-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
              AgriSense addresses this by evaluating seven fundamental agronomic variables — Nitrogen (N), Phosphorus (P), Potassium (K), Soil pH, Temperature, Relative Humidity, and Precipitation — against comprehensive crop suitability matrices to calculate optimal crop and fertilizer schedules.
            </p>
          </div>

          <div style={{ border: '1px solid var(--agri-line)', overflow: 'hidden', backgroundColor: 'var(--agri-stage)' }}>
            <img
              src="/Farmer_image/Truck_image.jpg"
              alt="Precision agricultural machinery in field"
              style={{ width: '100%', height: '360px', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/Farmer_image/Truck_image.jpg'; }}
            />
          </div>
        </div>

        {/* Agronomic Values Grid */}
        <div style={{ borderTop: '1px solid var(--agri-line)', paddingTop: '4rem', marginBottom: '4rem' }}>
          <div className="section-meta-row" style={{ marginBottom: '2rem' }}>
            <span className="mono-accent">02 • PILLARS</span>
            <div className="section-meta-rule"></div>
            <span className="mono-meta">CORE AGRONOMIC PRINCIPLES</span>
          </div>

          <div className="why-editorial-grid">
            <div className="why-editorial-cell">
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>01 • SOIL HEALTH</span>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Nutrient Preservation</h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Prevents over-fertilization and chemical leaching by delivering exact NPK deficit calculations tailored directly to soil acidity and crop uptake rates.
                </p>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>CHEMISTRY BALANCE</span>
            </div>

            <div className="why-editorial-cell">
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>02 • YIELD GAIN</span>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Data-Backed Prosperity</h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Minimizes planting risk by identifying crop species with the highest statistical suitability for specific regional thermal and precipitation limits.
                </p>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>OPTIMAL OUTPUT</span>
            </div>

            <div className="why-editorial-cell">
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>03 • CLIMATE SYNC</span>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Environmental Adaptation</h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Enables farming plots to adapt dynamically to shifting seasonal moisture and temperature curves with localized weather synchronization.
                </p>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>RESILIENT HARVEST</span>
            </div>

            <div className="why-editorial-cell">
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>04 • PLOT TELEMETRY</span>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Multi-Season History</h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Maintains longitudinal records of past soil test results and recommendation outcomes to monitor soil regeneration over successive years.
                </p>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>LONGITUDINAL LOGS</span>
            </div>
          </div>
        </div>

        {/* Technical Call to Action Console */}
        <div style={{ border: '1px solid var(--agri-line)', backgroundColor: 'var(--agri-surface)', padding: '3.5rem 2.5rem', textAlign: 'center' }}>
          <span className="mono-accent" style={{ display: 'block', marginBottom: '0.75rem' }}>SIMULATOR READY</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem', color: 'var(--agri-ink)' }}>
            Ready to Evaluate Your Field Parameters?
          </h2>
          <p style={{ color: 'var(--agri-secondary)', maxWidth: '560px', margin: '0 auto 2rem auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Run the AgriSense field advisory simulator with your soil test results to compute high-yield crop recommendations and tailored fertilizer advice.
          </p>
          <Link to="/recommend" className="btn-primary-technical">
            <i className="fa-solid fa-calculator"></i> LAUNCH ADVISORY SIMULATOR
          </Link>
        </div>
      </div>
    </main>
  );
}
