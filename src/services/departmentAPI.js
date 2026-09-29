
import axios from "axios";

const DepartmentAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ============================================
// TOKEN INTERCEPTOR
// ============================================
DepartmentAPI.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// GET ALL DEPARTMENTS
// GET /api/departments/
// ============================================
export const getDepartments = async () => {
  const response = await DepartmentAPI.get(
    "/api/departments/"
  );

  return response.data;
};

// ============================================
// GET DEPARTMENT BY ID
// GET /api/departments/:id
// ============================================
export const getDepartmentById = async (id) => {
  const response = await DepartmentAPI.get(
    `/api/departments/${id}`
  );

  return response.data;
};

// ============================================
// CREATE DEPARTMENT
// POST /api/departments/
// ============================================
export const createDepartment = async (departmentData) => {
  const response = await DepartmentAPI.post(
    "/api/departments/",
    departmentData
  );

  return response.data;
};

// ============================================
// UPDATE DEPARTMENT
// PUT /api/departments/:id
// ============================================
export const updateDepartment = async (
  id,
  departmentData
) => {
  const response = await DepartmentAPI.put(
    `/api/departments/${id}`,
    departmentData
  );

  return response.data;
};

// ============================================
// DELETE DEPARTMENT
// DELETE /api/departments/:id
// ============================================
export const deleteDepartment = async (id) => {
  const response = await DepartmentAPI.delete(
    `/api/departments/${id}`
  );

  return response.data;
};

export default DepartmentAPI;

