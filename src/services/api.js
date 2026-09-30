// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/cms`,
});

const TOKEN_KEYS = ["adminToken", "token", "Bearer", "bearer", "accessToken", "authToken"];

const getToken = () => {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (!value) continue;
    return value.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "");
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