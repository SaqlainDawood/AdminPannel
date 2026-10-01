import axios from "axios";

const academicApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api`,
});

const getAdminToken = () => {
  const token =
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("adminToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  const clean = token.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "").trim();
  return (clean && clean !== "null" && clean !== "undefined") ? clean : null;
};

academicApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

const unwrap = (p) => p.then((r) => r.data.data);

export const getDegreeClasses = () => unwrap(academicApi.get("/degree-classes"));
export const getSubjects = () => unwrap(academicApi.get("/subjects"));
export const getBatches = () => unwrap(academicApi.get("/batches"));
export const getSessions = () => unwrap(academicApi.get("/sessions"));
export const getTeachers = (params) =>
  unwrap(academicApi.get("/teachers", { params: { isActive: true, ...params } }));

export const getSemesters = (degreeClassId) =>
  unwrap(academicApi.get(`/program-semesters/degree-class/${degreeClassId}`));
export const createSemester = (body) => unwrap(academicApi.post("/program-semesters", body));

export const getSemesterSubjects = (programSemesterId) =>
  unwrap(academicApi.get(`/semester-subjects/semester/${programSemesterId}`));
export const addSemesterSubject = (body) => unwrap(academicApi.post("/semester-subjects", body));
export const updateSemesterSubject = (id, body) =>
  unwrap(academicApi.put(`/semester-subjects/${id}`, body));
export const removeSemesterSubject = (id) => academicApi.patch(`/semester-subjects/${id}/remove`);

export const getAssignmentsByBatch = (batchId) =>
  unwrap(academicApi.get(`/teacher-assignments/batch/${batchId}`));
export const assignTeacher = (body) => unwrap(academicApi.post("/teacher-assignments", body));
export const reassignTeacher = (id, teacherId) =>
  unwrap(academicApi.put(`/teacher-assignments/${id}/reassign`, { teacherId }));
export const deactivateAssignment = (id) => academicApi.patch(`/teacher-assignments/${id}/deactivate`);

export const getTimetableForBatch = (batchId) =>
  unwrap(academicApi.get(`/timetable/batches/${batchId}/summary`));
export const createTimetableEntry = (body) => unwrap(academicApi.post("/timetable", body));
export const updateTimetableEntry = (id, body) => unwrap(academicApi.put(`/timetable/${id}`, body));
export const deleteTimetableEntry = (id) => unwrap(academicApi.delete(`/timetable/${id}`));
export const getTeacherWorkload = (teacherId) =>
  unwrap(academicApi.get(`/timetable/teachers/${teacherId}/workload`));

export const errMsg = (e) => e?.response?.data?.message || e.message || "Kuch ghalat ho gaya";
export const idOf = (v) => (v && typeof v === "object" ? v._id : v);

export const createTeacher = (body) => unwrap(academicApi.post("/teachers", body));
export const updateTeacher = (id, body) => unwrap(academicApi.put(`/teachers/${id}`, body));
export const deactivateTeacher = (id) => academicApi.patch(`/teachers/${id}/deactivate`);

export const getDepartments = () => unwrap(academicApi.get("/departments"));
export const getUsers = (params = {}) => unwrap(academicApi.get("/users", { params }));

export default academicApi;