import axios from "axios";

const CampusAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Get all campuses
export const getCampuses = async () => {
  const response = await CampusAPI.get("/api/campuses");
  return response.data;
};

// Get campus by ID
export const getCampusById = async (id) => {
  const response = await CampusAPI.get(`/api/campuses/${id}`);
  return response.data;
};

// Create campus
export const createCampus = async (campusData) => {
  const response = await CampusAPI.post("/api/campuses", campusData);
  return response.data;
};

// Update campus
export const updateCampus = async (id, campusData) => {
  const response = await CampusAPI.put(
    `/api/campuses/${id}`,
    campusData
  );
  return response.data;
};

// Delete campus
export const deleteCampus = async (id) => {
  const response = await CampusAPI.delete(`/api/campuses/${id}`);
  return response.data;
};