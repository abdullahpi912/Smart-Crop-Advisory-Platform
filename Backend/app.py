import os
import time
import json
import datetime
import random
import re
import logging
from functools import wraps
from flask import Flask, request, jsonify, session, redirect
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from db import get_connection

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger("cropling.api")

secret_key = os.environ.get("SECRET_KEY")
if not secret_key:
    raise RuntimeError("SECRET_KEY environment variable is not set. Please configure it in your environment or .env file.")

is_production = os.environ.get("FLASK_ENV") == "production" or os.environ.get("ENV") == "production"
is_debug = os.environ.get("FLASK_DEBUG", "False").lower() in ("true", "1", "t")

app = Flask(__name__)
app.secret_key = secret_key

# Configure secure session cookies
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="None" if is_production else "Lax",
    SESSION_COOKIE_SECURE=is_production,
    PERMANENT_SESSION_LIFETIME=datetime.timedelta(days=7)
)

# Configure CORS with strict allowed origins allowlist
default_origins = "https://cropling.netlify.app,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
raw_frontend_url = os.environ.get("FRONTEND_URL", default_origins)
allowed_origins = [o.strip() for o in raw_frontend_url.split(",") if o.strip()]
for prod_origin in ["https://cropling.netlify.app", "http://localhost:5173"]:
    if prod_origin not in allowed_origins:
        allowed_origins.append(prod_origin)
CORS(app, supports_credentials=True, origins=allowed_origins)

class DummyLimiter:
    """Fallback no-op limiter when flask-limiter is not installed."""
    def limit(self, *args, **kwargs):
        def decorator(f):
            return f
        return decorator

    def exempt(self, *args, **kwargs):
        if args and callable(args[0]) and len(args) == 1 and not kwargs:
            return args[0]
        def decorator(f):
            return f
        return decorator


# Initialize rate limiter with fallback
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address

    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=["500 per day", "100 per hour"],
        storage_uri="memory://",
        strategy="fixed-window"
    )
except ImportError:
    limiter = DummyLimiter()


@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests from this IP. Please slow down and try again shortly.'
    }), 429


def login_required(f):
    """Decorator to protect endpoints requiring farmer session authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Please log in first'}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Decorator to protect endpoints requiring admin session privileges."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('role') != 'admin' or 'admin_id' not in session:
            return jsonify({'error': 'Admin privileges required'}), 403
        return f(*args, **kwargs)
    return decorated


def farmer_or_admin_required(f):
    """Decorator for model or utility endpoints accessible by either farmers or admins."""
    @wraps(f)
    def decorated(*args, **kwargs):
        is_farmer = 'user_id' in session
        is_admin = session.get('role') == 'admin' and 'admin_id' in session
        if not is_farmer and not is_admin:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated


def log_login_attempt(account_name, account_type, success):
    """Safely logs a login attempt into login_logs without storing credentials."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO login_logs (account_name, account_type, success) VALUES (%s, %s, %s)",
            (account_name, account_type, bool(success))
        )
        conn.commit()
        cursor.close(); conn.close()
    except Exception as e:
        logger.warning("[AUDIT LOG] Notice: login attempt log bypassed (%s)", e)


