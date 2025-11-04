// src/services/githubService.js

const GITHUB_API_BASE = 'https://api.github.com';

const createHeaders = (token) => ({
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
});

/**
 * Lấy danh sách các repository mà người dùng có quyền truy cập.
 * @param {string} token - OAuth token của người dùng.
 * @returns {Promise<Array>}
 */
export const getUserRepos = async (token) => {
    const url = `${GITHUB_API_BASE}/user/repos?type=all`;
    const response = await fetch(url, { headers: createHeaders(token) });
    if (!response.ok) throw new Error('Failed to fetch user repositories.');
    return response.json();
};

/**
 * Lấy danh sách PR của một repository cụ thể.
 * @param {string} token - OAuth token của người dùng.
 * @param {string} repoFullName - Tên đầy đủ của repo (ví dụ: "owner/repo-name").
 * @returns {Promise<Array>}
 */
export const getPullRequests = async (token, repoFullName) => {
    const url = `${GITHUB_API_BASE}/repos/${repoFullName}/pulls?state=open`;
    const response = await fetch(url, { headers: createHeaders(token) });
    if (!response.ok) throw new Error('Failed to fetch pull requests.');
    return response.json();
};

/**
 * Lấy nội dung diff của một PR.
 * @param {string} token - OAuth token của người dùng.
 * @param {string} diffUrl - URL để lấy diff từ object PR.
 * @returns {Promise<string>}
 */
export const getPullRequestDiff = async (token, diffUrl) => {
    const response = await fetch(diffUrl, {
        headers: {
            ...createHeaders(token),
            'Accept': 'application/vnd.github.v3.diff',
        }
    });
    if (!response.ok) throw new Error('Failed to fetch diff content.');
    return response.text();
};
