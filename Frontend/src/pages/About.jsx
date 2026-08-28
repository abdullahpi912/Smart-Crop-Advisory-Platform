import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main style={{ padding: 'calc(var(--nav-height) + 2rem) 0 5rem 0' }}>
      <div className="page-container">
        {/* Editorial Header */}
        <div className="section-header-editorial" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="section-title-large" style={{ margin: '0 auto' }}>Data-Backed Agronomic Intelligence</h1>
          <p className="section-desc-editorial" style={{ margin: '0.85rem auto 0 auto', maxWidth: '780px' }}>
            Empowering agricultural growers and agronomy advisors with three integrated machine learning models for crop selection, fertilizer dosage optimization, and harvest yield forecasting to maximize returns and protect long-term soil health.
          </p>
        </div>

        {/* Overview Split Grid */}
        <div className="about-split-grid">
          <div>
            <span className="mono-accent">01 • THE CHALLENGE</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.75rem 0 1rem 0', letterSpacing: '-0.03em' }}>
              Eliminating Seasonal Guesswork
            </h2>
            <p style={{ color: 'var(--agri-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Traditional farming heavily depends on inherited seasonal intuition or past crop choices. However, unpredictable climate fluctuations and localized soil chemical degradation frequently result in lower yields and wasted fertilizer expenditure.
            </p>
            <p style={{ color: 'var(--agri-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
              Cropling addresses this by evaluating fundamental agronomic and regional variables across three integrated machine learning engines — predicting optimal crop varieties, targeted fertilizer formulations, and projected harvest yields per hectare.
            </p>
          </div>

          <div className="about-img-container" style={{ border: '1px solid var(--agri-line)', overflow: 'hidden', backgroundColor: 'var(--agri-stage)' }}>
            <img
              src="/Farmer_image/Truck_image.jpg"
              alt="Precision agricultural machinery in field"
              style={{ width: '100%', height: '100%', minHeight: '260px', objectFit: 'cover' }}
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

        {/* 03 THE MODELS Technical Breakdown */}
        <div style={{ borderTop: '1px solid var(--agri-line)', paddingTop: '4rem', marginBottom: '4rem' }}>
          <div className="section-meta-row" style={{ marginBottom: '1rem' }}>
            <span className="mono-accent">03 • THE MODELS</span>
            <div className="section-meta-rule"></div>
            <span className="mono-meta">TECHNICAL BREAKDOWN</span>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.75rem 0', letterSpacing: '-0.03em', color: 'var(--agri-ink)' }}>
            Three Models, Three Jobs
          </h2>
          <p style={{ color: 'var(--agri-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '820px' }}>
            Each advisory function is powered by a separate model trained and validated independently — a classifier isn't a lookup table, and a regression isn't a classifier. Here's exactly what each one does.
          </p>

          <div className="why-editorial-grid">
            <div className="why-editorial-cell">
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>01 • CROP SELECTION</span>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Random Forest Classifier</h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Given 7 soil and climate readings — Nitrogen, Phosphorus, Potassium, temperature, humidity, soil pH, and rainfall — this model selects the best-suited crop from 22 possible classes. Trained on 2,200 balanced samples, it found that rainfall and humidity are the strongest signals: water availability drives crop choice more than any single nutrient.
                </p>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>99.5% ACCURACY</span>
            </div>

            <div className="why-editorial-cell">
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>02 • FERTILIZER ADVISORY</span>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Decision Tree Classifier</h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Given a crop and the field's district, soil color, and current N-P-K/pH/rainfall/temperature readings, this model recommends the fertilizer blend to apply — one of 19 types such as Urea, DAP, or 12:32:16 NPK — plus a ranked top-3 shortlist with confidence scores, since a single hard answer overstates certainty this task actually has. Trained on real Western Maharashtra district data; crop and soil nutrient levels together determine the recommendation.
                </p>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>95% TOP-1 · 98% TOP-3</span>
            </div>

            <div className="why-editorial-cell">
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>03 • YIELD FORECASTING</span>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>XGBoost Regressor</h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Given a crop, state, season, year, and field area, this model estimates production in tonnes. Unlike the other two models, this predicts a continuous number, not a category — a sugarcane field and a lentil field aren't directly comparable in raw tonnage, so forecasts are always specific to the selected crop. Trained on 242,000+ real district-level Indian government agricultural records spanning 1997–2015.
                </p>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>R² = 0.98</span>
            </div>
          </div>
        </div>

        {/* Technical Call to Action Console */}
        <div className="about-cta-banner" style={{ border: '1px solid var(--agri-line)', backgroundColor: 'var(--agri-surface)', textAlign: 'center' }}>
          <span className="mono-accent" style={{ display: 'block', marginBottom: '0.75rem' }}>SIMULATOR READY</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem', color: 'var(--agri-ink)' }}>
            Ready to Evaluate Your Field Parameters?
          </h2>
          <p style={{ color: 'var(--agri-secondary)', maxWidth: '560px', margin: '0 auto 2rem auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Run the Cropling field advisory simulator with your soil and regional parameters to compute high-yield crop recommendations, tailored fertilizer advice, and harvest yield forecasts.
          </p>
          <Link to="/recommend" className="btn-primary-technical">
            <i className="fa-solid fa-calculator"></i> LAUNCH ADVISORY SIMULATOR
          </Link>
        </div>
      </div>
    </main>
  );
}
