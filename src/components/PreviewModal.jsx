import React from 'react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { formatFileSize } from '../utils/filename';

export default function PreviewModal({ item, onClose }) {
  if (!item) return null;

  const currentExt = item.format === 'original' 
    ? item.originalExt 
    : (item.format === 'jpeg' ? 'jpg' : item.format);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <ImageIcon size={20} className="modal-icon" />
            <h3 className="modal-filename">{item.customName}.{currentExt}</h3>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-image-container">
          <img 
            src={item.previewUrl} 
            alt={item.customName} 
            className="modal-full-img" 
          />
        </div>

        <div className="modal-footer">
          <div className="modal-meta-grid">
            <div className="meta-box">
              <span className="meta-k">Original:</span>
              <span className="meta-v">{item.file.name}</span>
            </div>
            <div className="meta-box">
              <span className="meta-k">Target:</span>
              <span className="meta-v highlight">{item.customName}.{currentExt}</span>
            </div>
            <div className="meta-box">
              <span className="meta-k">Size:</span>
              <span className="meta-v">{formatFileSize(item.file.size)}</span>
            </div>
            <div className="meta-box">
              <span className="meta-k">Target Format:</span>
              <span className="meta-v uppercase">{currentExt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
