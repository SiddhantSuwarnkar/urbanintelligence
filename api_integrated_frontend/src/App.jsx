import { useState, useEffect, useCallback } from 'react';
import { getCitiesList, getSwachhLeaderboard, getTelemetryData, forceRefreshCity } from './services/telemetryService';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell
} from 'recharts';
import { 
  Wind, Trash2, ShoppingBag, Home, Navigation, MapPin, 
  RefreshCw, BarChart2, Database,
  Activity, Award, TrendingUp, Info,
  Trophy, Star, ShieldCheck
} from 'lucide-react';


export default function App() {
  const [cities] = useState(() => getCitiesList());
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [selectedCity2, setSelectedCity2] = useState("Ahmedabad");
  const [compareMode, setCompareMode] = useState(false);
  const [cityData, setCityData] = useState({});
  const [swachhLeaderboard, setSwachhLeaderboard] = useState(() => getSwachhLeaderboard());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Ranking"); // Ranking (Home), Dashboard, Map View, Data, Swachh
  const [rankingSortKey, setRankingSortKey] = useState("telemetry"); // telemetry, pm25, dustbins, streetlights, shops, hpi, congestion
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTelemetryData = useCallback(() => {
    const activeCities = compareMode ? [selectedCity, selectedCity2] : [selectedCity];
    
    // Fetch cache immediately
    const data = getTelemetryData(activeCities, (updatedList) => {
      // Callback when background refresh resolves
      const updatedData = {};
      updatedList.forEach(cityObj => {
        cityObj._timestamp = Date.now();
        updatedData[cityObj.city] = cityObj;
      });
      setCityData(updatedData);
      setLoading(false);
    });

    const initialData = {};
    data.forEach(cityObj => {
      cityObj._timestamp = Date.now();
      initialData[cityObj.city] = cityObj;
    });
    
    setTimeout(() => {
      setCityData(initialData);
      if (Object.keys(initialData).length > 0) {
        setLoading(false);
      }
    }, 0);
  }, [selectedCity, selectedCity2, compareMode]);

  // Fetch telemetry whenever selected cities change
  useEffect(() => {
    if (cities.length > 0) {
      fetchTelemetryData();
    }
  }, [cities, fetchTelemetryData]);

  const handleForceRefresh = async (cityName) => {
    setIsRefreshing(true);
    try {
      const updatedCity = await forceRefreshCity(cityName);
      if (updatedCity) {
        setCityData(prev => ({
          ...prev,
          [cityName]: {
            ...updatedCity,
            _timestamp: Date.now()
          }
        }));
        const leaderboard = getSwachhLeaderboard();
        setSwachhLeaderboard(leaderboard);
      }
    } catch (err) {
      console.error("Force refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const currentData = cityData[selectedCity];
  const compareData = compareMode ? cityData[selectedCity2] : null;



  const getAqiPulseClass = (status) => {
    if (status === "Good") return "live-pulse-green";
    if (status === "Moderate") return "live-pulse-gold";
    return "live-pulse-red";
  };

  // Compile datasets for comparative charts
  const getHpiTrendData = () => {
    if (!currentData) return [];
    const history1 = currentData.liveTelemetry.realEstate.hpiHistory;
    const history2 = compareData ? compareData.liveTelemetry.realEstate.hpiHistory : null;

    return Object.keys(history1).map(quarter => {
      const point = { name: quarter, [selectedCity]: history1[quarter] };
      if (history2 && history2[quarter] !== undefined) {
        point[selectedCity2] = history2[quarter];
      }
      return point;
    });
  };

  const getNormalizedTelemetryScores = (d) => {
    if (!d || !d.liveTelemetry) return { aqi: 0, sanitation: 0, economics: 0, housing: 0, mobility: 0 };
    const pm25 = d.liveTelemetry.airQuality.pm25;
    const pm25Score = Math.max(0, Math.min(100, 100 - (pm25 - 10) * (100 / 70)));
    const bins = d.liveTelemetry.sanitation.dustbinCount;
    const lamps = d.liveTelemetry.sanitation.streetlightsCount;
    const sanitationScore = (Math.min(100, (bins / 400) * 100) + Math.min(100, (lamps / 2000) * 100)) / 2;
    const shops = d.liveTelemetry.urbanEconomics.shopCount;
    const econScore = Math.min(100, (shops / 4000) * 100);
    const hpi = d.liveTelemetry.realEstate.hpiDec2025;
    const hpiScore = Math.min(100, (hpi / 250) * 100);
    const cong = d.liveTelemetry.mobility.congestionIndexPct;
    const mobilityScore = Math.max(0, 100 - cong * 1.67);
    return {
      aqi: parseFloat(pm25Score.toFixed(1)),
      sanitation: parseFloat(sanitationScore.toFixed(1)),
      economics: parseFloat(econScore.toFixed(1)),
      housing: parseFloat(hpiScore.toFixed(1)),
      mobility: parseFloat(mobilityScore.toFixed(1))
    };
  };

  const getComparativeRadarData = () => {
    if (!currentData) return [];
    const t1 = getNormalizedTelemetryScores(currentData);
    const t2 = compareData ? getNormalizedTelemetryScores(compareData) : null;

    return [
      { subject: 'Air Quality (PM2.5)', [selectedCity]: t1.aqi, ...(t2 && { [selectedCity2]: t2.aqi }) },
      { subject: 'Sanitation (Bins/Lamps)', [selectedCity]: t1.sanitation, ...(t2 && { [selectedCity2]: t2.sanitation }) },
      { subject: 'Economic Density (Shops)', [selectedCity]: t1.economics, ...(t2 && { [selectedCity2]: t2.economics }) },
      { subject: 'Real Estate Cost (HPI)', [selectedCity]: t1.housing, ...(t2 && { [selectedCity2]: t2.housing }) },
      { subject: 'Mobility Flow (Congestion)', [selectedCity]: t1.mobility, ...(t2 && { [selectedCity2]: t2.mobility }) }
    ];
  };

  // Compute Telemetry index out of 100 for a city
  const getTelemetryIndex = (d) => {
    if (!d || !d.liveTelemetry) return 0;

    // PM2.5 normalized (10 = 100%, 80 = 0%)
    const pm25 = d.liveTelemetry.airQuality.pm25;
    const pm25Score = Math.max(0, Math.min(100, 100 - (pm25 - 10) * (100 / 70)));

    // Sanitation (dustbins relative to 400, streetlights to 2000)
    const bins = d.liveTelemetry.sanitation.dustbinCount;
    const lamps = d.liveTelemetry.sanitation.streetlightsCount;
    const sanitationScore = (Math.min(100, (bins / 400) * 100) + Math.min(100, (lamps / 2000) * 100)) / 2;

    // Economics (shops relative to 4000)
    const shops = d.liveTelemetry.urbanEconomics.shopCount;
    const econScore = Math.min(100, (shops / 4000) * 100);

    // Real Estate (HPI relative to 250)
    const hpi = d.liveTelemetry.realEstate.hpiDec2025;
    const hpiScore = Math.min(100, (hpi / 250) * 100);

    // Mobility (congestion 0% = 100, 60% = 0%)
    const cong = d.liveTelemetry.mobility.congestionIndexPct + 5;
    const mobilityScore = Math.max(0, 100 - cong * 1.67);

    const avg = (pm25Score + sanitationScore + econScore + hpiScore + mobilityScore) / 5;
    return parseFloat(avg.toFixed(1));
  };

  // Value for Money calculation: Live Telemetry Index / HPI * 100
  const getVfmData = () => {
    if (Object.keys(cityData).length === 0) return [];
    const raw = Object.keys(cityData).map(name => {
      const data = cityData[name];
      const telemetry = getTelemetryIndex(data);
      const hpi = data.liveTelemetry.realEstate.hpiDec2025;
      const ratio = (telemetry / hpi) * 100;
      return {
        name,
        telemetry,
        hpi,
        vfmRatio: parseFloat(ratio.toFixed(2))
      };
    });
    return raw.sort((a, b) => b.vfmRatio - a.vfmRatio);
  };

  // Compile Commute Stress bar data
  const getCommuteStressData = () => {
    if (!currentData) return [];
    const list = [currentData];
    if (compareData) list.push(compareData);

    return list.map(d => ({
      name: d.city,
      Congestion: d.liveTelemetry.mobility.congestionIndexPct,
      CostPerKm: d.liveTelemetry.mobility.commuteCostInrPerKm
    }));
  };

  // Compile and sort the list of cities for home ranking table comparison
  const getRankedCitiesList = () => {
    if (Object.keys(cityData).length === 0) return [];
    const list = Object.keys(cityData).map(name => {
      const d = cityData[name];
      return {
        ...d,
        telemetryIndex: getTelemetryIndex(d)
      };
    });

    return list.sort((a, b) => {
      if (rankingSortKey === "telemetry") return b.telemetryIndex - a.telemetryIndex;
      if (rankingSortKey === "pm25") return a.liveTelemetry.airQuality.pm25 - b.liveTelemetry.airQuality.pm25; // lower is better
      if (rankingSortKey === "dustbins") return b.liveTelemetry.sanitation.dustbinCount - a.liveTelemetry.sanitation.dustbinCount;
      if (rankingSortKey === "streetlights") return b.liveTelemetry.sanitation.streetlightsCount - a.liveTelemetry.sanitation.streetlightsCount;
      if (rankingSortKey === "shops") return b.liveTelemetry.urbanEconomics.shopCount - a.liveTelemetry.urbanEconomics.shopCount;
      if (rankingSortKey === "hpi") return b.liveTelemetry.realEstate.hpiDec2025 - a.liveTelemetry.realEstate.hpiDec2025;
      if (rankingSortKey === "congestion") return a.liveTelemetry.mobility.congestionIndexPct - b.liveTelemetry.mobility.congestionIndexPct; // lower is better
      return b.telemetryIndex - a.telemetryIndex;
    });
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white flex flex-col font-sans select-none antialiased">
      {/* Brand Header */}
      <header className="border-b border-[#1c1d22] bg-[#070708]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-black tracking-tighter text-white flex items-center">
            <span className="bg-gradient-to-r from-ncGold to-amber-500 bg-clip-text text-transparent">DC</span>
          </div>
        </div>

        {/* Tab Navigation & Controls */}
        <div className="flex items-center space-x-6">
          <nav className="flex space-x-1 bg-[#121315] p-1 rounded-full border border-ncBorder">
            {[
              { id: "Ranking", label: "City Ranking", icon: Award },
              { id: "Dashboard", label: "Dashboard", icon: Activity },
              { id: "Swachh", label: "Swachh Leaderboard", icon: TrendingUp },
              { id: "Data", label: "Dataset Notes", icon: Database }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  activeTab === tab.id 
                    ? "bg-[#212226] text-white shadow-sm border border-[#2d2e34]" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-6 flex flex-col space-y-6 max-w-7xl mx-auto w-full">
        {/* Loading Indicator Overlay */}
        {loading && Object.keys(cityData).length === 0 && (
          <div className="fixed inset-0 bg-[#070708]/90 z-50 flex flex-col items-center justify-center space-y-4 backdrop-blur-sm animate-fade-in-up">
            <div className="custom-spinner mb-2"></div>
            <p className="text-xs tracking-widest font-mono text-ncGold animate-pulse">LOADING TELEMETRY DATASTACK...</p>
          </div>
        )}

        {/* TAB 1: CITY RANKING (HOME TAB) */}
        {activeTab === "Ranking" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center py-6">
              <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">State of Indian Streets 2026</h1>
              <p className="text-gray-400 text-sm max-w-xl mx-auto mb-4">Outcome-based automated street assessment layering live macroeconomic telemetry variables.</p>

              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setMethodologyOpen(!methodologyOpen)}
                  className="px-4 py-1.5 bg-[#121315] border border-ncBorder rounded-full text-xs text-gray-300 hover:text-white font-medium flex items-center space-x-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>How to Interpret & Methodology</span>
                </button>
              </div>
            </div>

            {methodologyOpen && (
              <div className="bg-[#121315] border border-ncBorder rounded-xl p-5 text-sm text-gray-300 space-y-3 max-w-3xl mx-auto leading-relaxed transition-all">
                <h3 className="font-bold text-white uppercase text-xs tracking-wider">Methodology Framework</h3>
                <p>
                  Our comparative urban analysis is built entirely on live telemetry data points:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2 text-xs">
                  <li><strong>Live Telemetry Index:</strong> Integrates real-time particulate matter (PM2.5), localized OSM amenities densities (waste baskets and street lights), TomTom congestion flows, and NHB Residex cost factors into a unified score out of 100.</li>
                </ul>
              </div>
            )}

            {/* Sorting bar */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-[#121315] border border-ncBorder p-4 rounded-xl gap-4">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Sort List By:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "telemetry", label: "Live Telemetry Index" },
                  { id: "pm25", label: "Air Quality (PM2.5)" },
                  { id: "dustbins", label: "Sanitation Bins" },
                  { id: "streetlights", label: "Street Lamps" },
                  { id: "shops", label: "Shops Count" },
                  { id: "hpi", label: "Housing Index (HPI)" },
                  { id: "congestion", label: "Traffic Congestion" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setRankingSortKey(opt.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${rankingSortKey === opt.id
                        ? "bg-ncGold/10 border-ncGold/40 text-ncGold font-bold"
                        : "bg-[#1c1d22] border-ncBorder text-gray-400 hover:text-white"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cities Ranking Table */}
            <div className="bg-[#121315] border border-ncBorder rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#16171a] border-b border-ncBorder text-[10px] text-gray-400 uppercase tracking-widest">
                      <th className="py-4 px-6 text-center w-16">Rank</th>
                      <th className="py-4 px-4 w-44">City</th>
                      <th className="py-4 px-4 w-44 text-center">Live Telemetry Index</th>
                      <th className="py-4 px-6">Live Telemetry Parameters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getRankedCitiesList().map((cityObj, idx) => (
                      <tr
                        key={cityObj.city}
                        onClick={() => {
                          setSelectedCity(cityObj.city);
                          setActiveTab("Dashboard");
                        }}
                        className="border-b border-ncBorder hover:bg-[#1c1d22]/50 transition-all cursor-pointer"
                      >
                        <td className="py-5 px-6 text-center font-mono text-lg font-black text-ncGold">
                          #{idx + 1}
                        </td>
                        <td className="py-5 px-4">
                          <div className="font-bold text-white text-base">{cityObj.city}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            Lat: {cityObj.coordinates.lat}, Lon: {cityObj.coordinates.lon}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-center">
                          <div className="text-lg font-black text-amber-500">{cityObj.telemetryIndex}</div>
                          <div className="w-24 bg-[#1c1d22] h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: `${cityObj.telemetryIndex}%` }} />
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="bg-[#1c1d22] border border-ncBorder px-2.5 py-1 rounded text-[10px] text-gray-400 font-mono">
                              <strong className="text-ncGold mr-1">AQI:</strong> {cityObj.liveTelemetry?.airQuality?.pm25 ?? 'N/A'}
                            </span>
                            <span className="bg-[#1c1d22] border border-ncBorder px-2.5 py-1 rounded text-[10px] text-gray-400 font-mono">
                              <strong className="text-ncGold mr-1">Bins:</strong> {cityObj.liveTelemetry?.sanitation?.dustbinCount ?? 0}
                            </span>
                            <span className="bg-[#1c1d22] border border-ncBorder px-2.5 py-1 rounded text-[10px] text-gray-400 font-mono">
                              <strong className="text-ncGold mr-1">Lamps:</strong> {cityObj.liveTelemetry?.sanitation?.streetlightsCount ?? 0}
                            </span>
                            <span className="bg-[#1c1d22] border border-ncBorder px-2.5 py-1 rounded text-[10px] text-gray-400 font-mono">
                              <strong className="text-ncGold mr-1">Shops:</strong> {cityObj.liveTelemetry?.urbanEconomics?.shopCount ?? 0}
                            </span>
                            <span className="bg-[#1c1d22] border border-ncBorder px-2.5 py-1 rounded text-[10px] text-gray-400 font-mono">
                              <strong className="text-ncGold mr-1">HPI:</strong> {cityObj.liveTelemetry?.realEstate?.hpiDec2025 ?? 0}
                            </span>
                            <span className="bg-[#1c1d22] border border-ncBorder px-2.5 py-1 rounded text-[10px] text-gray-400 font-mono">
                              <strong className="text-ncGold mr-1">Traffic:</strong> {cityObj.liveTelemetry?.mobility?.congestionIndexPct ?? 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DASHBOARD (WITH 5 KPI CARDS) */}
        {activeTab === "Dashboard" && currentData && (
          <div className="space-y-6 animate-fade-in-up">
            
            {/* Split selectors or comparative view controls */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-[#121315] border border-ncBorder p-4 rounded-xl gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-bold text-gray-400">Selected City:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-[#1c1d22] border border-ncBorder text-white text-xs font-semibold rounded px-3 py-1.5 outline-none focus:border-ncGold transition-all cursor-pointer"
                  >
                    {cities.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all border ${
                    compareMode 
                      ? "bg-ncGold/10 border-ncGold/40 text-ncGold shadow-[0_0_15px_rgba(229,142,38,0.1)]" 
                      : "bg-[#1c1d22] border-ncBorder text-gray-400 hover:text-white"
                  }`}
                >
                  {compareMode ? "Compare Mode: ON" : "Compare Mode: OFF"}
                </button>

                {compareMode && (
                  <div className="flex items-center space-x-2 border-l border-ncBorder/50 pl-4">
                    <span className="text-xs uppercase font-bold text-gray-400 text-amber-500">Compare with:</span>
                    <select
                      value={selectedCity2}
                      onChange={(e) => setSelectedCity2(e.target.value)}
                      className="bg-[#1c1d22] border border-ncBorder text-white text-xs font-semibold rounded px-3 py-1.5 outline-none focus:border-amber-500 transition-all cursor-pointer"
                    >
                      {cities.filter(c => c.name !== selectedCity).map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => handleForceRefresh(selectedCity)}
                  disabled={isRefreshing}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all border flex items-center space-x-1.5 ${
                    isRefreshing 
                      ? "bg-ncGold/10 border-ncGold/40 text-ncGold shadow-[0_0_15px_rgba(229,142,38,0.1)]" 
                      : "bg-[#1c1d22] border-ncBorder text-gray-400 hover:text-white"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-ncGold" : ""}`} />
                  <span>{isRefreshing ? "Refreshing..." : "Force Live Update"}</span>
                </button>
              </div>

              {/* Telemetry Index summaries */}
              <div className="flex items-center space-x-6 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">{selectedCity} Telemetry Index:</span>
                  <span className="font-bold text-ncGold text-base">{getTelemetryIndex(currentData)}</span>
                </div>
                {compareMode && compareData && (
                  <div className="flex items-center space-x-2 border-l border-ncBorder/50 pl-4">
                    <span className="text-gray-400">{selectedCity2} Telemetry Index:</span>
                    <span className="font-bold text-amber-500 text-base">{getTelemetryIndex(compareData)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* horizontal KPI cards row */}
            {!compareMode ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* 1. AQI KPI */}
                <div className="bg-[#121315] border border-ncBorder p-4 rounded-xl flex flex-col justify-between h-28 hover:border-[#2d2e34] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">1. Air Quality</span>
                    <Wind className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">{currentData.liveTelemetry.airQuality.pm25} <span className="text-[10px] font-normal text-gray-400">µg/m³</span></h4>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center">
                      <span className={`w-1.5 h-1.5 rounded-full mr-1 ${getAqiPulseClass(currentData.liveTelemetry.airQuality.status)}`}></span>
                      AQI Status: <strong className="text-white ml-1">{currentData.liveTelemetry.airQuality.status}</strong>
                    </p>
                  </div>
                </div>

                {/* 2. Sanitation KPI */}
                <div className="bg-[#121315] border border-ncBorder p-4 rounded-xl flex flex-col justify-between h-28 hover:border-[#2d2e34] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">2. Sanitation</span>
                    <Trash2 className="w-4 h-4 text-ncGold" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">{currentData.liveTelemetry.sanitation.dustbinCount} <span className="text-[10px] font-normal text-gray-400">bins</span></h4>
                    <p className="text-[10px] text-gray-400 mt-1">Street Lamps: <strong className="text-white">{currentData.liveTelemetry.sanitation.streetlightsCount}</strong></p>
                  </div>
                </div>

                {/* 3. Economics KPI */}
                <div className="bg-[#121315] border border-ncBorder p-4 rounded-xl flex flex-col justify-between h-28 hover:border-[#2d2e34] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">3. Economic Density</span>
                    <ShoppingBag className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">{currentData.liveTelemetry.urbanEconomics.shopCount} <span className="text-[10px] font-normal text-gray-400">shops</span></h4>
                    <p className="text-[10px] text-gray-400 mt-1">Buffer Query: <strong className="text-white">5 km radius</strong></p>
                  </div>
                </div>

                {/* 4. Housing Index KPI */}
                <div className="bg-[#121315] border border-ncBorder p-4 rounded-xl flex flex-col justify-between h-28 hover:border-[#2d2e34] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">4. Real Estate Cost</span>
                    <Home className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">{currentData.liveTelemetry.realEstate.hpiDec2025}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">NHB HPI baseline: <strong className="text-white">Dec 2025</strong></p>
                  </div>
                </div>

                {/* 5. Traffic/Commute KPI */}
                <div className="bg-[#121315] border border-ncBorder p-4 rounded-xl flex flex-col justify-between h-28 hover:border-[#2d2e34] transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">5. Mobility flow</span>
                    <Navigation className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white">{currentData.liveTelemetry.mobility.congestionIndexPct}%</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Petrol index: <strong className="text-white">₹{currentData.liveTelemetry.mobility.petrolPriceInr}</strong></p>
                  </div>
                </div>
              </div>
            ) : (
              /* Compare Mode Double Column KPI Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Column 1: City 1 KPI cards */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-extrabold text-ncGold tracking-widest border-b border-ncBorder pb-1">{selectedCity} Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-[#121315] border border-ncBorder p-3 rounded-lg flex flex-col justify-between h-24">
                      <span className="text-[8px] text-gray-400 uppercase font-bold">1. AQI PM2.5</span>
                      <p className="text-base font-black text-white">{currentData.liveTelemetry.airQuality.pm25}</p>
                    </div>
                    <div className="bg-[#121315] border border-ncBorder p-3 rounded-lg flex flex-col justify-between h-24">
                      <span className="text-[8px] text-gray-400 uppercase font-bold">2. Sanitation</span>
                      <p className="text-base font-black text-white">{currentData.liveTelemetry.sanitation.dustbinCount} B</p>
                    </div>
                    <div className="bg-[#121315] border border-ncBorder p-3 rounded-lg flex flex-col justify-between h-24">
                      <span className="text-[8px] text-gray-400 uppercase font-bold">3. Economics</span>
                      <p className="text-base font-black text-white">{currentData.liveTelemetry.urbanEconomics.shopCount} S</p>
                    </div>
                    <div className="bg-[#121315] border border-ncBorder p-3 rounded-lg flex flex-col justify-between h-24">
                      <span className="text-[8px] text-gray-400 uppercase font-bold">4. Real Estate</span>
                      <p className="text-base font-black text-white">{currentData.liveTelemetry.realEstate.hpiDec2025}</p>
                    </div>
                    <div className="bg-[#121315] border border-ncBorder p-3 rounded-lg flex flex-col justify-between h-24">
                      <span className="text-[8px] text-gray-400 uppercase font-bold">5. Traffic</span>
                      <p className="text-base font-black text-white">{currentData.liveTelemetry.mobility.congestionIndexPct}%</p>
                    </div>
                  </div>
                </div>

                {/* Column 2: City 2 KPI cards */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-extrabold text-amber-500 tracking-widest border-b border-ncBorder pb-1">{selectedCity2} Metrics</h4>
                  {compareData ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-[#121315] border border-ncBorder p-3 rounded-lg flex flex-col justify-between h-24">
                        <span className="text-[8px] text-gray-400 uppercase font-bold">1. AQI PM2.5</span>
                        <p className="text-base font-black text-white">{compareData.liveTelemetry.airQuality.pm25}</p>
                      </div>
                      <div className="bg-[#121315] border border-ncBorder p-3 rounded-lg flex flex-col justify-between h-24">
                        <span className="text-[8px] text-gray-400 uppercase font-bold">2. Sanitation</span>
                        <p className="text-base font-black text-white">{compareData.liveTelemetry.sanitation.dustbinCount} B</p>
                      </div>
                      <div className="bg-[#121315] border border-ncBorder p-3 rounded-lg flex flex-col justify-between h-24">
                        <span className="text-[8px] text-gray-400 uppercase font-bold">3. Economics</span>
                        <p className="text-base font-black text-white">{compareData.liveTelemetry.urbanEconomics.shopCount} S</p>
                      </div>
                      <div className="bg-[#121315] border border-ncBorder p-3 rounded-lg flex flex-col justify-between h-24">
                        <span className="text-[8px] text-gray-400 uppercase font-bold">4. Real Estate</span>
                        <p className="text-base font-black text-white">{compareData.liveTelemetry.realEstate.hpiDec2025}</p>
                      </div>
                      <div className="bg-[#121315] border border-ncBorder p-3 rounded-lg flex flex-col justify-between h-24">
                        <span className="text-[8px] text-gray-400 uppercase font-bold">5. Traffic</span>
                        <p className="text-base font-black text-white">{compareData.liveTelemetry.mobility.congestionIndexPct}%</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#121315] border border-ncBorder rounded-lg h-24 flex items-center justify-center text-xs text-gray-500 font-mono">
                      LOADING TELEMETRY COMPARISON...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytical Graphs Layout */}
            <div className={`grid gap-6 ${compareMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 lg:grid-cols-12"}`}>

              {/* LEFT GRAPH CARD: Value for Money index horizontal Bar chart */}
              <div className={compareMode ? "" : "lg:col-span-7"}>
                <div className="bg-[#121315] border border-ncBorder rounded-xl p-5 shadow-lg">
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Value-for-Money Index Comparison</h4>
                    <p className="text-[10px] text-gray-400">Calculated VFM Ratio: (Live Telemetry Index / Housing Price Index (HPI)) * 100</p>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getVfmData()}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#212226" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#9ca3af" fontSize={9} domain={[0, 45]} />
                        <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={9} width={70} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-[#121315] border border-ncBorder p-3 rounded-lg text-xs space-y-1">
                                  <p className="font-bold text-white uppercase">{d.name}</p>
                                  <p className="text-ncGold">VFM Index: <span className="font-bold">{d.vfmRatio}</span></p>
                                  <p className="text-gray-400">Telemetry Index: <span className="text-white font-semibold">{d.telemetry}</span></p>
                                  <p className="text-gray-400">HPI: <span className="text-white font-semibold">{d.hpi}</span></p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="vfmRatio" name="Value-for-Money Index" fill="#e58e26" radius={[0, 4, 4, 0]}>
                          {getVfmData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.name === selectedCity ? "#e58e26" : (compareMode && entry.name === selectedCity2 ? "#3b82f6" : "#212226")}
                              stroke={entry.name === selectedCity ? "#ffffff" : (compareMode && entry.name === selectedCity2 ? "#ffffff" : "transparent")}
                              strokeWidth={1}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    A higher index bar signifies better street infrastructure quality relative to real estate housing costs. Selected cities are highlighted.
                  </p>
                </div>
              </div>

              {/* RIGHT GRAPH CARD: Commute Stress or comparative charts */}
              <div className={compareMode ? "" : "lg:col-span-5"}>
                <div className="bg-[#121315] border border-ncBorder rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Commute Stress & Congestion</h4>
                    <p className="text-[10px] text-gray-400">INR Commute Cost per KM vs Live Congestion %</p>
                  </div>
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getCommuteStressData()} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#212226" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={9} />
                        <YAxis yAxisId="left" orientation="left" stroke="#e58e26" fontSize={9} label={{ value: 'Cost (INR/km)', angle: -90, position: 'insideLeft', offset: 10, fill: '#e58e26', fontSize: 8 }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={9} label={{ value: 'Congestion %', angle: 90, position: 'insideRight', offset: 10, fill: '#3b82f6', fontSize: 8 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#121315', borderColor: '#212226', fontSize: 10 }} />
                        <Bar yAxisId="left" dataKey="CostPerKm" name="Commute Cost" fill="#e58e26" radius={[4, 4, 0, 0]} maxBarSize={30} />
                        <Bar yAxisId="right" dataKey="Congestion" name="Congestion" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    Visualizes localized driving density and financial fuel burn per kilometer traveled during commute peaks.
                  </p>
                </div>
              </div>
            </div>

            {/* Swachh Survekshan Section */}
            {currentData?.swachhSurvekshan && (
              <div className="grid grid-cols-1 gap-6 mt-6">
                <div className="bg-[#121315] border border-ncBorder rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-ncGold" /> Swachh Survekshan 2023 Ranking
                      </h4>
                      <p className="text-[10px] text-gray-400">Ministry of Housing & Urban Affairs (MoHUA)</p>
                    </div>
                  </div>

                  {!compareMode ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#0a0b0d] rounded-lg p-4 border border-[#212226]">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">National Rank</p>
                          <p className="text-2xl font-bold text-ncGold">#{currentData.swachhSurvekshan.rank}</p>
                        </div>
                        <div className="bg-[#0a0b0d] rounded-lg p-4 border border-[#212226]">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">Cleanliness Score</p>
                          <p className="text-2xl font-bold text-ncGold">{currentData.swachhSurvekshan.score_pct}%</p>
                          <p className="text-[8px] text-gray-500">{currentData.swachhSurvekshan.score}/{currentData.swachhSurvekshan.total_marks}</p>
                        </div>
                        <div className="bg-[#0a0b0d] rounded-lg p-4 border border-[#212226]">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">Star Rating</p>
                          <p className="text-2xl font-bold text-ncGold">{currentData.swachhSurvekshan.star_rating}</p>
                        </div>
                        <div className="bg-[#0a0b0d] rounded-lg p-4 border border-[#212226]">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">ODF Status</p>
                          <p className="text-xl font-bold text-green-400">{currentData.swachhSurvekshan.odf_status}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-[#212226]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-2">State Participation</p>
                            <p className="text-sm text-gray-300">
                              <span className="font-semibold text-ncGold">{currentData.swachhSurvekshan.state_cities_million_plus}</span> Million Plus cities in {currentData.swachhSurvekshan.state}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                              {currentData.swachhSurvekshan.state_total_participating} total cities participating from state
                            </p>
                          </div>
                          <div>
                            {currentData.swachhSurvekshan.award && (
                              <>
                                <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-2">Award</p>
                                <p className="text-sm text-green-300 font-medium">✓ {currentData.swachhSurvekshan.award}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#0a0b0d] rounded-lg p-5 border border-[#212226]/50 space-y-4">
                        <h4 className="text-xs uppercase font-extrabold text-ncGold tracking-wider border-b border-ncBorder pb-1.5">{selectedCity}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#121315] p-3 rounded border border-ncBorder">
                            <p className="text-[8px] text-gray-400 uppercase tracking-wide mb-0.5">National Rank</p>
                            <p className="text-xl font-bold text-white">#{currentData.swachhSurvekshan.rank}</p>
                          </div>
                          <div className="bg-[#121315] p-3 rounded border border-ncBorder">
                            <p className="text-[8px] text-gray-400 uppercase tracking-wide mb-0.5">Score %</p>
                            <p className="text-xl font-bold text-white">{currentData.swachhSurvekshan.score_pct}%</p>
                          </div>
                          <div className="bg-[#121315] p-3 rounded border border-ncBorder">
                            <p className="text-[8px] text-gray-400 uppercase tracking-wide mb-0.5">Star Rating</p>
                            <p className="text-sm font-bold text-white">{currentData.swachhSurvekshan.star_rating}</p>
                          </div>
                          <div className="bg-[#121315] p-3 rounded border border-ncBorder">
                            <p className="text-[8px] text-gray-400 uppercase tracking-wide mb-0.5">ODF Status</p>
                            <p className="text-sm font-bold text-green-400">{currentData.swachhSurvekshan.odf_status}</p>
                          </div>
                        </div>
                        <div className="text-xs space-y-1 pt-2 border-t border-ncBorder/50">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide">State Context</p>
                          <p className="text-gray-300">
                            {currentData.swachhSurvekshan.stateMillionPlusCities} Million Plus cities in {currentData.swachhSurvekshan.state}
                          </p>
                          {currentData.swachhSurvekshan.award && (
                            <p className="text-green-300 font-medium mt-1">✓ {currentData.swachhSurvekshan.award}</p>
                          )}
                        </div>
                      </div>

                      {compareData?.swachhSurvekshan ? (
                        <div className="bg-[#0a0b0d] rounded-lg p-5 border border-[#212226]/50 space-y-4">
                          <h4 className="text-xs uppercase font-extrabold text-amber-500 tracking-wider border-b border-ncBorder pb-1.5">{selectedCity2}</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#121315] p-3 rounded border border-ncBorder">
                              <p className="text-[8px] text-gray-400 uppercase tracking-wide mb-0.5">National Rank</p>
                              <p className="text-xl font-bold text-white">#{compareData.swachhSurvekshan.rank}</p>
                            </div>
                            <div className="bg-[#121315] p-3 rounded border border-ncBorder">
                              <p className="text-[8px] text-gray-400 uppercase tracking-wide mb-0.5">Score %</p>
                              <p className="text-xl font-bold text-white">{compareData.swachhSurvekshan.score_pct}%</p>
                            </div>
                            <div className="bg-[#121315] p-3 rounded border border-ncBorder">
                              <p className="text-[8px] text-gray-400 uppercase tracking-wide mb-0.5">Star Rating</p>
                              <p className="text-sm font-bold text-white">{compareData.swachhSurvekshan.star_rating}</p>
                            </div>
                            <div className="bg-[#121315] p-3 rounded border border-ncBorder">
                              <p className="text-[8px] text-gray-400 uppercase tracking-wide mb-0.5">ODF Status</p>
                              <p className="text-sm font-bold text-green-400">{compareData.swachhSurvekshan.odf_status}</p>
                            </div>
                          </div>
                          <div className="text-xs space-y-1 pt-2 border-t border-ncBorder/50">
                            <p className="text-[9px] text-gray-400 uppercase tracking-wide">State Context</p>
                            <p className="text-gray-300">
                              {compareData.swachhSurvekshan.stateMillionPlusCities} Million Plus cities in {compareData.swachhSurvekshan.state}
                            </p>
                            {compareData.swachhSurvekshan.award && (
                              <p className="text-green-300 font-medium mt-1">✓ {compareData.swachhSurvekshan.award}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#0a0b0d] rounded-lg p-5 border border-[#212226]/50 flex items-center justify-center text-xs text-gray-500 font-mono">
                          NO SWACHH DATA AVAILABLE FOR {selectedCity2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Row comparative visualization (Only shown in Compare Mode) */}
            {compareMode && currentData && compareData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Line HPI Trend chart */}
                <div className="bg-[#121315] border border-ncBorder rounded-xl p-5 shadow-lg">
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">HPI Historical Trend Line (2022 - 2025)</h4>
                    <p className="text-xs text-gray-400">Quarterly comparison of cost baseline index growth</p>
                  </div>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getHpiTrendData()} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#212226" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={9} />
                        <YAxis stroke="#9ca3af" domain={['auto', 'auto']} fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#121315', borderColor: '#212226', fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 9 }} />
                        <Line type="monotone" dataKey={selectedCity} stroke="#e58e26" strokeWidth={2} activeDot={{ r: 5 }} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey={selectedCity2} stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 5 }} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Comparative Radar observation chart */}
                <div className="bg-[#121315] border border-ncBorder rounded-xl p-5 shadow-lg">
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Live Telemetry Profiles</h4>
                    <p className="text-xs text-gray-400">Comparative live telemetry components (out of 100)</p>
                  </div>
                  <div className="h-60 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getComparativeRadarData()}>
                        <PolarGrid stroke="#212226" />
                        <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={9} />
                        <PolarRadiusAxis angle={30} domain={[30, 70]} stroke="#4b5563" fontSize={8} />
                        <Radar name={selectedCity} dataKey={selectedCity} stroke="#e58e26" fill="#e58e26" fillOpacity={0.2} />
                        <Radar name={selectedCity2} dataKey={selectedCity2} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        <Legend wrapperStyle={{ fontSize: 9 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#121315', borderColor: '#212226', fontSize: 10 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* TAB 4: SWACHH SURVEKSHAN LEADERBOARD */}
        {activeTab === "Swachh" && swachhLeaderboard && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#121315] to-[#1c1d22] border border-ncBorder rounded-xl p-8 shadow-lg">
              <div className="max-w-4xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Trophy className="w-6 h-6 text-ncGold" />
                  <h1 className="text-3xl font-black uppercase tracking-tight text-white">{swachhLeaderboard.title}</h1>
                </div>
                <p className="text-gray-400 text-sm mb-4">{swachhLeaderboard.note}</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Year:</span>
                    <span className="font-bold text-ncGold">{swachhLeaderboard.year}</span>
                  </div>
                  <div className="flex items-center space-x-2 border-l border-ncBorder pl-4">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-bold text-white">{swachhLeaderboard.category}</span>
                  </div>
                  <div className="flex items-center space-x-2 border-l border-ncBorder pl-4">
                    <span className="text-gray-500">Cities in Study:</span>
                    <span className="font-bold text-white">{swachhLeaderboard.citiesInStudy}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performer Highlight */}
            {swachhLeaderboard.topPerformer && (
              <div className="bg-gradient-to-br from-ncGold/10 to-amber-900/10 border border-ncGold/40 rounded-xl p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="bg-ncGold/20 rounded-lg p-3">
                    <Award className="w-6 h-6 text-ncGold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-ncGold uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-ncGold" /> Top Performer
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 mb-3">#1 Ranked Million Plus City in Swachh Survekshan 2023</p>
                    <div className="space-y-2 text-sm">
                      <p className="font-bold text-white text-lg">{swachhLeaderboard.topPerformer.city}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-gray-400">Score:</span>
                          <p className="font-black text-ncGold">{swachhLeaderboard.topPerformer.scorePct}%</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Star Rating:</span>
                          <p className="font-black text-white">{swachhLeaderboard.topPerformer.starRating}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">ODF Status:</span>
                          <p className="font-black text-emerald-400">{swachhLeaderboard.topPerformer.odfStatus}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">State:</span>
                          <p className="font-black text-white">{swachhLeaderboard.topPerformer.state}</p>
                        </div>
                      </div>
                      {swachhLeaderboard.topPerformer.award && (
                        <p className="text-ncGold font-semibold text-xs mt-2 italic">\"{swachhLeaderboard.topPerformer.award}\"</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-[#121315] border border-ncBorder rounded-xl p-6 shadow-lg overflow-x-auto">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Complete Ranking (All {swachhLeaderboard.citiesInStudy} Cities)</h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-ncBorder">
                    <th className="pb-3 text-gray-400 font-bold">Rank</th>
                    <th className="pb-3 text-gray-400 font-bold">City</th>
                    <th className="pb-3 text-gray-400 font-bold">Score (%)⁎</th>
                    <th className="pb-3 text-gray-400 font-bold">Rating</th>
                    <th className="pb-3 text-gray-400 font-bold">ODF Status</th>
                    <th className="pb-3 text-gray-400 font-bold">State</th>
                    <th className="pb-3 text-gray-400 font-bold">Million Plus</th>
                    <th className="pb-3 text-gray-400 font-bold">Total State</th>
                  </tr>
                </thead>
                <tbody>
                  {swachhLeaderboard.leaderboard.map((city, idx) => (
                    <tr key={idx} className="border-b border-[#1c1d22] hover:bg-[#1c1d22] transition-colors">
                      <td className="py-3 font-bold text-ncGold">#{city.rank}</td>
                      <td className="py-3 font-semibold text-white">{city.city}</td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-[#1c1d22] rounded h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-ncGold to-amber-500 h-full rounded"
                              style={{ width: `${city.scorePct}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-ncGold">{city.scorePct}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${city.starRating.includes('7-Star') ? 'bg-ncGold/20 text-ncGold' :
                            city.starRating.includes('5-Star') ? 'bg-blue-500/20 text-blue-400' :
                              'bg-amber-500/20 text-amber-400'
                          }`}>
                          {city.starRating}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${city.odfStatus.includes('++') ? 'bg-emerald-500/20 text-emerald-400' :
                            city.odfStatus.includes('+') ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-300'
                          }`}>
                          {city.odfStatus}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{city.state}</td>
                      <td className="py-3 font-semibold text-ncGold">{city.stateMillionPlusCities}</td>
                      <td className="py-3 text-gray-300">{city.stateTotalParticipating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] text-gray-500 mt-4">
                ⁎ Score % = (Official Score / 9500 Total Marks) × 100. Scores reflect: SLP 51% + Certification 26% + Citizen Voice 23%
              </p>
            </div>

            {/* Methodology & Context */}
            <div className="bg-[#121315] border border-ncBorder rounded-xl p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Swachh Survekshan 2023 — Context & Methodology</h3>
              <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                <div>
                  <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-ncGold" /> Assessment Framework
                  </p>
                  <p>The Swachh Survekshan is an annual survey conducted by the Ministry of Housing & Urban Affairs (MoHUA) to assess cleanliness and sanitation levels in Indian cities. Cities are ranked based on a comprehensive evaluation system combining statutory surveys, on-site verification, and citizen feedback.</p>
                </div>
                <div>
                  <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-ncGold" /> Category: Million Plus Cities
                  </p>
                  <p>This leaderboard focuses on the \"Million Plus\" category—cities with a population exceeding 10 lakhs (1 million). This category is highly competitive as it includes India's largest metropolitan areas and represents major urban centers for infrastructure development and sustainability initiatives.</p>
                </div>
                <div>
                  <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-ncGold" /> Star Rating System
                  </p>
                  <p>7-Star: Outstanding performance; 5-Star: Excellent; 3-Star: Good; 1-Star: Satisfactory. Ratings are derived from the overall survey score and reflect the city's cleanliness grade and infrastructure readiness.</p>
                </div>
                <div>
                  <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-ncGold" /> ODF Status (Open Defecation Free)
                  </p>
                  <p>ODF++: Fully open defecation free with advanced waste management; ODF+: Open defecation free with good sanitation practices; ODF: Certified open defecation free status.</p>
                </div>
                <div>
                  <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-ncGold" /> State Participation Context
                  </p>
                  <p>\"Million Plus\" column shows how many cities in each state fall within the 10-lakh+ population bracket. \"Total State\" shows all cities (any size) from that state participating in Swachh Survekshan, providing perspective on broader sanitation efforts across the state.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DATASET NOTES */}
        {activeTab === "Data" && (
          <div className="bg-[#121315] border border-ncBorder rounded-xl p-6 shadow-lg space-y-6 max-w-4xl mx-auto leading-relaxed text-sm animate-fade-in-up">
            <div>
              <h2 className="text-xl font-extrabold tracking-wide uppercase text-ncGold mb-1">Prototype Technical Framework</h2>
              <p className="text-xs text-gray-400">Specifications, structural metrics, and timeframe logs.</p>
            </div>

            <div className="border-t border-ncBorder pt-4 space-y-5">
              <section className="space-y-1">
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">Spatial Scope & Boundaries</h4>
                <p className="text-gray-300">
                  Data points represent measurements harvested in a 5 kilometer bordered radius boundary centered around the coordinates of each city center.
                </p>
              </section>

              <section className="space-y-1">
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">API Timeframe Logging</h4>
                <p className="text-gray-300">
                  - Environmental PM2.5 and TomTom traffic indices are retrieved live (real-time).
                  <br />
                  - Sanitation infrastructure and commercial densities represent nodes dynamically counted from OpenStreetMap.
                  <br />
                  - Housing index data is sourced from NHB Residex records for December 2025.
                  <br />
                  - Fuel prices represent licensed petrol index benchmarks from July 31, 2025.
                </p>
              </section>

              <section className="space-y-1">
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">Neural City Integration</h4>
                <p className="text-gray-300">
                  The prototype integrates real-time telemetry variables across our target areas. Pune has been replaced with Jhansi, ensuring exactly 12 cities are tracked.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">Use Case Context</h4>
                <blockquote className="border-l-2 border-ncGold pl-3 py-1 bg-ncGold/5 rounded text-gray-300 italic">
                  "Selected to evaluate urban areas using hard macroeconomic and infrastructure realities. Integrating live PM2.5, traffic congestion, sanitation counts, and NHB housing index data enables planners and citizens to evaluate commute stress, cost of living, and environmental quality in real time."
                </blockquote>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1c1d22] py-4 bg-[#070708] text-center text-xs text-gray-500 mt-6">
        <p>&copy; 2026 Dynamic Cities Inc. All rights reserved. Urban Intelligence Telemetry Dashboard.</p>
      </footer>
    </div>
  );
}
