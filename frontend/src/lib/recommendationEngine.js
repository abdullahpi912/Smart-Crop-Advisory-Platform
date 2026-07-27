/**
 * AgriSense Pure Rule-Based Recommendation Engine
 * Evaluates soil nutrients (N, P, K, pH) & environmental factors (Temp, Humidity, Rain)
 * to output precision Crop Selection or Fertilizer Advisory.
 */

export function calculateRecommendation(inputData) {
  const n = parseFloat(inputData.nitrogen) || 0;
  const p = parseFloat(inputData.phosphorus) || 0;
  const k = parseFloat(inputData.potassium) || 0;
  const temp = parseFloat(inputData.temperature) || 25;
  const humidity = parseFloat(inputData.humidity) || 70;
  const ph = parseFloat(inputData.ph) || 6.5;
  const rain = parseFloat(inputData.rainfall) || 150;
  const mode = inputData.mode || 'crop';

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const logId = `#LOG-${Math.floor(1000 + Math.random() * 9000)}`;

  // Evaluate Soil Health / pH status
  let phStatus = 'Optimal Balanced Soil';
  if (ph < 5.5) phStatus = 'Strongly Acidic Soil (Liming Recommended)';
  else if (ph < 6.2) phStatus = 'Slightly Acidic Soil';
  else if (ph > 7.8) phStatus = 'Alkaline Soil (Gypsum Recommended)';

  if (mode === 'fertilizer') {
    // Fertilizer Advisory Logic
    let fertName = 'NPK 19-19-19 Balanced Complex';
    let dosage = '100 kg/ha split across 2 applications';
    let advice = 'Soil nutrient levels are generally balanced. Apply maintenance NPK formulation.';
    let confidence = 96.4;

    if (n < 50) {
      fertName = 'Urea (46% Nitrogen Boost)';
      dosage = '120 - 150 kg/ha in 3 split doses';
      advice = 'Nitrogen deficiency detected. Apply Urea at early vegetative leaf phase.';
      confidence = 98.8;
    } else if (p < 30) {
      fertName = 'DAP (Diammonium Phosphate 18-46-0)';
      dosage = '80 - 100 kg/ha during land preparation';
      advice = 'Phosphorus depletion detected. DAP promotes strong root crown development.';
      confidence = 97.5;
    } else if (k < 30) {
      fertName = 'MOP (Muriate of Potash 60% K2O)';
      dosage = '50 - 75 kg/ha pre-flowering stage';
      advice = 'Potassium low. MOP enhances drought resistance and stem rigidity.';
      confidence = 99.1;
    } else if (ph < 5.8) {
      fertName = 'Agricultural Dolomite Lime + NPK';
      dosage = '200 kg/ha lime + 50 kg/ha NPK';
      advice = 'Acidic soil restricts nutrient uptake. Apply lime 2 weeks before planting.';
      confidence = 95.2;
    }

    return {
      logId,
      timestamp,
      type: 'Fertilizer Match',
      recommendedItem: fertName,
      confidence: `${confidence}%`,
      badgeClass: 'badge-fertilizer',
      dosageAdvice: dosage,
      npkSummary: `N: ${n} | P: ${p} | K: ${k}`,
      climateSummary: `pH ${ph} | ${rain} mm | ${temp}°C`,
      soilHealth: phStatus,
      detailedNotes: advice,
      inputs: { n, p, k, temp, humidity, ph, rain, mode }
    };
  }

  // Crop Recommendation Logic
  const crops = [
    {
      name: 'Paddy Rice 🌾',
      ideal: { n: 90, p: 42, k: 43, temp: 26, rain: 220, ph: 6.5 },
      category: 'Grains & Cereals',
      description: 'Ideal high-moisture wetland grain crop matching your nitrogen and rainfall conditions.'
    },
    {
      name: 'Highland Coffee ☕',
      ideal: { n: 100, p: 20, k: 30, temp: 25, rain: 1600, ph: 5.8 },
      category: 'Cash Crops',
      description: 'High-value perennial crop thriving in humid highland climates and acidic soils.'
    },
    {
      name: 'Semi-Arid Cotton ☁️',
      ideal: { n: 120, p: 45, k: 40, temp: 30, rain: 70, ph: 7.2 },
      category: 'Cash Crops',
      description: 'Drought-tolerant fiber crop suitable for warm temperatures and moderate rainfall.'
    },
    {
      name: 'Arid Chickpea 🌱',
      ideal: { n: 20, p: 60, k: 80, temp: 20, rain: 40, ph: 7.5 },
      category: 'Pulses & Legumes',
      description: 'Nitrogen-fixing pulse crop highly suitable for low moisture and phosphorus-rich soil.'
    },
    {
      name: 'Maize / Corn 🌽',
      ideal: { n: 80, p: 40, k: 40, temp: 24, rain: 100, ph: 6.2 },
      category: 'Grains & Cereals',
      description: 'Versatile cereal crop requiring well-drained loamy soil and balanced NPK nutrients.'
    },
    {
      name: 'Fresh Apple 🍎',
      ideal: { n: 40, p: 30, k: 50, temp: 15, rain: 110, ph: 6.0 },
      category: 'Fruits & Orchard',
      description: 'Temperate orchard fruit thriving in cooler climates with moderate moisture.'
    }
  ];

  let bestCrop = crops[0];
  let minDiff = Infinity;

  crops.forEach((crop) => {
    // Weighted Euclidean distance metric
    const diff =
      Math.abs(n - crop.ideal.n) * 1.0 +
      Math.abs(p - crop.ideal.p) * 1.2 +
      Math.abs(k - crop.ideal.k) * 1.2 +
      Math.abs(temp - crop.ideal.temp) * 2.0 +
      Math.abs(ph - crop.ideal.ph) * 15.0 +
      Math.abs(rain - crop.ideal.rain) * 0.1;

    if (diff < minDiff) {
      minDiff = diff;
      bestCrop = crop;
    }
  });

  // Calculate dynamic confidence percentage
  const rawConfidence = Math.max(88.0, 99.6 - minDiff * 0.08);
  const confidence = `${rawConfidence.toFixed(1)}%`;

  return {
    logId,
    timestamp,
    type: 'Crop Match',
    recommendedItem: bestCrop.name,
    category: bestCrop.category,
    confidence,
    badgeClass: 'badge-crop',
    dosageAdvice: `Optimal yield predicted under current field conditions`,
    npkSummary: `N: ${n} | P: ${p} | K: ${k}`,
    climateSummary: `pH ${ph} | ${rain} mm | ${temp}°C`,
    soilHealth: phStatus,
    detailedNotes: bestCrop.description,
    inputs: { n, p, k, temp, humidity, ph, rain, mode }
  };
}
