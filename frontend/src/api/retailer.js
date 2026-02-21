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

  validateProductExpiry: async (itemId) => {
    const response = await api.get(`/api/retailer/inventory/${itemId}/validate-expiry`);
    return response.data;
  },
};

