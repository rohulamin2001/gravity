import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SvgEditor from './components/SvgEditor';
import SvgPreview from './components/SvgPreview';
import ExportToolbar from './components/ExportToolbar';
import { SAMPLE_SVGS } from './utils/sampleSvgs';
import './App.css';

export default function App() {
  // Initialize with a beautiful sample SVG so the user sees immediate results
  const [svgCode, setSvgCode] = useState(() => SAMPLE_SVGS[0].code);
  const [previewBg, setPreviewBg] = useState('checkerboard');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('svgstudio-theme') || 'dark';
  });

  // Sync theme with DOM root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('svgstudio-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Determine if code has valid SVG root structure
  const isSvgValid = useMemo(() => {
    if (!svgCode || !svgCode.trim()) return false;
    const lower = svgCode.toLowerCase();
    return lower.includes('<svg') && lower.includes('</svg>');
  }, [svgCode]);

  const handleSelectSample = (code) => {
    if (code) {
      setSvgCode(code);
    } else {
      setSvgCode(SAMPLE_SVGS[0].code);
    }
  };

  return (
    <div className="app-root">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="studio-main">
        <div className="studio-container">
          {/* Left Column (Desktop) / Top (Mobile): SVG Code Editor */}
          <SvgEditor
            svgCode={svgCode}
            setSvgCode={setSvgCode}
            onSelectSample={handleSelectSample}
          />

          {/* Right Column (Desktop) / Bottom (Mobile): Live Preview & Export Toolbar */}
          <div className="preview-column">
            <SvgPreview
              svgCode={svgCode}
              previewBg={previewBg}
              setPreviewBg={setPreviewBg}
              onSelectSample={() => handleSelectSample(SAMPLE_SVGS[0].code)}
            />

            <ExportToolbar
              svgCode={svgCode}
              isSvgValid={isSvgValid}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 SVG Studio • 100% In-Browser SVG Live Preview & Multi-Format Converter</p>
      </footer>
    </div>
  );
}
