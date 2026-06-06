import { FALLBACK_CITIES, FALLBACK_TELEMETRY, FALLBACK_SWACHH_LEADERBOARD } from '../fallbackData';

const TOMTOM_API_KEY = "Qd1h4laEToYoS20xbdhwYtR7efF18k0q"; // Public fallback key

const CACHE_KEY = "dc_urban_telemetry_cache";

const FUEL_FALLBACK = {
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
};

// Initialize localStorage cache if not present
const initializeCache = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) {
    const initialCache = {};
    FALLBACK_TELEMETRY.forEach(cityObj => {
      initialCache[cityObj.city] = {
        ...cityObj,
        _aqiUpdatedAt: 0,
        _trafficUpdatedAt: 0,
        _osmUpdatedAt: 0
      };
    });
    localStorage.setItem(CACHE_KEY, JSON.stringify(initialCache));
    return initialCache;
  }
  return JSON.parse(cached);
};

export const getCitiesList = () => {
  return FALLBACK_CITIES;
};

// Compile Swachh Leaderboard sorting by rank
export const getSwachhLeaderboard = () => {
  const cache = initializeCache();
  const leaderboard = [];
  
  Object.keys(cache).forEach(city => {
    const cityData = cache[city];
    if (cityData.swachhSurvekshan) {
      const scorePct = parseFloat(((cityData.swachhSurvekshan.score / cityData.swachhSurvekshan.total_marks) * 100).toFixed(1));
      leaderboard.push({
        city: cityData.city,
        rank: cityData.swachhSurvekshan.rank,
        score: cityData.swachhSurvekshan.score,
        scorePct: scorePct,
        totalMarks: cityData.swachhSurvekshan.total_marks,
        starRating: cityData.swachhSurvekshan.star_rating,
        odfStatus: cityData.swachhSurvekshan.odf_status,
        state: cityData.swachhSurvekshan.state,
        stateMillionPlusCities: cityData.swachhSurvekshan.stateMillionPlusCities || 2,
        stateTotalParticipating: cityData.swachhSurvekshan.stateTotalParticipating || 120,
        year: cityData.swachhSurvekshan.year || 2023,
        award: cityData.swachhSurvekshan.award
      });
    }
  });

  leaderboard.sort((a, b) => a.rank - b.rank);

  return {
    ...FALLBACK_SWACHH_LEADERBOARD,
    leaderboard,
    topPerformer: leaderboard[0] || null,
    citiesInStudy: leaderboard.length
  };
};

// Fetch Live Air Quality PM2.5 from Open-Meteo
const fetchLiveAqi = async (lat, lon) => {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Open-Meteo API failed");
  const data = await res.json();
  const pm25 = parseFloat((data?.current?.pm2_5 || 25.0).toFixed(2));
  return {
    pm25,
    status: pm25 <= 12 ? "Good" : (pm25 <= 35.4 ? "Moderate" : "Poor")
  };
};

