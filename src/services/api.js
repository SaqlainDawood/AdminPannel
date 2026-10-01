// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "https://backend-project-ums-cmwj.vercel.app"}/api/cms`,
});

const TOKEN_KEYS = ["token", "adminToken", "accessToken", "authToken", "Bearer", "bearer"];

const getToken = () => {
  for (const key of TOKEN_KEYS) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (!value || value === "null" || value === "undefined") continue;
    const clean = value.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "").trim();
    if (clean && clean !== "null" && clean !== "undefined") return clean;
  }
  return null;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (e) =>
  e?.response?.data?.message || e?.message || "Something went wrong";

export default api;