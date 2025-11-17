import apiClient from './apiClient';

export const createTeam = async (payload = {}) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('A payload object is required to create a team.');
  }

  const response = await apiClient.post('/team', payload);
  return response.data;
};

export const getTeamDetail = async (teamId) => {
  if (teamId === undefined || teamId === null || teamId === '') {
    throw new Error('teamId is required to fetch team detail.');
  }

  const response = await apiClient.get(`/team/${teamId}`);
  const payload = response.data;
  if (payload && typeof payload === 'object' && payload.teamDetail) {
    return payload.teamDetail;
  }
  return payload;
};
