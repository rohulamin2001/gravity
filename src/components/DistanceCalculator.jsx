import React, { useState } from 'react';
import { X, Navigation, ArrowRightLeft, Clock, Compass, Car } from 'lucide-react';
import { calculateRoadDistance, calculateStraightDistance, estimateDriveTime } from '../utils/distance';

export default function DistanceCalculator({
  isOpen,
  onClose,
  districts = [],
  onApplyRoute,
  onClearRoute
}) {
  const [originId, setOriginId] = useState('dhaka');
  const [destId, setDestId] = useState('chattogram');

  if (!isOpen) return null;

  const originDistrict = districts.find(d => d.id === originId) || districts[0];
  const destDistrict = districts.find(d => d.id === destId) || districts[1];

  let roadDist = 0;
  let straightDist = 0;
  let driveTime = '';

  if (originDistrict && destDistrict && originDistrict.center && destDistrict.center) {
    const [lat1, lng1] = originDistrict.center;
    const [lat2, lng2] = destDistrict.center;
    roadDist = calculateRoadDistance(lat1, lng1, lat2, lng2);
    straightDist = Math.round(calculateStraightDistance(lat1, lng1, lat2, lng2));
    driveTime = estimateDriveTime(roadDist);
  }

  const handleSwap = () => {
    setOriginId(destId);
    setDestId(originId);
  };

  const handleShowRoute = () => {
    if (originDistrict && destDistrict) {
      onApplyRoute(originDistrict, destDistrict);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-modal-card" style={{ maxWidth: '440px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="tool-icon-pill" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
              <Navigation size={18} />
            </div>
            <div>
              <h3 className="modal-title">দূরত্ব ও ভ্রমণ সময় পরিমাপক</h3>
              <span className="modal-sub">বাংলাদেশের যেকোনো দুই জেলার সড়ক দূরত্ব</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => { onClearRoute(); onClose(); }}>
            <X size={18} />
          </button>
        </div>

        {/* Origin / Destination Pickers */}
        <div className="calculator-body">
          <div className="route-picker-row">
            <div className="input-group">
              <label className="input-label">শুরুর স্থান (Origin)</label>
              <select
                className="custom-select"
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
              >
                {districts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.bn_name} ({d.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              className="swap-btn"
              onClick={handleSwap}
              title="স্থান পরিবর্তন করুন"
            >
              <ArrowRightLeft size={16} />
            </button>

            <div className="input-group">
              <label className="input-label">গন্তব্য (Destination)</label>
              <select
                className="custom-select"
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
              >
                {districts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.bn_name} ({d.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="distance-results-card">
            <div className="result-metric-row">
              <div className="result-metric">
                <span className="metric-label">
                  <Car size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  সড়ক দূরত্ব (আনুমানিক)
                </span>
                <span className="metric-number">{roadDist} <small>কিমি</small></span>
              </div>

              <div className="result-metric">
                <span className="metric-label">
                  <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  সম্ভাব্য ড্রাইভ সময়
                </span>
                <span className="metric-number">{driveTime}</span>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>আকাশপথের সরাসরি দূরত্ব: <strong>{straightDist} কিমি</strong></span>
              <span>গতিবেগ: ~৪৮ কিমি/ঘণ্টা</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              className="action-btn primary-glow-btn"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleShowRoute}
            >
              <Navigation size={15} />
              <span>ম্যাপে রুট আঁকুন</span>
            </button>

            <button
              className="action-btn"
              onClick={onClearRoute}
              title="রুট রেখা মুছুন"
            >
              মুছুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
