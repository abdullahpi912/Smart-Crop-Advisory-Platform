import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does AgriSense predict the best crop for my specific field?',
      a: 'AgriSense uses a trained machine learning model that analyzes your primary soil nutrient values (Nitrogen, Phosphorus, Potassium), soil acidity (pH), and local climate parameters (temperature, relative humidity, annual precipitation) to match your soil profile with optimum high-yield crop species.'
    },
    {
      q: 'What is the difference between Crop Advisory and Fertilizer Advisory?',
      a: 'Crop Advisory identifies which crop species will yield the highest return based on your existing soil chemistry. Fertilizer Advisory calculates the exact NPK nutrient deficiencies for a chosen target crop and provides precise dosage recommendations (such as Urea, DAP, or MOP).'
    },
    {
      q: 'Are the recommendations accurate for smallholder farms?',
      a: 'Yes! The classification models are calibrated using extensive agronomic research datasets across tropical, semi-arid, and temperate agricultural zones.'
    },
    {
      q: 'Can I save my recommendation history for future reference?',
      a: 'Absolutely. Every recommendation computed on AgriSense can be stored locally in your Farm Dashboard history log.'
    }
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <span className="section-tag">
            <i className="fa-solid fa-leaf"></i> Smart Agriculture AI Platform
          </span>
          <h1>
            Grow smarter, <span>harvest better</span>.
          </h1>
          <p className="hero-description">
            AgriSense recommends the ideal crop and optimal fertilizer dosage for your field using soil NPK nutrients, temperature, humidity, rainfall, and pH — eliminating guesswork in farming.
          </p>

          <div className="hero-stats">
            <div className="hero-stat-card">
              <strong>7 Field Inputs</strong>
              <span>NPK, Temp, Humidity, pH, Rain</span>
            </div>
            <div className="hero-stat-card">
              <strong>Dual AI Engine</strong>
              <span>Crop &amp; Fertilizer Classification</span>
            </div>
            <div className="hero-stat-card">
              <strong>Farm Profiles</strong>
              <span>Secure History &amp; Yield Tracking</span>
            </div>
          </div>

          <div className="hero-buttons">
            <Link to="/recommend" className="btn btn-terracotta">
              <i className="fa-solid fa-wheat-awn"></i> Get Recommendation
            </Link>
            <Link to="/dashboard" className="btn-outline">
              <i className="fa-solid fa-clock-rotate-left"></i> View History Log
            </Link>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <div className="hero-floating-pill">
            <span className="status-dot"></span> ML Soil Model Active
          </div>
          <figure className="hero-image">
            <img src="/Farmer_image/istockphoto-506164764-170667a.jpg" alt="Tractor working across vibrant agricultural farmland" />
            <div className="hero-badge">
              <i className="fa-solid fa-wheat-awn"></i>
              <p>
                <strong>Maximizing Crop Yields:</strong> Data-driven soil analysis for sustainable, profitable farming.
              </p>
            </div>
          </figure>
        </div>
      </section>

      {/* Production Workflow Section */}
      <section id="project-flow" className="flow-roadmap-section">
        <div className="section-header">
          <span className="section-tag">
            <i className="fa-solid fa-diagram-project"></i> Intelligent Workflow
          </span>
          <h2 className="section-title">End-to-End Precision Advisory Workflow</h2>
          <p className="section-subtitle">
            How AgriSense transforms raw soil chemical readings into actionable crop selection and fertilizer recommendations.
          </p>
        </div>

        <div className="flow-grid">
          <div className="flow-card completed">
            <div className="flow-step-number">Step 01</div>
            <div className="flow-icon"><i className="fa-solid fa-vial-circle-check"></i></div>
            <h3>Soil Chemical Sampling</h3>
            <p>Input field soil test readings including Nitrogen (N), Phosphorus (P), Potassium (K), and pH levels.</p>
            <span className="flow-badge"><i className="fa-solid fa-circle-check"></i> Field Data Entry</span>
          </div>

          <div className="flow-card completed">
            <div className="flow-step-number">Step 02</div>
            <div className="flow-icon"><i className="fa-solid fa-cloud-sun-rain"></i></div>
            <h3>Climate Parameter Sync</h3>
            <p>Correlate field readings with seasonal temperature, atmospheric humidity, and regional rainfall patterns.</p>
            <span className="flow-badge"><i className="fa-solid fa-circle-check"></i> Environmental Sync</span>
          </div>

          <div className="flow-card active">
            <div className="flow-step-number">Step 03</div>
            <div className="flow-icon"><i className="fa-solid fa-brain"></i></div>
            <h3>ML Prediction Model</h3>
            <p>Machine learning classification algorithms evaluate nutrient vectors to identify highest-yielding crop species.</p>
            <span className="flow-badge active-tag"><i className="fa-solid fa-microchip"></i> AI Engine Analysis</span>
          </div>

          <div className="flow-card completed">
            <div className="flow-step-number">Step 04</div>
            <div className="flow-icon"><i className="fa-solid fa-flask-vial"></i></div>
            <h3>Fertilizer Dosage Advisory</h3>
            <p>Calculate exact NPK deficiency requirements tailored specifically to target crop types and soil categories.</p>
            <span className="flow-badge"><i className="fa-solid fa-circle-check"></i> Nutrient Balance</span>
          </div>

          <div className="flow-card completed">
            <div className="flow-step-number">Step 05</div>
            <div className="flow-icon"><i className="fa-solid fa-chart-line"></i></div>
            <h3>Farm Dashboard History</h3>
            <p>Save advisory reports into your secure farm profile log to track soil nutrient enrichment across seasons.</p>
            <span className="flow-badge"><i className="fa-solid fa-database"></i> Log Tracking</span>
          </div>

          <div className="flow-card completed">
            <div className="flow-step-number">Step 06</div>
            <div className="flow-icon"><i className="fa-solid fa-wheat-awn"></i></div>
            <h3>Yield Optimization</h3>
            <p>Execute data-backed planting and fertilizer schedules to maximize commercial crop yield and profit margin.</p>
            <span className="flow-badge"><i className="fa-solid fa-shield-halved"></i> Sustainable Farming</span>
          </div>
        </div>
      </section>

      {/* Why AgriSense Section */}
      <section id="why" className="why-section">
        <div className="section-header">
          <span className="section-tag">
            <i className="fa-solid fa-seedling"></i> Precision Farming Advantage
          </span>
          <h2 className="section-title">Smarter Soil Insights for Better Farming</h2>
          <p className="section-subtitle">
            Discover how AgriSense turns raw field soil chemistry into clear, actionable recommendations to boost crop yields, reduce fertilizer waste, and protect long-term land productivity.
          </p>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-card-top">
              <div className="why-icon-box"><i className="fa-solid fa-vial-circle-check"></i></div>
              <span className="why-category-tag">Nutrient Balance</span>
            </div>
            <h3>Smart NPK Nutrient Profiling</h3>
            <p>Evaluates primary Nitrogen, Phosphorus, and Potassium levels against Soil pH to optimize root nutrition and prevent soil depletion.</p>
            <div className="why-card-footer">
              <span className="metric-pill"><i className="fa-solid fa-check-double"></i> Balanced Chemistry</span>
            </div>
          </div>

          <div className="why-card">
            <div className="why-card-top">
              <div className="why-icon-box"><i className="fa-solid fa-cloud-sun-rain"></i></div>
              <span className="why-category-tag">Climate Sync</span>
            </div>
            <h3>Weather &amp; Rainfall Matching</h3>
            <p>Matches local seasonal temperatures, humidity, and rainfall thresholds to recommend resilient crops suited to your exact regional conditions.</p>
            <div className="why-card-footer">
              <span className="metric-pill"><i className="fa-solid fa-arrows-rotate"></i> Real-Time Weather</span>
            </div>
          </div>

          <div className="why-card">
            <div className="why-card-top">
              <div className="why-icon-box"><i className="fa-solid fa-flask-vial"></i></div>
              <span className="why-category-tag">Cost Efficiency</span>
            </div>
            <h3>Targeted Fertilizer Calculations</h3>
            <p>Calculates precise NPK deficiency dosage per hectare, helping you purchase only the fertilizer your soil actually needs and saving input costs.</p>
            <div className="why-card-footer">
              <span className="metric-pill"><i className="fa-solid fa-leaf"></i> Zero Resource Waste</span>
            </div>
          </div>

          <div className="why-card">
            <div className="why-card-top">
              <div className="why-icon-box"><i className="fa-solid fa-chart-line"></i></div>
              <span className="why-category-tag">Seasonal Tracking</span>
            </div>
            <h3>Multi-Plot Farm Logging</h3>
            <p>Stores historical soil test reports and past recommendations across multiple farm plots to track soil enrichment over harvest seasons.</p>
            <div className="why-card-footer">
              <span className="metric-pill"><i className="fa-solid fa-database"></i> Saved Field History</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section" style={{ padding: 'var(--section-padding) 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div className="section-header">
          <span className="section-tag"><i className="fa-solid fa-circle-question"></i> FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-accordion" role="region" aria-label="Frequently Asked Questions Accordion">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            const btnId = `faq-btn-${idx}`;
            const panelId = `faq-panel-${idx}`;
            return (
              <div
                key={idx}
                className="faq-item"
                style={{
                  background: 'var(--surface-white)',
                  marginBottom: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }}
              >
                <button
                  id={btnId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '1.2rem 1.5rem',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--primary-dark)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <i
                    className="fa-solid fa-chevron-down"
                    style={{
                      color: 'var(--accent-terracotta)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}
                  ></i>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  hidden={!isOpen}
                  style={{
                    padding: isOpen ? '0 1.5rem 1.5rem 1.5rem' : '0 1.5rem',
                    color: 'var(--text-body)',
                    lineHeight: 1.7,
                    maxHeight: isOpen ? '300px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    transition: 'all 0.3s ease-out'
                  }}
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
