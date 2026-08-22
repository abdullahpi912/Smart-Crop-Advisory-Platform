import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function FieldScanIntro() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0.2); // Start with active visual engagement
  const [isPlaying, setIsPlaying] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setProgress(1.0);
    }
  }, []);

  // Auto-scan cycle animation when user clicks "Run Scan" or plays
  useEffect(() => {
    if (!isPlaying || reducedMotion) return;

    let animId;
    let lastTime = performance.now();

    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setProgress((prev) => {
        const next = prev + delta * 0.25; // 4 second smooth scan
        if (next >= 1.0) {
          setIsPlaying(false);
          return 1.0;
        }
        return next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, reducedMotion]);

  // Passive scroll progress computation (0.0 to 1.0)
  useEffect(() => {
    if (reducedMotion || isPlaying) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const scrollDistance = containerRef.current.offsetHeight - window.innerHeight;
            if (scrollDistance > 0) {
              const p = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
              setProgress(p);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion, isPlaying]);

  // Desktop subtle pointer depth
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 5;
      const y = (e.clientY / innerHeight - 0.5) * 5;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  // Scan calculations
  const scanLineX = clamp(progress * 100, 0, 100);

  // System metadata status text
  const getSystemStatus = (p) => {
    if (p < 0.25) return { code: 'SCANNER ARMED', color: '#15803D' };
    if (p < 0.65) return { code: 'ANALYZING SPECTRUM', color: 'var(--agri-signal, #2F5BFF)' };
    if (p < 0.90) return { code: 'CLASSIFYING VECTORS', color: 'var(--agri-signal, #2F5BFF)' };
    return { code: 'SYSTEM READY', color: '#15803D' };
  };

  const status = getSystemStatus(progress);

  // SVG Data Trace stroke progress
  const traceProgress = clamp(progress / 0.85, 0, 1);
  const traceDashoffset = 340 * (1 - traceProgress);

  // Data Signal Points on Agricultural Image
  const signalPoints = [
    { label: 'NPK 140:60:40', top: '24%', left: '20%', trigger: 0.18 },
    { label: 'SOIL pH 6.8', top: '48%', left: '38%', trigger: 0.35 },
    { label: 'TEMP 24.5°C', top: '30%', left: '65%', trigger: 0.52 },
    { label: 'MOISTURE 62%', top: '70%', left: '48%', trigger: 0.64 },
    { label: 'ALLUVIAL LOAM', top: '42%', left: '82%', trigger: 0.76 },
    { label: 'AI MATCH 98%', top: '65%', left: '76%', trigger: 0.88 }
  ];

  return (
    <section ref={containerRef} className="field-scan-section" aria-label="AgriSense AI Field Intelligence Activation">
      <div className="field-scan-viewport">
        <div className="page-container" style={{ width: '100%' }}>
          {/* Top Technical Metadata HUD */}
          <div className="scan-meta-header">
            <div className="scan-meta-left">
              <span className="scan-mono-tag">AGRISENSE • AI-01</span>
              <span className="scan-meta-divider">|</span>
              <span className="scan-mono-sub">FIELD INTELLIGENCE &amp; SOIL TELEMETRY</span>
            </div>

            <div className="scan-meta-right">
              {/* Interactive Run Scan Button */}
              <button
                type="button"
                className={`scan-trigger-btn ${isPlaying ? 'active' : ''}`}
                onClick={() => {
                  if (progress >= 0.98) setProgress(0);
                  setIsPlaying((prev) => !prev);
                }}
                aria-label={isPlaying ? "Pause field scan" : "Run AI field scan"}
              >
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-radar'}`}></i>
                <span>{isPlaying ? 'PAUSE SCAN' : 'RUN AI SCAN'}</span>
              </button>

              <div className="scan-status-pill">
                <span
                  className="pulse-indicator"
                  style={{
                    backgroundColor: status.color,
                    boxShadow: `0 0 8px ${status.color}`
                  }}
                />
                <span className="scan-status-text" style={{ color: status.color }}>
                  {status.code}
                </span>
              </div>
            </div>
          </div>

          {/* Unified 2-Column Hero Composition */}
          <div className="hero-unified-grid" style={{ position: 'relative' }}>
            {/* Left Column: Headline, Description & CTAs (Always Visible & Engaging) */}
            <div
              className="hero-unified-left"
              style={{
                transform: `translate(${mouseOffset.x * -0.4}px, ${mouseOffset.y * -0.4}px)`,
                transition: 'transform 0.15s ease-out'
              }}
            >
              {/* Badge */}
              <div className="scan-feature-badge">
                <span className="scan-badge-dot"></span>
                <span className="scan-badge-text">PRECISION AGRONOMIC CLASSIFIER</span>
              </div>

              {/* Main Headline */}
              <div className="scan-headline-wrapper">
                <h1 className="hero-display-title">
                  GROW SMARTER.<br />
                  HARVEST <span style={{ color: 'var(--agri-accent)' }}>BETTER.</span>
                </h1>
              </div>

              {/* Description Text */}
              <p className="hero-description-text">
                AgriSense delivers data-backed crop selection and precise fertilizer advisories using soil NPK chemistry, temperature, humidity, rainfall, and pH — eliminating guesswork in farming.
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

              {/* Technical Agronomic Pipeline Trace */}
              <div className="scan-svg-trace-container">
                <div className="scan-trace-header">
                  <span className="mono-meta">DECISION PIPELINE</span>
                  <span className="scan-trace-pct">{Math.round(progress * 100)}% ANALYZED</span>
                </div>
                <svg viewBox="0 0 420 32" className="scan-svg-trace" preserveAspectRatio="none">
                  <path
                    d="M 10,16 L 90,16 L 120,16 L 210,16 L 240,16 L 330,16 L 360,16 L 410,16"
                    fill="none"
                    stroke="var(--agri-line)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M 10,16 L 90,16 L 120,16 L 210,16 L 240,16 L 330,16 L 360,16 L 410,16"
                    fill="none"
                    stroke="var(--agri-signal, #2F5BFF)"
                    strokeWidth="2"
                    strokeDasharray="340"
                    strokeDashoffset={reducedMotion ? 0 : traceDashoffset}
                  />
                </svg>

                <div className="scan-trace-nodes">
                  <span className={`scan-trace-node ${traceProgress > 0.15 ? 'active' : ''}`}>01 • SAMPLING</span>
                  <span className={`scan-trace-node ${traceProgress > 0.40 ? 'active' : ''}`}>02 • CLIMATE</span>
                  <span className={`scan-trace-node ${traceProgress > 0.65 ? 'active' : ''}`}>03 • AI MODEL</span>
                  <span className={`scan-trace-node ${traceProgress > 0.90 ? 'active' : ''}`}>04 • ADVISORY</span>
                </div>
              </div>
            </div>

            {/* Right Column: Framed Agricultural Photograph with Precision HUD & Scan Laser */}
            <div
              className="hero-unified-right"
              style={{
                transform: `translate(${mouseOffset.x * 0.5}px, ${mouseOffset.y * 0.5}px)`,
                transition: 'transform 0.15s ease-out'
              }}
            >
              <div className="hero-image-frame scan-frame-relative">
                {/* Image */}
                <img
                  src="/Farmer_image/istockphoto-506164764-170667a.jpg"
                  alt="Precision agricultural tractor working across farmland"
                  className="hero-subject-img"
                />

                {/* HUD Corner Targeting Reticles */}
                <div className="scan-hud-bracket top-left" />
                <div className="scan-hud-bracket top-right" />
                <div className="scan-hud-bracket bottom-left" />
                <div className="scan-hud-bracket bottom-right" />

                {/* Precision Horizontal Scan Line */}
                {!reducedMotion && (
                  <div
                    className="scan-line-laser"
                    style={{
                      left: `${scanLineX}%`
                    }}
                  >
                    <div className="scan-line-head" />
                    <div className="scan-line-trail" />
                  </div>
                )}

                {/* Data Signal Points on Image */}
                {!reducedMotion && signalPoints.map((pt, idx) => {
                  const isActivated = progress >= pt.trigger;
                  return (
                    <div
                      key={idx}
                      className={`scan-signal-point ${isActivated ? 'active' : ''}`}
                      style={{
                        top: pt.top,
                        left: pt.left
                      }}
                    >
                      <span className="scan-point-dot" />
                      <span className="scan-point-label">{pt.label}</span>
                    </div>
                  );
                })}

                {/* Bottom Telemetry HUD Overlay Bar on Image */}
                <div className="scan-image-hud-bar">
                  <div className="scan-hud-cell">
                    <span className="scan-hud-tag">TARGET PLOT</span>
                    <span className="scan-hud-val">ZONE_04 / ALLUVIAL</span>
                  </div>
                  <div className="scan-hud-cell">
                    <span className="scan-hud-tag">SPECTRAL SCAN</span>
                    <span className="scan-hud-val" style={{ color: 'var(--agri-accent)' }}>
                      {Math.round(progress * 100)}% COMPLETE
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Matrix Below Image (Always Rendered) */}
              <div className="hero-stats-row">
                <div className="hero-stat-cell">
                  <div className="hero-stat-value">7 INPUTS</div>
                  <div className="hero-stat-label">SOIL &amp; CLIMATE</div>
                </div>
                <div className="hero-stat-cell">
                  <div className="hero-stat-value">DUAL AI</div>
                  <div className="hero-stat-label">CROP + FERTILIZER</div>
                </div>
                <div className="hero-stat-cell">
                  <div className="hero-stat-value">PLOT LOGS</div>
                  <div className="hero-stat-label">HISTORY TRACKING</div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Bottom Scroll Hint */}
          {progress < 0.25 && !reducedMotion && (
            <div className="scan-scroll-prompt">
              <span className="scan-scroll-text">SCROLL TO ANALYSE FIELD</span>
              <i className="fa-solid fa-arrow-down-long scan-scroll-arrow"></i>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
