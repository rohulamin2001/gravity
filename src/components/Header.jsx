import React from 'react';
import { Sparkles, Sun, Moon, ShieldCheck, Image as ImageIcon } from 'lucide-react';

export default function Header({ theme, toggleTheme, imageCount }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand">
          <div className="logo-badge">
            <ImageIcon className="logo-icon" size={24} />
          </div>
          <div>
            <div className="title-row">
              <h1 className="brand-title">PixelRename</h1>
              <span className="version-tag">v1.0</span>
            </div>
            <p className="brand-subtitle">Smart SEO Filename Sanitizer & Format Converter</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="privacy-badge" title="All processing happens inside your browser. No files leave your device.">
            <ShieldCheck size={16} className="privacy-icon" />
            <span>100% In-Browser & Private</span>
          </div>

          {imageCount > 0 && (
            <div className="count-pill">
              <span className="count-number">{imageCount}</span>
              <span className="count-label">{imageCount === 1 ? 'image' : 'images'}</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </div>
    </header>
  );
}
