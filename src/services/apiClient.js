import axios from 'axios';
import { store } from '../store/index';
import { toast } from 'sonner';
const baseURL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const state = store.getState();
    const token =
        state?.auth?.accessToken ||
        state?.user?.accessToken ||
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        if (status === 401) {
            toast.error('Please sign in again (401).');
        } else if (status === 403) {
            toast.warning('You are not a member of this class (403).');
        }
        return Promise.reject(err);
    }
);

export default apiClient;