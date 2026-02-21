import api from './axios';

export const authAPI = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Logout (client-side only, clears token)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

