import apiClient from './apiClient';

export const login = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login API failed:", error);
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const refreshToken = async (refreshToken, userId) => {
    try{
        const response = await apiClient.post('/auth/refresh-token', {
            refreshToken,
            userId,
        });
        return response.data;
    } catch (error) {
        console.error("Refresh Token API failed:", error);
        throw new Error(error.response?.data?.message || "Token refresh failed");
    }
}
