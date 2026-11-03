import axios from "axios";

export const backendApi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
    // Fail fast instead of hanging indefinitely on a slow/unreachable backend.
    timeout: 15000
});

backendApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);