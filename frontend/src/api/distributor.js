import api from './axios';

export const distributorAPI = {
  // Transport operations
  createTransport: async (transportData) => {
    const response = await api.post('/api/distributor/transports', transportData);
    return response.data;
  },

  getTransports: async () => {
    const response = await api.get('/api/distributor/transports');
    return response.data;
  },

  getTransportById: async (transportId) => {
    const response = await api.get(`/api/distributor/transports/${transportId}`);
    return response.data;
  },

  updateTransportStatus: async (transportId, updateData) => {
    const response = await api.put(`/api/distributor/transports/${transportId}`, updateData);
    return response.data;
  },

  trackRouteUpdate: async (transportId, location) => {
    const response = await api.put(`/api/distributor/transports/${transportId}/route-update`, location);
    return response.data;
  },

  getRouteDetails: async (transportId) => {
    const response = await api.get(`/api/distributor/transports/${transportId}/route-details`);
    return response.data;
  },
};

