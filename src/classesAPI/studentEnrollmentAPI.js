import AdminAPI from "../api";

const token = localStorage.getItem("adminToken");
const config = {
  headers: { Authorization: `Bearer ${token}` }
};

// Enroll single student
export const enrollSingleStudent = async (classId, studentId) => {
  const response = await AdminAPI.post(
    `/classes/${classId}/enroll/single`,
    { studentId },
    config
  );
  return response.data;
};

// Enroll multiple students
export const enrollBulkStudents = async (classId, studentIds) => {
  const response = await AdminAPI.post(
    `/classes/${classId}/enroll/bulk`,
    { studentIds },
    config
  );
  return response.data;
};

// Remove student from class
export const removeStudentFromClass = async (classId, studentId) => {
  const response = await AdminAPI.delete(
    `/classes/${classId}/students/${studentId}`,
    config
  );
  return response.data;
};

// Get class students
export const getClassStudents = async (classId, page = 1, limit = 20, status = '') => {
  const response = await AdminAPI.get(
    `/classes/${classId}/students?page=${page}&limit=${limit}&status=${status}`,
    config
  );
  return response.data;
};

// Get available students for enrollment
export const getAvailableStudents = async (classId, filters = {}) => {
  const { department, semester, search, page = 1, limit = 20 } = filters;
  let url = `/classes/${classId}/available-students?page=${page}&limit=${limit}`;
  
  if (department) url += `&department=${department}`;
  if (semester) url += `&semester=${semester}`;
  if (search) url += `&search=${search}`;
  
  const response = await AdminAPI.get(url, config);
  return response.data;
};

// Get student schedule
export const getStudentSchedule = async (studentId) => {
  const response = await AdminAPI.get(
    `/classes/students/${studentId}/schedule`,
    config
  );
  return response.data;
};

// Update student status
export const updateStudentStatus = async (classId, studentId, status) => {
  const response = await AdminAPI.patch(
    `/classes/${classId}/students/${studentId}/status`,
    { status },
    config
  );
  return response.data;
};

// Get enrollment statistics
export const getEnrollmentStats = async (classId) => {
  const response = await AdminAPI.get(
    `/classes/${classId}/enrollment-stats`,
    config
  );
  return response.data;
};