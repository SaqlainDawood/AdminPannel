import axios from "axios";

const StaffAdminAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://backend-project-ums-cmwj.vercel.app",
});

StaffAdminAPI.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

StaffAdminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

const BASE = "/api/staff/admin";

export const getStaffStats = async () => {
  const res = await StaffAdminAPI.get(`${BASE}/stats`);
  return res.data;
};

export const getStaffApplications = async (params = {}) => {
  const res = await StaffAdminAPI.get(`${BASE}/applications`, { params });
  return res.data;
};

export const getStaffApplicationById = async (id) => {
  const res = await StaffAdminAPI.get(`${BASE}/${id}`);
  return res.data;
};

export const approveStaffApplication = async (id, payload = {}) => {
  const res = await StaffAdminAPI.patch(`${BASE}/${id}/approve`, payload);
  return res.data;
};

export const rejectStaffApplication = async (id, reason) => {
  const res = await StaffAdminAPI.patch(`${BASE}/${id}/reject`, { reason });
  return res.data;
};

export const deleteStaffApplication = async (id) => {
  const res = await StaffAdminAPI.delete(`${BASE}/${id}`);
  return res.data;
};

export default StaffAdminAPI;
