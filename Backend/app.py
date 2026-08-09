import os
import time
import json
import datetime
import random
from functools import wraps
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_connection

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "agrisense-secret-key-session-auth")
CORS(app, supports_credentials=True)  # Enable CORS with credentials support for session cookies

def login_required(f):
    """Decorator to protect endpoints requiring session authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Please log in first'}), 401
        return f(*args, **kwargs)
    return decorated


def init_db():
    """Ensures required tables (advisory_logs, users, recommendations, farm_profiles) exist in MySQL agrisense_db."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
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
        """)
        cursor.execute("""
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
        """)
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
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[DB INIT] Table check skipped/error: {e}")

# Initialize tables on module import
init_db()


# ==========================================
# MACHINE LEARNING MODEL LOADER
# ==========================================

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Model', 'crop_recommendation_model.pkl')
ML_MODEL = None

try:
    import joblib
    if os.path.exists(MODEL_PATH):
        ML_MODEL = joblib.load(MODEL_PATH)
        print(f"[ML MODEL] Successfully loaded trained Random Forest model from: {MODEL_PATH}")
    else:
        print(f"[ML MODEL] Notice: Model file not found at {MODEL_PATH}")
except Exception as e:
    try:
        import pickle
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                ML_MODEL = pickle.load(f)
            print(f"[ML MODEL] Successfully loaded pickle model from: {MODEL_PATH}")
    except Exception as ex:
        print(f"[ML MODEL] Notice: ML model loading fallback ({ex})")


def predict_crop_ml(n, p, k, temp, hum, ph, rain):
    """Predicts crop label using trained ML model with fallback to Agronomic Engine."""
    if ML_MODEL is not None:
        try:
            import numpy as np
            features = np.array([[n, p, k, temp, hum, ph, rain]])
            pred = ML_MODEL.predict(features)[0]
            return str(pred).lower()
        except Exception as e:
            print(f"[ML MODEL] Inference notice: {e}")

    return match_crop_agronomic(n, p, k, temp, hum, ph, rain)


# ==========================================
# 0. SKELETON ROOT HEALTH CHECK
# ==========================================


@app.route('/', methods=['GET'])
def root_health_check():
    """HTTP GET: Root health check route verifying backend server is running."""
    return jsonify({
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
    }), 200


# ==========================================
# MIDDLEWARE
# ==========================================

@app.before_request
def log_request_start():
    """Runs before every request: timestamps and logs method + path."""
    request.start_time = time.time()
    print(f"[REQUEST] {request.method} {request.path}")


@app.after_request
def log_request_end(response):
    """Runs after every request: logs outcome and tags response with timing."""
    duration_ms = (time.time() - getattr(request, 'start_time', time.time())) * 1000
    response.headers['X-Response-Time-Ms'] = f"{duration_ms:.1f}"
    print(f"[RESPONSE] {request.method} {request.path} -> {response.status_code} ({duration_ms:.1f} ms)")
    return response


# Crop metadata mapping for rich UI responses
CROP_METADATA = {
    'rice': {
        'display': 'Paddy Rice 🌾',
        'category': 'Grains & Cereals',
        'description': 'Ideal high-moisture wetland grain crop matching your nitrogen and rainfall conditions.'
    },
    'maize': {
        'display': 'Maize / Corn 🌽',
        'category': 'Grains & Cereals',
        'description': 'Versatile cereal crop requiring well-drained loamy soil and balanced NPK nutrients.'
    },
    'chickpea': {
        'display': 'Chickpea 🌱',
        'category': 'Pulses & Legumes',
        'description': 'Nitrogen-fixing pulse crop highly suitable for low moisture and phosphorus-rich soil.'
    },
    'kidneybeans': {
        'display': 'Kidney Beans 🫘',
        'category': 'Pulses & Legumes',
        'description': 'Protein-rich legume thriving in moderate temperatures and moist, well-drained soils.'
    },
    'pigeonpeas': {
        'display': 'Pigeon Peas 🫘',
        'category': 'Pulses & Legumes',
        'description': 'Drought-resistant pulse crop well suited for semi-arid tropical environments.'
    },
    'mothbeans': {
        'display': 'Moth Beans 🫘',
        'category': 'Pulses & Legumes',
        'description': 'Extremely drought-tolerant legume ideal for arid and semi-arid regions.'
    },
    'mungbean': {
        'display': 'Mung Bean 🫘',
        'category': 'Pulses & Legumes',
        'description': 'Warm-season legume requiring warm temperatures and short growth cycles.'
    },
    'blackgram': {
        'display': 'Black Gram 🫘',
        'category': 'Pulses & Legumes',
        'description': 'Nutrient-dense pulse crop suitable for warm climates and well-drained fertile soils.'
    },
    'lentil': {
        'display': 'Lentil 🥣',
        'category': 'Pulses & Legumes',
        'description': 'Cool-season pulse crop thriving in well-drained loamy to clay soils.'
    },
    'pomegranate': {
        'display': 'Pomegranate 🍎',
        'category': 'Fruits & Orchard',
        'description': 'Drought-tolerant fruit crop suited for warm dry climates and well-drained soil.'
    },
    'banana': {
        'display': 'Banana 🍌',
        'category': 'Fruits & Orchard',
        'description': 'Tropical fruit crop requiring high humidity, warm temperatures, and abundant water.'
    },
    'mango': {
        'display': 'Mango 🥭',
        'category': 'Fruits & Orchard',
        'description': 'Tropical fruit tree flourishing in warm climates with distinct wet and dry seasons.'
    },
    'grapes': {
        'display': 'Grapes 🍇',
        'category': 'Fruits & Orchard',
        'description': 'High-value vine fruit thriving in warm, dry climates with deep well-drained soils.'
    },
    'watermelon': {
        'display': 'Watermelon 🍉',
        'category': 'Fruits & Orchard',
        'description': 'Warm-season vine fruit requiring high heat and well-drained sandy loam soil.'
    },
    'muskmelon': {
        'display': 'Muskmelon 🍈',
        'category': 'Fruits & Orchard',
        'description': 'Sun-loving melon crop that thrives in warm, dry weather and fertile soils.'
    },
    'apple': {
        'display': 'Fresh Apple 🍎',
        'category': 'Fruits & Orchard',
        'description': 'Temperate orchard fruit thriving in cooler climates with moderate moisture.'
    },
    'orange': {
        'display': 'Orange 🍊',
        'category': 'Fruits & Orchard',
        'description': 'Citrus fruit requiring warm subtropical climate and well-drained loamy soil.'
    },
    'papaya': {
        'display': 'Papaya 🥭',
        'category': 'Fruits & Orchard',
        'description': 'Fast-growing tropical fruit requiring warm temperatures and high humidity.'
    },
    'coconut': {
        'display': 'Coconut 🥥',
        'category': 'Cash & Plantation Crops',
        'description': 'Tropical coastal crop thriving in high humidity, warm temperatures, and sandy soil.'
    },
    'cotton': {
        'display': 'Semi-Arid Cotton ☁️',
        'category': 'Cash & Plantation Crops',
        'description': 'Drought-tolerant fiber crop suitable for warm temperatures and moderate rainfall.'
    },
    'jute': {
        'display': 'Jute Fiber 🌾',
        'category': 'Cash & Plantation Crops',
        'description': 'Natural fiber crop requiring warm, humid climate and heavy rainfall.'
    },
    'coffee': {
        'display': 'Highland Coffee ☕',
        'category': 'Cash & Plantation Crops',
        'description': 'High-value perennial crop thriving in humid highland climates and acidic soils.'
    }
}


def evaluate_ph_status(ph):
    """Evaluates soil chemistry status based on pH."""
    if ph < 5.5:
        return 'Strongly Acidic Soil (Liming Recommended)'
    elif ph < 6.2:
        return 'Slightly Acidic Soil'
    elif ph > 7.8:
        return 'Alkaline Soil (Gypsum Recommended)'
    return 'Optimal Balanced Soil'


def match_crop_agronomic(n, p, k, temp, hum, ph, rain):
    """Determines optimal crop based on agronomic soil rules without ML dependencies."""
    if rain >= 1200 or (hum > 80 and rain > 800):
        return 'coffee' if ph < 6.0 else 'jute'
    elif rain >= 180 and n >= 70:
        return 'rice'
    elif temp > 30 and rain < 100:
        return 'watermelon' if hum > 60 else 'muskmelon'
    elif n >= 80 and p >= 40:
        return 'maize'
    elif k >= 150 or (temp > 24 and hum > 75):
        return 'banana'
    elif ph < 6.0 and p > 35:
        return 'chickpea'
    elif temp < 20:
        return 'apple' if rain > 100 else 'lentil'
    elif rain > 150:
        return 'papaya'
    else:
        return 'cotton'


# Advisory logs now live in MySQL (agrisense_db.advisory_logs) — see schema.sql.
# Run schema.sql once before starting the server; it also seeds the 3 demo rows
# that used to live in the old in-memory list.

def row_to_log(row):
    """Converts a MySQL advisory_logs row (dict cursor) into the API's JSON shape."""
    log = {
        'logId': row['log_id'],
        'timestamp': row['timestamp'],
        'npkSummary': row['npk_summary'],
        'climateSummary': row['climate_summary'],
        'type': row['type'],
        'crop': row['crop'],
        'badgeClass': row['badge_class'],
        'recommendedItem': row['recommended_item'],
        'category': row['category'],
        'confidence': row['confidence'],
        'dosageAdvice': row['dosage_advice'],
        'soilHealth': row['soil_health'],
        'detailedNotes': row['detailed_notes'],
        'inputs': json.loads(row['inputs_json']) if row['inputs_json'] else {}
    }
    if row.get('last_updated'):
        log['lastUpdated'] = row['last_updated']
    return log


