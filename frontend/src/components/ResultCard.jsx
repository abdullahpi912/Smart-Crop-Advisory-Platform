import React from 'react';
import { Link } from 'react-router-dom';

export default function ResultCard({ result, isLoading }) {
  if (isLoading) {
    return (
      <div className="results-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', minHeight: '380px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--accent-terracotta)', marginBottom: '1.5rem' }}></i>
        <h3 style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>Evaluating Soil Vectors...</h3>
        <p style={{ color: 'var(--text-muted)' }}>Running machine learning classification engine against regional soil databases.</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="results-card" style={{ display: 'block', animation: 'fadeIn 0.4s ease-out' }}>
      <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span className="results-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59, 110, 71, 0.15)', color: 'var(--primary-light)', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontWeight: 700, fontSize: '0.85rem' }}>
            <i className="fa-solid fa-microchip"></i> ML Advisory Engine Output
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Generated: {result.timestamp}</p>
        </div>
        <span className="confidence-badge" style={{ background: 'var(--primary-dark)', color: 'var(--accent-gold)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '1rem' }}>
          <i className="fa-solid fa-shield-check"></i> {result.confidence} Confidence
        </span>
      </div>

      <div className="recommendation-hero" style={{ background: 'var(--bg-warm-tint)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', borderLeft: '5px solid var(--accent-terracotta)', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Recommended Match:</span>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)', margin: '0.2rem 0 0.5rem 0' }}>
          {result.recommendedItem}
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-body)', margin: 0 }}>
          {result.detailedNotes}
        </p>
      </div>

      <div className="result-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="detail-item" style={{ background: 'var(--surface-white)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}><i className="fa-solid fa-vial"></i> Soil N-P-K Readings</span>
          <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{result.npkSummary}</strong>
        </div>

        <div className="detail-item" style={{ background: 'var(--surface-white)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}><i className="fa-solid fa-cloud-sun-rain"></i> Climate &amp; pH</span>
          <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{result.climateSummary}</strong>
        </div>

        <div className="detail-item" style={{ background: 'var(--surface-white)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}><i className="fa-solid fa-heart-pulse"></i> Soil Chemistry Status</span>
          <strong style={{ fontSize: '1rem', color: 'var(--accent-terracotta)' }}>{result.soilHealth}</strong>
        </div>
      </div>

      <div className="result-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/dashboard" className="btn btn-terracotta" style={{ flex: 1, textAlign: 'center' }}>
          <i className="fa-solid fa-database"></i> View Saved in History Log
        </Link>
      </div>
    </div>
  );
}
