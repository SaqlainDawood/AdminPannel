import axios from "axios";

const JobAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Token interceptor
JobAPI.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem("adminToken") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token interceptor
JobAPI.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("adminToken") ||
      sessionStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
JobAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

const BASE = "/api/cms/job-posts";

// ---------- API CALLS ----------

export const getJobs = async (params = {}) => {
  const res = await JobAPI.get(`${BASE}`, { params });
  return res.data;
};

export const getJobById = async (id) => {
  const res = await JobAPI.get(`${BASE}/${id}`);
  return res.data;
};

export const createJob = async (payload) => {
  const res = await JobAPI.post(`${BASE}`, payload);
  return res.data;
};

export const updateJob = async (id, payload) => {
  const res = await JobAPI.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteJob = async (id) => {
  const res = await JobAPI.delete(`${BASE}/${id}`);
  return res.data;
};

export default JobAPI;