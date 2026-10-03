import React from 'react';
import { Layers, ShieldCheck, Sun, Moon, Code2 } from 'lucide-react';

export default function Header({ theme, toggleTheme }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-group">
          <div className="brand-logo">
            <Code2 size={24} className="logo-svg" />
          </div>
          <div>
            <div className="title-row">
              <h1 className="brand-title">SVG Studio</h1>
              <span className="version-pill">v1.0</span>
            </div>
            <p className="brand-subtitle">Live SVG Preview & Multi-Format Vector Converter</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="privacy-pill" title="All rendering and image conversions happen locally in your browser. Nothing is sent to any server.">
            <ShieldCheck size={16} className="privacy-icon" />
            <span>100% Client-Side & Private</span>
          </div>

          <button
            type="button"
            className="theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </div>
    </header>
  );
}
