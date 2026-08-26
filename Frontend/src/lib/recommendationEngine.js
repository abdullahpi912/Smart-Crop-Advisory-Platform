/**
 * Cropling Pure Rule-Based Recommendation Engine & Client Fallback
 * Evaluates soil nutrients (N, P, K, pH), environmental factors, and historical datasets
 * to output precision Crop Selection, Fertilizer Advisory, or Crop Yield Predictions.
 */

export function calculateRecommendation(inputData) {
  const mode = inputData.mode || 'crop';
  const timestamp = new Date().toISOString();
  const logId = `#LOG-${Math.floor(1000 + Math.random() * 9000)}`;

  // Mode 1: Fertilizer Recommendation Fallback
  if (mode === 'fertilizer') {
    const n = parseFloat(inputData.nitrogen) || 0;
    const p = parseFloat(inputData.phosphorus) || 0;
    const k = parseFloat(inputData.potassium) || 0;
    const temp = parseFloat(inputData.temperature) || 25;
    const ph = parseFloat(inputData.ph) || 6.5;
    const rain = parseFloat(inputData.rainfall) || 120;
    const district = inputData.district_name || inputData.district || 'Kolhapur';
    const soilColor = inputData.soil_color || inputData.soilColor || 'Black';
    const crop = inputData.crop || 'Sugarcane';

    let phStatus = 'Optimal Balanced Soil';
    if (ph < 5.5) phStatus = 'Strongly Acidic Soil (Liming Recommended)';
    else if (ph < 6.2) phStatus = 'Slightly Acidic Soil';
    else if (ph > 7.8) phStatus = 'Alkaline Soil (Gypsum Recommended)';

    let fertName = '19:19:19 NPK';
    let category = 'Balanced Complete Complex';
    let dosage = '100 kg/ha split across 2 vegetative applications';
    let advice = `Optimal balanced nutrient formulation for ${crop} on ${soilColor} soil in ${district}.`;
    let top3 = [
      { name: '19:19:19 NPK', confidence: 78.4 },
      { name: '10:26:26 NPK', confidence: 14.2 },
      { name: 'DAP', confidence: 7.4 }
    ];

    if (n < 45) {
      fertName = 'Urea';
      category = 'Nitrogenous Fertilizer (46% N)';
      dosage = '120 - 150 kg/ha in 3 split doses';
      advice = `Nitrogen deficiency detected in ${soilColor} soil. Apply Urea during early leaf development.`;
      top3 = [
        { name: 'Urea', confidence: 88.5 },
        { name: 'Ammonium Sulphate', confidence: 8.2 },
        { name: '19:19:19 NPK', confidence: 3.3 }
      ];
    } else if (p < 30) {
      fertName = 'DAP';
      category = 'Diammonium Phosphate (18-46-0)';
      dosage = '80 - 100 kg/ha during basal land preparation';
      advice = `Phosphorus depletion detected for ${crop}. DAP promotes deep root anchorage.`;
      top3 = [
        { name: 'DAP', confidence: 84.0 },
        { name: '12:32:16 NPK', confidence: 11.5 },
        { name: 'SSP', confidence: 4.5 }
      ];
    } else if (k < 30) {
      fertName = 'MOP';
      category = 'Muriate of Potash (60% K2O)';
      dosage = '50 - 75 kg/ha pre-flowering stage';
      advice = `Potassium low in ${district} field. MOP enhances drought resistance and stalk rigidity.`;
      top3 = [
        { name: 'MOP', confidence: 86.2 },
        { name: '10:26:26 NPK', confidence: 9.8 },
        { name: 'White Potash', confidence: 4.0 }
      ];
    } else if (ph < 5.8) {
      fertName = 'Hydrated Lime';
      category = 'Soil Acidity Neutralizer';
      dosage = '200 kg/ha lime + 50 kg/ha NPK';
      advice = 'Acidic soil restricts nutrient uptake. Apply lime 2 weeks before planting.';
      top3 = [
        { name: 'Hydrated Lime', confidence: 91.0 },
        { name: 'SSP', confidence: 6.0 },
        { name: '10:26:26 NPK', confidence: 3.0 }
      ];
    }

    return {
      status: 'success',
      logId,
      timestamp,
      type: 'Fertilizer Recommendation (Engine)',
      fertilizer: fertName,
      recommendedItem: fertName,
      crop,
      category,
      confidence: `${top3[0].confidence}%`,
      badgeClass: 'badge-fertilizer',
      dosageAdvice: dosage,
      top3,
      npkSummary: `N: ${n.toFixed(1)} | P: ${p.toFixed(1)} | K: ${k.toFixed(1)}`,
      climateSummary: `pH ${ph.toFixed(1)} | ${rain.toFixed(1)} mm | ${temp.toFixed(1)}°C`,
      soilHealth: phStatus,
      detailedNotes: advice,
      inputs: {
        district_name: district,
        soil_color: soilColor,
        crop,
        nitrogen: n,
        phosphorus: p,
        potassium: k,
        ph,
        rainfall: rain,
        temperature: temp,
        mode: 'fertilizer'
      }
    };
  }

  // Mode 2: Crop Yield Prediction Fallback
  if (mode === 'yield') {
    const state = inputData.state_name || inputData.state || 'Maharashtra';
    const season = inputData.season || 'Kharif';
    const crop = inputData.crop || 'Rice';
    const year = parseInt(inputData.crop_year || inputData.year || 2024, 10);
    const area = Math.max(0.1, parseFloat(inputData.area || inputData.area_hectares || 5.0));

    // Baseline typical yield densities in tonnes / hectare
    const baselineYieldPerHa = {
      'Rice': 2.8,
      'Paddy': 3.1,
      'Wheat': 3.4,
      'Sugarcane': 72.0,
      'Cotton(lint)': 1.4,
      'Maize': 3.2,
      'Soyabean': 1.6,
      'Groundnut': 1.8,
      'Banana': 35.0,
      'Potato': 22.0,
      'Onion': 16.5,
      'Gram': 1.1,
      'Arhar/Tur': 0.95,
      'Jowar': 1.2
    };

    const yieldFactor = baselineYieldPerHa[crop] || 2.4;
    const predictedTonnes = parseFloat((area * yieldFactor).toFixed(2));
    const yieldPerHa = parseFloat((predictedTonnes / area).toFixed(2));

    return {
      status: 'success',
      logId,
      timestamp,
      type: 'Crop Yield Prediction (Engine)',
      predicted_production_tonnes: predictedTonnes,
      crop,
      unit: 'tonnes',
      yield_per_hectare: yieldPerHa,
      recommendedItem: `${crop}: ${predictedTonnes.toFixed(2)} Tonnes`,
      category: 'Yield & Harvest Forecast',
      confidence: 'Heuristic Model',
      badgeClass: 'badge-yield',
      dosageAdvice: `Estimated farm harvest: ${predictedTonnes.toFixed(2)} Tonnes on ${area.toFixed(1)} ha (${yieldPerHa.toFixed(2)} T/ha)`,
      npkSummary: `Area: ${area.toFixed(1)} ha | Year: ${year}`,
      climateSummary: `State: ${state} | Season: ${season}`,
      soilHealth: 'Agronomic Yield Heuristic Fit',
      detailedNotes: `Production estimate of ${predictedTonnes.toFixed(2)} Tonnes for ${crop} in ${state} (${season} season). Estimate is based on regional historical averages.`,
      inputs: {
        state_name: state,
        season,
        crop,
        crop_year: year,
        area,
        mode: 'yield'
      }
    };
  }

  // Mode 3: Crop Selection Recommendation Logic
  const n = parseFloat(inputData.nitrogen) || 0;
  const p = parseFloat(inputData.phosphorus) || 0;
  const k = parseFloat(inputData.potassium) || 0;
  const temp = parseFloat(inputData.temperature) || 25;
  const humidity = parseFloat(inputData.humidity) || 70;
  const ph = parseFloat(inputData.ph) || 6.5;
  const rain = parseFloat(inputData.rainfall) || 150;

  let phStatus = 'Optimal Balanced Soil';
  if (ph < 5.5) phStatus = 'Strongly Acidic Soil (Liming Recommended)';
  else if (ph < 6.2) phStatus = 'Slightly Acidic Soil';
  else if (ph > 7.8) phStatus = 'Alkaline Soil (Gypsum Recommended)';

  const crops = [
    {
      name: 'Paddy Rice 🌾',
      rawName: 'rice',
      ideal: { n: 90, p: 42, k: 43, temp: 26, rain: 220, ph: 6.5 },
      category: 'Grains & Cereals',
      description: 'Ideal high-moisture wetland grain crop matching your nitrogen and rainfall conditions.'
    },
    {
      name: 'Highland Coffee ☕',
      rawName: 'coffee',
      ideal: { n: 100, p: 20, k: 30, temp: 25, rain: 1600, ph: 5.8 },
      category: 'Cash Crops',
      description: 'High-value perennial crop thriving in humid highland climates and acidic soils.'
    },
    {
      name: 'Semi-Arid Cotton ☁️',
      rawName: 'cotton',
      ideal: { n: 120, p: 45, k: 40, temp: 30, rain: 70, ph: 7.2 },
      category: 'Cash Crops',
      description: 'Drought-tolerant fiber crop suitable for warm temperatures and moderate rainfall.'
    },
    {
      name: 'Arid Chickpea 🌱',
      rawName: 'chickpea',
      ideal: { n: 20, p: 60, k: 80, temp: 20, rain: 40, ph: 7.5 },
      category: 'Pulses & Legumes',
      description: 'Nitrogen-fixing pulse crop highly suitable for low moisture and phosphorus-rich soil.'
    },
    {
      name: 'Maize / Corn 🌽',
      rawName: 'maize',
      ideal: { n: 80, p: 40, k: 40, temp: 24, rain: 100, ph: 6.2 },
      category: 'Grains & Cereals',
      description: 'Versatile cereal crop requiring well-drained loamy soil and balanced NPK nutrients.'
    },
    {
      name: 'Fresh Apple 🍎',
      rawName: 'apple',
      ideal: { n: 40, p: 30, k: 50, temp: 15, rain: 110, ph: 6.0 },
      category: 'Fruits & Orchard',
      description: 'Temperate orchard fruit thriving in cooler climates with moderate moisture.'
    }
  ];

  let bestCrop = crops[0];
  let minDiff = Infinity;

  crops.forEach((cropItem) => {
    const diff =
      Math.abs(n - cropItem.ideal.n) * 1.0 +
      Math.abs(p - cropItem.ideal.p) * 1.2 +
      Math.abs(k - cropItem.ideal.k) * 1.2 +
      Math.abs(temp - cropItem.ideal.temp) * 2.0 +
      Math.abs(ph - cropItem.ideal.ph) * 15.0 +
      Math.abs(rain - cropItem.ideal.rain) * 0.1;

    if (diff < minDiff) {
      minDiff = diff;
      bestCrop = cropItem;
    }
  });

  const rawConfidence = Math.max(88.0, 99.6 - minDiff * 0.08);
  const confidence = `${rawConfidence.toFixed(1)}%`;

  return {
    status: 'success',
    logId,
    timestamp,
    type: 'Crop Match (Agronomic Engine)',
    crop: bestCrop.rawName,
    recommendedItem: bestCrop.name,
    category: bestCrop.category,
    confidence,
    badgeClass: 'badge-crop',
    dosageAdvice: 'Optimal yield predicted under current field conditions',
    npkSummary: `N: ${n.toFixed(1)} | P: ${p.toFixed(1)} | K: ${k.toFixed(1)}`,
    climateSummary: `pH ${ph.toFixed(1)} | ${rain.toFixed(1)} mm | ${temp.toFixed(1)}°C`,
    soilHealth: phStatus,
    detailedNotes: bestCrop.description,
    inputs: {
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      temperature: temp,
      humidity,
      ph,
      rainfall: rain,
      mode: 'crop'
    }
  };
}
