import api from './axios';

export const consumerAPI = {
  // Traceability operations
  getTraceabilityReport: async (batchId) => {
    const response = await api.get(`/api/consumer/traceability/${batchId}`);
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
};

