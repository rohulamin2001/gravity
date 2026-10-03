import React, { useState } from 'react';
import { 
  Archive, 
  Trash2, 
  Wand2, 
  Layers, 
  Calendar, 
  FileType, 
  Hash, 
  Check, 
  Loader2 
} from 'lucide-react';
import { formatFileSize } from '../utils/filename';

export default function BatchToolbar({
  images,
  onApplyBatchPattern,
  onApplyGlobalPreset,
  onApplyGlobalFormat,
  onDownloadZip,
  onClearAll,
  isZipping
}) {
  const [patternText, setPatternText] = useState('photo-[01]');
  const [showPatternInput, setShowPatternInput] = useState(false);
  const [selectedGlobalFormat, setSelectedGlobalFormat] = useState('keep');

  const totalSize = images.reduce((acc, img) => acc + (img.file?.size || 0), 0);
  const modifiedCount = images.filter(
    (img) => img.customName !== img.originalBaseName || img.format !== 'original'
  ).length;

  const handleApplyPattern = (e) => {
    e.preventDefault();
    if (!patternText.trim()) return;
    onApplyBatchPattern(patternText.trim());
  };

  const handleGlobalFormatChange = (e) => {
    const val = e.target.value;
    setSelectedGlobalFormat(val);
    if (val !== 'keep') {
      onApplyGlobalFormat(val);
    }
  };

  return (
    <div className="batch-toolbar">
      {/* Top row: Summary and quick batch actions */}
      <div className="toolbar-top">
        <div className="batch-stats">
          <div className="stat-item">
            <span className="stat-label">Total Images:</span>
            <span className="stat-value">{images.length}</span>
          </div>
          <div className="stat-divider">•</div>
          <div className="stat-item">
            <span className="stat-label">Total Size:</span>
            <span className="stat-value">{formatFileSize(totalSize)}</span>
          </div>
          {modifiedCount > 0 && (
            <>
              <div className="stat-divider">•</div>
              <div className="stat-item highlight">
                <span className="stat-value">{modifiedCount} modified</span>
              </div>
            </>
          )}
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            className="toolbar-btn secondary"
            onClick={() => setShowPatternInput(!showPatternInput)}
            title="Batch sequence rename using pattern like photo-[01]"
          >
            <Hash size={16} />
            <span>Pattern Rename</span>
          </button>

          <button
            type="button"
            className="toolbar-btn danger"
            onClick={onClearAll}
            title="Remove all uploaded images"
          >
            <Trash2 size={16} />
            <span>Clear All</span>
          </button>

          <button
            type="button"
            className="toolbar-btn primary zip-btn"
            onClick={onDownloadZip}
            disabled={isZipping || images.length === 0}
            title="Download all renamed files bundled into a single ZIP archive"
          >
            {isZipping ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Creating ZIP...</span>
              </>
            ) : (
              <>
                <Archive size={18} />
                <span>Download All (.ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pattern Rename Collapsible Drawer */}
      {showPatternInput && (
        <form onSubmit={handleApplyPattern} className="pattern-drawer">
          <div className="drawer-title">
            <Wand2 size={16} />
            <span>Batch Pattern Renamer</span>
          </div>
          <div className="drawer-controls">
            <div className="pattern-input-group">
              <input
                type="text"
                value={patternText}
                onChange={(e) => setPatternText(e.target.value)}
                placeholder="e.g. project-asset-[01] or photo-[n]"
                className="pattern-input"
              />
              <span className="pattern-hint">Use [01], [1], or [n] for sequential numbers</span>
            </div>
            <button type="submit" className="pattern-apply-btn">
              Apply to All ({images.length})
            </button>
          </div>
        </form>
      )}

      {/* Bottom row: Quick Global Transformations */}
      <div className="toolbar-bottom">
        <div className="global-presets">
          <span className="global-label">Apply to All:</span>
          <button
            type="button"
            className="global-pill"
            onClick={() => onApplyGlobalPreset('kebab')}
            title="Convert all names to kebab-case"
          >
            kebab-case
          </button>
          <button
            type="button"
            className="global-pill"
            onClick={() => onApplyGlobalPreset('snake')}
            title="Convert all names to snake_case"
          >
            snake_case
          </button>
          <button
            type="button"
            className="global-pill"
            onClick={() => onApplyGlobalPreset('camel')}
            title="Convert all names to camelCase"
          >
            camelCase
          </button>
          <button
            type="button"
            className="global-pill"
            onClick={() => onApplyGlobalPreset('lower')}
            title="Lowercase all names"
          >
            lowercase
          </button>
          <button
            type="button"
            className="global-pill"
            onClick={() => onApplyGlobalPreset('date')}
            title="Append today's date to all names"
          >
            <Calendar size={13} />
            <span>+ date</span>
          </button>
          <button
            type="button"
            className="global-pill reset"
            onClick={() => onApplyGlobalPreset('reset')}
            title="Reset all names to original"
          >
            Reset All
          </button>
        </div>

        <div className="global-format-picker">
          <label className="format-label">
            <FileType size={15} />
            <span>Convert All:</span>
          </label>
          <select
            value={selectedGlobalFormat}
            onChange={handleGlobalFormatChange}
            className="global-select"
          >
            <option value="keep">Keep Current</option>
            <option value="original">Original Format</option>
            <option value="webp">WebP (.webp)</option>
            <option value="png">PNG (.png)</option>
            <option value="jpg">JPG (.jpg)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
