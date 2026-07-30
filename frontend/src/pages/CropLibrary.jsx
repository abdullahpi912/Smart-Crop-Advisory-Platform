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
    { id: 'all', label: 'All Items', icon: 'fa-solid fa-border-all' },
    { id: 'grains', label: '🌾 Grains & Cereals' },
    { id: 'pulses', label: '🌱 Pulses & Legumes' },
    { id: 'fruits', label: '🍎 Fruits & Orchard' },
    { id: 'commercial', label: '☕ Cash Crops' },
    { id: 'fertilizers', label: '🧪 Fertilizers & NPK' }
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
    <main>
      <section id="crops-hero">
        <div className="section-header">
          <span className="section-tag"><i className="fa-solid fa-book-open"></i> Agronomy Database</span>
          <h2 className="section-title">Crop &amp; Fertilizer Intelligence Library</h2>
          <p className="section-subtitle">
            Explore soil chemical requirements, rainfall limits, temperature thresholds, and fertilizer composition profiles for supported agricultural crops.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: '600px', margin: '0 auto 2rem auto', position: 'relative' }}>
          <input
            type="text"
            className="input-control"
            placeholder="Search crop or fertilizer by name, type, or soil conditions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '3rem', width: '100%' }}
          />
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-light)' }}></i>
        </div>

        {/* Category Filter Bar */}
        <div className="crop-filter-wrapper">
          <span className="filter-label"><i className="fa-solid fa-filter"></i> Filter Category:</span>
          <div className="crop-filter-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  cursor: 'pointer',
                  border: selectedCategory === cat.id ? '2px solid var(--accent-terracotta)' : '1px solid var(--border-subtle)',
                  backgroundColor: selectedCategory === cat.id ? 'var(--accent-terracotta)' : 'var(--surface-white)',
                  color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-dark)',
                  fontWeight: selectedCategory === cat.id ? 700 : 500,
                  padding: '0.55rem 1.15rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'var(--transition)'
                }}
              >
                {cat.icon && <i className={cat.icon} style={{ marginRight: '0.4rem' }}></i>}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="crop-catalog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {filteredCrops.length > 0 ? (
            filteredCrops.map((crop) => <CropCard key={crop.id} crop={crop} />)
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--surface-white)', borderRadius: 'var(--radius-sm)' }}>
              <i className="fa-solid fa-folder-open" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
              <h3>No matching crops found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search query or category filter.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
