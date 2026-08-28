import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function HowItWorks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialModel = searchParams.get('model');
  const [activeTab, setActiveTab] = useState(
    initialModel === 'fertilizer' ? 'fertilizer' : initialModel === 'yield' ? 'yield' : 'crop'
  );

  // Sync tab when search params change
  useEffect(() => {
    const modelParam = searchParams.get('model');
    if (modelParam && ['crop', 'fertilizer', 'yield'].includes(modelParam)) {
      setActiveTab(modelParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ model: tabKey });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main style={{ padding: 'calc(var(--nav-height) + 2rem) 0 5rem 0' }}>
      <div className="page-container">
        {/* Editorial Header */}
        <div className="section-header-editorial" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="section-title-large" style={{ margin: '0 auto' }}>How Our AI Models Work</h1>
          <p className="section-desc-editorial" style={{ margin: '0.85rem auto 0 auto', maxWidth: '780px' }}>
            Simple, practical explanations for every advisory engine. Learn what each model does, the exact information required, and how each input field helps calculate your results.
          </p>
        </div>

        {/* 3 Model Selector Tabs */}
        <div className="how-it-works-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`how-tab-btn ${activeTab === 'crop' ? 'active' : ''}`}
            onClick={() => handleTabChange('crop')}
          >
            <i className="fa-solid fa-wheat-awn"></i>
            <span>Crop Selection</span>
          </button>

          <button
            type="button"
            className={`how-tab-btn ${activeTab === 'fertilizer' ? 'active' : ''}`}
            onClick={() => handleTabChange('fertilizer')}
          >
            <i className="fa-solid fa-flask-vial"></i>
            <span>Fertilizer Advisory</span>
          </button>

          <button
            type="button"
            className={`how-tab-btn ${activeTab === 'yield' ? 'active' : ''}`}
            onClick={() => handleTabChange('yield')}
          >
            <i className="fa-solid fa-chart-line"></i>
            <span>Yield Prediction</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: CROP SELECTION MODEL
            ========================================================================= */}
        {activeTab === 'crop' && (
          <div className="model-guide-content">
            {/* Overview Hero Card */}
            <div className="guide-hero-card">
              <div className="guide-hero-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="guide-icon-badge">
                    <i className="fa-solid fa-wheat-awn"></i>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--agri-ink)' }}>
                      Crop Selection Engine
                    </h2>
                  </div>
                </div>
                <Link to="/recommend" className="btn-primary-technical" style={{ padding: '10px 22px', fontSize: '11px' }}>
                  Open In Simulator <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }}></i>
                </Link>
              </div>

              <div className="guide-hero-body" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--agri-line)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--agri-ink)' }}>
                  What is this model and what problem does it solve?
                </h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                  The <strong>Crop Selection model</strong> helps you choose the most profitable and healthiest crop to plant on your land. Instead of guessing or repeating what was planted last season, this model looks at your soil's natural nutrient levels (Nitrogen, Phosphorus, Potassium, and pH) together with your local climate conditions (Temperature, Humidity, and Rainfall).
                </p>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '1.02rem', lineHeight: 1.7, margin: 0 }}>
                  By comparing your exact field numbers with optimal growing conditions across 22 major Indian crops (such as Rice, Cotton, Chickpea, Coffee, Maize, Apple, and Jute), the model identifies which crop will give you the highest chance of a rich harvest with the lowest risk of crop failure.
                </p>
              </div>
            </div>

            {/* Key Points & Requirements Grid */}
            <div style={{ margin: '3rem 0' }}>
              <div className="guide-grid-4">
                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-flask"></i></div>
                  <h4>1. Soil Test Numbers</h4>
                  <p>Readings for Nitrogen (N), Phosphorus (P), and Potassium (K) in kg/ha from your local Soil Health Card.</p>
                </div>

                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-scale-balanced"></i></div>
                  <h4>2. Soil Acidity (pH)</h4>
                  <p>Your soil pH value (between 3.5 and 9.5). This tells whether your land is acidic, neutral, or alkaline.</p>
                </div>

                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-cloud-sun-rain"></i></div>
                  <h4>3. Climate Averages</h4>
                  <p>Average temperature (°C), relative humidity (%), and expected rainfall (mm) during your growing season.</p>
                </div>

                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-bullseye"></i></div>
                  <h4>4. What You Get</h4>
                  <p>The single best crop recommendation plus growing requirements and environmental safety thresholds.</p>
                </div>
              </div>
            </div>

            {/* Simple Step-by-Step Flow */}
            <div style={{ margin: '3rem 0', padding: '2.5rem', backgroundColor: 'var(--agri-surface)', border: '1px solid var(--agri-line)', borderRadius: '12px' }}>
              <div className="guide-steps-grid">
                <div className="guide-step-item">
                  <span className="step-badge">STEP 1</span>
                  <h5>Enter 7 Field Numbers</h5>
                  <p>Fill in N, P, K, pH, temperature, humidity, and rainfall from your soil report.</p>
                </div>
                <div className="guide-step-item">
                  <span className="step-badge">STEP 2</span>
                  <h5>AI Nutrient Matching</h5>
                  <p>The model tests your soil chemistry against the biological limits of 22 different crop families.</p>
                </div>
                <div className="guide-step-item">
                  <span className="step-badge">STEP 3</span>
                  <h5>Climate Verification</h5>
                  <p>Water availability and heat thresholds are checked to confirm the crop will survive natural weather shifts.</p>
                </div>
                <div className="guide-step-item">
                  <span className="step-badge">STEP 4</span>
                  <h5>Instant Advisory</h5>
                  <p>Receive your tailored crop recommendation with agronomic guidance for planting.</p>
                </div>
              </div>
            </div>

            {/* Detailed Field-by-Field Breakdown */}
            <div style={{ margin: '3.5rem 0' }}>
              <div className="fields-breakdown-list">
                {/* Field 1 */}
                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">01</span>
                      <div>
                        <h4 className="field-name">Nitrogen (N)</h4>
                        <span className="field-unit">Unit: kg/ha (Kilograms per Hectare) • Typical Range: 0 – 140 kg/ha</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Soil Nutrient</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>What it is:</strong> Nitrogen is the main engine for plant growth. It makes leaves dark green and helps stems grow tall and strong.</p>
                    <p><strong>Why the model needs it:</strong> Leafy crops and grains like Rice, Maize, and Cotton demand high Nitrogen, while legumes like Chickpea and Lentils fix their own Nitrogen from the air and need very little.</p>
                    <div className="field-tip-box">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span><strong>Farmer Tip:</strong> Low Nitrogen causes leaves to turn pale yellow. High Nitrogen causes excessive leafy growth and delays harvest.</span>
                    </div>
                  </div>
                </div>

                {/* Field 2 */}
                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">02</span>
                      <div>
                        <h4 className="field-name">Phosphorus (P)</h4>
                        <span className="field-unit">Unit: kg/ha • Typical Range: 5 – 145 kg/ha</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Soil Nutrient</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>What it is:</strong> Phosphorus is the "root-builder". It helps young seedlings develop deep roots, form early flowers, and produce seeds.</p>
                    <p><strong>Why the model needs it:</strong> Crops like Apples, Grapes, Bananas, and Pulses have a high appetite for phosphorus to build robust root systems and sustain heavy flowering.</p>
                    <div className="field-tip-box">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span><strong>Farmer Tip:</strong> Phosphorus stays close to where it is placed in soil; applying it near the seed furrow during sowing gives young roots quick access.</span>
                    </div>
                  </div>
                </div>

                {/* Field 3 */}
                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">03</span>
                      <div>
                        <h4 className="field-name">Potassium (K)</h4>
                        <span className="field-unit">Unit: kg/ha • Typical Range: 5 – 205 kg/ha</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Soil Nutrient</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>What it is:</strong> Potassium is the plant's immune booster and water manager. It strengthens plant cell walls, prevents wilting during dry spells, and improves fruit size and taste.</p>
                    <p><strong>Why the model needs it:</strong> Fruit crops (like Banana, Orange, Papaya) and fiber crops (like Cotton and Jute) consume huge amounts of Potassium to fill fruits and build durable fibers.</p>
                    <div className="field-tip-box">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span><strong>Farmer Tip:</strong> Adequate potassium prevents stems from bending over (lodging) under strong monsoon winds.</span>
                    </div>
                  </div>
                </div>

                {/* Field 4 */}
                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">04</span>
                      <div>
                        <h4 className="field-name">Temperature</h4>
                        <span className="field-unit">Unit: °C (Degrees Celsius) • Typical Range: 15°C – 40°C</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Climate Vector</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>What it is:</strong> The average ambient air temperature of your farm during the crop's growing cycle.</p>
                    <p><strong>Why the model needs it:</strong> Every plant has a temperature threshold. For example, Wheat requires cooler weather (15°C–25°C), whereas Watermelon and Cotton need warm sunshine (25°C–35°C).</p>
                    <div className="field-tip-box">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span><strong>Farmer Tip:</strong> Enter the average daytime temperature for the season you plan to sow in (Kharif, Rabi, or Summer).</span>
                    </div>
                  </div>
                </div>

                {/* Field 5 */}
                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">05</span>
                      <div>
                        <h4 className="field-name">Humidity</h4>
                        <span className="field-unit">Unit: % (Relative Air Moisture) • Typical Range: 20% – 95%</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Climate Vector</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>What it is:</strong> The percentage of water vapor present in the atmosphere around your fields.</p>
                    <p><strong>Why the model needs it:</strong> Tropical crops like Coconut and Rice love muggy, high-humidity air (&gt;80%), while dryland crops like Chickpea and Lentils suffer from fungal rot if humidity stays too high.</p>
                    <div className="field-tip-box">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span><strong>Farmer Tip:</strong> Coastal regions and rainy months usually have 75%–90% humidity; dry inland winter/summer months range from 30%–60%.</span>
                    </div>
                  </div>
                </div>

                {/* Field 6 */}
                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">06</span>
                      <div>
                        <h4 className="field-name">Soil pH</h4>
                        <span className="field-unit">Unit: Scale 0 to 14 • Optimal Agronomic Range: 6.0 – 7.5</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Soil Chemistry</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>What it is:</strong> A measure of how acidic or alkaline your soil is. 7.0 is neutral, below 6.5 is acidic, and above 7.5 is alkaline.</p>
                    <p><strong>Why the model needs it:</strong> If soil pH is extreme (e.g. below 5.0 or above 8.5), plant roots "lock up" and cannot absorb nutrients even if the soil is rich in fertilizer.</p>
                    <div className="field-tip-box">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span><strong>Farmer Tip:</strong> Tea and Coffee thrive in slightly acidic soil (pH 5.0–6.0), while Cotton and Chickpea prefer neutral to mildly alkaline soil (pH 7.0–8.0).</span>
                    </div>
                  </div>
                </div>

                {/* Field 7 */}
                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">07</span>
                      <div>
                        <h4 className="field-name">Rainfall</h4>
                        <span className="field-unit">Unit: mm (Millimeters) • Typical Range: 40 mm – 300 mm monthly</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Water Availability</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>What it is:</strong> The total expected precipitation or equivalent irrigation water available during the season.</p>
                    <p><strong>Why the model needs it:</strong> Rainfall is the single most decisive factor in agriculture. Rice needs flooded fields with 1,500–2,500 mm of water, whereas Kidney Beans and Mothbeans survive in dry soils on under 400 mm.</p>
                    <div className="field-tip-box">
                      <i className="fa-solid fa-lightbulb"></i>
                      <span><strong>Farmer Tip:</strong> If your field has reliable canal or borewell irrigation, add that water supply to your seasonal rainfall estimate.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="guide-cta-card">
              <div style={{ maxWidth: '640px' }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--agri-ink)' }}>
                  Ready to test your soil parameters?
                </h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '0.98rem', lineHeight: 1.6, margin: 0 }}>
                  Enter your field's NPK readings, pH, and local weather to get instant, data-backed crop suggestions.
                </p>
              </div>
              <Link to="/recommend" className="btn-primary-technical" style={{ padding: '14px 30px' }}>
                Run Crop Selection Now <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: FERTILIZER ADVISORY MODEL
            ========================================================================= */}
        {activeTab === 'fertilizer' && (
          <div className="model-guide-content">
            {/* Overview Hero Card */}
            <div className="guide-hero-card">
              <div className="guide-hero-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="guide-icon-badge">
                    <i className="fa-solid fa-flask-vial"></i>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--agri-ink)' }}>
                      Fertilizer Advisory Engine
                    </h2>
                  </div>
                </div>
                <Link to="/recommend/fertilizer" className="btn-primary-technical" style={{ padding: '10px 22px', fontSize: '11px' }}>
                  Open In Simulator <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }}></i>
                </Link>
              </div>

              <div className="guide-hero-body" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--agri-line)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--agri-ink)' }}>
                  What is this model and what problem does it solve?
                </h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                  The <strong>Fertilizer Advisory model</strong> calculates the exact commercial fertilizer blend your soil needs for a specific crop. Over-fertilizing wastes thousands of rupees and pollutes groundwater, while under-fertilizing causes weak crops and low harvests.
                </p>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '1.02rem', lineHeight: 1.7, margin: 0 }}>
                  Trained on real Western Maharashtra agricultural field data, this model checks your district, soil color, target crop, and current N-P-K nutrient levels. It then selects the optimal fertilizer formulation (such as Urea, DAP, 10:26:26 NPK, 12:32:16, or Potash) along with a ranked Top-3 shortlist with percentage confidence scores.
                </p>
              </div>
            </div>

            {/* Key Points & Requirements Grid */}
            <div style={{ margin: '3rem 0' }}>
              <div className="guide-grid-4">
                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-map-location-dot"></i></div>
                  <h4>1. District &amp; Soil Color</h4>
                  <p>Your local district (e.g. Pune, Kolhapur, Solapur, Sangli) and soil type (Black, Red, Clayey, Alluvial, Loamy).</p>
                </div>

                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-seedling"></i></div>
                  <h4>2. Target Crop</h4>
                  <p>The specific crop you are growing (e.g. Sugarcane, Cotton, Wheat, Rice, Maize, Groundnut).</p>
                </div>

                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-vial"></i></div>
                  <h4>3. Current Soil Readings</h4>
                  <p>Current Nitrogen, Phosphorus, Potassium, and pH levels from your latest field test.</p>
                </div>

                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-list-ol"></i></div>
                  <h4>4. What You Get</h4>
                  <p>Top-1 primary fertilizer recommendation + Top-3 alternatives with confidence scores and application tips.</p>
                </div>
              </div>
            </div>

            {/* Step-by-Step Flow */}
            <div style={{ margin: '3rem 0', padding: '2.5rem', backgroundColor: 'var(--agri-surface)', border: '1px solid var(--agri-line)', borderRadius: '12px' }}>
              <div className="guide-steps-grid">
                <div className="guide-step-item">
                  <span className="step-badge">STEP 1</span>
                  <h5>Pick District &amp; Soil</h5>
                  <p>Select your regional geography, soil texture, and the crop you are cultivating.</p>
                </div>
                <div className="guide-step-item">
                  <span className="step-badge">STEP 2</span>
                  <h5>Enter Current Nutrients</h5>
                  <p>Input your existing field N-P-K numbers, soil pH, rainfall, and temperature.</p>
                </div>
                <div className="guide-step-item">
                  <span className="step-badge">STEP 3</span>
                  <h5>Calculate Soil Deficit</h5>
                  <p>The AI calculates the nutritional gap between what your soil has and what your crop needs to thrive.</p>
                </div>
                <div className="guide-step-item">
                  <span className="step-badge">STEP 4</span>
                  <h5>Rank Best Formulations</h5>
                  <p>Delivers the exact fertilizer product (Urea, DAP, NPK complexes) to bridge the nutrient gap.</p>
                </div>
              </div>
            </div>

            {/* Detailed Field Breakdown */}
            <div style={{ margin: '3.5rem 0' }}>
              <div className="fields-breakdown-list">
                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">01</span>
                      <div>
                        <h4 className="field-name">District / Location</h4>
                        <span className="field-unit">Western Maharashtra Districts (Pune, Kolhapur, Solapur, Satara, Sangli, etc.)</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Geography</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>Why the model needs it:</strong> Districts have unique baseline mineral content, water tables, and farming histories. For example, Kolhapur soils have high organic matter, while Solapur soils have lower average rainfall.</p>
                  </div>
                </div>

                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">02</span>
                      <div>
                        <h4 className="field-name">Soil Color &amp; Texture</h4>
                        <span className="field-unit">Black, Red, Clayey, Alluvial, Sandy, Loamy</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Soil Property</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>Why the model needs it:</strong> Black soil holds moisture and potassium well; Red soil drains fast and often lacks phosphorus; Sandy soil loses nitrogen quickly and requires split fertilizer applications.</p>
                  </div>
                </div>

                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">03</span>
                      <div>
                        <h4 className="field-name">Target Crop</h4>
                        <span className="field-unit">Sugarcane, Cotton, Wheat, Rice, Groundnut, Maize, Pulses, etc.</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Crop Demand</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>Why the model needs it:</strong> Different crops have wildly different nutritional needs. Sugarcane needs massive amounts of Nitrogen over a whole year, while Groundnut requires Phosphorus and Potassium without excess Nitrogen.</p>
                  </div>
                </div>

                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">04</span>
                      <div>
                        <h4 className="field-name">Current Soil Nitrogen (N), Phosphorus (P), Potassium (K)</h4>
                        <span className="field-unit">Available soil nutrients before fertilizer application</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Nutrient Balance</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>Why the model needs it:</strong> If your soil already has 80 kg/ha of Nitrogen, adding Urea is a waste of money. The model checks what is already in the soil and only recommends what is missing.</p>
                  </div>
                </div>

                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">05</span>
                      <div>
                        <h4 className="field-name">Soil pH, Rainfall &amp; Temperature</h4>
                        <span className="field-unit">Environmental uptake conditions</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Uptake Efficiency</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>Why the model needs it:</strong> Chemical fertilizers need adequate moisture to dissolve into plant roots without causing root burn. Extreme pH levels also change how easily plants absorb phosphorus and potassium.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="guide-cta-card">
              <div style={{ maxWidth: '640px' }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--agri-ink)' }}>
                  Ready to calculate fertilizer dosage?
                </h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '0.98rem', lineHeight: 1.6, margin: 0 }}>
                  Select your district, soil type, and target crop to get tailored fertilizer recommendations and save on chemical inputs.
                </p>
              </div>
              <Link to="/recommend/fertilizer" className="btn-primary-technical" style={{ padding: '14px 30px' }}>
                Run Fertilizer Advisory Now <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: YIELD PREDICTION MODEL
            ========================================================================= */}
        {activeTab === 'yield' && (
          <div className="model-guide-content">
            {/* Overview Hero Card */}
            <div className="guide-hero-card">
              <div className="guide-hero-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="guide-icon-badge">
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--agri-ink)' }}>
                      Yield Prediction Engine
                    </h2>
                  </div>
                </div>
                <Link to="/recommend/yield" className="btn-primary-technical" style={{ padding: '10px 22px', fontSize: '11px' }}>
                  Open In Simulator <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }}></i>
                </Link>
              </div>

              <div className="guide-hero-body" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--agri-line)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--agri-ink)' }}>
                  What is this model and what problem does it solve?
                </h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                  The <strong>Yield Prediction model</strong> forecasts how many metric tonnes of harvest you can expect from your field. Unlike the other two models (which pick a category like a crop name or fertilizer brand), this model calculates a continuous production estimate based on historical agricultural data.
                </p>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '1.02rem', lineHeight: 1.7, margin: 0 }}>
                  Trained on over 242,000 official Indian government district records spanning nearly two decades, this model evaluates your State, Crop Name, Season, and Farm Area (in Hectares or Acres). It gives you realistic production estimates so you can negotiate selling prices, arrange storage, and plan harvest labor in advance.
                </p>
              </div>
            </div>

            {/* Key Points & Requirements Grid */}
            <div style={{ margin: '3rem 0' }}>
              <div className="guide-grid-4">
                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-earth-asia"></i></div>
                  <h4>1. State &amp; Region</h4>
                  <p>Selected Indian state (e.g. Maharashtra, Punjab, Uttar Pradesh, Gujarat, Karnataka, Tamil Nadu).</p>
                </div>

                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-calendar-days"></i></div>
                  <h4>2. Growing Season</h4>
                  <p>Kharif (Monsoon), Rabi (Winter), Summer / Zaid, or Whole Year (perennial crops like sugarcane).</p>
                </div>

                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-vector-square"></i></div>
                  <h4>3. Farm Land Size</h4>
                  <p>Total land area you are planting in Hectares (1 Hectare = 2.47 Acres = 100 Gunthas).</p>
                </div>

                <div className="guide-info-card">
                  <div className="card-top-icon"><i className="fa-solid fa-weight-hanging"></i></div>
                  <h4>4. What You Get</h4>
                  <p>Estimated total harvest in Metric Tonnes (t) and Average Productivity in Tonnes per Hectare (t/ha).</p>
                </div>
              </div>
            </div>

            {/* Step-by-Step Flow */}
            <div style={{ margin: '3rem 0', padding: '2.5rem', backgroundColor: 'var(--agri-surface)', border: '1px solid var(--agri-line)', borderRadius: '12px' }}>
              <div className="guide-steps-grid">
                <div className="guide-step-item">
                  <span className="step-badge">STEP 1</span>
                  <h5>Select State &amp; Crop</h5>
                  <p>Choose your state and the crop species you are planting.</p>
                </div>
                <div className="guide-step-item">
                  <span className="step-badge">STEP 2</span>
                  <h5>Pick Season &amp; Year</h5>
                  <p>Select Kharif, Rabi, Summer, or Whole Year, along with the crop season year.</p>
                </div>
                <div className="guide-step-item">
                  <span className="step-badge">STEP 3</span>
                  <h5>Enter Farm Area</h5>
                  <p>Input your cultivated land size in hectares or convert from acres.</p>
                </div>
                <div className="guide-step-item">
                  <span className="step-badge">STEP 4</span>
                  <h5>Harvest Production Report</h5>
                  <p>View total expected tonnes and regional productivity benchmarks per hectare.</p>
                </div>
              </div>
            </div>

            {/* Detailed Field Breakdown */}
            <div style={{ margin: '3.5rem 0' }}>
              <div className="fields-breakdown-list">
                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">01</span>
                      <div>
                        <h4 className="field-name">State / Region</h4>
                        <span className="field-unit">Indian Agricultural State</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Geographic Baseline</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>Why the model needs it:</strong> Soil types, canal irrigation coverage, and weather patterns vary significantly across Indian states. For example, Punjab has higher baseline wheat yields due to intensive irrigation networks, while Maharashtra excels in Sugarcane and Cotton.</p>
                  </div>
                </div>

                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">02</span>
                      <div>
                        <h4 className="field-name">Crop Name</h4>
                        <span className="field-unit">Rice, Wheat, Sugarcane, Cotton, Maize, Jowar, Bajra, Groundnut, etc.</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Biological Yield</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>Why the model needs it:</strong> Raw tonnage varies dramatically by crop biology. A healthy 1-hectare Sugarcane field can yield 70–90 tonnes of heavy stalks, while 1 hectare of Chickpea or Lentils yields about 1.5–2.5 tonnes of dried grains.</p>
                  </div>
                </div>

                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">03</span>
                      <div>
                        <h4 className="field-name">Crop Season</h4>
                        <span className="field-unit">Kharif, Rabi, Summer / Zaid, Whole Year</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Seasonal Cycle</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>Why the model needs it:</strong></p>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', lineHeight: 1.6, color: 'var(--agri-secondary)' }}>
                      <li><strong>Kharif (June – October):</strong> Monsoon season crops that rely on seasonal rainfall (Rice, Cotton, Soybean, Maize).</li>
                      <li><strong>Rabi (October – March):</strong> Winter season crops that prefer cooler weather (Wheat, Mustard, Barley, Chickpea).</li>
                      <li><strong>Summer / Zaid (March – June):</strong> Warm, dry months with irrigation (Watermelon, Cucumber, Summer Pulses).</li>
                      <li><strong>Whole Year:</strong> Perennial crops that grow across 10–18 months (Sugarcane, Coconut).</li>
                    </ul>
                  </div>
                </div>

                <div className="field-card">
                  <div className="field-card-header">
                    <div className="field-title-group">
                      <span className="field-num">04</span>
                      <div>
                        <h4 className="field-name">Farm Area</h4>
                        <span className="field-unit">Unit: Hectares (ha) • Conversion: 1 ha = 2.47 Acres = 100 Gunthas</span>
                      </div>
                    </div>
                    <span className="field-badge-tag">Scale of Production</span>
                  </div>
                  <div className="field-card-body">
                    <p><strong>Why the model needs it:</strong> The model multiplies historical per-hectare biological productivity by your land size to calculate your total harvest in tonnes.</p>
                    <div className="field-tip-box">
                      <i className="fa-solid fa-calculator"></i>
                      <span><strong>Quick Conversion:</strong> If you farm 5 Acres, divide by 2.47 = <strong>2.02 Hectares</strong>. If you farm 50 Gunthas, divide by 100 = <strong>0.50 Hectares</strong>.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="guide-cta-card">
              <div style={{ maxWidth: '640px' }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--agri-ink)' }}>
                  Ready to forecast your harvest yield?
                </h3>
                <p style={{ color: 'var(--agri-secondary)', fontSize: '0.98rem', lineHeight: 1.6, margin: 0 }}>
                  Enter your state, crop, season, and land size to calculate expected total metric tonnes and per-hectare productivity.
                </p>
              </div>
              <Link to="/recommend/yield" className="btn-primary-technical" style={{ padding: '14px 30px' }}>
                Run Yield Prediction Now <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
