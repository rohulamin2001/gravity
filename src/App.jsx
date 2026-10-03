import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import DropZone from './components/DropZone';
import ImageCard from './components/ImageCard';
import BatchToolbar from './components/BatchToolbar';
import PreviewModal from './components/PreviewModal';
import { extractNameAndExt, toKebabCase, toSnakeCase, toCamelCase, appendDate } from './utils/filename';
import { downloadFile, convertImageFormat, downloadAllAsZip } from './utils/downloader';
import './App.css';

export default function App() {
  const [images, setImages] = useState([]);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pixelrename-theme') || 'dark';
  });
  const [previewItem, setPreviewItem] = useState(null);
  const [isZipping, setIsZipping] = useState(false);

  // Sync theme with DOM root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pixelrename-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Add uploaded files to list
  const handleFilesAdded = useCallback((newFiles) => {
    const formatted = newFiles.map((file) => {
      const { name, ext } = extractNameAndExt(file.name);
      return {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        originalBaseName: name,
        originalExt: ext,
        customName: name,
        format: 'original', // 'original' | 'webp' | 'png' | 'jpg'
        previewUrl: URL.createObjectURL(file)
      };
    });

    setImages((prev) => [...prev, ...formatted]);
  }, []);

  // Generate synthetic sample demo images on canvas for immediate instant testing
  const handleAddDemoImages = useCallback(() => {
    const samples = [
      { name: 'My Summer Vacation Photo #01.JPG', bg1: '#ec4899', bg2: '#8b5cf6', title: 'Summer Sunset' },
      { name: 'Screenshot_2026-10-03_at_14.22.45.png', bg1: '#3b82f6', bg2: '#06b6d4', title: 'UI Dashboard' },
      { name: 'IMG_4920_RAW_CAMERA_EXPORT.jpeg', bg1: '#10b981', bg2: '#6366f1', title: 'Mountain Trail' }
    ];

    const generatedFiles = samples.map((sample) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, sample.bg1);
      grad.addColorStop(1, sample.bg2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);

      // Card overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.roundRect(80, 80, 1040, 640, 24);
      ctx.fill();

      // Title text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sample.title, 600, 390);

      // Subtitle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '28px Outfit, sans-serif';
      ctx.fillText(sample.name, 600, 450);

      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const file = new File([blob], sample.name, { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg', 0.9);
      });
    });

    Promise.all(generatedFiles).then((files) => {
      handleFilesAdded(files);
    });
  }, [handleFilesAdded]);

  // Update a single image's custom filename
  const handleUpdateName = (id, newName) => {
    setImages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, customName: newName } : item))
    );
  };

  // Update target format (original, webp, png, jpg)
  const handleUpdateFormat = (id, newFormat) => {
    setImages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, format: newFormat } : item))
    );
  };

  // Delete a single image
  const handleDelete = (id) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Clear all images
  const handleClearAll = () => {
    if (images.length === 0) return;
    if (window.confirm('Are you sure you want to remove all uploaded images?')) {
      images.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      setImages([]);
    }
  };

  // Download a single renamed/converted image
  const handleDownloadSingle = async (item) => {
    const { blob, ext } = await convertImageFormat(item.file, item.format || 'original');
    const finalFilename = `${item.customName || item.originalBaseName}.${ext}`;
    downloadFile(blob, finalFilename);

    // Micro confetti effect
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#10b981', '#38bdf8']
    });
  };

  // Download all as ZIP
  const handleDownloadZip = async () => {
    if (images.length === 0) return;
    try {
      setIsZipping(true);
      await downloadAllAsZip(images, 'renamed-images-bundle.zip');

      // Celebration confetti explosion
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Failed to create zip:', err);
      alert('Could not create ZIP archive. Please try again.');
    } finally {
      setIsZipping(false);
    }
  };

  // Batch pattern rename: e.g. banner-[01] or photo-[n]
  const handleApplyBatchPattern = (pattern) => {
    setImages((prev) =>
      prev.map((item, index) => {
        const num = index + 1;
        let generatedName = pattern;

        if (pattern.includes('[001]')) {
          generatedName = pattern.replace(/\[001\]/g, String(num).padStart(3, '0'));
        } else if (pattern.includes('[01]')) {
          generatedName = pattern.replace(/\[01\]/g, String(num).padStart(2, '0'));
        } else if (pattern.includes('[1]')) {
          generatedName = pattern.replace(/\[1\]/g, String(num));
        } else if (pattern.includes('[n]')) {
          generatedName = pattern.replace(/\[n\]/g, String(num));
        } else {
          // Default suffix
          generatedName = `${pattern}-${String(num).padStart(2, '0')}`;
        }

        return {
          ...item,
          customName: generatedName
        };
      })
    );
  };

  // Batch preset: kebab, snake, camel, lower, date, reset
  const handleApplyGlobalPreset = (presetType) => {
    setImages((prev) =>
      prev.map((item) => {
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
        return {
          ...item,
          customName: newName
        };
      })
    );
  };

  // Batch format conversion
  const handleApplyGlobalFormat = (newFormat) => {
    setImages((prev) =>
      prev.map((item) => ({
        ...item,
        format: newFormat
      }))
    );
  };

  return (
    <div className="app-layout">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        imageCount={images.length}
      />

      <main className="main-content">
        <div className="content-container">
          {/* File Upload Area */}
          <DropZone
            onFilesAdded={handleFilesAdded}
            onAddDemoImages={images.length === 0 ? handleAddDemoImages : null}
          />

          {/* Batch operations toolbar */}
          {images.length > 0 && (
            <BatchToolbar
              images={images}
              onApplyBatchPattern={handleApplyBatchPattern}
              onApplyGlobalPreset={handleApplyGlobalPreset}
              onApplyGlobalFormat={handleApplyGlobalFormat}
              onDownloadZip={handleDownloadZip}
              onClearAll={handleClearAll}
              isZipping={isZipping}
            />
          )}

          {/* Image List */}
          {images.length > 0 ? (
            <div className="images-grid">
              {images.map((item) => (
                <ImageCard
                  key={item.id}
                  item={item}
                  onUpdateName={handleUpdateName}
                  onUpdateFormat={handleUpdateFormat}
                  onDelete={handleDelete}
                  onDownloadSingle={handleDownloadSingle}
                  onOpenPreview={(img) => setPreviewItem(img)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon-circle">✨</div>
              <h2>Ready to rename & optimize your images</h2>
              <p>
                Drag and drop your images above or load demo samples to test kebab-casing,
                date appending, and WebP conversion.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox / Preview Modal */}
      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {/* App Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <p>© 2026 PixelRename Studio • Fast, private, client-side image rename & conversion utility.</p>
        </div>
      </footer>
    </div>
  );
}
