import axios from 'axios';
const AdminAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/admin`,
  withCredentials: true,
});

// Helper to fetch valid token, prioritizing sessionStorage
export const getAuthToken = () => {
  const token =
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('adminToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('adminToken') ||
    null;
  if (!token || token === 'null' || token === 'undefined') return null;
  const clean = token.replace(/^Bearer\s+/i, '').replace(/^"|"$/g, '').trim();
  return (clean && clean !== 'null' && clean !== 'undefined') ? clean : null;
};

// Attach admin token on every request
AdminAPI.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized access
AdminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default AdminAPI;