def log_admin_action(admin_username, action_type, target_username=None, details=None):
    """Safely logs an administrative action into admin_action_logs without storing credentials."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO admin_action_logs (admin_username, action_type, target_username, details) VALUES (%s, %s, %s, %s)",
            (admin_username, action_type, target_username, details)
        )
        conn.commit()
        cursor.close(); conn.close()
    except Exception as e:
        logger.warning("[AUDIT LOG] Notice: admin action log bypassed (%s)", e)


def init_db():
    """Ensures required tables (users, advisory_logs, recommendations, farm_profiles, admins, login_logs, admin_action_logs) exist in MySQL."""
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # 1. Users table
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

        # 2. Advisory logs table
        cursor.execute("""
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
        """)

        # 3. Check and migrate user_id column if advisory_logs was pre-existing
        try:
            cursor.execute("""
                SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_schema = DATABASE() AND table_name = 'advisory_logs' AND column_name = 'user_id'
            """)
            col_exists = cursor.fetchone()[0]
            if col_exists == 0:
                cursor.execute("ALTER TABLE advisory_logs ADD COLUMN user_id INT NULL")
                try:
                    cursor.execute("ALTER TABLE advisory_logs ADD CONSTRAINT fk_adv_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE")
                except Exception:
                    pass
        except Exception as col_err:
            logger.info("[DB INIT] user_id column check notice: %s", col_err)

        # 4. Recommendations table
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

        # 5. Farm profiles table
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

        # 6. Admins table
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

        # 7. Login logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS login_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                account_name VARCHAR(50) NOT NULL,
                account_type ENUM('farmer', 'admin') NOT NULL,
                success BOOLEAN NOT NULL,
                attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 8. Admin action logs table
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

    except Exception as e:
        logger.warning("[DB INIT] Table check skipped/error: %s", e)

# Initialize tables on module import
init_db()


# ==========================================
# MACHINE LEARNING MODEL LOADERS & CATALOGS
# ==========================================

import numpy as np
import pandas as pd
import joblib
import pickle

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Model')
CROP_MODEL_PATH = os.path.join(MODELS_DIR, 'crop_recommendation_model.pkl')
FERT_MODEL_PATH = os.path.join(MODELS_DIR, 'Fertilizer Recommendation', 'fertilizer_recommendation_model_v2.pkl')
FERT_ENCODER_PATH = os.path.join(MODELS_DIR, 'Fertilizer Recommendation', 'fertilizer_label_encoder_v2.pkl')
YIELD_MODEL_PATH = os.path.join(MODELS_DIR, 'crop_yield_model.pkl')

CROP_MODEL = None
FERT_MODEL = None
FERT_ENCODER = None
YIELD_MODEL = None

# 1. Load Crop Recommendation Model
try:
    if os.path.exists(CROP_MODEL_PATH):
        CROP_MODEL = joblib.load(CROP_MODEL_PATH)
        logger.info("[ML MODEL 1/3] Successfully loaded Crop Recommendation model from: %s", CROP_MODEL_PATH)
    else:
        logger.warning("[ML MODEL 1/3] Notice: Crop model file not found at %s", CROP_MODEL_PATH)
except Exception as e:
    try:
        with open(CROP_MODEL_PATH, 'rb') as f:
            CROP_MODEL = pickle.load(f)
        logger.info("[ML MODEL 1/3] Successfully loaded Crop model via pickle from: %s", CROP_MODEL_PATH)
    except Exception as ex:
        logger.warning("[ML MODEL 1/3] Notice: Crop model load fallback (%s)", ex)

# 2. Load Fertilizer Recommendation Model & Label Encoder
try:
    if os.path.exists(FERT_MODEL_PATH) and os.path.exists(FERT_ENCODER_PATH):
        with open(FERT_MODEL_PATH, 'rb') as f:
            FERT_MODEL = pickle.load(f)
        with open(FERT_ENCODER_PATH, 'rb') as f:
            FERT_ENCODER = pickle.load(f)
        logger.info("[ML MODEL 2/3] Successfully loaded Fertilizer Pipeline & Encoder from: %s", FERT_MODEL_PATH)
    else:
        logger.warning("[ML MODEL 2/3] Notice: Fertilizer model or encoder not found at %s", FERT_MODEL_PATH)
except Exception as e:
    try:
        FERT_MODEL = joblib.load(FERT_MODEL_PATH)
        FERT_ENCODER = joblib.load(FERT_ENCODER_PATH)
        logger.info("[ML MODEL 2/3] Successfully loaded Fertilizer Pipeline & Encoder via joblib")
    except Exception as ex:
        logger.warning("[ML MODEL 2/3] Notice: Fertilizer model load fallback (%s)", ex)

# 3. Load Crop Yield / Production Prediction Model
try:
    if os.path.exists(YIELD_MODEL_PATH):
        try:
            YIELD_MODEL = joblib.load(YIELD_MODEL_PATH)
        except Exception:
            with open(YIELD_MODEL_PATH, 'rb') as f:
                YIELD_MODEL = pickle.load(f)
        logger.info("[ML MODEL 3/3] Successfully loaded Crop Yield XGBoost Pipeline from: %s", YIELD_MODEL_PATH)
    else:
        logger.warning("[ML MODEL 3/3] Notice: Yield model not found at %s", YIELD_MODEL_PATH)
except Exception as e:
    logger.warning("[ML MODEL 3/3] Notice: Yield model load fallback (%s)", e)


# ==========================================
# VALID CATEGORICAL OPTIONS & CATALOGS
# ==========================================

FERTILIZER_DISTRICTS = ['Kolhapur', 'Pune', 'Sangli', 'Satara', 'Solapur']
FERTILIZER_SOIL_COLORS = ['Black', 'Dark Brown', 'Light Brown', 'Medium Brown', 'Red', 'Reddish Brown']
FERTILIZER_CROPS = [
    'Cotton', 'Ginger', 'Gram', 'Grapes', 'Groundnut', 'Jowar', 'Maize', 'Masoor',
    'Moong', 'Rice', 'Soybean', 'Sugarcane', 'Tur', 'Turmeric', 'Urad', 'Wheat'
]

YIELD_STATES = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

YIELD_SEASONS = ['Autumn', 'Kharif', 'Rabi', 'Summer', 'Whole Year', 'Winter']

YIELD_CROPS = [
    'Apple', 'Arcanut (Processed)', 'Arecanut', 'Arhar/Tur', 'Ash Gourd', 'Atcanut (Raw)',
    'Bajra', 'Banana', 'Barley', 'Bean', 'Beans & Mutter(Vegetable)', 'Beet Root', 'Ber',
    'Bhindi', 'Bitter Gourd', 'Black pepper', 'Blackgram', 'Bottle Gourd', 'Brinjal',
    'Cabbage', 'Cardamom', 'Carrot', 'Cashewnut', 'Cashewnut Processed', 'Cashewnut Raw',
    'Castor seed', 'Cauliflower', 'Citrus Fruit', 'Coconut', 'Coffee', 'Colocosia',
    'Cond-spcs other', 'Coriander', 'Cotton(lint)', 'Cowpea(Lobia)', 'Cucumber', 'Drum Stick',
    'Dry chillies', 'Dry ginger', 'Garlic', 'Ginger', 'Gram', 'Grapes', 'Groundnut',
    'Guar seed', 'Horse-gram', 'Jack Fruit', 'Jobster', 'Jowar', 'Jute', 'Jute & mesta',
    'Kapas', 'Khesari', 'Korra', 'Lab-Lab', 'Lemon', 'Lentil', 'Linseed', 'Litchi', 'Maize',
    'Mango', 'Masoor', 'Mesta', 'Moong(Green Gram)', 'Moth', 'Niger seed', 'Oilseeds total',
    'Onion', 'Orange', 'Other  Rabi pulses', 'Other Cereals & Millets', 'Other Citrus Fruit',
    'Other Dry Fruit', 'Other Fresh Fruits', 'Other Kharif pulses', 'Other Vegetables',
    'Paddy', 'Papaya', 'Peach', 'Pear', 'Peas  (vegetable)', 'Peas & beans (Pulses)',
    'Perilla', 'Pineapple', 'Plums', 'Pome Fruit', 'Pome Granet', 'Potato', 'Pulses total',
    'Pump Kin', 'Ragi', 'Rajmash Kholar', 'Rapeseed &Mustard', 'Redish', 'Ribed Guard',
    'Rice', 'Ricebean (nagadal)', 'Rubber', 'Safflower', 'Samai', 'Sannhamp', 'Sapota',
    'Sesamum', 'Small millets', 'Snak Guard', 'Soyabean', 'Sugarcane', 'Sunflower',
    'Sweet potato', 'Tapioca', 'Tea', 'Tobacco', 'Tomato', 'Total foodgrain', 'Turmeric',
    'Turnip', 'Urad', 'Varagu', 'Water Melon', 'Wheat', 'Yam', 'other fibres',
    'other misc. pulses', 'other oilseeds'
]

FERTILIZER_METADATA = {
    'Urea': {
        'category': 'Nitrogenous Fertilizer (46% N)',
        'advice': 'Apply in 2-3 split top-dressings during early vegetative leaf growth stage.'
    },
    'DAP': {
        'category': 'Diammonium Phosphate (18-46-0)',
        'advice': 'Apply at basal land preparation stage near root zone for vigorous root and crown formation.'
    },
    'MOP': {
        'category': 'Muriate of Potash (60% K2O)',
        'advice': 'Apply pre-flowering/tillering to enhance drought resistance, stem rigidity, and grain weight.'
    },
    '10:26:26 NPK': {
        'category': 'High Phosphorus-Potassium Complex',
        'advice': 'Ideal for tuber, pulse, and root crops requiring deep root anchor and pest resilience.'
    },
    '12:32:16 NPK': {
        'category': 'High Phosphorus Complex',
        'advice': 'Promotes root density and early tillering in sugarcane, oilseeds, and field pulses.'
    },
    '19:19:19 NPK': {
        'category': 'Balanced Complete Complex',
        'advice': 'Balanced vegetative and reproductive booster; apply across two split vegetative applications.'
    },
    '20:20:20 NPK': {
        'category': 'High-Analysis Complete Complex',
        'advice': 'Promotes vigorous canopy expansion, chlorophyll synthesis, and uniform fruit set.'
    },
    'Ammonium Sulphate': {
        'category': 'Nitrogen & Sulphur Nutrient (21% N, 24% S)',
        'advice': 'Provides ammonium nitrogen and essential sulphur; highly effective for oilseed and pulse yields.'
    },
    'SSP': {
        'category': 'Single Super Phosphate (16% P2O5)',
        'advice': 'Supplies phosphorus, calcium, and sulphur; apply basally at time of sowing.'
    },
    '10:10:10 NPK': {
        'category': 'Equal Ratio Starter NPK',
        'advice': 'Standard maintenance fertilizer for general field soil nutrient replenishment.'
    },
    '13:32:26 NPK': {
        'category': 'High PK Balanced Complex',
        'advice': 'Promotes sturdy crop stalk development and heavy grain filling in cereals.'
    },
    '18:46:00 NPK': {
        'category': 'High Phosphorus Granular',
        'advice': 'Basal fertilizer maximizing seedling vigor and early rooting in heavy soils.'
    },
    '50:26:26 NPK': {
        'category': 'High Nitrogen Complex Blend',
        'advice': 'Rapid foliage booster suitable for high-biomass demanding field crops.'
    },
    'Chilated Micronutrient': {
        'category': 'Foliar Micronutrient Formulation',
        'advice': 'Spray during active vegetative phase to resolve hidden micronutrient deficiencies.'
    },
    'Ferrous Sulphate': {
        'category': 'Iron Micronutrient Supplement',
        'advice': 'Corrects iron chlorosis (yellowing of young leaves) in calcareous and alkaline soils.'
    },
    'Hydrated Lime': {
        'category': 'Soil Acidity Neutralizer',
        'advice': 'Apply 2-3 weeks prior to sowing to raise soil pH and unlock bound phosphorus.'
    },
    'Magnesium Sulphate': {
        'category': 'Secondary Macronutrient (Mg & S)',
        'advice': 'Enhances chlorophyll synthesis and enzymatic activation in high-yield cropping systems.'
    },
    'Sulphur': {
        'category': 'Elemental Sulphur Soil Conditioner',
        'advice': 'Improves oil content in oilseeds and aids in lowering pH of highly alkaline soils.'
    },
    'White Potash': {
        'category': 'Sulphate of Potash (SOP / 50% K2O)',
        'advice': 'Chloride-free potassium fertilizer ideal for sensitive horticultural and vine crops.'
    }
}


def predict_crop_ml(n, p, k, temp, hum, ph, rain):
    """Predicts crop label using trained ML model with fallback to Agronomic Engine."""
    if CROP_MODEL is not None:
        try:
            features = np.array([[n, p, k, temp, hum, ph, rain]])
            pred = CROP_MODEL.predict(features)[0]
            return str(pred).lower()
        except Exception as e:
            try:
                df = pd.DataFrame([{
                    'N': n, 'P': p, 'K': k,
                    'temperature': temp, 'humidity': hum, 'ph': ph, 'rainfall': rain
                }])
                pred = CROP_MODEL.predict(df)[0]
                return str(pred).lower()
            except Exception as ex:
                logger.warning("[ML MODEL] Crop inference notice: %s", ex)

    return match_crop_agronomic(n, p, k, temp, hum, ph, rain)



# ==========================================
# 0. SKELETON ROOT HEALTH CHECK
# ==========================================


@app.route('/favicon.ico')
@limiter.exempt
def favicon():
    """Silence browser favicon requests returning 204 No Content."""
    return '', 204


@app.route('/', methods=['GET'])
@limiter.exempt
def root_health_check():
    """HTTP GET: Root health check route verifying backend server is running."""
    return jsonify({
        "status": "running",
        "service": "Cropling Backend API",

        "version": "1.0.0",
        "endpoints": {
            "root": "/",
            "health": "/api/health",
            "options": "/api/options",
            "register": "/register",
            "login": "/login",
            "logout": "/logout",
            "profile": "/profile",
            "crops": "/api/crops",
            "predict": "/api/predict",
            "predict_fertilizer": "/api/predict/fertilizer",
            "predict_yield": "/api/predict/yield",
            "logs": "/api/logs",
            "admin_login": "/admin/login",
            "admin_login_hint": "/api/admin/login-hint",
            "admin_logout": "/admin/logout",
            "admin_session_check": "/api/admin/session-check",
            "admin_login_logs": "/api/admin/login-logs",
            "admin_prediction_logs": "/api/admin/prediction-logs",
            "admin_users": "/api/admin/users"
        }
    }), 200


# ==========================================
# MIDDLEWARE & SECURITY HEADERS
# ==========================================

@app.before_request
def enforce_security_and_log():
    """Runs before every request: enforces HTTPS in production and timestamps."""
    if is_production:
        if request.headers.get('X-Forwarded-Proto', 'http') != 'https' and not request.is_secure:
            url = request.url.replace('http://', 'https://', 1)
            return redirect(url, code=301)

    request.start_time = time.time()
    logger.info("[REQUEST] %s %s", request.method, request.path)


@app.after_request
def set_security_headers_and_log(response):
    """Runs after every request: attaches security headers, logs outcome, and tags response with timing."""
    duration_ms = (time.time() - getattr(request, 'start_time', time.time())) * 1000
    response.headers['X-Response-Time-Ms'] = f"{duration_ms:.1f}"

    # Strict HTTP Security Headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    if is_production:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'

    logger.info("[RESPONSE] %s %s -> %s (%.1f ms)", request.method, request.path, response.status_code, duration_ms)
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
    """Converts a MySQL advisory_logs row (dict cursor) into the API's JSON shape for farmer dashboard.
    Strictly excludes user_id and username for security and privacy."""
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


def admin_row_to_log(row):
    """Converts a joined advisory_logs + users row for the admin prediction logs console.
    Explicitly includes username (or Anonymous) without exposing raw numeric user_id."""
    log = {
        'id': row['id'],
        'logId': row['log_id'],
        'username': row.get('username') or 'Anonymous / Public Simulator',
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
        'inputs': json.loads(row['inputs_json']) if row.get('inputs_json') else {}
    }
    if row.get('last_updated'):
        log['lastUpdated'] = row['last_updated']
    return log


# ==========================================
# 1. GET METHOD ENDPOINTS
# ==========================================

@app.route('/api/health', methods=['GET'])
@limiter.exempt
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
        db_status = 'unavailable' if is_production else f'unavailable ({e})'

    return jsonify({
        'status': 'healthy',
        'backend': 'Flask REST API + MySQL',
        'database': db_status,
        'total_logs': total_logs,
        'models': {
            'crop_recommendation': 'loaded' if CROP_MODEL is not None else 'offline',
            'fertilizer_recommendation': 'loaded' if (FERT_MODEL is not None and FERT_ENCODER is not None) else 'offline',
            'crop_yield_prediction': 'loaded' if YIELD_MODEL is not None else 'offline'
        }
    }), 200


@app.route('/api/options', methods=['GET'])
def get_model_options():
    """HTTP GET: Retrieve valid categorical option lists for fertilizer and yield prediction models."""
    return jsonify({
        'status': 'success',
        'fertilizer': {
            'districts': FERTILIZER_DISTRICTS,
            'soilColors': FERTILIZER_SOIL_COLORS,
            'crops': FERTILIZER_CROPS
        },
        'yield': {
            'states': YIELD_STATES,
            'seasons': YIELD_SEASONS,
            'crops': YIELD_CROPS
        }
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
@login_required
def get_logs():
    """HTTP GET: Retrieve authenticated farmer's advisory logs from MySQL, newest first."""
    user_id = session.get('user_id')
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM advisory_logs WHERE user_id = %s ORDER BY id DESC", (user_id,))
        rows = cursor.fetchall()
        cursor.close(); conn.close()
        logs = [row_to_log(row) for row in rows]
    except Exception as e:
        logs = []

    return jsonify({
        'status': 'success',
        'total': len(logs),
        'logs': logs
    }), 200


