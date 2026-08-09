# AgriSense API Routes Plan — Individual Backend Project

This document contains the complete API route design for the **AgriSense Smart Crop Advisory Platform**.

---

## API Routes Overview

| Method | Route | Description / Purpose | Protected (`@login_required`) | Calls ML Model? | Implementation Status |
|---|---|---|---|---|---|
| **GET** | `/` | Root API server status & health check | No | No | Implemented |
| **GET** | `/api/health` | Service & MySQL database connectivity check | No | No | Implemented |
| **POST** | `/register` | User registration & Werkzeug password hashing | No | No | Implemented |
| **POST** | `/login` | User authentication & Flask session establishment | No | No | Implemented |
| **POST** | `/logout` | User logout & Flask session destruction | No | No | Implemented |
| **GET** | `/profile` | Fetch authenticated user profile | **Yes** | No | Implemented |
| **GET** | `/api/crops` | Retrieve crop metadata catalog | No | No | Implemented |
| **POST** | `/api/predict` | Anonymous / public crop recommendation prediction | No | **Yes** | Implemented |
| **GET** | `/api/logs` | Retrieve general advisory logs history | No | No | Implemented |
| **GET** | `/api/logs/<id>` | Retrieve single general advisory log by ID | No | No | Implemented |
| **POST** | `/api/logs` | Create custom general advisory log entry | No | No | Implemented |
| **PUT** | `/api/logs/<id>` | Update general advisory log entry | No | No | Implemented |
| **DELETE** | `/api/logs/<id>` | Delete single general advisory log entry | No | No | Implemented |
| **DELETE** | `/api/logs` | Clear all general advisory logs | No | No | Implemented |
| **POST** | `/api/recommendations` | Submit soil parameters for ML model prediction linked to logged-in user | **Yes** | **Yes** | Implemented |
| **GET** | `/api/recommendations` | Retrieve user-specific crop recommendation history | **Yes** | No | Implemented |
| **GET** | `/api/recommendations/<id>` | Retrieve single recommendation record for user | **Yes** | No | Implemented |
| **PUT** | `/api/recommendations/<id>` | Update user recommendation record notes / field feedback | **Yes** | No | Implemented |
| **DELETE** | `/api/recommendations/<id>` | Delete single user recommendation record | **Yes** | No | Implemented |
| **GET** | `/api/farms` | List user farm plot profiles | **Yes** | No | Implemented |
| **POST** | `/api/farms` | Create new farm plot profile for user | **Yes** | No | Implemented |

---

## Key Design Principles

1. **Authentication Boundary**:
   - Public routes (`/`, `/api/health`, `/register`, `/login`, `/api/crops`, `/api/predict`) allow anonymous access for platform overview and quick predictions.
   - User-bound routes (`/profile`, `/api/recommendations/*`, `/api/farms/*`) require active Flask session (`@login_required`).

2. **Machine Learning Integration**:
   - Both `/api/predict` and `POST /api/recommendations` invoke the Agronomic Rule Engine / ML recommendation algorithm.

3. **Data Isolation**:
   - User recommendation history and farm profiles are scoped by `user_id` stored in session.

