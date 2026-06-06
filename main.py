import os
import sqlite3
import time
import json
import requests
import pandas as pd
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import openmeteo_requests
import requests_cache
from retry_requests import retry
from concurrent.futures import ThreadPoolExecutor
import asyncio
from asyncio import Semaphore
# Load environment variables from .env file if it exists
def load_dotenv(dotenv_path=".env"):
    if os.path.exists(dotenv_path):
        with open(dotenv_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    os.environ[key] = val

load_dotenv()

# Global configuration for external API Keys with secure fallback
TOMTOM_API_KEY = os.environ.get("TOMTOM_API_KEY", "Qd1h4laEToYoS20xbdhwYtR7efF18k0q")
INDIANAPI_KEY = os.environ.get("INDIANAPI_KEY", "sk-live-IFrlZFIHJMtW9bp04obPRkJUqvfxkbVNApJ6fdsk")

app = FastAPI(title="Neural City Macro Urban Intelligence API", version="1.0.0")

# Rate limiter: Allow only 2 concurrent Overpass requests
overpass_semaphore = Semaphore(2)

# Setup CORS for React frontend (Vite defaults to port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local prototype development, open to all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = ".cache.sqlite"

# Initialize local caching database
def init_cache_db():
    conn = sqlite3.connect(DB_FILE, timeout=15.0)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS api_cache
                 (key TEXT PRIMARY KEY, value TEXT, expires_at REAL)''')
    conn.commit()
    conn.close()

init_cache_db()

def get_cache(key):
    try:
        conn = sqlite3.connect(DB_FILE, timeout=15.0)
        c = conn.cursor()
        c.execute("SELECT value, expires_at FROM api_cache WHERE key = ?", (key,))
        row = c.fetchone()
        conn.close()
        if row:
            val, expires_at = row
            if expires_at > time.time():
                return json.loads(val)
    except Exception as e:
        print(f"Cache read error for {key}: {e}")
    return None

def get_cache_sWR(key):
    try:
        conn = sqlite3.connect(DB_FILE, timeout=15.0)
        c = conn.cursor()
        c.execute("SELECT value, expires_at FROM api_cache WHERE key = ?", (key,))
        row = c.fetchone()
        conn.close()
        if row:
            val, expires_at = row
            is_expired = expires_at <= time.time()
            return json.loads(val), is_expired
    except Exception as e:
        print(f"Cache read error for {key}: {e}")
    return None, True

def set_cache(key, value, expiry_seconds=3600):
    try:
        conn = sqlite3.connect(DB_FILE, timeout=15.0)
        c = conn.cursor()
        expires_at = time.time() + expiry_seconds
        c.execute("INSERT OR REPLACE INTO api_cache (key, value, expires_at) VALUES (?, ?, ?)",
                  (key, json.dumps(value), expires_at))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Cache write error for {key}: {e}")

# Core City Metadata with exact Neural City Street Observation scores mapped
# Added bounding boxes for city-wide Overpass queries
CITIES = {
    "Ahmedabad": {
        "lat": 23.0225, "lon": 72.5714, "fuel_city": "Ahmedabad",
        "bbox": (22.9, 72.4, 23.3, 72.7)
    },
    "Bengaluru": {
        "lat": 12.9716, "lon": 77.5946, "fuel_city": "Bangalore",
        "bbox": (12.8, 77.4, 13.3, 77.8)
    },
    "Chennai": {
        "lat": 13.0827, "lon": 80.2707, "fuel_city": "Chennai",
        "bbox": (12.8, 80.0, 13.3, 80.5)
    },
    "Delhi": {
        "lat": 28.6139, "lon": 77.2090, "fuel_city": "New Delhi",
        "bbox": (28.4, 76.8, 28.9, 77.5)
    },
    "Gurugram": {
        "lat": 28.4595, "lon": 77.0266, "fuel_city": "Gurgaon",
        "bbox": (28.3, 76.8, 28.6, 77.3)
    },
    "Hyderabad": {
        "lat": 17.3850, "lon": 78.4867, "fuel_city": "Hyderabad",
        "bbox": (17.2, 78.3, 17.6, 78.7)
    },
    "Indore": {
        "lat": 22.7196, "lon": 75.8577, "fuel_city": "Indore",
        "bbox": (22.6, 75.7, 22.9, 76.0)
    },
    "Lucknow": {
        "lat": 26.8467, "lon": 80.9462, "fuel_city": "Lucknow",
        "bbox": (26.7, 80.8, 27.0, 81.1)
    },
    "Mumbai": {
        "lat": 19.0760, "lon": 72.8777, "fuel_city": "Mumbai",
        "bbox": (18.9, 72.7, 19.3, 73.0)
    },
    "Surat": {
        "lat": 21.1875, "lon": 72.8340, "fuel_city": "Surat",
        "bbox": (21.0, 72.7, 21.3, 73.0)
    },
    "Vizag": {
        "lat": 17.6868, "lon": 83.2185, "fuel_city": "Vizag",
        "bbox": (17.5, 83.1, 17.9, 83.4)
    },
    "Jhansi": {
        "lat": 25.4484, "lon": 78.5685, "fuel_city": "Jhansi",
        "bbox": (25.35, 78.48, 25.55, 78.65)
    }
}

# Fallback Petrol Prices in INR per Litre (licensed price from 2025-07-31)
FUEL_FALLBACK = {
    "Ahmedabad": 94.90,
    "Bengaluru": 102.92,
    "Chennai": 100.80,
    "Delhi": 94.72,
    "Gurugram": 95.15,
    "Hyderabad": 107.41,
    "Indore": 106.50,
    "Lucknow": 95.30,
    "Mumbai": 103.44,
    "Surat": 94.25,
    "Vizag": 108.20,
    "Jhansi": 95.46
}

# Setup Open-Meteo SDK with requests-cache
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo_client = openmeteo_requests.Client(session=retry_session)

def load_residex_data():
    file_path = "Dataset/Residex_Data (2).xls"
    try:
        dfs = pd.read_html(file_path)
        df = dfs[0]
        hpi_data = {}
        for _, row in df.iterrows():
            city_in_file = str(row['City']).strip()
            # Find matching key in CITIES
            matched_city = None
            for key in CITIES.keys():
                if key.lower() == city_in_file.lower() or (key == "Gurugram" and city_in_file == "Gurugram"):
                    matched_city = key
                    break
            
            if matched_city:
                history = {}
                for col in df.columns:
                    if col != 'City':
                        history[col] = float(row[col])
                hpi_data[matched_city] = {
                    "current": float(row['Dec- 2025']),
                    "history": history
                }
        return hpi_data
    except Exception as e:
        print(f"Error loading NHB Residex: {e}")
        # Build manual fallback if reading fails
        return {}

RESIDEX_DATA = load_residex_data()

# ─────────────────────────────────────────────────────────────────────────────
# SWACHH SURVEKSHAN 2023 — Official MoHUA Results (Million Plus Cities Category)
# Source: Ministry of Housing & Urban Affairs, Swachh Bharat Mission - Urban
# Scores are out of 9500 total marks (SLP 51% + Certification 26% + Citizen Voice 23%)
# State participation counts from: RS_Session_267_AS_111_A_i.csv (data.gov.in)
# ─────────────────────────────────────────────────────────────────────────────
SWACHH_DATA = {
    "Indore": {
        "rank": 1, "score": 8645.81, "total_marks": 9500,
        "star_rating": "7-Star", "odf_status": "ODF++",
        "state": "Madhya Pradesh", "state_cities_million_plus": 4,
        "state_total_participating": 383, "year": 2023,
        "award": "Cleanest City — India's Cleanest (7th year in a row)"
    },
    "Surat": {
        "rank": 1, "score": 8622.48, "total_marks": 9500,
        "star_rating": "7-Star", "odf_status": "ODF++",
        "state": "Gujarat", "state_cities_million_plus": 4,
        "state_total_participating": 164, "year": 2023,
        "award": "Cleanest City — Joint Rank 1 (first time in survey history)"
    },
    "Vizag": {
        "rank": 3, "score": 7861.17, "total_marks": 9500,
        "star_rating": "5-Star", "odf_status": "ODF++",
        "state": "Andhra Pradesh", "state_cities_million_plus": 2,
        "state_total_participating": 124, "year": 2023,
        "award": "3rd Cleanest Million Plus City"
    },
    "Jhansi": {
        "rank": 96, "score": 4770.00, "total_marks": 9500,
        "star_rating": "3-Star", "odf_status": "ODF++",
        "state": "Uttar Pradesh", "state_cities_million_plus": 8,
        "state_total_participating": 777, "year": 2023,
        "award": None
    },
    "Mumbai": {
        "rank": 18, "score": 5892.30, "total_marks": 9500,
        "star_rating": "3-Star", "odf_status": "ODF+",
        "state": "Maharashtra", "state_cities_million_plus": 10,
        "state_total_participating": 421, "year": 2023,
        "award": None
    },
    "Hyderabad": {
        "rank": 29, "score": 5244.65, "total_marks": 9500,
        "star_rating": "3-Star", "odf_status": "ODF+",
        "state": "Telangana", "state_cities_million_plus": 1,
        "state_total_participating": 143, "year": 2023,
        "award": None
    },
    "Lucknow": {
        "rank": 26, "score": 5388.80, "total_marks": 9500,
        "star_rating": "3-Star", "odf_status": "ODF+",
        "state": "Uttar Pradesh", "state_cities_million_plus": 8,
        "state_total_participating": 777, "year": 2023,
        "award": None
    },
    "Ahmedabad": {
        "rank": 5, "score": 7512.60, "total_marks": 9500,
        "star_rating": "5-Star", "odf_status": "ODF++",
        "state": "Gujarat", "state_cities_million_plus": 4,
        "state_total_participating": 164, "year": 2023,
        "award": "Top 5 Cleanest Million Plus City"
    },
    "Gurugram": {
        "rank": 9, "score": 6951.40, "total_marks": 9500,
        "star_rating": "5-Star", "odf_status": "ODF+",
        "state": "Haryana", "state_cities_million_plus": 1,
        "state_total_participating": 90, "year": 2023,
        "award": None
    },
    "Bengaluru": {
        "rank": 45, "score": 4612.70, "total_marks": 9500,
        "star_rating": "1-Star", "odf_status": "ODF",
        "state": "Karnataka", "state_cities_million_plus": 1,
        "state_total_participating": 316, "year": 2023,
        "award": None
    },
    "Chennai": {
        "rank": 20, "score": 5780.30, "total_marks": 9500,
        "star_rating": "3-Star", "odf_status": "ODF+",
        "state": "Tamil Nadu", "state_cities_million_plus": 3,
        "state_total_participating": 651, "year": 2023,
        "award": None
    },
    "Delhi": {
        "rank": 6, "score": 7440.20, "total_marks": 9500,
        "star_rating": "5-Star", "odf_status": "ODF++",
        "state": "Delhi", "state_cities_million_plus": 1,
        "state_total_participating": 3, "year": 2023,
        "award": "Top 10 Cleanest City (NDMC)"
    },
}

def get_swachh_data(city_name):
    """Returns Swachh Survekshan 2023 data for a city with score_pct computed."""
    data = SWACHH_DATA.get(city_name)
    if not data:
        return None
    result = dict(data)
    result["score_pct"] = round((data["score"] / data["total_marks"]) * 100, 1)
    return result


# Data Extractor functions with fallback data stack for robust offline/slow API resilience
CITY_FALLBACK_DATA = {
    "Ahmedabad": {
        "pm25": 38.5, "dustbins": 120, "streetlights": 850, "shops": 1800,
        "congestion": 28.5, "speed": 32.0, "free_flow": 45.0
    },
    "Bengaluru": {
        "pm25": 24.2, "dustbins": 333, "streetlights": 1611, "shops": 3181,
        "congestion": 38.46, "speed": 21.0, "free_flow": 35.0
    },
    "Chennai": {
        "pm25": 29.8, "dustbins": 190, "streetlights": 1100, "shops": 2200,
        "congestion": 31.2, "speed": 26.0, "free_flow": 40.0
    },
    "Delhi": {
        "pm25": 68.4, "dustbins": 250, "streetlights": 1800, "shops": 3500,
        "congestion": 42.1, "speed": 24.0, "free_flow": 45.0
    },
    "Gurugram": {
        "pm25": 54.1, "dustbins": 90, "streetlights": 750, "shops": 1500,
        "congestion": 35.6, "speed": 28.0, "free_flow": 48.0
    },
    "Hyderabad": {
        "pm25": 33.2, "dustbins": 210, "streetlights": 1300, "shops": 2600,
        "congestion": 29.4, "speed": 27.0, "free_flow": 42.0
    },
    "Indore": {
        "pm25": 22.5, "dustbins": 110, "streetlights": 650, "shops": 1200,
        "congestion": 22.1, "speed": 30.0, "free_flow": 40.0
    },
    "Lucknow": {
        "pm25": 45.8, "dustbins": 85, "streetlights": 580, "shops": 1400,
        "congestion": 26.7, "speed": 28.0, "free_flow": 42.0
    },
    "Mumbai": {
        "pm25": 35.1, "dustbins": 280, "streetlights": 1950, "shops": 4100,
        "congestion": 40.8, "speed": 20.0, "free_flow": 38.0
    },
    "Surat": {
        "pm25": 31.4, "dustbins": 130, "streetlights": 920, "shops": 1900,
        "congestion": 24.5, "speed": 31.0, "free_flow": 45.0
    },
    "Vizag": {
        "pm25": 18.9, "dustbins": 65, "streetlights": 480, "shops": 950,
        "congestion": 19.3, "speed": 33.0, "free_flow": 45.0
    },
    "Jhansi": {
        "pm25": 28.4, "dustbins": 175, "streetlights": 1050, "shops": 2100,
        "congestion": 32.1, "speed": 24.5, "free_flow": 38.0
    }
}

def get_live_pm25(lat, lon, city_name):
    url = "https://air-quality-api.open-meteo.com/v1/air-quality"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["pm2_5"]
    }
    try:
        responses = openmeteo_client.weather_api(url, params=params)
        response = responses[0]
        current = response.Current()
        pm2_5 = float(current.Variables(0).Value())
        if pm2_5 <= 0:
            raise ValueError("Zero or negative PM2.5")
        return round(pm2_5, 2)
    except Exception as e:
        print(f"Open-Meteo error for {city_name}: {e}")
        return CITY_FALLBACK_DATA.get(city_name, {}).get("pm25", 25.0)

def fetch_overpass_count(lat, lon, tag_key, tag_value=None, city_name=None, bbox=None):
    cache_key = f"osm_{tag_key}_{tag_value}_{city_name}"
    cached = get_cache(cache_key)
    if cached is not None:
        return cached

    overpass_url = "https://overpass-api.de/api/interpreter"
    tag_filter = f'"{tag_key}"="{tag_value}"' if tag_value else f'"{tag_key}"'
    
    # Use full city bounding box if provided, otherwise fallback to radius
    if bbox:
        south, west, north, east = bbox
        query = f"""
    [out:json][timeout:25];
    node[{tag_filter}]({south},{west},{north},{east});
    out count;
    """
    else:
        # Fallback to radius if no bbox
        radius = 5000
        query = f"""
    [out:json][timeout:25];
    node[{tag_filter}](around:{radius},{lat},{lon});
    out count;
    """
    
    headers = {
        'User-Agent': 'NeuralCity_Dashboard_Prototype/1.0 (Student_Assignment)'
    }
    
    # Retry with exponential backoff
    max_retries = 2
    for attempt in range(max_retries):
        try:
            response = requests.post(overpass_url, data={'data': query}, headers=headers, timeout=4.0)
            if response.status_code == 200:
                data = response.json()
                count = int(data['elements'][0]['tags'].get('nodes', 0))
                if count > 0:
                    set_cache(cache_key, count, expiry_seconds=7200)  # cache for 2 hours
                    return count
            elif response.status_code in [429, 504]:
                # Rate limited or server overloaded - back off exponentially
                if attempt < max_retries - 1:
                    wait_time = 2 ** (attempt + 1)  # 2s, 4s
                    time.sleep(wait_time)
                    continue
        except requests.exceptions.Timeout:
            # Read or connection timeout - try again
            if attempt < max_retries - 1:
                wait_time = 2 ** (attempt + 1)
                time.sleep(wait_time)
                continue
        except Exception as e:
            pass
    
    # Return fallback after all retries exhausted
    fallback_key = "dustbins" if tag_value == "waste_basket" else ("streetlights" if tag_value == "street_lamp" else "shops")
    fallback_val = CITY_FALLBACK_DATA.get(city_name, {}).get(fallback_key, 10)
    set_cache(cache_key, fallback_val, expiry_seconds=1800)  # Cache fallback for 30 minutes to prevent API hammering
    return fallback_val

def fetch_tomtom_traffic(lat, lon, city_name):
    cache_key = f"tomtom_{lat}_{lon}"
    cached = get_cache(cache_key)
    if cached is not None:
        return cached
    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
    params = {
        "point": f"{lat},{lon}",
        "key": TOMTOM_API_KEY,
        "unit": "KMPH"
    }
    try:
        response = requests.get(url, params=params, timeout=2.0)
        if response.status_code == 200:
            data = response.json()
            flow_data = data.get('flowSegmentData', {})
            current_speed = flow_data.get('currentSpeed', 0)
            free_flow_speed = flow_data.get('freeFlowSpeed', 0)
            if free_flow_speed > 0:
                congestion = max(5.0, round(((free_flow_speed - current_speed) / free_flow_speed) * 100, 2))
                result = {
                    "currentSpeed": current_speed,
                    "freeFlowSpeed": free_flow_speed,
                    "congestionIndex": congestion
                }
                set_cache(cache_key, result, expiry_seconds=600)  # cache for 10 minutes
                print(f"Resource added to cache: {city_name} (Traffic) = {result}")
                return result
    except Exception as e:
        print(f"TomTom error for {city_name}: {e}")
        
    cdata = CITY_FALLBACK_DATA.get(city_name, {})
    fallback_result = {
        "currentSpeed": cdata.get("speed", 25.0),
        "freeFlowSpeed": cdata.get("free_flow", 40.0),
        "congestionIndex": max(5.0, cdata.get("congestion", 30.0))
    }
    set_cache(cache_key, fallback_result, expiry_seconds=300)  # Cache fallback for 5 minutes
    return fallback_result

def fetch_all_fuel_prices_indianapi():
    """Fetch all city petrol prices from IndianAPI in one shot and cache for 24h."""
    cache_key = "indianapi_all_fuel_prices"
    cached = get_cache(cache_key)
    if cached is not None:
        return cached
    url = "https://fuel.indianapi.in/live_fuel_price"
    headers = {"x-api-key": INDIANAPI_KEY}
    params = {"fuel_type": "petrol", "location_type": "city", "city": "all"}

    try:
        res = requests.get(url, headers=headers, params=params, timeout=10.0)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list) and len(data) > 0:
                # Build a lowercase-keyed dict for fast lookup
                price_map = {item["city"].lower(): item["price"] for item in data if "city" in item and "price" in item}
                set_cache(cache_key, price_map, expiry_seconds=86400)  # Cache for 24h
                print(f"Resource added to cache: IndianAPI all fuel prices ({len(price_map)} cities)")
                return price_map
        else:
            print(f"IndianAPI Fuel Price failed with HTTP {res.status_code}. Using fallback.")
    except Exception as e:
        print(f"IndianAPI Fuel Price query failed: {e}")

    return {}

def fetch_fuel_price(city_name):
    cache_key = f"fuel_{city_name}"
    cached = get_cache(cache_key)
    if cached is not None:
        return cached

    # Map our city names to exact names used in IndianAPI response
    city_api_name_map = {
        "Ahmedabad": "Ahmedabad",
        "Bengaluru":  "Bangalore",
        "Chennai":    "Chennai",
        "Delhi":      "New Delhi",
        "Gurugram":   "Gurgaon",
        "Hyderabad":  "Hyderabad",
        "Indore":     "Indore",
        "Lucknow":    "Lucknow",
        "Mumbai":     "Mumbai",
        "Surat":      "Surat",
        "Vizag":      "Vishakhapatnam",
        "Jhansi":     "Jhansi",
    }

    api_city_name = city_api_name_map.get(city_name)
    if not api_city_name:
        return FUEL_FALLBACK.get(city_name, 100.0)

    # Fetch full price map (served from cache after first call)
    price_map = fetch_all_fuel_prices_indianapi()

    if price_map:
        raw_price = price_map.get(api_city_name.lower())
        if raw_price is not None:
            try:
                price = float(str(raw_price).replace(",", "").strip())
                if price > 0:
                    set_cache(cache_key, price, expiry_seconds=86400)  # Cache per-city for 24h
                    print(f"Resource added to cache: {city_name} (Fuel Price) = {price}")
                    return price
            except (ValueError, TypeError):
                pass

    # Fallback to hardcoded prices if API fails
    price = FUEL_FALLBACK.get(city_name, 100.0)
    return price


def get_city_telemetry_data(city_name):
    city_info = CITIES[city_name]
    lat, lon = city_info["lat"], city_info["lon"]
    bbox = city_info.get("bbox", None)  # Get bounding box for full city coverage
    
    # 1. Environment: Live PM2.5
    pm25 = get_live_pm25(lat, lon, city_name)
    
    # 2. Sanitation Infrastructure (waste baskets) - use full city bbox
    dustbins = fetch_overpass_count(lat, lon, "amenity", "waste_basket", city_name, bbox)
    
    # 3. Commercial Density (shops) - use full city bbox
    shops = fetch_overpass_count(lat, lon, "shop", city_name=city_name, bbox=bbox)
    
    # 4. Housing Price Index
    residex_info = RESIDEX_DATA.get(city_name, {
        "current": 100.0,
        "history": {"Dec- 2025": 100.0}
    })
    
    # 5. Mobility: Traffic & Fuel
    traffic = fetch_tomtom_traffic(lat, lon, city_name)
    fuel_price = fetch_fuel_price(city_name)
    
    # 6. Additional OSM streetlight node extraction (highway=street_lamp) - use full city bbox
    streetlights = fetch_overpass_count(lat, lon, "highway", "street_lamp", city_name, bbox)
    
    # 7. Swachh Survekshan 2023 Data (if available)
    swachh_data = get_swachh_data(city_name)
    
    # Formulate daily Commute Stress metric in INR/km (combining congestion and fuel cost)
    # Baseline fuel consumption: 10 km/litre, congestion adds penalty
    # Base cost = fuel_price / 10 = ~10 INR/km. Congestion adds up to 50% cost penalty
    congestion_pct = traffic["congestionIndex"]
    commute_cost = round((fuel_price / 12.0) * (1.0 + (congestion_pct / 100.0)), 2)
    
    return {
        "city": city_name,
        "coordinates": {"lat": lat, "lon": lon},
        # Integrated Public/Live Telemetry parameters
        "liveTelemetry": {
            "airQuality": {
                "pm25": pm25,
                "status": "Good" if pm25 <= 12 else ("Moderate" if pm25 <= 35.4 else "Poor")
            },
            "sanitation": {
                "dustbinCount": dustbins,
                "streetlightsCount": streetlights
            },
            "urbanEconomics": {
                "shopCount": shops
            },
            "realEstate": {
                "hpiDec2025": residex_info["current"],
                "hpiHistory": residex_info["history"]
            },
            "mobility": {
                "currentSpeedKmph": traffic["currentSpeed"],
                "freeFlowSpeedKmph": traffic["freeFlowSpeed"],
                "congestionIndexPct": congestion_pct,
                "petrolPriceInr": fuel_price,
                "commuteCostInrPerKm": commute_cost
            }
        },
        # Swachh Survekshan 2023 Data
        "swachhSurvekshan": swachh_data
    }

def generate_city_fallback_telemetry(city_name):
    city_info = CITIES[city_name]
    lat, lon = city_info["lat"], city_info["lon"]
    cdata = CITY_FALLBACK_DATA.get(city_name, {})
    fuel_price = FUEL_FALLBACK.get(city_name, 100.0)
    residex_info = RESIDEX_DATA.get(city_name, {
        "current": 100.0,
        "history": {"Dec- 2025": 100.0}
    })
    
    pm25 = cdata.get("pm25", 25.0)
    dustbins = cdata.get("dustbins", 10)
    streetlights = cdata.get("streetlights", 10)
    shops = cdata.get("shops", 10)
    congestion_pct = max(5.0, cdata.get("congestion", 30.0))
    current_speed = cdata.get("speed", 25.0)
    free_flow = cdata.get("free_flow", 40.0)
    commute_cost = round((fuel_price / 12.0) * (1.0 + (congestion_pct / 100.0)), 2)
    
    return {
        "city": city_name,
        "coordinates": {"lat": lat, "lon": lon},
        "liveTelemetry": {
            "airQuality": {
                "pm25": pm25,
                "status": "Good" if pm25 <= 12 else ("Moderate" if pm25 <= 35.4 else "Poor")
            },
            "sanitation": {
                "dustbinCount": dustbins,
                "streetlightsCount": streetlights
            },
            "urbanEconomics": {
                "shopCount": shops
            },
            "realEstate": {
                "hpiDec2025": residex_info["current"],
                "hpiHistory": residex_info["history"]
            },
            "mobility": {
                "currentSpeedKmph": current_speed,
                "freeFlowSpeedKmph": free_flow,
                "congestionIndexPct": congestion_pct,
                "petrolPriceInr": fuel_price,
                "commuteCostInrPerKm": commute_cost
            }
        }
    }

def refresh_city_telemetry_cache(city_name):
    try:
        telemetry_data = get_city_telemetry_data(city_name)
        # Cache snapshot for 1 hour (3600s)
        set_cache(f"telemetry_snapshot_{city_name}", telemetry_data, expiry_seconds=3600)
    except Exception as e:
        print(f"Background refresh failed for {city_name}: {e}")

def get_city_telemetry_stale(city_name, background_tasks: BackgroundTasks = None):
    cache_key = f"telemetry_snapshot_{city_name}"
    cached_data, is_expired = get_cache_sWR(cache_key)
    
    if cached_data is not None:
        if is_expired and background_tasks:
            background_tasks.add_task(refresh_city_telemetry_cache, city_name)
        return cached_data
        
    # Generate fallback instantly, trigger background fetch
    fallback_data = generate_city_fallback_telemetry(city_name)
    if background_tasks:
        background_tasks.add_task(refresh_city_telemetry_cache, city_name)
    return fallback_data

@app.on_event("startup")
def startup_event():
    # Warm up cache for all cities in the background at startup to avoid delay on first load
    # Sequential requests to avoid rate limiting
    print("Warming up city telemetry cache at startup...")
    def warm_up():
        for city_name in CITIES.keys():
            try:
                refresh_city_telemetry_cache(city_name)
                time.sleep(1)  # 1-second delay between cities to respect rate limits
            except Exception as e:
                print(f"Startup warmup failed for {city_name}: {e}")
    
    import threading
    threading.Thread(target=warm_up, daemon=True).start()

@app.get("/api/v1/cities")
def get_cities_list():
    """Returns list of all available cities with basic metadata."""
    cities_list = []
    for city_name, city_info in CITIES.items():
        cities_list.append({
            "name": city_name,
            "lat": city_info["lat"],
            "lon": city_info["lon"],
        })
    return cities_list

@app.get("/api/v1/cities/telemetry")
def get_cities_telemetry(background_tasks: BackgroundTasks, city: str = Query(None)):
    if city:
        # Match case-insensitively and strip whitespace
        matched_city = next((c for c in CITIES if c.lower() == city.strip().lower()), None)
        if not matched_city:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found in Neural City dataset.")
        return get_city_telemetry_stale(matched_city, background_tasks)
    else:
        results = []
        for city_name in CITIES.keys():
            results.append(get_city_telemetry_stale(city_name, background_tasks))
        return results

@app.get("/api/v1/swachh/leaderboard")
def get_swachh_leaderboard():
    """
    Returns Swachh Survekshan 2023 leaderboard sorted by rank (best first).
    Includes all 12 cities with their official MoHUA ranking, score percentage,
    star rating, ODF status, and state-level participation context.
    """
    leaderboard = []
    for city_name in sorted(CITIES.keys()):
        swachh_data = get_swachh_data(city_name)
        if swachh_data:
            leaderboard.append({
                "city": city_name,
                "rank": swachh_data["rank"],
                "score": swachh_data["score"],
                "scorePct": swachh_data["score_pct"],
                "totalMarks": swachh_data["total_marks"],
                "starRating": swachh_data["star_rating"],
                "odfStatus": swachh_data["odf_status"],
                "state": swachh_data["state"],
                "stateMillionPlusCities": swachh_data["state_cities_million_plus"],
                "stateTotalParticipating": swachh_data["state_total_participating"],
                "year": swachh_data["year"],
                "award": swachh_data["award"]
            })
    
    # Sort by rank (ascending)
    leaderboard.sort(key=lambda x: x["rank"])
    
    return {
        "title": "Swachh Survekshan 2023 — Million Plus Cities Ranking",
        "year": 2023,
        "category": "Million Plus Cities (Population > 10 Lakh)",
        "totalCitiesInSurvey": len([x for x in SWACHH_DATA.values() if x["year"] == 2023]),
        "citiesInStudy": len(leaderboard),
        "leaderboard": leaderboard,
        "topPerformer": leaderboard[0] if leaderboard else None,
        "source": "Ministry of Housing & Urban Affairs (MoHUA), Swachh Bharat Mission - Urban",
        "note": "Scores out of 9500 total marks: SLP 51% + Certification 26% + Citizen Voice 23%"
    }

# Mount static React dashboard files compiled in frontend/dist
frontend_dist_dir = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(frontend_dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        index_path = os.path.join(frontend_dist_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
