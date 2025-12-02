import { API_BASE_URL, ANALYZE_PR_PATH } from './apiConfig';
import { getCurrentSessionToken } from '../../../services/authService';

const buildUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('AI API base URL is not configured. Set VITE_AI_API_BASE_URL in your environment.');
  }

  const base = API_BASE_URL.replace(/\/$/, '');
  const path = ANALYZE_PR_PATH.startsWith('/') ? ANALYZE_PR_PATH : `/${ANALYZE_PR_PATH}`;
  return `${base}${path}`;
};

const getAuthorizationHeader = async () => {
  const token = await getCurrentSessionToken();
  if (!token) {
    throw new Error('User is not authenticated. Please sign in and try again.');
  }

  return { Authorization: `Bearer ${token}` };
};

export const analyzePullRequest = async (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid payload supplied to analyzePullRequest. Expected a non-empty object.');
  }

  const url = buildUrl();
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthorizationHeader()),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'AI analysis request failed.';

    try {
      const errorBody = await response.json();
      message = errorBody?.message || message;
    } catch (jsonError) {
      const text = await response.text();
      message = text || message;
    }

    throw new Error(message);
  }

  try {
    return await response.json();
  } catch (error) {
    return { raw: await response.text() };
  }
};
