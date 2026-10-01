import axiosInstance from "./axiosInstance";

// ─── Program Semesters ───────────────────────────────────────────────

export const getSemesters = async (degreeClassId) => {
  const response = await axiosInstance.get(
    `/api/program-semesters/degree-class/${degreeClassId}`
  );
  return response?.data?.data ?? [];
};

export const createProgramSemester = async (payload) => {
  // payload: { degreeClassId, semesterNo, name? }
  const response = await axiosInstance.post("/api/program-semesters", payload);
  return response?.data ?? null;
};

export const deactivateProgramSemester = async (id) => {
  const response = await axiosInstance.patch(
    `/api/program-semesters/${id}/deactivate`
  );
  return response?.data ?? null;
};

// ─── Semester Subjects ────────────────────────────────────────────────

export const getSemesterSubjects = async (programSemesterId) => {
  const response = await axiosInstance.get(
    `/api/semester-subjects/semester/${programSemesterId}`
  );
  return response?.data?.data ?? [];
};

export const addSemesterSubject = async (payload) => {
  // payload: { programSemesterId, subjectId, creditHours, subjectType, prerequisites? }
  const response = await axiosInstance.post("/api/semester-subjects", payload);
  return response?.data ?? null;
};

export const updateSemesterSubject = async (id, payload) => {
  const response = await axiosInstance.put(
    `/api/semester-subjects/${id}`,
    payload
  );
  return response?.data ?? null;
};

export const removeSemesterSubject = async (id) => {
  const response = await axiosInstance.patch(
    `/api/semester-subjects/${id}/remove`
  );
  return response?.data ?? null;
};

// ─── Subjects (catalog) ───────────────────────────────────────────────

export const getAllSubjects = async (params = {}) => {
  // GET /api/subjects?departmentId=xxx&isActive=true
  const response = await axiosInstance.get("/api/subjects", { params });
  return response?.data?.data ?? [];
};
