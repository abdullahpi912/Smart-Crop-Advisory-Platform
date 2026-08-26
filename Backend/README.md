# Cropling - Flask Backend API

This is the Flask backend REST API serving three production machine learning models:
1. **Crop Recommendation** (`Model/crop_recommendation_model.pkl`) — Tuned Random Forest Classifier
2. **Fertilizer Recommendation** (`Model/Fertilizer Recommendation/fertilizer_recommendation_model_v2.pkl` & `fertilizer_label_encoder_v2.pkl`) — Decision Tree Classifier with LabelEncoder
3. **Crop Yield Prediction** (`Model/crop_yield_model.pkl`) — XGBoost Regressor Pipeline

---

## API Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verifies backend API availability, MySQL database connectivity, total log counts, and the operational status of all 3 machine learning models.
- **Example Response**:
  ```json
  {
    "status": "healthy",
    "backend": "Flask REST API + MySQL",
    "database": "connected",
    "total_logs": 42,
    "models": {
      "crop_recommendation": "loaded",
      "fertilizer_recommendation": "loaded",
      "crop_yield_prediction": "loaded"
    }
  }
  ```

---

### 2. Predict Crop Recommendation
- **Endpoint**: `POST /api/predict`
- **Description**: Accepts 7 soil and climate metrics (`N`, `P`, `K`, `temperature`, `humidity`, `pH`, `rainfall`), returning the optimal crop recommendation from 22 supported crop classes along with complete agronomic metadata.
- **Request Body** (JSON):
  ```json
  {
    "nitrogen": 90,
    "phosphorus": 42,
    "potassium": 43,
    "temperature": 26.5,
    "humidity": 80,
    "ph": 6.5,
    "rainfall": 202
  }
  ```
- **Example Response** (JSON):
  ```json
  {
    "status": "success",
    "logId": "#LOG-1234",
    "timestamp": "2026-08-26T10:30:00.000000+00:00",
    "type": "Crop Match (ML Model)",
    "crop": "rice",
    "recommendedItem": "Paddy Rice 🌾",
    "category": "Grains & Cereals",
    "confidence": "99.1%",
    "badgeClass": "badge-crop",
    "dosageAdvice": "Optimal yield predicted under current field conditions",
    "npkSummary": "N: 90.0 | P: 42.0 | K: 43.0",
    "climateSummary": "pH 6.5 | 202.0 mm | 26.5°C",
    "soilHealth": "Optimal Balanced Soil",
    "detailedNotes": "High-moisture wetland grain crop requiring high nitrogen and standing water management.",
    "inputs": {
      "nitrogen": 90.0,
      "phosphorus": 42.0,
      "potassium": 43.0,
      "temperature": 26.5,
      "humidity": 80.0,
      "ph": 6.5,
      "rainfall": 202.0,
      "mode": "crop"
    }
  }
  ```

---

### 3. Predict Fertilizer Recommendation
- **Endpoint**: `POST /api/predict/fertilizer`
- **Description**: Accepts regional location, soil color, target crop, and soil chemistry metrics, predicting the primary fertilizer recommendation along with a ranked top-3 probability shortlist.
- **Request Body** (JSON):
  ```json
  {
    "district_name": "Pune",
    "soil_color": "Black",
    "crop": "Sugarcane",
    "nitrogen": 45,
    "phosphorus": 20,
    "potassium": 15,
    "ph": 6.8,
    "rainfall": 950,
    "temperature": 28.5
  }
  ```
- **Example Response** (JSON):
  ```json
  {
    "status": "success",
    "fertilizer": "Urea",
    "top3": [
      { "name": "Urea", "confidence": 88.4 },
      { "name": "10:26:26 NPK", "confidence": 7.2 },
      { "name": "DAP", "confidence": 4.4 }
    ],
    "logId": "#LOG-5678",
    "timestamp": "2026-08-26T10:30:00.000000+00:00",
    "type": "Fertilizer Recommendation (ML)",
    "crop": "Sugarcane",
    "recommendedItem": "Urea",
    "category": "Nitrogenous Fertilizer",
    "confidence": "88.4%",
    "badgeClass": "badge-fertilizer",
    "dosageAdvice": "High nitrogen source (46% N). Split application during vegetative growth.",
    "npkSummary": "N: 45.0 | P: 20.0 | K: 15.0",
    "climateSummary": "pH 6.8 | 950.0 mm | 28.5°C",
    "soilHealth": "Optimal Balanced Soil",
    "detailedNotes": "Optimal nutrient recommendation for Sugarcane in Pune on Black soil.",
    "inputs": {
      "district_name": "Pune",
      "soil_color": "Black",
      "crop": "Sugarcane",
      "nitrogen": 45.0,
      "phosphorus": 20.0,
      "potassium": 15.0,
      "ph": 6.8,
      "rainfall": 950.0,
      "temperature": 28.5,
      "mode": "fertilizer"
    }
  }
  ```

---

### 4. Predict Crop Yield & Harvest Forecast
- **Endpoint**: `POST /api/predict/yield`
- **Description**: Forecasts expected agricultural crop production (in metric tonnes and tonnes per hectare) using an XGBoost regressor pipeline with logarithmic target scaling.
- **Request Body** (JSON):
  ```json
  {
    "state_name": "Maharashtra",
    "season": "Kharif",
    "crop": "Rice",
    "crop_year": 2024,
    "area": 2.5
  }
  ```
- **Example Response** (JSON):
  ```json
  {
    "status": "success",
    "predicted_production_tonnes": 6.85,
    "crop": "Rice",
    "unit": "tonnes",
    "yield_per_hectare": 2.74,
    "logId": "#LOG-9012",
    "timestamp": "2026-08-26T10:30:00.000000+00:00",
    "type": "Crop Yield Prediction (ML)",
    "recommendedItem": "Rice: 6.85 Tonnes",
    "category": "Yield & Harvest Forecast",
    "confidence": "ML Regressor",
    "badgeClass": "badge-yield",
    "dosageAdvice": "Estimated farm production: 6.85 Tonnes on 2.50 ha (2.74 Tonnes/ha)",
    "npkSummary": "Area: 2.5 ha | Year: 2024",
    "climateSummary": "State: Maharashtra | Season: Kharif",
    "soilHealth": "Regional Agronomic Model Fit",
    "detailedNotes": "Historical yield estimate for Rice in Maharashtra (Kharif season). This estimate is based on historical state/district agricultural patterns, not a guarantee.",
    "inputs": {
      "state_name": "Maharashtra",
      "season": "Kharif",
      "crop": "Rice",
      "crop_year": 2024,
      "area": 2.5,
      "mode": "yield"
    }
  }
  ```

---

### 5. Model Option Sets
- **Endpoint**: `GET /api/options`
- **Description**: Returns valid categorical dropdown option sets for fertilizer and crop yield inputs (districts, soil colors, crops, states, seasons).

---

## Getting Started

### 1. Environment Setup
Activate the virtual environment located in `Backend/.venv`:

#### Windows (PowerShell):
```powershell
.\Backend\.venv\Scripts\Activate.ps1
```

#### Linux / macOS:
```bash
source Backend/.venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r Backend/requirements.txt
```

### 3. Run Flask Backend Server
```bash
python Backend/app.py
```
The server will launch at `http://127.0.0.1:5000`.
