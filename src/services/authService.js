import apiClient from './apiClient';

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
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
export const sendOtp = async (email) => {
  try {
    const response = await apiClient.post('/user/signup/send-otp', {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Send OTP API failed:", error);
    throw new Error(error.response?.data?.message || "Send OTP failed");
  }
};
export const register = async (data) => {
  try {
    const response = await apiClient.post('/user/student/confirm-signup', data);
    return response.data;
  } catch (error) {
    console.error("Register API failed:", error);
    throw new Error(error.response?.data?.message || "Registration failed");
  }
}
