# Backend Project Scaffold & Architecture (AgriSense Platform)

## Overview
This document details the scaffolding, API route design, and database schema plan for the **Smart-Crop-Advisory-Platform (AgriSense)**.

---

## 1. Features Implemented in Backend Scaffold

1. **API Routes Plan (`routes_plan.md`)**:
   - Comprehensive API endpoint map tailored to AgriSense.
   - Categorized by method, route, purpose, session protection (`@login_required`), ML model integration, and implementation status.

2. **Database Schema Plan (`schema.sql`)**:
   - Preserves `advisory_logs` and `users` tables.
   - Appended SQL table definitions for `recommendations` (user-bound soil parameter history & predictions) and `farm_profiles` (farmer land plot profiles).

3. **Running Root Health-Check Endpoint (`GET /`)**:
   - Responds with JSON payload confirming backend status (`{"status": "running", ...}`).
   - Lists available primary API endpoints.

---

## 2. API Routes Table (Summary)

| Method | Route | Purpose | Protected (`@login_required`) | Calls ML Model? | Implementation Status |
|---|---|---|---|---|---|
| **GET** | `/` | Root API health-check endpoint | No | No | Implemented |
| **GET** | `/api/health` | Backend & DB status | No | No | Implemented |
| **POST** | `/register` | User registration & Werkzeug password hashing | No | No | Implemented |
| **POST** | `/login` | User login & Flask session establishment | No | No | Implemented |
| **POST** | `/logout` | User logout & Flask session destruction | No | No | Implemented |
| **GET** | `/profile` | Fetch authenticated user profile | **Yes** | No | Implemented |
| **GET** | `/api/crops` | Retrieve crop catalog | No | No | Implemented |
| **POST** | `/api/predict` | Anonymous crop prediction | No | **Yes** | Implemented |
| **GET** | `/api/logs` | Retrieve general advisory logs | No | No | Implemented |
| **POST** | `/api/recommendations` | Submit user soil inputs for ML prediction | **Yes** | **Yes** | Implemented |
| **GET** | `/api/recommendations` | Retrieve user recommendation history | **Yes** | No | Implemented |
| **PUT** | `/api/recommendations/<id>` | Update recommendation notes / feedback | **Yes** | No | Implemented |
| **DELETE** | `/api/recommendations/<id>` | Delete user recommendation record | **Yes** | No | Implemented |
| **GET** | `/api/farms` | List user farm profiles | **Yes** | No | Implemented |
| **POST** | `/api/farms` | Add user farm profile | **Yes** | No | Implemented |

---

## 3. Database Schema (`schema.sql`)

```sql
-- Recommendations table (User-linked crop advisory records)
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rec_id VARCHAR(30) UNIQUE NOT NULL,
    user_id INT,
    crop_name VARCHAR(50) NOT NULL,
    recommended_display VARCHAR(150),
    category VARCHAR(100),
    confidence VARCHAR(20),
    nitrogen FLOAT,
    phosphorus FLOAT,
    potassium FLOAT,
    temperature FLOAT,
    humidity FLOAT,
    ph FLOAT,
    rainfall FLOAT,
    soil_health VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Farm profiles table (Farmer plot details)
CREATE TABLE IF NOT EXISTS farm_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    farm_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    area_acres FLOAT,
    soil_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 4. Root Health-Check Endpoint (`GET /`)

**Request**: `GET http://localhost:5000/`

**Response (`200 OK`)**:
```json
{
  "status": "running",
  "service": "Smart Crop Advisory Platform (AgriSense) Backend API",
  "version": "1.0.0",
  "endpoints": {
    "root": "/",
    "health": "/api/health",
    "register": "/register",
    "login": "/login",
    "logout": "/logout",
    "profile": "/profile",
    "crops": "/api/crops",
    "predict": "/api/predict",
    "logs": "/api/logs"
  }
}
```

