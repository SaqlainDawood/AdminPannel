import axiosInstance from "./axiosInstance";

export const getClasses = async () => {
  const response = await axiosInstance.get("/api/degree-classes");
  return response?.data?.data ?? response?.data ?? [];
};

export const updateClass = async (id, payload) => {
  const response = await axiosInstance.put(`/api/degree-classes/${id}`, payload);
  return response?.data?.data ?? response?.data ?? null;
};

export const getClassCreditSummary = async (classId) => {
  const response = await axiosInstance.get(`/api/cms/classes/${classId}/credit-summary`);
  return response?.data ?? null;
};
