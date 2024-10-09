import axios from "axios";

const {VITE_BACKEND_API_URL} = import.meta.env;

export const backendApi = axios.create({
    baseURL: VITE_BACKEND_API_URL,
});