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

export const createCheckpoint = async (payload) => {
  if (!payload?.teamMilestoneId) {
    throw new Error('teamMilestoneId is required to create a checkpoint.');
  }

  try {
    const response = await apiClient.post('/checkpoint', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating checkpoint:', error);
    throw new Error(normalizeError(error));
  }
};

export const updateCheckpoint = async (checkpointId, payload) => {
  if (checkpointId === undefined || checkpointId === null || checkpointId === '') {
    throw new Error('checkpointId is required to update a checkpoint.');
  }

  try {
    const response = await apiClient.put(`/checkpoint/${checkpointId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating checkpoint ${checkpointId}:`, error);
    throw new Error(normalizeError(error));
  }
};
