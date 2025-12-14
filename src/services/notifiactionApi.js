import apiClient from "./apiClient";

export const getNotifications = async () => {
  try {
    const response = await apiClient.get('/notification');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const patchNotificationIsRead = async notificationId => {
  try {
    const response = await apiClient.patch(`/notification/${notificationId}/is-read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};