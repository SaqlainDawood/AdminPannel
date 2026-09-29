import axios from "axios";

const SubjectAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

SubjectAPI.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// params: { departmentId, isActive }
export const getSubjects = async (params = {}) => {
  const response = await SubjectAPI.get("/api/subject", { params });
  return response.data;
};

export const getSubjectById = async (id) => {
  const response = await SubjectAPI.get(`/api/subject/${id}`);
  return response.data;
};

export const createSubject = async (subjectData) => {
  const response = await SubjectAPI.post("/api/subject", subjectData);
  return response.data;
};

export const updateSubject = async (id, subjectData) => {
  const response = await SubjectAPI.put(`/api/subject/${id}`, subjectData);
  return response.data;
};

// Soft delete (isActive: false)
export const deactivateSubject = async (id) => {
  const response = await SubjectAPI.patch(`/api/subject/${id}/deactivate`);
  return response.data;
};