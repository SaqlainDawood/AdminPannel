import axios from "axios";

const normalizeBaseUrl = (value) =>
  (value || "https://backend-project-ums-cmwj.vercel.app").replace(/\/+$/, "");

const SubjectAPI = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
});

SubjectAPI.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken");

  if (token) {
    const cleanToken = token
      .replace(/^Bearer\s+/i, "")
      .replace(/^"|"$/g, "");

    config.headers.Authorization = `Bearer ${cleanToken}`;
  }

  return config;
});

// params: { departmentId, isActive }
export const getSubjects = async (params = {}) => {
  const response = await SubjectAPI.get("/api/subjects", { params });
  return response.data;
};

export const getSubjectById = async (id) => {
  const response = await SubjectAPI.get(`/api/subjects/${id}`);
  return response.data;
};

export const createSubject = async (subjectData) => {
  const response = await SubjectAPI.post("/api/subjects", subjectData);
  return response.data;
};

export const updateSubject = async (id, subjectData) => {
  const response = await SubjectAPI.put(`/api/subjects/${id}`, subjectData);
  return response.data;
};

// Soft delete (isActive: false)
export const deactivateSubject = async (id) => {
  const response = await SubjectAPI.patch(`/api/subjects/${id}/deactivate`);
  return response.data;
};