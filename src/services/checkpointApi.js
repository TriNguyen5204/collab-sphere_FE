import apiClient from './apiClient';

const normalizeError = (error) => {
  const data = error?.response?.data;
  if (Array.isArray(data?.errorList) && data.errorList.length > 0) {
    return data.errorList.map(err => {
      if (typeof err === 'string') return err;
      return err.message || err.description || JSON.stringify(err);
    }).join('\n');
  }
  if (typeof data?.error === 'string') {
    return data.error;
  }
  if (typeof data?.message === 'string') {
    return data.message;
  }
  if (typeof data === 'string') {
    return data;
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
