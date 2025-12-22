/**
 * Helper functions to manage teamId in sessionStorage securely
 * This prevents exposing teamId in URL parameters
 */

const MEETING_TEAM_ID_KEY = 'meeting_team_id';

/**
 * Store teamId securely in sessionStorage
 * @param {number|string} teamId - The team ID to store
 */
export const setMeetingTeamId = (teamId) => {
  if (!teamId) {
    console.warn('[MeetingSession] Attempted to set invalid teamId:', teamId);
    return;
  }
  sessionStorage.setItem(MEETING_TEAM_ID_KEY, String(teamId));
};

/**
 * Retrieve teamId from sessionStorage
 * @returns {string|null} The stored team ID or null if not found
 */
export const getMeetingTeamId = () => {
  return sessionStorage.getItem(MEETING_TEAM_ID_KEY);
};

/**
 * Clear teamId from sessionStorage
 */
export const clearMeetingTeamId = () => {
  sessionStorage.removeItem(MEETING_TEAM_ID_KEY);
};

/**
 * Check if teamId exists in sessionStorage
 * @returns {boolean} True if teamId exists
 */
export const hasMeetingTeamId = () => {
  return sessionStorage.getItem(MEETING_TEAM_ID_KEY) !== null;
};
