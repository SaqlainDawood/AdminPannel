// src/services/permissionService.js
import api from "./api";

export const getPermissions = async () => {
  const { data } = await api.get("/permissions");
  return Array.isArray(data?.permissions) ? data.permissions : [];
};

// Flat list ko category -> module -> [permissions] me group karta hai
export const groupPermissions = (permissions = []) => {
  const grouped = {};
  const list = Array.isArray(permissions) ? permissions : [];

  list.forEach((permission) => {
    if (!permission || permission.isActive === false) return;
    const category = permission.category || "general";
    const moduleName = permission.module || "general";

    grouped[category] ??= {};
    grouped[category][moduleName] ??= [];
    grouped[category][moduleName].push(permission);
  });

  return grouped;
};