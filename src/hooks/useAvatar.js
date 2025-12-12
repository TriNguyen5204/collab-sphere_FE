import { useState, useMemo, useEffect } from 'react';

/**
 * Validates if an image URL is complete and valid.
 * Checks for incomplete Cloudinary URLs that end with just '/upload' without the actual image path.
 * @param {string} url - The image URL to validate
 * @returns {boolean} - True if URL is valid and complete
 */
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a Cloudinary URL
  if (url.includes('cloudinary.com')) {
    // Valid Cloudinary URL should have content after '/upload/'
    // Invalid: https://res.cloudinary.com/dn5xgbmqq/image/upload
    // Valid: https://res.cloudinary.com/dn5xgbmqq/image/upload/v1/avatars/obpgbuicvfkqt27hm1dp
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return false;
    
    const afterUpload = url.substring(uploadIndex + 8); // '/upload/' is 8 characters
    return afterUpload.length > 0 && afterUpload !== '/';
  }
  
  // For non-Cloudinary URLs, do basic validation
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Custom hook to generate avatar initials, consistent colors, and handle image loading errors.
 * * @param {string} name 
 * @param {string} src 
 */
export function useAvatar(name, src) {
  const [imageError, setImageError] = useState(false);
  const isValidUrl = useMemo(() => isValidImageUrl(src), [src]);
  
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const initials = useMemo(() => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const colorClass = useMemo(() => {
    if (!name) return 'bg-slate-100 text-slate-600';
    
    const colors = [
      'bg-red-100 text-red-700 border-red-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-green-100 text-green-700 border-green-200',
      'bg-orangeFpt-100 text-orangeFpt-700 border-orangeFpt-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-teal-100 text-teal-700 border-teal-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }, [name]);

  return {
    initials,
    colorClass,
    imageError,
    setImageError,
    shouldShowImage: isValidUrl && !imageError
  };
}