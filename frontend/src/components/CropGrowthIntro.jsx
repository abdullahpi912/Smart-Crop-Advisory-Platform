import React, { useState, useEffect, useRef } from 'react';

export default function CropGrowthIntro() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0.2); // Start with initial visible state
  const [isPlaying, setIsPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setProgress(1.0);
    }
  }, []);

  // Auto-play animation loop when user clicks "Play"
  useEffect(() => {
    if (!isPlaying || reducedMotion) return;

    let animId;
    let lastTime = performance.now();

    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setProgress((prev) => {
        const next = prev + delta * 0.12; // Complete cycle in ~8 seconds
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

  // Passive scroll progress sync when user scrolls the container
  useEffect(() => {
    if (reducedMotion || isPlaying) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const windowH = window.innerHeight || 800;
            // Calculate progress as the section passes through the viewport
            const sectionH = containerRef.current.offsetHeight;
            const startY = rect.top;
            const scrollDistance = sectionH - windowH * 0.5;

            if (startY <= windowH && startY >= -scrollDistance) {
              const p = Math.min(Math.max((windowH * 0.8 - startY) / (scrollDistance + windowH * 0.3), 0), 1);
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

  // High-performance Canvas Rain Simulation
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth || 800;
        canvas.height = canvas.offsetHeight || 500;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Raindrop particle pool
    const maxDrops = 100;
    const drops = [];
    for (let i = 0; i < maxDrops; i++) {
      drops.push({
        x: Math.random() * (canvas.width || 800),
        y: Math.random() * (canvas.height || 500),
        length: 12 + Math.random() * 16,
        speed: 14 + Math.random() * 12,
        opacity: 0.3 + Math.random() * 0.45
      });
    }

    const splashes = [];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Rain intensity mapped from progress (active between 0.12 and 0.54)
      let intensity = 0;
      if (progress >= 0.12 && progress <= 0.32) {
        intensity = (progress - 0.12) / 0.20;
      } else if (progress > 0.32 && progress <= 0.44) {
        intensity = 1.0;
      } else if (progress > 0.44 && progress <= 0.54) {
        intensity = 1.0 - (progress - 0.44) / 0.10;
      }

      const activeDropCount = Math.floor(intensity * maxDrops);

      if (activeDropCount > 0) {
        const soilY = canvas.height * 0.58;

        for (let i = 0; i < activeDropCount; i++) {
          const d = drops[i];
          d.y += d.speed;
          d.x += 0.8;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(180, 220, 235, ${d.opacity * intensity})`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + 1.2, d.y + d.length);
          ctx.stroke();

          if (d.y >= soilY) {
            if (splashes.length < 20 && Math.random() < 0.3) {
              splashes.push({
                x: d.x,
                y: soilY + (Math.random() * 6 - 3),
                radius: 1,
                maxRadius: 5 + Math.random() * 5,
                alpha: 0.5 * intensity
              });
            }
            d.y = -d.length;
            d.x = Math.random() * canvas.width;
          }
        }

        // Render droplet impact ripples
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          s.radius += 0.6;
          s.alpha *= 0.88;

          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius * 2, s.radius * 0.7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(190, 230, 240, ${s.alpha})`;
          ctx.stroke();

          if (s.alpha < 0.05 || s.radius >= s.maxRadius) {
            splashes.splice(i, 1);
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [progress, reducedMotion]);

  // Stage classification
  const getStageMetadata = (p) => {
    if (p < 0.15) return { stage: 'DRY TERRAIN', desc: 'PARCHED LOAM MATRIX', code: '01/07' };
    if (p < 0.35) return { stage: 'PRECIPITATION', desc: 'SEASONAL RAINFALL', code: '02/07' };
    if (p < 0.48) return { stage: 'SOIL ABSORPTION', desc: 'NUTRIENT HYDRATION', code: '03/07' };
    if (p < 0.60) return { stage: 'GERMINATION', desc: 'SEED EMBRYO & ROOTS', code: '04/07' };
    if (p < 0.74) return { stage: 'EMERGENCE', desc: 'COTYLEDON SPROUTING', code: '05/07' };
    if (p < 0.88) return { stage: 'VEGETATIVE EXPANSION', desc: 'CANOPY TILLERING', code: '06/07' };
    return { stage: 'MATURE HARVEST', desc: 'GRAIN FORMATION', code: '07/07' };
  };

  const meta = getStageMetadata(progress);
  const percent = Math.round(progress * 100);

  const filledCells = Math.min(Math.floor(progress * 12), 12);
  const asciiBar = '█'.repeat(filledCells) + '░'.repeat(12 - filledCells);

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  // Dynamic Soil Color Interpolation
  const soilMoisture = clamp((progress - 0.20) / 0.30, 0, 1);
  const soilColorTop = soilMoisture < 0.5
    ? `rgb(${Math.round(138 - soilMoisture * 80)}, ${Math.round(98 - soilMoisture * 50)}, ${Math.round(64 - soilMoisture * 38)})`
    : `rgb(${Math.round(98 - (soilMoisture - 0.5) * 80)}, ${Math.round(73 - (soilMoisture - 0.5) * 60)}, ${Math.round(45 - (soilMoisture - 0.5) * 40)})`;

  const soilColorBottom = `rgb(${Math.round(70 - soilMoisture * 45)}, ${Math.round(45 - soilMoisture * 30)}, ${Math.round(25 - soilMoisture * 18)})`;

  // Seed & Root dynamics (Seed visible from 0.0 with dormancy, cracks at 0.46)
  const seedCrack = clamp((progress - 0.46) / 0.08, 0, 1);
  const rootProgress = clamp((progress - 0.46) / 0.22, 0, 1);

  // Stem & Shoot dynamics
  const stemProgress = clamp((progress - 0.52) / 0.34, 0, 1);

  // Leaf Unfurling dynamics
  const leaf1Prog = clamp((progress - 0.58) / 0.16, 0, 1);
  const leaf2Prog = clamp((progress - 0.62) / 0.16, 0, 1);
  const leaf3Prog = clamp((progress - 0.67) / 0.16, 0, 1);
  const leaf4Prog = clamp((progress - 0.72) / 0.16, 0, 1);
  const leaf5Prog = clamp((progress - 0.77) / 0.15, 0, 1);
  const leaf6Prog = clamp((progress - 0.81) / 0.14, 0, 1);

  // Mature Wheat / Grain Spikelet
  const grainProg = clamp((progress - 0.80) / 0.15, 0, 1);

  const stages = [
    { label: '01 Dry', val: 0.05 },
    { label: '02 Rain', val: 0.28 },
    { label: '03 Soil', val: 0.42 },
    { label: '04 Seed', val: 0.54 },
    { label: '05 Sprout', val: 0.68 },
    { label: '06 Growth', val: 0.82 },
    { label: '07 Harvest', val: 0.98 }
  ];

  return (
    <section ref={containerRef} className="growth-dashboard-section" aria-label="Crop Growth Lifecycle Simulator">
      {/* Interactive Stage & Playback Controller Bar */}
      <div className="growth-controls-bar">
        <div className="growth-playback-group">
          <button
            type="button"
            className="growth-play-btn"
            onClick={() => {
              if (progress >= 0.99) setProgress(0);
              setIsPlaying((prev) => !prev);
            }}
            aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
            title={isPlaying ? "Pause simulation" : "Play simulation"}
          >
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            <span>{isPlaying ? 'PAUSE' : 'PLAY CYCLE'}</span>
          </button>

          <button
            type="button"
            className="growth-reset-btn"
            onClick={() => {
              setIsPlaying(false);
              setProgress(0);
            }}
            title="Reset to Dry Soil"
          >
            <i className="fa-solid fa-rotate-left"></i>
          </button>
        </div>

        {/* Quick Jump Stage Buttons */}
        <div className="growth-stage-chips">
          {stages.map((st) => (
            <button
              key={st.label}
              type="button"
              className={`growth-stage-chip ${Math.abs(progress - st.val) < 0.12 ? 'active' : ''}`}
              onClick={() => {
                setIsPlaying(false);
                setProgress(st.val);
              }}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Scrubber Range Slider */}
        <div className="growth-scrubber-wrap">
          <span className="growth-scrubber-label">{percent}%</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={progress}
            onChange={(e) => {
              setIsPlaying(false);
              setProgress(parseFloat(e.target.value));
            }}
            className="growth-range-slider"
            aria-label="Crop growth sequence progress slider"
          />
        </div>
      </div>

      {/* Main Canvas & SVG Stage Viewport */}
      <div className="growth-stage-frame">
        {/* Dynamic Sky Background */}
        <div
          className="growth-sky-bg"
          style={{
            background: progress < 0.4
              ? `linear-gradient(180deg, #D4E5DB 0%, #C4DDD0 60%, ${soilColorTop} 100%)`
              : progress < 0.75
                ? `linear-gradient(180deg, #CFE8DA 0%, #BFE0CD 60%, ${soilColorTop} 100%)`
                : `linear-gradient(180deg, #D6EFE1 0%, #C6E9D3 60%, ${soilColorTop} 100%)`
          }}
        />

        {/* Rain Canvas Layer */}
        <canvas ref={canvasRef} className="growth-rain-canvas" />

        {/* Soil Horizon Layer */}
        <div
          className="growth-soil-layer"
          style={{
            background: `linear-gradient(180deg, ${soilColorTop} 0%, ${soilColorBottom} 100%)`
          }}
        >
          <div
            className="growth-soil-surface"
            style={{
              borderColor: soilMoisture > 0.4 ? 'rgba(30, 20, 10, 0.6)' : 'rgba(90, 60, 35, 0.4)',
              boxShadow: soilMoisture > 0.5 ? '0 -2px 14px rgba(20, 45, 30, 0.3) inset' : 'none'
            }}
          />
          <div className="growth-soil-particles" style={{ opacity: 0.35 + soilMoisture * 0.25 }} />
        </div>

        {/* Botanical SVG Architecture */}
        <div className={`growth-svg-container ${progress > 0.88 && !reducedMotion ? 'growth-sway' : ''}`}>
          <svg
            viewBox="0 0 600 700"
            className="growth-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="rootGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5E6D3" />
                <stop offset="100%" stopColor="#C4A882" />
              </linearGradient>

              <linearGradient id="stemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="40%" stopColor="#15803D" />
                <stop offset="100%" stopColor="#166534" />
              </linearGradient>

              <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="60%" stopColor="#15803D" />
                <stop offset="100%" stopColor="#0E4E25" />
              </linearGradient>

              <linearGradient id="grainGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#15803D" />
                <stop offset="40%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>

              <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#062E18" floodOpacity="0.18" />
              </filter>
            </defs>

            {/* 01. ROOT NETWORK */}
            {rootProgress > 0 && (
              <g className="growth-roots" filter="url(#subtleGlow)">
                <path
                  d="M300,480 C298,515 304,560 300,650"
                  fill="none"
                  stroke="url(#rootGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="200"
                  strokeDashoffset={200 * (1 - rootProgress)}
                />
                <path
                  d="M300,505 C275,530 240,560 215,615"
                  fill="none"
                  stroke="url(#rootGrad)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeDasharray="140"
                  strokeDashoffset={140 * (1 - clamp(rootProgress * 1.3 - 0.2, 0, 1))}
                />
                <path
                  d="M300,520 C325,545 360,575 390,625"
                  fill="none"
                  stroke="url(#rootGrad)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeDasharray="140"
                  strokeDashoffset={140 * (1 - clamp(rootProgress * 1.3 - 0.3, 0, 1))}
                />
                <path
                  d="M298,555 C265,580 235,620 200,660"
                  fill="none"
                  stroke="url(#rootGrad)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray="120"
                  strokeDashoffset={120 * (1 - clamp(rootProgress * 1.4 - 0.4, 0, 1))}
                />
                <path
                  d="M302,570 C330,600 365,630 405,665"
                  fill="none"
                  stroke="url(#rootGrad)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray="120"
                  strokeDashoffset={120 * (1 - clamp(rootProgress * 1.4 - 0.5, 0, 1))}
                />
              </g>
            )}

            {/* 02. THE SEED */}
            <g
              className="growth-seed"
              style={{
                transform: `translate(300px, 475px) scale(${0.85 + clamp(progress * 0.3, 0, 0.3)})`,
                transformOrigin: '0 0'
              }}
            >
              <path
                d="M0,-8 C-8,-4 -10,6 -2,12 C-1,10 -2,4 0,-8 Z"
                fill="#785028"
                stroke="#543615"
                strokeWidth="1"
                style={{
                  transform: `translateX(${-seedCrack * 4}px) rotate(${-seedCrack * 12}deg)`
                }}
              />
              <path
                d="M0,-8 C8,-4 10,6 2,12 C1,10 2,4 0,-8 Z"
                fill="#8B5E34"
                stroke="#543615"
                strokeWidth="1"
                style={{
                  transform: `translateX(${seedCrack * 4}px) rotate(${seedCrack * 12}deg)`
                }}
              />
              {seedCrack > 0.25 && (
                <circle cx="0" cy="2" r="3.2" fill="#86EFAC" />
              )}
            </g>

            {/* 03. MAIN STEM */}
            {stemProgress > 0 && (
              <g className="growth-stem-group">
                <path
                  d="M300,475 C299,420 301,320 299,220 C298,160 300,120 300,90"
                  fill="none"
                  stroke="url(#stemGrad)"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeDasharray="400"
                  strokeDashoffset={400 * (1 - stemProgress)}
                />
              </g>
            )}

            {/* 04. BOTANICAL LEAVES */}
            {leaf1Prog > 0 && (
              <g
                style={{
                  transform: `translate(299px, 380px) scale(${leaf1Prog}) rotate(${-38 * leaf1Prog}deg)`,
                  transformOrigin: '0 0'
                }}
              >
                <path d="M0,0 C-30,-15 -65,-10 -95,15 C-65,30 -25,20 0,0 Z" fill="url(#leafGrad)" stroke="#166534" strokeWidth="1.2" />
                <path d="M0,0 C-35,-2 -65,5 -90,14" fill="none" stroke="#86EFAC" strokeWidth="0.8" opacity="0.6" />
              </g>
            )}

            {leaf2Prog > 0 && (
              <g
                style={{
                  transform: `translate(300px, 355px) scale(${leaf2Prog}) rotate(${40 * leaf2Prog}deg)`,
                  transformOrigin: '0 0'
                }}
              >
                <path d="M0,0 C30,-15 65,-10 95,15 C65,30 25,20 0,0 Z" fill="url(#leafGrad)" stroke="#166534" strokeWidth="1.2" />
                <path d="M0,0 C35,-2 65,5 90,14" fill="none" stroke="#86EFAC" strokeWidth="0.8" opacity="0.6" />
              </g>
            )}

            {leaf3Prog > 0 && (
              <g
                style={{
                  transform: `translate(299px, 300px) scale(${leaf3Prog}) rotate(${-48 * leaf3Prog}deg)`,
                  transformOrigin: '0 0'
                }}
              >
                <path d="M0,0 C-35,-20 -80,-15 -115,10 C-80,30 -30,22 0,0 Z" fill="url(#leafGrad)" stroke="#166534" strokeWidth="1.2" />
                <path d="M0,0 C-40,-5 -80,2 -110,9" fill="none" stroke="#86EFAC" strokeWidth="0.8" opacity="0.6" />
              </g>
            )}

            {leaf4Prog > 0 && (
              <g
                style={{
                  transform: `translate(300px, 260px) scale(${leaf4Prog}) rotate(${46 * leaf4Prog}deg)`,
                  transformOrigin: '0 0'
                }}
              >
                <path d="M0,0 C35,-20 80,-15 115,10 C80,30 30,22 0,0 Z" fill="url(#leafGrad)" stroke="#166534" strokeWidth="1.2" />
                <path d="M0,0 C40,-5 80,2 110,9" fill="none" stroke="#86EFAC" strokeWidth="0.8" opacity="0.6" />
              </g>
            )}

            {leaf5Prog > 0 && (
              <g
                style={{
                  transform: `translate(299px, 195px) scale(${leaf5Prog}) rotate(${-55 * leaf5Prog}deg)`,
                  transformOrigin: '0 0'
                }}
              >
                <path d="M0,0 C-30,-25 -70,-25 -100,-5 C-70,18 -25,15 0,0 Z" fill="url(#leafGrad)" stroke="#166534" strokeWidth="1.2" />
                <path d="M0,0 C-35,-12 -70,-15 -95,-6" fill="none" stroke="#86EFAC" strokeWidth="0.8" opacity="0.6" />
              </g>
            )}

            {leaf6Prog > 0 && (
              <g
                style={{
                  transform: `translate(300px, 160px) scale(${leaf6Prog}) rotate(${52 * leaf6Prog}deg)`,
                  transformOrigin: '0 0'
                }}
              >
                <path d="M0,0 C30,-25 70,-25 100,-5 C70,18 25,15 0,0 Z" fill="url(#leafGrad)" stroke="#166534" strokeWidth="1.2" />
                <path d="M0,0 C35,-12 70,-15 95,-6" fill="none" stroke="#86EFAC" strokeWidth="0.8" opacity="0.6" />
              </g>
            )}

            {/* 05. MATURE GRAIN HEAD */}
            {grainProg > 0 && (
              <g
                className="growth-grain-head"
                style={{
                  transform: `translate(300px, 95px) scale(${grainProg})`,
                  transformOrigin: '0 20px',
                  opacity: grainProg
                }}
              >
                <line x1="0" y1="20" x2="0" y2="-65" stroke="#B45309" strokeWidth="2.5" />
                {[-50, -38, -26, -14, -2, 10].map((yOffset, idx) => (
                  <g key={idx}>
                    <ellipse cx="-7" cy={yOffset} rx="6" ry="8" transform={`rotate(-28 -7 ${yOffset})`} fill="url(#grainGrad)" stroke="#B45309" strokeWidth="0.8" />
                    <line x1="-12" y1={yOffset} x2="-28" y2={yOffset - 18} stroke="#D97706" strokeWidth="0.9" />
                    <ellipse cx="7" cy={yOffset} rx="6" ry="8" transform={`rotate(28 7 ${yOffset})`} fill="url(#grainGrad)" stroke="#B45309" strokeWidth="0.8" />
                    <line x1="12" y1={yOffset} x2="28" y2={yOffset - 18} stroke="#D97706" strokeWidth="0.9" />
                  </g>
                ))}
                <ellipse cx="0" cy="-62" rx="5" ry="7" fill="url(#grainGrad)" stroke="#B45309" strokeWidth="0.8" />
                <line x1="0" y1="-65" x2="0" y2="-92" stroke="#D97706" strokeWidth="1" />
                <line x1="-3" y1="-65" x2="-14" y2="-88" stroke="#D97706" strokeWidth="0.9" />
                <line x1="3" y1="-65" x2="14" y2="-88" stroke="#D97706" strokeWidth="0.9" />
              </g>
            )}
          </svg>
        </div>

        {/* HUD Overlays */}
        <div className="growth-hud-top-left">
          <div className="growth-hud-pill">
            <span className="pulse-indicator" style={{ backgroundColor: '#15803D' }}></span>
            <span className="growth-hud-mono">BIOMETRIC SEQUENCE • {meta.code}</span>
          </div>
          <span className="growth-hud-sub">{meta.desc}</span>
        </div>

        <div className="growth-hud-top-right">
          <div className="growth-hud-stage-box">
            <span className="growth-hud-stage-label">LIFECYCLE STAGE</span>
            <span className="growth-hud-stage-val">{meta.stage}</span>
          </div>
        </div>

        <div className="growth-hud-bottom-right">
          <div className="growth-readout-card">
            <div className="growth-readout-title">
              <span>GROWTH SEQUENCE</span>
              <span className="growth-readout-pct">{percent}%</span>
            </div>
            <div className="growth-readout-bar" aria-label={`Progress ${percent}%`}>
              <span className="growth-ascii-bar">{asciiBar}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
