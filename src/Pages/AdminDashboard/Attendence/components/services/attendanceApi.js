import axios from 'axios';

const API_BASE = 'https://backend-project-ums-vjpm.onrender.com/api/admin/attendance';

export const attendanceApi = {
  // Overview
  getOverview: () => axios.get(`${API_BASE}/overview`),
  
  // Department
  getDepartmentAttendance: (departmentName) => 
    axios.get(`${API_BASE}/department/${encodeURIComponent(departmentName)}`),
  
  // Class/Course
  getClassAttendance: (classId) => 
    axios.get(`${API_BASE}/class/${classId}`),
  
  // Student
  getStudentAttendance: (studentId) => 
    axios.get(`${API_BASE}/student/${studentId}`),
};