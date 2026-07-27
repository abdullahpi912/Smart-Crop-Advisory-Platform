import React from 'react';
import { Link } from 'react-router-dom';

export default function CropCard({ crop }) {
  return (
    <article className={`crop-card ${crop.categoryClass}`}>
      <div className="crop-card-header">
        <span className="crop-cat-badge">{crop.category}</span>
        <div className="crop-card-icon">{crop.icon}</div>
      </div>
      <div className="crop-card-body">
        <h3>{crop.title}</h3>
        <p className="crop-tagline">{crop.tagline}</p>

        <div className="crop-specs-list">
          <div className="spec-row">
            <span>Ideal NPK (N-P-K):</span>
            <strong>{crop.npk}</strong>
          </div>
          <div className="spec-row">
            <span>Ideal Temp:</span>
            <strong>{crop.temp}</strong>
          </div>
          <div className="spec-row">
            <span>Ideal pH:</span>
            <strong>{crop.ph}</strong>
          </div>
          <div className="spec-row">
            <span>Rainfall Requirement:</span>
            <strong>{crop.rainfall}</strong>
          </div>
        </div>
      </div>
      <div className="crop-card-footer">
        <Link to="/recommend" className="btn-sm btn-crop-action btn-block">
          <i className="fa-solid fa-flask-vial"></i> Test Soil Profile
        </Link>
      </div>
    </article>
  );
}
