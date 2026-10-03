import JSZip from 'jszip';

// Trigger native client-side download using object URL
export function downloadFile(blobOrFile, filename) {
  const url = URL.createObjectURL(blobOrFile);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Convert image format and quality in-browser using HTML5 Canvas
export function convertImageFormat(file, targetFormat = 'original', quality = 0.92) {
  return new Promise((resolve, reject) => {
    if (targetFormat === 'original') {
      return resolve({ blob: file, ext: file.name.split('.').pop().toLowerCase() });
    }

    const mimeMap = {
      webp: 'image/webp',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg'
    };

    const targetMime = mimeMap[targetFormat.toLowerCase()] || file.type;
    const targetExt = targetFormat === 'jpeg' ? 'jpg' : targetFormat.toLowerCase();

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext('2d');

      // If converting to JPEG, fill with white background to handle transparency
      if (targetMime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, ext: targetExt });
          } else {
            resolve({ blob: file, ext: file.name.split('.').pop().toLowerCase() });
          }
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for conversion'));
    };

    img.src = objectUrl;
  });
}

// Package multiple renamed images into a single .zip file
export async function downloadAllAsZip(imagesList, zipFilename = 'renamed-images.zip') {
  const zip = new JSZip();

  for (const item of imagesList) {
    const { blob, ext } = await convertImageFormat(item.file, item.format || 'original');
    const finalFilename = `${item.customName || item.originalBaseName}.${ext}`;
    zip.file(finalFilename, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadFile(zipBlob, zipFilename);
}
