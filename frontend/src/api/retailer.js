import api from './axios';

export const retailerAPI = {
  // Inventory operations
  addProductToInventory: async (inventoryData) => {
    const response = await api.post('/api/retailer/inventory', inventoryData);
    return response.data;
  },

  getInventoryItems: async () => {
    const response = await api.get('/api/retailer/inventory');
    return response.data;
  },

  getInventoryItemById: async (itemId) => {
    const response = await api.get(`/api/retailer/inventory/${itemId}`);
    return response.data;
  },

  updateInventoryItem: async (itemId, updateData) => {
    const response = await api.put(`/api/retailer/inventory/${itemId}`, updateData);
    return response.data;
  },

  deleteInventoryItem: async (itemId) => {
    const response = await api.delete(`/api/retailer/inventory/${itemId}`);
    return response.data;
  },

  validateProductExpiry: async (validationData) => {
    const response = await api.post('/api/retailer/validate-expiry', validationData);
    return response.data;
  },

  getRetailerStores: async () => {
    const response = await api.get('/api/retailer/stores');
    return response.data;
  },

  getAvailableBatches: async () => {
    const response = await api.get('/api/retailer/batches');
    return response.data;
  },
};

