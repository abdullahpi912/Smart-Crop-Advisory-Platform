SET NAMES utf8mb4;
-- =========================================================================
-- Cropling Database Schema & Seed Data
-- =========================================================================

-- 1. Users table (Farmer accounts)
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

-- 2. Advisory logs table (Predictions & agronomic records with user isolation)
CREATE TABLE IF NOT EXISTS advisory_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NULL,
    timestamp VARCHAR(40),
    npk_summary VARCHAR(100),
    climate_summary VARCHAR(100),
    type VARCHAR(100),
    crop VARCHAR(50),
    badge_class VARCHAR(50),
    recommended_item VARCHAR(150),
    category VARCHAR(100),
    confidence VARCHAR(20),
    dosage_advice VARCHAR(255),
    soil_health VARCHAR(100),
    detailed_notes TEXT,
    inputs_json TEXT,
    last_updated VARCHAR(40),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Recommendations table (User-specific crop advisory records)
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

-- 4. Farm profiles table (Farmer plot details)
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

-- 5. Admins table (Administrative accounts, managed via create_admin.py CLI only)
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    favorite_number_hash VARCHAR(255) NOT NULL,
    security_phrase_hash VARCHAR(255) NOT NULL,
    security_phrase_hint VARCHAR(100) NOT NULL,  -- the displayed hint only, e.g. "I am fine" — never the real answer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Login logs table (Audit trail for farmer and admin login attempts)
CREATE TABLE IF NOT EXISTS login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_name VARCHAR(50) NOT NULL,
    account_type ENUM('farmer', 'admin') NOT NULL,
    success BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Admin action logs table (Audit trail for administrative account operations)
CREATE TABLE IF NOT EXISTS admin_action_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_username VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_username VARCHAR(50),
    details TEXT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
