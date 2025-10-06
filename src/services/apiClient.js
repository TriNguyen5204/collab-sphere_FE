import axios from 'axios';
import { store } from '../store/index';

const apiClient = axios.create({
    baseURL: 'https://collabsphere.azurewebsites.net/api', // Replace with your API base URL
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = store.getState().user.token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.headers['Access-Control-Allow-Origin'] = '*';
        config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        return config;
    },
    (error) => Promise.reject(error)
)
export default apiClient;