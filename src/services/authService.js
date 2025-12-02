import apiClient from './apiClient';
import Cookies from 'js-cookie';
import { store } from '../store';
import { setUserRedux, logout } from '../store/slices/userSlice';
import { isTokenExpired } from '../utils/tokenUtils';

// ==================== Helper Functions ====================

const getPersistedUser = () => {
  const storedUser = Cookies.get('user');
  if (!storedUser) return null;

  try {
    const parsed = JSON.parse(storedUser);
    return {
      ...parsed,
      userId: parsed?.userId != null ? Number(parsed.userId) : parsed?.userId,
    };
  } catch (error) {
    console.warn('[Auth] Failed to parse stored user cookie.', error);
    Cookies.remove('user');
    return null;
  }
};

const persistUser = (user) => {
  store.dispatch(setUserRedux(user));
  Cookies.set('user', JSON.stringify(user), { expires: 7 });
};

const clearUser = () => {
  store.dispatch(logout());
  Cookies.remove('user');
};

// ==================== API Calls ====================

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

export const refreshToken = async (userId, refreshTokenValue) => {
  try {
    const response = await apiClient.post('/auth/refresh-token', {
      userId,
      refreshToken: refreshTokenValue,
    });
    return response.data;
  } catch (error) {
    console.error('Refresh Token API failed:', error);
    throw new Error(error.response?.data?.message || 'Token refresh failed');
  }
};

export const sendOtp = async (email) => {
  try {
    const response = await apiClient.post('/user/signup/send-otp', {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Send OTP API failed:", error);
    throw error
  }
};

export const register = async (data) => {
  try {
    const response = await apiClient.post('/user/student/confirm-signup', data);
    return response.data;
  } catch (error) {
    console.error("Register API failed:", error);
    throw error
  }
};

// ==================== Token Management ====================

/**
 * Get current valid access token for authenticated requests.
 * Handles token refresh automatically if expired.
 * Used by AI services and other authenticated features.
 * 
 * @returns {Promise<string|null>} Valid access token or null if not authenticated
 */
export const getCurrentSessionToken = async () => {
  let userState = store.getState().user;

  // Try to restore from cookie if Redux state is empty
  if (!userState?.accessToken) {
    const persistedUser = getPersistedUser();
    if (!persistedUser) {
      return null;
    }
    persistUser(persistedUser);
    userState = persistedUser;
  }

  // Return token if still valid
  if (!isTokenExpired(userState.accessToken)) {
    return userState.accessToken;
  }

  // Clear session if refresh token is missing
  if (!userState.refreshToken || !userState.userId) {
    clearUser();
    return null;
  }

  // Attempt to refresh token
  try {
    const response = await refreshToken(userState.userId, userState.refreshToken);
    if (!response?.isSuccess || !response?.accessToken) {
      throw new Error('Token refresh failed');
    }

    const updatedUser = {
      ...userState,
      userId: Number(userState.userId),
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      refreshTokenExpiryTime: response.refreshTokenExpiryTime ?? userState.refreshTokenExpiryTime,
    };

    persistUser(updatedUser);
    return updatedUser.accessToken;
  } catch (error) {
    console.error('[Auth] Unable to refresh access token.', error);
    clearUser();
    return null;
  }
};
