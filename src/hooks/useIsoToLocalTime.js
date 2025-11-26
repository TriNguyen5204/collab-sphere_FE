import { useCallback, useMemo } from 'react';

const DEFAULT_LOCALE = 'vi-VN';
const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const DEFAULT_OPTIONS = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
};

const useIsoToLocalTime = ({ locale = DEFAULT_LOCALE, timeZone = DEFAULT_TIME_ZONE, formatOptions = {} } = {}) => {
  const mergedOptions = useMemo(() => ({
    ...DEFAULT_OPTIONS,
    ...formatOptions,
    timeZone,
  }), [formatOptions, timeZone]);

  const formatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, mergedOptions);
    } catch (error) {
      console.error('Failed to create date formatter:', error);
      return null;
    }
  }, [locale, mergedOptions]);

  const formatIsoString = useCallback((value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    if (formatter) {
      return formatter.format(date);
    }

    return date.toLocaleString(locale, mergedOptions);
  }, [formatter, locale, mergedOptions]);

  return { formatIsoString };
};

export default useIsoToLocalTime;
