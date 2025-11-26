import { useCallback } from 'react';

const DEFAULT_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

const useFileSizeFormatter = ({ units = DEFAULT_UNITS } = {}) => {
  const formatFileSize = useCallback((bytes) => {
    if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes <= 0) {
      return '';
    }

    const normalizedUnits = Array.isArray(units) && units.length > 0 ? units : DEFAULT_UNITS;
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < normalizedUnits.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }

    const precision = size < 10 && unitIndex > 0 ? 1 : 0;
    return `${size.toFixed(precision)} ${normalizedUnits[unitIndex]}`;
  }, [units]);

  return { formatFileSize };
};

export default useFileSizeFormatter;
