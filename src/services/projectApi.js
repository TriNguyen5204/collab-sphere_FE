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
	const lecturerId = projectPayload.lecturerId || projectPayload.project?.lecturerId;
	if (!lecturerId) {
		throw new Error('lecturerId is required to create a project.');
	}

	const response = await apiClient.post('/project', projectPayload);
	return response.data;
};

export const createFullProject = async (payload) => {
	const response = await apiClient.post('/projects/create-full', payload);
	return response.data;
};

export const updateProjectBeforeApproval = async (projectPayload = {}) => {
	const projectId = projectPayload.projectId ?? projectPayload.id;
	if (projectId === undefined || projectId === null) {
		throw new Error('projectId is required to update a project.');
	}

	const response = await apiClient.put('/project', { project: projectPayload });
	return response.data;
};

export const deleteProjectBeforeApproval = async (projectId) => {
	if (projectId === undefined || projectId === null) {
		throw new Error('projectId is required to delete a project.');
	}

	const response = await apiClient.delete(`/project/${projectId}`);
	return response.data;
};

export const getProjectDetail = async (projectId) => {
	if (!projectId && projectId !== 0) {
		throw new Error('projectId is required to fetch project detail.');
	}

	const response = await apiClient.get(`/project/${projectId}`);
	return response.data;
};

export const getClassProjects = async (classId, params = {}) => {
	if (!classId && classId !== 0) {
		throw new Error('classId is required to fetch class projects.');
	}

	const response = await apiClient.get(`/project/class/${classId}`, { params });
	return response.data;
};

export const getProjects = async (params = {}) => {
    try {
        const response = await apiClient.get('/project', { 
            params,
            paramsSerializer: {
                indexes: null
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching projects:', error);
    };
};
