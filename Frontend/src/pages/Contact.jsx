import React, { useState } from 'react';

export default function Contact({ showToast }) {
  const [topic, setTopic] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website_trap: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.website_trap) {
      // Bot detected: silent ignore
      return;
    }
    if (!formData.name || !formData.email || !formData.message) {
      showToast?.('Please fill out all required fields.', 'warning');
      return;
    }
    showToast?.('Message transmitted. Agronomy support team will respond shortly.', 'success');
    setFormData({ name: '', email: '', message: '', website_trap: '' });
  };

  return (
    <main style={{ padding: 'calc(var(--nav-height) + 2rem) 0 5rem 0' }}>
      <div className="page-container">
        {/* Header */}
        <div className="section-header-editorial" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="section-title-large" style={{ margin: '0 auto' }}>Field Support &amp; System Inquiries</h1>
          <p className="section-desc-editorial" style={{ margin: '0.85rem auto 0 auto', maxWidth: '780px' }}>
            Have questions regarding ML model calibrations, suggestions for new crop species datasets, or need assistance configuring farm profiles? Transmit your query below.
          </p>
        </div>

        <div className="console-layout">
          {/* Support Form */}
          <form className="console-panel" onSubmit={handleSubmit}>
            {/* Honeypot Bot Trap Field */}
            <input
              type="text"
              name="website_trap"
              value={formData.website_trap}
              onChange={handleChange}
              style={{ display: 'none', position: 'absolute', left: '-9999px' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--agri-line)', paddingBottom: '1rem' }}>
              <span className="mono-accent" style={{ display: 'block', marginBottom: '0.6rem' }}>
                SELECT INQUIRY CATEGORY:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'general', label: 'GENERAL QUERY', icon: 'fa-solid fa-circle-info' },
                  { id: 'recommend', label: 'ADVISORY SUPPORT', icon: 'fa-solid fa-seedling' },
                  { id: 'model', label: 'ML MODEL FEEDBACK', icon: 'fa-solid fa-microchip' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`preset-chip ${topic === item.id ? 'active' : ''}`}
                    onClick={() => setTopic(item.id)}
                  >
                    <i className={item.icon} style={{ marginRight: '6px' }}></i>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="console-field" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="console-field" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email address"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="console-field" style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="message">Inquiry / Field Message</label>
              <div className="input-wrapper">
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Describe your inquiry, field context, or technical issue..."
                  required
                  value={formData.message}
                  onChange={handleChange}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary-technical" style={{ width: '100%' }}>
              <i className="fa-solid fa-paper-plane" style={{ marginRight: '6px' }}></i> TRANSMIT INQUIRY
            </button>
          </form>

          {/* Telemetry Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="console-panel">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>
                Agronomy Headquarters
              </h3>
              <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Cropling Precision Platform<br />
                Smart Soil AI Research Division<br />
                Agricultural Informatics Center
              </p>
            </div>

            <div className="console-panel">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>
                Advisory Support Desk
              </h3>
              <p style={{ color: 'var(--agri-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Email: <strong style={{ color: 'var(--agri-ink)' }}>support@cropling.io</strong><br />
                Active Hours: Mon &ndash; Fri, 08:00 &ndash; 18:00 EST
              </p>
            </div>

            <div className="console-panel">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>
                System Health
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="pulse-indicator"></span>
                <span style={{ fontWeight: 600, color: 'var(--agri-ink)' }}>Advisory Engine: OPERATIONAL (100%)</span>
              </div>
              <span className="mono-meta" style={{ color: 'var(--agri-muted)' }}>
                LATENCY OPTIMIZED • FLASK MODEL READY
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
