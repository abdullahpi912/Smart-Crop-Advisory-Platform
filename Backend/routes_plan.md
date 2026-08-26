# Cropling API Routes Plan — Backend Service Architecture

This document contains the complete API route design and implementation status for the **Cropling Platform**.

---

## API Routes Overview

| Method | Route | Description / Purpose | Protected (`@login_required`) | Calls ML Model? | Implementation Status |
|---|---|---|---|---|---|
| **GET** | `/` | Root API server status & health check | No | No | Implemented |
| **GET** | `/api/health` | Service, MySQL database connectivity & 3-model status check | No | No | Implemented |
| **GET** | `/api/options` | Retrieve valid categorical dropdown options (districts, soil colors, crops, states, seasons) | No | No | Implemented |
| **POST** | `/register` | User registration & Werkzeug password hashing | No | No | Implemented |
| **POST** | `/login` | User authentication & Flask session establishment | No | No | Implemented |
| **POST** | `/logout` | User logout & Flask session destruction | No | No | Implemented |
| **GET** | `/profile` | Fetch authenticated user profile | **Yes** | No | Implemented |
| **PUT** | `/profile` | Update authenticated farmer profile details | **Yes** | No | Implemented |
| **PUT** | `/api/user/change-password` | Change farmer password after verifying current password | **Yes** | No | Implemented |
| **DELETE** | `/api/user/account` | Delete farmer account and cascaded records | **Yes** | No | Implemented |
| **GET** | `/api/crops` | Retrieve crop metadata catalog | No | No | Implemented |
| **POST** | `/api/predict` | Crop recommendation prediction using Random Forest | No | **Yes (Random Forest)** | Implemented |
| **POST** | `/api/predict/fertilizer` | Fertilizer recommendation & top-3 probability shortlist using Decision Tree | No | **Yes (Decision Tree)** | Implemented |
| **POST** | `/api/predict/yield` | Crop harvest production forecast in tonnes using XGBoost Regressor | No | **Yes (XGBoost Regressor)** | Implemented |
| **GET** | `/api/logs` | Retrieve authenticated farmer's advisory logs history | **Yes** | No | Implemented |
| **GET** | `/api/logs/<id>` | Retrieve single advisory log record by ID | **Yes** | No | Implemented |
| **POST** | `/api/logs` | Create custom advisory log entry | **Yes** | No | Implemented |
| **PUT** | `/api/logs/<id>` | Update advisory log entry | **Yes** | No | Implemented |
| **DELETE** | `/api/logs/<id>` | Delete single advisory log entry | **Yes** | No | Implemented |
| **DELETE** | `/api/logs` | Clear all advisory logs for authenticated farmer | **Yes** | No | Implemented |
| **POST** | `/api/recommendations` | Submit soil parameters for ML model prediction linked to logged-in user | **Yes** | **Yes (Random Forest)** | Implemented |
| **GET** | `/api/recommendations` | Retrieve user-specific crop recommendation history | **Yes** | No | Implemented |
| **GET** | `/api/recommendations/<id>` | Retrieve single recommendation record for user | **Yes** | No | Implemented |
| **PUT** | `/api/recommendations/<id>` | Update user recommendation record notes / field feedback | **Yes** | No | Implemented |
| **DELETE** | `/api/recommendations/<id>` | Delete single user recommendation record | **Yes** | No | Implemented |
| **GET** | `/api/farms` | List user farm plot profiles | **Yes** | No | Implemented |
| **POST** | `/api/farms` | Create new farm plot profile for user | **Yes** | No | Implemented |
| **GET** | `/api/admin/login-hint` | Retrieve visible security phrase hint for admin username (anti-enumeration) | No | No | Implemented |
| **POST** | `/admin/login` | 4-Factor Administrator login | No | No | Implemented |
| **POST** | `/admin/logout` | Terminate Administrator session | No | No | Implemented |
| **GET** | `/api/admin/session-check` | Check active admin session status | No | No | Implemented |
| **GET** | `/api/admin/login-logs` | View login audit trail (farmer and admin attempts) | **Admin** | No | Implemented |
| **GET** | `/api/admin/prediction-logs` | View global telemetry prediction logs | **Admin** | No | Implemented |
| **GET** | `/api/admin/users` | List all farmer accounts | **Admin** | No | Implemented |
| **POST** | `/api/admin/users` | Administrator create farmer account | **Admin** | No | Implemented |
| **PUT** | `/api/admin/users/<id>` | Administrator update farmer account / reset password | **Admin** | No | Implemented |
| **DELETE** | `/api/admin/users/<id>` | Administrator delete farmer account | **Admin** | No | Implemented |

---

## Key Design Principles

1. **Authentication Boundary**:
   - Public prediction routes (`/api/predict`, `/api/predict/fertilizer`, `/api/predict/yield`, `/api/options`, `/api/crops`) allow rapid exploratory simulations.
   - User-bound routes (`/profile`, `/api/logs/*`, `/api/recommendations/*`, `/api/farms/*`) require active Flask session (`@login_required`) with per-farmer data isolation.
   - Administrative routes (`/api/admin/*`) require 4-factor authenticated operator session (`@admin_required`).

2. **Machine Learning Pipeline Integration**:
   - **Model 1 (Crop Recommendation)**: Random Forest Classifier trained on 7 environmental metrics over 22 crop classes.
   - **Model 2 (Fertilizer Recommendation)**: Decision Tree Classifier with LabelEncoder predicting primary nutrient formulations and top-3 shortlists.
   - **Model 3 (Crop Yield Prediction)**: XGBoost Regressor Pipeline with logarithmic `Area` scaling forecasting yield in tonnes.

3. **Data Isolation & Audit Trail**:
   - Farmer logs and profiles are scoped by `session["user_id"]` with MySQL `ON DELETE CASCADE`.
   - Admin action audit trails and login attempt telemetry are logged without storing raw credentials.