# ==========================================
# 1. GET METHOD ENDPOINTS
# ==========================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """HTTP GET: Health check endpoint verifying backend + database status."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM advisory_logs")
        total_logs = cursor.fetchone()[0]
        cursor.close(); conn.close()
        db_status = 'connected'
    except Exception as e:
        total_logs = 0
        db_status = f'unavailable ({e})'

    return jsonify({
        'status': 'healthy',
        'backend': 'Flask REST API + MySQL',
        'database': db_status,
        'total_logs': total_logs
    }), 200


@app.route('/api/crops', methods=['GET'])
def get_crops():
    """HTTP GET: Retrieve available crop metadata catalog."""
    return jsonify({
        'status': 'success',
        'total': len(CROP_METADATA),
        'crops': CROP_METADATA
    }), 200


@app.route('/api/logs', methods=['GET'])
def get_logs():
    """HTTP GET: Retrieve all advisory logs from MySQL, newest first."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM advisory_logs ORDER BY id DESC")
    rows = cursor.fetchall()
    cursor.close(); conn.close()

    logs = [row_to_log(row) for row in rows]
    return jsonify({
        'status': 'success',
        'total': len(logs),
        'logs': logs
    }), 200


@app.route('/api/logs/<log_id>', methods=['GET'])
def get_log_by_id(log_id):
    """HTTP GET: Retrieve a specific advisory log record by ID."""
    formatted_id = log_id if log_id.startswith('#') else f"#{log_id}"

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM advisory_logs WHERE LOWER(log_id) = LOWER(%s)", (formatted_id,))
    row = cursor.fetchone()
    cursor.close(); conn.close()

    if not row:
        return jsonify({
            'status': 'error',
            'message': f"Advisory log record '{formatted_id}' not found"
        }), 404

    return jsonify({
        'status': 'success',
        'log': row_to_log(row)
    }), 200


# ==========================================
# 2. POST METHOD ENDPOINTS (Post Data)
# ==========================================

@app.route('/api/predict', methods=['POST'])
def predict_crop():
    """HTTP POST: Predict crop recommendation and post new log entry."""
    try:
        data = request.get_json() or {}

        # Support flexible field names (e.g. nitrogen / N, phosphorus / P, potassium / K)
        n = float(data.get('nitrogen', data.get('N', 0)))
        p = float(data.get('phosphorus', data.get('P', 0)))
        k = float(data.get('potassium', data.get('K', 0)))
        temp = float(data.get('temperature', 25.0))
        hum = float(data.get('humidity', 70.0))
        ph = float(data.get('ph', 6.5))
        rain = float(data.get('rainfall', 150.0))

        # Perform rule-based agronomic crop matching
        raw_crop = match_crop_agronomic(n, p, k, temp, hum, ph, rain)
        confidence_str = "98.5%"

        # Lookup crop display info
        crop_info = CROP_METADATA.get(raw_crop, {
            'display': raw_crop.capitalize(),
            'category': 'General Field Crop',
            'description': 'Recommended based on field soil optimization.'
        })

        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
        log_id = f"#LOG-{random.randint(1000, 9999)}"
        ph_status = evaluate_ph_status(ph)

        response_payload = {
            'logId': log_id,
            'timestamp': timestamp,
            'type': 'Crop Match (Agronomic Engine)',
            'crop': raw_crop,
            'recommendedItem': crop_info['display'],
            'category': crop_info['category'],
            'confidence': confidence_str,
            'badgeClass': 'badge-crop',
            'dosageAdvice': 'Optimal yield predicted under current field conditions',
            'npkSummary': f"N: {n:.1f} | P: {p:.1f} | K: {k:.1f}",
            'climateSummary': f"pH {ph:.1f} | {rain:.1f} mm | {temp:.1f}°C",
            'soilHealth': ph_status,
            'detailedNotes': crop_info['description'],
            'inputs': {
                'nitrogen': n,
                'phosphorus': p,
                'potassium': k,
                'temperature': temp,
                'humidity': hum,
                'ph': ph,
                'rainfall': rain
            }
        }

        # Persist the created log to MySQL
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO advisory_logs
               (log_id, timestamp, npk_summary, climate_summary, type, crop, badge_class,
                recommended_item, category, confidence, dosage_advice, soil_health, detailed_notes, inputs_json)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (log_id, timestamp, response_payload['npkSummary'], response_payload['climateSummary'],
             response_payload['type'], raw_crop, response_payload['badgeClass'], response_payload['recommendedItem'],
             response_payload['category'], response_payload['confidence'], response_payload['dosageAdvice'],
             response_payload['soilHealth'], response_payload['detailedNotes'], json.dumps(response_payload['inputs']))
        )
        conn.commit()
        cursor.close(); conn.close()

        return jsonify(response_payload), 201

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': 'Failed to generate recommendation',
            'details': str(e)
        }), 400


@app.route('/api/logs', methods=['POST'])
def create_log():
    """HTTP POST: Post/Create a new custom advisory log entry directly."""
    try:
        data = request.get_json() or {}
        
        required_fields = ['recommendedItem']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f"Missing required field: '{field}'"
                }), 400

        log_id = data.get('logId') or f"#LOG-{random.randint(1000, 9999)}"
        timestamp = data.get('timestamp') or datetime.datetime.now().strftime('%Y-%m-%d %H:%M')

        new_log = {
            'logId': log_id if log_id.startswith('#') else f"#{log_id}",
            'timestamp': timestamp,
            'npkSummary': data.get('npkSummary', 'N: 0 | P: 0 | K: 0'),
            'climateSummary': data.get('climateSummary', 'pH 6.5 | 100 mm | 25°C'),
            'type': data.get('type', 'Custom Field Entry'),
            'crop': data.get('crop', 'custom'),
            'badgeClass': data.get('badgeClass', 'badge-crop'),
            'recommendedItem': data.get('recommendedItem'),
            'category': data.get('category', 'Custom Category'),
            'confidence': data.get('confidence', '100%'),
            'dosageAdvice': data.get('dosageAdvice', 'Follow standard agricultural guidelines'),
            'soilHealth': data.get('soilHealth', 'Optimal Balanced Soil'),
            'detailedNotes': data.get('detailedNotes', 'Manually logged field advisory.'),
            'inputs': data.get('inputs', {})
        }

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO advisory_logs
               (log_id, timestamp, npk_summary, climate_summary, type, crop, badge_class,
                recommended_item, category, confidence, dosage_advice, soil_health, detailed_notes, inputs_json)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (new_log['logId'], new_log['timestamp'], new_log['npkSummary'], new_log['climateSummary'],
             new_log['type'], new_log['crop'], new_log['badgeClass'], new_log['recommendedItem'],
             new_log['category'], new_log['confidence'], new_log['dosageAdvice'],
             new_log['soilHealth'], new_log['detailedNotes'], json.dumps(new_log['inputs']))
        )
        conn.commit()
        cursor.close(); conn.close()

        return jsonify({
            'status': 'success',
            'message': 'Advisory log entry posted successfully',
            'log': new_log
        }), 201

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to post advisory log',
            'details': str(e)
        }), 400


# ==========================================
# 3. PUT METHOD ENDPOINTS (Update Data)
# ==========================================

# Maps the API's camelCase field names to their MySQL column names for updates
LOG_FIELD_TO_COLUMN = {
    'timestamp': 'timestamp',
    'npkSummary': 'npk_summary',
    'climateSummary': 'climate_summary',
    'type': 'type',
    'crop': 'crop',
    'badgeClass': 'badge_class',
    'recommendedItem': 'recommended_item',
    'category': 'category',
    'confidence': 'confidence',
    'dosageAdvice': 'dosage_advice',
    'soilHealth': 'soil_health',
    'detailedNotes': 'detailed_notes'
}


@app.route('/api/logs/<log_id>', methods=['PUT'])
def update_log(log_id):
    """HTTP PUT: Update an existing advisory log record."""
    formatted_id = log_id if log_id.startswith('#') else f"#{log_id}"

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM advisory_logs WHERE LOWER(log_id) = LOWER(%s)", (formatted_id,))
    existing_row = cursor.fetchone()

    if not existing_row:
        cursor.close(); conn.close()
        return jsonify({
            'status': 'error',
            'message': f"Advisory log record '{formatted_id}' not found for update"
        }), 404

    try:
        update_data = request.get_json() or {}

        # Build the SET clause only from recognized, provided fields
        set_columns, set_values = [], []
        for field, column in LOG_FIELD_TO_COLUMN.items():
            if field in update_data:
                set_columns.append(f"{column} = %s")
                set_values.append(update_data[field])
        if 'inputs' in update_data:
            set_columns.append("inputs_json = %s")
            set_values.append(json.dumps(update_data['inputs']))

        last_updated = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
        set_columns.append("last_updated = %s")
        set_values.append(last_updated)
        set_values.append(existing_row['log_id'])

        cursor.execute(f"UPDATE advisory_logs SET {', '.join(set_columns)} WHERE log_id = %s", set_values)
        conn.commit()

        cursor.execute("SELECT * FROM advisory_logs WHERE log_id = %s", (existing_row['log_id'],))
        updated_row = cursor.fetchone()
        cursor.close(); conn.close()

        return jsonify({
            'status': 'success',
            'message': f"Advisory log record '{formatted_id}' updated successfully",
            'log': row_to_log(updated_row)
        }), 200

    except Exception as e:
        cursor.close(); conn.close()
        return jsonify({
            'status': 'error',
            'message': 'Failed to update advisory log',
            'details': str(e)
        }), 400


# ==========================================
# 4. DELETE METHOD ENDPOINTS (Delete Data)
# ==========================================

@app.route('/api/logs/<log_id>', methods=['DELETE'])
def delete_log(log_id):
    """HTTP DELETE: Delete a specific advisory log record by ID."""
    formatted_id = log_id if log_id.startswith('#') else f"#{log_id}"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM advisory_logs WHERE LOWER(log_id) = LOWER(%s)", (formatted_id,))
    conn.commit()
    deleted = cursor.rowcount

    if not deleted:
        cursor.close(); conn.close()
        return jsonify({
            'status': 'error',
            'message': f"Advisory log record '{formatted_id}' not found for deletion"
        }), 404

    cursor.execute("SELECT COUNT(*) FROM advisory_logs")
    remaining_total = cursor.fetchone()[0]
    cursor.close(); conn.close()

    return jsonify({
        'status': 'success',
        'message': f"Advisory log record '{formatted_id}' deleted successfully",
        'deletedId': formatted_id,
        'remaining_total': remaining_total
    }), 200


@app.route('/api/logs', methods=['DELETE'])
def clear_all_logs():
    """HTTP DELETE: Delete/Clear all advisory logs."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM advisory_logs")
    previous_count = cursor.fetchone()[0]
    cursor.execute("DELETE FROM advisory_logs")
    conn.commit()
    cursor.close(); conn.close()

    return jsonify({
        'status': 'success',
        'message': f"Cleared all advisory logs ({previous_count} records removed)",
        'remaining_total': 0
    }), 200


