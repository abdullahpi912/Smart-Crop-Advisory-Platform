import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ResultCard from '../components/ResultCard';
import DocumentUpload from '../components/DocumentUpload';
import { calculateRecommendation } from '../lib/recommendationEngine';
import { API_BASE_URL } from '../lib/apiConfig';

// Default static fallbacks for instant UI rendering if backend is offline
const DEFAULT_FERTILIZER_OPTIONS = {
  districts: ['Kolhapur', 'Pune', 'Sangli', 'Satara', 'Solapur'],
  soilColors: ['Black', 'Dark Brown', 'Light Brown', 'Medium Brown', 'Red', 'Reddish Brown'],
  crops: ['Cotton', 'Ginger', 'Gram', 'Grapes', 'Groundnut', 'Jowar', 'Maize', 'Masoor', 'Moong', 'Rice', 'Soybean', 'Sugarcane', 'Tur', 'Turmeric', 'Urad', 'Wheat']
};

const DEFAULT_YIELD_OPTIONS = {
  states: [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ],
  seasons: ['Autumn', 'Kharif', 'Rabi', 'Summer', 'Winter', 'Whole Year'],
  crops: [
    'Rice', 'Wheat', 'Sugarcane', 'Cotton(lint)', 'Maize', 'Soyabean', 'Bajra', 'Jowar',
    'Gram', 'Moong(Green Gram)', 'Urad', 'Arhar/Tur', 'Groundnut', 'Sunflower', 'Sesamum',
    'Rapeseed &Mustard', 'Tobacco', 'Jute', 'Tea', 'Coffee', 'Coconut', 'Arecanut',
    'Onion', 'Potato', 'Tapioca', 'Banana', 'Dry chillies', 'Turmeric', 'Cardamom',
    'Black pepper', 'Coriander', 'Garlic', 'Ginger', 'Cashewnut', 'Castor seed',
    'Other Cereals & Millets', 'Horse-gram', 'Khesari', 'Oilseeds total', 'Sannhamp',
    'Guar seed', 'Moth', 'Barley', 'Peas & beans (Pulses)'
  ]
};

