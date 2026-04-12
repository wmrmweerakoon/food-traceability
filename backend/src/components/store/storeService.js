const axios = require('axios');
const StoreInventory = require('../../models/StoreInventory');
const ProductBatch = require('../../models/ProductBatch');
const RetailStore = require('../../models/RetailStore');

/**
 * Fetch global exchange rates for LKR (or base currency) using open.er-api.com.
 */
const getExchangeRates = async (baseCurrency = 'LKR') => {
    try {
        const response = await axios.get(`https://open.er-api.com/v6/latest/${baseCurrency}`);
        
        if (response.data && response.data.result === 'success') {
            return {
                base: baseCurrency,
                rates: {
                    USD: response.data.rates.USD,
                    EUR: response.data.rates.EUR,
                    GBP: response.data.rates.GBP,
                    INR: response.data.rates.INR
                },
                updatedAt: response.data.time_last_update_utc
            };
        } else {
            throw new Error('Failed to fetch exchange rates');
        }
    } catch (error) {
        console.warn('Currency API Error (Service):', error.message);
        // Fallback rates if API fails
        return {
            base: baseCurrency,
            rates: { USD: 0.0033, EUR: 0.0031, GBP: 0.0026, INR: 0.28 },
            isFallback: true
        };
    }
};

/**
 * Add a product to a store inventory.
 */
const addProductToStore = async (batchId, storeId, shelfDate, expiryDate) => {
    // 1. Find the ProductBatch by batchId string
    const productBatch = await ProductBatch.findOne({ batchId });
    if (!productBatch) {
        throw new Error(`Product batch not found with batchId: ${batchId}`);
    }

    // 2. Verify the store exists
    const store = await RetailStore.findById(storeId);
    if (!store) {
        throw new Error(`Retail store not found with id: ${storeId}`);
    }

    if (!expiryDate) {
        throw new Error('A manual expiryDate is required.');
    }

    const effectiveShelfDate = shelfDate ? new Date(shelfDate) : new Date();

    // 4. Create inventory record
    const inventoryItem = new StoreInventory({
        batchId,
        storeId,
        shelfDate: effectiveShelfDate,
        expiryDate: new Date(expiryDate),
        isAvailable: true
    });

    const savedItem = await inventoryItem.save();

    return {
        inventory: savedItem
    };
};

/**
 * Update a store product's availability or details.
 */
const updateStoreProduct = async (batchId, updateData) => {
    const inventoryItem = await StoreInventory.findOne({ batchId });
    if (!inventoryItem) {
        throw new Error(`Store inventory record not found for batchId: ${batchId}`);
    }

    // Allow updating isAvailable and other permitted fields
    if (updateData.isAvailable !== undefined) {
        inventoryItem.isAvailable = updateData.isAvailable;
    }
    if (updateData.shelfDate) {
        inventoryItem.shelfDate = new Date(updateData.shelfDate);
    }
    if (updateData.expiryDate) {
        inventoryItem.expiryDate = new Date(updateData.expiryDate);
    }

    const updatedItem = await inventoryItem.save();
    return updatedItem;
};

/**
 * Fetch a specific batch's store details.
 */
const getStoreProduct = async (batchId) => {
    const inventoryItem = await StoreInventory.findOne({ batchId })
        .populate('storeId');

    if (!inventoryItem) {
        throw new Error(`Store inventory record not found for batchId: ${batchId}`);
    }

    return inventoryItem;
};

/**
 * Delete a product record from the store inventory.
 */
const removeProduct = async (batchId) => {
    const inventoryItem = await StoreInventory.findOne({ batchId });
    if (!inventoryItem) {
        throw new Error(`Store inventory record not found for batchId: ${batchId}`);
    }

    await StoreInventory.deleteOne({ batchId });
    return { message: 'Product removed from store inventory successfully' };
};

module.exports = {
    getExchangeRates,
    addProductToStore,
    updateStoreProduct,
    getStoreProduct,
    removeProduct
};
