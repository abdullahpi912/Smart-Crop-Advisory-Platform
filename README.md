# Cropling

**Cropling** is a full-stack data-backed agricultural advisory platform that delivers three specialized machine learning advisory functions: **Crop Selection**, **Fertilizer Dosage Recommendation**, and **Crop Yield & Harvest Forecasting**. It features a modern React frontend, a production-grade Flask REST API backend with MySQL persistent storage, Werkzeug cryptographic hashing, session-based & multi-factor administrative authentication, and trained machine learning pipelines using scikit-learn and XGBoost.

---

## 🚀 What It Does

1. **Multi-Model Agricultural Advisory Engine**:
   - **Crop Selection**: Recommends optimal crops based on 7 soil nutrient and climate parameters (`N`, `P`, `K`, `temperature`, `humidity`, `pH`, `rainfall`) evaluated across 22 crop classes.
   - **Fertilizer Recommendation**: Predicts targeted fertilizer types and ranked top-3 shortlists with confidence percentages based on regional district, soil color, target crop, and soil chemistry metrics.
   - **Crop Yield Forecasting**: Predicts expected crop harvest output (in metric tonnes and tonnes/hectare) using historical regional agricultural patterns across states, seasons, crop varieties, year, and farm area.

2. **Farmer User Accounts & Per-Farmer Isolation**:
   - Farm profile registration using cryptographic Werkzeug password hashing. Passwords and secret numbers are **never** stored in plaintext.
   - Secure Flask session cookies with `/login`, `/logout`, and `@login_required` protected routes providing strict per-farmer advisory log isolation.

3. **Administrative Governance & Auditing**:
   - 4-Factor secured administrative console (Username, Master Password, Favorite Number, and Security Phrase with anti-enumeration dynamic hints).
   - Real-time audit logging for user login attempts (`login_logs`), administrative account management (`admin_action_logs`), and global prediction telemetry (`advisory_logs`).

4. **Persistent Field Log & Plot Management**:
   - Persistent MySQL storage for general advisory logs (`advisory_logs`), user-bound ML crop recommendations (`recommendations`), and farmer plot profiles (`farm_profiles`).

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Vanilla CSS, FontAwesome Icons
- **Backend**: Python 3.10+, Flask, Flask-CORS, Flask-Limiter, Werkzeug Security
- **Database**: MySQL (`agrisense_db` / Cloud Aiven MySQL), MySQL Connector/Python with connection pooling
- **Machine Learning**: 
  - **scikit-learn**: Random Forest Classifier (Crop Recommendation) & Decision Tree Classifier + LabelEncoder (Fertilizer Recommendation)
  - **XGBoost**: XGBoost Regressor Pipeline with `log1p` target transformation and `expm1` inverse decoding (Crop Yield Prediction)
  - **Data Processing**: NumPy, Pandas, Joblib
- **Testing**: Python `unittest` test suites, Postman v2.1 API Collections

---

## 📁 Project Structure

```text
Smart-Crop-Advisory-Platform/
├── Backend/
│   ├── app.py                             # Main Flask REST API application & ML inference routes
│   ├── db.py                              # MySQL connection pool & SSL configuration
│   ├── schema.sql                         # MySQL database schema (users, logs, recommendations, admins, audit)
│   ├── db_setup.sql                       # Least-privilege MySQL user setup script
│   ├── sync_live_schema.py                # Database migration and column sync utility
│   ├── create_admin.py                    # Standalone CLI admin account provisioning script
│   ├── verify_live_admin.py               # Security audit and admin verification script
│   ├── requirements.txt                   # Python backend dependencies
│   ├── test_admin_and_isolation.py        # 4-factor auth, admin CRUD & data isolation test suite
│   ├── test_http_methods.py               # HTTP REST methods verification test suite
│   ├── test_predictions.py                # Machine learning prediction integration test suite
│   ├── test_rate_limiting.py              # Rate limiting verification test suite
│   ├── test_timestamp_utc.py              # ISO 8601 UTC timestamp format test suite
│   ├── Cropling_Postman_Collection.json   # Postman API collection for all endpoints
│   ├── AUTHENTICATION.md                  # User registration & password hashing documentation
│   ├── SESSIONS_LOGIN.md                  # Flask session authentication documentation
│   ├── routes_plan.md                     # Master API routes plan & ML pipeline status
│   ├── KICKOFF.md                         # Backend scaffold & design architecture
│   └── FINAL_SUBMISSION.md                # Final platform implementation report
├── Frontend/
│   ├── src/                               # React source components & pages
│   │   ├── pages/                         # Page components (Home, Recommend, Dashboard, AdminLogin, AdminDashboard, etc.)
│   │   ├── components/                    # Shared UI components (Navbar, Footer, PresetSwitcher, ResultCard, etc.)
│   │   ├── lib/                           # Client-side helpers, formatters, and agronomic fallback engines
│   │   └── App.jsx                        # Application routing, admin guard & toast notifications
│   ├── index.html                         # HTML entry point
│   ├── package.json                       # Frontend dependencies & scripts
│   └── vite.config.js                     # Vite build configuration
├── Model/
│   ├── crop_recommendation_model.pkl      # Trained Random Forest ML model (Crop Recommendation)
│   ├── crop_yield_model.pkl               # Trained XGBoost Pipeline ML model (Crop Yield Prediction)
│   └── Fertilizer Recommendation/
│       ├── fertilizer_recommendation_model_v2.pkl  # Trained Decision Tree model
│       └── fertilizer_label_encoder_v2.pkl         # LabelEncoder mapping fertilizer classes
├── Notebook/
│   ├── Crop_Recommendation_Full_Analysis.ipynb         # Crop recommendation EDA, training & tuning
│   ├── Crop_Yield_Prediction_Full_Analysis.ipynb       # Crop yield regression modeling & validation
│   ├── Fertilizer_Recommendation_Maharashtra_Analysis.ipynb # Fertilizer classification pipeline analysis
│   └── Dataset/
│       ├── Crop_recommendation.csv        # 2,200 row soil/climate dataset (Crop Recommendation)
│       ├── Crop and fertilizer dataset.csv# Soil/district/crop dataset (Fertilizer Recommendation)
│       └── crop_production.csv            # 246,000+ row national agricultural yield dataset
├── .gitignore                             # Excludes node_modules, .venv, __pycache__, .env, etc.
└── README.md                              # Main platform documentation
```

