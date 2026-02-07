import axios from 'axios';



const AdminAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/admin`,
  withCredentials: true,
});

// Attach admin token on every request
AdminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
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
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default AdminAPI;
