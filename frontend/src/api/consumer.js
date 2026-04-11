import api from './axios';

export const consumerAPI = {
  // Traceability operations
  getTraceabilityReport: async (batchId) => {
    const response = await api.get(`/api/consumer/trace/${batchId}`);
    return response.data;
  },

  getProductStatus: async (batchId) => {
    const response = await api.get(`/api/consumer/product-status/${batchId}`);
    return response.data;
  },

  searchProducts: async (searchParams) => {
    const response = await api.get('/api/consumer/search', { params: searchParams });
    return response.data;
  },

  // Profile Management
  getProfile: async (userId) => {
    const response = await api.get(`/api/consumer/${userId}`);
    return response.data;
  },

  updateProfile: async (userId, data) => {
    const response = await api.put(`/api/consumer/${userId}`, data);
    return response.data;
  },

  deleteAccount: async (userId) => {
    const response = await api.delete(`/api/consumer/${userId}`);
    return response.data;
  },

  // Feedback Operations
  submitFeedback: async (batchId, feedbackData) => {
    const response = await api.post(`/api/consumer/feedback/${batchId}`, feedbackData);
    return response.data;
  },

  getFeedback: async (batchId) => {
    const response = await api.get(`/api/consumer/feedback/${batchId}`);
    return response.data;
  }
};

