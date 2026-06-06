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
      "realEstate": {
        "hpiDec2025": 227.11,
        "hpiHistory": {
          "Jun- 2022": 177.12, "Sep- 2022": 183.34, "Dec- 2022": 188.78,
          "Mar- 2023": 191.68, "Jun- 2023": 193.18, "Sep- 2023": 194.57, "Dec- 2023": 197.59,
          "Mar- 2024": 202.95, "Jun- 2024": 205.49, "Sep- 2024": 210.03, "Dec- 2024": 212.66,
          "Mar- 2025": 215.24, "Jun- 2025": 219.48, "Sep- 2025": 222.53, "Dec- 2025": 227.11
        }
      },
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
      "realEstate": {
        "hpiDec2025": 175.86,
        "hpiHistory": {
          "Jun- 2022": 123.2, "Sep- 2022": 126.12, "Dec- 2022": 129.56,
          "Mar- 2023": 132.32, "Jun- 2023": 133.93, "Sep- 2023": 136.44, "Dec- 2023": 138.72,
          "Mar- 2024": 143.09, "Jun- 2024": 148.13, "Sep- 2024": 151.64, "Dec- 2024": 156.05,
          "Mar- 2025": 161.84, "Jun- 2025": 161.6, "Sep- 2025": 168.8, "Dec- 2025": 175.86
        }
      },
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
      "realEstate": {
        "hpiDec2025": 145.35,
        "hpiHistory": {
          "Jun- 2022": 116.98, "Sep- 2022": 118.31, "Dec- 2022": 118.49,
          "Mar- 2023": 119.58, "Jun- 2023": 118.26, "Sep- 2023": 120.42, "Dec- 2023": 123.04,
          "Mar- 2024": 125.64, "Jun- 2024": 129.57, "Sep- 2024": 131.79, "Dec- 2024": 134.34,
          "Mar- 2025": 136.96, "Jun- 2025": 138.64, "Sep- 2025": 140.6, "Dec- 2025": 145.35
        }
      },
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
      "realEstate": {
        "hpiDec2025": 100.02,
        "hpiHistory": {
          "Jun- 2022": 100.33, "Sep- 2022": 100.27, "Dec- 2022": 99.79,
          "Mar- 2023": 99.67, "Jun- 2023": 100.8, "Sep- 2023": 102.08, "Dec- 2023": 102.57,
          "Mar- 2024": 101.37, "Jun- 2024": 102.34, "Sep- 2024": 102.5, "Dec- 2024": 102.96,
          "Mar- 2025": 104.29, "Jun- 2025": 102.09, "Sep- 2025": 100.85, "Dec- 2025": 100.02
        }
      },
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
      "realEstate": {
        "hpiDec2025": 234.33,
        "hpiHistory": {
          "Jun- 2022": 109.61, "Sep- 2022": 115.52, "Dec- 2022": 119.94,
          "Mar- 2023": 126.29, "Jun- 2023": 132.06, "Sep- 2023": 136.02, "Dec- 2023": 142.53,
          "Mar- 2024": 152.88, "Jun- 2024": 166.0, "Sep- 2024": 178.1, "Dec- 2024": 190.86,
          "Mar- 2025": 205.16, "Jun- 2025": 215.78, "Sep- 2025": 224.23, "Dec- 2025": 234.33
        }
      },
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
      "realEstate": {
        "hpiDec2025": 199.68,
        "hpiHistory": {
          "Jun- 2022": 165.3, "Sep- 2022": 168.55, "Dec- 2022": 171.95,
          "Mar- 2023": 174.75, "Jun- 2023": 176.41, "Sep- 2023": 179.94, "Dec- 2023": 182.7,
          "Mar- 2024": 186.51, "Jun- 2024": 190.99, "Sep- 2024": 191.98, "Dec- 2024": 193.48,
          "Mar- 2025": 195.53, "Jun- 2025": 195.3, "Sep- 2025": 197.04, "Dec- 2025": 199.68
        }
      },
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
      "realEstate": {
        "hpiDec2025": 148.9,
        "hpiHistory": {
          "Jun- 2022": 125.43, "Sep- 2022": 126.24, "Dec- 2022": 127.6,
          "Mar- 2023": 128.82, "Jun- 2023": 129.98, "Sep- 2023": 133.13, "Dec- 2023": 132.1,
          "Mar- 2024": 134.59, "Jun- 2024": 136.39, "Sep- 2024": 139.37, "Dec- 2024": 145.43,
          "Mar- 2025": 147.8, "Jun- 2025": 148.02, "Sep- 2025": 146.19, "Dec- 2025": 148.9
        }
      },
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
      "realEstate": {
        "hpiDec2025": 152.93,
        "hpiHistory": {
          "Jun- 2022": 121.22, "Sep- 2022": 123.67, "Dec- 2022": 125.9,
          "Mar- 2023": 126.05, "Jun- 2023": 126.75, "Sep- 2023": 127.5, "Dec- 2023": 130.43,
          "Mar- 2024": 132.85, "Jun- 2024": 136.38, "Sep- 2024": 140.93, "Dec- 2024": 146.11,
          "Mar- 2025": 150.57, "Jun- 2025": 155.17, "Sep- 2025": 154.31, "Dec- 2025": 152.93
        }
      },
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
      "realEstate": {
        "hpiDec2025": 124.21,
        "hpiHistory": {
          "Jun- 2022": 107.65, "Sep- 2022": 108.54, "Dec- 2022": 109.64,
          "Mar- 2023": 110.34, "Jun- 2023": 111.08, "Sep- 2023": 112.5, "Dec- 2023": 112.95,
          "Mar- 2024": 114.74, "Jun- 2024": 116.23, "Sep- 2024": 116.99, "Dec- 2024": 119.76,
          "Mar- 2025": 121.5, "Jun- 2025": 122.27, "Sep- 2025": 122.6, "Dec- 2025": 124.21
        }
      },
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
      "realEstate": {
        "hpiDec2025": 160.73,
        "hpiHistory": {
          "Jun- 2022": 126.74, "Sep- 2022": 131.36, "Dec- 2022": 137.88,
          "Mar- 2023": 141.51, "Jun- 2023": 145.11, "Sep- 2023": 147.71, "Dec- 2023": 149.93,
          "Mar- 2024": 153.78, "Jun- 2024": 156.13, "Sep- 2024": 158.01, "Dec- 2024": 157.19,
          "Mar- 2025": 158.49, "Jun- 2025": 158.8, "Sep- 2025": 157.87, "Dec- 2025": 160.73
        }
      },
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
      "realEstate": {
        "hpiDec2025": 155.34,
        "hpiHistory": {
          "Jun- 2022": 126.88, "Sep- 2022": 128.88, "Dec- 2022": 133.04,
          "Mar- 2023": 137.85, "Jun- 2023": 139.97, "Sep- 2023": 142.22, "Dec- 2023": 144.4,
          "Mar- 2024": 144.22, "Jun- 2024": 145.84, "Sep- 2024": 146.65, "Dec- 2024": 149.49,
          "Mar- 2025": 152.7, "Jun- 2025": 153.67, "Sep- 2025": 155.42, "Dec- 2025": 155.34
        }
      },
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
      "realEstate": {
        "hpiDec2025": 131.20,
        "hpiHistory": {
          "Jun- 2022": 105.0, "Sep- 2022": 107.5, "Dec- 2022": 110.2,
          "Mar- 2023": 112.5, "Jun- 2023": 115.4, "Sep- 2023": 117.8, "Dec- 2023": 120.2,
          "Mar- 2024": 121.5, "Jun- 2024": 123.4, "Sep- 2024": 125.1, "Dec- 2024": 126.4,
          "Mar- 2025": 127.8, "Jun- 2025": 125.4, "Sep- 2025": 128.5, "Dec- 2025": 131.2
        }
      },
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
