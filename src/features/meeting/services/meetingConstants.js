// ==================== MEETING CONSTANTS ====================

export const DEFAULT_EVENT_COLOR = '#3b82f6'; // Blue color for all events

export const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  startTime: '09:00',
};

export const TIME_FORMATTER_CONFIG = {
  locale: 'en-US',
  timeZone: 'Asia/Ho_Chi_Minh',
  formatOptions: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
};