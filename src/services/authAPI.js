import axios from "axios";

const normalizeBaseUrl = (value) =>
  (value || "http://localhost:8000").replace(/\/+$/, "");

const AuthAPI = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
});

export const loginUser = async (credentials) => {
  const response = await AuthAPI.post(
    "/api/auth/login",
    credentials
  );

  return response.data;
};
export const getCurrentUser = async (token) => {
  const response = await AuthAPI.get(
    "/api/auth/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const logoutUser = async (token) => {
  const response = await AuthAPI.post(
    "/api/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await AuthAPI.post(
    "/api/auth/forgot-password",
    {
      email,
    }
  );

  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await AuthAPI.post(
    `/api/auth/reset-password/${token}`,
    {
      password,
    }
  );

  return response.data;
};