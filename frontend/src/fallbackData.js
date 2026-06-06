export const FALLBACK_CITIES = [
  { "name": "Ahmedabad", "lat": 23.0225, "lon": 72.5714 },
  { "name": "Bengaluru", "lat": 12.9716, "lon": 77.5946 },
  { "name": "Chennai", "lat": 13.0827, "lon": 80.2707 },
  { "name": "Delhi", "lat": 28.6139, "lon": 77.2090 },
  { "name": "Gurugram", "lat": 28.4595, "lon": 77.0266 },
  { "name": "Hyderabad", "lat": 17.3850, "lon": 78.4867 },
  { "name": "Indore", "lat": 22.7196, "lon": 75.8577 },
  { "name": "Lucknow", "lat": 26.8467, "lon": 80.9462 },
  { "name": "Mumbai", "lat": 19.0760, "lon": 72.8777 },
  { "name": "Surat", "lat": 21.1875, "lon": 72.8340 },
  { "name": "Vizag", "lat": 17.6868, "lon": 83.2185 },
  { "name": "Jhansi", "lat": 25.4484, "lon": 78.5685 }
];

export const FALLBACK_TELEMETRY = [
  {
    "city": "Ahmedabad",
    "coordinates": { "lat": 23.0225, "lon": 72.5714 },
    "liveTelemetry": {
      "airQuality": { "pm25": 38.5, "status": "Moderate" },
      "sanitation": { "dustbinCount": 120, "streetlightsCount": 850 },
      "urbanEconomics": { "shopCount": 1800 },
      "realEstate": { "hpiDec2025": 149.20, "hpiHistory": { "Dec- 2025": 149.20, "Sep- 2025": 146.50, "Jun- 2025": 143.10 } },
      "mobility": { "currentSpeedKmph": 32.0, "freeFlowSpeedKmph": 45.0, "congestionIndexPct": 28.5, "petrolPriceInr": 94.90, "commuteCostInrPerKm": 10.15 }
    },
    "swachhSurvekshan": { "rank": 5, "score": 7512.60, "total_marks": 9500, "star_rating": "5-Star", "odf_status": "ODF++", "state": "Gujarat", "award": "Top 5 Cleanest Million Plus City" }
  },
  {
    "city": "Bengaluru",
    "coordinates": { "lat": 12.9716, "lon": 77.5946 },
    "liveTelemetry": {
      "airQuality": { "pm25": 24.2, "status": "Good" },
      "sanitation": { "dustbinCount": 333, "streetlightsCount": 1611 },
      "urbanEconomics": { "shopCount": 3181 },
      "realEstate": { "hpiDec2025": 168.50, "hpiHistory": { "Dec- 2025": 168.50, "Sep- 2025": 165.20, "Jun- 2025": 161.40 } },
      "mobility": { "currentSpeedKmph": 21.0, "freeFlowSpeedKmph": 35.0, "congestionIndexPct": 38.46, "petrolPriceInr": 102.92, "commuteCostInrPerKm": 11.85 }
    },
    "swachhSurvekshan": { "rank": 45, "score": 4612.70, "total_marks": 9500, "star_rating": "1-Star", "odf_status": "ODF", "state": "Karnataka", "award": null }
  },
  {
    "city": "Chennai",
    "coordinates": { "lat": 13.0827, "lon": 80.2707 },
    "liveTelemetry": {
      "airQuality": { "pm25": 29.8, "status": "Good" },
      "sanitation": { "dustbinCount": 190, "streetlightsCount": 1100 },
      "urbanEconomics": { "shopCount": 2200 },
      "realEstate": { "hpiDec2025": 156.40, "hpiHistory": { "Dec- 2025": 156.40, "Sep- 2025": 153.20, "Jun- 2025": 150.10 } },
      "mobility": { "currentSpeedKmph": 26.0, "freeFlowSpeedKmph": 40.0, "congestionIndexPct": 31.2, "petrolPriceInr": 100.80, "commuteCostInrPerKm": 11.02 }
    },
    "swachhSurvekshan": { "rank": 20, "score": 5780.30, "total_marks": 9500, "star_rating": "3-Star", "odf_status": "ODF+", "state": "Tamil Nadu", "award": null }
  },
  {
    "city": "Delhi",
    "coordinates": { "lat": 28.6139, "lon": 77.2090 },
    "liveTelemetry": {
      "airQuality": { "pm25": 68.4, "status": "Poor" },
      "sanitation": { "dustbinCount": 250, "streetlightsCount": 1800 },
      "urbanEconomics": { "shopCount": 3500 },
      "realEstate": { "hpiDec2025": 142.80, "hpiHistory": { "Dec- 2025": 142.80, "Sep- 2025": 139.60, "Jun- 2025": 136.20 } },
      "mobility": { "currentSpeedKmph": 25.0, "freeFlowSpeedKmph": 40.0, "congestionIndexPct": 37.5, "petrolPriceInr": 94.72, "commuteCostInrPerKm": 10.85 }
    },
    "swachhSurvekshan": { "rank": 6, "score": 7440.20, "total_marks": 9500, "star_rating": "5-Star", "odf_status": "ODF++", "state": "Delhi", "award": "Top 10 Cleanest City (NDMC)" }
  },
  {
    "city": "Gurugram",
    "coordinates": { "lat": 28.4595, "lon": 77.0266 },
    "liveTelemetry": {
      "airQuality": { "pm25": 54.2, "status": "Moderate" },
      "sanitation": { "dustbinCount": 85, "streetlightsCount": 780 },
      "urbanEconomics": { "shopCount": 1500 },
      "realEstate": { "hpiDec2025": 185.30, "hpiHistory": { "Dec- 2025": 185.30, "Sep- 2025": 181.10, "Jun- 2025": 176.40 } },
      "mobility": { "currentSpeedKmph": 35.0, "freeFlowSpeedKmph": 50.0, "congestionIndexPct": 30.0, "petrolPriceInr": 95.15, "commuteCostInrPerKm": 10.31 }
    },
    "swachhSurvekshan": { "rank": 9, "score": 6951.40, "total_marks": 9500, "star_rating": "5-Star", "odf_status": "ODF+", "state": "Haryana", "award": null }
  },
  {
    "city": "Hyderabad",
    "coordinates": { "lat": 17.3850, "lon": 78.4867 },
    "liveTelemetry": {
      "airQuality": { "pm25": 32.5, "status": "Moderate" },
      "sanitation": { "dustbinCount": 210, "streetlightsCount": 1400 },
      "urbanEconomics": { "shopCount": 2700 },
      "realEstate": { "hpiDec2025": 172.10, "hpiHistory": { "Dec- 2025": 172.10, "Sep- 2025": 168.40, "Jun- 2025": 164.20 } },
      "mobility": { "currentSpeedKmph": 24.0, "freeFlowSpeedKmph": 38.0, "congestionIndexPct": 36.84, "petrolPriceInr": 107.41, "commuteCostInrPerKm": 12.25 }
    },
    "swachhSurvekshan": { "rank": 29, "score": 5244.65, "total_marks": 9500, "star_rating": "3-Star", "odf_status": "ODF+", "state": "Telangana", "award": null }
  },
  {
    "city": "Indore",
    "coordinates": { "lat": 22.7196, "lon": 75.8577 },
    "liveTelemetry": {
      "airQuality": { "pm25": 21.0, "status": "Good" },
      "sanitation": { "dustbinCount": 420, "streetlightsCount": 1950 },
      "urbanEconomics": { "shopCount": 2400 },
      "realEstate": { "hpiDec2025": 154.50, "hpiHistory": { "Dec- 2025": 154.50, "Sep- 2025": 151.20, "Jun- 2025": 148.30 } },
      "mobility": { "currentSpeedKmph": 28.0, "freeFlowSpeedKmph": 40.0, "congestionIndexPct": 30.0, "petrolPriceInr": 106.50, "commuteCostInrPerKm": 11.54 }
    },
    "swachhSurvekshan": { "rank": 1, "score": 8645.81, "total_marks": 9500, "star_rating": "7-Star", "odf_status": "ODF++", "state": "Madhya Pradesh", "award": "Cleanest City — India's Cleanest (7th year in a row)" }
  },
  {
    "city": "Lucknow",
    "coordinates": { "lat": 26.8467, "lon": 80.9462 },
    "liveTelemetry": {
      "airQuality": { "pm25": 45.2, "status": "Moderate" },
      "sanitation": { "dustbinCount": 140, "streetlightsCount": 980 },
      "urbanEconomics": { "shopCount": 1900 },
      "realEstate": { "hpiDec2025": 144.10, "hpiHistory": { "Dec- 2025": 144.10, "Sep- 2025": 140.50, "Jun- 2025": 137.20 } },
      "mobility": { "currentSpeedKmph": 25.0, "freeFlowSpeedKmph": 35.0, "congestionIndexPct": 28.57, "petrolPriceInr": 95.30, "commuteCostInrPerKm": 10.18 }
    },
    "swachhSurvekshan": { "rank": 26, "score": 5388.80, "total_marks": 9500, "star_rating": "3-Star", "odf_status": "ODF+", "state": "Uttar Pradesh", "award": null }
  },
  {
    "city": "Mumbai",
    "coordinates": { "lat": 19.0760, "lon": 72.8777 },
    "liveTelemetry": {
      "airQuality": { "pm25": 42.1, "status": "Moderate" },
      "sanitation": { "dustbinCount": 350, "streetlightsCount": 2100 },
      "urbanEconomics": { "shopCount": 4200 },
      "realEstate": { "hpiDec2025": 198.40, "hpiHistory": { "Dec- 2025": 198.40, "Sep- 2025": 194.20, "Jun- 2025": 190.50 } },
      "mobility": { "currentSpeedKmph": 18.0, "freeFlowSpeedKmph": 32.0, "congestionIndexPct": 43.75, "petrolPriceInr": 103.44, "commuteCostInrPerKm": 12.39 }
    },
    "swachhSurvekshan": { "rank": 18, "score": 5892.30, "total_marks": 9500, "star_rating": "3-Star", "odf_status": "ODF+", "state": "Maharashtra", "award": null }
  },
  {
    "city": "Surat",
    "coordinates": { "lat": 21.1875, "lon": 72.8340 },
    "liveTelemetry": {
      "airQuality": { "pm25": 28.4, "status": "Good" },
      "sanitation": { "dustbinCount": 380, "streetlightsCount": 1750 },
      "urbanEconomics": { "shopCount": 2900 },
      "realEstate": { "hpiDec2025": 142.10, "hpiHistory": { "Dec- 2025": 142.10, "Sep- 2025": 139.40, "Jun- 2025": 136.20 } },
      "mobility": { "currentSpeedKmph": 29.0, "freeFlowSpeedKmph": 42.0, "congestionIndexPct": 30.95, "petrolPriceInr": 94.25, "commuteCostInrPerKm": 10.27 }
    },
    "swachhSurvekshan": { "rank": 1, "score": 8622.48, "total_marks": 9500, "star_rating": "7-Star", "odf_status": "ODF++", "state": "Gujarat", "award": "Cleanest City — Joint Rank 1 (first time in survey history)" }
  },
  {
    "city": "Vizag",
    "coordinates": { "lat": 17.6868, "lon": 83.2185 },
    "liveTelemetry": {
      "airQuality": { "pm25": 26.5, "status": "Good" },
      "sanitation": { "dustbinCount": 160, "streetlightsCount": 1020 },
      "urbanEconomics": { "shopCount": 1850 },
      "realEstate": { "hpiDec2025": 148.90, "hpiHistory": { "Dec- 2025": 148.90, "Sep- 2025": 145.40, "Jun- 2025": 142.20 } },
      "mobility": { "currentSpeedKmph": 27.0, "freeFlowSpeedKmph": 38.0, "congestionIndexPct": 28.95, "petrolPriceInr": 108.20, "commuteCostInrPerKm": 11.62 }
    },
    "swachhSurvekshan": { "rank": 3, "score": 7861.17, "total_marks": 9500, "star_rating": "5-Star", "odf_status": "ODF++", "state": "Andhra Pradesh", "award": "3rd Cleanest Million Plus City" }
  },
  {
    "city": "Jhansi",
    "coordinates": { "lat": 25.4484, "lon": 78.5685 },
    "liveTelemetry": {
      "airQuality": { "pm25": 34.2, "status": "Moderate" },
      "sanitation": { "dustbinCount": 95, "streetlightsCount": 620 },
      "urbanEconomics": { "shopCount": 1100 },
      "realEstate": { "hpiDec2025": 131.20, "hpiHistory": { "Dec- 2025": 131.20, "Sep- 2025": 128.50, "Jun- 2025": 125.40 } },
      "mobility": { "currentSpeedKmph": 31.0, "freeFlowSpeedKmph": 42.0, "congestionIndexPct": 26.19, "petrolPriceInr": 95.46, "commuteCostInrPerKm": 10.04 }
    },
    "swachhSurvekshan": { "rank": 96, "score": 4770.00, "total_marks": 9500, "star_rating": "3-Star", "odf_status": "ODF++", "state": "Uttar Pradesh", "award": null }
  }
];

