import apiClient from './apiClient';

export const createTeam = async (payload = {}) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('A payload object is required to create a team.');
  }
  try {
    console.log('Creating team with payload:', payload);
    const response = await apiClient.post('/team', payload);
    console.log('Team created successfully:', response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      'An error occurred while creating the team.'
    );
  }
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
