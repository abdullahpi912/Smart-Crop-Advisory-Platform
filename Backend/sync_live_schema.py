"""
Synchronize all schema tables and columns with the live Aiven database.
"""
import sys
from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))
load_dotenv(dotenv_path=backend_dir / '.env')

from db import get_connection

def sync_schema():
    print("Connecting to live Aiven MySQL database to synchronize tables...")
    conn = get_connection()
    cursor = conn.cursor()

    # 1. users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            fullname VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            phone VARCHAR(20),
            region VARCHAR(100),
            soil_type VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 2. advisory_logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS advisory_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            log_id VARCHAR(50) UNIQUE NOT NULL,
            user_id INT NULL,
            timestamp VARCHAR(50) NOT NULL,
            npk_summary VARCHAR(100),
            climate_summary VARCHAR(100),
            type VARCHAR(50),
            crop VARCHAR(100),
            badge_class VARCHAR(50),
            recommended_item VARCHAR(100),
            category VARCHAR(100),
            confidence VARCHAR(20),
            dosage_advice TEXT,
            soil_health VARCHAR(100),
            detailed_notes TEXT,
            inputs_json TEXT,
            last_updated VARCHAR(50) NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    """)

    # Check advisory_logs user_id column migration
    try:
        cursor.execute("""
            SELECT COLUMN_NAME FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'advisory_logs' AND COLUMN_NAME = 'user_id'
        """)
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE advisory_logs ADD COLUMN user_id INT NULL AFTER log_id")
            cursor.execute("ALTER TABLE advisory_logs ADD CONSTRAINT fk_adv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE")
            print(" -> Added user_id foreign key column to advisory_logs.")
    except Exception as e:
        print(f"Notice: {e}")

    # 3. recommendations table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            crop_recommended VARCHAR(50),
            fertilizer_recommended VARCHAR(100),
            yield_predicted FLOAT,
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
    """)

    # 4. farm_profiles table
    cursor.execute("""
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
    """)

    # 5. admins table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            favorite_number_hash VARCHAR(255) NOT NULL,
            security_phrase_hash VARCHAR(255) NOT NULL,
            security_phrase_hint VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Admins column migrations
    try:
        cursor.execute("DESCRIBE admins")
        admin_cols = [row[0] if isinstance(row, tuple) else row['Field'] for row in cursor.fetchall()]
        if 'favorite_number' in admin_cols:
            cursor.execute("ALTER TABLE admins DROP COLUMN favorite_number")
            print(" -> Dropped legacy plaintext favorite_number column from admins.")
        if 'favorite_number_hash' not in admin_cols:
            cursor.execute("ALTER TABLE admins ADD COLUMN favorite_number_hash VARCHAR(255) NOT NULL DEFAULT ''")
            print(" -> Added favorite_number_hash column to admins.")
        if 'security_phrase_hash' not in admin_cols:
            cursor.execute("ALTER TABLE admins ADD COLUMN security_phrase_hash VARCHAR(255) NOT NULL DEFAULT ''")
            print(" -> Added security_phrase_hash column to admins.")
        if 'security_phrase_hint' not in admin_cols:
            cursor.execute("ALTER TABLE admins ADD COLUMN security_phrase_hint VARCHAR(100) NOT NULL DEFAULT ''")
            print(" -> Added security_phrase_hint column to admins.")
    except Exception as e:
        print(f"Notice (admins schema sync): {e}")

    # 6. login_logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS login_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            account_name VARCHAR(50) NOT NULL,
            account_type ENUM('farmer', 'admin') NOT NULL,
            success BOOLEAN NOT NULL,
            attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 7. admin_action_logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_action_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_username VARCHAR(50) NOT NULL,
            action_type VARCHAR(50) NOT NULL,
            target_username VARCHAR(50),
            details TEXT,
            performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("[SUCCESS] All tables and columns synchronized with live Aiven MySQL database.")

if __name__ == '__main__':
    sync_schema()
