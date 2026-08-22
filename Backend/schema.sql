SET NAMES utf8mb4;
-- =========================================================================
-- AgriSense Database Schema & Seed Data
-- Run this against your target database (connect first, e.g.:
--   mysql -h <host> -P <port> -u <user> -p --ssl-ca=<ca.pem path> <database_name>
-- ). This file no longer creates its own database — it assumes you're
-- already connected to the correct one (local: agrisense_db, Aiven: defaultdb).
-- =========================================================================

CREATE TABLE IF NOT EXISTS advisory_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_id VARCHAR(20) UNIQUE NOT NULL,
    timestamp VARCHAR(30),
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
    last_updated VARCHAR(30)
);

-- Seed rows, carried over from the old in-memory demo data.
INSERT INTO advisory_logs
    (log_id, timestamp, npk_summary, climate_summary, type, crop, badge_class,
     recommended_item, category, confidence, dosage_advice, soil_health, detailed_notes, inputs_json)
VALUES
    ('#LOG-8942', '2026-07-24 14:30', 'N: 90.0 | P: 42.0 | K: 43.0', 'pH 6.5 | 202.0 mm | 26.5°C',
     'Crop Match (Agronomic Rule Engine)', 'rice', 'badge-crop', 'Paddy Rice 🌾', 'Grains & Cereals',
     '99.2%', 'Optimal yield predicted under current field conditions', 'Optimal Balanced Soil',
     'Ideal high-moisture wetland grain crop matching your nitrogen and rainfall conditions.',
     '{"nitrogen": 90, "phosphorus": 42, "potassium": 43, "temperature": 26.5, "humidity": 80, "ph": 6.5, "rainfall": 202}'),

    ('#LOG-8941', '2026-07-22 09:15', 'N: 100.0 | P: 20.0 | K: 30.0', 'pH 5.8 | 1600.0 mm | 25.0°C',
     'Crop Match (Agronomic Rule Engine)', 'coffee', 'badge-crop', 'Highland Coffee ☕', 'Cash & Plantation Crops',
     '97.8%', 'High value perennial crop thriving in acidic highland soil', 'Slightly Acidic Soil',
     'High-value perennial crop thriving in humid highland climates and acidic soils.',
     '{"nitrogen": 100, "phosphorus": 20, "potassium": 30, "temperature": 25.0, "humidity": 75, "ph": 5.8, "rainfall": 1600}'),

    ('#LOG-8938', '2026-07-19 16:45', 'N: 35.0 | P: 40.0 | K: 35.0', 'pH 6.2 | 180.0 mm | 24.0°C',
     'Fertilizer Match', 'urea', 'badge-fertilizer', 'Urea (46% Nitrogen Boost)', 'Soil Nutrient Supplement',
     '98.8%', 'Apply 50kg/hectare split into two split top-dressings', 'Optimal Balanced Soil',
     'Nitrogen deficient soil requires targeted urea top dressing.',
     '{"nitrogen": 35, "phosphorus": 40, "potassium": 35, "temperature": 24.0, "humidity": 70, "ph": 6.2, "rainfall": 180}');

-- User registration and authentication table.
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

-- User-specific crop recommendations table.
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

-- Farmer plot profiles table.
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


