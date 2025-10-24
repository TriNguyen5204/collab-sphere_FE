import apiClient from './apiClient';

export const createTeam = async (payload = {}) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('A payload object is required to create a team.');
  }

  const response = await apiClient.post('/team', payload);
  return response.data;
};
