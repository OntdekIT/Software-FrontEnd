import axios from "axios";

const { VITE_BACKEND_API_URL } = import.meta.env;

export const backendApi = axios.create({
    baseURL: VITE_BACKEND_API_URL
});

backendApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        console.log(`Request URL: ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);