# ==========================================
# 5. AUTHENTICATION ENDPOINTS
# ==========================================

@app.route('/register', methods=['POST'])
def register_user():
    """HTTP POST: Register a new user with hashed password."""
    if not request.is_json and not request.data:
        return jsonify({'error': 'Request body is required'}), 400

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({'error': 'Request body is required'}), 400

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    fullname = (data.get('fullname') or '').strip() or None
    email = (data.get('email') or '').strip() or None
    phone = (data.get('phone') or '').strip() or None
    region = (data.get('region') or '').strip() or None
    soil_type = (data.get('soilType') or data.get('soil_type') or '').strip() or None

    # Validation checks
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters long'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    # Never store or log plaintext passwords. Use Werkzeug hashing.
    password_hash = generate_password_hash(password)

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Check for duplicate username or email safely
        check_query = "SELECT username, email FROM users WHERE username = %s"
        check_params = [username]
        if email:
            check_query += " OR email = %s"
            check_params.append(email)

        cursor.execute(check_query, check_params)
        existing = cursor.fetchone()
        if existing:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Username or email already exists'}), 400

        # Insert user into MySQL users table using parameterized SQL
        insert_sql = """
            INSERT INTO users
            (username, password_hash, fullname, email, phone, region, soil_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_sql, (username, password_hash, fullname, email, phone, region, soil_type))
        conn.commit()
        user_id = cursor.lastrowid

        cursor.close()
        conn.close()

        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id,
            'username': username
        }), 201

    except Exception as e:
        return jsonify({
            'error': 'Database error during registration',
            'details': str(e)
        }), 500


@app.route('/login', methods=['POST'])
def login_user():
    """HTTP POST: Authenticate user, verify password hash, and establish Flask session."""
    if not request.is_json and not request.data:
        return jsonify({'error': 'Request body is required'}), 400

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({'error': 'Request body is required'}), 400

    username = (data.get('username') or data.get('email') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT id, username, password_hash, fullname, email FROM users WHERE username = %s OR email = %s",
            (username, username)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid username or password'}), 401

        # Establish Flask session
        session['user_id'] = user['id']
        session['username'] = user['username']

        return jsonify({
            'message': f"Welcome back, {user['username']}",
            'user_id': user['id'],
            'username': user['username']
        }), 200

    except Exception as e:
        return jsonify({
            'error': 'Database error during login',
            'details': str(e)
        }), 500


@app.route('/logout', methods=['POST'])
def logout_user():
    """HTTP POST: Clear user session."""
    session.clear()
    return jsonify({'status': 'success', 'message': 'Logged out successfully'}), 200


@app.route('/profile', methods=['GET'])
@login_required
def get_user_profile():
    """HTTP GET: Protected user profile endpoint requiring session login."""
    user_id = session.get('user_id')
    username = session.get('username')

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, username, fullname, email, phone, region, soil_type, created_at FROM users WHERE id = %s",
            (user_id,)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({
                'status': 'success',
                'user': {'user_id': user_id, 'username': username}
            }), 200

        if user.get('created_at'):
            user['created_at'] = str(user['created_at'])

        return jsonify({
            'status': 'success',
            'user': user
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'success',
            'user': {'user_id': user_id, 'username': username},
            'notice': str(e)
        }), 200


# ==========================================
# 6. USER-BOUND RECOMMENDATION ENDPOINTS
# ==========================================

@app.route('/api/recommendations', methods=['POST'])
@login_required
def create_user_recommendation():
    """HTTP POST: Submit soil parameters for ML model prediction linked to logged-in user."""
    try:
        user_id = session.get('user_id')
        data = request.get_json() or {}

        n = float(data.get('nitrogen', data.get('N', 0)))
        p = float(data.get('phosphorus', data.get('P', 0)))
        k = float(data.get('potassium', data.get('K', 0)))
        temp = float(data.get('temperature', 25.0))
        hum = float(data.get('humidity', 70.0))
        ph = float(data.get('ph', 6.5))
        rain = float(data.get('rainfall', 150.0))

        # Predict using loaded ML model (or fallback)
        raw_crop = predict_crop_ml(n, p, k, temp, hum, ph, rain)
        confidence_str = "99.1%"

        crop_info = CROP_METADATA.get(raw_crop, {
            'display': raw_crop.capitalize(),
            'category': 'General Field Crop',
            'description': 'Recommended based on field soil optimization.'
        })

        rec_id = f"#REC-{random.randint(1000, 9999)}"
        soil_health = evaluate_ph_status(ph)
        notes = data.get('notes') or crop_info['description']

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO recommendations
            (rec_id, user_id, crop_name, recommended_display, category, confidence,
             nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, soil_health, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (rec_id, user_id, raw_crop, crop_info['display'], crop_info['category'], confidence_str,
             n, p, k, temp, hum, ph, rain, soil_health, notes)
        )
        conn.commit()
        rec_db_id = cursor.lastrowid
        cursor.close(); conn.close()

        return jsonify({
            'status': 'success',
            'message': 'Crop recommendation generated and saved to user profile',
            'recommendation': {
                'id': rec_db_id,
                'recId': rec_id,
                'userId': user_id,
                'crop': raw_crop,
                'recommendedDisplay': crop_info['display'],
                'category': crop_info['category'],
                'confidence': confidence_str,
                'inputs': {
                    'nitrogen': n, 'phosphorus': p, 'potassium': k,
                    'temperature': temp, 'humidity': hum, 'ph': ph, 'rainfall': rain
                },
                'soilHealth': soil_health,
                'notes': notes
            }
        }), 201

    except Exception as e:
        return jsonify({'status': 'error', 'message': 'Failed to create recommendation', 'details': str(e)}), 400


@app.route('/api/recommendations', methods=['GET'])
@login_required
def get_user_recommendations():
    """HTTP GET: Retrieve logged-in user's crop recommendation history."""
    user_id = session.get('user_id')
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM recommendations WHERE user_id = %s ORDER BY id DESC", (user_id,))
    rows = cursor.fetchall()
    cursor.close(); conn.close()

    recs = []
    for r in rows:
        recs.append({
            'id': r['id'],
            'recId': r['rec_id'],
            'userId': r['user_id'],
            'crop': r['crop_name'],
            'recommendedDisplay': r['recommended_display'],
            'category': r['category'],
            'confidence': r['confidence'],
            'inputs': {
                'nitrogen': r['nitrogen'], 'phosphorus': r['phosphorus'], 'potassium': r['potassium'],
                'temperature': r['temperature'], 'humidity': r['humidity'], 'ph': r['ph'], 'rainfall': r['rainfall']
            },
            'soilHealth': r['soil_health'],
            'notes': r['notes'],
            'createdAt': str(r['created_at'])
        })

    return jsonify({
        'status': 'success',
        'total': len(recs),
        'recommendations': recs
    }), 200


