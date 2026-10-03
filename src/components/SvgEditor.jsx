import React, { useRef, useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Trash2, 
  Upload, 
  Sparkles, 
  Wand2 
} from 'lucide-react';
import { SAMPLE_SVGS } from '../utils/sampleSvgs';

export default function SvgEditor({ svgCode, setSvgCode, onSelectSample }) {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const linesCount = svgCode ? svgCode.split('\n').length : 0;
  const charCount = svgCode.length;
  const byteSize = new Blob([svgCode]).size;
  const sizeKb = (byteSize / 1024).toFixed(2);

  const handleCopy = () => {
    if (!svgCode) return;
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (!svgCode) return;
    if (window.confirm('Clear editor content?')) {
      setSvgCode('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setSvgCode(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'image/svg+xml' || file.name.endsWith('.svg'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setSvgCode(content);
        }
      };
      reader.readAsText(file);
    }
  };

  // Simple XML/SVG Indentation Formatter
  const handleFormat = () => {
    if (!svgCode) return;
    try {
      let formatted = '';
      let indent = '';
      const tab = '  ';
      svgCode.split(/>\s*</).forEach((node) => {
        if (node.match(/^\/\w/)) indent = indent.substring(tab.length);
        formatted += indent + '<' + node + '>\r\n';
        if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab;
      });
      setSvgCode(formatted.trim());
    } catch (e) {
      console.warn('Formatting failed:', e);
    }
  };

  return (
    <div className="panel editor-panel" onDragOver={handleDragOver} onDrop={handleDrop}>
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title-group">
          <FileCode size={18} className="panel-icon" />
          <h2 className="panel-title">SVG Code Input</h2>
        </div>

        <div className="editor-top-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".svg,image/svg+xml"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload .svg file"
          >
            <Upload size={15} />
            <span className="btn-label">Upload</span>
          </button>

          <button
            type="button"
            className="action-icon-btn"
            onClick={handleFormat}
            disabled={!svgCode}
            title="Format / Beautify SVG code"
          >
            <Wand2 size={15} />
            <span className="btn-label">Format</span>
          </button>

          <button
            type="button"
            className={`action-icon-btn ${copied ? 'success' : ''}`}
            onClick={handleCopy}
            disabled={!svgCode}
            title="Copy SVG code to clipboard"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span className="btn-label">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            className="action-icon-btn danger"
            onClick={handleClear}
            disabled={!svgCode}
            title="Clear editor"
            aria-label="Clear editor"
          >
            <Trash2 size={15} />
            <span className="btn-label">Clear</span>
          </button>
        </div>
      </div>

      {/* Preset Samples Selector */}
      <div className="samples-bar">
        <div className="samples-label">
          <Sparkles size={14} />
          <span>Samples:</span>
        </div>
        <div className="samples-buttons">
          {SAMPLE_SVGS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="sample-pill"
              onClick={() => onSelectSample(sample.code)}
              title={sample.description}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea Area */}
      <div className="textarea-container">
        <textarea
          className="code-textarea"
          value={svgCode}
          onChange={(e) => setSvgCode(e.target.value)}
          placeholder={`<!-- Paste your <svg> ... </svg> code here or drop an .svg file -->`}
          spellCheck="false"
          autoCapitalize="off"
          autoComplete="off"
        />
      </div>

      {/* Editor Stats Footer */}
      <div className="editor-stats">
        <div className="stat-pill">{linesCount} lines</div>
        <div className="stat-pill">{charCount} characters</div>
        <div className="stat-pill">{sizeKb} KB</div>
      </div>
    </div>
  );
}
