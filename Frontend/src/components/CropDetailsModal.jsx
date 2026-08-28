import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CropDetailsModal({ crop, isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !crop) return null;

  const modelType = crop.modelType || 'crop';

  const getTestLink = () => {
    if (modelType === 'fertilizer') return '/recommend/fertilizer';
    if (modelType === 'yield') return '/recommend/yield';
    return `/recommend?crop=${encodeURIComponent(crop.title.toLowerCase())}`;
  };

  const getTestButtonText = () => {
    if (modelType === 'fertilizer') return 'Test in Fertilizer Advisor';
    if (modelType === 'yield') return 'Test in Yield Predictor';
    return 'Test this Profile in Advisor';
  };

  return (
    <div className="crop-details-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="crop-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="crop-details-header">
          <div className="crop-details-header-left">
            <span className="crop-details-icon">{crop.icon}</span>
            <div>
              <div className="crop-details-category-badge">{crop.category}</div>
              <h2 className="crop-details-title">{crop.title}</h2>
            </div>
          </div>
          <button
            type="button"
            className="crop-details-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="crop-details-body">
          {/* Section 1: Overview in simple English */}
          <div className="crop-details-section">
            <h3 className="crop-details-section-title">
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--agri-accent)' }}></i>
              {modelType === 'fertilizer' ? 'About this Fertilizer' : modelType === 'yield' ? 'About this Crop & Yield' : 'About this Species'}
            </h3>
            <p className="crop-details-about-text">
              {crop.about || crop.tagline}
            </p>
          </div>

          {/* Section 2: Why these conditions? Parameter by Parameter Breakdown */}
          <div className="crop-details-section">
            <h3 className="crop-details-section-title">
              <i className="fa-solid fa-sliders" style={{ color: 'var(--agri-accent)' }}></i>
              {modelType === 'fertilizer'
                ? 'Why This Fertilizer Formula?'
                : modelType === 'yield'
                ? 'Why These Yield & Weather Factors?'
                : 'Why These Soil & Climate Values?'}
            </h3>
            <p className="crop-details-section-subtitle">
              Here is what each field means in simple, everyday words:
            </p>

            <div className="crop-params-breakdown-grid">
              {/* CROP SELECTION MODEL BREAKDOWN */}
              {modelType === 'crop' && (
                <>
                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🌱 Nitrogen (N)</span>
                      <span className="crop-param-value">{crop.details?.nitrogen?.value || crop.npk?.split('-')[0] || 'Ideal'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why this value:</strong> {crop.details?.nitrogen?.why || 'Gives the plant its rich green color and builds strong stems during early growth.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🪵 Phosphorus (P)</span>
                      <span className="crop-param-value">{crop.details?.phosphorus?.value || crop.npk?.split('-')[1] || 'Ideal'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why this value:</strong> {crop.details?.phosphorus?.why || 'Helps seedlings grow deep, sturdy roots to drink water and set early flowers.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">⚡ Potassium (K)</span>
                      <span className="crop-param-value">{crop.details?.potassium?.value || crop.npk?.split('-')[2] || 'Ideal'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why this value:</strong> {crop.details?.potassium?.why || 'Shields the crop from dry weather and diseases, making fruits and grains plump.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🌡️ Temperature</span>
                      <span className="crop-param-value">{crop.temp}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why this value:</strong> {crop.details?.temp?.why || 'This warmth helps seeds sprout quickly and keeps plants growing without stress.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🧪 Soil pH (Acidity)</span>
                      <span className="crop-param-value">{crop.ph}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why this value:</strong> {crop.details?.ph?.why || 'At this acidity level, roots easily absorb minerals from the ground.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🌧️ Rainfall / Water</span>
                      <span className="crop-param-value">{crop.rainfall}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why this value:</strong> {crop.details?.rainfall?.why || 'Provides the right moisture balance so plants grow steadily without waterlogging.'}
                    </p>
                  </div>
                </>
              )}

              {/* FERTILIZER ADVISORY MODEL BREAKDOWN */}
              {modelType === 'fertilizer' && (
                <>
                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🌱 Nitrogen (N) Content</span>
                      <span className="crop-param-value">{crop.details?.nitrogen?.value || 'Active'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why this amount:</strong> {crop.details?.nitrogen?.why || 'Fuels rapid green vegetative growth when crops look pale or weak.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🪵 Phosphorus (P) Content</span>
                      <span className="crop-param-value">{crop.details?.phosphorus?.value || 'Active'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why this amount:</strong> {crop.details?.phosphorus?.why || 'Stimulates root expansion and helps seedlings establish early vigor.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">⚡ Potassium (K) Content</span>
                      <span className="crop-param-value">{crop.details?.potassium?.value || 'Active'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why this amount:</strong> {crop.details?.potassium?.why || 'Hardens stems and enhances disease immunity and grain filling.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🌍 Soil Compatibility</span>
                      <span className="crop-param-value">{crop.details?.soil?.value || crop.ph || 'All Soils'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Best Soil:</strong> {crop.details?.soil?.why || 'Works well in black, red, and loamy soils when applied correctly.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🌾 Best Suited Crops</span>
                      <span className="crop-param-value">{crop.details?.crops?.value || 'Universal'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why for these crops:</strong> {crop.details?.crops?.why || 'Matches the nutrient demand curve of these specific crops.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">⏱️ Application Stage</span>
                      <span className="crop-param-value">{crop.details?.stage?.value || 'Basal / Sowing'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>When to apply:</strong> {crop.details?.stage?.why || 'Apply near root zones at sowing or early tillering for best absorption.'}
                    </p>
                  </div>
                </>
              )}

              {/* YIELD PREDICTION MODEL BREAKDOWN */}
              {modelType === 'yield' && (
                <>
                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">📊 Expected Average Yield</span>
                      <span className="crop-param-value">{crop.details?.yield?.value || crop.npk || 'Target'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why this harvest range:</strong> {crop.details?.yield?.why || 'Achievable harvest with recommended seed quality, balanced fertilizer, and good water management.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">☀️ Optimal Growing Season</span>
                      <span className="crop-param-value">{crop.details?.season?.value || crop.temp || 'Kharif / Rabi'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why this season:</strong> {crop.details?.season?.why || 'Natural sunshine hours and seasonal temperatures align perfectly with this crop cycle.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🌧️ Rainfall &amp; Water Impact</span>
                      <span className="crop-param-value">{crop.details?.water?.value || crop.rainfall || 'Moderate'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why water matters:</strong> {crop.details?.water?.why || 'Adequate soil moisture at flowering directly boosts grain count and weight.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🧪 Fertilizer Dosage Effect</span>
                      <span className="crop-param-value">{crop.details?.fertEffect?.value || 'High Impact'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why balanced nutrients matter:</strong> {crop.details?.fertEffect?.why || 'Applying recommended NPK prevents leaf yellowing and maximizes harvest tonnage.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">🛡️ Pest &amp; Weed Control</span>
                      <span className="crop-param-value">{crop.details?.pest?.value || 'Moderate'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Why timely protection matters:</strong> {crop.details?.pest?.why || 'Keeping fields weed-free during early weeks prevents nutrients from being stolen.'}
                    </p>
                  </div>

                  <div className="crop-param-card">
                    <div className="crop-param-card-header">
                      <span className="crop-param-name">⏳ Growing Duration</span>
                      <span className="crop-param-value">{crop.details?.duration?.value || crop.ph || '90 - 120 Days'}</span>
                    </div>
                    <p className="crop-param-why">
                      <strong>Days to harvest:</strong> {crop.details?.duration?.why || 'Time needed from sowing seeds to ripe harvest readiness.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 3: Simple Practical Tips for Farmers */}
          {crop.tips && crop.tips.length > 0 && (
            <div className="crop-details-section">
              <h3 className="crop-details-section-title">
                <i className="fa-solid fa-lightbulb" style={{ color: 'var(--agri-warning)' }}></i>
                {modelType === 'fertilizer' ? 'Application & Safety Tips' : modelType === 'yield' ? 'Yield Boosting Tips' : 'Helpful Growing Tips'}
              </h3>
              <div className="crop-details-tips-list">
                {crop.tips.map((tip, idx) => (
                  <div key={idx} className="crop-details-tip-item">
                    <i className="fa-solid fa-check crop-details-tip-check"></i>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="crop-details-footer">
          <button type="button" className="btn-crop-modal-close" onClick={onClose}>
            Close
          </button>
          <Link
            to={getTestLink()}
            className="btn-crop-modal-test"
            onClick={onClose}
          >
            <i className="fa-solid fa-flask-vial"></i>
            {getTestButtonText()}
          </Link>
        </div>
      </div>
    </div>
  );
}