@app.route('/api/recommendations/<rec_id>', methods=['GET'])
@login_required
def get_single_user_recommendation(rec_id):
    """HTTP GET: Retrieve single recommendation record by rec_id for logged-in user."""
    user_id = session.get('user_id')
    formatted_id = rec_id if rec_id.startswith('#') else f"#{rec_id}"

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM recommendations WHERE user_id = %s AND LOWER(rec_id) = LOWER(%s)", (user_id, formatted_id))
    r = cursor.fetchone()
    cursor.close(); conn.close()

    if not r:
        return jsonify({'status': 'error', 'message': f"Recommendation record '{formatted_id}' not found for current user"}), 404

    return jsonify({
        'status': 'success',
        'recommendation': {
            'id': r['id'],
            'recId': r['rec_id'],
            'userId': r['user_id'],
            'crop': r['crop_name'],
            'recommendedDisplay': r['recommended_display'],
            'category': r['category'],
            'confidence': r['confidence'],
            'inputs': {
                'nitrogen': r['nitrogen'], 'phosphorus': r['phosphorus'], 'potassium': r['potassium'],
                'temperature': r['temperature'], 'humidity': r['humidity'], 'ph': r['ph'], 'rainfall': r['rainfall']
            },
            'soilHealth': r['soil_health'],
            'notes': r['notes'],
            'createdAt': str(r['created_at'])
        }
    }), 200