// Searchable Combobox Component with Seamless Single-Input In-Place Search
function SearchableCombobox({ id, options = [], value, onChange, placeholder = 'Search from 124 agricultural crop species...', disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className={`searchable-combobox ${isOpen ? 'open' : ''}`} ref={wrapperRef}>
      <div className="searchable-combobox-input-wrapper">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={isOpen ? query : (value || '')}
          placeholder={isOpen ? placeholder : (value || placeholder)}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setQuery('');
            }
          }}
          onClick={() => {
            if (!disabled && !isOpen) {
              setIsOpen(true);
              setQuery('');
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          disabled={disabled}
          autoComplete="off"
          required={!value}
        />
        <i className={`fa-solid fa-chevron-down searchable-combobox-icon ${isOpen ? 'rotated' : ''}`}></i>
      </div>

      {isOpen && !disabled && (
        <div className="searchable-combobox-dropdown" role="listbox">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <div
                key={opt}
                role="option"
                aria-selected={opt === value}
                className={`searchable-combobox-option ${opt === value ? 'selected' : ''}`}
                onMouseDown={(e) => {
                  // Prevent input blur before click registers
                  e.preventDefault();
                  handleSelect(opt);
                }}
              >
                <span>{opt}</span>
                {opt === value && <i className="fa-solid fa-check" style={{ fontSize: '11px' }}></i>}
              </div>
            ))
          ) : (
            <div className="searchable-combobox-empty">No matching crops found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Recommend({ showToast, mode = 'crop' }) {
  const location = useLocation();

  const [preset, setPreset] = useState('custom');
  const [highlightedFields, setHighlightedFields] = useState(new Set());

  // Options catalog from backend /api/options
  const [optionsData, setOptionsData] = useState({
    fertilizer: DEFAULT_FERTILIZER_OPTIONS,
    yield: DEFAULT_YIELD_OPTIONS
  });

  // Form State for Model 1: Crop Selection
  const [cropFormData, setCropFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });

  // Form State for Model 2: Fertilizer Advisory
  const [fertilizerFormData, setFertilizerFormData] = useState({
    district_name: '',
    soil_color: '',
    crop: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    rainfall: '',
    temperature: ''
  });

  // Form State for Model 3: Crop Yield Prediction
  const [yieldFormData, setYieldFormData] = useState({
    state_name: '',
    season: '',
    crop: '',
    crop_year: '',
    area: ''
  });

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);

  // Fetch model options from backend on mount
  useEffect(() => {
    const fetchOptions = async () => {
      const backendUrl = API_BASE_URL;
      try {
        const response = await fetch(`${backendUrl}/api/options`);
        if (response.ok) {
          const data = await response.json();
          if (data.fertilizer && data.yield) {
            setOptionsData({
              fertilizer: {
                districts: data.fertilizer.districts || DEFAULT_FERTILIZER_OPTIONS.districts,
                soilColors: data.fertilizer.soilColors || data.fertilizer.soil_colors || DEFAULT_FERTILIZER_OPTIONS.soilColors,
                crops: data.fertilizer.crops || DEFAULT_FERTILIZER_OPTIONS.crops
              },
              yield: {
                states: data.yield.states || DEFAULT_YIELD_OPTIONS.states,
                seasons: data.yield.seasons || DEFAULT_YIELD_OPTIONS.seasons,
                crops: data.yield.crops || DEFAULT_YIELD_OPTIONS.crops
              }
            });
          }
        }
      } catch (err) {
        console.warn('Backend options catalog unavailable, using built-in defaults:', err);
      }
    };
    fetchOptions();
  }, []);

  // Auto-populate from navigation state (e.g. Rerun from Dashboard)
  useEffect(() => {
    if (location.state) {
      const s = location.state;

      if (mode === 'crop') {
        setCropFormData((prev) => ({
          ...prev,
          nitrogen: s.nitrogen ?? prev.nitrogen,
          phosphorus: s.phosphorus ?? prev.phosphorus,
          potassium: s.potassium ?? prev.potassium,
          temperature: s.temperature ?? prev.temperature,
          humidity: s.humidity ?? prev.humidity,
          ph: s.ph ?? prev.ph,
          rainfall: s.rainfall ?? prev.rainfall
        }));
      } else if (mode === 'fertilizer') {
        setFertilizerFormData((prev) => ({
          ...prev,
          district_name: s.district_name || s.district || prev.district_name,
          soil_color: s.soil_color || s.soilColor || prev.soil_color,
          crop: s.crop || prev.crop,
          nitrogen: s.nitrogen ?? prev.nitrogen,
          phosphorus: s.phosphorus ?? prev.phosphorus,
          potassium: s.potassium ?? prev.potassium,
          ph: s.ph ?? prev.ph,
          rainfall: s.rainfall ?? prev.rainfall,
          temperature: s.temperature ?? prev.temperature
        }));
      } else if (mode === 'yield') {
        setYieldFormData((prev) => ({
          ...prev,
          state_name: s.state_name || s.state || prev.state_name,
          season: s.season || prev.season,
          crop: s.crop || prev.crop,
          crop_year: s.crop_year || s.year || prev.crop_year,
          area: s.area || s.area_hectares || prev.area
        }));
      }

      setPreset('custom');
      showToast?.(`Loaded ${mode.toUpperCase()} advisory inputs from farm history log`, 'info');
    }
  }, [location.state, mode]);

  // Preset definitions per mode
  const cropPresets = {
    custom: { nitrogen: '', phosphorus: '', potassium: '', temperature: '', humidity: '', ph: '', rainfall: '' },
    rice: { nitrogen: 90, phosphorus: 42, potassium: 43, temperature: 26.5, humidity: 82, ph: 6.5, rainfall: 220 },
    coffee: { nitrogen: 100, phosphorus: 20, potassium: 30, temperature: 25.0, humidity: 75, ph: 5.8, rainfall: 1600 },
    cotton: { nitrogen: 120, phosphorus: 45, potassium: 40, temperature: 30.5, humidity: 55, ph: 7.2, rainfall: 75 },
    chickpea: { nitrogen: 20, phosphorus: 60, potassium: 80, temperature: 20.0, humidity: 45, ph: 7.5, rainfall: 40 }
  };

  const fertilizerPresets = {
    custom: { district_name: '', soil_color: '', crop: '', nitrogen: '', phosphorus: '', potassium: '', ph: '', rainfall: '', temperature: '' },
    sugarcane_black: { district_name: 'Kolhapur', soil_color: 'Black', crop: 'Sugarcane', nitrogen: 75.0, phosphorus: 50.0, potassium: 100.0, ph: 6.5, rainfall: 1000.0, temperature: 20.0 },
    wheat_pune: { district_name: 'Pune', soil_color: 'Dark Brown', crop: 'Wheat', nitrogen: 35.0, phosphorus: 40.0, potassium: 35.0, ph: 6.2, rainfall: 180.0, temperature: 24.0 },
    cotton_solapur: { district_name: 'Solapur', soil_color: 'Medium Brown', crop: 'Cotton', nitrogen: 20.0, phosphorus: 60.0, potassium: 25.0, ph: 7.2, rainfall: 70.0, temperature: 32.0 },
    groundnut_sangli: { district_name: 'Sangli', soil_color: 'Red', crop: 'Groundnut', nitrogen: 25.0, phosphorus: 50.0, potassium: 40.0, ph: 6.8, rainfall: 95.0, temperature: 27.0 }
  };

  const yieldPresets = {
    custom: { state_name: '', season: '', crop: '', crop_year: '', area: '' },
    maharashtra_rice: { state_name: 'Maharashtra', season: 'Kharif', crop: 'Rice', crop_year: 2024, area: 10.0 },
    punjab_wheat: { state_name: 'Punjab', season: 'Rabi', crop: 'Wheat', crop_year: 2024, area: 5.0 },
    up_sugarcane: { state_name: 'Uttar Pradesh', season: 'Whole Year', crop: 'Sugarcane', crop_year: 2024, area: 8.0 },
    gujarat_cotton: { state_name: 'Gujarat', season: 'Kharif', crop: 'Cotton(lint)', crop_year: 2024, area: 6.0 }
  };

  const clearHighlight = (name) => {
    setHighlightedFields((prev) => {
      if (prev.has(name)) {
        const next = new Set(prev);
        next.delete(name);
        return next;
      }
      return prev;
    });
  };

  const handleExtracted = (extracted, fieldsFound) => {
    if (!extracted) return;

    if (mode === 'crop') {
      setCropFormData((prev) => ({
        ...prev,
        nitrogen: extracted.nitrogen !== undefined && extracted.nitrogen !== null ? extracted.nitrogen : prev.nitrogen,
        phosphorus: extracted.phosphorus !== undefined && extracted.phosphorus !== null ? extracted.phosphorus : prev.phosphorus,
        potassium: extracted.potassium !== undefined && extracted.potassium !== null ? extracted.potassium : prev.potassium,
        temperature: extracted.temperature !== undefined && extracted.temperature !== null ? extracted.temperature : prev.temperature,
        humidity: extracted.humidity !== undefined && extracted.humidity !== null ? extracted.humidity : prev.humidity,
        ph: extracted.ph !== undefined && extracted.ph !== null ? extracted.ph : prev.ph,
        rainfall: extracted.rainfall !== undefined && extracted.rainfall !== null ? extracted.rainfall : prev.rainfall
      }));
    } else if (mode === 'fertilizer') {
      setFertilizerFormData((prev) => ({
        ...prev,
        district_name: extracted.district_name || prev.district_name,
        soil_color: extracted.soil_color || prev.soil_color,
        crop: extracted.crop || prev.crop,
        nitrogen: extracted.nitrogen !== undefined && extracted.nitrogen !== null ? extracted.nitrogen : prev.nitrogen,
        phosphorus: extracted.phosphorus !== undefined && extracted.phosphorus !== null ? extracted.phosphorus : prev.phosphorus,
        potassium: extracted.potassium !== undefined && extracted.potassium !== null ? extracted.potassium : prev.potassium,
        ph: extracted.ph !== undefined && extracted.ph !== null ? extracted.ph : prev.ph,
        rainfall: extracted.rainfall !== undefined && extracted.rainfall !== null ? extracted.rainfall : prev.rainfall,
        temperature: extracted.temperature !== undefined && extracted.temperature !== null ? extracted.temperature : prev.temperature
      }));
    } else if (mode === 'yield') {
      setYieldFormData((prev) => ({
        ...prev,
        state_name: extracted.state_name || prev.state_name,
        season: extracted.season || prev.season,
        crop: extracted.crop || prev.crop,
        crop_year: extracted.crop_year !== undefined && extracted.crop_year !== null ? extracted.crop_year : prev.crop_year,
        area: extracted.area !== undefined && extracted.area !== null ? extracted.area : prev.area
      }));
    }

    setPreset('custom');
    if (fieldsFound && fieldsFound.length > 0) {
      setHighlightedFields(new Set(fieldsFound));
    }
  };

  const handleSelectCropPreset = (id) => {
    setPreset(id);
    setHighlightedFields(new Set());
    if (cropPresets[id]) {
      setCropFormData(cropPresets[id]);
      showToast?.(`Loaded ${id.toUpperCase()} crop preset`, 'info');
    }
  };

  const handleSelectFertPreset = (id) => {
    setPreset(id);
    setHighlightedFields(new Set());
    if (fertilizerPresets[id]) {
      setFertilizerFormData(fertilizerPresets[id]);
      showToast?.(`Loaded ${id.toUpperCase()} fertilizer preset`, 'info');
    }
  };

  const handleSelectYieldPreset = (id) => {
    setPreset(id);
    setHighlightedFields(new Set());
    if (yieldPresets[id]) {
      setYieldFormData(yieldPresets[id]);
      showToast?.(`Loaded ${id.toUpperCase()} yield preset`, 'info');
    }
  };

  const handleCropChange = (e) => {
    const { name, value } = e.target;
    setCropFormData((prev) => ({ ...prev, [name]: value }));
    clearHighlight(name);
    setPreset('custom');
  };

  const handleFertilizerChange = (e) => {
    const { name, value } = e.target;
    setFertilizerFormData((prev) => ({ ...prev, [name]: value }));
    clearHighlight(name);
    setPreset('custom');
  };

  const handleYieldChange = (e) => {
    const { name, value } = e.target;
    setYieldFormData((prev) => ({ ...prev, [name]: value }));
    clearHighlight(name);
    setPreset('custom');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setProcessingStage(0);

    const stageTimer1 = setTimeout(() => setProcessingStage(1), 160);
    const stageTimer2 = setTimeout(() => setProcessingStage(2), 340);
    const stageTimer3 = setTimeout(() => setProcessingStage(3), 520);

    let computed = null;
    let isFromBackend = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      if (mode === 'crop') {
        let response = await fetch(`${backendUrl}/api/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
          body: JSON.stringify(cropFormData)
        });

        if (response.ok) {
          const resData = await response.json();
          computed = resData.recommendation || resData;
          isFromBackend = true;
        } else {
          response = await fetch(`${backendUrl}/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            signal: controller.signal,
            body: JSON.stringify(cropFormData)
          });
          if (response.ok) {
            computed = await response.json();
            isFromBackend = true;
          }
        }
      } else if (mode === 'fertilizer') {
        const response = await fetch(`${backendUrl}/api/predict/fertilizer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
          body: JSON.stringify(fertilizerFormData)
        });
        if (response.ok) {
          computed = await response.json();
          isFromBackend = true;
        } else {
          const errData = await response.json().catch(() => ({}));
          if (errData.error) showToast?.(errData.error, 'error');
        }
      } else if (mode === 'yield') {
        const response = await fetch(`${backendUrl}/api/predict/yield`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
          body: JSON.stringify(yieldFormData)
        });
        if (response.ok) {
          computed = await response.json();
          isFromBackend = true;
        } else {
          const errData = await response.json().catch(() => ({}));
          if (errData.error) showToast?.(errData.error, 'error');
        }
      }
    } catch (err) {
      console.warn('Backend API connection issue, running local engine:', err);
      if (err.name === 'AbortError') {
        showToast?.('This is taking longer than usual — loaded instant advisory from local intelligence engine.', 'info');
      } else {
        showToast?.('Reconnecting to the server — this can take up to a minute on first use, loaded instant advisory.', 'info');
      }
    } finally {
      clearTimeout(timeoutId);
    }

    // Client-side fallback engine if backend is offline
    if (!computed) {
      const payload = mode === 'crop' ? cropFormData : (mode === 'fertilizer' ? fertilizerFormData : yieldFormData);
      computed = calculateRecommendation({
        ...payload,
        mode,
        preset
      });
    }

    clearTimeout(stageTimer1);
    clearTimeout(stageTimer2);
    clearTimeout(stageTimer3);
    setProcessingStage(4);

    setTimeout(() => {
      setResult(computed);
      setIsLoading(false);

      // Save to localStorage history (only if user is signed in)
      let currentUsername = null;
      try {
        const storedUser = localStorage.getItem('cropling_user') || localStorage.getItem('agrisense_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          currentUsername = u.username || u.name || u.id;
        } else {
          const storedSession = localStorage.getItem('cropling_session') || localStorage.getItem('agrisense_session');
          if (storedSession) {
            const s = JSON.parse(storedSession);
            currentUsername = s.username || s.userId;
          }
        }
      } catch (_) {}

      if (currentUsername) {
        try {
          const userKey = `cropling_history_${currentUsername}`;
          const history = JSON.parse(localStorage.getItem(userKey) || localStorage.getItem('cropling_history') || localStorage.getItem('agrisense_history') || '[]');
          const cleanHistory = history.filter(h => (h.logId || h.recId) !== (computed.logId || computed.recId));
          const updated = JSON.stringify([computed, ...cleanHistory]);
          localStorage.setItem(userKey, updated);
          localStorage.setItem('cropling_history', updated);
          localStorage.setItem('agrisense_history', updated);
          if (isFromBackend) {
            showToast?.(`Live ML model prediction generated successfully!`, 'success');
          } else {
            showToast?.(`Advisory calculated and logged to farm dashboard!`, 'success');
          }
        } catch (err) {
          console.error('Failed to update history', err);
        }
      } else {
        showToast?.('Prediction complete — sign in to save this to your farm dashboard!', 'info');
      }
    }, 240);
  };

  return (
    <main style={{ padding: 'calc(var(--nav-height) + 2rem) 0 5rem 0' }}>
      <div className="page-container">
        {/* Section Header */}
        <div className="section-header-editorial" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="section-title-large" style={{ margin: '0 auto' }}>Field Advisory &amp; Yield Console</h1>
          <p className="section-desc-editorial" style={{ margin: '0.85rem auto 0 auto', maxWidth: '780px' }}>
            Execute machine learning inference across crop selection, tailored fertilizer dosage recommendations, and regional crop yield production forecasts.
          </p>
        </div>

        {/* Centered Model Title */}
        <div className="mode-page-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-title-large" style={{ fontSize: '1.75rem' }}>
            {mode === 'crop' && (<><i className="fa-solid fa-wheat-awn" style={{ marginRight: '10px' }}></i>CROP SELECTION</>)}
            {mode === 'fertilizer' && (<><i className="fa-solid fa-flask-vial" style={{ marginRight: '10px' }}></i>FERTILIZER ADVISORY</>)}
            {mode === 'yield' && (<><i className="fa-solid fa-chart-line" style={{ marginRight: '10px' }}></i>YIELD PREDICTION</>)}
          </h2>
        </div>

        {/* Dynamic Preset Switcher */}
        <div className="presets-row">
          <span className="mono-meta" style={{ display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>
            SCENARIO PRESETS:
          </span>

          {mode === 'crop' && (
            <>
              <button type="button" className={`preset-chip ${preset === 'custom' ? 'active' : ''}`} onClick={() => handleSelectCropPreset('custom')}>Custom</button>
              <button type="button" className={`preset-chip ${preset === 'rice' ? 'active' : ''}`} onClick={() => handleSelectCropPreset('rice')}>Wetland Rice</button>
              <button type="button" className={`preset-chip ${preset === 'coffee' ? 'active' : ''}`} onClick={() => handleSelectCropPreset('coffee')}>Highland Coffee</button>
              <button type="button" className={`preset-chip ${preset === 'cotton' ? 'active' : ''}`} onClick={() => handleSelectCropPreset('cotton')}>Semi-Arid Cotton</button>
              <button type="button" className={`preset-chip ${preset === 'chickpea' ? 'active' : ''}`} onClick={() => handleSelectCropPreset('chickpea')}>Arid Chickpea</button>
            </>
          )}

          {mode === 'fertilizer' && (
            <>
              <button type="button" className={`preset-chip ${preset === 'custom' ? 'active' : ''}`} onClick={() => handleSelectFertPreset('custom')}>Custom</button>
              <button type="button" className={`preset-chip ${preset === 'sugarcane_black' ? 'active' : ''}`} onClick={() => handleSelectFertPreset('sugarcane_black')}>Sugarcane (Kolhapur)</button>
              <button type="button" className={`preset-chip ${preset === 'wheat_pune' ? 'active' : ''}`} onClick={() => handleSelectFertPreset('wheat_pune')}>Wheat (Pune)</button>
              <button type="button" className={`preset-chip ${preset === 'cotton_solapur' ? 'active' : ''}`} onClick={() => handleSelectFertPreset('cotton_solapur')}>Cotton (Solapur)</button>
              <button type="button" className={`preset-chip ${preset === 'groundnut_sangli' ? 'active' : ''}`} onClick={() => handleSelectFertPreset('groundnut_sangli')}>Groundnut (Sangli)</button>
            </>
          )}

          {mode === 'yield' && (
            <>
              <button type="button" className={`preset-chip ${preset === 'custom' ? 'active' : ''}`} onClick={() => handleSelectYieldPreset('custom')}>Custom</button>
              <button type="button" className={`preset-chip ${preset === 'maharashtra_rice' ? 'active' : ''}`} onClick={() => handleSelectYieldPreset('maharashtra_rice')}>Rice (Maharashtra)</button>
              <button type="button" className={`preset-chip ${preset === 'punjab_wheat' ? 'active' : ''}`} onClick={() => handleSelectYieldPreset('punjab_wheat')}>Wheat (Punjab)</button>
              <button type="button" className={`preset-chip ${preset === 'up_sugarcane' ? 'active' : ''}`} onClick={() => handleSelectYieldPreset('up_sugarcane')}>Sugarcane (UP)</button>
              <button type="button" className={`preset-chip ${preset === 'gujarat_cotton' ? 'active' : ''}`} onClick={() => handleSelectYieldPreset('gujarat_cotton')}>Cotton (Gujarat)</button>
            </>
          )}
        </div>

        {/* Main Console Layout */}
        <div className="console-layout">
          {/* Left: Dynamic Form Panel */}
          <form className="console-panel" onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--agri-line)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="mono-accent">
                {mode === 'crop' ? 'SOIL & CLIMATE TELEMETRY' : (mode === 'fertilizer' ? 'DISTRICT & SOIL DOSAGE PARAMETERS' : 'REGIONAL CROP & ACREAGE TELEMETRY')}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="mono-meta" style={{ color: 'var(--agri-accent)' }}>
                  {mode === 'crop' ? 'RANDOM FOREST · 99.5% ACCURACY' : (mode === 'fertilizer' ? 'DECISION TREE · 95% TOP-1 / 98% TOP-3' : 'XGBOOST · R² 0.98')}
                </span>
                <span className="mono-meta">
                  {mode === 'crop' ? '7 VECTORS REQUIRED' : (mode === 'fertilizer' ? '9 VECTORS REQUIRED' : '5 VECTORS REQUIRED')}
                </span>
              </div>
            </div>

            {/* MODE 1: CROP FORM */}
            {mode === 'crop' && (
              <div className="console-field-grid">
                <div className={`console-field ${highlightedFields.has('nitrogen') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="nitrogen">
                    <span>NITROGEN (N)</span>
                    <span style={{ color: 'var(--agri-accent)' }}>KG/HA</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id="nitrogen"
                      name="nitrogen"
                      placeholder="Enter Nitrogen (0–140 kg/ha)"
                      step="any"
                      required
                      value={cropFormData.nitrogen}
                      onChange={handleCropChange}
                    />
                  </div>
                </div>

                <div className={`console-field ${highlightedFields.has('phosphorus') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="phosphorus">
                    <span>PHOSPHORUS (P)</span>
                    <span style={{ color: 'var(--agri-accent)' }}>KG/HA</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id="phosphorus"
                      name="phosphorus"
                      placeholder="Enter Phosphorus (5–145 kg/ha)"
                      step="any"
                      required
                      value={cropFormData.phosphorus}
                      onChange={handleCropChange}
                    />
                  </div>
                </div>

                <div className={`console-field ${highlightedFields.has('potassium') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="potassium">
                    <span>POTASSIUM (K)</span>
                    <span style={{ color: 'var(--agri-accent)' }}>KG/HA</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id="potassium"
                      name="potassium"
                      placeholder="Enter Potassium (5–205 kg/ha)"
                      step="any"
                      required
                      value={cropFormData.potassium}
                      onChange={handleCropChange}
                    />
                  </div>
                </div>

                <div className={`console-field ${highlightedFields.has('ph') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="ph">
                    <span>SOIL pH</span>
                    <span style={{ color: 'var(--agri-accent)' }}>0 – 14</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id="ph"
                      name="ph"
                      placeholder="Enter Soil pH (3.5–10)"
                      step="0.1"
                      min="0"
                      max="14"
                      required
                      value={cropFormData.ph}
                      onChange={handleCropChange}
                    />
                  </div>
                </div>

                <div className={`console-field ${highlightedFields.has('temperature') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="temperature">
                    <span>TEMPERATURE</span>
                    <span style={{ color: 'var(--agri-accent)' }}>&deg;C</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id="temperature"
                      name="temperature"
                      placeholder="Enter Temperature (9–44 °C)"
                      step="any"
                      required
                      value={cropFormData.temperature}
                      onChange={handleCropChange}
                    />
                  </div>
                </div>

                <div className={`console-field ${highlightedFields.has('humidity') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="humidity">
                    <span>HUMIDITY</span>
                    <span style={{ color: 'var(--agri-accent)' }}>%</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id="humidity"
                      name="humidity"
                      placeholder="Enter Humidity (14–100 %)"
                      step="any"
                      required
                      value={cropFormData.humidity}
                      onChange={handleCropChange}
                    />
                  </div>
                </div>

                <div className={`console-field console-field-full ${highlightedFields.has('rainfall') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="rainfall">
                    <span>SEASONAL RAINFALL</span>
                    <span style={{ color: 'var(--agri-accent)' }}>MM</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      id="rainfall"
                      name="rainfall"
                      placeholder="Enter Seasonal Rainfall (20–300 mm)"
                      step="any"
                      required
                      value={cropFormData.rainfall}
                      onChange={handleCropChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: FERTILIZER FORM */}
            {mode === 'fertilizer' && (
              <div className="console-field-grid">
                <div className={`console-field ${highlightedFields.has('district_name') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="fert_district">
                    <span>DISTRICT</span>
                    <span style={{ color: 'var(--agri-accent)' }}>MAHARASHTRA</span>
                  </label>
                  <div className="input-wrapper">
                    <select
                      id="fert_district"
                      name="district_name"
                      value={fertilizerFormData.district_name}
                      onChange={handleFertilizerChange}
                      required
                    >
                      <option value="" disabled>Select district...</option>
                      {optionsData.fertilizer.districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`console-field ${highlightedFields.has('soil_color') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="fert_soil">
                    <span>SOIL COLOR</span>
                    <span style={{ color: 'var(--agri-accent)' }}>TYPE</span>
                  </label>
                  <div className="input-wrapper">
                    <select
                      id="fert_soil"
                      name="soil_color"
                      value={fertilizerFormData.soil_color}
                      onChange={handleFertilizerChange}
                      required
                    >
                      <option value="" disabled>Select soil color...</option>
                      {optionsData.fertilizer.soilColors.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`console-field console-field-full ${highlightedFields.has('crop') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="fert_crop">
                    <span>TARGET CROP</span>
                    <span style={{ color: 'var(--agri-accent)' }}>FIELD CROP</span>
                  </label>
                  <div className="input-wrapper">
                    <select
                      id="fert_crop"
                      name="crop"
                      value={fertilizerFormData.crop}
                      onChange={handleFertilizerChange}
                      required
                    >
                      <option value="" disabled>Select target crop...</option>
                      {optionsData.fertilizer.crops.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`console-field ${highlightedFields.has('nitrogen') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="fert_n">
                    <span>NITROGEN (N)</span>
                    <span style={{ color: 'var(--agri-accent)' }}>KG/HA</span>
                  </label>
                  <input
                    type="number"
                    id="fert_n"
                    name="nitrogen"
                    placeholder="Enter Nitrogen (20–150 kg/ha)"
                    step="any"
                    required
                    value={fertilizerFormData.nitrogen}
                    onChange={handleFertilizerChange}
                  />
                </div>

                <div className={`console-field ${highlightedFields.has('phosphorus') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="fert_p">
                    <span>PHOSPHORUS (P)</span>
                    <span style={{ color: 'var(--agri-accent)' }}>KG/HA</span>
                  </label>
                  <input
                    type="number"
                    id="fert_p"
                    name="phosphorus"
                    placeholder="Enter Phosphorus (10–90 kg/ha)"
                    step="any"
                    required
                    value={fertilizerFormData.phosphorus}
                    onChange={handleFertilizerChange}
                  />
                </div>

                <div className={`console-field ${highlightedFields.has('potassium') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="fert_k">
                    <span>POTASSIUM (K)</span>
                    <span style={{ color: 'var(--agri-accent)' }}>KG/HA</span>
                  </label>
                  <input
                    type="number"
                    id="fert_k"
                    name="potassium"
                    placeholder="Enter Potassium (5–150 kg/ha)"
                    step="any"
                    required
                    value={fertilizerFormData.potassium}
                    onChange={handleFertilizerChange}
                  />
                </div>

                <div className={`console-field ${highlightedFields.has('ph') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="fert_ph">
                    <span>SOIL pH</span>
                    <span style={{ color: 'var(--agri-accent)' }}>0 – 14</span>
                  </label>
                  <input
                    type="number"
                    id="fert_ph"
                    name="ph"
                    placeholder="Enter Soil pH (5.5–8.5)"
                    step="0.1"
                    min="0"
                    max="14"
                    required
                    value={fertilizerFormData.ph}
                    onChange={handleFertilizerChange}
                  />
                </div>

                <div className={`console-field ${highlightedFields.has('temperature') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="fert_temp">
                    <span>TEMPERATURE</span>
                    <span style={{ color: 'var(--agri-accent)' }}>&deg;C</span>
                  </label>
                  <input
                    type="number"
                    id="fert_temp"
                    name="temperature"
                    placeholder="Enter Temperature (10–40 °C)"
                    step="any"
                    required
                    value={fertilizerFormData.temperature}
                    onChange={handleFertilizerChange}
                  />
                </div>

                <div className={`console-field ${highlightedFields.has('rainfall') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="fert_rain">
                    <span>RAINFALL</span>
                    <span style={{ color: 'var(--agri-accent)' }}>MM</span>
                  </label>
                  <input
                    type="number"
                    id="fert_rain"
                    name="rainfall"
                    placeholder="Enter Seasonal Rainfall (300–1700 mm)"
                    step="any"
                    required
                    value={fertilizerFormData.rainfall}
                    onChange={handleFertilizerChange}
                  />
                </div>
              </div>
            )}

            {/* MODE 3: YIELD PREDICTION FORM */}
            {mode === 'yield' && (
              <div className="console-field-grid">
                <div className={`console-field ${highlightedFields.has('state_name') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="yield_state">
                    <span>STATE / REGION</span>
                    <span style={{ color: 'var(--agri-accent)' }}>INDIA</span>
                  </label>
                  <div className="input-wrapper">
                    <select
                      id="yield_state"
                      name="state_name"
                      value={yieldFormData.state_name}
                      onChange={handleYieldChange}
                      required
                    >
                      <option value="" disabled>Select state / region...</option>
                      {optionsData.yield.states.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`console-field ${highlightedFields.has('season') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="yield_season">
                    <span>GROWING SEASON</span>
                    <span style={{ color: 'var(--agri-accent)' }}>CYCLE</span>
                  </label>
                  <div className="input-wrapper">
                    <select
                      id="yield_season"
                      name="season"
                      value={yieldFormData.season}
                      onChange={handleYieldChange}
                      required
                    >
                      <option value="" disabled>Select growing season...</option>
                      {optionsData.yield.seasons.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`console-field console-field-full ${highlightedFields.has('crop') ? 'field-autofilled' : ''}`}>
                  <label>
                    <span>CROP SPECIES</span>
                    <span style={{ color: 'var(--agri-accent)' }}>124 CROPS</span>
                  </label>
                  <SearchableCombobox
                    options={optionsData.yield.crops}
                    value={yieldFormData.crop}
                    onChange={(selectedCrop) => {
                      setYieldFormData((prev) => ({ ...prev, crop: selectedCrop }));
                      clearHighlight('crop');
                      setPreset('custom');
                    }}
                    placeholder="Search from 124 agricultural crop species..."
                  />
                </div>

                <div className={`console-field ${highlightedFields.has('crop_year') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="yield_year">
                    <span>CROP YEAR</span>
                    <span style={{ color: 'var(--agri-accent)' }}>YEAR</span>
                  </label>
                  <input
                    type="number"
                    id="yield_year"
                    name="crop_year"
                    placeholder="Enter Crop Year (e.g. 2024)"
                    min="1990"
                    max="2035"
                    required
                    value={yieldFormData.crop_year}
                    onChange={handleYieldChange}
                  />
                </div>

                <div className={`console-field ${highlightedFields.has('area') ? 'field-autofilled' : ''}`}>
                  <label htmlFor="yield_area">
                    <span>FARM AREA</span>
                    <span style={{ color: 'var(--agri-accent)' }}>HECTARES</span>
                  </label>
                  <input
                    type="number"
                    id="yield_area"
                    name="area"
                    placeholder="Enter Farm Area (e.g. 1–50 hectares)"
                    step="any"
                    min="0.01"
                    required
                    value={yieldFormData.area}
                    onChange={handleYieldChange}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn-primary-technical"
                style={{ width: '100%', padding: '16px 24px' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                    COMPUTING ADVISORY...
                  </span>
                ) : (
                  <span>
                    <i className="fa-solid fa-calculator" style={{ marginRight: '8px' }}></i>
                    RUN {mode === 'crop' ? 'CROP SELECTION' : (mode === 'fertilizer' ? 'FERTILIZER DOSAGE' : 'CROP YIELD PREDICTION')}
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Right: AI Document Auto-Fill & Advisory Results Card */}
          <div className="recommend-right-column">
            <DocumentUpload
              modelType={mode}
              showToast={showToast}
              onExtracted={handleExtracted}
            />

            <ResultCard result={result} isLoading={isLoading} processingStage={processingStage} mode={mode} />
          </div>
        </div>

        {/* Cross-Navigation to other models */}
        <div className="model-cross-nav" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          {mode !== 'fertilizer' && (
            <Link to="/recommend/fertilizer" className="btn-secondary-technical">
              <i className="fa-solid fa-flask-vial" style={{ marginRight: '8px' }}></i>
              Try Fertilizer Advisory
            </Link>
          )}
          {mode !== 'yield' && (
            <Link to="/recommend/yield" className="btn-secondary-technical">
              <i className="fa-solid fa-chart-line" style={{ marginRight: '8px' }}></i>
              Try Yield Prediction
            </Link>
          )}
          {mode !== 'crop' && (
            <Link to="/recommend" className="btn-secondary-technical">
              <i className="fa-solid fa-wheat-awn" style={{ marginRight: '8px' }}></i>
              Try Crop Selection
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