// Fetch Live Traffic flow data from TomTom
const fetchLiveTraffic = async (lat, lon) => {
  const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${TOMTOM_API_KEY}&unit=KMPH`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("TomTom API failed");
  const data = await res.json();
  const flow = data?.flowSegmentData || {};
  const currentSpeed = flow.currentSpeed || 25;
  const freeFlowSpeed = flow.freeFlowSpeed || 40;
  const congestion = freeFlowSpeed > 0 ? Math.max(5.0, parseFloat((((freeFlowSpeed - currentSpeed) / freeFlowSpeed) * 100).toFixed(2))) : 30.0;
  return {
    currentSpeed,
    freeFlowSpeed,
    congestionIndexPct: congestion
  };
};

// Fetch Live OSM node counts from Overpass on-demand
const fetchLiveOsmCount = async (lat, lon, tagKey, tagValue, bbox) => {
  const tagFilter = tagValue ? `"${tagKey}"="${tagValue}"` : `"${tagKey}"`;
  const query = (bbox && bbox.length === 4)
    ? `[out:json][timeout:25];node[${tagFilter}](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});out count;`
    : `[out:json][timeout:25];node[${tagFilter}](around:5000,${lat},${lon});out count;`;
  
  const url = "https://overpass-api.de/api/interpreter";
  const res = await fetch(url, {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });
  if (!res.ok) throw new Error("OSM Overpass failed");
  const data = await res.json();
  return parseInt(data?.elements?.[0]?.tags?.nodes || 0);
};

// Get all city telemetry data (returns local cache immediately, then refreshes specified active cities asynchronously)
export const getTelemetryData = (activeCities = [], onUpdate = null) => {
  const cache = initializeCache();
  
  // Return current cache synchronously
  const currentTelemetryArray = Object.values(cache);
  
  // Fire off background refreshes for active/selected cities to keep page load snappy
  if (activeCities.length > 0) {
    Promise.all(activeCities.map(async (cityName) => {
      const cityData = cache[cityName];
      if (!cityData) return;

      const now = Date.now();
      let updated = false;

      // 1. Refresh PM2.5 (1-hour expiry TTL)
      if (now - (cityData._aqiUpdatedAt || 0) > 3600000) {
        try {
          const aqi = await fetchLiveAqi(cityData.coordinates.lat, cityData.coordinates.lon);
          cityData.liveTelemetry.airQuality = aqi;
          cityData._aqiUpdatedAt = now;
          updated = true;
          console.log(`Live AQI refreshed for ${cityName}:`, aqi);
        } catch (e) {
          console.warn(`Failed to fetch live AQI for ${cityName}, using cached data:`, e);
        }
      }

      // 2. Refresh Traffic flow (10-minute expiry TTL)
      if (now - (cityData._trafficUpdatedAt || 0) > 600000) {
        try {
          const traffic = await fetchLiveTraffic(cityData.coordinates.lat, cityData.coordinates.lon);
          cityData.liveTelemetry.mobility.currentSpeedKmph = traffic.currentSpeed;
          cityData.liveTelemetry.mobility.freeFlowSpeedKmph = traffic.freeFlowSpeed;
          cityData.liveTelemetry.mobility.congestionIndexPct = traffic.congestionIndexPct;
          
          // Recalculate Commute Cost per KM
          const petrolPrice = FUEL_FALLBACK[cityName] || 100.0;
          const commuteCost = parseFloat(((petrolPrice / 12.0) * (1.0 + (traffic.congestionIndexPct / 100.0))).toFixed(2));
          cityData.liveTelemetry.mobility.commuteCostInrPerKm = commuteCost;
          cityData.liveTelemetry.mobility.petrolPriceInr = petrolPrice;
          
          cityData._trafficUpdatedAt = now;
          updated = true;
          console.log(`Live Traffic refreshed for ${cityName}:`, traffic);
        } catch (e) {
          console.warn(`Failed to fetch live traffic for ${cityName}, using cached data:`, e);
        }
      }

      // Save updated parameters back to cache
      if (updated) {
        cache[cityName] = cityData;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      }
    })).then(() => {
      // Callback to React component to trigger state updates once background refreshes finish
      if (onUpdate) {
        onUpdate(Object.values(cache));
      }
    });
  }

  return currentTelemetryArray;
};

// Explicit function to force refresh a single city's OSM counts and telemetry
export const forceRefreshCity = async (cityName) => {
  const cache = initializeCache();
  const cityData = cache[cityName];
  if (!cityData) return null;

  const now = Date.now();
  console.log(`Force refreshing all telemetry (including OSM) for ${cityName}...`);

  // 1. Fetch AQI
  try {
    const aqi = await fetchLiveAqi(cityData.coordinates.lat, cityData.coordinates.lon);
    cityData.liveTelemetry.airQuality = aqi;
    cityData._aqiUpdatedAt = now;
  } catch (e) {
    console.error("OSM/AQI force refresh AQI step failed:", e);
  }

  // 2. Fetch Traffic
  try {
    const traffic = await fetchLiveTraffic(cityData.coordinates.lat, cityData.coordinates.lon);
    cityData.liveTelemetry.mobility.currentSpeedKmph = traffic.currentSpeed;
    cityData.liveTelemetry.mobility.freeFlowSpeedKmph = traffic.freeFlowSpeed;
    cityData.liveTelemetry.mobility.congestionIndexPct = traffic.congestionIndexPct;

    const petrolPrice = FUEL_FALLBACK[cityName] || 100.0;
    cityData.liveTelemetry.mobility.commuteCostInrPerKm = parseFloat(((petrolPrice / 12.0) * (1.0 + (traffic.congestionIndexPct / 100.0))).toFixed(2));
    cityData.liveTelemetry.mobility.petrolPriceInr = petrolPrice;
    cityData._trafficUpdatedAt = now;
  } catch (e) {
    console.error("OSM/AQI force refresh traffic step failed:", e);
  }

  // 3. Fetch OSM Infrastructure counts (Waste Baskets & Street Lamps & Shops)
  const bbox = FALLBACK_CITIES.find(c => c.name === cityName)?.bbox || null;
  
  // Waste baskets
  try {
    const dustbins = await fetchLiveOsmCount(cityData.coordinates.lat, cityData.coordinates.lon, "amenity", "waste_basket", bbox);
    cityData.liveTelemetry.sanitation.dustbinCount = dustbins;
    console.log(`Live OSM Waste Baskets for ${cityName}:`, dustbins);
  } catch (e) {
    console.warn("OSM Waste Baskets fetch failed, keeping cache:", e);
  }

  // Streetlights
  try {
    const lamps = await fetchLiveOsmCount(cityData.coordinates.lat, cityData.coordinates.lon, "highway", "street_lamp", bbox);
    cityData.liveTelemetry.sanitation.streetlightsCount = lamps;
    console.log(`Live OSM Street Lamps for ${cityName}:`, lamps);
  } catch (e) {
    console.warn("OSM Street Lamps fetch failed, keeping cache:", e);
  }

  // Shops
  try {
    const shops = await fetchLiveOsmCount(cityData.coordinates.lat, cityData.coordinates.lon, "shop", null, bbox);
    cityData.liveTelemetry.urbanEconomics.shopCount = shops;
    console.log(`Live OSM Shops for ${cityName}:`, shops);
  } catch (e) {
    console.warn("OSM Shops fetch failed, keeping cache:", e);
  }

  cityData._osmUpdatedAt = now;
  cache[cityName] = cityData;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

  return cityData;
};
