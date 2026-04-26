import axios from "axios";

const DEPLOYED_API_URL = "https://interview-ai-s311.onrender.com";

const viteApiUrl =
    typeof import.meta !== "undefined" && import.meta.env
        ? import.meta.env.VITE_API_URL
        : undefined;

const browserHostname =
    typeof window !== "undefined" ? window.location.hostname : "";

const isLocalHostname = /^(localhost|127\.0\.0\.1)$/i.test(browserHostname);

const fallbackApiUrl =
    !browserHostname || isLocalHostname
        ? "http://localhost:3000"
        : DEPLOYED_API_URL;

const API_BASE_URL = (viteApiUrl || fallbackApiUrl).replace(/\/$/, "");

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

export default api;
