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

export const getMilestonesByTeam = async (teamId) => {
  if (teamId === undefined || teamId === null || teamId === '') {
    throw new Error('teamId is required to fetch milestones.');
  }

  try {
    const response = await apiClient.get(`/milestone/team/${teamId}`);
    console.log('Milestones by team response:', response.data);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 400 && data && (Array.isArray(data.teamMilestones) || Array.isArray(data.list) || Array.isArray(data.data))) {
      console.warn(`Received empty milestone payload with 400 status for team ID ${teamId}. Treating as empty result.`);
      return data;
    }

    console.error(`Error fetching milestones for team ID ${teamId}:`, error);
    throw new Error(normalizeError(error));
  }
};

export const deleteTeamMilestone = async (teamMilestoneId) => {
  if (!teamMilestoneId) {
    throw new Error('teamMilestoneId is required to delete a milestone.');
  }
  try {
    const response = await apiClient.delete(`/milestone/${teamMilestoneId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting team milestone ${teamMilestoneId}:`, error);
    throw new Error(normalizeError(error));
  }
};

export const getMilestoneDetail = async (milestoneId) => {
  if (milestoneId === undefined || milestoneId === null || milestoneId === '') {
    throw new Error('milestoneId is required to fetch milestone detail.');
  }

  try {
    const response = await apiClient.get(`/milestone/${milestoneId}`);
    console.log('Milestone detail response:', response.data);
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

export const postMilestoneFile = async (teamMilestoneId, fileData) => {
  if (!teamMilestoneId) {
    throw new Error('milestoneId is required to upload a milestone file.');
  }
  try {
    console.log("Uploading file to milestone ID:", teamMilestoneId, fileData);
    const response = await apiClient.post(`/milestone/${teamMilestoneId}/files`, fileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading file for milestone ID ${teamMilestoneId}:`, error);
    throw new Error(normalizeError(error));
  }
};

export const deleteMilestoneFile = async (teamMilestoneId, fileId) => {
  if (!teamMilestoneId || !fileId) {
    throw new Error('Both milestoneId and fileId are required to delete a milestone file.');
  }
  try {
    const response = await apiClient.delete(`/milestone/${teamMilestoneId}/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting file ID ${fileId} for milestone ID ${teamMilestoneId}:`, error);
    throw new Error(normalizeError(error));
  }
};

export const patchGenerateNewMilestoneFile = async (teamMilestoneId, fileId) => {
  try {
    const response = await apiClient.patch(`/milestone/${teamMilestoneId}/files/${fileId}/new-url`);
    console.log('Regenerated milestone file link data:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error regenerating file link for milestone ID ${teamMilestoneId} and file ID ${fileId}:`, error);
    throw error;
  }
};