---

## ⚙️ Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/abdullahpi912/Smart-Crop-Advisory-Platform.git
cd Smart-Crop-Advisory-Platform
```

### 2. Backend Setup (Flask & MySQL)
Navigate to the `Backend` directory and set up Python virtual environment:

```powershell
# Create & activate virtual environment
python -m venv Backend/.venv
.\Backend\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r Backend/requirements.txt
```

### 3. Database Configuration
Create the MySQL database and tables by running `Backend/schema.sql` in MySQL Workbench or MySQL CLI:

```sql
SOURCE Backend/schema.sql;
```

Configure your `.env` file in `Backend/.env`:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=agrisense_db
SECRET_KEY=your-secure-secret-key
```

### 4. Admin Account Provisioning
Provision an administrator account via the CLI tool:
```powershell
cd Backend
python create_admin.py
```

### 5. Run Flask Backend Server
```powershell
python Backend/app.py
```
The backend API runs at `http://127.0.0.1:5000`.

### 6. Frontend Setup (React / Vite)
In a separate terminal, navigate to `Frontend` and start the Vite dev server:

```powershell
cd Frontend
npm install
npm run dev
```
The React frontend runs at `http://localhost:5173`.

---

## 📡 Complete API Endpoints Table

| Method | Route | Purpose | Protected (`@login_required`) | Calls ML Model? |
|---|---|---|---|---|
| **GET** | `/` | Root API server status & health check | No | No |
| **GET** | `/api/health` | Backend, MySQL database & 3-model loader status check | No | No |
| **GET** | `/api/options` | Retrieve categorical options for fertilizer & yield models | No | No |
| **GET** | `/api/crops` | Retrieve available crop metadata catalog | No | No |
| **POST** | `/register` | User registration & Werkzeug password hashing | No | No |
| **POST** | `/login` | User login & Flask session establishment | No | No |
| **POST** | `/logout` | User logout & Flask session clear | No | No |
| **GET** | `/profile` | Fetch authenticated user profile details | **Yes** | No |
| **PUT** | `/profile` | Update authenticated farmer profile details | **Yes** | No |
| **PUT** | `/api/user/change-password` | Change farmer password after verifying old password | **Yes** | No |
| **DELETE** | `/api/user/account` | Delete farmer account and cascaded records | **Yes** | No |
| **POST** | `/api/predict` | Predict crop recommendation from soil & climate metrics | No | **Yes (Random Forest)** |
| **POST** | `/api/predict/fertilizer` | Predict fertilizer recommendation & top-3 shortlist | No | **Yes (Decision Tree)** |
| **POST** | `/api/predict/yield` | Forecast crop harvest production in tonnes & tonnes/ha | No | **Yes (XGBoost Regressor)** |
| **GET** | `/api/logs` | Retrieve authenticated farmer's advisory logs | **Yes** | No |
| **GET** | `/api/logs/<id>` | Retrieve single advisory log record by ID | **Yes** | No |
| **POST** | `/api/logs` | Create custom advisory log entry | **Yes** | No |
| **PUT** | `/api/logs/<id>` | Update advisory log entry | **Yes** | No |
| **DELETE** | `/api/logs/<id>` | Delete single advisory log record | **Yes** | No |
| **DELETE** | `/api/logs` | Clear all advisory logs for authenticated farmer | **Yes** | No |
| **POST** | `/api/recommendations` | Submit soil parameters for ML crop prediction & link to user | **Yes** | **Yes (Random Forest)** |
| **GET** | `/api/recommendations` | Retrieve user-specific recommendation history | **Yes** | No |
| **GET** | `/api/recommendations/<id>` | Retrieve single recommendation record for user | **Yes** | No |
| **PUT** | `/api/recommendations/<id>` | Update recommendation notes / feedback | **Yes** | No |
| **DELETE** | `/api/recommendations/<id>` | Delete user recommendation record | **Yes** | No |
| **GET** | `/api/farms` | List user farm plot profiles | **Yes** | No |
| **POST** | `/api/farms` | Create farm plot profile for user | **Yes** | No |
| **GET** | `/api/admin/login-hint` | Retrieve visible security phrase hint (anti-enumeration) | No | No |
| **POST** | `/admin/login` | 4-Factor Administrator login | No | No |
| **POST** | `/admin/logout` | Terminate Administrator session | No | No |
| **GET** | `/api/admin/session-check` | Check active admin session status | No | No |
| **GET** | `/api/admin/login-logs` | View login audit trail (farmer and admin attempts) | **Admin** | No |
| **GET** | `/api/admin/prediction-logs` | View global telemetry prediction logs | **Admin** | No |
| **GET** | `/api/admin/users` | List all farmer accounts | **Admin** | No |
| **POST** | `/api/admin/users` | Administrator create farmer account | **Admin** | No |
| **PUT** | `/api/admin/users/<id>` | Administrator update farmer account / reset password | **Admin** | No |
| **DELETE** | `/api/admin/users/<id>` | Administrator delete farmer account | **Admin** | No |

