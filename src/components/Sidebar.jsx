import React from 'react';
import {
  X,
  ChevronRight,
  Maximize2,
  MapPin,
  Layers,
  Compass,
  Building,
  Info
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  selectedFeature,
  onSelectFeature,
  onResetView,
  upazilasInDistrict = [],
  onZoomToCurrent
}) {
  if (!isOpen) return null;

  const isDistrict = selectedFeature?.type === 'district';
  const isUpazila = selectedFeature?.type === 'upazila';
  const isDivision = selectedFeature?.type === 'division';

  const titleBn = selectedFeature?.bn_name || 'বাংলাদেশ';
  const titleEn = selectedFeature?.name || 'Bangladesh';
  const divisionBn = selectedFeature?.division_bn || selectedFeature?.bn_name || 'বাংলাদেশ';
  const divisionEn = selectedFeature?.division_name || selectedFeature?.name || 'Bangladesh';
  const districtBn = selectedFeature?.district_bn || (isDistrict ? titleBn : '');
  const districtEn = selectedFeature?.district_name || (isDistrict ? titleEn : '');
  const color = selectedFeature?.color || '#6366f1';

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
                  id: selectedFeature.district_id || selectedFeature.id,
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
              </div>

              <h2 className="feature-title-bn">{titleBn}</h2>
              <span className="feature-title-en">{titleEn}</span>
            </div>

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

              <div className="stat-card">
                <span className="stat-label">অক্ষাংশ (Lat)</span>
                <span className="stat-value">
                  {selectedFeature.center ? selectedFeature.center[0].toFixed(3) : '–'}° N
                </span>
              </div>

              <div className="stat-card">
                <span className="stat-label">দ্রাঘিমাংশ (Lng)</span>
                <span className="stat-value">
                  {selectedFeature.center ? selectedFeature.center[1].toFixed(3) : '–'}° E
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <button
              className="action-btn"
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
              বাংলাদেশ মানচিত্র নির্দেশিকা
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              • মানচিত্রের যেকোনো <strong>জেলার</strong> ওপর মাউস রাখলে জেলার নাম ভেসে উঠবে।
              <br /><br />
              • জেলায় ক্লিক করলে অথবা জুম ইন করলে স্বয়ংক্রিয়ভাবে <strong>থানা ও উপজেলাগুলোর</strong> সীমানা ফুটে উঠবে।
              <br /><br />
              • উপরের সার্চ বারে যেকোনো জেলা বা থানার নাম লিখে সরাসরি জাম্প করুন।
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
