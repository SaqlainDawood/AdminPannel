import axios from "axios";

const JobAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Token interceptor
JobAPI.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

JobAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
    }
    return Promise.reject(err);
  }
);

const BASE = "/api/jobs";

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