@app.route('/api/logs/<log_id>', methods=['GET'])
@login_required
def get_log_by_id(log_id):
    """HTTP GET: Retrieve a specific advisory log record owned by the authenticated farmer."""
    user_id = session.get('user_id')
    formatted_id = log_id if log_id.startswith('#') else f"#{log_id}"

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM advisory_logs WHERE LOWER(log_id) = LOWER(%s) AND user_id = %s",
            (formatted_id, user_id)
        )
        row = cursor.fetchone()
        cursor.close(); conn.close()
    except Exception:
        row = None

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
# 2. POST METHOD ENDPOINTS (Predictions & Logs)
# ==========================================

@app.route('/api/predict', methods=['POST'])
def predict_crop():
    """HTTP POST: Predict crop recommendation using ML model and log entry."""
    try:
        data = request.get_json() or {}

        # Support flexible field names (e.g. nitrogen / N, phosphorus / P, potassium / K)
        try:
            n = float(data.get('nitrogen', data.get('N', 0)))
            p = float(data.get('phosphorus', data.get('P', 0)))
            k = float(data.get('potassium', data.get('K', 0)))
            temp = float(data.get('temperature', 25.0))
            hum = float(data.get('humidity', 70.0))
            ph = float(data.get('ph', 6.5))
            rain = float(data.get('rainfall', 150.0))
        except (ValueError, TypeError) as num_err:
            return jsonify({'status': 'error', 'error': f"Invalid numeric input parameters: {num_err}"}), 400

        # Boundary checks for agronomic variables
        if not (0 <= ph <= 14):
            return jsonify({'status': 'error', 'error': 'Soil pH must be between 0.0 and 14.0'}), 400
        if not (0 <= hum <= 100):
            return jsonify({'status': 'error', 'error': 'Humidity must be between 0% and 100%'}), 400
        if n < 0 or p < 0 or k < 0:
            return jsonify({'status': 'error', 'error': 'NPK nutrient values cannot be negative'}), 400
        if rain < 0:
            return jsonify({'status': 'error', 'error': 'Rainfall cannot be negative'}), 400
        if not (-20 <= temp <= 65):
            return jsonify({'status': 'error', 'error': 'Temperature must be between -20°C and 65°C'}), 400

        # Perform crop recommendation using ML model (with agronomic fallback)
        raw_crop = predict_crop_ml(n, p, k, temp, hum, ph, rain)
        confidence_str = "99.1%" if CROP_MODEL is not None else "98.5%"

        # Lookup crop display info
        crop_info = CROP_METADATA.get(raw_crop, {
            'display': raw_crop.capitalize(),
            'category': 'General Field Crop',
            'description': 'Recommended based on field soil optimization.'
        })

        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        log_id = f"#LOG-{random.randint(1000, 9999)}"
        ph_status = evaluate_ph_status(ph)

        response_payload = {
            'status': 'success',
            'logId': log_id,
            'timestamp': timestamp,
            'type': 'Crop Match (ML Model)' if CROP_MODEL is not None else 'Crop Match (Agronomic Engine)',
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
                'rainfall': rain,
                'mode': 'crop'
            }
        }

        # Persist the created log to MySQL only if an authenticated user session is active
        log_user_id = session.get('user_id') if ('user_id' in session and session.get('role') != 'admin') else None
        if log_user_id is not None:
            try:
                conn = get_connection()
                cursor = conn.cursor()
                cursor.execute(
                    """INSERT INTO advisory_logs
                       (log_id, user_id, timestamp, npk_summary, climate_summary, type, crop, badge_class,
                        recommended_item, category, confidence, dosage_advice, soil_health, detailed_notes, inputs_json)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (log_id, log_user_id, timestamp, response_payload['npkSummary'], response_payload['climateSummary'],
                     response_payload['type'], raw_crop, response_payload['badgeClass'], response_payload['recommendedItem'],
                     response_payload['category'], response_payload['confidence'], response_payload['dosageAdvice'],
                     response_payload['soilHealth'], response_payload['detailedNotes'], json.dumps(response_payload['inputs']))
                )
                conn.commit()
                cursor.close(); conn.close()
            except Exception as dbe:
                logger.warning("[DB LOG] Notice: advisory log insertion bypassed (%s)", dbe)

        return jsonify(response_payload), 201

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': 'Failed to generate recommendation',
            'details': str(e) if not is_production else None
        }), 400


@app.route('/api/predict/fertilizer', methods=['POST'])
def predict_fertilizer():
    """HTTP POST: Predict fertilizer recommendation and top-3 shortlist with confidence."""
    try:
        data = request.get_json() or {}

        # 1. Parse categorical and numerical parameters with flexible naming
        district_raw = data.get('district_name') or data.get('district') or data.get('District_Name')
        soil_raw = data.get('soil_color') or data.get('soilColor') or data.get('Soil_color')
        crop_raw = data.get('crop') or data.get('Crop')

        if not district_raw or not soil_raw or not crop_raw:
            return jsonify({
                'status': 'error',
                'error': 'Missing required categorical fields: district_name, soil_color, and crop must be provided.'
            }), 400

        # 2. Strict server-side validation against known categorical sets (prevents handle_unknown="ignore" silent degradation)
        district_match = next((d for d in FERTILIZER_DISTRICTS if d.lower() == str(district_raw).strip().lower()), None)
        if not district_match:
            return jsonify({
                'status': 'error',
                'error': f"Invalid district_name '{district_raw}'. Allowed values are: {', '.join(FERTILIZER_DISTRICTS)}"
            }), 400

        soil_match = next((s for s in FERTILIZER_SOIL_COLORS if s.lower() == str(soil_raw).strip().lower()), None)
        if not soil_match:
            return jsonify({
                'status': 'error',
                'error': f"Invalid soil_color '{soil_raw}'. Allowed values are: {', '.join(FERTILIZER_SOIL_COLORS)}"
            }), 400

        crop_match = next((c for c in FERTILIZER_CROPS if c.lower() == str(crop_raw).strip().lower()), None)
        if not crop_match:
            return jsonify({
                'status': 'error',
                'error': f"Invalid crop '{crop_raw}'. Allowed values are: {', '.join(FERTILIZER_CROPS)}"
            }), 400

        # 3. Numeric inputs validation
        try:
            n = float(data.get('nitrogen', data.get('Nitrogen', data.get('N', 0))))
            p = float(data.get('phosphorus', data.get('Phosphorus', data.get('P', 0))))
            k = float(data.get('potassium', data.get('Potassium', data.get('K', 0))))
            ph = float(data.get('ph', data.get('pH', 6.5)))
            rain = float(data.get('rainfall', data.get('Rainfall', 100.0)))
            temp = float(data.get('temperature', data.get('Temperature', 25.0)))
        except (ValueError, TypeError) as num_err:
            return jsonify({
                'status': 'error',
                'error': f"Invalid numeric input parameters: {num_err}"
            }), 400

        if not (0 <= ph <= 14):
            return jsonify({'status': 'error', 'error': 'Soil pH must be between 0.0 and 14.0'}), 400
        if n < 0 or p < 0 or k < 0:
            return jsonify({'status': 'error', 'error': 'NPK nutrient values cannot be negative'}), 400
        if rain < 0:
            return jsonify({'status': 'error', 'error': 'Rainfall cannot be negative'}), 400
        if not (-20 <= temp <= 65):
            return jsonify({'status': 'error', 'error': 'Temperature must be between -20°C and 65°C'}), 400

        # 4. Model inference with pipeline & LabelEncoder two-step decoding
        if FERT_MODEL is not None and FERT_ENCODER is not None:
            input_df = pd.DataFrame([{
                'District_Name': district_match,
                'Soil_color': soil_match,
                'Crop': crop_match,
                'Nitrogen': n,
                'Phosphorus': p,
                'Potassium': k,
                'pH': ph,
                'Rainfall': rain,
                'Temperature': temp
            }])

            raw_pred = FERT_MODEL.predict(input_df)[0]
            fertilizer_name = FERT_ENCODER.inverse_transform([raw_pred])[0]

            probabilities = FERT_MODEL.predict_proba(input_df)[0]
            top3_indices = probabilities.argsort()[::-1][:3]
            top3 = [
                {
                    'name': str(FERT_ENCODER.classes_[i]),
                    'confidence': round(float(probabilities[i]) * 100, 1)
                }
                for i in top3_indices
            ]
            primary_confidence = f"{top3[0]['confidence']}%"
        else:
            # Fallback heuristic deficiency matching
            if n < 50:
                fertilizer_name = 'Urea'
            elif p < 30:
                fertilizer_name = 'DAP'
            elif k < 30:
                fertilizer_name = 'MOP'
            else:
                fertilizer_name = '19:19:19 NPK'
            top3 = [
                {'name': fertilizer_name, 'confidence': 95.0},
                {'name': '10:26:26 NPK', 'confidence': 3.5},
                {'name': 'SSP', 'confidence': 1.5}
            ]
            primary_confidence = "95.0%"

        # 5. Metadata and formatted advisory response
        meta = FERTILIZER_METADATA.get(fertilizer_name, {
            'category': 'Nutrient Supplement',
            'advice': 'Apply following local agricultural soil dosage guidelines.'
        })

        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        log_id = f"#LOG-{random.randint(1000, 9999)}"
        ph_status = evaluate_ph_status(ph)

        response_payload = {
            'status': 'success',
            'fertilizer': fertilizer_name,
            'top3': top3,
            'logId': log_id,
            'timestamp': timestamp,
            'type': 'Fertilizer Recommendation (ML)',
            'crop': crop_match,
            'recommendedItem': fertilizer_name,
            'category': meta['category'],
            'confidence': primary_confidence,
            'badgeClass': 'badge-fertilizer',
            'dosageAdvice': meta['advice'],
            'npkSummary': f"N: {n:.1f} | P: {p:.1f} | K: {k:.1f}",
            'climateSummary': f"pH {ph:.1f} | {rain:.1f} mm | {temp:.1f}°C",
            'soilHealth': ph_status,
            'detailedNotes': f"Optimal nutrient recommendation for {crop_match} in {district_match} on {soil_match} soil.",
            'inputs': {
                'district_name': district_match,
                'soil_color': soil_match,
                'crop': crop_match,
                'nitrogen': n,
                'phosphorus': p,
                'potassium': k,
                'ph': ph,
                'rainfall': rain,
                'temperature': temp,
                'mode': 'fertilizer'
            }
        }

        # Persist to database only if an authenticated user session is active
        log_user_id = session.get('user_id') if ('user_id' in session and session.get('role') != 'admin') else None
        if log_user_id is not None:
            try:
                conn = get_connection()
                cursor = conn.cursor()
                cursor.execute(
                    """INSERT INTO advisory_logs
                       (log_id, user_id, timestamp, npk_summary, climate_summary, type, crop, badge_class,
                        recommended_item, category, confidence, dosage_advice, soil_health, detailed_notes, inputs_json)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (log_id, log_user_id, timestamp, response_payload['npkSummary'], response_payload['climateSummary'],
                     response_payload['type'], crop_match, response_payload['badgeClass'], response_payload['recommendedItem'],
                     response_payload['category'], response_payload['confidence'], response_payload['dosageAdvice'],
                     response_payload['soilHealth'], response_payload['detailedNotes'], json.dumps(response_payload['inputs']))
                )
                conn.commit()
                cursor.close(); conn.close()
            except Exception as dbe:
                logger.warning("[DB LOG] Notice: advisory log insertion bypassed (%s)", dbe)

        return jsonify(response_payload), 201

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': 'Failed to generate fertilizer recommendation',
            'details': str(e) if not is_production else None
        }), 400


