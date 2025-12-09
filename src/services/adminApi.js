import apiClient from "./apiClient";

export const getEmail = async (params = {}) => {
    try {
        const response = await apiClient.get('/admin/emails', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching emails:', error);
        throw error;
    }
};

export const getEmailDetails = async (emailId) => {
    try {
        const response = await apiClient.get(`/admin/emails/${emailId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching email details for ID ${emailId}:`, error);
        throw error;
    }
};

export const deleteEmail = async (emailId) => {
    try {
        const response = await apiClient.delete(`/admin/emails/${emailId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting email with ID ${emailId}:`, error);
        throw error;
    }
};