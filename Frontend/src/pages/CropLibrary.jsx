import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import CropCard from '../components/CropCard';
import CropDetailsModal from '../components/CropDetailsModal';

export default function CropLibrary() {
  const [activeModel, setActiveModel] = useState('crop'); // 'crop' | 'fertilizer' | 'yield'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCropModal, setActiveCropModal] = useState(null);
  const gridTopRef = useRef(null);

  // ==========================================
  // MODEL 1: CROP SELECTION CATALOG (20 CROPS)
  // ==========================================
  const cropCatalogData = [
    {
      id: 'c1',
      modelType: 'crop',
      title: 'Paddy Rice',
      category: 'Grains & Cereals',
      categoryClass: 'cat-grains',
      categoryId: 'grains',
      icon: '🌾',
      tagline: 'Thrives in clayey moist soils with high water retention and warm temperatures.',
      about: 'Rice is one of the most widely eaten grains on Earth. It loves warm, sunny weather and fields with thick, wet soil that can hold standing water throughout the season.',
      npk: '80-40-40 kg/ha',
      temp: '20 – 27 °C',
      ph: '5.5 – 6.8',
      rainfall: '200 – 300 mm',
      details: {
        nitrogen: {
          value: '80 kg/ha',
          why: 'Nitrogen gives rice plants their bright green color and helps grow many healthy stems and full grain heads.'
        },
        phosphorus: {
          value: '40 kg/ha',
          why: 'Phosphorus helps young rice seedlings quickly build deep roots so they stay firm in the muddy soil.'
        },
        potassium: {
          value: '40 kg/ha',
          why: 'Potassium strengthens the plant stalks so they do not fall over in heavy wind and rain.'
        },
        temp: {
          why: 'Warm days between 20°C and 27°C help the seeds sprout quickly and help the grains ripen evenly.'
        },
        ph: {
          why: 'Slightly acidic to neutral soil (5.5 to 6.8) allows the roots to absorb plant food easily without lockup.'
        },
        rainfall: {
          why: 'Rice needs plenty of water. Flooding fields with a shallow layer of water also stops weeds from growing.'
        }
      },
      tips: [
        'Best grown in heavy clay or loamy soil that holds water well without fast draining.',
        'Drain water from the field 1 to 2 weeks before harvesting so grains dry nicely.'
      ]
    },
    {
      id: 'c2',
      modelType: 'crop',
      title: 'Highland Coffee',
      category: 'Cash Crops',
      categoryClass: 'cat-commercial',
      categoryId: 'commercial',
      icon: '☕',
      tagline: 'Perennial commercial crop preferring cool acidic highland soils and high rainfall.',
      about: 'Arabica coffee bushes grow on cool mountain hillsides with fresh breezes. They produce bright red berries (cherries) that contain the coffee beans.',
      npk: '100-20-30 kg/ha',
      temp: '23 – 28 °C',
      ph: '5.5 – 6.2',
      rainfall: '1500 – 2000 mm',
      details: {
        nitrogen: {
          value: '100 kg/ha',
          why: 'Coffee trees keep green leaves all year. Nitrogen maintains lush leaf cover to feed the growing berries.'
        },
        phosphorus: {
          value: '20 kg/ha',
          why: 'Phosphorus supports strong root anchoring on sloped ground and triggers sweet flower blossoms in spring.'
        },
        potassium: {
          value: '30 kg/ha',
          why: 'Potassium improves the size, weight, and rich flavor of the harvested coffee beans.'
        },
        temp: {
          why: 'Coffee loves mild tropical mountain weather. Frost or extreme heat will damage delicate white flowers.'
        },
        ph: {
          why: 'Coffee naturally thrives in slightly acidic forest soils rich in decomposed leaves and organic matter.'
        },
        rainfall: {
          why: 'Regular rain keeps the roots moist, while hill slopes let excess water drain so roots never rot.'
        }
      },
      tips: [
        'Plant taller shade trees around coffee to protect bushes from harsh midday sunlight.',
        'Prune old wooden branches after picking to encourage fresh new fruit-bearing stems.'
      ]
    },
    {
      id: 'c3',
      modelType: 'crop',
      title: 'Semi-Arid Cotton',
      category: 'Cash Crops',
      categoryClass: 'cat-commercial',
      categoryId: 'commercial',
      icon: '☁️',
      tagline: 'Drought-resistant fiber crop requiring warm temperatures and moderate soil nitrogen.',
      about: 'Cotton is grown for its soft, fluffy white fibers used to weave fabrics and clothes. It loves hot sunny days and handles dry periods very well.',
      npk: '120-45-40 kg/ha',
      temp: '28 – 34 °C',
      ph: '6.5 – 8.0',
      rainfall: '60 – 100 mm',
      details: {
        nitrogen: {
          value: '120 kg/ha',
          why: 'High nitrogen helps cotton grow into bushy plants with lots of side branches for cotton bolls.'
        },
        phosphorus: {
          value: '45 kg/ha',
          why: 'Encourages early flower bud formation that turns into healthy, high-yield cotton bolls.'
        },
        potassium: {
          value: '40 kg/ha',
          why: 'Potassium is vital for strong fiber quality and prevents leaves from browning or falling early.'
        },
        temp: {
          why: 'Cotton needs plenty of heat (28°C to 34°C). Warm sun helps cotton bolls burst open cleanly.'
        },
        ph: {
          why: 'Cotton handles neutral to slightly alkaline soil with ease as long as water can drain freely.'
        },
        rainfall: {
          why: 'Needs moderate water while growing, but needs dry sunny weather when bolls open so fibers stay white.'
        }
      },
      tips: [
        'Avoid over-watering near harvest time so the cotton fiber stays clean and bright white.',
        'Monitor fields regularly during flowering to keep caterpillars and bollworms away.'
      ]
    },
    {
      id: 'c4',
      modelType: 'crop',
      title: 'Arid Chickpea',
      category: 'Pulses & Legumes',
      categoryClass: 'cat-pulses',
      categoryId: 'pulses',
      icon: '🌱',
      tagline: 'Nitrogen-fixing pulse crop highly suitable for low moisture alkaline soils.',
      about: 'Chickpea (also called garbanzo bean) is a protein-rich pulse crop that naturally enriches the soil by taking nitrogen directly from the air.',
      npk: '20-60-80 kg/ha',
      temp: '18 – 24 °C',
      ph: '6.8 – 7.8',
      rainfall: '35 – 55 mm',
      details: {
        nitrogen: {
          value: '20 kg/ha',
          why: 'Only a small starter dose is needed because friendly root bacteria make natural nitrogen for the plant.'
        },
        phosphorus: {
          value: '60 kg/ha',
          why: 'Higher phosphorus fuels the root nodules where friendly nitrogen-fixing bacteria live and work.'
        },
        potassium: {
          value: '80 kg/ha',
          why: 'Helps the pods fill with plump, healthy seeds and protects the crop against cold winter winds.'
        },
        temp: {
          why: 'Chickpeas thrive in cool, sunny winter conditions. High heat during flowering causes flowers to drop.'
        },
        ph: {
          why: 'Prefers neutral to slightly alkaline soil. Strongly acidic soils can harm root bacteria.'
        },
        rainfall: {
          why: 'Extremely drought-hardy. Too much standing water causes root rot, so light rain is best.'
        }
      },
      tips: [
        'Ideal crop to plant after rice or wheat to naturally restore soil fertility for next season.',
        'Ensure the soil is loose and well-aerated so root nodules can breathe.'
      ]
    },
    {
      id: 'c5',
      modelType: 'crop',
      title: 'Golden Maize / Corn',
      category: 'Grains & Cereals',
      categoryClass: 'cat-grains',
      categoryId: 'grains',
      icon: '🌽',
      tagline: 'Fast-growing cereal crop demanding well-drained loamy soil and balanced nitrogen.',
      about: 'Maize is a fast-growing, heavy-yielding crop grown across the globe for food, flour, and animal feed. It grows tall with golden, sweet-tasting cobs.',
      npk: '80-40-40 kg/ha',
      temp: '22 – 28 °C',
      ph: '5.8 – 7.0',
      rainfall: '80 – 120 mm',
      details: {
        nitrogen: {
          value: '80 kg/ha',
          why: 'Corn grows tall quickly and is a hungry feeder. Nitrogen builds thick stalks and broad green leaves.'
        },
        phosphorus: {
          value: '40 kg/ha',
          why: 'Crucial in the first 4 weeks to establish strong anchor roots and set large cob sizes.'
        },
        potassium: {
          value: '40 kg/ha',
          why: 'Helps fill golden kernels all the way to the tip of the cob and makes stalks storm-resistant.'
        },
        temp: {
          why: 'Loves warm summer warmth (22°C to 28°C). Cold ground slows down seed germination.'
        },
        ph: {
          why: 'Grows best in fertile, well-drained loamy soil with near-neutral pH (5.8 to 7.0).'
        },
        rainfall: {
          why: 'Needs steady moisture, especially when the silk tassels appear and kernels begin forming.'
        }
      },
      tips: [
        'Plant in blocks of rows rather than one long line so the wind can pollinate all cobs easily.',
        'Apply nitrogen in two split doses (at planting and when knee-high) for biggest cobs.'
      ]
    },
    {
      id: 'c6',
      modelType: 'crop',
      title: 'Temperate Apple Orchard',
      category: 'Fruits & Orchard',
      categoryClass: 'cat-fruits',
      categoryId: 'fruits',
      icon: '🍎',
      tagline: 'High-elevation fruit trees requiring cool winter chilling and moderate soil organic matter.',
      about: 'Apple trees are long-living fruit trees grown in cool regions. They blossom with pink-white flowers in spring and produce crisp, juicy apples by autumn.',
      npk: '40-30-50 kg/ha',
      temp: '14 – 22 °C',
      ph: '5.8 – 6.5',
      rainfall: '100 – 140 mm',
      details: {
        nitrogen: {
          value: '40 kg/ha',
          why: 'Provides steady shoot growth without making the tree overly leafy at the cost of fruit size.'
        },
        phosphorus: {
          value: '30 kg/ha',
          why: 'Maintains healthy deep perennial root systems and stimulates strong flower buds for next season.'
        },
        potassium: {
          value: '50 kg/ha',
          why: 'Higher potassium gives apples their bright red color, sweet crunchy taste, and good shelf life.'
        },
        temp: {
          why: 'Needs cool winters to wake up properly in spring, followed by mild sunny summer days to ripen.'
        },
        ph: {
          why: 'Slightly acidic soil helps tree roots take in essential minerals like iron, zinc, and boron easily.'
        },
        rainfall: {
          why: 'Requires steady moisture while fruits swell, followed by dry weather during picking time.'
        }
      },
      tips: [
        'Prune inner branches during winter to let sunlight and fresh air reach inside the canopy.',
        'Thin out crowded baby fruits early in summer so the remaining apples grow large and sweet.'
      ]
    },
    {
      id: 'c7',
      modelType: 'crop',
      title: 'Tropical Banana',
      category: 'Fruits & Orchard',
      categoryClass: 'cat-fruits',
      categoryId: 'fruits',
      icon: '🍌',
      tagline: 'Rapidly growing heavy consumer of potassium, favoring warm humid tropical climates.',
      about: 'Bananas grow on giant herbaceous plants with massive green leaves. They produce heavy bunches of sweet fruit throughout the year in warm, frost-free regions.',
      npk: '100-75-50 kg/ha',
      temp: '25 – 30 °C',
      ph: '6.0 – 7.5',
      rainfall: '150 – 250 mm',
      details: {
        nitrogen: {
          value: '100 kg/ha',
          why: 'Helps unfurl big broad green leaves every week that capture sunlight for heavy banana bunches.'
        },
        phosphorus: {
          value: '75 kg/ha',
          why: 'Develops a dense underground corm and root system to support tall heavy plants.'
        },
        potassium: {
          value: '50 kg/ha',
          why: 'Bananas are huge potassium lovers; potassium makes each banana long, sweet, and firm.'
        },
        temp: {
          why: 'Thrives in warm tropical weather (25°C to 30°C). Freezing temperatures destroy banana stems.'
        },
        ph: {
          why: 'Grows best in rich organic soil with good drainage and neutral acidity.'
        },
        rainfall: {
          why: 'Needs constant moisture; mulch around base to keep soil cool and damp.'
        }
      },
      tips: [
        'Support heavy fruit bunches with wooden poles so plants do not topple over in strong winds.',
        'Remove unwanted side suckers so the mother plant gives all its energy to one main bunch.'
      ]
    },
    {
      id: 'c8',
      modelType: 'crop',
      title: 'Alphonso Mango',
      category: 'Fruits & Orchard',
      categoryClass: 'cat-fruits',
      categoryId: 'fruits',
      icon: '🥭',
      tagline: 'King of tropical fruits thriving in deep well-drained loams with a distinct dry spell.',
      about: 'Mango is a majestic evergreen tree that produces golden, honey-sweet fruits. It loves sunny dry periods during flowering for maximum fruit set.',
      npk: '20-20-30 kg/ha',
      temp: '27 – 35 °C',
      ph: '5.5 – 7.0',
      rainfall: '90 – 110 mm',
      details: {
        nitrogen: {
          value: '20 kg/ha',
          why: 'Keeps foliage healthy after harvest without causing excessive leaf growth during flowering.'
        },
        phosphorus: {
          value: '20 kg/ha',
          why: 'Supports new blossom panicles and healthy fruitlet attachment.'
        },
        potassium: {
          value: '30 kg/ha',
          why: 'Drives fruit sweetness, golden pulp color, and juicy aromatic flavor.'
        },
        temp: {
          why: 'Hot sunshine (27°C to 35°C) produces the sweetest mangoes.'
        },
        ph: {
          why: 'Prefers deep loamy soil that allows taproots to go down 3 to 6 meters.'
        },
        rainfall: {
          why: 'Needs dry sunny weather during winter flowering to stop fungal flower drop.'
        }
      },
      tips: [
        'Stop irrigation for 2 months before winter flowering to trigger heavy bloom set.',
        'Harvest fruits when shoulders widen and skin shows a subtle golden blush.'
      ]
    },
    {
      id: 'c9',
      modelType: 'crop',
      title: 'Sweet Watermelon',
      category: 'Fruits & Orchard',
      categoryClass: 'cat-fruits',
      categoryId: 'fruits',
      icon: '🍉',
      tagline: 'Sun-loving vine requiring warm sandy loam soils and steady early-season hydration.',
      about: 'Watermelon is a fast-creeping summer vine producing giant juicy fruits with crisp red flesh. It loves hot sunny days and sandy riverbed soils.',
      npk: '100-10-50 kg/ha',
      temp: '24 – 27 °C',
      ph: '6.0 – 6.8',
      rainfall: '40 – 60 mm',
      details: {
        nitrogen: {
          value: '100 kg/ha',
          why: 'Fuels rapid vine spreading and wide leaf canopy in the first 45 days.'
        },
        phosphorus: {
          value: '10 kg/ha',
          why: 'Encourages early female flower blossoms for high fruit counts.'
        },
        potassium: {
          value: '50 kg/ha',
          why: 'Key nutrient for sweetness (Brix sugar level) and crisp red flesh texture.'
        },
        temp: {
          why: 'Needs warm sunny weather; seeds will not sprout in cold or wet ground.'
        },
        ph: {
          why: 'Thrives in sandy loams with slightly acidic pH (6.0 to 6.8).'
        },
        rainfall: {
          why: 'Water regularly during fruit sizing, then reduce water 1 week before harvest to sweeten fruits.'
        }
      },
      tips: [
        'Place straw under growing melons to keep them off damp dirt and prevent bottom rot.',
        'A hollow thumping sound when tapped indicates perfect ripeness.'
      ]
    },
    {
      id: 'c10',
      modelType: 'crop',
      title: 'Green Mungbean',
      category: 'Pulses & Legumes',
      categoryClass: 'cat-pulses',
      categoryId: 'pulses',
      icon: '🫘',
      tagline: 'Short-duration summer/monsoon legume improving nitrogen balance in crop rotations.',
      about: 'Mungbean is a quick 60-day pulse crop packed with plant protein. It matures rapidly between major crop seasons and enriches the soil naturally.',
      npk: '20-40-20 kg/ha',
      temp: '27 – 30 °C',
      ph: '6.2 – 7.2',
      rainfall: '40 – 60 mm',
      details: {
        nitrogen: {
          value: '20 kg/ha',
          why: 'Small starter amount; root nodules fix all needed nitrogen naturally.'
        },
        phosphorus: {
          value: '40 kg/ha',
          why: 'Helps roots develop active nitrogen-fixing nodules rapidly in early weeks.'
        },
        potassium: {
          value: '20 kg/ha',
          why: 'Promotes even pod filling and prevents early pod shattering.'
        },
        temp: {
          why: 'Loves warm tropical weather (27°C to 30°C) with bright daylight.'
        },
        ph: {
          why: 'Prefers well-drained loamy soil with near-neutral pH.'
        },
        rainfall: {
          why: 'Drought-tolerant; requires only light watering during flowering.'
        }
      },
      tips: [
        'Excellent catch crop between wheat harvest and rice planting.',
        'Pick pods in 2-3 hand pickings as they turn dark black and dry.'
      ]
    }
  ];

  // ==========================================
  // MODEL 2: FERTILIZER ADVISORY CATALOG (8 FORMULAS)
  // ==========================================
  const fertilizerCatalogData = [
    {
      id: 'f1',
      modelType: 'fertilizer',
      title: 'Urea (46% N)',
      category: 'Nitrogenous Fertilizer',
      categoryClass: 'cat-fertilizers',
      categoryId: 'nitrogen',
      icon: '🧪',
      tagline: 'World’s most concentrated nitrogen fertilizer for rapid shoot and leaf growth.',
      about: 'Urea is the most common solid nitrogen fertilizer in farming. It comes in small white pearls that dissolve rapidly in moist soil to give pale or stunted crops an immediate boost of rich green leaf and stem growth.',
      npk: '46-0-0 %',
      temp: 'All Climates',
      ph: 'Neutral Soils',
      rainfall: 'Water Soluble',
      details: {
        nitrogen: {
          value: '46% Pure N',
          why: 'Gives crops an immediate boost of green chlorophyll and vigorous leaf expansion.'
        },
        phosphorus: {
          value: '0%',
          why: 'Pure nitrogen formulation; pair with DAP or superphosphate if roots also need phosphorus.'
        },
        potassium: {
          value: '0%',
          why: 'Pure nitrogen source; combine with Potash (MOP) during flowering for balanced crop nutrition.'
        },
        soil: {
          value: 'All Soil Types',
          why: 'Safe on black, red, and loamy soils when incorporated into moist ground.'
        },
        crops: {
          value: 'Rice, Wheat, Maize, Cotton, Sugarcane',
          why: 'Heavy nitrogen feeders that require high vegetative energy throughout early tillering.'
        },
        stage: {
          value: 'Top-Dressing (Split Doses)',
          why: 'Apply in 2 to 3 split doses when plants are actively growing so nitrogen is not lost to evaporation.'
        }
      },
      tips: [
        'Never leave urea granules sitting on dry soil under a hot sun; always mix into topsoil or irrigate right after.',
        'Apply in split doses (e.g. at 20 days and 45 days) rather than dumping all at once.'
      ]
    },
    {
      id: 'f2',
      modelType: 'fertilizer',
      title: 'DAP (18-46-0)',
      category: 'Phosphorus Starters',
      categoryClass: 'cat-fertilizers',
      categoryId: 'phosphorus',
      icon: '⚗️',
      tagline: 'High-phosphorus starter fertilizer for powerful root establishment and seedling vigor.',
      about: 'Di-Ammonium Phosphate (DAP) is the favorite starter fertilizer for planting seeds and young crops. It delivers starter nitrogen combined with super-high phosphorus for deep, thick root nets and sturdy seedling emergence.',
      npk: '18-46-0 %',
      temp: 'All Climates',
      ph: 'Soil Compatible',
      rainfall: 'Granular Release',
      details: {
        nitrogen: {
          value: '18% Starter N',
          why: 'Provides gentle early energy to baby sprouts without burning delicate root hairs.'
        },
        phosphorus: {
          value: '46% Super P',
          why: 'The main power of DAP: super-high phosphorus builds deep, wide root systems that anchor the plant.'
        },
        potassium: {
          value: '0%',
          why: 'Focused strictly on root building; potassium can be added later when fruits or grains form.'
        },
        soil: {
          value: 'Black, Red & Clay Loams',
          why: 'Works especially well in low-phosphorus soils to jumpstart seed germination.'
        },
        crops: {
          value: 'Chickpea, Wheat, Mustard, Groundnut, Soybean',
          why: 'Ideal for oilseeds, pulses, and grain seedlings that rely heavily on strong initial taproots.'
        },
        stage: {
          value: 'Basal / At Sowing Time',
          why: 'Apply at sowing time 3-5 cm below or beside the seed so young roots reach it immediately.'
        }
      },
      tips: [
        'Apply DAP at the time of sowing near the seed furrow so new roots find it within days.',
        'Do not place seeds in direct physical contact with fertilizer granules to prevent salt burn.'
      ]
    },
    {
      id: 'f3',
      modelType: 'fertilizer',
      title: '14-35-14 NPK Complex',
      category: 'High Phosphorus Complexes',
      categoryClass: 'cat-fertilizers',
      categoryId: 'complex',
      icon: '🔬',
      tagline: 'High phosphorus complex designed for heavy flowering, fruiting, and cash crops.',
      about: '14-35-14 is a premium granular complex with high phosphorus and balanced nitrogen and potassium. It stimulates explosive early root growth and ensures heavy flowering in cash crops.',
      npk: '14-35-14 %',
      temp: 'Warm / Tropical',
      ph: 'All Soils',
      rainfall: 'Controlled Release',
      details: {
        nitrogen: {
          value: '14% Nitrogen',
          why: 'Supplies steady nitrogen for early vegetative frame development.'
        },
        phosphorus: {
          value: '35% Phosphorus',
          why: 'Drives prolific flower blossom formation and prevents early flower shedding.'
        },
        potassium: {
          value: '14% Potassium',
          why: 'Supports cellular water balance and strengthens stems against storm damage.'
        },
        soil: {
          value: 'Light to Medium Loams',
          why: 'Readily dissolves in root zones without leaching away too fast.'
        },
        crops: {
          value: 'Cotton, Sugarcane, Potato, Ginger, Turmeric',
          why: 'Crops that demand massive root bulk and heavy flower/boll formation.'
        },
        stage: {
          value: 'Basal Application',
          why: 'Best incorporated during final field plowing or first ridging.'
        }
      },
      tips: [
        'Outstanding choice for commercial tubers and spices that need high early root energy.',
        'Granules are uniform; provides even nutrient distribution across the entire bed.'
      ]
    },
    {
      id: 'f4',
      modelType: 'fertilizer',
      title: '28-28-0 NPK Complex',
      category: 'Dual High-Energy Boost',
      categoryClass: 'cat-fertilizers',
      categoryId: 'complex',
      icon: '⚡',
      tagline: 'High-strength dual nutrient complex providing equal parts high nitrogen and phosphorus.',
      about: '28-28-0 is an energy-dense fertilizer that combines high nitrogen for leafy growth with high phosphorus for root expansion in soils that already have abundant natural potassium.',
      npk: '28-28-0 %',
      temp: 'All Seasons',
      ph: 'Neutral / Alkaline',
      rainfall: 'Quick Dissolving',
      details: {
        nitrogen: {
          value: '28% Nitrogen',
          why: 'Promotes rapid tillering and thick green shoot proliferation.'
        },
        phosphorus: {
          value: '28% Phosphorus',
          why: 'Builds dense root volume to support heavy grain heads.'
        },
        potassium: {
          value: '0%',
          why: 'Formulated for potassium-rich black soils where extra potash is not needed.'
        },
        soil: {
          value: 'Black Cotton & Vertisols',
          why: 'Perfect for deep black soils naturally endowed with high potassium minerals.'
        },
        crops: {
          value: 'Maize, Sorghum (Jowar), Wheat, Sugarcane',
          why: 'Tall cereal crops needing quick vegetative bulk and strong root anchors.'
        },
        stage: {
          value: 'Early Vegetative / Tillering',
          why: 'Apply when crop is 20 to 30 days old during first weeding.'
        }
      },
      tips: [
        'Saves money in black soils by avoiding unnecessary potassium application.',
        'Water the field moderately after spreading to help granules dissolve smoothly.'
      ]
    },
    {
      id: 'f5',
      modelType: 'fertilizer',
      title: '17-17-17 NPK Balanced',
      category: 'Balanced All-Rounders',
      categoryClass: 'cat-fertilizers',
      categoryId: 'balanced',
      icon: '⚖️',
      tagline: '1:1:1 perfectly balanced formula for all-round nutrition in vegetables and orchards.',
      about: '17-17-17 delivers an equal proportion of nitrogen, phosphorus, and potassium in every single granule. It is the premier choice for vegetables, fruit trees, and general garden farming.',
      npk: '17-17-17 %',
      temp: 'All Climates',
      ph: 'All Soil pH',
      rainfall: 'Standard Release',
      details: {
        nitrogen: {
          value: '17% Balanced N',
          why: 'Maintains steady green leaf canopy without over-vegetating.'
        },
        phosphorus: {
          value: '17% Balanced P',
          why: 'Maintains continuous root health and healthy flower clusters.'
        },
        potassium: {
          value: '17% Balanced K',
          why: 'Improves fruit texture, sugar content, and post-harvest shelf life.'
        },
        soil: {
          value: 'Loamy, Alluvial & Garden Soils',
          why: 'Maintains balanced soil nutrient ratios year after year.'
        },
        crops: {
          value: 'Tomato, Onion, Chili, Grapes, Banana, Pulses',
          why: 'Vegetables and fruit crops with continuous flowering and harvesting cycles.'
        },
        stage: {
          value: 'Split Season Application',
          why: 'Apply half at planting and half during early fruit set.'
        }
      },
      tips: [
        'The safest all-rounder formula when you want balanced growth without nutrient imbalances.',
        'Excellent for drip fertigation and side-dressing around fruit trees.'
      ]
    },
    {
      id: 'f6',
      modelType: 'fertilizer',
      title: '20-20-0 NPK Complex',
      category: 'Dual High-Energy Boost',
      categoryClass: 'cat-fertilizers',
      categoryId: 'complex',
      icon: '🌿',
      tagline: 'Fast-acting nitrogen-phosphorus blend for early crop stages and pulse crops.',
      about: '20-20-0 provides an easy-to-absorb 1:1 balance of nitrogen and phosphorus. It is widely used in short-season crops, pulses, and oilseeds to accelerate early root and shoot synergy.',
      npk: '20-20-0 %',
      temp: 'All Seasons',
      ph: 'All Soils',
      rainfall: 'Fast Dissolving',
      details: {
        nitrogen: {
          value: '20% Nitrogen',
          why: 'Quick-release nitrogen for fast seedling greening.'
        },
        phosphorus: {
          value: '20% Phosphorus',
          why: 'Encourages root branch proliferation and active nodulation.'
        },
        potassium: {
          value: '0%',
          why: 'Economical option for soils with sufficient potassium reserves.'
        },
        soil: {
          value: 'Red & Medium Loams',
          why: 'Rapidly absorbed by plant roots in lighter soils.'
        },
        crops: {
          value: 'Gram, Moong, Urad, Mustard, Groundnut',
          why: 'Short-duration pulses and oilseeds needing quick early nutrition.'
        },
        stage: {
          value: 'Basal / Sowing',
          why: 'Mix into seed beds during final land preparation.'
        }
      },
      tips: [
        'Cost-effective fertilizer for pulse farmers seeking rapid crop establishment.',
        'Can be combined with organic farmyard manure for prolonged soil health.'
      ]
    },
    {
      id: 'f7',
      modelType: 'fertilizer',
      title: '10-26-26 NPK High-K',
      category: 'High-Potash Complexes',
      categoryClass: 'cat-fertilizers',
      categoryId: 'potassium',
      icon: '🥔',
      tagline: 'High potassium and phosphorus complex for root tubers, fruit sizing, and drought immunity.',
      about: '10-26-26 is a specialized complex rich in phosphorus and potassium. It is designed for tuber crops, onions, potatoes, and orchards where fruit weight, sugar content, and skin finish are top priorities.',
      npk: '10-26-26 %',
      temp: 'All Climates',
      ph: 'All Soils',
      rainfall: 'Controlled Release',
      details: {
        nitrogen: {
          value: '10% Controlled N',
          why: 'Prevents excess foliage so the plant focuses all energy on underground tuber expansion.'
        },
        phosphorus: {
          value: '26% Phosphorus',
          why: 'Builds heavy underground root and tuber foundations.'
        },
        potassium: {
          value: '26% Super Potash',
          why: 'Transfers sugars into potato tubers, fruit pulp, and grain kernels for maximum weight.'
        },
        soil: {
          value: 'Sandy Loam & Alluvial Soils',
          why: 'High potassium prevents nutrient depletion in high-producing soils.'
        },
        crops: {
          value: 'Potato, Onion, Garlic, Grapes, Pomegranate, Sugarcane',
          why: 'Heavy potassium feeders that produce underground tubers or sweet fruits.'
        },
        stage: {
          value: 'Basal & Tuber Initiation',
          why: 'Apply at sowing and during initial tuber bulking or fruit setting.'
        }
      },
      tips: [
        'Top choice for potato and onion farmers seeking uniform, large-sized produce.',
        'Protects winter crops against cold frost and dry winds.'
      ]
    },
    {
      id: 'f8',
      modelType: 'fertilizer',
      title: 'MOP Potash (0-0-60)',
      category: 'High-Potash Complexes',
      categoryClass: 'cat-fertilizers',
      categoryId: 'potassium',
      icon: '🛡️',
      tagline: 'Muriate of Potash delivering 60% potassium for disease resistance and plump grains.',
      about: 'Muriate of Potash (MOP) is the world’s most potent source of potassium. It strengthens plant cell walls, prevents crops from falling in rainstorms, and helps grains fill with maximum weight.',
      npk: '0-0-60 %',
      temp: 'All Climates',
      ph: 'Soil Compatible',
      rainfall: 'Moisture Soluble',
      details: {
        nitrogen: {
          value: '0%',
          why: 'Pure potash source; pair with urea or DAP as per specific crop needs.'
        },
        phosphorus: {
          value: '0%',
          why: 'Focused entirely on potassium replenishment and cell hardening.'
        },
        potassium: {
          value: '60% Pure Potash',
          why: 'Hardens plant cell walls, boosts drought resilience, and fills grains plumply.'
        },
        soil: {
          value: 'Potash-Deficient Soils',
          why: 'Replenishes potassium in soils where continuous grain cropping takes place.'
        },
        crops: {
          value: 'Paddy, Wheat, Sugarcane, Banana, Coconut, Cotton',
          why: 'Crops that develop heavy stalks, long fibers, or sweet fruits.'
        },
        stage: {
          value: 'Basal & Pre-Flowering',
          why: 'Apply half at planting and half before flowering/panicle emergence.'
        }
      },
      tips: [
        'Essential for stopping rice and wheat stalks from falling flat (lodging) during monsoon rains.',
        'Increases oil percentage in oilseeds and sugar recovery in sugarcane.'
      ]
    }
  ];

  // ==========================================
  // MODEL 3: YIELD PREDICTION CATALOG (9 PROFILES)
  // ==========================================
  const yieldCatalogData = [
    {
      id: 'y1',
      modelType: 'yield',
      title: 'Wheat (Golden Grain)',
      category: 'Cereals & Foodgrains',
      categoryClass: 'cat-grains',
      categoryId: 'cereals',
      icon: '🌾',
      tagline: 'Staple winter cereal with standard yield benchmarks from 3.8 to 5.5 tons/hectare.',
      about: 'Wheat is the premier winter foodgrain crop. With certified high-yielding dwarf seeds, timely irrigation during crown root initiation, and balanced NPK fertilizer, farmers routinely achieve 4 to 5.5 tons per hectare.',
      npk: '4.2 – 5.5 T/Ha',
      temp: 'Rabi (Winter)',
      ph: '110 – 130 Days',
      rainfall: '350 – 450 mm',
      details: {
        yield: {
          value: '4.2 – 5.5 Tons/Ha',
          why: 'Benchmark harvest for irrigated fields using modern semi-dwarf wheat varieties.'
        },
        season: {
          value: 'Rabi (Nov - April)',
          why: 'Cool winter nights ensure long grain-filling duration without heat stress.'
        },
        water: {
          value: '4 to 5 Timely Irrigations',
          why: 'Critical water stages: Crown Root Initiation (21 days) and Flowering stage.'
        },
        fertEffect: {
          value: 'High Response (120:60:40)',
          why: 'Balanced nitrogen split doses give 30% higher tiller count and grain weight.'
        },
        pest: {
          value: 'Rust & Weed Management',
          why: 'Keep fields free of broadleaf weeds in first 35 days to maximize grain count.'
        },
        duration: {
          value: '115 – 130 Days',
          why: 'Harvest when stalks turn golden amber and grain moisture drops below 12%.'
        }
      },
      tips: [
        'Sow between Nov 1 and Nov 15 for optimal cool-weather grain development.',
        'Never skip the Crown Root Initiation irrigation at 21 days after sowing.'
      ]
    },
    {
      id: 'y2',
      modelType: 'yield',
      title: 'Paddy Rice (Paddy)',
      category: 'Cereals & Foodgrains',
      categoryClass: 'cat-grains',
      categoryId: 'cereals',
      icon: '🍚',
      tagline: 'High-capacity staple foodgrain yielding 4.0 to 6.2 tons/hectare under good water management.',
      about: 'Rice responds strongly to warm monsoon temperatures and standing water management. Hybrid varieties and balanced nitrogen management unlock yields upwards of 5.5 to 6.2 tons per hectare.',
      npk: '4.0 – 6.2 T/Ha',
      temp: 'Kharif / Monsoon',
      ph: '120 – 145 Days',
      rainfall: '1100 – 1400 mm',
      details: {
        yield: {
          value: '4.0 – 6.2 Tons/Ha',
          why: 'High-yielding transplanted paddy under regular water depth control.'
        },
        season: {
          value: 'Kharif / Summer',
          why: 'Monsoon warmth and high humidity favor rapid vegetative tillering.'
        },
        water: {
          value: 'Continuous Shallow Water',
          why: 'Maintaining 2-5 cm shallow water suppresses weeds and feeds root panicles.'
        },
        fertEffect: {
          value: 'Very High (100:50:50)',
          why: 'Applying nitrogen in 3 splits (basal, tillering, panicle) prevents nutrient loss.'
        },
        pest: {
          value: 'Stem Borer & Blast Defense',
          why: 'Monitor light traps and maintain good plant spacing for air circulation.'
        },
        duration: {
          value: '120 – 145 Days',
          why: 'Grains turn golden yellow; drain field 10 days prior to harvest.'
        }
      },
      tips: [
        'Transplant 20-25 day old seedlings at 2-3 seedlings per hill for optimal tiller spacing.',
        'Apply zinc sulfate at planting to prevent Khaira disease in alkaline soils.'
      ]
    },
    {
      id: 'y3',
      modelType: 'yield',
      title: 'Sugarcane (High-Tonnage)',
      category: 'Cash & Fiber',
      categoryClass: 'cat-commercial',
      categoryId: 'cash',
      icon: '🎋',
      tagline: 'Heavy biomass commercial cash crop producing 75 to 115 tons/hectare across full year.',
      about: 'Sugarcane is one of the highest biomass-producing crops on Earth. Grown across an 11-14 month cycle, it requires generous water and balanced nutrients to produce thick, high-sugar stalks.',
      npk: '75 – 115 T/Ha',
      temp: 'Whole Year (12M)',
      ph: '330 – 360 Days',
      rainfall: '1500 – 2200 mm',
      details: {
        yield: {
          value: '75 – 115 Tons/Ha',
          why: 'Gigantic biomass yield when stalks grow 2.5 to 3.5 meters tall with thick girth.'
        },
        season: {
          value: 'Annual (Autumn / Spring)',
          why: 'Long 12-month season allows deep underground root development.'
        },
        water: {
          value: 'Regular Drip / Furrow',
          why: 'Needs frequent watering during the grand growth phase (months 4 through 8).'
        },
        fertEffect: {
          value: 'Heavy Feeder (250:115:115)',
          why: 'Requires high nitrogen and potash to maximize sugar content in the juice.'
        },
        pest: {
          value: 'Early Shoot Borer & White Grub',
          why: 'Earthing up soil around cane bases at 90 days prevents shoot borer attack.'
        },
        duration: {
          value: '330 – 360 Days',
          why: 'Harvest when brix sugar reading exceeds 18%.'
        }
      },
      tips: [
        'Use drip irrigation with fertigation to save 40% water while increasing cane tonnage.',
        'Trash mulching in furrows prevents moisture evaporation and controls weeds.'
      ]
    },
    {
      id: 'y4',
      modelType: 'yield',
      title: 'Golden Maize (Corn)',
      category: 'Cereals & Foodgrains',
      categoryClass: 'cat-grains',
      categoryId: 'cereals',
      icon: '🌽',
      tagline: 'High photosynthetic efficiency yielding 4.5 to 7.0 tons/hectare with hybrid seeds.',
      about: 'Maize is known as the "Queen of Cereals" due to its high genetic yield potential. Hybrid corn varieties with balanced spacing and nitrogen top-dressing routinely reach 6+ tons per hectare.',
      npk: '4.5 – 7.0 T/Ha',
      temp: 'Kharif / Spring',
      ph: '95 – 115 Days',
      rainfall: '500 – 750 mm',
      details: {
        yield: {
          value: '4.5 – 7.0 Tons/Ha',
          why: 'Fast-growing C4 plant capable of packing massive starch into large double cobs.'
        },
        season: {
          value: 'Kharif & Rabi Summer',
          why: 'Loves bright summer sunshine and warm days between 24°C and 30°C.'
        },
        water: {
          value: 'Tasseling & Silking Moisture',
          why: 'Moisture stress during flowering causes empty cobs; water regularly during tasseling.'
        },
        fertEffect: {
          value: 'High Nitrogen Response',
          why: 'Apply nitrogen at planting, knee-high stage, and tassel emergence.'
        },
        pest: {
          value: 'Fall Armyworm Defense',
          why: 'Scout whorls early and apply bio-pesticides if larvae appear.'
        },
        duration: {
          value: '95 – 115 Days',
          why: 'Harvest when husk leaves turn straw-colored and black layer forms at kernel base.'
        }
      },
      tips: [
        'Maintain plant population at 65,000 to 70,000 plants per hectare for maximum cob yield.',
        'Never allow water stagnation in fields; ensure furrows drain quickly after heavy rain.'
      ]
    },
    {
      id: 'y5',
      modelType: 'yield',
      title: 'Semi-Arid Cotton (Lint)',
      category: 'Cash & Fiber',
      categoryClass: 'cat-commercial',
      categoryId: 'cash',
      icon: '☁️',
      tagline: 'High-value fiber crop delivering 2.2 to 3.8 tons/hectare of raw seed cotton (Kapas).',
      about: 'Cotton is the backbone of the textile economy. Modern Bt cotton hybrids planted in deep black soils with drip fertigation and pest scouting produce bountiful boll harvests.',
      npk: '2.2 – 3.8 T/Ha',
      temp: 'Kharif (Monsoon)',
      ph: '150 – 175 Days',
      rainfall: '650 – 850 mm',
      details: {
        yield: {
          value: '2.2 – 3.8 Tons/Ha',
          why: 'Achieved with 40 to 60 healthy, heavy bolls per plant on well-branched bushes.'
        },
        season: {
          value: 'Kharif Season',
          why: 'Requires long hot sunny days for vegetative growth followed by dry boll opening.'
        },
        water: {
          value: 'Moisture at Flowering',
          why: 'Water during boll formation; avoid waterlogging during early germination.'
        },
        fertEffect: {
          value: 'Nitrogen & Potash Balance',
          why: 'Potassium prevents premature leaf reddening and strengthens cotton fibers.'
        },
        pest: {
          value: 'Sucking Pest & Bollworm Shield',
          why: 'Install yellow sticky traps and monitor whitefly and jassid populations.'
        },
        duration: {
          value: '150 – 175 Days',
          why: 'Harvest in 2-3 pickings as bolls burst open with fluffy white fiber.'
        }
      },
      tips: [
        'Nip the terminal shoot at 80-90 days to encourage horizontal fruiting branches.',
        'Pick only dry, fully opened bolls in the morning after dew evaporates.'
      ]
    },
    {
      id: 'y6',
      modelType: 'yield',
      title: 'Potato (Tuber Harvest)',
      category: 'Oilseeds & Tubers',
      categoryClass: 'cat-pulses',
      categoryId: 'tubers',
      icon: '🥔',
      tagline: 'Fast heavy-yielding tuber crop producing 22 to 36 tons/hectare in cool winter weather.',
      about: 'Potato is one of the highest food energy producers per hectare. In just 90 days of cool winter weather, loose loamy soil and potassium fertilizer yield heavy crates of golden tubers.',
      npk: '22 – 36 T/Ha',
      temp: 'Rabi (Winter)',
      ph: '85 – 105 Days',
      rainfall: '350 – 500 mm',
      details: {
        yield: {
          value: '22 – 36 Tons/Ha',
          why: 'High-density tuber bulking under cool night temperatures (15°C to 20°C).'
        },
        season: {
          value: 'Rabi / Winter',
          why: 'Tuber initiation requires cool nights; high heat stops tubers from swelling.'
        },
        water: {
          value: 'Frequent Light Irrigation',
          why: 'Maintain uniform soil moisture; dry spells cause cracked or knobby potatoes.'
        },
        fertEffect: {
          value: 'High Potash Demand (150:100:150)',
          why: 'Potash transfers leaf sugars down into swelling tubers for uniform size.'
        },
        pest: {
          value: 'Late Blight Protection',
          why: 'Spray protective bio-fungicides if cloudy humid winter weather sets in.'
        },
        duration: {
          value: '85 – 105 Days',
          why: 'Cut haulms (stems) 10 days before digging to harden potato skins.'
        }
      },
      tips: [
        'Use certified disease-free seed tubers with 2-3 healthy sprouted eyes.',
        'Earth up soil around plants twice to keep growing tubers buried away from sunlight.'
      ]
    },
    {
      id: 'y7',
      modelType: 'yield',
      title: 'Soybean (Golden Oilseed)',
      category: 'Oilseeds & Tubers',
      categoryClass: 'cat-pulses',
      categoryId: 'tubers',
      icon: '🌱',
      tagline: 'High-protein oilseed legume delivering 1.8 to 3.2 tons/hectare while enriching soil.',
      about: 'Soybean is the world’s leading oilseed and protein crop. It thrives during the monsoon season, fixing atmospheric nitrogen while producing pods rich in 40% protein and 20% oil.',
      npk: '1.8 – 3.2 T/Ha',
      temp: 'Kharif (Monsoon)',
      ph: '90 – 105 Days',
      rainfall: '600 – 800 mm',
      details: {
        yield: {
          value: '1.8 – 3.2 Tons/Ha',
          why: 'High pod count per plant with 3 plump beans per pod on fertile loams.'
        },
        season: {
          value: 'Kharif / Monsoon',
          why: 'Rainfed monsoon crop that benefits from warm moist soil.'
        },
        water: {
          value: 'Rainfed / Protective Irrigation',
          why: 'Critical moisture stages: Pod initiation and seed filling stage.'
        },
        fertEffect: {
          value: 'Phosphorus & Sulfur Driven',
          why: 'Sulfur boosts seed oil content while phosphorus strengthens root nodules.'
        },
        pest: {
          value: 'Girdle Beetle & Semilooper',
          why: 'Seed treatment with bio-fungicide ensures 95%+ germination rate.'
        },
        duration: {
          value: '90 – 105 Days',
          why: 'Harvest when leaves turn yellow and drop off, leaving dry rattling pods.'
        }
      },
      tips: [
        'Inoculate seeds with Rhizobium culture before sowing to double nitrogen-fixing nodules.',
        'Harvest immediately when pods rattle to prevent pod shattering in hot sun.'
      ]
    },
    {
      id: 'y8',
      modelType: 'yield',
      title: 'Rapeseed & Mustard',
      category: 'Oilseeds & Tubers',
      categoryClass: 'cat-pulses',
      categoryId: 'tubers',
      icon: '🌼',
      tagline: 'Winter oilseed yielding 1.4 to 2.5 tons/hectare of high-oil seeds with low water demand.',
      about: 'Mustard transforms fields into vibrant yellow landscapes during winter. It is very economical to grow, requiring minimal irrigation and producing pungent, golden oil-rich seeds.',
      npk: '1.4 – 2.5 T/Ha',
      temp: 'Rabi (Winter)',
      ph: '105 – 125 Days',
      rainfall: '250 – 400 mm',
      details: {
        yield: {
          value: '1.4 – 2.5 Tons/Ha',
          why: 'Dense siliqua (seed pod) clusters with high seed test weight.'
        },
        season: {
          value: 'Rabi / Winter',
          why: 'Crisp cool winter air enhances oil synthesis in developing pods.'
        },
        water: {
          value: '2 to 3 Light Waterings',
          why: 'Water at flowering and pod development; highly drought-resilient.'
        },
        fertEffect: {
          value: 'Sulfur & Nitrogen Synergy',
          why: 'Applying 20-30 kg/ha Sulfur increases seed oil percentage by 3 to 5%.'
        },
        pest: {
          value: 'Mustard Aphid Control',
          why: 'Early sowing in October avoids peak aphid infestation in January.'
        },
        duration: {
          value: '105 – 125 Days',
          why: 'Harvest in early morning when pods are damp with dew to avoid seed shattering.'
        }
      },
      tips: [
        'Sow in the first half of October to escape aphid pest attacks during winter.',
        'Always include sulfur fertilizer in your basal dose for higher oil yield.'
      ]
    },
    {
      id: 'y9',
      modelType: 'yield',
      title: 'Banana Plantation',
      category: 'Fruit Orchards',
      categoryClass: 'cat-fruits',
      categoryId: 'fruits',
      icon: '🍌',
      tagline: 'High-density commercial orchard yielding 38 to 58 tons/hectare of sweet export bananas.',
      about: 'Commercial tissue-culture banana plantations (like Grand Naine) are colossal fruit yielders. With drip irrigation, fertigation, and bunch sleeves, yields routinely surpass 45+ tons per hectare.',
      npk: '38 – 58 T/Ha',
      temp: 'Perennial / Annual',
      ph: '300 – 365 Days',
      rainfall: '1400 – 2000 mm',
      details: {
        yield: {
          value: '38 – 58 Tons/Ha',
          why: 'Heavy bunches weighing 25 to 35 kg each across 1,800 plants per hectare.'
        },
        season: {
          value: 'All Year Tropical',
          why: 'Continuous growth cycle in frost-free sunny climates.'
        },
        water: {
          value: 'Daily Drip Fertigation',
          why: 'Banana is 90% water; daily drip gives uniform finger length and weight.'
        },
        fertEffect: {
          value: 'Heavy Potash Feeder (200:60:300)',
          why: 'Potash is the key to sweet fruit taste, thick skin, and export grade size.'
        },
        pest: {
          value: 'Sigatoka Leaf Spot & Nematode Shield',
          why: 'De-leaf yellow bottom leaves regularly to keep plantation aerated and clean.'
        },
        duration: {
          value: '300 – 365 Days',
          why: 'Harvest bunches when fruit angles round off and light green color appears.'
        }
      },
      tips: [
        'Cover fruit bunches with blue poly-sleeves to protect from sunburn and insect blemishes.',
        'Prop tall bearing mother trees with bamboo poles to prevent storm wind damage.'
      ]
    }
  ];

  // ==========================================
  // ACTIVE CATALOG SELECTION & CATEGORIES
  // ==========================================
  const getActiveCatalog = () => {
    if (activeModel === 'fertilizer') return fertilizerCatalogData;
    if (activeModel === 'yield') return yieldCatalogData;
    return cropCatalogData;
  };

  const getModelCategories = () => {
    if (activeModel === 'fertilizer') {
      return [
        { id: 'all', label: 'ALL FORMULAS', icon: 'fa-solid fa-border-all' },
        { id: 'nitrogen', label: 'NITROGENOUS', icon: 'fa-solid fa-leaf' },
        { id: 'phosphorus', label: 'PHOSPHORUS STARTERS', icon: 'fa-solid fa-seedling' },
        { id: 'potassium', label: 'HIGH-POTASH (K)', icon: 'fa-solid fa-shield-halved' },
        { id: 'complex', label: 'NPK COMPLEXES', icon: 'fa-solid fa-flask' },
        { id: 'balanced', label: 'BALANCED ALL-ROUNDERS', icon: 'fa-solid fa-scale-balanced' }
      ];
    }
    if (activeModel === 'yield') {
      return [
        { id: 'all', label: 'ALL HARVESTS', icon: 'fa-solid fa-border-all' },
        { id: 'cereals', label: 'CEREALS & GRAINS', icon: 'fa-solid fa-wheat-awn' },
        { id: 'cash', label: 'CASH & FIBER', icon: 'fa-solid fa-coins' },
        { id: 'tubers', label: 'OILSEEDS & TUBERS', icon: 'fa-solid fa-cubes-stacked' },
        { id: 'fruits', label: 'FRUIT ORCHARDS', icon: 'fa-solid fa-apple-whole' }
      ];
    }
    return [
      { id: 'all', label: 'ALL SPECIES', icon: 'fa-solid fa-border-all' },
      { id: 'grains', label: 'GRAINS & CEREALS', icon: 'fa-solid fa-wheat-awn' },
      { id: 'pulses', label: 'PULSES & LEGUMES', icon: 'fa-solid fa-seedling' },
      { id: 'fruits', label: 'FRUITS & ORCHARD', icon: 'fa-solid fa-apple-whole' },
      { id: 'commercial', label: 'CASH CROPS', icon: 'fa-solid fa-mug-hot' }
    ];
  };

  const activeCatalog = getActiveCatalog();
  const categories = getModelCategories();

  const filteredCrops = activeCatalog.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSwitchModel = (modelKey) => {
    setActiveModel(modelKey);
    setSelectedCategory('all');
    setSearchQuery('');
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main style={{ padding: 'calc(var(--nav-height) + 2rem) 0 5rem 0' }}>
      <div className="page-container" ref={gridTopRef}>
        {/* Header */}
        <div className="section-header-editorial" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="section-title-large" style={{ margin: '0 auto' }}>
            {activeModel === 'fertilizer'
              ? 'Fertilizer & NPK Advisory Library'
              : activeModel === 'yield'
              ? 'Crop Yield & Harvest Benchmarks Library'
              : 'Crop & Species Intelligence Library'}
          </h1>
          <p className="section-desc-editorial" style={{ margin: '0.85rem auto 0 auto', maxWidth: '780px' }}>
            {activeModel === 'fertilizer'
              ? 'Explore chemical compositions, soil compatibility, target crops, and simple English instructions for the 8 most important fertilizer formulas.'
              : activeModel === 'yield'
              ? 'Discover expected harvest tonnages, optimal growing seasons, water needs, and yield-boosting advice across major food and cash crops.'
              : 'Explore validated soil chemistry bounds, precipitation thresholds, temperature tolerances, and simple English growing guidelines for supported crops.'}
          </p>
        </div>

        {/* 3 Model Selector Tabs */}
        <div className="model-library-tabs">
          <button
            type="button"
            className={`model-lib-tab-btn ${activeModel === 'crop' ? 'active' : ''}`}
            onClick={() => handleSwitchModel('crop')}
          >
            <i className="fa-solid fa-seedling"></i>
            <div className="model-lib-tab-text">
              <span className="model-lib-tab-title">Crop Selection Library</span>
              <span className="model-lib-tab-subtitle">20+ Species &amp; Climates</span>
            </div>
          </button>

          <button
            type="button"
            className={`model-lib-tab-btn ${activeModel === 'fertilizer' ? 'active' : ''}`}
            onClick={() => handleSwitchModel('fertilizer')}
          >
            <i className="fa-solid fa-flask"></i>
            <div className="model-lib-tab-text">
              <span className="model-lib-tab-title">Fertilizer Advisory Guide</span>
              <span className="model-lib-tab-subtitle">8 Primary Formulations</span>
            </div>
          </button>

          <button
            type="button"
            className={`model-lib-tab-btn ${activeModel === 'yield' ? 'active' : ''}`}
            onClick={() => handleSwitchModel('yield')}
          >
            <i className="fa-solid fa-chart-line"></i>
            <div className="model-lib-tab-text">
              <span className="model-lib-tab-title">Yield Expectation Matrix</span>
              <span className="model-lib-tab-subtitle">9 Major Production Benchmarks</span>
            </div>
          </button>
        </div>

        {/* Search Bar & How It Works Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <div className="crop-search-bar" style={{ flex: 1, minWidth: '280px', marginTop: 0 }}>
            <div className="console-field">
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder={
                    activeModel === 'fertilizer'
                      ? 'Search fertilizer formulas by name, NPK ratio, or soil type...'
                      : activeModel === 'yield'
                      ? 'Search crop yield benchmarks by crop name, season, or harvest duration...'
                      : 'Search crops by name, category, or climate requirements...'
                  }
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

          <Link
            to={`/how-it-works?model=${activeModel}`}
            className="btn-how-it-works"
            title={`Learn how the ${activeModel === 'crop' ? 'Crop Selection' : activeModel === 'fertilizer' ? 'Fertilizer Advisory' : 'Yield Prediction'} model works`}
          >
            <i className="fa-solid fa-circle-question"></i>
            <span>How This Model Works</span>
          </Link>
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

        {/* Editorial Index Grid */}
        <div className="crop-index-grid">
          {filteredCrops.length > 0 ? (
            filteredCrops.map((crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                onOpenDetails={(selected) => setActiveCropModal(selected)}
              />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'var(--agri-surface)', borderRight: '1px solid var(--agri-line)', borderBottom: '1px solid var(--agri-line)' }}>
              <span className="mono-meta" style={{ display: 'block', marginBottom: '0.75rem' }}>NO MATCHING RECORDS</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No entries found</h3>
              <p style={{ color: 'var(--agri-muted)', marginTop: '0.5rem' }}>Try clearing your search query or selecting a different category filter.</p>
            </div>
          )}
        </div>

        {/* ==========================================
            BOTTOM CROSS-MODEL NAVIGATION SECTION
            ========================================== */}
        <section className="cross-model-nav-section">
          <div className="cross-model-header">
            <h2 className="cross-model-title">Explore Other Advisory Intelligence Models</h2>
            <p className="cross-model-desc">
              AgriSense features 3 dedicated machine learning models. Jump to the full intelligence catalog for any model below:
            </p>
          </div>

          <div className="cross-model-grid">
            {/* Model 1 Card (shown when not active) */}
            {activeModel !== 'crop' && (
              <div className="cross-model-card" onClick={() => handleSwitchModel('crop')}>
                <div className="cross-model-card-top">
                  <div className="cross-model-icon-badge">🌾</div>
                  <span className="cross-model-badge">MODEL 1</span>
                </div>
                <h3 className="cross-model-card-title">Crop Selection Model</h3>
                <p className="cross-model-card-text">
                  Match your exact soil nitrogen, phosphorus, potassium, moisture, and rainfall telemetry with 20+ validated crop species.
                </p>
                <div className="cross-model-card-footer">
                  <span className="cross-model-action-link">
                    Explore Crop Library <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </div>
              </div>
            )}

            {/* Model 2 Card (shown when not active) */}
            {activeModel !== 'fertilizer' && (
              <div className="cross-model-card" onClick={() => handleSwitchModel('fertilizer')}>
                <div className="cross-model-card-top">
                  <div className="cross-model-icon-badge">🧪</div>
                  <span className="cross-model-badge">MODEL 2</span>
                </div>
                <h3 className="cross-model-card-title">Fertilizer Advisory Model</h3>
                <p className="cross-model-card-text">
                  Discover the optimal NPK fertilizer formula (Urea, DAP, 10-26-26, 17-17-17) based on soil color, crop type, and nutrient deficits.
                </p>
                <div className="cross-model-card-footer">
                  <span className="cross-model-action-link">
                    Explore Fertilizer Library <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </div>
              </div>
            )}

            {/* Model 3 Card (shown when not active) */}
            {activeModel !== 'yield' && (
              <div className="cross-model-card" onClick={() => handleSwitchModel('yield')}>
                <div className="cross-model-card-top">
                  <div className="cross-model-icon-badge">📊</div>
                  <span className="cross-model-badge">MODEL 3</span>
                </div>
                <h3 className="cross-model-card-title">Crop Yield Prediction Model</h3>
                <p className="cross-model-card-text">
                  Forecast expected harvest yield in tons/hectare based on state, season, farm acreage, rainfall, and fertilizer investment.
                </p>
                <div className="cross-model-card-footer">
                  <span className="cross-model-action-link">
                    Explore Yield Benchmarks <i className="fa-solid fa-arrow-right"></i>
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Details Modal (Handles Crop, Fertilizer & Yield) */}
      <CropDetailsModal
        crop={activeCropModal}
        isOpen={Boolean(activeCropModal)}
        onClose={() => setActiveCropModal(null)}
      />
    </main>
  );
}
