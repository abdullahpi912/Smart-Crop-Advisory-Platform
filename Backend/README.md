# Smart Crop Advisory Platform - Flask Backend API

This is the lightweight Flask backend service serving crop recommendations powered by the trained machine learning model (`Model/crop_recommendation_model.pkl`).

## API Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verifies backend availability and ML model loading state.
- **Example Response**:
  ```json
  {
    "status": "healthy",
    "model_loaded": true,
    "model_path": "e:\\Intern\\Smart-Crop-Advisory-Platform\\Model\\crop_recommendation_model.pkl",
    "error": null
  }
  ```

### 2. Predict Crop Recommendation
- **Endpoint**: `POST /api/predict`
- **Description**: Accepts soil and weather metrics, returning top ML crop prediction and formatted metadata for the frontend.
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
    "recommendedItem": "Paddy Rice 🌾",
    "crop": "rice",
    "category": "Grains & Cereals",
    "confidence": "96.4%",
    "detailedNotes": "Ideal high-moisture wetland grain crop matching your nitrogen and rainfall conditions.",
    "soilHealth": "Optimal Balanced Soil",
    "npkSummary": "N: 90.0 | P: 42.0 | K: 43.0",
    "climateSummary": "pH 6.5 | 202.0 mm | 26.5°C",
    "dosageAdvice": "Optimal yield predicted under current field conditions",
    "timestamp": "2026-08-03 18:15",
    "logId": "#LOG-1234",
    "type": "Crop Match (ML Model)"
  }
  ```

## Getting Started

### 1. Environment Setup
Activate the virtual environment located in `Backend/.venv`:

#### Windows (PowerShell):
```powershell
.\Backend\.venv\Scripts\Activate.ps1
```

#### Windows (Command Prompt):
```cmd
Backend\.venv\Scripts\activate.bat
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
