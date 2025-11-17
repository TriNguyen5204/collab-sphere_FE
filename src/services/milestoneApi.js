import apiClient from './apiClient';

const normalizeError = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (typeof error?.response?.data?.error === 'string') {
    return error.response.data.error;
  }
  if (typeof error?.message === 'string') {
    return error.message;
  }
  return 'Unknown error';
};

export const getMilestonesByTeam = async (teamId) => {
  if (teamId === undefined || teamId === null || teamId === '') {
    throw new Error('teamId is required to fetch milestones.');
  }

  try {
    const response = await apiClient.get(`/milestone/team/${teamId}`);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const data = error?.response?.data;

    // Some environments currently reply with HTTP 400 when a team has no milestones yet.
    // Treat that case as a successful call returning an empty collection so the UI can render gracefully.
    if (status === 400 && data && (Array.isArray(data.teamMilestones) || Array.isArray(data.list) || Array.isArray(data.data))) {
      console.warn(`Received empty milestone payload with 400 status for team ID ${teamId}. Treating as empty result.`);
      return data;
    }

    console.error(`Error fetching milestones for team ID ${teamId}:`, error);
    throw new Error(normalizeError(error));
  }
};

export const getMilestoneDetail = async (milestoneId) => {
  if (milestoneId === undefined || milestoneId === null || milestoneId === '') {
    throw new Error('milestoneId is required to fetch milestone detail.');
  }

  try {
    const response = await apiClient.get(`/milestone/${milestoneId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching milestone detail for ID ${milestoneId}:`, error);
    throw new Error(normalizeError(error));
  }
};

export const createMilestone = async (payload) => {
  if (!payload?.teamId) {
    throw new Error('teamId is required to create a milestone.');
  }

  try {
    const response = await apiClient.post('/milestone', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating milestone:', error);
    throw new Error(normalizeError(error));
  }
};

export const updateMilestone = async (milestoneId, payload) => {
  if (milestoneId === undefined || milestoneId === null || milestoneId === '') {
    throw new Error('milestoneId is required to update a milestone.');
  }

  try {
    const response = await apiClient.patch(`/milestone/${milestoneId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating milestone ${milestoneId}:`, error);
    throw new Error(normalizeError(error));
  }
};

export const deleteMilestone = async (milestoneId) => {
  if (milestoneId === undefined || milestoneId === null || milestoneId === '') {
    throw new Error('milestoneId is required to delete a milestone.');
  }

  try {
    const response = await apiClient.delete(`/milestone/${milestoneId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting milestone ${milestoneId}:`, error);
    throw new Error(normalizeError(error));
  }
};
