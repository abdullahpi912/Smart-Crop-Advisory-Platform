# Smart Crop Advisory Platform (AgriSense)

**AgriSense** is a full-stack data-backed agricultural advisory platform that recommends suitable crops based on soil nutrient levels (N, P, K) and environmental weather metrics (temperature, humidity, pH, rainfall). It features a React frontend, a Flask REST API backend with MySQL persistent storage, Werkzeug password hashing, Flask session-based authentication, and a trained scikit-learn Machine Learning model.

---

## 🚀 What It Does

1. **Farmer User Accounts & Security**:
   - Secure farm profile registration using Werkzeug `generate_password_hash()`. Passwords are **never** stored in plaintext.
   - Flask session cookie authentication with `/login`, `/logout`, and `@login_required` protected routes.
2. **Machine Learning Crop Predictions**:
   - Serves predictions from a trained Random Forest model (`Model/crop_recommendation_model.pkl`) evaluating 7 soil/climate features (`N`, `P`, `K`, `temperature`, `humidity`, `ph`, `rainfall`) across 22 crop classes.
3. **Advisory History & Plot Management**:
   - Persistent MySQL storage for general advisory logs (`advisory_logs`), user-bound ML crop recommendations (`recommendations`), and farmer plot profiles (`farm_profiles`).

---

## 🛠 Tech Stack

- **Frontend**: React, Vite, React Router, Vanilla CSS, FontAwesome Icons
- **Backend**: Python 3, Flask, Flask-CORS, Werkzeug Security
- **Database**: MySQL (`agrisense_db`), MySQL Connector/Python
- **Machine Learning**: scikit-learn, joblib, NumPy, Pandas (Random Forest Classifier)
- **Testing**: Python `unittest`, Postman v2.1 API Collections

---

## 📁 Project Structure

```text
Smart-Crop-Advisory-Platform/
├── Backend/
│   ├── app.py                             # Main Flask REST API application
│   ├── db.py                              # MySQL database connection helper
│   ├── schema.sql                         # MySQL database schema (logs, users, recommendations, farm_profiles)
│   ├── routes_plan.md                     # Master API routes plan
│   ├── requirements.txt                   # Python backend dependencies
│   ├── test_http_methods.py               # Automated unittest test suite (17 test cases)
│   ├── AgriSense_Postman_Collection.json  # Postman API collection for all 21 endpoints
│   ├── AUTHENTICATION.md                  # User registration & password hashing documentation
│   ├── SESSIONS_LOGIN.md                  # Flask session authentication documentation
│   ├── KICKOFF.md                         # Backend scaffold & route plan documentation
│   └── FINAL_SUBMISSION.md                # Final project implementation & verification report
├── Frontend/
│   ├── src/                               # React source components & pages
│   │   ├── pages/                         # Page components (Home, Recommend, Dashboard, Login, Register, etc.)
│   │   ├── components/                    # Shared UI components (Navbar, Footer, Toast)
│   │   └── App.jsx                        # Application routing & toast state
│   ├── index.html                         # HTML entry point
│   └── vite.config.js                     # Vite build configuration
├── Dataset/
│   └── Crop_recommendation.csv            # 2,200 row soil/climate dataset
├── Model/
│   └── crop_recommendation_model.pkl      # Trained Random Forest ML model
├── Notebook/
│   └── Crop_Recommendation_Model.ipynb    # Jupyter notebook for ML model training & evaluation
├── .gitignore                             # Excludes node_modules, .venv, __pycache__, .env, etc.
└── README.md                              # Project documentation
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

Optionally set environment variables or use the default local configuration:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=agrisense_db
SECRET_KEY=agrisense-secret-key-session-auth
```

### 4. Run Flask Backend Server
```powershell
python Backend/app.py
```
The backend API runs at `http://127.0.0.1:5000`.

### 5. Frontend Setup (React / Vite)
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
| **GET** | `/api/health` | Backend & MySQL database status check | No | No |
| **POST** | `/register` | User registration & Werkzeug password hashing | No | No |
| **POST** | `/login` | User login & Flask session establishment | No | No |
| **POST** | `/logout` | User logout & Flask session clear | No | No |
| **GET** | `/profile` | Fetch authenticated user profile details | **Yes** | No |
| **GET** | `/api/crops` | Retrieve crop metadata catalog | No | No |
| **POST** | `/api/predict` | Anonymous crop prediction | No | **Yes** |
| **GET** | `/api/logs` | Retrieve general advisory logs | No | No |
| **GET** | `/api/logs/<id>` | Retrieve single advisory log by ID | No | No |
| **POST** | `/api/logs` | Create custom advisory log entry | No | No |
| **PUT** | `/api/logs/<id>` | Update advisory log entry | No | No |
| **DELETE** | `/api/logs/<id>` | Delete single advisory log entry | No | No |
| **DELETE** | `/api/logs` | Clear all general advisory logs | No | No |
| **POST** | `/api/recommendations` | Submit soil parameters for ML prediction & link to user | **Yes** | **Yes** |
| **GET** | `/api/recommendations` | Retrieve user-specific recommendation history | **Yes** | No |
| **GET** | `/api/recommendations/<id>` | Retrieve single recommendation record for user | **Yes** | No |
| **PUT** | `/api/recommendations/<id>` | Update recommendation notes / feedback | **Yes** | No |
| **DELETE** | `/api/recommendations/<id>` | Delete user recommendation record | **Yes** | No |
| **GET** | `/api/farms` | List user farm plot profiles | **Yes** | No |
| **POST** | `/api/farms` | Create farm plot profile for user | **Yes** | No |

---

## 🔐 Security & Authentication

- **Password Security**: Passwords are formatted using Werkzeug `generate_password_hash()` before database insertion. Plaintext passwords and hashes are never returned by APIs or logged.
- **Session Authentication**: Active user state is managed via signed Flask cookie sessions (`session["user_id"]`). `POST /logout` executes `session.clear()`, causing subsequent protected route requests to return HTTP `401 Unauthorized`.
- **Environment Isolation**: `.gitignore` strictly excludes `.env`, `.venv/`, `node_modules/`, and `__pycache__/`.

---

## 🤖 Machine Learning Model Details

- **Model Type**: Random Forest Classifier (tuned via GridSearchCV).
- **Features**: `N` (Nitrogen), `P` (Phosphorus), `K` (Potassium), `temperature` (°C), `humidity` (%), `ph` (scale), `rainfall` (mm).
- **Classes**: 22 crops (rice, maize, chickpea, kidneybeans, pigeonpeas, mothbeans, mungbean, blackgram, lentil, pomegranate, banana, mango, grapes, watermelon, muskmelon, apple, orange, papaya, coconut, cotton, jute, coffee).
- **File**: `Model/crop_recommendation_model.pkl`.

---

## 🧪 Testing

### Automated Unit Test Suite
Run the 17 automated unittest test cases:
```powershell
python Backend/test_http_methods.py
```
**Expected Result**: `Ran 17 tests ... OK`.

### Postman Testing
Import `Backend/AgriSense_Postman_Collection.json` into Postman to test all 21 API endpoints.

