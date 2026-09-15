import axios from "axios";

const DegreeClassAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getDegreeClasses = async () => {
  const response = await DegreeClassAPI.get("/api/degree-classes");
  return response.data;
};

export const getDegreeClassById = async (id) => {
  const response = await DegreeClassAPI.get(
    `/api/degree-classes/${id}`
  );

  return response.data;
};

export const createDegreeClass = async (classData) => {
  const response = await DegreeClassAPI.post(
    "/api/degree-classes",
    classData
  );

  return response.data;
};

export const updateDegreeClass = async (id, classData) => {
  const response = await DegreeClassAPI.put(
    `/api/degree-classes/${id}`,
    classData
  );

  return response.data;
};

export const deleteDegreeClass = async (id) => {
  const response = await DegreeClassAPI.delete(
    `/api/degree-classes/${id}`
  );

  return response.data;
};