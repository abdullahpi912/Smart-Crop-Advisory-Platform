import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function FieldScanIntro() {
  const [activeModelTab, setActiveModelTab] = useState(0); // 0: Crop, 1: Fertilizer, 2: Yield
  const [isAutoCycling, setIsAutoCycling] = useState(true);

  const modelHighlights = [
    {
      id: 'crop',
      title: 'Crop Selection',
      icon: 'fa-wheat-awn',
      tag: 'RANDOM FOREST • 99.1%',
      primary: 'Paddy Rice 🌾',
      subtitle: 'Optimal for current NPK & rainfall vectors',
      badge: 'High Suitability',
      badgeClass: 'badge-crop-soft',
      metrics: [
        { label: 'NPK Ratio', value: '90:42:43' },
        { label: 'Soil pH', value: '6.5 (Neutral)' },
        { label: 'Precipitation', value: '202 mm' }
      ]
    },
    {
      id: 'fertilizer',
      title: 'Fertilizer Advisory',
      icon: 'fa-flask-vial',
      tag: 'DECISION TREE • 88.4%',
      primary: 'Urea (46% N)',
      subtitle: 'Targeted Nitrogen deficit replenishment',
      badge: 'Top-1 Recommendation',
      badgeClass: 'badge-fert-soft',
      metrics: [
        { label: 'District', value: 'Pune' },
        { label: 'Soil Type', value: 'Black Loam' },
        { label: 'Target Crop', value: 'Sugarcane' }
      ]
    },
    {
      id: 'yield',
      title: 'Yield Forecasting',
      icon: 'fa-chart-line',
      tag: 'XGBOOST PIPELINE',
      primary: '6.85 Metric Tonnes',
      subtitle: 'Projected 2.74 Tonnes / Hectare on 2.5 ha',
      badge: 'Harvest Forecast',
      badgeClass: 'badge-yield-soft',
      metrics: [
        { label: 'State', value: 'Maharashtra' },
        { label: 'Season', value: 'Kharif' },
        { label: 'Farm Area', value: '2.50 ha' }
      ]
    }
  ];

  // Auto-cycle through the 3 models every 4 seconds unless user manually interacts
  useEffect(() => {
    if (!isAutoCycling) return;
    const timer = setInterval(() => {
      setActiveModelTab((prev) => (prev + 1) % modelHighlights.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [isAutoCycling, modelHighlights.length]);

  const activeHighlight = modelHighlights[activeModelTab];

  return (
    <section className="hero-modern-section" aria-label="Cropling Agricultural Advisory Platform">
      <div className="page-container">
        <div className="hero-unified-grid">
          {/* Left Column: Typography, Value Proposition & Action CTAs */}
          <div className="hero-unified-left">
            {/* Main Headline */}
            <h1 className="hero-display-title">
              GROW SMARTER.<br />
              HARVEST <span className="hero-accent-text">BETTER.</span>
            </h1>

            {/* Description Text */}
            <p className="hero-description-text">
              Cropling delivers data-backed crop selection, targeted fertilizer dosing, and harvest yield forecasts using soil NPK chemistry and localized climate metrics — eliminating guesswork across every agricultural season.
            </p>

            {/* Action Buttons */}
            <div className="hero-btn-row">
              <Link to="/recommend" className="btn-primary-technical">
                <i className="fa-solid fa-calculator"></i> GET RECOMMENDATION
              </Link>
              <Link to="/dashboard" className="btn-secondary-technical">
                <i className="fa-solid fa-database"></i> VIEW HISTORY LOG
              </Link>
            </div>

            {/* 3-Model Quick Switcher Pills */}
            <div className="hero-models-strip">
              <span className="hero-models-label">EXPLORE ML MODELS:</span>
              <div className="hero-model-pills" role="tablist">
                {modelHighlights.map((m, idx) => {
                  const isActive = activeModelTab === idx;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`hero-model-pill-btn ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setActiveModelTab(idx);
                        setIsAutoCycling(false); // Pause auto-cycle when clicked
                      }}
                    >
                      <i className={`fa-solid ${m.icon}`}></i>
                      <span>{m.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Clean Framed Photograph with Live Glassmorphic Overlay Spotlight */}
          <div className="hero-unified-right">
            <div className="hero-showcase-card">
              {/* Agricultural Photography */}
              <div className="hero-img-container">
                <img
                  src="/Farmer_image/istockphoto-506164764-170667a.jpg"
                  alt="Precision agricultural tractor working in healthy green fields"
                  className="hero-subject-img"
                />
                <div className="hero-img-overlay-gradient" />

                {/* Bottom Floating Glassmorphic Prediction Spotlight Card */}
                <div className="hero-spotlight-glass-card">
                  <div className="hero-spotlight-header">
                    <div className="hero-spotlight-meta">
                      <span className="hero-spotlight-tag">{activeHighlight.tag}</span>
                      <h4 className="hero-spotlight-title">{activeHighlight.primary}</h4>
                    </div>
                    <span className={`hero-spotlight-badge ${activeHighlight.badgeClass}`}>
                      {activeHighlight.badge}
                    </span>
                  </div>

                  <p className="hero-spotlight-sub">{activeHighlight.subtitle}</p>

                  <div className="hero-spotlight-metrics-row">
                    {activeHighlight.metrics.map((met, i) => (
                      <div key={i} className="hero-metric-chip">
                        <span className="hero-chip-label">{met.label}</span>
                        <span className="hero-chip-val">{met.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress Indicators for 3 Models */}
                  <div className="hero-stepper-dots">
                    {modelHighlights.map((_, i) => (
                      <span
                        key={i}
                        className={`hero-stepper-dot ${activeModelTab === i ? 'active' : ''}`}
                        onClick={() => {
                          setActiveModelTab(i);
                          setIsAutoCycling(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Matrix Below Image (Updated with 3-Model Platform Scope) */}
              <div className="hero-stats-row">
                <div className="hero-stat-cell">
                  <div className="hero-stat-value">7 INPUTS</div>
                  <div className="hero-stat-label">SOIL &amp; CLIMATE</div>
                </div>
                <div className="hero-stat-cell">
                  <div className="hero-stat-value">3-MODEL AI</div>
                  <div className="hero-stat-label">CROP • FERTILIZER • YIELD</div>
                </div>
                <div className="hero-stat-cell">
                  <div className="hero-stat-value">PLOT LOGS</div>
                  <div className="hero-stat-label">SECURE FARM HISTORY</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
