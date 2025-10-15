import axios from 'axios';
import { store } from '../store/index';
import { toast } from 'sonner';
const baseURL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = store.getState().user.accessToken;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.headers['Access-Control-Allow-Origin'] = '*';
        config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
        config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        return config;
    },
    (error) => Promise.reject(error)
)
export default apiClient;