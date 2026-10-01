import axios from "axios";

const normalizeBaseUrl = (value) =>
  (value || "https://backend-project-ums-cmwj.vercel.app").replace(/\/+$/, "");

const axiosInstance = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
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
