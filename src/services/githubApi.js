import apiClient from './apiClient';

export const getProjectInstallation = async (projectId) => {
  try {
    const response = await apiClient.get(`/project/${projectId}/installation`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project installation:', error);
    throw error;
  }
};

export const getInstallationStatus = async (projectId) => {
  try {
    const response = await apiClient.get('/github-installation', { params: { projectId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub installation status:', error);
    throw error;
  }
};

export const getConnectedRepositories = async (installationId) => {
  try {
    const response = await apiClient.get('/github-installation/repositories', { params: { installationId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching connected repositories:', error);
    throw error;
  }
};

export const initConnection = async (projectId, teamId) => {
  try {
    const response = await apiClient.post('/github-installation/connection', { projectId, teamId });
    return response.data;
  } catch (error) {
    console.error('Error initializing GitHub connection:', error);
    throw error;
  }
};

export const handleCallback = async (installationId, state) => {
  try {
    const response = await apiClient.get('/github-installation/connection-callback', {
      params: {
        installation_id: installationId,
        state: state
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error handling GitHub callback:', error);
    throw error;
  }
};