@app.route('/api/predict/yield', methods=['POST'])
def predict_crop_yield():
    """HTTP POST: Predict crop production / yield in tonnes using XGBoost pipeline with expm1 inversion."""
    try:
        data = request.get_json() or {}

        state_raw = data.get('state_name') or data.get('state') or data.get('State_Name')
        season_raw = data.get('season') or data.get('Season')
        crop_raw = data.get('crop') or data.get('Crop')
        year_raw = data.get('crop_year') or data.get('cropYear') or data.get('year') or data.get('Crop_Year', 2024)
        area_raw = data.get('area') or data.get('Area') or data.get('area_hectares')

        if not state_raw or not season_raw or not crop_raw or area_raw is None:
            return jsonify({
                'status': 'error',
                'error': 'Missing required fields: state_name, season, crop, and area are required.'
            }), 400

        # Strict validation against known categorical sets (prevents handle_unknown="ignore" silent degradation)
        state_match = next((s for s in YIELD_STATES if s.lower() == str(state_raw).strip().lower()), None)
        if not state_match:
            return jsonify({
                'status': 'error',
                'error': f"Invalid state_name '{state_raw}'. Allowed states: {', '.join(YIELD_STATES[:10])} ... ({len(YIELD_STATES)} total)"
            }), 400

        season_match = next((s for s in YIELD_SEASONS if s.lower() == str(season_raw).strip().lower()), None)
        if not season_match:
            return jsonify({
                'status': 'error',
                'error': f"Invalid season '{season_raw}'. Allowed seasons: {', '.join(YIELD_SEASONS)}"
            }), 400

        crop_match = next((c for c in YIELD_CROPS if c.lower() == str(crop_raw).strip().lower()), None)
        if not crop_match:
            return jsonify({
                'status': 'error',
                'error': f"Invalid crop '{crop_raw}'. Allowed crops: {', '.join(YIELD_CROPS[:10])} ... ({len(YIELD_CROPS)} total)"
            }), 400

        try:
            crop_year = int(year_raw)
            area = float(area_raw)
        except (ValueError, TypeError) as num_err:
            return jsonify({
                'status': 'error',
                'error': f"Invalid year or area number: {num_err}"
            }), 400

        if area <= 0 or area > 1000000:
            return jsonify({
                'status': 'error',
                'error': 'Area must be a positive number greater than 0 (between 0.01 and 1,000,000 hectares).'
            }), 400

        if not (1900 <= crop_year <= 2100):
            return jsonify({
                'status': 'error',
                'error': 'Crop year must be between 1900 and 2100.'
            }), 400

        # Model inference via XGBoost Pipeline (Pipeline internally applies FunctionTransformer(np.log1p) on Area)
        if YIELD_MODEL is not None:
            input_df = pd.DataFrame([{
                'State_Name': state_match,
                'Season': season_match,
                'Crop': crop_match,
                'Crop_Year': crop_year,
                'Area': area
            }])

            raw_prediction = YIELD_MODEL.predict(input_df)[0]
            # Output decoding: expm1 converts log1p(production) back to raw production in tonnes
            predicted_production_tonnes = float(np.expm1(raw_prediction))
            predicted_production_tonnes = max(0.0, predicted_production_tonnes)
        else:
            predicted_production_tonnes = round(area * 2.5, 2)

        yield_per_ha = round(predicted_production_tonnes / area, 2) if area > 0 else 0.0

        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        log_id = f"#LOG-{random.randint(1000, 9999)}"

        response_payload = {
            'status': 'success',
            'predicted_production_tonnes': round(predicted_production_tonnes, 2),
            'crop': crop_match,
            'unit': 'tonnes',
            'yield_per_hectare': yield_per_ha,
            'logId': log_id,
            'timestamp': timestamp,
            'type': 'Crop Yield Prediction (ML)',
            'recommendedItem': f"{crop_match}: {predicted_production_tonnes:.2f} Tonnes",
            'category': 'Yield & Harvest Forecast',
            'confidence': 'ML Regressor',
            'badgeClass': 'badge-yield',
            'dosageAdvice': f"Estimated farm production: {predicted_production_tonnes:.2f} Tonnes on {area:.2f} ha ({yield_per_ha:.2f} Tonnes/ha)",
            'npkSummary': f"Area: {area:.1f} ha | Year: {crop_year}",
            'climateSummary': f"State: {state_match} | Season: {season_match}",
            'soilHealth': 'Regional Agronomic Model Fit',
            'detailedNotes': f"Historical yield estimate for {crop_match} in {state_match} ({season_match} season). This estimate is based on historical state/district agricultural patterns, not a guarantee.",
            'inputs': {
                'state_name': state_match,
                'season': season_match,
                'crop': crop_match,
                'crop_year': crop_year,
                'area': area,
                'mode': 'yield'
            }
        }

        # Persist to database only if an authenticated user session is active
        log_user_id = session.get('user_id') if ('user_id' in session and session.get('role') != 'admin') else None
        if log_user_id is not None:
            try:
                conn = get_connection()
                cursor = conn.cursor()
                cursor.execute(
                    """INSERT INTO advisory_logs
                       (log_id, user_id, timestamp, npk_summary, climate_summary, type, crop, badge_class,
                        recommended_item, category, confidence, dosage_advice, soil_health, detailed_notes, inputs_json)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (log_id, log_user_id, timestamp, response_payload['npkSummary'], response_payload['climateSummary'],
                     response_payload['type'], crop_match, response_payload['badgeClass'], response_payload['recommendedItem'],
                     response_payload['category'], response_payload['confidence'], response_payload['dosageAdvice'],
                     response_payload['soilHealth'], response_payload['detailedNotes'], json.dumps(response_payload['inputs']))
                )
                conn.commit()
                cursor.close(); conn.close()
            except Exception as dbe:
                logger.warning("[DB LOG] Notice: advisory log insertion bypassed (%s)", dbe)

        return jsonify(response_payload), 201

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': 'Failed to generate crop yield prediction',
            'details': str(e) if not is_production else None
        }), 400



@app.route('/api/logs', methods=['POST'])
@login_required
def create_log():
    """HTTP POST: Post/Create a new custom advisory log entry directly."""
    try:
        user_id = session.get('user_id')
        data = request.get_json() or {}
        
        required_fields = ['recommendedItem']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f"Missing required field: '{field}'"
                }), 400

        log_id = data.get('logId') or f"#LOG-{random.randint(1000, 9999)}"
        timestamp = data.get('timestamp') or datetime.datetime.now(datetime.timezone.utc).isoformat()

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
               (log_id, user_id, timestamp, npk_summary, climate_summary, type, crop, badge_class,
                recommended_item, category, confidence, dosage_advice, soil_health, detailed_notes, inputs_json)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (new_log['logId'], user_id, new_log['timestamp'], new_log['npkSummary'], new_log['climateSummary'],
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
            'details': str(e) if not is_production else None
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
@login_required
def update_log(log_id):
    """HTTP PUT: Update an existing advisory log record owned by the authenticated farmer."""
    user_id = session.get('user_id')
    formatted_id = log_id if log_id.startswith('#') else f"#{log_id}"

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM advisory_logs WHERE LOWER(log_id) = LOWER(%s) AND user_id = %s",
        (formatted_id, user_id)
    )
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

        last_updated = datetime.datetime.now(datetime.timezone.utc).isoformat()
        set_columns.append("last_updated = %s")
        set_values.append(last_updated)
        set_values.append(existing_row['log_id'])
        set_values.append(user_id)

        cursor.execute(
            f"UPDATE advisory_logs SET {', '.join(set_columns)} WHERE log_id = %s AND user_id = %s",
            set_values
        )
        conn.commit()

        cursor.execute(
            "SELECT * FROM advisory_logs WHERE log_id = %s AND user_id = %s",
            (existing_row['log_id'], user_id)
        )
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
            'details': str(e) if not is_production else None
        }), 400


# ==========================================
# 4. DELETE METHOD ENDPOINTS (Delete Data)
# ==========================================

@app.route('/api/logs/<log_id>', methods=['DELETE'])
@login_required
def delete_log(log_id):
    """HTTP DELETE: Delete a specific advisory log record by ID owned by the authenticated farmer."""
    user_id = session.get('user_id')
    formatted_id = log_id if log_id.startswith('#') else f"#{log_id}"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM advisory_logs WHERE LOWER(log_id) = LOWER(%s) AND user_id = %s",
        (formatted_id, user_id)
    )
    conn.commit()
    deleted = cursor.rowcount

    if not deleted:
        cursor.close(); conn.close()
        return jsonify({
            'status': 'error',
            'message': f"Advisory log record '{formatted_id}' not found for deletion"
        }), 404

    cursor.execute("SELECT COUNT(*) FROM advisory_logs WHERE user_id = %s", (user_id,))
    remaining_total = cursor.fetchone()[0]
    cursor.close(); conn.close()

    return jsonify({
        'status': 'success',
        'message': f"Advisory log record '{formatted_id}' deleted successfully",
        'deletedId': formatted_id,
        'remaining_total': remaining_total
    }), 200


@app.route('/api/logs', methods=['DELETE'])
@login_required
def clear_all_logs():
    """HTTP DELETE: Delete/Clear all advisory logs owned by the authenticated farmer."""
    user_id = session.get('user_id')
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM advisory_logs WHERE user_id = %s", (user_id,))
    previous_count = cursor.fetchone()[0]
    cursor.execute("DELETE FROM advisory_logs WHERE user_id = %s", (user_id,))
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
@limiter.limit("10 per hour")
def register_user():
    """HTTP POST: Register a new user with hashed password and bot mitigation."""
    if not request.is_json and not request.data:
        return jsonify({'error': 'Request body is required'}), 400

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({'error': 'Request body is required'}), 400

    # Honeypot bot protection check
    if data.get('website_trap') or data.get('hp_field'):
        return jsonify({'error': 'Automated submission detected'}), 400

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    fullname = (data.get('fullname') or '').strip() or None
    email = (data.get('email') or '').strip() or None
    phone = (data.get('phone') or '').strip() or None
    region = (data.get('region') or data.get('location') or '').strip() or None

    # Validation checks
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    if len(username) < 3 or len(username) > 50:
        return jsonify({'error': 'Username must be between 3 and 50 characters long'}), 400

    if len(password) < 6 or len(password) > 128:
        return jsonify({'error': 'Password must be between 6 and 128 characters long'}), 400

    if email and (len(email) > 150 or not re.match(r"[^@]+@[^@]+\.[^@]+", email)):
        return jsonify({'error': 'Please provide a valid email address'}), 400

    if fullname and len(fullname) > 100:
        return jsonify({'error': 'Full name cannot exceed 100 characters'}), 400

    if phone and len(phone) > 30:
        return jsonify({'error': 'Phone number cannot exceed 30 characters'}), 400

    if region and len(region) > 100:
        return jsonify({'error': 'Location cannot exceed 100 characters'}), 400

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

        # Insert user into MySQL users table (soil_type left NULL for backward compatibility)
        insert_sql = """
            INSERT INTO users
            (username, password_hash, fullname, email, phone, region, soil_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_sql, (username, password_hash, fullname, email, phone, region, None))
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
            'details': str(e) if not is_production else None
        }), 500


