import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

// Auto-refresh interceptor
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    
    // If 401, and it's NOT the login or refresh endpoint, try to refresh
    if (
      error.response?.status === 401 && 
      !original._retry && 
      !original.url.includes('/auth/login') &&
      !original.url.includes('/auth/refresh')
    ) {
      original._retry = true;
      try {
        await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        return api(original); // Retry the original request
      } catch (refreshError) {
        // If refresh fails, just reject. The AuthContext will set user to null,
        // and ProtectedRoute will safely redirect to /login without a full page reload.
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;