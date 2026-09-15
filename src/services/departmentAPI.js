import axios from "axios";

const DepartmentAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getDepartments = async () => {
  const response = await DepartmentAPI.get("/api/departments");
  return response.data;
};

export const getDepartmentById = async (id) => {
  const response = await DepartmentAPI.get(`/api/departments/${id}`);
  return response.data;
};

export const createDepartment = async (departmentData) => {
  const response = await DepartmentAPI.post(
    "/api/departments",
    departmentData
  );
  return response.data;
};

export const updateDepartment = async (id, departmentData) => {
  const response = await DepartmentAPI.put(
    `/api/departments/${id}`,
    departmentData
  );
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await DepartmentAPI.delete(
    `/api/departments/${id}`
  );
  return response.data;
};