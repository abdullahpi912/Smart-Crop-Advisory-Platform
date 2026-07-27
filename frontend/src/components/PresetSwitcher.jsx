import React from 'react';

export default function PresetSwitcher({ activePreset, onSelectPreset }) {
  const presets = [
    { id: 'custom', label: 'Custom Inputs', icon: 'fa-solid fa-pen-to-square' },
    { id: 'rice', label: '🌾 Wetland Rice Preset' },
    { id: 'coffee', label: '☕ Highland Coffee Preset' },
    { id: 'cotton', label: '☁️ Semi-Arid Cotton Preset' },
    { id: 'chickpea', label: '🌱 Arid Chickpea Preset' }
  ];

  return (
    <div className="presets-section">
      <p className="presets-title">
        <i className="fa-solid fa-sliders"></i> Quick Test Preset Profiles:
      </p>
      <div className="preset-labels">
        {presets.map((p) => {
          const isActive = activePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              className={`preset-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectPreset(p.id)}
              style={{
                cursor: 'pointer',
                border: isActive ? '2px solid var(--accent-terracotta)' : '1px solid var(--border-subtle)',
                backgroundColor: isActive ? 'rgba(217, 107, 67, 0.12)' : 'var(--surface-white)',
                color: isActive ? 'var(--accent-terracotta)' : 'var(--text-dark)',
                fontWeight: isActive ? 700 : 500,
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition)'
              }}
            >
              {p.icon && <i className={p.icon} style={{ marginRight: '0.5rem' }}></i>}
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
