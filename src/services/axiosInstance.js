import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("adminToken") ||
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("token");

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
