import axios from "axios";

const SubjectAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getSubjects = async () => {
  const response = await SubjectAPI.get("/api/subjects");
  return response.data;
};

export const getSubjectById = async (id) => {
  const response = await SubjectAPI.get(`/api/subjects/${id}`);
  return response.data;
};

export const createSubject = async (subjectData) => {
  const response = await SubjectAPI.post(
    "/api/subjects",
    subjectData
  );
  return response.data;
};

export const updateSubject = async (id, subjectData) => {
  const response = await SubjectAPI.put(
    `/api/subjects/${id}`,
    subjectData
  );
  return response.data;
};

export const deleteSubject = async (id) => {
  const response = await SubjectAPI.delete(
    `/api/subjects/${id}`
  );
  return response.data;
};