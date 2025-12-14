import apiClient from "./apiClient";

export const patchNotificationIsRead = async notificationId => {
  try {
    const response = await apiClient.patch(`/notification/${notificationId}/is-read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};