# Session Authentication & Login Documentation (AgriSense Platform)

## Overview
This document details the implementation of **Flask Session Authentication & Protected Routes** for the **Smart-Crop-Advisory-Platform (AgriSense)**.

---

## 1. Features Implemented

1. **Flask Secret Key & Cookie Sessions**:
   - Configured `app.secret_key` via environment variable `SECRET_KEY` (with default fallback for local dev).
   - Configured `CORS(app, supports_credentials=True)` to permit cookie transmission between React frontend and Flask API.

2. **Login Endpoint (`POST /login`)**:
   - Accepts JSON payload (`username` or `email`, `password`).
   - Validates existence of user in `users` MySQL table.
   - Verifies hashed passwords using `werkzeug.security.check_password_hash()`.
   - On success, populates `session["user_id"]` and `session["username"]` and returns HTTP `200 OK`.
   - On failure, returns HTTP `401 Unauthorized`.

3. **Logout Endpoint (`POST /logout`)**:
   - Executes `session.clear()`.
   - Returns HTTP `200 OK` with `{"message": "Logged out successfully"}`.

4. **Protected Route (`GET /profile`) with `@login_required`**:
   - Custom decorator `@login_required` checks if `"user_id"` exists in `session`.
   - If unauthenticated, returns HTTP `401 Unauthorized` with `{"error": "Please log in first"}`.
   - If authenticated, fetches and returns user profile details from MySQL.

5. **Frontend Login Page Integration (`Login.jsx`)**:
   - Connected login form to `POST /login` with `credentials: 'include'`.
   - Displays success/error toast notifications.

---

## 2. API Specifications

### `POST /login`
**Request Body:**
```json
{
    "username": "agrisense_user1",
    "password": "AgriSense@123"
}
```
**Success Response (`200 OK`):**
```json
{
    "message": "Welcome back, agrisense_user1",
    "user_id": 1,
    "username": "agrisense_user1"
}
```
**Failure Response (`401 Unauthorized`):**
```json
{
    "error": "Invalid username or password"
}
```

---

### `POST /logout`
**Response (`200 OK`):**
```json
{
    "message": "Logged out successfully"
}
```

---

### `GET /profile` (Protected Route)
**Authenticated Response (`200 OK`):**
```json
{
    "status": "success",
    "user": {
        "id": 1,
        "username": "agrisense_user1",
        "fullname": "Test Farmer One",
        "email": "agrisense.user1@example.com",
        "phone": "+91 9000000001",
        "region": "Chennai",
        "soil_type": "loamy",
        "created_at": "2026-08-09 09:40:00"
    }
}
```

**Unauthenticated Response (`401 Unauthorized`):**
```json
{
    "error": "Please log in first"
}
```

---

## 3. Postman 4-Step Testing Guide

Import `Backend/AgriSense_Postman_Collection.json` into Postman and execute the requests sequentially:

1. **Step 1: Login**
   - Execute `POST http://localhost:5000/login`
   - **Expected Status**: `200 OK`
   - **Result**: Postman automatically stores the `session` cookie.

2. **Step 2: Access Protected Route**
   - Execute `GET http://localhost:5000/profile`
   - **Expected Status**: `200 OK`
   - **Result**: Returns profile payload for logged in user.

3. **Step 3: Logout**
   - Execute `POST http://localhost:5000/logout`
   - **Expected Status**: `200 OK`
   - **Result**: Clears session cookie on backend.

4. **Step 4: Access Protected Route Again**
   - Execute `GET http://localhost:5000/profile`
   - **Expected Status**: `401 Unauthorized`
   - **Result**: `{"error": "Please log in first"}` (Blocked access confirmed).

---

## 4. Automated Testing

Run the automated test suite:

```powershell
python Backend/test_http_methods.py
```

All unit test cases run synchronously and output `OK`.

