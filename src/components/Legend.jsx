import React from 'react';
import { Layers, ZoomIn, Globe, Map as MapIcon, Image as ImageIcon, Camera, Sparkles } from 'lucide-react';

export default function Legend({
  currentZoom,
  hoveredFeature,
  selectedFeature,
  basemapMode,
  onChangeBasemap,
  showTouristPins,
  onToggleTouristPins
}) {
  const isThanaView = currentZoom >= 9;

  return (
    <div className="floating-bottom-bar" id="map-legend-bar">
      {/* Zoom Mode Indicator */}
      <div className="zoom-indicator-pill">
        {isThanaView ? <ZoomIn size={14} /> : <Layers size={14} />}
        <span>
          {isThanaView ? 'থানা / উপজেলা ভিউ' : 'জেলা ভিউ (৬৪ জেলা)'}
        </span>
      </div>

      {/* Spotlight Indicator when district is selected */}
      {selectedFeature && selectedFeature.type === 'district' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#facc15', fontWeight: 600 }}>
          <Sparkles size={13} />
          <span>{selectedFeature.bn_name} স্পটলাইট</span>
        </div>
      )}

      {/* Hovered Feature Quick Peek */}
      {hoveredFeature ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {hoveredFeature.bn_name} ({hoveredFeature.name})
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {hoveredFeature.type === 'upazila' ? `• ${hoveredFeature.district_bn} জেলা` : `• ${hoveredFeature.division_bn} বিভাগ`}
          </span>
        </div>
      ) : (
        <div className="legend-indicator">
          <span style={{ color: 'var(--text-muted)' }}>
            {isThanaView ? 'থানার সীমানা প্রদর্শিত হচ্ছে' : 'যেকোনো জেলায় ক্লিক করলে স্পটলাইট চালু হবে'}
          </span>
        </div>
      )}

      {/* Basemap & Tourism Toggle Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
        <button
          className={`action-btn ${showTouristPins ? 'active-pill-btn' : ''}`}
          style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '6px' }}
          onClick={onToggleTouristPins}
          title={showTouristPins ? 'পর্যটন স্পট বন্ধ করুন' : 'পর্যটন স্পট দেখান'}
        >
          <Camera size={12} color={showTouristPins ? '#fff' : '#06b6d4'} />
          স্পট
        </button>

        <button
          className={`action-btn ${basemapMode === 'vector' ? 'active' : ''}`}
          style={{
            padding: '4px 8px',
            fontSize: '0.75rem',
            borderRadius: '6px',
            background: basemapMode === 'vector' ? 'var(--accent-primary)' : undefined,
            color: basemapMode === 'vector' ? '#fff' : undefined
          }}
          onClick={() => onChangeBasemap('vector')}
          title="ক্লিন ভেক্টর ম্যাপ"
        >
          <Globe size={12} />
          ভেক্টর
        </button>

        <button
          className={`action-btn ${basemapMode === 'osm' ? 'active' : ''}`}
          style={{
            padding: '4px 8px',
            fontSize: '0.75rem',
            borderRadius: '6px',
            background: basemapMode === 'osm' ? 'var(--accent-primary)' : undefined,
            color: basemapMode === 'osm' ? '#fff' : undefined
          }}
          onClick={() => onChangeBasemap('osm')}
          title="ওপেনস্ট্রিটম্যাপ রাস্তা ও স্থান"
        >
          <MapIcon size={12} />
          রাস্তা
        </button>

        <button
          className={`action-btn ${basemapMode === 'satellite' ? 'active' : ''}`}
          style={{
            padding: '4px 8px',
            fontSize: '0.75rem',
            borderRadius: '6px',
            background: basemapMode === 'satellite' ? 'var(--accent-primary)' : undefined,
            color: basemapMode === 'satellite' ? '#fff' : undefined
          }}
          onClick={() => onChangeBasemap('satellite')}
          title="স্যাটেলাইট দৃশ্য"
        >
          <ImageIcon size={12} />
          স্যাটেলাইট
        </button>
      </div>
    </div>
  );
}
