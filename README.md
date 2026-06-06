# DC — Dynamic Cities Urban Intelligence Dashboard

DC is a macro-urban telemetry intelligence dashboard representing structural outcomes and live economic indicators across 12 targeted Indian cities. It integrates multiple real-time external APIs (Open-Meteo, TomTom, IndianAPI, OpenStreetMap Overpass) alongside housing index and sanitation leaderboards to help planners, students, and citizens evaluate urban livability dynamically.

---

## Key Features

* **Live Telemetry Parameters:** Tracks actual live indicators for each city, including:
  * **Air Quality (PM2.5):** Sourced from the Open-Meteo Air Quality API.
  * **Sanitation Counts:** Dynamic OSM Node extractions for waste baskets and street lamps.
  * **Economic Density:** Dynamic OSM Node extractions counting commercial shops.
  * **Housing Price Index (HPI):** Baseline housing index metrics from the National Housing Bank (NHB) Residex dataset.
  * **Traffic Congestion Index:** Real-time peak road congestion percentages fetched from the TomTom Traffic Flow API.
* **Unified Telemetry Index:** A normalized scoring algorithm (out of 100) summarizing environmental, mobility, and infrastructure realities.
* **Value-for-Money Index:** Calculates a livability-to-cost ratio relative to housing costs (`Telemetry Index / HPI`).
* **Swachh Survekshan Leaderboard:** Mapped Swachh Survekshan rankings for targeted million-plus population cities.
* **Compare Mode:** Side-by-side comparative views for all telemetry metrics, charts (Radar profile, cost line trends), and Swachh rankings.

---

## Technology Stack

* **Backend:** FastAPI (Python), SQLite (Caching Layer), Uvicorn.
* **Frontend:** Vite React (JS), Vanilla CSS, Recharts (Analytical Graphs), Lucide icons.

---

## Project Directory Layout

```text
Neural City/
├── main.py                    # FastAPI backend server
├── .gitignore                 # Git exclusion guidelines
├── README.md                  # Project documentation
├── Dataset/                   # Source datasets (Residex & Swachh state metrics)
│   ├── Residex_Data (2).xls
│   └── RS_Session_267_AS_111_A_i.csv
├── frontend/                  # React client application (Vite template with backend dependency)
│   ├── package.json
│   └── ...
└── api_integrated_frontend/   # Standalone React client (for Vercel deployment, zero backend dependency)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/                   # Client-side components & telemetry logic (localStorage cache)
```

---

## Source Datasets Used

This project processes and validates raw urban indicators using two primary data sources located inside the `Dataset` folder:

1. **National Housing Bank (NHB) Residex Dataset (`Dataset/Residex_Data (2).xls`):**
   * **Purpose:** Provides historical quarterly housing price index (HPI) records for Indian cities up through December 2025.
   * **Usage:** Used as the housing cost baseline to calculate the dynamic **Value-for-Money Index** (`Telemetry Index / HPI`) and to display real estate pricing trends on the compare graphs.
   
2. **Swachh Bharat Mission (Urban) State-level Participation Dataset (`Dataset/RS_Session_267_AS_111_A_i.csv`):**
   * **Purpose:** Official Parliamentary session response CSV detailing the total number of municipal bodies and million-plus population cities participating in sanitation rankings across each Indian State/UT.
   * **Usage:** Serves as the validation source for Swachh leaderboard metrics. At startup, the server automatically reads this CSV to verify that the target cities' state statistics (such as the number of participating cities and million-plus cities) align correctly.

---

## Setup & Installation

### Prerequisite Dependencies
Make sure you have Python 3.10+ and Node.js 18+ installed on your system.

### 1. Configure Environment Variables (.env)
Create a `.env` file in the project root directory. The application requires the following API keys:
```env
# TomTom Developer Portal API Key (used for traffic segment and flow queries)
TOMTOM_API_KEY=your_tomtom_api_key

# IndianAPI Key (used for fetching live Petrol fuel rates across cities)
INDIANAPI_KEY=your_indianapi_key
```
*Note: A secure hardcoded fallback key configuration is embedded in the application code. If a key is missing or not provided in the `.env` file, the dashboard will gracefully fallback to cached coordinates and pricing data.*

### 2. Build the Frontend
Navigate into the `frontend` folder, install dependencies, and build the optimized production assets:
```bash
cd frontend
npm install
npm run build
```
*Note: The FastAPI backend serves these static files from `frontend/dist/`.*

### 3. Configure Python Backend
Return to the project root directory and install python requirements:
```bash
cd ..
pip install fastapi uvicorn requests pandas openmeteo-requests requests-cache retry-requests xlrd
```

### 4. Run the Server
Launch the FastAPI uvicorn daemon:
```bash
python main.py
```
Open your browser and navigate to **`http://127.0.0.1:8000/`** to view the live dashboard.

---

## Standalone Client-Only Version (Vercel Ready)

The `api_integrated_frontend` directory contains a standalone version of this dashboard. It migrates all backend logic (live API queries, local storage caching, NHB Residex and Swachh dataset analysis) to run directly inside the browser, allowing it to be hosted on Vercel without a Python API backend.

### Running Standalone Locally:
```bash
cd api_integrated_frontend
npm install
npm run dev
```

### Hosting on Vercel:
1. Connect this repository to your Vercel Account.
2. In the project build settings on Vercel, change the **Root Directory** to `api_integrated_frontend`.
3. Deploy.

---

## API Integrations

* **TomTom Flow Segment API:** Fetches real-time speeds on main arterial corridors.
* **Open-Meteo Air Quality API:** Queries current PM2.5 levels.
* **OpenStreetMap Overpass API:** Queries counts of street infrastructure nodes (`amenity=waste_basket`, `highway=street_lamp`, `shop=*`).
* **IndianAPI Live Fuel Price:** Fetches petrol pricing maps across municipalities.
* **Caching Strategy:** Features a SQLite database caching layer (`.cache.sqlite`) storing API snapshot models to respect rate limits and maximize request loading speed.
