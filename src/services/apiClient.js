import axios from 'axios';
import Cookies from 'js-cookie';
import { store } from '../store/index';
import { logout, setUserRedux } from '../store/slices/userSlice';
import { isTokenExpired } from '../utils/tokenUtils';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;

const requestAccessTokenRefresh = async (userState) => {
    try {
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
            userId: Number(userState.userId),
            refreshToken: userState.refreshToken,
        });

        const data = response.data;
        if (!data?.isSuccess || !data?.accessToken) {
            throw new Error('Token refresh failed');
        }

        const updatedUser = {
            ...userState,
            userId: Number(userState.userId),
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            refreshTokenExpiryTime: data.refreshTokenExpiryTime ?? userState.refreshTokenExpiryTime,
        };

        store.dispatch(setUserRedux(updatedUser));
        Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });

        return data.accessToken;
    } catch (error) {
        console.error('Refresh token request failed:', error);
        store.dispatch(logout());
        Cookies.remove('user');
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        throw error;
    }
};

apiClient.interceptors.request.use(
    async (config) => {
        const userState = store.getState().user;
        const token = userState?.accessToken;

        if (config.url && config.url.includes('/auth/refresh-token')) {
            config.headers['Access-Control-Allow-Origin'] = '*';
            config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
            config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
            return config;
        }

        if (token) {
            if (isTokenExpired(token)) {
                if (!userState?.refreshToken || !userState?.userId) {
                    store.dispatch(logout());
                    Cookies.remove('user');
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                    throw new Error('Session expired');
                } else {
                    if (!refreshPromise) {
                        refreshPromise = requestAccessTokenRefresh(userState).finally(() => {
                            refreshPromise = null;
                        });
                    }

                    const refreshedToken = await refreshPromise;
                    config.headers['Authorization'] = `Bearer ${refreshedToken}`;
                }
            } else {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        config.headers['Access-Control-Allow-Origin'] = '*';
        config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
        config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;