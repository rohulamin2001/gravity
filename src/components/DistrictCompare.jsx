import React, { useState } from 'react';
import { X, Scale, MapPin, Building, Utensils, Waves, Compass, Maximize2 } from 'lucide-react';

export default function DistrictCompare({
  isOpen,
  onClose,
  districts = [],
  heritageData = {},
  onSelectOnMap
}) {
  const [distAId, setDistAId] = useState('dhaka');
  const [distBId, setDistBId] = useState('bogura');

  if (!isOpen) return null;

  const distA = districts.find(d => d.id === distAId) || districts[0];
  const distB = districts.find(d => d.id === distBId) || districts[1];

  const herA = heritageData[distAId] || {};
  const herB = heritageData[distBId] || {};

  return (
    <div className="modal-backdrop">
      <div className="glass-modal-card" style={{ maxWidth: '680px', width: '92%' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="tool-icon-pill" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
              <Scale size={18} />
            </div>
            <div>
              <h3 className="modal-title">জেলা তুলনামূলক বিশ্লেষণ</h3>
              <span className="modal-sub">বাংলাদেশের দুটি জেলার বৈশিষ্ট্য ও ঐতিহ্যের তুলনা</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Compare Selectors */}
        <div className="compare-grid-header">
          <div className="compare-col-header" style={{ borderColor: distA?.color || '#6366f1' }}>
            <select
              className="custom-select"
              value={distAId}
              onChange={(e) => setDistAId(e.target.value)}
            >
              {districts.map(d => (
                <option key={`a-${d.id}`} value={d.id}>
                  {d.bn_name} ({d.name})
                </option>
              ))}
            </select>
          </div>

          <div className="compare-vs-badge">VS</div>

          <div className="compare-col-header" style={{ borderColor: distB?.color || '#0284c7' }}>
            <select
              className="custom-select"
              value={distBId}
              onChange={(e) => setDistBId(e.target.value)}
            >
              {districts.map(d => (
                <option key={`b-${d.id}`} value={d.id}>
                  {d.bn_name} ({d.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Data Table */}
        <div className="compare-table-container">
          <div className="compare-row">
            <div className="compare-cell cell-left">
              <strong>{distA?.division_bn} বিভাগ</strong>
            </div>
            <div className="compare-label">প্রশাসনিক বিভাগ</div>
            <div className="compare-cell cell-right">
              <strong>{distB?.division_bn} বিভাগ</strong>
            </div>
          </div>

          <div className="compare-row">
            <div className="compare-cell cell-left">
              <span className="badge-highlight">{distA?.upazila_count || '–'} টি</span>
            </div>
            <div className="compare-label">মোট উপজেলা/থানা</div>
            <div className="compare-cell cell-right">
              <span className="badge-highlight">{distB?.upazila_count || '–'} টি</span>
            </div>
          </div>

          <div className="compare-row">
            <div className="compare-cell cell-left">
              <span>{herA.area_sqkm ? `${herA.area_sqkm.toLocaleString()} বর্গ কিমি` : '–'}</span>
            </div>
            <div className="compare-label">আনুমানিক আয়তন</div>
            <div className="compare-cell cell-right">
              <span>{herB.area_sqkm ? `${herB.area_sqkm.toLocaleString()} বর্গ কিমি` : '–'}</span>
            </div>
          </div>

          <div className="compare-row">
            <div className="compare-cell cell-left food-cell">
              <span>{herA.famous_food || '–'}</span>
            </div>
            <div className="compare-label">ঐতিহ্যবাহী বিখ্যাত খাবার</div>
            <div className="compare-cell cell-right food-cell">
              <span>{herB.famous_food || '–'}</span>
            </div>
          </div>

          <div className="compare-row">
            <div className="compare-cell cell-left">
              <span>{herA.rivers ? herA.rivers.join(', ') : '–'}</span>
            </div>
            <div className="compare-label">প্রধান নদ-নদী</div>
            <div className="compare-cell cell-right">
              <span>{herB.rivers ? herB.rivers.join(', ') : '–'}</span>
            </div>
          </div>

          <div className="compare-row">
            <div className="compare-cell cell-left spots-cell">
              {herA.tourist_spots ? herA.tourist_spots.slice(0, 3).map((s, i) => (
                <span key={i} className="small-pill">{s}</span>
              )) : '–'}
            </div>
            <div className="compare-label">শীর্ষ দর্শনীয় স্থান</div>
            <div className="compare-cell cell-right spots-cell">
              {herB.tourist_spots ? herB.tourist_spots.slice(0, 3).map((s, i) => (
                <span key={i} className="small-pill">{s}</span>
              )) : '–'}
            </div>
          </div>
        </div>

        {/* View on Map buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button
            className="action-btn"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => { onSelectOnMap(distA); onClose(); }}
          >
            <MapPin size={14} />
            <span>ম্যাপে {distA?.bn_name} দেখুন</span>
          </button>
          <button
            className="action-btn"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => { onSelectOnMap(distB); onClose(); }}
          >
            <MapPin size={14} />
            <span>ম্যাপে {distB?.bn_name} দেখুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