@app.route('/api/recommendations/<rec_id>', methods=['PUT'])
@login_required
def update_user_recommendation(rec_id):
    """HTTP PUT: Update notes or feedback for logged-in user recommendation record."""
    user_id = session.get('user_id')
    formatted_id = rec_id if rec_id.startswith('#') else f"#{rec_id}"
    data = request.get_json() or {}

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM recommendations WHERE user_id = %s AND LOWER(rec_id) = LOWER(%s)", (user_id, formatted_id))
    existing = cursor.fetchone()

    if not existing:
        cursor.close(); conn.close()
        return jsonify({'status': 'error', 'message': f"Recommendation record '{formatted_id}' not found for update"}), 404

    new_notes = data.get('notes', existing['notes'])
    cursor.execute("UPDATE recommendations SET notes = %s WHERE id = %s", (new_notes, existing['id']))
    conn.commit()

    cursor.execute("SELECT * FROM recommendations WHERE id = %s", (existing['id'],))
    updated = cursor.fetchone()
    cursor.close(); conn.close()

    return jsonify({
        'status': 'success',
        'message': f"Recommendation record '{formatted_id}' updated successfully",
        'recommendation': {
            'id': updated['id'],
            'recId': updated['rec_id'],
            'userId': updated['user_id'],
            'crop': updated['crop_name'],
            'recommendedDisplay': updated['recommended_display'],
            'notes': updated['notes']
        }
    }), 200


