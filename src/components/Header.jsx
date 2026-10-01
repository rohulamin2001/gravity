import React, { useState, useRef, useEffect } from 'react';
import { Search, X, RotateCcw, Sun, Moon, MapPin, Compass } from 'lucide-react';

const DIVISIONS = [
  { id: 'dhaka', name: 'Dhaka', bn: 'ঢাকা', color: '#6366f1' },
  { id: 'chattogram', name: 'Chattogram', bn: 'চট্টগ্রাম', color: '#0284c7' },
  { id: 'sylhet', name: 'Sylhet', bn: 'সিলেট', color: '#059669' },
  { id: 'rajshahi', name: 'Rajshahi', bn: 'রাজশাহী', color: '#d97706' },
  { id: 'khulna', name: 'Khulna', bn: 'খুলনা', color: '#0d9488' },
  { id: 'barishal', name: 'Barishal', bn: 'বরিশাল', color: '#7c3aed' },
  { id: 'rangpur', name: 'Rangpur', bn: 'রংপুর', color: '#db2777' },
  { id: 'mymensingh', name: 'Mymensingh', bn: 'ময়মনসিংহ', color: '#ea580c' },
];

export default function Header({
  searchIndex = [],
  onSelectFeature,
  onSelectDivision,
  onResetView,
  selectedDivision,
  theme,
  onToggleTheme
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (!val.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const q = val.trim().toLowerCase();
    // Filter matching items (English name or Bangla name)
    const filtered = searchIndex
      .filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.bn_name && item.bn_name.includes(q))
      )
      .slice(0, 10);

    setResults(filtered);
    setIsOpen(true);
  };

  const handleSelectResult = (item) => {
    onSelectFeature(item);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <header className="app-header">
      {/* Brand Logo & Name */}
      <div className="brand-section" onClick={onResetView} title="পুরো বাংলাদেশে ফিরে যান">
        <div className="flag-icon" />
        <div className="brand-titles">
          <h1 className="brand-title">বাংলাদেশের মানচিত্র</h1>
          <span className="brand-subtitle">Interactive Vector GIS</span>
        </div>
      </div>

      {/* Autocomplete Search Bar */}
      <div className="search-container" ref={searchRef}>
        <div className="search-input-wrapper">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="জেলা বা থানা খুঁজুন (যেমন: সাভার, মিরপুর)..."
            value={query}
            onChange={handleSearchChange}
            onFocus={() => query.trim() && setIsOpen(true)}
            id="map-search-input"
          />
          {query && (
            <button
              className="clear-search-btn"
              onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
              title="মুছুন"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {isOpen && results.length > 0 && (
          <div className="search-dropdown">
            {results.map((item, index) => {
              const badgeLabel =
                item.type === 'division' ? 'বিভাগ' :
                item.type === 'district' ? 'জেলা' : 'থানা / উপজেলা';
              return (
                <div
                  key={`${item.type}-${item.id || item.name}-${index}`}
                  className="search-result-item"
                  onClick={() => handleSelectResult(item)}
                >
                  <div className="search-item-info">
                    <span className="search-item-name">
                      {item.bn_name} ({item.name})
                    </span>
                    <span className="search-item-parent">
                      {item.parent}
                    </span>
                  </div>
                  <span
                    className="search-item-badge"
                    style={{
                      borderLeft: `3px solid ${item.color || 'var(--accent-primary)'}`
                    }}
                  >
                    {badgeLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Division Pills for quick jump */}
      <div className="division-pills-wrapper">
        {DIVISIONS.map(div => {
          const isActive = selectedDivision === div.name;
          return (
            <button
              key={div.id}
              className={`division-pill ${isActive ? 'active' : ''}`}
              style={{
                color: isActive ? '#fff' : undefined,
                background: isActive ? div.color : undefined,
                borderColor: isActive ? div.color : undefined
              }}
              onClick={() => onSelectDivision(div)}
              title={`${div.bn} বিভাগে জুম করুন`}
            >
              <span
                className="pill-dot"
                style={{ backgroundColor: div.color }}
              />
              {div.bn}
            </button>
          );
        })}
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        <button
          className="action-btn"
          onClick={onResetView}
          title="মানচিত্র রিসেট করুন"
          id="reset-view-btn"
        >
          <RotateCcw size={15} />
          <span>রিসেট</span>
        </button>

        <button
          className="action-btn icon-only"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'লাইট মোড' : 'ডার্ক মোড'}
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
