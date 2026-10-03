import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  FileType, 
  Check, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toKebabCase, toSnakeCase, toCamelCase, appendDate, formatFileSize } from '../utils/filename';

export default function ImageCard({ 
  item, 
  onUpdateName, 
  onUpdateFormat, 
  onDelete, 
  onDownloadSingle,
  onOpenPreview
}) {
  const [dimensions, setDimensions] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    // Load image natural dimensions
    const img = new Image();
    img.src = item.previewUrl;
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [item.previewUrl]);

  const handleApplyPreset = (presetType) => {
    let newName = item.customName;
    switch (presetType) {
      case 'kebab':
        newName = toKebabCase(item.customName);
        break;
      case 'snake':
        newName = toSnakeCase(item.customName);
        break;
      case 'camel':
        newName = toCamelCase(item.customName);
        break;
      case 'lower':
        newName = item.customName.toLowerCase();
        break;
      case 'date':
        newName = appendDate(item.customName);
        break;
      case 'reset':
        newName = item.originalBaseName;
        break;
      default:
        break;
    }
    onUpdateName(item.id, newName);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await onDownloadSingle(item);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const currentExt = item.format === 'original' 
    ? item.originalExt 
    : (item.format === 'jpeg' ? 'jpg' : item.format);

  const isRenamed = item.customName !== item.originalBaseName;
  const isConverted = item.format !== 'original' && item.format !== item.originalExt;

  return (
    <div className={`image-card ${isRenamed || isConverted ? 'has-modifications' : ''}`}>
      {/* Thumbnail column */}
      <div className="card-media">
        <div 
          className="thumbnail-wrapper" 
          onClick={() => onOpenPreview && onOpenPreview(item)}
          title="Click to view full preview"
        >
          <img 
            src={item.previewUrl} 
            alt={item.customName} 
            className="thumbnail-img" 
            loading="lazy"
          />
          <div className="thumbnail-overlay">
            <ExternalLink size={20} />
          </div>
        </div>

        <div className="card-file-specs">
          <span className="spec-badge size">{formatFileSize(item.file.size)}</span>
          {dimensions && (
            <span className="spec-badge dims">{dimensions.width}×{dimensions.height}</span>
          )}
        </div>
      </div>

      {/* Details & Rename controls column */}
      <div className="card-body">
        {/* Original filename reference */}
        <div className="original-reference">
          <span className="ref-label">Original:</span>
          <span className="ref-filename" title={item.file.name}>{item.file.name}</span>
        </div>

        {/* Input for custom filename */}
        <div className="input-group-wrapper">
          <label className="input-label" htmlFor={`rename-input-${item.id}`}>
            Target Filename:
          </label>
          <div className="filename-input-container">
            <input
              id={`rename-input-${item.id}`}
              type="text"
              className="filename-input"
              value={item.customName}
              onChange={(e) => onUpdateName(item.id, e.target.value)}
              placeholder="Enter custom filename..."
              spellCheck="false"
            />
            <span className={`extension-badge ${isConverted ? 'converted' : ''}`} title={`Extension: .${currentExt}`}>
              .{currentExt}
            </span>
          </div>
        </div>

        {/* Quick format presets pills */}
        <div className="presets-row">
          <span className="presets-heading">Quick Format:</span>
          <div className="presets-pills">
            <button
              type="button"
              className="preset-pill"
              onClick={() => handleApplyPreset('kebab')}
              title="Convert to kebab-case (SEO friendly)"
            >
              kebab-case
            </button>
            <button
              type="button"
              className="preset-pill"
              onClick={() => handleApplyPreset('snake')}
              title="Convert to snake_case"
            >
              snake_case
            </button>
            <button
              type="button"
              className="preset-pill"
              onClick={() => handleApplyPreset('camel')}
              title="Convert to camelCase"
            >
              camelCase
            </button>
            <button
              type="button"
              className="preset-pill"
              onClick={() => handleApplyPreset('lower')}
              title="Convert all characters to lowercase"
            >
              lowercase
            </button>
            <button
              type="button"
              className="preset-pill date-pill"
              onClick={() => handleApplyPreset('date')}
              title="Append today's date (YYYY-MM-DD)"
            >
              <Calendar size={13} />
              + date
            </button>
            {isRenamed && (
              <button
                type="button"
                className="preset-pill reset-pill"
                onClick={() => handleApplyPreset('reset')}
                title="Reset to original filename"
              >
                <RefreshCw size={13} />
                reset
              </button>
            )}
          </div>
        </div>

        {/* Bottom controls: Format conversion dropdown and download/delete buttons */}
        <div className="card-footer">
          <div className="format-picker">
            <label htmlFor={`format-select-${item.id}`} className="format-label">
              <FileType size={15} />
              <span>Format:</span>
            </label>
            <select
              id={`format-select-${item.id}`}
              value={item.format}
              onChange={(e) => onUpdateFormat(item.id, e.target.value)}
              className="format-select"
            >
              <option value="original">Original (.{item.originalExt})</option>
              <option value="webp">WebP (.webp - NextGen)</option>
              <option value="png">PNG (.png - Lossless)</option>
              <option value="jpg">JPG (.jpg - Compressed)</option>
            </select>
          </div>

          <div className="action-buttons">
            <button
              type="button"
              className="action-btn delete-btn"
              onClick={() => onDelete(item.id)}
              title="Remove from list"
              aria-label="Remove image"
            >
              <Trash2 size={17} />
            </button>

            <button
              type="button"
              className={`action-btn download-btn ${downloadSuccess ? 'success' : ''}`}
              onClick={handleDownload}
              disabled={isDownloading}
              title="Download renamed image"
            >
              {downloadSuccess ? (
                <>
                  <Check size={17} />
                  <span>Saved!</span>
                </>
              ) : isDownloading ? (
                <>
                  <RefreshCw size={17} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Download size={17} />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
