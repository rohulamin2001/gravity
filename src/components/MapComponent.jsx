import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { generateCurvedRoute } from '../utils/distance';

const BD_CENTER = [23.6850, 90.3563];

export default function MapComponent({
  districtsData,
  upazilasData,
  touristSpots = [],
  selectedFeature,
  onSelectFeature,
  onHoverFeature,
  currentZoom,
  onZoomChange,
  theme,
  basemapMode = 'vector',
  showTouristPins = false,
  routeData = null,
  quizHighlight = null, // { districtId, type: 'correct' | 'reveal' }
  mapRef
}) {
  const containerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const districtsLayerRef = useRef(null);
  const upazilasLayerRef = useRef(null);
  const touristLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
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

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

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

  // 2. Basemap Switcher
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
        opacity: theme === 'dark' ? 0.35 : 0.75
      }).addTo(map);
    } else if (basemapMode === 'satellite') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        opacity: 0.7
      }).addTo(map);
    }
  }, [basemapMode, theme]);

  // 3. Render Districts Layer with Spotlight & Quiz Support
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !districtsData) return;

    if (districtsLayerRef.current) {
      map.removeLayer(districtsLayerRef.current);
    }

    const isDark = theme === 'dark';
    const selectedDistId = selectedFeature?.type === 'district' ? selectedFeature.id : null;

    const getStyle = (feature) => {
      const id = feature.properties.id;
      const baseColor = feature.properties.color || '#6366f1';

      // Quiz feedback highlight
      if (quizHighlight && quizHighlight.districtId === id) {
        return {
          fillColor: quizHighlight.type === 'correct' ? '#10b981' : '#f59e0b',
          weight: 4,
          opacity: 1,
          color: '#ffffff',
          fillOpacity: 0.95
        };
      }

      // Spotlight mode: If a district is selected
      if (selectedDistId) {
        if (id === selectedDistId) {
          // Selected district in spotlight
          return {
            fillColor: baseColor,
            weight: 3.5,
            opacity: 1,
            color: '#facc15', // Golden spotlight border
            fillOpacity: 0.9
          };
        } else {
          // Non-selected districts dimmed out
          return {
            fillColor: baseColor,
            weight: 1,
            opacity: 0.25,
            color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
            fillOpacity: 0.1
          };
        }
      }

      // Normal default style
      return {
        fillColor: baseColor,
        weight: 1.5,
        opacity: 0.95,
        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.6)',
        fillOpacity: isDark ? 0.45 : 0.55
      };
    };

    const layer = L.geoJSON(districtsData, {
      style: getStyle,
      onEachFeature: (feature, l) => {
        const props = feature.properties;

        const tooltipHtml = `
          <div class="tooltip-box">
            <span class="tooltip-title-bn">${props.bn_name || props.name} জেলা</span>
            <span class="tooltip-title-en">${props.name} District</span>
            <span class="tooltip-sub">${props.division_bn} বিভাগ • ${props.upazila_count || ''} উপজেলা</span>
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
            if (currentZoomLevel < 9 && (!selectedDistId || selectedDistId === props.id)) {
              e.target.setStyle({
                weight: 3,
                color: '#ffffff',
                fillOpacity: 0.85
              });
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

            // If quiz is currently active, forward click to quiz handler!
            if (window.__handleQuizMapClick) {
              window.__handleQuizMapClick(props);
              return;
            }

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
  }, [districtsData, selectedFeature, quizHighlight, theme]);

  // 4. Render Thana / Upazila Layer
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

  // 5. Render Tourist Landmarks Layer (Pins & Popups)
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (touristLayerRef.current) {
      map.removeLayer(touristLayerRef.current);
      touristLayerRef.current = null;
    }

    if (!showTouristPins || !touristSpots || touristSpots.length === 0) return;

    const markersGroup = L.layerGroup();

    touristSpots.forEach(spot => {
      const iconHtml = `
        <div class="tourist-pin-badge" title="${spot.bn_name}">
          <span class="pin-pulse"></span>
          <div class="pin-inner-icon">📍</div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'tourist-leaflet-marker',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      });

      const popupHtml = `
        <div class="tourist-popup-card">
          <span class="popup-tag">দর্শনীয় স্থান</span>
          <h4 class="popup-title">${spot.bn_name}</h4>
          <span class="popup-sub">${spot.name} • ${spot.district_bn}</span>
          <p class="popup-desc">${spot.desc}</p>
        </div>
      `;

      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon })
        .bindPopup(popupHtml, { className: 'custom-leaflet-popup' });

      markersGroup.addLayer(marker);
    });

    markersGroup.addTo(map);
    touristLayerRef.current = markersGroup;
  }, [showTouristPins, touristSpots]);

  // 6. Render Distance Animated Route Line
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (!routeData || !routeData.p1 || !routeData.p2) return;

    const group = L.layerGroup();

    // Curved bezier path
    const curvePoints = generateCurvedRoute(routeData.p1, routeData.p2, 35);

    const polyline = L.polyline(curvePoints, {
      color: '#6366f1',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.9,
      className: 'animated-route-line'
    });

    // Start & End pulse circle markers
    const startMarker = L.circleMarker(routeData.p1, {
      radius: 7,
      fillColor: '#10b981',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1
    }).bindTooltip(`শুরু: ${routeData.originName}`, { permanent: true, direction: 'top' });

    const endMarker = L.circleMarker(routeData.p2, {
      radius: 7,
      fillColor: '#ef4444',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1
    }).bindTooltip(`গন্তব্য: ${routeData.destName}`, { permanent: true, direction: 'top' });

    group.addLayer(polyline);
    group.addLayer(startMarker);
    group.addLayer(endMarker);

    group.addTo(map);
    routeLayerRef.current = group;

    // Fit map bounds to view both points
    map.fitBounds([routeData.p1, routeData.p2], {
      padding: [80, 80],
      animate: true,
      duration: 1.2
    });
  }, [routeData]);

  return (
    <div className="map-viewport" ref={containerRef} id="leaflet-map-canvas" />
  );
}
