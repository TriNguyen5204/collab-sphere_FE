import apiClient from './apiClient';

export const getLecturerProjects = async (lecturerId, params = {}) => {
	if (lecturerId === undefined || lecturerId === null || lecturerId === '') {
		throw new Error('lecturerId is required to fetch lecturer projects.');
	}

	const response = await apiClient.get(`/project/lecturer/${lecturerId}`, { params });
	return response.data;
};
