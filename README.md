# DC — Dynamic Cities Urban Intelligence Dashboard

DC is a macro-urban telemetry intelligence dashboard representing structural outcomes and live economic indicators across 12 targeted Indian cities. It integrates multiple real-time external APIs (Open-Meteo, TomTom, IndianAPI, OpenStreetMap Overpass) alongside housing index and sanitation leaderboards to help planners, students, and citizens evaluate urban livability dynamically.

---

## 🚀 Key Features

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

## 🛠️ Technology Stack

* **Backend:** FastAPI (Python), SQLite (Caching Layer), Uvicorn.
* **Frontend:** Vite React (JS), TailwindCSS, Recharts (Analytical Graphs), Lucide icons.

---

## 📦 Project Directory Layout

```text
Neural City/
├── main.py               # FastAPI backend server
├── .gitignore            # Git exclusion guidelines
├── README.md             # Project documentation
├── Dataset/              # Source datasets (Residex & Swachh state metrics)
│   ├── Residex_Data (2).xls
│   └── RS_Session_267_AS_111_A_i.csv
└── frontend/             # React client application (Vite template)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/              # App components & styles (DC branding)
```

---

## ⚙️ Setup & Installation

### Prerequisite Dependencies
Make sure you have Python 3.10+ and Node.js 18+ installed on your system.

### 1. Build the Frontend
Navigate into the `frontend` folder, install dependencies, and build the optimized production assets:
```bash
cd frontend
npm install
npm run build
```
*Note: The FastAPI backend serves these static files from `frontend/dist/`.*

### 2. Configure Python Backend
Return to the project root directory and install python requirements:
```bash
cd ..
pip install fastapi uvicorn requests pandas openmeteo-requests requests-cache retry-requests
```

### 3. Run the Server
Launch the FastAPI uvicorn daemon:
```bash
python main.py
```
Open your browser and navigate to **`http://127.0.0.1:8000/`** to view the live dashboard.

---

## 🔌 API Integrations

* **TomTom Flow Segment API:** Fetches real-time speeds on main arterial corridors.
* **Open-Meteo Air Quality API:** Queries current PM2.5 levels.
* **OpenStreetMap Overpass API:** Queries counts of street infrastructure nodes (`amenity=waste_basket`, `highway=street_lamp`, `shop=*`).
* **IndianAPI Live Fuel Price:** Fetches petrol pricing maps across municipalities.
* **Caching Strategy:** Features a SQLite database caching layer (`.cache.sqlite`) storing API snapshot models to respect rate limits and maximize request loading speed.
