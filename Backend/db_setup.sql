-- =========================================================================
-- AgriSense Least-Privilege MySQL User Setup
-- Run as root/admin user once in MySQL to create a scoped application user.
-- =========================================================================

-- 1. Create the dedicated application database if not already present
CREATE DATABASE IF NOT EXISTS agrisense_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 2. Create the scoped application user (replace 'StrongAppPasswordHere!123' with a secure secret)
CREATE USER IF NOT EXISTS 'agrisense_app'@'%' IDENTIFIED BY 'StrongAppPasswordHere!123';

-- 3. Grant ONLY Data Manipulation Privileges on the agrisense_db database (no administrative or global privileges)
GRANT SELECT, INSERT, UPDATE, DELETE ON agrisense_db.* TO 'agrisense_app'@'%';

-- 4. Apply privilege changes
FLUSH PRIVILEGES;
