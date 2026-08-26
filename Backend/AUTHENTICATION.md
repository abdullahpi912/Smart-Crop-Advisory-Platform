# User Registration & Password Hashing Documentation (Cropling Platform)

## Overview
This document covers the implementation of **User Registration & Password Hashing** for the **Cropling Platform**.

---

## 1. Features Implemented

1. **MySQL Users Database Table**:
   - Created `users` table storing user accounts.
   - Strictly stores `password_hash` generated via Werkzeug. Plaintext passwords are **never** stored.

2. **Flask Registration Endpoint (`POST /register`)**:
   - Accepts JSON registration payload (`username`, `password`, `fullname`, `email`, `phone`, `region`, `soilType`).
   - Validates required fields (`username` and `password`).
   - Hashes passwords using `werkzeug.security.generate_password_hash()`.
   - Prevents duplicate username / email registration by returning `400 Bad Request`.
   - Returns `201 Created` with `user_id` and `username`.

3. **Frontend Integration (`Register.jsx`)**:
   - Integrated form state with `POST /register` endpoint.
   - Displays success/error toast notifications cleanly without storing plaintext passwords in browser storage.

---

## 2. MySQL Schema (`users` Table)

```sql
USE agrisense_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fullname VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(30),
    region VARCHAR(100),
    soil_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Register API Endpoint (`POST /register`)

### Request Body (JSON)
```json
{
    "username": "agrisense_user1",
    "password": "AgriSense@123",
    "fullname": "Test Farmer One",
    "email": "agrisense.user1@example.com",
    "phone": "+91 9000000001",
    "region": "Chennai",
    "soilType": "loamy"
}
```

### Successful Response (`201 Created`)
```json
{
    "message": "User registered successfully",
    "user_id": 1,
    "username": "agrisense_user1"
}
```

### Error Responses (`400 Bad Request`)
- **Missing Required Fields**:
  ```json
  { "error": "Username and password are required" }
  ```
- **Duplicate User**:
  ```json
  { "error": "Username or email already exists" }
  ```

---

## 4. How to Start and Run the Backend

Navigate to the `Backend` directory and start the Flask server:

```powershell
# Option 1: Run batch script
.\run_backend.bat

# Option 2: Direct Python command
python app.py
```

---

## 5. Postman Collection & Testing Guide

Import the provided Postman collection file:
`Backend/Cropling_Postman_Collection.json` into Postman.

### Test Requests Included:
1. **Test 1**: Register `agrisense_user1` (`201 Created`)
2. **Test 2**: Register `agrisense_user2` (`201 Created`)
3. **Test 3**: Register `agrisense_user3` (`201 Created`)
4. **Test 4**: Register Duplicate `agrisense_user1` (`400 Bad Request`)

---

## 6. How to Verify Password Hashes in MySQL

Run the following SQL query directly in MySQL Workbench or CLI:

```sql
USE agrisense_db;

SELECT
    id,
    username,
    password_hash,
    fullname,
    email,
    created_at
FROM users
ORDER BY id;
```

### Verification Result:
- `password_hash` column contains Werkzeug hash strings like `scrypt:32768:8:1$...` or `pbkdf2:sha256:...`.
- `AgriSense@123`, `AgriSense@456`, `AgriSense@789` are **NOT** stored anywhere in the database.