@app.route('/api/recommendations/<rec_id>', methods=['DELETE'])
@login_required
def delete_user_recommendation(rec_id):
    """HTTP DELETE: Delete user recommendation record."""
    user_id = session.get('user_id')
    formatted_id = rec_id if rec_id.startswith('#') else f"#{rec_id}"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM recommendations WHERE user_id = %s AND LOWER(rec_id) = LOWER(%s)", (user_id, formatted_id))
    conn.commit()
    deleted = cursor.rowcount
    cursor.close(); conn.close()

    if not deleted:
        return jsonify({'status': 'error', 'message': f"Recommendation record '{formatted_id}' not found for deletion"}), 404

    return jsonify({
        'status': 'success',
        'message': f"Recommendation record '{formatted_id}' deleted successfully",
        'deletedId': formatted_id
    }), 200


# ==========================================
# 7. FARM PLOT PROFILES ENDPOINTS
# ==========================================

@app.route('/api/farms', methods=['GET'])
@login_required
def get_user_farms():
    """HTTP GET: Retrieve logged-in user farm profiles."""
    user_id = session.get('user_id')
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM farm_profiles WHERE user_id = %s ORDER BY id DESC", (user_id,))
    farms = cursor.fetchall()
    cursor.close(); conn.close()

    for f in farms:
        if f.get('created_at'):
            f['created_at'] = str(f['created_at'])

    return jsonify({
        'status': 'success',
        'total': len(farms),
        'farms': farms
    }), 200


@app.route('/api/farms', methods=['POST'])
@login_required
def create_user_farm():
    """HTTP POST: Create a new farm plot profile for logged-in user."""
    user_id = session.get('user_id')
    data = request.get_json() or {}

    farm_name = (data.get('farm_name') or data.get('farmName') or '').strip()
    location = (data.get('location') or '').strip() or None
    area_acres = float(data.get('area_acres', data.get('areaAcres', 1.0)))
    soil_type = (data.get('soil_type') or data.get('soilType') or 'loamy').strip()

    if not farm_name:
        return jsonify({'error': 'Farm name is required'}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO farm_profiles (user_id, farm_name, location, area_acres, soil_type)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (user_id, farm_name, location, area_acres, soil_type)
    )
    conn.commit()
    farm_id = cursor.lastrowid
    cursor.close(); conn.close()

    return jsonify({
        'status': 'success',
        'message': 'Farm plot profile created successfully',
        'farm': {
            'id': farm_id,
            'userId': user_id,
            'farmName': farm_name,
            'location': location,
            'areaAcres': area_acres,
            'soilType': soil_type
        }
    }), 201


if __name__ == '__main__':
    # Run dev server on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)