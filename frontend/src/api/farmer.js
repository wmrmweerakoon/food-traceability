import api from './axios';

export const farmerAPI = {
  // Batch operations
  createBatch: async (batchData) => {
    const response = await api.post('/api/farmer/batches', batchData);
    return response.data;
  },

  getBatches: async () => {
    const response = await api.get('/api/farmer/batches');
    return response.data;
  },

  getBatchById: async (batchId) => {
    const response = await api.get(`/api/farmer/batches/${batchId}`);
    return response.data;
  },

  updateBatch: async (batchId, batchData) => {
    const response = await api.put(`/api/farmer/batches/${batchId}`, batchData);
    return response.data;
  },

  deleteBatch: async (batchId) => {
    const response = await api.delete(`/api/farmer/batches/${batchId}`);
    return response.data;
  },

  generateQRCode: async (batchId) => {
    const response = await api.get(`/api/farmer/batches/${batchId}/qrcode`);
    return response.data;
  },
};

