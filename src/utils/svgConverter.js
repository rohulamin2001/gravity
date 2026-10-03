// SVG parsing, rendering, and multi-format conversion utilities

export function parseSvgDimensions(svgString) {
  const fallback = { width: 512, height: 512 };
  if (!svgString || typeof svgString !== 'string') return fallback;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');

    if (!svgEl) return fallback;

    let width = null;
    let height = null;

    // Check viewBox first
    const viewBox = svgEl.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        width = parts[2];
        height = parts[3];
      }
    }

    // Check width / height attributes if not derived from viewBox
    if (!width) {
      const wAttr = svgEl.getAttribute('width');
      if (wAttr) {
        const parsedW = parseFloat(wAttr);
        if (!isNaN(parsedW) && parsedW > 0) width = parsedW;
      }
    }

    if (!height) {
      const hAttr = svgEl.getAttribute('height');
      if (hAttr) {
        const parsedH = parseFloat(hAttr);
        if (!isNaN(parsedH) && parsedH > 0) height = parsedH;
      }
    }

    return {
      width: Math.round(width || fallback.width),
      height: Math.round(height || fallback.height)
    };
  } catch (e) {
    console.warn('Could not parse SVG dimensions:', e);
    return fallback;
  }
}

// Ensure SVG code has xml namespaces for valid standalone rendering
export function normalizeSvgString(svgString) {
  if (!svgString) return '';
  let normalized = svgString.trim();

  // If missing xmlns, inject it
  if (!normalized.includes('xmlns="http://www.w3.org/2000/svg"') && !normalized.includes("xmlns='http://www.w3.org/2000/svg'")) {
    normalized = normalized.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return normalized;
}

// Trigger client-side file download via Blob
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Download raw SVG as .svg file
export function exportSvgAsFile(svgString, filename = 'graphic.svg') {
  const normalized = normalizeSvgString(svgString);
  const blob = new Blob([normalized], { type: 'image/svg+xml;charset=utf-8' });
  const finalFilename = filename.toLowerCase().endsWith('.svg') ? filename : `${filename}.svg`;
  downloadBlob(blob, finalFilename);
}

// Convert SVG to PNG, JPG, or WebP via HTML5 Canvas
export function convertSvgToRaster(svgString, options = {}) {
  const {
    format = 'png',      // 'png' | 'jpg' | 'jpeg' | 'webp'
    scale = 1,          // 1, 2, 4
    quality = 0.95,     // 0.1 - 1.0
    filename = 'graphic',
    backgroundColor = null
  } = options;

  return new Promise((resolve, reject) => {
    try {
      const normalized = normalizeSvgString(svgString);
      const dims = parseSvgDimensions(normalized);
      const targetWidth = Math.round(dims.width * scale);
      const targetHeight = Math.round(dims.height * scale);

      // Create blob & object URL for image loading
      const svgBlob = new Blob([normalized], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(blobUrl);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        const isJpg = format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg';
        const mimeType = isJpg
          ? 'image/jpeg'
          : format.toLowerCase() === 'webp'
          ? 'image/webp'
          : 'image/png';

        const ext = isJpg ? 'jpg' : format.toLowerCase();

        // If JPG or background specified, fill canvas background
        if (isJpg) {
          ctx.fillStyle = backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else if (backgroundColor && backgroundColor !== 'transparent') {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        // Draw SVG image onto scaled canvas
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas rasterization failed'));
            }

            const cleanFilename = filename.replace(/\.(svg|png|jpg|jpeg|webp)$/i, '');
            const finalFilename = `${cleanFilename}.${ext}`;
            downloadBlob(blob, finalFilename);
            resolve({ blob, filename: finalFilename, width: targetWidth, height: targetHeight });
          },
          mimeType,
          quality
        );
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Failed to render SVG onto Image element. Check SVG syntax.'));
      };

      img.src = blobUrl;
    } catch (err) {
      reject(err);
    }
  });
}
