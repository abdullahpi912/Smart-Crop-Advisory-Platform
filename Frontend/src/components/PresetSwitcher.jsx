import React from 'react';

export default function PresetSwitcher({ activePreset, onSelectPreset }) {
  const presets = [
    { id: 'custom', label: 'CUSTOM INPUTS', icon: 'fa-solid fa-pen-to-square' },
    { id: 'rice', label: 'WETLAND RICE', icon: 'fa-solid fa-wheat-awn' },
    { id: 'coffee', label: 'HIGHLAND COFFEE', icon: 'fa-solid fa-mug-hot' },
    { id: 'cotton', label: 'SEMI-ARID COTTON', icon: 'fa-solid fa-cloud' },
    { id: 'chickpea', label: 'ARID CHICKPEA', icon: 'fa-solid fa-seedling' }
  ];

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div className="presets-row">
        {presets.map((p) => {
          const isActive = activePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              className={`preset-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSelectPreset(p.id)}
            >
              <i className={p.icon} style={{ marginRight: '6px' }}></i>
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
