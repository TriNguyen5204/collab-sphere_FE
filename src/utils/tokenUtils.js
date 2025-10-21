const atobSafe = (value) => {
  const globalAtob = typeof globalThis !== 'undefined' ? globalThis.atob : null;
  if (typeof globalAtob === 'function') {
    return globalAtob(value);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'base64').toString('binary');
  }

  throw new Error('No base64 decoder available in this environment');
};

const decodeBase64Url = (value) => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
    const decoded = atobSafe(padded);
    return decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
  } catch (error) {
    console.error('Failed to decode base64 token payload:', error);
    return null;
  }
};

export const decodeTokenPayload = (token) => {
  if (!token) {
    return null;
  }

  const segments = token.split('.');
  if (segments.length < 2) {
    return null;
  }

  const payloadSegment = segments[1];
  const decoded = decodeBase64Url(payloadSegment);

  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to parse token payload JSON:', error);
    return null;
  }
};

export const getTokenExpiration = (token) => {
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return null;
  }

  return payload.exp * 1000;
};

export const isTokenExpired = (token, skewMilliseconds = 60_000) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return false;
  }

  const threshold = expiration - skewMilliseconds;
  return Date.now() >= threshold;
};
