import React, { useMemo } from 'react';
import { 
  Eye, 
  Grid, 
  Maximize2, 
  AlertCircle, 
  Sun, 
  Moon, 
  Sparkles 
} from 'lucide-react';
import { parseSvgDimensions, normalizeSvgString } from '../utils/svgConverter';

export default function SvgPreview({ 
  svgCode, 
  previewBg, 
  setPreviewBg, 
  onSelectSample 
}) {
  const normalized = useMemo(() => normalizeSvgString(svgCode), [svgCode]);
  const dimensions = useMemo(() => parseSvgDimensions(normalized), [normalized]);

  // Check if string contains standard svg tags
  const isValidSvg = useMemo(() => {
    if (!svgCode || !svgCode.trim()) return false;
    const lower = svgCode.toLowerCase();
    return lower.includes('<svg') && lower.includes('</svg>');
  }, [svgCode]);

  return (
    <div className="panel preview-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title-group">
          <Eye size={18} className="panel-icon" />
          <h2 className="panel-title">Live Preview</h2>
          {isValidSvg && (
            <span className="dimension-badge">
              {dimensions.width} × {dimensions.height}
            </span>
          )}
        </div>

        {/* Background Selector Buttons */}
        <div className="bg-toggle-group">
          <button
            type="button"
            className={`bg-toggle-btn ${previewBg === 'checkerboard' ? 'active' : ''}`}
            onClick={() => setPreviewBg('checkerboard')}
            title="Transparent Checkerboard Background"
          >
            <Grid size={15} />
            <span className="btn-label">Grid</span>
          </button>
          <button
            type="button"
            className={`bg-toggle-btn ${previewBg === 'dark' ? 'active' : ''}`}
            onClick={() => setPreviewBg('dark')}
            title="Dark Background"
          >
            <Moon size={15} />
            <span className="btn-label">Dark</span>
          </button>
          <button
            type="button"
            className={`bg-toggle-btn ${previewBg === 'light' ? 'active' : ''}`}
            onClick={() => setPreviewBg('light')}
            title="Light Background"
          >
            <Sun size={15} />
            <span className="btn-label">Light</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className={`preview-viewport bg-${previewBg}`}>
        {isValidSvg ? (
          <div 
            className="svg-render-wrapper"
            dangerouslySetInnerHTML={{ __html: normalized }}
          />
        ) : svgCode && svgCode.trim().length > 0 ? (
          <div className="preview-error-state">
            <AlertCircle size={36} className="error-icon" />
            <h3>Invalid SVG Markup</h3>
            <p>Ensure your code starts with <code>&lt;svg&gt;</code> and ends with <code>&lt;/svg&gt;</code>.</p>
          </div>
        ) : (
          <div className="preview-empty-state">
            <div className="empty-sparkle">
              <Sparkles size={36} />
            </div>
            <h3>SVG Preview Area</h3>
            <p>Paste SVG code on the left to see instant live rendering here.</p>
            {onSelectSample && (
              <button 
                type="button" 
                className="empty-sample-btn"
                onClick={() => onSelectSample()}
              >
                Load Sample SVG
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
