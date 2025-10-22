import apiClient from './apiClient';

export const getLecturerClasses = async (lecturerId, params = {}) => {
  if (lecturerId === undefined || lecturerId === null || lecturerId === '') {
    throw new Error('lecturerId is required to fetch lecturer classes.');
  }

  const response = await apiClient.get(`/class/lecturer/${lecturerId}`, { params });
  console.log(response.data);
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