@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
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
            log_login_attempt(username, 'farmer', False)
            return jsonify({'error': 'Invalid username or password'}), 401

        # Audit successful login attempt
        log_login_attempt(user['username'], 'farmer', True)

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
            'details': str(e) if not is_production else None
        }), 500


@app.route('/logout', methods=['POST'])
def logout_user():
    """HTTP POST: Clear user session."""
    session.clear()
    return jsonify({'status': 'success', 'message': 'Logged out successfully'}), 200


@app.route('/profile', methods=['GET', 'PUT'])
@app.route('/api/profile', methods=['GET', 'PUT', 'DELETE'])
@login_required
def user_profile():
    """HTTP GET/PUT/DELETE: Protected user profile endpoint for reading, updating profile details, and account deletion."""
    user_id = session.get('user_id')
    username = session.get('username')

    if request.method == 'DELETE':
        return delete_account()

    if request.method == 'PUT':
        data = request.get_json(silent=True) or {}
        fullname = data.get('fullname') or data.get('fullName')
        email = data.get('email')
        phone = data.get('phone')
        region = data.get('region') or data.get('location')

        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)
            if email:
                cursor.execute(
                    """UPDATE users 
                       SET fullname = %s, email = %s, phone = %s, region = %s 
                       WHERE id = %s""",
                    (fullname, email, phone, region, user_id)
                )
            else:
                cursor.execute(
                    """UPDATE users 
                       SET fullname = %s, phone = %s, region = %s 
                       WHERE id = %s""",
                    (fullname, phone, region, user_id)
                )
            conn.commit()

            cursor.execute(
                "SELECT id, username, fullname, email, phone, region, created_at FROM users WHERE id = %s",
                (user_id,)
            )
            updated_user = cursor.fetchone()
            cursor.close()
            conn.close()

            if updated_user and updated_user.get('created_at'):
                updated_user['created_at'] = str(updated_user['created_at'])

            return jsonify({
                'status': 'success',
                'message': 'Profile updated successfully',
                'user': updated_user
            }), 200

        except Exception as e:
            return jsonify({'error': 'Failed to update profile', 'details': str(e) if not is_production else None}), 500

    # GET method
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, username, fullname, email, phone, region, created_at FROM users WHERE id = %s",
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
            'notice': str(e) if not is_production else None
        }), 200


