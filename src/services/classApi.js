import apiClient from './apiClient';

export const getLecturerClasses = async (lecturerId, params = {}) => {
  if (lecturerId === undefined || lecturerId === null || lecturerId === '') {
    throw new Error('lecturerId is required to fetch lecturer classes.');
  }

  const response = await apiClient.get(`/class/lecturer/${lecturerId}`, { params });
  return response.data;
};

export const getClassTeams = async (classId, params = {}) => {
  if (classId === undefined || classId === null || classId === '') {
    throw new Error('classId is required to fetch class teams.');
  }

  const response = await apiClient.get(`/team/class/${classId}`, { params });
  return response.data;
};

export const getClassById = async (classId) => {
  if (!classId) {
    throw new Error('classId is required to fetch class details.');
  }
  const response = await apiClient.get(`/class/${classId}`);
  return response.data;
};

export const assignProjectsToClass = async (classId, projectIds = []) => {
  if (!classId && classId !== 0) {
    throw new Error('classId is required to assign projects to a class.');
  }

  if (!Array.isArray(projectIds)) {
    throw new Error('projectIds must be provided as an array.');
  }

  const payload = projectIds.map((id) => Number(id)).filter((id) => Number.isFinite(id));

  try {
    const response = await apiClient.patch(`/class/${classId}/projects-assignment`, payload);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      const fallbackResponse = await apiClient.patch(`/class/${classId}/projects`, payload);
      return fallbackResponse.data;
    }

    throw error;
  }
};

export const postClassFile = async (classId, formData) => {
  try {
    const response = await apiClient.post(`/class/${classId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading file for class ID ${classId}:`, error);
    throw error;
  }
};

export const deleteClassFile = async (classId, fileId) => {
  try {
    const response = await apiClient.delete(`/class/${classId}/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting file for class ID ${classId} and file ID ${fileId}:`, error);
    throw error;
  }
};

export const patchRefreshClassFileUrl = async (classId, fileId) => {
  try {
    const response = await apiClient.patch(`/class/${classId}/files/${fileId}/new-url`);
    return response.data;
  } catch (error) {
    console.error(`Error refreshing file URL for class ID ${classId} and file ID ${fileId}:`, error);
    throw error;
  }
};