---

## 🤖 Machine Learning Model Details

### 1. Crop Recommendation Model
- **Algorithm**: Random Forest Classifier (tuned via GridSearchCV)
- **Features (7)**: `N` (Nitrogen), `P` (Phosphorus), `K` (Potassium), `temperature` (°C), `humidity` (%), `ph` (scale), `rainfall` (mm)
- **Target (22 Classes)**: Rice, Maize, Chickpea, Kidneybeans, Pigeonpeas, Mothbeans, Mungbean, Blackgram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee
- **Artifact**: `Model/crop_recommendation_model.pkl`
- **Serving Endpoints**: `POST /api/predict` & `POST /api/recommendations`

### 2. Fertilizer Recommendation Model
- **Algorithm**: Decision Tree Classifier with categorical `LabelEncoder`
- **Features (9)**: `District_Name`, `Soil_color`, `Crop`, `Nitrogen`, `Phosphorus`, `Potassium`, `pH`, `Rainfall`, `Temperature`
- **Target**: Fertilizer formulation (e.g., Urea, DAP, 19:19:19 NPK, MOP, 10:26:26 NPK, SSP) with top-3 probability shortlist
- **Artifacts**: `Model/Fertilizer Recommendation/fertilizer_recommendation_model_v2.pkl` & `fertilizer_label_encoder_v2.pkl`
- **Serving Endpoint**: `POST /api/predict/fertilizer`

### 3. Crop Yield Prediction Model
- **Algorithm**: XGBoost Regressor Pipeline with `FunctionTransformer(np.log1p)` transformation on `Area` and `np.expm1` inverse target decoding
- **Features (5)**: `State_Name`, `Season`, `Crop`, `Crop_Year`, `Area` (hectares)
- **Target**: Harvest yield in metric tonnes and computed tonnes/hectare
- **Artifact**: `Model/crop_yield_model.pkl`
- **Serving Endpoint**: `POST /api/predict/yield`

---

## 🗺️ Extension & Roadmap

Cropling is architected for modular expansion as new agricultural models are developed:

- **Deep Learning Expansion**: The immediate next phase introduces deep learning models, starting with **CNN-based leaf disease detection** from uploaded plant imagery.
- **Pluggable Architecture**: The backend and frontend are structured so that integrating any future model requires only:
  1. Placing the serialized model artifacts in `Model/<domain>/`.
  2. Adding a dedicated endpoint in `Backend/app.py` (e.g. `POST /api/predict/<model_name>`).
  3. Adding a new mode tab in `Frontend/src/pages/Recommend.jsx` with input schema and result cards.

---

## 🧪 Testing

### Automated Test Suites
Run the test suites using Python `unittest`:
```powershell
# Admin auth, 4-factor security & data isolation test suite
python -m unittest Backend/test_admin_and_isolation.py

# ISO 8601 UTC timestamp format test suite
python -m unittest Backend/test_timestamp_utc.py

# Rate limiting verification test suite
python -m unittest Backend/test_rate_limiting.py
```

### Postman Testing
Import `Backend/Cropling_Postman_Collection.json` into Postman to test all endpoints.
