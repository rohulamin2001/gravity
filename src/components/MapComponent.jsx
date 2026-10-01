import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const BD_CENTER = [23.6850, 90.3563];

export default function MapComponent({
  districtsData,
  upazilasData,
  selectedFeature,
  onSelectFeature,
  onHoverFeature,
  currentZoom,
  onZoomChange,
  theme,
  basemapMode = 'vector',
  mapRef
}) {
  const containerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const districtsLayerRef = useRef(null);
  const upazilasLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || leafletMapRef.current) return;

    const map = L.map(containerRef.current, {
      center: BD_CENTER,
      zoom: 7,
      minZoom: 6,
      maxZoom: 13,
      maxBounds: [
        [19.0, 86.5],
        [27.8, 94.0]
      ],
      maxBoundsViscosity: 0.8,
      zoomControl: false,
      attributionControl: false
    });

    // Custom Zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Track zoom level changes
    map.on('zoomend', () => {
      onZoomChange(map.getZoom());
    });

    leafletMapRef.current = map;
    if (mapRef) mapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // 2. Manage Basemap Tiles (Pure Vector vs OpenStreetMap vs Satellite)
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    if (basemapMode === 'osm') {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        opacity: theme === 'dark' ? 0.35 : 0.7
      }).addTo(map);
    } else if (basemapMode === 'satellite') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        opacity: 0.7
      }).addTo(map);
    }
    // If 'vector', no external tile layer is added, keeping the canvas completely clean & watermark-free!
  }, [basemapMode, theme]);

  // 3. Render District Layer (64 Districts)
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !districtsData) return;

    if (districtsLayerRef.current) {
      map.removeLayer(districtsLayerRef.current);
    }

    const isDark = theme === 'dark';

    const defaultStyle = (feature) => {
      const color = feature.properties.color || '#6366f1';
      return {
        fillColor: color,
        weight: 1.5,
        opacity: 0.95,
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.6)',
        dashArray: '',
        fillOpacity: isDark ? 0.45 : 0.55
      };
    };

    const highlightStyle = (feature) => {
      const color = feature.properties.color || '#6366f1';
      return {
        fillColor: color,
        weight: 3,
        color: '#ffffff',
        dashArray: '',
        fillOpacity: 0.85
      };
    };

    const layer = L.geoJSON(districtsData, {
      style: defaultStyle,
      onEachFeature: (feature, l) => {
        const props = feature.properties;

        // Custom Tooltip
        const tooltipHtml = `
          <div class="tooltip-box">
            <span class="tooltip-title-bn">${props.bn_name || props.name} জেলা</span>
            <span class="tooltip-title-en">${props.name} District</span>
            <span class="tooltip-sub">${props.division_bn} বিভাগ</span>
          </div>
        `;

        l.bindTooltip(tooltipHtml, {
          className: 'custom-leaflet-tooltip',
          sticky: true,
          direction: 'top',
          offset: [0, -10]
        });

        l.on({
          mouseover: (e) => {
            const currentZoomLevel = map.getZoom();
            if (currentZoomLevel < 9) {
              e.target.setStyle(highlightStyle(feature));
            }
            l.openTooltip();
            onHoverFeature({
              type: 'district',
              ...props
            });
          },
          mouseout: (e) => {
            layer.resetStyle(e.target);
            l.closeTooltip();
            onHoverFeature(null);
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            onSelectFeature({
              type: 'district',
              ...props
            });
            map.fitBounds(e.target.getBounds(), {
              padding: [60, 60],
              maxZoom: 10,
              animate: true,
              duration: 1
            });
          }
        });
      }
    }).addTo(map);

    districtsLayerRef.current = layer;
  }, [districtsData, theme]);

  // 4. Render Thana / Upazila Layer (544 Upazilas)
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !upazilasData) return;

    if (upazilasLayerRef.current) {
      map.removeLayer(upazilasLayerRef.current);
    }

    const showThanas = currentZoom >= 9 || (selectedFeature && selectedFeature.type === 'district');
    if (!showThanas) return;

    const selectedDistrictId = selectedFeature?.type === 'district' ? selectedFeature.id : null;

    const layer = L.geoJSON(upazilasData, {
      filter: (feature) => {
        // If a specific district is selected, focus on that district's upazilas unless zoomed deeper
        if (selectedDistrictId && currentZoom < 10) {
          return feature.properties.district_id === selectedDistrictId;
        }
        return true;
      },
      style: (feature) => {
        const color = feature.properties.color || '#6366f1';
        const isParentSelected = selectedDistrictId && feature.properties.district_id === selectedDistrictId;
        return {
          fillColor: color,
          weight: 1.2,
          opacity: 1,
          color: '#ffffff',
          dashArray: '2, 3',
          fillOpacity: isParentSelected ? 0.65 : 0.4
        };
      },
      onEachFeature: (feature, l) => {
        const props = feature.properties;

        const tooltipHtml = `
          <div class="tooltip-box">
            <span class="tooltip-title-bn">${props.bn_name || props.name} থানা / উপজেলা</span>
            <span class="tooltip-title-en">${props.name} Upazila</span>
            <span class="tooltip-sub">${props.district_bn} জেলা • ${props.division_bn}</span>
          </div>
        `;

        l.bindTooltip(tooltipHtml, {
          className: 'custom-leaflet-tooltip',
          sticky: true,
          direction: 'top',
          offset: [0, -10]
        });

        l.on({
          mouseover: (e) => {
            e.target.setStyle({
              weight: 3,
              color: '#facc15',
              fillOpacity: 0.9,
              dashArray: ''
            });
            l.openTooltip();
            onHoverFeature({
              type: 'upazila',
              ...props
            });
          },
          mouseout: (e) => {
            layer.resetStyle(e.target);
            l.closeTooltip();
            onHoverFeature(null);
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            onSelectFeature({
              type: 'upazila',
              ...props
            });
            map.fitBounds(e.target.getBounds(), {
              padding: [100, 100],
              maxZoom: 12,
              animate: true,
              duration: 1
            });
          }
        });
      }
    }).addTo(map);

    upazilasLayerRef.current = layer;
  }, [upazilasData, currentZoom, selectedFeature]);

  return (
    <div className="map-viewport" ref={containerRef} id="leaflet-map-canvas" />
  );
}
