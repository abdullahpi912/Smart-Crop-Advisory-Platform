import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main>
      {/* About Intro Section */}
      <section id="about">
        <div className="section-header">
          <span className="section-tag"><i className="fa-solid fa-seedling"></i> Precision Advisory Architecture</span>
          <h2 className="section-title">About AgriSense</h2>
          <p className="section-subtitle">
            Empowering smallholder farmers and agronomy teams with machine learning insights for data-driven precision agriculture.
          </p>
        </div>

        <div className="about-intro-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div className="about-text-content">
            <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1.2rem' }}>
              <strong>AgriSense</strong> is an end-to-end precision crop and fertilizer advisory platform engineered to optimize agricultural yields and promote sustainable soil management.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.2rem', color: 'var(--text-body)' }}>
              Traditional farming heavily relies on inherited seasonal intuition or past crop choices, which can fail when local weather anomalies or soil nutrient depletion occur. AgriSense bridges this gap by pairing intelligent classification algorithms with an intuitive advisory interface.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-body)' }}>
              By analyzing key field indicators — Nitrogen (N), Phosphorus (P), Potassium (K), Temperature, Humidity, Soil pH, and Rainfall — the platform accurately maps complex soil profiles to optimum high-yield crop and fertilizer choices.
            </p>
          </div>

          <div className="hero-image-wrapper">
            <div className="hero-floating-pill">
              <i className="fa-solid fa-leaf" style={{ color: 'var(--accent-gold)' }}></i> Precision Soil AI
            </div>
            <figure className="hero-image" style={{ height: '360px' }}>
              <img 
                src="/Farmer_image/Truck_image.jpg" 
                alt="Farm tractor working across vibrant agricultural farmland" 
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/Farmer_image/Truck_image'; }}
              />
            </figure>
          </div>
        </div>
      </section>

      {/* Core Agronomic Values Section */}
      <section id="values" style={{ padding: 'var(--section-padding) 1.5rem', background: 'var(--surface-white)', marginTop: '3rem', borderRadius: 'var(--radius-md)' }}>
        <div className="section-header">
          <span className="section-tag"><i className="fa-solid fa-compass"></i> Core Mission &amp; Principles</span>
          <h2 className="section-title">Driven by Sustainable Agriculture</h2>
          <p className="section-subtitle">
            Delivering data-backed confidence for planting decisions across diverse ecological zones.
          </p>
        </div>

        <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="why-card">
            <div className="why-card-top">
              <div className="why-icon-box"><i className="fa-solid fa-earth-americas"></i></div>
              <span className="why-category-tag">Environmental Balance</span>
            </div>
            <h3>Soil Health Preservation</h3>
            <p>Prevents over-fertilization and chemical leaching by delivering exact NPK deficit calculations tailored to soil chemistry.</p>
          </div>

          <div className="why-card">
            <div className="why-card-top">
              <div className="why-icon-box"><i className="fa-solid fa-chart-pie"></i></div>
              <span className="why-category-tag">Yield Maximization</span>
            </div>
            <h3>Data-Backed Prosperity</h3>
            <p>Eliminates planting risk by recommending crops with the highest statistical suitability for specific regional rainfall and thermal bounds.</p>
          </div>

          <div className="why-card">
            <div className="why-card-top">
              <div className="why-icon-box"><i className="fa-solid fa-shield-halved"></i></div>
              <span className="why-category-tag">Farmer Resilience</span>
            </div>
            <h3>Climate Adaptation</h3>
            <p>Helps farming communities adapt to changing seasonal weather patterns with real-time moisture and temperature matching.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--primary-dark)', color: '#fff', borderRadius: 'var(--radius-md)', margin: '3rem 0' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-gold)', marginBottom: '1rem' }}>Ready to optimize your field yield?</h2>
        <p style={{ color: 'var(--bg-canvas)', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
          Test your field soil parameters now and receive real-time crop recommendations.
        </p>
        <Link to="/recommend" className="btn btn-terracotta">
          <i className="fa-solid fa-wand-magic-sparkles"></i> Launch Advisory Simulator
        </Link>
      </section>
    </main>
  );
}
