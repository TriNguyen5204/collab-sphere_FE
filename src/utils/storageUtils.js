import Cookies from 'js-cookie';

// ==================== Constants ====================

export const STORAGE_KEYS = {
  // Auth
  USER: 'user',

  // Context
  TEAM_DETAIL: 'teamDetail',

  // GitHub Integration
  GITHUB_INSTALLATION_CONTEXT: 'github_installation_context',
  GITHUB_INSTALLATION_PROJECT_ID: 'github_installation_project_id',

  // AI Project Generator (from features/lecturer/components/create-project-ai/constants.js)
  AI_FORM_DATA: '_aipf_d',
  AI_IDEAS: '_aipf_i',
  AI_CONFIG: '_aipf_c',
  AI_PHASE: '_aipf_p',
  AI_SELECTED_IDS: '_aipf_s',
  AI_CURRENT_JOB_ID: '_aipf_jid',
  AI_JOB_STATUS: '_aipf_js',
  AI_JOB_START_TIME: '_aipf_jt',

  // Whiteboard (Dynamic keys, handled by pattern matching)
  TLDRAW_PAGE_PREFIX: 'tldraw_current_page_',
};

export const SESSION_KEYS = {
  MEETING_TEAM_ID: 'meeting_team_id',
};

// ==================== Helper Functions ====================

/**
 * Clears all application-specific data from LocalStorage, SessionStorage, and Cookies.
 * Should be called during logout to ensure a clean state for the next user.
 */
export const clearAllAppStorage = () => {
  // 1. Clear Cookies
  Cookies.remove(STORAGE_KEYS.USER);

  // 2. Clear LocalStorage
  // Remove known static keys
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (key !== STORAGE_KEYS.TLDRAW_PAGE_PREFIX) { // Skip prefix
      localStorage.removeItem(key);
    }
  });

  // Remove dynamic keys (e.g., tldraw pages)
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(STORAGE_KEYS.TLDRAW_PAGE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });

  // 3. Clear SessionStorage
  Object.values(SESSION_KEYS).forEach((key) => {
    sessionStorage.removeItem(key);
  });

  console.log('[Storage] All application storage cleared.');
};

/**
 * Helper to get parsed JSON from localStorage
 * @param {string} key 
 * @returns {any|null}
 */
export const getLocalStorage = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Error parsing localStorage key "${key}":`, error);
    return null;
  }
};

/**
 * Helper to set JSON to localStorage
 * @param {string} key 
 * @param {any} value 
 */
export const setLocalStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
};
