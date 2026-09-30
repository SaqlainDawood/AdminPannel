// src/services/roleService.js
import api from "./api";

export const getRoles = async () => {
  const { data } = await api.get("/roles");
  return Array.isArray(data?.roles) ? data.roles : [];
};

export const createRole = async (payload) => {
  const { data } = await api.post("/roles", payload);
  return data;
};

export const updateRole = async (id, payload) => {
  const { data } = await api.put(`/roles/${id}`, payload);
  return data;
};

export const deleteRole = async (id) => {
  const { data } = await api.delete(`/roles/${id}`);
  return data;
};

export const toggleRoleStatus = async (id) => {
  const { data } = await api.patch(`/roles/${id}/toggle`);
  return data;
};