import React, { useState } from 'react';
import { 
  Download, 
  FileType, 
  Sliders, 
  Check, 
  Loader2, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportSvgAsFile, convertSvgToRaster } from '../utils/svgConverter';

export default function ExportToolbar({ svgCode, isSvgValid }) {
  const [format, setFormat] = useState('svg'); // 'svg' | 'webp' | 'png' | 'jpg'
  const [scale, setScale] = useState(2);       // 1, 2, 4
  const [filename, setFilename] = useState('vector-graphic');
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDownload = async () => {
    if (!svgCode || !isSvgValid) {
      alert('Please paste valid SVG code before downloading.');
      return;
    }

    try {
      setIsExporting(true);
      const cleanName = (filename.trim() || 'vector-graphic').replace(/\s+/g, '-');

      if (format === 'svg') {
        exportSvgAsFile(svgCode, `${cleanName}.svg`);
      } else {
        await convertSvgToRaster(svgCode, {
          format,
          scale,
          quality: 0.95,
          filename: cleanName
        });
      }

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2200);

      // Trigger Confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#38bdf8', '#f59e0b']
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please check the SVG code syntax.');
    } finally {
      setIsExporting(false);
    }
  };

  const isRaster = format !== 'svg';

  return (
    <div className="export-toolbar-card">
      <div className="export-controls-row">
        {/* Filename Input */}
        <div className="control-group filename-group">
          <label htmlFor="export-filename" className="control-label">
            File Name
          </label>
          <div className="filename-input-wrap">
            <input
              id="export-filename"
              type="text"
              className="export-filename-input"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g. logo-graphic"
            />
            <span className="ext-badge">.{format}</span>
          </div>
        </div>

        {/* Format Selector Dropdown */}
        <div className="control-group format-group">
          <label htmlFor="export-format" className="control-label">
            <FileType size={14} />
            <span>Format</span>
          </label>
          <select
            id="export-format"
            className="export-select"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="svg">SVG (.svg - Vector)</option>
            <option value="webp">WebP (.webp - NextGen)</option>
            <option value="png">PNG (.png - Lossless)</option>
            <option value="jpg">JPG (.jpg - Standard)</option>
          </select>
        </div>

        {/* Scale Selector (Visible for raster formats: PNG, JPG, WebP) */}
        {isRaster && (
          <div className="control-group scale-group">
            <label className="control-label">
              <Sliders size={14} />
              <span>Resolution</span>
            </label>
            <div className="scale-pills">
              <button
                type="button"
                className={`scale-pill ${scale === 1 ? 'active' : ''}`}
                onClick={() => setScale(1)}
                title="Standard 1x resolution"
              >
                1x
              </button>
              <button
                type="button"
                className={`scale-pill ${scale === 2 ? 'active' : ''}`}
                onClick={() => setScale(2)}
                title="Retina 2x resolution (Crisp)"
              >
                2x
              </button>
              <button
                type="button"
                className={`scale-pill ${scale === 4 ? 'active' : ''}`}
                onClick={() => setScale(4)}
                title="Ultra-HD 4x resolution"
              >
                4x
              </button>
            </div>
          </div>
        )}

        {/* Download Button */}
        <div className="control-group action-group">
          <button
            type="button"
            className={`download-cta-btn ${isSuccess ? 'success' : ''}`}
            onClick={handleDownload}
            disabled={!isSvgValid || isExporting}
            title={isSvgValid ? 'Download file' : 'Paste valid SVG to download'}
          >
            {isExporting ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Exporting...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check size={18} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {format === 'jpg' && (
        <div className="export-hint">
          💡 <strong>JPG note:</strong> Transparent SVG backgrounds will be automatically rendered on a clean white background.
        </div>
      )}
    </div>
  );
}
