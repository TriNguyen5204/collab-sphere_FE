import apiClient from "../../../services/apiClient";
import { cleanParams } from '../../../utils/cleanParam';

export const createMeeting = async meetingData => {
  try {
    const response = await apiClient.post('/meeting', meetingData, {
      teamId: meetingData.teamId,
      title: meetingData.title,
      description: meetingData.description,
      meetingUrl: meetingData.meetingUrl,
      scheduledTime: meetingData.scheduledTime,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};
export const getMeeting = async filter => {
  const cleanedParams = cleanParams(filter);
  try {
    const response = await apiClient.get('/meeting', {
      params: cleanedParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};
export const updateMeeting = async updateData => {
  const cleanedData = cleanParams(updateData);
  const response = await apiClient.patch(`/meeting/${updateData.meetingId}`, null, {
    params: cleanedData
  });
  return response.data;
};

export const getMeetingById = async meetingId => {
  try {
    const response = await apiClient.get(`/meeting/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meeting by ID:', error);
    throw error;
  }
};
export const deleteMeeting = async meetingId => {
  try {
    const response = await apiClient.delete(`/meeting/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
};
export const getRecordUrl = async (videoFile, onUploadProgress) => {
  const formData = new FormData();
  formData.append('VideoFile', videoFile);
  const response = await apiClient.post('/video/uploadation', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    }
  });
  return response.data;
};
