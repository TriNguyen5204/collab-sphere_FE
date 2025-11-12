export function generateAvatarFromName(name = '', options = {}) {
  const {
    size = 128, // px
    background, 
    color = '#ffffff',
    bold = true,
  } = options;

  const safeName = (name || '').trim();
  const initials = getInitials(safeName) || '?';

  const palette = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#EF4444', // red-500
    '#EC4899', // pink-500
    '#14B8A6', // teal-500
    '#F97316', // orange-500
  ];

  const bg = background || palette[stringToNumber(safeName) % palette.length];
  const fontSize = Math.round(size * 0.42);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <clipPath id="rounded">
      <rect width="${size}" height="${size}" rx="${Math.round(size / 2)}" ry="${Math.round(size / 2)}" />
    </clipPath>
  </defs>
  <rect width="100%" height="100%" fill="${bg}" clip-path="url(#rounded)"/>
  <text x="50%" y="50%" dy=".35em" text-anchor="middle"
        fill="${color}" font-family="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, 'Apple Color Emoji', 'Segoe UI Emoji'"
        font-size="${fontSize}" font-weight="${bold ? 700 : 500}">${escapeXml(initials)}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getInitials(name) {
  if (!name) return '';
  const parts = name
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '';
  if (parts.length === 1) {
    const word = parts[0];
    return (word[0] || '').toUpperCase() + (word[1] ? word[1].toUpperCase() : '');
  }

  const first = parts[0][0] || '';
  const last = parts[parts.length - 1][0] || '';
  return (first + last).toUpperCase();
}

function stringToNumber(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // Convert to 32bit integer
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
