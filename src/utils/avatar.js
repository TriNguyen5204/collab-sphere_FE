export function generateAvatarFromName(name = '', options = {}) {
  const {
    size = 128, // px
    background, 
    color = '#ffffff',
    bold = true,
  } = options;

  const safeName = (name || '').trim();
  const initials = getInitials(safeName) || '?';

  // Added your FPT Orange (#F26F21) to the palette
  const palette = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#EF4444', // red
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F26F21', // orangeFpt
  ];

  const bg = background || palette[stringToNumber(safeName) % palette.length];
  const fontSize = Math.round(size * 0.42);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bg}" rx="${Math.round(size / 2)}" ry="${Math.round(size / 2)}" />
  <text x="50%" y="50%" dy=".35em" text-anchor="middle"
        fill="${color}" 
        font-family="system-ui, sans-serif"
        font-size="${fontSize}" 
        font-weight="${bold ? 700 : 500}">${escapeXml(initials)}</text>
</svg>`.trim();

  // --- CRITICAL FIX ---
  // We use Base64 (btoa) instead of utf-8. 
  // We use unescape(encodeURIComponent) to handle Vietnamese characters correctly.
  const base64 = window.btoa(unescape(encodeURIComponent(svg)));
  
  return `data:image/svg+xml;base64,${base64}`;
}

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '';
  if (parts.length === 1) {
    const word = parts[0];
    return word.slice(0, 2).toUpperCase();
  }

  const first = parts[0][0] || '';
  const last = parts[parts.length - 1][0] || '';
  return (first + last).toUpperCase();
}

function stringToNumber(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash);
}

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}