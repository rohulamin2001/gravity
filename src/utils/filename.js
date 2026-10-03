// Utilities for filename manipulation and string transformations

export function extractNameAndExt(fullFilename) {
  if (!fullFilename) return { name: '', ext: '' };
  const lastDotIndex = fullFilename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return { name: fullFilename, ext: '' };
  }
  return {
    name: fullFilename.substring(0, lastDotIndex),
    ext: fullFilename.substring(lastDotIndex + 1).toLowerCase()
  };
}

// Convert string to SEO-friendly kebab-case
export function toKebabCase(str) {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

// Convert string to snake_case
export function toSnakeCase(str) {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

// Convert string to camelCase
export function toCamelCase(str) {
  if (!str) return '';
  const words = str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .split(/\s+/);
  if (words.length === 0) return '';
  return words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

// Append current date (YYYY-MM-DD)
export function appendDate(str) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  if (!str) return dateStr;
  return `${str}-${dateStr}`;
}

// Format byte size to human readable (KB, MB)
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
