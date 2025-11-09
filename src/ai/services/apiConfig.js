const apiBaseUrl = import.meta.env.VITE_AI_API_BASE_URL;

if (!apiBaseUrl) {
	console.warn('[AI Service] Missing VITE_AI_API_BASE_URL environment variable. PR analysis requests will fail.');
}

export const API_BASE_URL = apiBaseUrl;
export const ANALYZE_PR_PATH = '/analyze-pr';