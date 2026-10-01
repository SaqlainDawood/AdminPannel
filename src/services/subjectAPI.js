import axios from "axios";

const SubjectAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

SubjectAPI.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken");
  if (token) {
    const cleanToken = token.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "");
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

// params: { departmentId, isActive }
export const getSubjects = async (params = {}) => {
  try {
    const response = await SubjectAPI.get("/api/subjects", { params });
    return response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const fallback = await SubjectAPI.get("/api/subject", { params });
      return fallback.data;
    }
    throw err;
  }
};

export const getSubjectById = async (id) => {
  try {
    const response = await SubjectAPI.get(`/api/subjects/${id}`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const fallback = await SubjectAPI.get(`/api/subject/${id}`);
      return fallback.data;
    }
    throw err;
  }
};

export const createSubject = async (subjectData) => {
  try {
    const response = await SubjectAPI.post("/api/subjects", subjectData);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const fallback = await SubjectAPI.post("/api/subject", subjectData);
      return fallback.data;
    }
    throw err;
  }
};

export const updateSubject = async (id, subjectData) => {
  try {
    const response = await SubjectAPI.put(`/api/subjects/${id}`, subjectData);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const fallback = await SubjectAPI.put(`/api/subject/${id}`, subjectData);
      return fallback.data;
    }
    throw err;
  }
};

// Soft delete (isActive: false)
export const deactivateSubject = async (id) => {
  try {
    const response = await SubjectAPI.patch(`/api/subjects/${id}/deactivate`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const fallback = await SubjectAPI.patch(`/api/subject/${id}/deactivate`);
      return fallback.data;
    }
    throw err;
  }
};