import axios from "axios";

const normalizeBaseUrl = (value) =>
  (value || "https://backend-project-ums-cmwj.vercel.app").replace(/\/+$/, "");

const axiosInstance = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
});

const getToken = () => {
  const token =
    sessionStorage.getItem("adminToken") ||
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("token");

  if (!token || token === "null" || token === "undefined") return null;

  return token.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "").trim();
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