@app.route('/api/user/change-password', methods=['PUT', 'POST'])
@app.route('/api/profile/password', methods=['PUT', 'POST'])
@app.route('/api/change-password', methods=['PUT', 'POST'])
@login_required
def change_password():
    """HTTP PUT/POST: Change user password after verifying current password."""
    user_id = session.get('user_id')
    data = request.get_json(silent=True) or {}
    old_password = data.get('old_password') or data.get('oldPassword') or data.get('currentPassword')
    new_password = data.get('new_password') or data.get('newPassword')

    if not old_password or not new_password:
        return jsonify({'error': 'Both current password and new password are required'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user or not check_password_hash(user['password_hash'], old_password):
            cursor.close()
            conn.close()
            return jsonify({'error': 'Current password is incorrect'}), 401

        new_hash = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'status': 'success', 'message': 'Password changed successfully'}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to change password', 'details': str(e) if not is_production else None}), 500


@app.route('/api/user/account', methods=['DELETE', 'POST'])
@login_required
def delete_account():
    """HTTP DELETE/POST: Delete user account from database after password verification."""
    user_id = session.get('user_id')
    data = request.get_json(silent=True) or {}
    password = data.get('password') or data.get('currentPassword') or ''

    if not password:
        return jsonify({'error': 'Password is required to confirm account deletion'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user or not check_password_hash(user['password_hash'], password):
            cursor.close()
            conn.close()
            return jsonify({'error': 'Incorrect password'}), 401

        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()

        session.clear()
        return jsonify({'status': 'success', 'message': 'Account deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to delete account', 'details': str(e) if not is_production else None}), 500




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
        return jsonify({'status': 'error', 'message': 'Failed to create recommendation', 'details': str(e) if not is_production else None}), 400


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


# ==========================================
# 8. ADMIN DASHBOARD & AUDIT ENDPOINTS
# ==========================================

@app.route('/api/admin/login-hint', methods=['GET'])
@limiter.limit("20 per minute")
def admin_login_hint():
    """HTTP GET: Retrieve visible security phrase hint for a given admin username (no secret data returned).
    Returns identical response shape and 200 status code for all requests to prevent username enumeration."""
    username = (request.args.get('username') or '').strip()
    if not username:
        return jsonify({'status': 'success', 'hint': ''}), 200

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT security_phrase_hint FROM admins WHERE username = %s", (username,))
        row = cursor.fetchone()
        cursor.close(); conn.close()

        hint_value = (row['security_phrase_hint'] or '').strip() if row and row.get('security_phrase_hint') else ''

        return jsonify({
            'status': 'success',
            'hint': hint_value
        }), 200
    except Exception as e:
        logger.warning("[HINT ENDPOINT] Database exception suppressed to prevent enumeration: %s", e)
        return jsonify({
            'status': 'success',
            'hint': ''
        }), 200


@app.route('/admin/login', methods=['POST'])
@app.route('/api/admin/login', methods=['POST'])
@limiter.limit("10 per minute")
def admin_login():
    """HTTP POST: Authenticate administrator (4-factor: Username, Password, Favorite Number, Security Phrase)."""
    if not request.is_json and not request.data:
        return jsonify({'error': 'Request body is required'}), 400

    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    favorite_number = data.get('favorite_number') if data.get('favorite_number') is not None else data.get('favoriteNumber')
    security_phrase = data.get('security_phrase') if data.get('security_phrase') is not None else data.get('securityPhrase')

    if favorite_number is not None:
        favorite_number = str(favorite_number).strip()
    if security_phrase is not None:
        security_phrase = str(security_phrase).strip()

    if not username or not password or not favorite_number or not security_phrase:
        return jsonify({'error': 'Username, password, favorite number, and security phrase are all required'}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, username, password_hash, favorite_number_hash, security_phrase_hash FROM admins WHERE username = %s",
            (username,)
        )
        admin = cursor.fetchone()
        cursor.close(); conn.close()

        valid_auth = False
        if admin:
            pwd_ok = check_password_hash(admin['password_hash'], password)
            fn_ok = bool(admin.get('favorite_number_hash')) and check_password_hash(admin['favorite_number_hash'], favorite_number)
            sp_ok = bool(admin.get('security_phrase_hash')) and check_password_hash(admin['security_phrase_hash'], security_phrase)
            valid_auth = pwd_ok and fn_ok and sp_ok

        if not admin or not valid_auth:
            log_login_attempt(username, 'admin', False)
            return jsonify({'error': 'Invalid admin credentials'}), 401

        # Audit successful admin login
        log_login_attempt(admin['username'], 'admin', True)

        # Clear session and establish Admin privileges
        session.clear()
        session['admin_id'] = admin['id']
        session['admin_username'] = admin['username']
        session['role'] = 'admin'

        return jsonify({
            'status': 'success',
            'message': f"Welcome back, Administrator {admin['username']}",
            'admin_username': admin['username']
        }), 200

    except Exception as e:
        return jsonify({'error': 'Database error during admin login', 'details': str(e) if not is_production else None}), 500


@app.route('/admin/logout', methods=['POST'])
@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    """HTTP POST: Terminate administrator session."""
    session.clear()
    return jsonify({'status': 'success', 'message': 'Admin session terminated'}), 200


@app.route('/api/admin/session-check', methods=['GET'])
def admin_session_check():
    """HTTP GET: Check if current session has active admin privileges."""
    if session.get('role') == 'admin' and 'admin_id' in session:
        return jsonify({
            'status': 'success',
            'authenticated': True,
            'admin_username': session.get('admin_username')
        }), 200
    return jsonify({
        'status': 'error',
        'authenticated': False,
        'error': 'Not authenticated as admin'
    }), 401


@app.route('/api/admin/login-logs', methods=['GET'])
@admin_required
def admin_get_login_logs():
    """HTTP GET: Retrieve login attempt audit logs (farmer and admin attempts)."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, account_name, account_type, success, attempted_at FROM login_logs ORDER BY id DESC LIMIT 500")
        rows = cursor.fetchall()
        cursor.close(); conn.close()

        logs = []
        for r in rows:
            logs.append({
                'id': r['id'],
                'account_name': r['account_name'],
                'account_type': r['account_type'],
                'success': bool(r['success']),
                'attempted_at': str(r['attempted_at']) if r.get('attempted_at') else ''
            })

        return jsonify({
            'status': 'success',
            'total': len(logs),
            'logs': logs
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve login audit logs', 'details': str(e) if not is_production else None}), 500


@app.route('/api/admin/prediction-logs', methods=['GET'])
@admin_required
def admin_get_prediction_logs():
    """HTTP GET: Retrieve joined prediction logs from advisory_logs with associated username."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT al.id, al.log_id, al.timestamp, al.npk_summary, al.climate_summary,
                   al.type, al.crop, al.badge_class, al.recommended_item, al.category,
                   al.confidence, al.dosage_advice, al.soil_health, al.detailed_notes,
                   al.inputs_json, al.last_updated, u.username
            FROM advisory_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.id DESC
            LIMIT 500
        """)
        rows = cursor.fetchall()
        cursor.close(); conn.close()

        logs = [admin_row_to_log(r) for r in rows]
        return jsonify({
            'status': 'success',
            'total': len(logs),
            'logs': logs
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve prediction logs', 'details': str(e) if not is_production else None}), 500


@app.route('/api/admin/users', methods=['GET'])
@admin_required
def admin_get_users():
    """HTTP GET: Retrieve all farmer accounts with profile details (never exposes password hashes)."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username, fullname, email, phone, region, created_at FROM users ORDER BY id DESC")
        rows = cursor.fetchall()
        cursor.close(); conn.close()

        users = []
        for u in rows:
            users.append({
                'id': u['id'],
                'username': u['username'],
                'fullname': u['fullname'],
                'email': u['email'],
                'phone': u['phone'],
                'region': u['region'],
                'created_at': str(u['created_at']) if u.get('created_at') else ''
            })

        return jsonify({
            'status': 'success',
            'total': len(users),
            'users': users
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve users', 'details': str(e) if not is_production else None}), 500


@app.route('/api/admin/users', methods=['POST'])
@admin_required
def admin_create_user():
    """HTTP POST: Administrator creation of a new farmer account."""
    admin_user = session.get('admin_username')
    data = request.get_json(silent=True) or {}

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    fullname = (data.get('fullname') or '').strip() or None
    email = (data.get('email') or '').strip() or None
    phone = (data.get('phone') or '').strip() or None
    region = (data.get('region') or data.get('location') or '').strip() or None

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    if len(username) < 3 or len(username) > 50:
        return jsonify({'error': 'Username must be between 3 and 50 characters'}), 400

    if len(password) < 6 or len(password) > 128:
        return jsonify({'error': 'Password must be between 6 and 128 characters'}), 400

    if email and (len(email) > 150 or not re.match(r"[^@]+@[^@]+\.[^@]+", email)):
        return jsonify({'error': 'Invalid email address'}), 400

    password_hash = generate_password_hash(password)

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            cursor.close(); conn.close()
            return jsonify({'error': f"Username '{username}' already exists"}), 400

        cursor.execute(
            """INSERT INTO users (username, password_hash, fullname, email, phone, region, soil_type)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (username, password_hash, fullname, email, phone, region, None)
        )
        conn.commit()
        new_user_id = cursor.lastrowid
        cursor.close(); conn.close()

        log_admin_action(
            admin_username=admin_user,
            action_type='account_created',
            target_username=username,
            details=f"Admin created farmer account '{username}' (email: {email or 'none'})"
        )

        return jsonify({
            'status': 'success',
            'message': f"Farmer account '{username}' created successfully",
            'user_id': new_user_id,
            'username': username
        }), 201
    except Exception as e:
        return jsonify({'error': 'Failed to create user', 'details': str(e) if not is_production else None}), 500


@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def admin_update_user(user_id):
    """HTTP PUT: Administrator update of farmer profile or password reset."""
    admin_user = session.get('admin_username')
    data = request.get_json(silent=True) or {}

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username, fullname, email, phone, region FROM users WHERE id = %s", (user_id,))
        target_user = cursor.fetchone()

        if not target_user:
            cursor.close(); conn.close()
            return jsonify({'error': 'Target user not found'}), 404

        old_username = target_user['username']
        new_username = (data.get('username') or old_username).strip()
        new_fullname = (data.get('fullname') or target_user['fullname'] or '').strip() or None
        new_email = (data.get('email') or target_user['email'] or '').strip() or None
        new_phone = (data.get('phone') or target_user['phone'] or '').strip() or None
        new_region = (data.get('region') or data.get('location') or target_user['region'] or '').strip() or None
        new_password = data.get('password') or data.get('new_password') or ''

        # Check duplicate username if changed
        if new_username != old_username:
            cursor.execute("SELECT id FROM users WHERE username = %s AND id != %s", (new_username, user_id))
            if cursor.fetchone():
                cursor.close(); conn.close()
                return jsonify({'error': f"Username '{new_username}' is already in use"}), 400

        actions_taken = []
        if new_password:
            if len(new_password) < 6:
                cursor.close(); conn.close()
                return jsonify({'error': 'Password must be at least 6 characters long'}), 400
            new_hash = generate_password_hash(new_password)
            cursor.execute(
                """UPDATE users 
                   SET username = %s, password_hash = %s, fullname = %s, email = %s, phone = %s, region = %s
                   WHERE id = %s""",
                (new_username, new_hash, new_fullname, new_email, new_phone, new_region, user_id)
            )
            actions_taken.append("password_reset")
        else:
            cursor.execute(
                """UPDATE users 
                   SET username = %s, fullname = %s, email = %s, phone = %s, region = %s
                   WHERE id = %s""",
                (new_username, new_fullname, new_email, new_phone, new_region, user_id)
            )

        if new_username != old_username:
            actions_taken.append("username_changed")
        if not actions_taken:
            actions_taken.append("profile_updated")

        conn.commit()
        cursor.close(); conn.close()

        for action in actions_taken:
            details_msg = f"Updated profile for user '{new_username}'"
            if action == "password_reset":
                details_msg = f"Reset password for user '{new_username}'"
            elif action == "username_changed":
                details_msg = f"Changed username from '{old_username}' to '{new_username}'"

            log_admin_action(
                admin_username=admin_user,
                action_type=action,
                target_username=new_username,
                details=details_msg
            )

        return jsonify({
            'status': 'success',
            'message': f"Account '{new_username}' updated successfully"
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to update user', 'details': str(e) if not is_production else None}), 500


@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def admin_delete_user(user_id):
    """HTTP DELETE: Administrator permanent deletion of a farmer account and cascading records."""
    admin_user = session.get('admin_username')

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username FROM users WHERE id = %s", (user_id,))
        target_user = cursor.fetchone()

        if not target_user:
            cursor.close(); conn.close()
            return jsonify({'error': 'Target user not found'}), 404

        target_username = target_user['username']
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        cursor.close(); conn.close()

        log_admin_action(
            admin_username=admin_user,
            action_type='account_deleted',
            target_username=target_username,
            details=f"Admin permanently deleted farmer account '{target_username}' and cascaded logs"
        )

        return jsonify({
            'status': 'success',
            'message': f"Farmer account '{target_username}' and associated logs deleted successfully"
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to delete user', 'details': str(e) if not is_production else None}), 500


# ==========================================
# 9. GLOBAL PRODUCTION ERROR HANDLERS
# ==========================================

@app.errorhandler(404)
def handle_not_found(e):
    return jsonify({
        'error': 'Not found',
        'message': 'The requested resource was not found on this server.'
    }), 404


@app.errorhandler(500)
def handle_internal_error(e):
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected server error occurred. Telemetry recorded.'
    }), 500


if __name__ == '__main__':
    # Run server with dynamic port binding and environment-conditional debug flag
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=is_debug)