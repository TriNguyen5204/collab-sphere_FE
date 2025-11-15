import apiClient from './apiClient';

/**
 * Fetch all PR analyses for a specific team
 * @param {number} teamId - The team ID
 * @param {number} repositoryId - The repository ID (required)
 * @param {number} currentPage - Current page number (default: 1)
 * @param {number} pageSize - Items per page (default: 10)
 * @param {boolean} isDesc - Sort order descending (default: true)
 * @returns {Promise} Response with list of PR analyses
 */
export const getPRAnalysesByTeam = async (teamId, repositoryId, currentPage = 1, pageSize = 10, isDesc = true) => {
  const response = await apiClient.get(`/team/${teamId}/pr-analysis`, {
    params: {
      RepositoryId: repositoryId,
      CurrentPage: currentPage,
      PageSize: pageSize,
      IsDesc: isDesc
    }
  });
  console.log('Fetched PR Analyses by Team:', response.data);
  return response.data;
};

/**
 * Fetch a specific PR analysis by ID
 * @param {number} analysisId - The analysis ID
 * @returns {Promise} Response with PR analysis details including diff content
 */
export const getPRAnalysisById = async (analysisId) => {
  const response = await apiClient.get(`/pr-analysis/${analysisId}`);
  console.log('Fetched PR Analysis:', response.data);
  return response.data;
};