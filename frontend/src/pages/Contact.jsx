import React, { useState } from 'react';

export default function Contact({ showToast }) {
  const [topic, setTopic] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast?.('Please fill out all required fields', 'error');
      return;
    }
    showToast?.('Thank you for reaching out! Our agronomy advisory team will respond shortly.', 'success');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <main>
      <section id="contact">
        <div className="section-header">
          <span className="section-tag"><i className="fa-solid fa-envelope"></i> Reach Out</span>
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">
            Have questions about AgriSense, suggestions for crop machine learning models, or feedback on the user interface? Send us a message.
          </p>
        </div>

        <div className="contact-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Contact Form */}
          <form className="form-card" onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.6rem' }}>
                Select Inquiry Subject:
              </label>
              <div className="topic-pills" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'general', label: 'General Query', icon: 'fa-solid fa-circle-info' },
                  { id: 'recommend', label: 'Advisory Help', icon: 'fa-solid fa-seedling' },
                  { id: 'model', label: 'ML Model Feedback', icon: 'fa-solid fa-brain' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`topic-pill-label ${topic === item.id ? 'active' : ''}`}
                    onClick={() => setTopic(item.id)}
                    style={{
                      cursor: 'pointer',
                      border: topic === item.id ? '2px solid var(--accent-terracotta)' : '1px solid var(--border-subtle)',
                      backgroundColor: topic === item.id ? 'rgba(217, 107, 67, 0.12)' : 'var(--surface-white)',
                      color: topic === item.id ? 'var(--accent-terracotta)' : 'var(--text-dark)',
                      fontWeight: topic === item.id ? 700 : 500,
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'var(--transition)'
                    }}
                  >
                    <i className={item.icon}></i> {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field form-field-full">
                <label htmlFor="name">Your Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="e.g. Abdullah P I"
                    required
                    className="input-control"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <i className="fa-solid fa-user"></i>
                </div>
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="e.g. farmer@example.com"
                    required
                    className="input-control"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <i className="fa-solid fa-envelope"></i>
                </div>
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="message">Message / Feedback</label>
                <div className="input-wrapper">
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder="Write your query or agronomy feedback here..."
                    required
                    className="input-control textarea-control"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                  <i className="fa-solid fa-comment" style={{ top: '1.25rem' }}></i>
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-terracotta btn-block">
                <i className="fa-solid fa-paper-plane"></i> Send Message
              </button>
            </div>
          </form>

          {/* Sidebar */}
          <div className="contact-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="contact-info-card" style={{ background: 'var(--surface-white)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <h3><i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-terracotta)', marginRight: '0.5rem' }}></i> Agronomy Headquarters</h3>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-body)' }}>AgriSense Precision Advisory Base<br />Smart Soil AI Research Division</p>
            </div>

            <div className="contact-info-card" style={{ background: 'var(--surface-white)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <h3><i className="fa-solid fa-headset" style={{ color: 'var(--accent-terracotta)', marginRight: '0.5rem' }}></i> Advisory Support</h3>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-body)' }}>Email: <strong>support@agrisense.io</strong><br />Mon – Fri, 8am – 6pm EST</p>
            </div>

            <div className="contact-info-card" style={{ background: 'var(--surface-white)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <h3><i className="fa-solid fa-heart-pulse" style={{ color: 'var(--primary-light)', marginRight: '0.5rem' }}></i> Platform Health</h3>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-body)' }}>Advisory Engine Status: <strong style={{ color: 'var(--primary-light)' }}>Operational (100%)</strong><br />Data Models: <strong>Active</strong></p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
