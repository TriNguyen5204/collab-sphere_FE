import { useState, useMemo, useEffect } from 'react';

/**
 * Custom hook to generate avatar initials, consistent colors, and handle image loading errors.
 * * @param {string} name 
 * @param {string} src 
 */
export function useAvatar(name, src) {
  const [imageError, setImageError] = useState(false);
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
    shouldShowImage: src && !imageError
  };
}