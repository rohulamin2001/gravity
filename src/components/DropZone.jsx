import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, ImagePlus, Sparkles } from 'lucide-react';

export default function DropZone({ onFilesAdded, onAddDemoImages }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFilesAdded(acceptedFiles);
    }
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.svg', '.avif']
    },
    multiple: true
  });

  return (
    <div className="dropzone-section">
      <div
        {...getRootProps()}
        className={`dropzone-card ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''}`}
      >
        <input {...getInputProps()} />

        <div className="dropzone-content">
          <div className="dropzone-icon-wrapper">
            <UploadCloud className="dropzone-icon" size={40} />
            <div className="icon-pulse"></div>
          </div>

          <div className="dropzone-text">
            <h3>
              {isDragActive
                ? 'Drop your images here...'
                : 'Drag & drop your images here'}
            </h3>
            <p>or click anywhere in the zone to browse from your device</p>
          </div>

          <div className="dropzone-meta">
            <span className="meta-tag">PNG</span>
            <span className="meta-tag">JPG</span>
            <span className="meta-tag">WebP</span>
            <span className="meta-tag">SVG</span>
            <span className="meta-tag">GIF</span>
            <span className="meta-tag">AVIF</span>
          </div>

          <button
            type="button"
            className="browse-btn"
            onClick={(e) => e.stopPropagation()} // lets root click trigger file browser
          >
            <ImagePlus size={18} />
            <span>Select Images</span>
          </button>
        </div>
      </div>

      {onAddDemoImages && (
        <div className="demo-actions">
          <span className="demo-label">Don't have images handy?</span>
          <button
            type="button"
            className="demo-btn"
            onClick={onAddDemoImages}
          >
            <Sparkles size={16} />
            <span>Load Demo Samples</span>
          </button>
        </div>
      )}
    </div>
  );
}
