import apiClient from './apiClient';

export const getLecturerClasses = async (lecturerId, params = {}) => {
  if (lecturerId === undefined || lecturerId === null || lecturerId === '') {
    throw new Error('lecturerId is required to fetch lecturer classes.');
  }

  const response = await apiClient.get(`/class/lecturer/${lecturerId}`, { params });
  console.log(response.data);
  return response.data;
};