export const FALLBACK_SWACHH_LEADERBOARD = {
  "title": "Swachh Survekshan 2023 — Million Plus Cities Ranking",
  "year": 2023,
  "category": "Million Plus Cities (Population > 10 Lakh)",
  "totalCitiesInSurvey": 446,
  "citiesInStudy": 12,
  "source": "Ministry of Housing & Urban Affairs (MoHUA), Swachh Bharat Mission - Urban",
  "note": "Scores out of 9500 total marks: SLP 51% + Certification 26% + Citizen Voice 23%",
  "leaderboard": [
    { "city": "Indore", "rank": 1, "score": 8645.81, "scorePct": 91.0, "totalMarks": 9500, "starRating": "7-Star", "odfStatus": "ODF++", "state": "Madhya Pradesh", "stateMillionPlusCities": 4, "stateTotalParticipating": 383, "year": 2023, "award": "Cleanest City — India's Cleanest (7th year in a row)" },
    { "city": "Surat", "rank": 1, "score": 8622.48, "scorePct": 90.8, "totalMarks": 9500, "starRating": "7-Star", "odfStatus": "ODF++", "state": "Gujarat", "stateMillionPlusCities": 4, "stateTotalParticipating": 164, "year": 2023, "award": "Cleanest City — Joint Rank 1 (first time in survey history)" },
    { "city": "Vizag", "rank": 3, "score": 7861.17, "scorePct": 82.8, "totalMarks": 9500, "starRating": "5-Star", "odfStatus": "ODF++", "state": "Andhra Pradesh", "stateMillionPlusCities": 2, "stateTotalParticipating": 124, "year": 2023, "award": "3rd Cleanest Million Plus City" },
    { "city": "Ahmedabad", "rank": 5, "score": 7512.60, "scorePct": 79.1, "totalMarks": 9500, "starRating": "5-Star", "odfStatus": "ODF++", "state": "Gujarat", "stateMillionPlusCities": 4, "stateTotalParticipating": 164, "year": 2023, "award": "Top 5 Cleanest Million Plus City" },
    { "city": "Delhi", "rank": 6, "score": 7440.20, "scorePct": 78.3, "totalMarks": 9500, "starRating": "5-Star", "odfStatus": "ODF++", "state": "Delhi", "stateMillionPlusCities": 1, "stateTotalParticipating": 3, "year": 2023, "award": "Top 10 Cleanest City (NDMC)" },
    { "city": "Gurugram", "rank": 9, "score": 6951.40, "scorePct": 73.2, "totalMarks": 9500, "starRating": "5-Star", "odfStatus": "ODF+", "state": "Haryana", "stateMillionPlusCities": 1, "stateTotalParticipating": 90, "year": 2023, "award": null },
    { "city": "Mumbai", "rank": 18, "score": 5892.30, "scorePct": 62.0, "totalMarks": 9500, "starRating": "3-Star", "odfStatus": "ODF+", "state": "Maharashtra", "stateMillionPlusCities": 10, "stateTotalParticipating": 421, "year": 2023, "award": null },
    { "city": "Chennai", "rank": 20, "score": 5780.30, "scorePct": 60.8, "totalMarks": 9500, "starRating": "3-Star", "odfStatus": "ODF+", "state": "Tamil Nadu", "stateMillionPlusCities": 3, "stateTotalParticipating": 651, "year": 2023, "award": null },
    { "city": "Lucknow", "rank": 26, "score": 5388.80, "scorePct": 56.7, "totalMarks": 9500, "starRating": "3-Star", "odfStatus": "ODF+", "state": "Uttar Pradesh", "stateMillionPlusCities": 8, "stateTotalParticipating": 777, "year": 2023, "award": null },
    { "city": "Hyderabad", "rank": 29, "score": 5244.65, "scorePct": 55.2, "totalMarks": 9500, "starRating": "3-Star", "odfStatus": "ODF+", "state": "Telangana", "stateMillionPlusCities": 1, "stateTotalParticipating": 143, "year": 2023, "award": null },
    { "city": "Bengaluru", "rank": 45, "score": 4612.70, "scorePct": 48.6, "totalMarks": 9500, "starRating": "1-Star", "odfStatus": "ODF", "state": "Karnataka", "stateMillionPlusCities": 1, "stateTotalParticipating": 316, "year": 2023, "award": null },
    { "city": "Jhansi", "rank": 96, "score": 4770.00, "scorePct": 50.2, "totalMarks": 9500, "starRating": "3-Star", "odfStatus": "ODF++", "state": "Uttar Pradesh", "stateMillionPlusCities": 8, "stateTotalParticipating": 777, "year": 2023, "award": null }
  ]
};
