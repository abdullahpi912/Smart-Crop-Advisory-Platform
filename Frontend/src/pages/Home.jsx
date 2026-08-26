import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FieldScanIntro from '../components/FieldScanIntro';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [stickyProgress, setStickyProgress] = useState(0);

  const stickySectionRef = useRef(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Passive Single Scroll Listener for Sticky Stage Progress
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Sticky section scroll progress
          if (stickySectionRef.current) {
            const rect = stickySectionRef.current.getBoundingClientRect();
            const sectionHeight = stickySectionRef.current.offsetHeight - window.innerHeight;
            const progress = Math.min(Math.max(-rect.top / sectionHeight, 0), 1);
            setStickyProgress(progress);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = [
    {
      q: 'How does Cropling predict the best crop for my specific field?',
      a: 'Cropling analyzes primary soil nutrient vectors (Nitrogen, Phosphorus, Potassium), soil acidity (pH), and local climate parameters (temperature, relative humidity, annual precipitation) against trained Random Forest models to identify optimum high-yield crop matches across 22 crop classes.'
    },
    {
      q: 'What is the difference between Crop Selection, Fertilizer Advisory, and Yield Forecasting?',
      a: 'Crop Selection evaluates soil chemistry and climate to recommend the highest-yielding crop species. Fertilizer Advisory uses Decision Tree classification to identify specific nutrient deficits and recommend optimal formulations (such as Urea, DAP, or NPK blends). Yield Forecasting uses an XGBoost regressor pipeline to estimate harvest output in tonnes based on regional historical patterns, season, and farm area.'
    },
    {
      q: 'Are the recommendations accurate for smallholder farms?',
      a: 'Yes. The machine learning models are trained and calibrated on comprehensive agricultural research and production datasets spanning tropical, semi-arid, and temperate farming regions.'
    },
    {
      q: 'Can I save my recommendation history for future reference?',
      a: 'Yes. Every computed advisory report can be permanently stored in your farm dashboard history log, allowing multi-plot tracking across agricultural seasons with strict per-farmer privacy.'
    }
  ];

  const fieldInputs = [
    { code: 'N', name: 'NITROGEN', desc: 'Promotes vegetative leaf and stem development', metric: '0 – 140 kg/ha' },
    { code: 'P', name: 'PHOSPHORUS', desc: 'Accelerates root crown strength and flowering', metric: '5 – 145 kg/ha' },
    { code: 'K', name: 'POTASSIUM', desc: 'Improves drought and disease stress resistance', metric: '5 – 205 kg/ha' },
    { code: 'pH', name: 'SOIL pH', desc: 'Defines soil acidity/alkalinity for nutrient uptake', metric: '3.5 – 9.9 pH' },
    { code: 'T', name: 'TEMPERATURE', desc: 'Regional thermal range for crop metabolism', metric: '8.8 – 43.7 °C' },
    { code: 'H', name: 'HUMIDITY', desc: 'Atmospheric moisture and transpiration rate', metric: '14.2 – 99.8 %' },
    { code: 'R', name: 'RAINFALL', desc: 'Seasonal precipitation budget for irrigation', metric: '20 – 298 mm' }
  ];

  const workflowSteps = [
    { num: '01', title: 'Soil Chemical Sampling', desc: 'Input field test readings including Nitrogen (N), Phosphorus (P), Potassium (K), and soil pH level.', tag: 'SAMPLING' },
    { num: '02', title: 'Climate & Regional Sync', desc: 'Correlate field readings with regional seasonal temperature, humidity, rainfall, and state/district bounds.', tag: 'ENVIRONMENT' },
    { num: '03', title: 'ML Prediction Models', desc: 'Trained Random Forest, Decision Tree, and XGBoost models evaluate inputs to output optimal crop, fertilizer, and harvest forecasts.', tag: '3-MODEL SUITE' },
    { num: '04', title: 'Fertilizer & Yield Analysis', desc: 'Receive targeted nutrient shortfall calculations and estimated harvest production in metric tonnes.', tag: 'DOSAGE & YIELD' },
    { num: '05', title: 'Farm History Telemetry', desc: 'Store advisory reports into your secure farm plot log to track soil enrichment across harvest cycles.', tag: 'DATABASE' },
    { num: '06', title: 'Yield Optimization', desc: 'Execute data-backed planting and nutrient schedules to maximize commercial yield and profitability.', tag: 'EXECUTION' }
  ];

  // Pipeline stage index based on sticky scroll progress
  const activePipelineStep = Math.min(Math.floor(stickyProgress * 4), 3);

  return (
    <main>
      {/* ====================================================================
          01 HERO: Cinematic AI Field Intelligence Opening & Precision Layout
          ==================================================================== */}
      <FieldScanIntro />

      {/* ====================================================================
          02 FIELD INTELLIGENCE: 7 Technical Input Vectors
          ==================================================================== */}
      <section className="section-pad reveal" id="field-intelligence">
        <div className="page-container">
          <div className="section-header-editorial">
            <div className="section-meta-row">
              <span className="mono-accent">FIELD INPUTS</span>
              <div className="section-meta-rule"></div>
              <span className="mono-meta">PRIMARY AGRONOMIC VECTORS</span>
            </div>
            <h2 className="section-title-large">Field Chemical &amp; Climate Parameters</h2>
            <p className="section-desc-editorial">
              Essential agricultural indicators evaluated across three machine learning models to classify crop suitability, fertilizer formulations, and harvest output.
            </p>
          </div>

          <div className="field-intel-grid">
            {fieldInputs.map((item) => (
              <div key={item.code} className="field-intel-item">
                <div>
                  <span className="intel-num">{item.code}</span>
                  <h3 className="intel-title">{item.name}</h3>
                  <p className="intel-role">{item.desc}</p>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--agri-line)' }}>
                  <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>{item.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          03 STICKY AI FIELD ANALYSIS STAGE (Scroll-Driven Workflow)
          ==================================================================== */}
      <section className="sticky-analysis-section" ref={stickySectionRef} id="pipeline-stage">
        <div className="sticky-analysis-stage">
          {/* Background Marquee Motion */}
          <div
            className="marquee-bg-word"
            style={{ transform: `translate(calc(-10% + ${stickyProgress * -150}px), -50%)` }}
            aria-hidden="true"
          >
            FIELD INTELLIGENCE • ADVISORY PIPELINE
          </div>

          {/* Sticky Header Meta */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--agri-line)', paddingBottom: '1rem' }}>
            <div>
              <span className="mono-accent">SYSTEM FLOW</span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>AI Field Analysis Execution</h3>
            </div>
          </div>

          {/* Interactive Pipeline Display Node Grid */}
          <div className="analysis-pipeline-display">
            {[
              { num: '01', stage: 'RAW FIELD DATA', detail: 'Ingesting soil N-P-K chemical readings and soil pH bounds.', metric: 'NPK + pH' },
              { num: '02', stage: 'FEATURE NORMALIZATION', detail: 'Correlating with atmospheric humidity, thermal curve, and rainfall.', metric: 'TEMP + RAIN' },
              { num: '03', stage: '3-MODEL INFERENCE', detail: 'Random Forest, Decision Tree, and XGBoost pipeline execution.', metric: 'CLASSIFIERS & REGRESSOR' },
              { num: '04', stage: 'COMPREHENSIVE ADVISORY', detail: 'Synthesizing crop selection, fertilizer dosage, and yield forecasts.', metric: 'OUTPUT LOG' }
            ].map((node, idx) => (
              <div
                key={node.num}
                className={`pipeline-node ${activePipelineStep === idx ? 'active-node' : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>{node.metric}</span>
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: 'var(--agri-ink)' }}>
                  {node.stage}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--agri-secondary)', lineHeight: 1.5 }}>
                  {node.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Sticky Footer Trace */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--agri-line)', paddingTop: '1rem' }}>
            <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>
              SCROLL DRIVEN ADVISORY SIMULATION
            </span>
            <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>
              CROPLING 3-MODEL PIPELINE READY
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          04 AI PROOF: Dark Inverted Architecture with SVG Data Trace
          ==================================================================== */}
      <section className="ai-proof-dark reveal" id="ai-engine">
        <div className="page-container">
          <div className="proof-grid">
            <div>
              <div className="section-meta-row">
                <span className="mono-accent">ARCHITECTURAL PROOF</span>
                <div className="section-meta-rule" style={{ backgroundColor: 'var(--agri-accent)' }}></div>
                <span className="mono-meta" style={{ color: '#85858B' }}>MULTI-MODEL ENGINE</span>
              </div>
              <h2 className="section-title-large" style={{ color: '#EFEFEE' }}>
                Precision Advisory Architecture
              </h2>
              <p style={{ color: '#B7B7BC', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2rem' }}>
                Traditional crop selection relies on historical seasonal intuition, which can fail under soil degradation or climate shifts. Cropling combines multi-parameter classification and regression models to deliver statistical recommendations across crop suitability, fertilizer requirements, and harvest yield estimates.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', borderTop: '1px solid rgba(239,239,238,0.12)', paddingTop: '1.5rem' }}>
                <div>
                  <span className="mono-meta" style={{ color: '#7C97FF' }}>INPUT PARAMETERS</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px', color: '#EFEFEE' }}>Soil &amp; Climate Vectors</div>
                  <span className="mono-meta" style={{ color: '#85858B' }}>NPK, pH, Climate, Region &amp; Area</span>
                </div>
                <div>
                  <span className="mono-meta" style={{ color: '#7C97FF' }}>ADVISORY ENGINE</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px', color: '#EFEFEE' }}>3-Model Suite</div>
                  <span className="mono-meta" style={{ color: '#85858B' }}>Crop, Fertilizer &amp; Yield Regressor</span>
                </div>
              </div>
            </div>

            {/* SVG Data Pipeline Animation */}
            <div className="svg-trace-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span className="mono-meta" style={{ color: '#7C97FF' }}>DATA VECTOR PIPELINE</span>
                <span className="pulse-indicator"></span>
              </div>

              <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
                {/* Background Connection Lines */}
                <path d="M 50 40 L 160 120 L 260 120 L 350 40" stroke="rgba(239, 239, 238, 0.15)" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 50 120 L 160 120 L 260 120 L 350 120" stroke="rgba(239, 239, 238, 0.15)" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 50 200 L 160 120 L 260 120 L 350 200" stroke="rgba(239, 239, 238, 0.15)" strokeWidth="2" strokeDasharray="4 4" />

                {/* Animated Primary Signal Trace */}
                <path d="M 50 40 L 160 120 L 260 120 L 350 120" stroke="#22C55E" strokeWidth="3" className="trace-line" />
                <path d="M 50 200 L 160 120 L 260 120 L 350 40" stroke="#22C55E" strokeWidth="2" className="trace-line" />

                {/* Node Markers */}
                <circle cx="50" cy="40" r="8" fill="#141418" stroke="#22C55E" strokeWidth="2" />
                <circle cx="50" cy="120" r="8" fill="#141418" stroke="#22C55E" strokeWidth="2" />
                <circle cx="50" cy="200" r="8" fill="#141418" stroke="#22C55E" strokeWidth="2" />

                <circle cx="160" cy="120" r="10" fill="#16A34A" stroke="#EFEFEE" strokeWidth="2" />
                <circle cx="260" cy="120" r="10" fill="#16A34A" stroke="#EFEFEE" strokeWidth="2" />

                <circle cx="350" cy="40" r="8" fill="#141418" stroke="#4ADE80" strokeWidth="2" />
                <circle cx="350" cy="120" r="8" fill="#141418" stroke="#4ADE80" strokeWidth="2" />
                <circle cx="350" cy="200" r="8" fill="#141418" stroke="#4ADE80" strokeWidth="2" />

                {/* Labels in SVG */}
                <text x="50" y="24" fill="#85858B" fontSize="9" fontFamily="monospace" textAnchor="middle">SOIL NPK</text>
                <text x="50" y="104" fill="#85858B" fontSize="9" fontFamily="monospace" textAnchor="middle">SOIL pH</text>
                <text x="50" y="184" fill="#85858B" fontSize="9" fontFamily="monospace" textAnchor="middle">CLIMATE</text>

                <text x="210" y="96" fill="#22C55E" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">3-ML ENGINE</text>

                <text x="350" y="24" fill="#4ADE80" fontSize="9" fontFamily="monospace" textAnchor="middle">CROP MATCH</text>
                <text x="350" y="104" fill="#4ADE80" fontSize="9" fontFamily="monospace" textAnchor="middle">FERTILIZER</text>
                <text x="350" y="184" fill="#4ADE80" fontSize="9" fontFamily="monospace" textAnchor="middle">YIELD</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          05 PRECISION WORKFLOW: Ruled Process Timeline
          ==================================================================== */}
      <section className="section-pad reveal" id="workflow">
        <div className="page-container">
          <div className="section-header-editorial">
            <div className="section-meta-row">
              <span className="mono-accent">WORKFLOW</span>
              <div className="section-meta-rule"></div>
              <span className="mono-meta">END-TO-END PROCESS</span>
            </div>
            <h2 className="section-title-large">End-to-End Precision Advisory Workflow</h2>
            <p className="section-desc-editorial">
              How Cropling transforms raw soil chemical readings and regional parameters into actionable crop selection, targeted fertilizer recommendations, and harvest yield forecasts.
            </p>
          </div>

          <div className="workflow-timeline">
            {workflowSteps.map((step) => (
              <div key={step.num} className="workflow-row">
                <span className="workflow-step-num">{step.num}</span>
                <h3 className="workflow-title">{step.title}</h3>
                <p className="workflow-desc">{step.desc}</p>
                <span className="mono-meta workflow-meta-tag" style={{ textAlign: 'right', color: 'var(--agri-accent)' }}>
                  {step.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          06 WHY CROPLING: Ruled Editorial Modules
          ==================================================================== */}
      <section className="section-pad reveal" id="why">
        <div className="page-container">
          <div className="section-header-editorial">
            <div className="section-meta-row">
              <span className="mono-accent">ADVANTAGE</span>
              <div className="section-meta-rule"></div>
              <span className="mono-meta">DATA-BACKED PRECISION</span>
            </div>
            <h2 className="section-title-large">Smarter Soil &amp; Harvest Insights for Better Farming</h2>
            <p className="section-desc-editorial">
              Eliminate planting guesswork, reduce fertilizer expenses, forecast yield production, and preserve long-term soil health with automated agronomic guidance.
            </p>
          </div>

          <div className="why-editorial-grid">
            <div className="why-editorial-cell">
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>NUTRIENT PROFILING</span>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Smart NPK Nutrient Profiling</h3>
                <p style={{ color: 'var(--agri-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  Evaluates primary Nitrogen, Phosphorus, and Potassium levels against Soil pH to optimize root nutrition and prevent soil depletion.
                </p>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>BALANCED CHEMISTRY</span>
            </div>

            <div className="why-editorial-cell">
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>CLIMATE SYNC</span>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Weather &amp; Rainfall Matching</h3>
                <p style={{ color: 'var(--agri-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  Matches local seasonal temperatures, humidity, and rainfall thresholds to recommend resilient crops suited to your exact regional bounds.
                </p>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>SEASONAL SYNC</span>
            </div>

            <div className="why-editorial-cell">
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>RESOURCE EFFICIENCY</span>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Targeted Fertilizer Calculations</h3>
                <p style={{ color: 'var(--agri-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  Predicts tailored fertilizer formulations and dosage advice, helping you purchase only the inputs your soil and target crop actually need.
                </p>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>ZERO RESOURCE WASTE</span>
            </div>

            <div className="why-editorial-cell">
              <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>YIELD FORECASTING</span>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Data-Backed Harvest Estimates</h3>
                <p style={{ color: 'var(--agri-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  Estimates expected farm yield in metric tonnes and tonnes per hectare across regional seasons to support financial planning and supply chain forecasting.
                </p>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>PRODUCTION FORECAST</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          07 FAQ ACCORDION SECTION
          ==================================================================== */}
      <section className="section-pad reveal" id="faq">
        <div className="page-container">
          <div className="section-header-editorial" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
            <div className="section-meta-row" style={{ justifyContent: 'center' }}>
              <span className="mono-accent">FAQ</span>
              <div className="section-meta-rule"></div>
              <span className="mono-meta">QUESTIONS &amp; ANSWERS</span>
            </div>
            <h2 className="section-title-large">Frequently Asked Questions</h2>
          </div>

          <div className="faq-accordion-container" role="region" aria-label="Frequently Asked Questions">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              const btnId = `faq-btn-${idx}`;
              const panelId = `faq-panel-${idx}`;
              return (
                <div key={idx} className="faq-editorial-item">
                  <button
                    id={btnId}
                    type="button"
                    className="faq-trigger-btn"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleFaq(idx)}
                  >
                    <span className="faq-question-text">{faq.q}</span>
                    <span className="faq-icon-indicator" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                      +
                    </span>
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className={`faq-content-collapse ${isOpen ? 'open' : ''}`}
                  >
                    <div className="faq-inner-text">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
