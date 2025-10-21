import apiClient from './apiClient';

export const getLecturerProjects = async (lecturerId, params = {}) => {
	if (lecturerId === undefined || lecturerId === null || lecturerId === '') {
		throw new Error('lecturerId is required to fetch lecturer projects.');
	}

	const response = await apiClient.get(`/project/lecturer/${lecturerId}`, { params });
	console.log(response.data)
	return response.data;
};

export const createProject = async (projectPayload = {}) => {
	if (!projectPayload.lecturerId) {
		throw new Error('lecturerId is required to create a project.');
	}

	const response = await apiClient.post('/project', { project: projectPayload });
	return response.data;
};

export const getProjectDetail = async (projectId) => {
	if (!projectId && projectId !== 0) {
		throw new Error('projectId is required to fetch project detail.');
	}

	const response = await apiClient.get(`/project/${projectId}`);
	console.log(response.data)
	return response.data;
};

export const getClassProjects = async (classId, params = {}) => {
	if (!classId && classId !== 0) {
		throw new Error('classId is required to fetch class projects.');
	}

	const response = await apiClient.get(`/project/class/${classId}`, { params });
	console.log(response.data)
	return response.data;
};
