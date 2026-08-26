import React, { useState } from 'react';
import CropCard from '../components/CropCard';

export default function CropLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const catalogData = [
    {
      id: 1,
      title: 'Paddy Rice',
      category: 'Grains & Cereals',
      categoryClass: 'cat-grains',
      categoryId: 'grains',
      icon: '🌾',
      tagline: 'Thrives in clayey moist soils with high water retention and warm temperatures.',
      npk: '80-40-40 kg/ha',
      temp: '20 – 27 °C',
      ph: '5.5 – 6.8',
      rainfall: '200 – 300 mm'
    },
    {
      id: 2,
      title: 'Highland Coffee',
      category: 'Cash Crops',
      categoryClass: 'cat-commercial',
      categoryId: 'commercial',
      icon: '☕',
      tagline: 'Perennial commercial crop preferring cool acidic highland soils and high rainfall.',
      npk: '100-20-30 kg/ha',
      temp: '23 – 28 °C',
      ph: '5.5 – 6.2',
      rainfall: '1500 – 2000 mm'
    },
    {
      id: 3,
      title: 'Semi-Arid Cotton',
      category: 'Cash Crops',
      categoryClass: 'cat-commercial',
      categoryId: 'commercial',
      icon: '☁️',
      tagline: 'Drought-resistant fiber crop requiring warm temperatures and moderate soil nitrogen.',
      npk: '120-45-40 kg/ha',
      temp: '28 – 34 °C',
      ph: '6.5 – 8.0',
      rainfall: '60 – 100 mm'
    },
    {
      id: 4,
      title: 'Arid Chickpea',
      category: 'Pulses & Legumes',
      categoryClass: 'cat-pulses',
      categoryId: 'pulses',
      icon: '🌱',
      tagline: 'Nitrogen-fixing pulse crop highly suitable for low moisture alkaline soils.',
      npk: '20-60-80 kg/ha',
      temp: '18 – 24 °C',
      ph: '6.8 – 7.8',
      rainfall: '35 – 55 mm'
    },
    {
      id: 5,
      title: 'Golden Maize / Corn',
      category: 'Grains & Cereals',
      categoryClass: 'cat-grains',
      categoryId: 'grains',
      icon: '🌽',
      tagline: 'Fast-growing cereal crop demanding well-drained loamy soil and balanced nitrogen.',
      npk: '80-40-40 kg/ha',
      temp: '22 – 28 °C',
      ph: '5.8 – 7.0',
      rainfall: '80 – 120 mm'
    },
    {
      id: 6,
      title: 'Temperate Apple Orchard',
      category: 'Fruits & Orchard',
      categoryClass: 'cat-fruits',
      categoryId: 'fruits',
      icon: '🍎',
      tagline: 'High-elevation fruit trees requiring cool winter chilling and moderate soil organic matter.',
      npk: '40-30-50 kg/ha',
      temp: '14 – 22 °C',
      ph: '5.8 – 6.5',
      rainfall: '100 – 140 mm'
    },
    {
      id: 7,
      title: 'Urea (46% N) Fertilizer',
      category: 'Fertilizers & NPK',
      categoryClass: 'cat-fertilizers',
      categoryId: 'fertilizers',
      icon: '🧪',
      tagline: 'High-concentration nitrogen fertilizer essential for rapid vegetative growth.',
      npk: '46-0-0 %',
      temp: 'All Climates',
      ph: 'Neutralizes Neutral',
      rainfall: 'Water Soluble'
    },
    {
      id: 8,
      title: 'DAP (18-46-0) Complex',
      category: 'Fertilizers & NPK',
      categoryClass: 'cat-fertilizers',
      categoryId: 'fertilizers',
      icon: '⚗️',
      tagline: 'Phosphorus-rich root enhancer recommended during early sowing and seed planting.',
      npk: '18-46-0 %',
      temp: 'All Climates',
      ph: 'Soil Compatible',
      rainfall: 'Granular Release'
    }
  ];

  const categories = [
    { id: 'all', label: 'ALL SPECIES', icon: 'fa-solid fa-border-all' },
    { id: 'grains', label: 'GRAINS & CEREALS', icon: 'fa-solid fa-wheat-awn' },
    { id: 'pulses', label: 'PULSES & LEGUMES', icon: 'fa-solid fa-seedling' },
    { id: 'fruits', label: 'FRUITS & ORCHARD', icon: 'fa-solid fa-apple-whole' },
    { id: 'commercial', label: 'CASH CROPS', icon: 'fa-solid fa-mug-hot' },
    { id: 'fertilizers', label: 'FERTILIZERS & NPK', icon: 'fa-solid fa-flask' }
  ];

  const filteredCrops = catalogData.filter((crop) => {
    const matchesCategory = selectedCategory === 'all' || crop.categoryId === selectedCategory;
    const matchesSearch =
      crop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main style={{ padding: 'calc(var(--nav-height) + 2rem) 0 5rem 0' }}>
      <div className="page-container">
        {/* Header */}
        <div className="section-header-editorial">
          <div className="section-meta-row">
            <span className="mono-accent">DATABASE • INDEX</span>
            <div className="section-meta-rule"></div>
            <span className="mono-meta">AGRONOMIC SPECIES REPOSITORY</span>
          </div>
          <h1 className="section-title-large">Crop &amp; Fertilizer Intelligence Library</h1>
          <p className="section-desc-editorial">
            Explore validated soil chemistry bounds, precipitation thresholds, temperature tolerances, and nutrient requirements for supported crops and fertilizer formulations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="crop-search-bar">
          <div className="console-field">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Search crop or fertilizer by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--agri-muted)' }}
              ></i>
            </div>
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="crop-filter-row">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`preset-chip ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <i className={cat.icon} style={{ marginRight: '6px' }}></i>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Editorial Crop Index Grid */}
        <div className="crop-index-grid">
          {filteredCrops.length > 0 ? (
            filteredCrops.map((crop, idx) => (
              <CropCard key={crop.id} crop={crop} index={idx} />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'var(--agri-surface)', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
              <span className="mono-meta" style={{ display: 'block', marginBottom: '0.75rem' }}>NO MATCHING RECORDS</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No crops or fertilizers found</h3>
              <p style={{ color: 'var(--agri-muted)', marginTop: '0.5rem' }}>Try clearing your search query or selecting a different category filter.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
