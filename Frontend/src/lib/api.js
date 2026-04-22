import axios from "axios";

const viteApiUrl =
    typeof import.meta !== "undefined" && import.meta.env
        ? import.meta.env.VITE_API_URL
        : undefined;

const API_BASE_URL = (viteApiUrl || "http://localhost:3000").replace(/\/$/, "");

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

export default api;
