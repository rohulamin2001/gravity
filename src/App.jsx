import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import Legend from './components/Legend';
import { Menu } from 'lucide-react';
import './App.css';

export default function App() {
  const [divisionsData, setDivisionsData] = useState(null);
  const [districtsData, setDistrictsData] = useState(null);
  const [upazilasData, setUpazilasData] = useState(null);
  const [searchIndex, setSearchIndex] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(7);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [basemapMode, setBasemapMode] = useState('vector');

  const mapRef = useRef(null);

  // Apply theme attribute to html tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load GeoJSON and search index files on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [divRes, distRes, upaRes, idxRes] = await Promise.all([
          fetch('/data/divisions.json').then(r => r.json()),
          fetch('/data/districts.json').then(r => r.json()),
          fetch('/data/upazilas.json').then(r => r.json()),
          fetch('/data/search-index.json').then(r => r.json())
        ]);

        setDivisionsData(divRes);
        setDistrictsData(distRes);
        setUpazilasData(upaRes);
        setSearchIndex(idxRes);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute list of upazilas belonging to currently selected district
  const upazilasInDistrict = useMemo(() => {
    if (!upazilasData || !selectedFeature) return [];
    if (selectedFeature.type === 'district') {
      return upazilasData.features.filter(
        f => f.properties.district_id === selectedFeature.id ||
             f.properties.district_name === selectedFeature.name
      );
    }
    return [];
  }, [upazilasData, selectedFeature]);

  // Fly to feature on map
  const flyToFeature = (feature) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (feature.bbox) {
      const bounds = [
        [feature.bbox[0], feature.bbox[1]],
        [feature.bbox[2], feature.bbox[3]]
      ];
      const maxZoom = feature.type === 'upazila' ? 12 : feature.type === 'district' ? 10 : 8;
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom,
        animate: true,
        duration: 1.2
      });
    } else if (feature.center) {
      const targetZoom = feature.type === 'upazila' ? 11 : feature.type === 'district' ? 9 : 8;
      map.flyTo(feature.center, targetZoom, { duration: 1.2 });
    }
  };

  // Handle selection from search or click
  const handleSelectFeature = (feature) => {
    setSelectedFeature(feature);
    if (feature.division_name) {
      setSelectedDivision(feature.division_name);
    }
    setSidebarOpen(true);
    flyToFeature(feature);
  };

  // Handle division pill click
  const handleSelectDivision = (div) => {
    setSelectedDivision(div.name);
    const divFeature = divisionsData?.features.find(
      f => f.properties.name.toLowerCase() === div.name.toLowerCase()
    );

    if (divFeature) {
      handleSelectFeature({
        type: 'division',
        ...divFeature.properties
      });
    } else {
      setSelectedFeature({
        type: 'division',
        name: div.name,
        bn_name: div.bn,
        color: div.color
      });
    }
  };

  // Reset map to full country view
  const handleResetView = () => {
    setSelectedFeature(null);
    setSelectedDivision(null);
    if (mapRef.current) {
      mapRef.current.flyTo([23.6850, 90.3563], 7, { duration: 1 });
    }
  };

  // Zoom to currently selected feature
  const handleZoomToCurrent = () => {
    if (selectedFeature) {
      flyToFeature(selectedFeature);
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-container">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
            বাংলাদেশের মানচিত্র প্রস্তুত হচ্ছে...
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            বিভাগ, জেলা এবং থানার সীমানা লোড হচ্ছে
          </span>
        </div>
      )}

      {/* Main Header */}
      <Header
        searchIndex={searchIndex}
        onSelectFeature={handleSelectFeature}
        onSelectDivision={handleSelectDivision}
        onResetView={handleResetView}
        selectedDivision={selectedDivision}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Leaflet Map Canvas */}
      <MapComponent
        divisionsData={divisionsData}
        districtsData={districtsData}
        upazilasData={upazilasData}
        selectedFeature={selectedFeature}
        onSelectFeature={handleSelectFeature}
        onHoverFeature={setHoveredFeature}
        currentZoom={currentZoom}
        onZoomChange={setCurrentZoom}
        theme={theme}
        basemapMode={basemapMode}
        mapRef={mapRef}
      />

      {/* Sidebar Toggle Button (when closed) */}
      {!sidebarOpen && selectedFeature && (
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(true)}
          title="তথ্য প্যানেল খুলুন"
        >
          <Menu size={16} />
          <span>{selectedFeature.bn_name}</span>
        </button>
      )}

      {/* Info Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedFeature={selectedFeature}
        onSelectFeature={handleSelectFeature}
        onResetView={handleResetView}
        upazilasInDistrict={upazilasInDistrict}
        onZoomToCurrent={handleZoomToCurrent}
      />

      {/* Bottom Floating Bar & Legend */}
      <Legend
        currentZoom={currentZoom}
        hoveredFeature={hoveredFeature}
        basemapMode={basemapMode}
        onChangeBasemap={setBasemapMode}
      />
    </div>
  );
}
