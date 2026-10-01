import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  Maximize2,
  MapPin,
  Utensils,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Waves,
  Building,
  Camera,
  Info,
  Sparkles
} from 'lucide-react';
import { fetchDistrictWeather } from '../services/weather';

export default function Sidebar({
  isOpen,
  onClose,
  selectedFeature,
  onSelectFeature,
  onResetView,
  upazilasInDistrict = [],
  heritageData = {},
  onZoomToCurrent
}) {
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Fetch weather when selectedFeature changes
  useEffect(() => {
    if (!selectedFeature || !selectedFeature.center) {
      setWeather(null);
      return;
    }

    let isMounted = true;
    setWeatherLoading(true);

    const [lat, lng] = selectedFeature.center;
    fetchDistrictWeather(lat, lng)
      .then(data => {
        if (isMounted) {
          setWeather(data);
          setWeatherLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setWeatherLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedFeature]);

  if (!isOpen) return null;

  const isDistrict = selectedFeature?.type === 'district';
  const isUpazila = selectedFeature?.type === 'upazila';

  const titleBn = selectedFeature?.bn_name || 'বাংলাদেশ';
  const titleEn = selectedFeature?.name || 'Bangladesh';
  const divisionBn = selectedFeature?.division_bn || selectedFeature?.bn_name || 'বাংলাদেশ';
  const divisionEn = selectedFeature?.division_name || selectedFeature?.name || 'Bangladesh';
  const districtBn = selectedFeature?.district_bn || (isDistrict ? titleBn : '');
  const districtEn = selectedFeature?.district_name || (isDistrict ? titleEn : '');
  const color = selectedFeature?.color || '#6366f1';

  // Heritage data for selected district
  const districtId = isDistrict ? selectedFeature.id : selectedFeature?.district_id;
  const heritage = heritageData[districtId] || {};

  // Render weather icon helper
  const renderWeatherIcon = (iconName) => {
    switch (iconName) {
      case 'cloud-rain': return <CloudRain size={24} color="#60a5fa" />;
      case 'cloud-lightning': return <CloudLightning size={24} color="#fbbf24" />;
      case 'cloud-fog': return <CloudFog size={24} color="#94a3b8" />;
      case 'cloud': return <Cloud size={24} color="#cbd5e1" />;
      case 'cloud-sun': return <Cloud size={24} color="#f59e0b" />;
      default: return <Sun size={24} color="#f59e0b" />;
    }
  };

  return (
    <aside className={`floating-sidebar ${isOpen ? '' : 'collapsed'}`} id="feature-info-sidebar">
      {/* Sidebar Header with Breadcrumbs */}
      <div className="sidebar-header">
        <nav className="breadcrumb-trail" aria-label="Breadcrumb">
          <span
            className="breadcrumb-item"
            onClick={onResetView}
            title="সমগ্র বাংলাদেশ"
          >
            বাংলাদেশ
          </span>

          {divisionBn && divisionBn !== 'বাংলাদেশ' && (
            <>
              <ChevronRight size={13} />
              <span
                className={`breadcrumb-item ${!districtBn ? 'active' : ''}`}
                onClick={() => onSelectFeature({
                  type: 'division',
                  name: divisionEn,
                  bn_name: divisionBn,
                  color
                })}
              >
                {divisionBn}
              </span>
            </>
          )}

          {districtBn && (
            <>
              <ChevronRight size={13} />
              <span
                className={`breadcrumb-item ${!isUpazila ? 'active' : ''}`}
                onClick={() => onSelectFeature({
                  type: 'district',
                  id: districtId,
                  name: districtEn,
                  bn_name: districtBn,
                  division_name: divisionEn,
                  division_bn: divisionBn,
                  color
                })}
              >
                {districtBn}
              </span>
            </>
          )}

          {isUpazila && (
            <>
              <ChevronRight size={13} />
              <span className="breadcrumb-item active">
                {titleBn}
              </span>
            </>
          )}
        </nav>

        <button
          className="sidebar-close-btn"
          onClick={onClose}
          title="প্যানেল বন্ধ করুন"
          id="close-sidebar-btn"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Content */}
      <div className="sidebar-content">
        {selectedFeature ? (
          <>
            {/* Feature Hero Card */}
            <div className="feature-hero-card">
              <div
                className="feature-hero-glow"
                style={{ backgroundColor: color }}
              />

              <div className="feature-badge-row">
                <span
                  className="badge-tag"
                  style={{
                    backgroundColor: `${color}25`,
                    color: color,
                    borderColor: `${color}50`
                  }}
                >
                  <MapPin size={12} />
                  {isUpazila ? 'উপজেলা / থানা' : isDistrict ? 'জেলা' : 'প্রশাসনিক বিভাগ'}
                </span>
                {heritage.famous_for && (
                  <span className="spotlight-active-badge">
                    <Sparkles size={11} /> স্পটলাইট
                  </span>
                )}
              </div>

              <h2 className="feature-title-bn">{titleBn}</h2>
              <span className="feature-title-en">{titleEn}</span>

              {heritage.famous_for && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {heritage.famous_for}
                </p>
              )}
            </div>

            {/* Live Weather Widget */}
            {weather && (
              <div className="weather-widget-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {renderWeatherIcon(weather.icon)}
                    <div>
                      <div className="weather-temp">{weather.temp}°C</div>
                      <div className="weather-condition">{weather.condition}</div>
                    </div>
                  </div>
                  <div className="weather-metrics">
                    <div className="weather-sub-item">
                      <Droplets size={12} color="#60a5fa" />
                      <span>{weather.humidity}% আর্দ্রতা</span>
                    </div>
                    <div className="weather-sub-item">
                      <Wind size={12} color="#94a3b8" />
                      <span>{weather.windSpeed} km/h বাতাস</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Famous Traditional Food Card */}
            {heritage.famous_food && (
              <div className="heritage-card food-theme">
                <div className="heritage-card-header">
                  <Utensils size={15} color="#f59e0b" />
                  <span className="heritage-card-title">ঐতিহ্যবাহী বিখ্যাত খাবার</span>
                </div>
                <p className="heritage-card-content">{heritage.famous_food}</p>
              </div>
            )}

            {/* Top Tourist Spots Card */}
            {heritage.tourist_spots && heritage.tourist_spots.length > 0 && (
              <div className="heritage-card tourism-theme">
                <div className="heritage-card-header">
                  <Camera size={15} color="#06b6d4" />
                  <span className="heritage-card-title">শীর্ষ দর্শনীয় স্থান</span>
                </div>
                <div className="tourist-spots-chips">
                  {heritage.tourist_spots.map((spot, i) => (
                    <span key={i} className="tourist-chip">
                      {spot}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics & Meta Grid */}
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-label">মূল বিভাগ</span>
                <span className="stat-value">{divisionBn}</span>
              </div>

              {isDistrict && (
                <div className="stat-card">
                  <span className="stat-label">মোট উপজেলা/থানা</span>
                  <span className="stat-value">
                    {upazilasInDistrict.length || selectedFeature.upazila_count || '–'} টি
                  </span>
                </div>
              )}

              {isUpazila && districtBn && (
                <div className="stat-card">
                  <span className="stat-label">অন্তর্ভুক্ত জেলা</span>
                  <span className="stat-value">{districtBn}</span>
                </div>
              )}

              {heritage.rivers && heritage.rivers.length > 0 && (
                <div className="stat-card">
                  <span className="stat-label">প্রধান নদ-নদী</span>
                  <span className="stat-value" style={{ fontSize: '0.85rem' }}>
                    {heritage.rivers.join(', ')}
                  </span>
                </div>
              )}

              {heritage.area_sqkm && (
                <div className="stat-card">
                  <span className="stat-label">আনুমানিক আয়তন</span>
                  <span className="stat-value">
                    {heritage.area_sqkm.toLocaleString()} <small style={{ fontSize: '0.7rem' }}>বর্গ কিমি</small>
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <button
              className="action-btn primary-glow-btn"
              onClick={onZoomToCurrent}
              style={{ justifyContent: 'center', width: '100%', padding: '10px' }}
              title="এলাকাটিতে কাছে থেকে দেখুন"
            >
              <Maximize2 size={16} />
              <span>কাছাকাছি জুম করুন</span>
            </button>

            {/* Thana / Upazila List (if District is selected) */}
            {isDistrict && upazilasInDistrict.length > 0 && (
              <div className="thanas-section">
                <div className="section-title-row">
                  <h3 className="section-title">
                    <Building size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    উপজেলা ও থানা সমূহ
                  </h3>
                  <span className="count-pill">{upazilasInDistrict.length} টি</span>
                </div>

                <div className="thana-tags-container">
                  {upazilasInDistrict.map((thana) => (
                    <button
                      key={thana.properties.id}
                      className="thana-tag"
                      onClick={() => onSelectFeature({
                        type: 'upazila',
                        ...thana.properties
                      })}
                      title={`${thana.properties.bn_name} থানায় জুম করুন`}
                    >
                      <MapPin size={11} />
                      {thana.properties.bn_name || thana.properties.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Default Welcome / Instructions Card */
          <div className="feature-hero-card" style={{ textAlign: 'center', alignItems: 'center' }}>
            <div
              className="feature-hero-glow"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            />
            <Info size={36} color="var(--accent-primary)" />
            <h2 className="feature-title-bn" style={{ fontSize: '1.4rem' }}>
              বাংলাদেশ মানচিত্র পোর্টাল
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              • মানচিত্রের যেকোনো <strong>জেলার</strong> ওপর ক্লিক করলে স্পটলাইট মোডে বিস্তারিত তথ্য, বিখ্যাত খাবার, আবহাওয়া ও থানা তালিকা দেখতে পাবেন।
              <br /><br />
              • উপরের <strong>টুলস মেনু</strong> থেকে দুটি জেলার সড়ক দূরত্ব মাপুন, জেলা তুলনা করুন অথবা কুইজ খেলুন!
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
