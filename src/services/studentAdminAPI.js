import axios from "axios";

const StudentAdminAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// ============================================================
// TOKEN INTERCEPTOR
// ============================================================
StudentAdminAPI.interceptors.request.use(
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

StudentAdminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

const BASE = "/api/students/admin";

// Get pending applications
export const getPendingApplications = async () => {
  const res = await StudentAdminAPI.get(`${BASE}/applications`, {
    params: { status: "pending", limit: 100 },
  });
  return res.data;
};

// Approve application
export const approveApplication = async (id, payload = {}) => {
  const res = await StudentAdminAPI.patch(
    `${BASE}/applications/${id}/approve`,
    payload
  );
  return res.data;
};

// Reject application
export const rejectApplication = async (id, reason) => {
  const res = await StudentAdminAPI.patch(
    `${BASE}/applications/${id}/reject`,
    { reason }
  );
  return res.data;
};

export default StudentAdminAPI;