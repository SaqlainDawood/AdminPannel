import axiosInstance from "./axiosInstance";

export const getClassCreditSummary = async (classId) => {
  const response = await axiosInstance.get(`/api/cms/classes/${classId}/credit-summary`);
  return response?.data ?? null;
};

export const getSemesterCreditSummary = async (semesterId) => {
  const response = await axiosInstance.get(`/api/cms/semesters/${semesterId}/credit-summary`);
  return response?.data ?? null;
};
