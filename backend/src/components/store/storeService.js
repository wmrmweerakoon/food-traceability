const axios = require('axios');
const StoreInventory = require('../../models/StoreInventory');
const ProductBatch = require('../../models/ProductBatch');
const RetailStore = require('../../models/RetailStore');

/**
 * Fetch typical shelf life from OpenFoodFacts API by product name.
 * Returns the shelf life in days, or null if unavailable.
 */
const fetchShelfLifeFromOpenFoodFacts = async (productName) => {
    try {
        if (!productName) {
            return null;
        }

        const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl`;
        const response = await axios.get(searchUrl, {
            params: {
                search_terms: productName,
                search_simple: 1,
                action: 'process',
                json: 1,
                page_size: 5
            },
            headers: {
                'User-Agent': 'Food-Traceability-App 1.0 (contact@foodtraceability.com)'
            },
            timeout: 10000
        });

        if (!response.data || !response.data.products || response.data.products.length === 0) {
            return null;
        }

        // Search through returned products for one with shelf_life data
        for (const product of response.data.products) {
            if (product.shelf_life) {
                const shelfLifeDays = parseShelfLifeToDays(product.shelf_life);
                if (shelfLifeDays !== null) {
                    return shelfLifeDays;
                }
            }
        }

        return null;
    } catch (error) {
        // Fallback: API unreachable, return null to allow manual entry
        console.warn(`OpenFoodFacts API error for "${productName}":`, error.message);
        return null;
    }
};

/**
 * Parse a shelf life string (e.g. "7 days", "2 weeks", "6 months") into days.
 */
const parseShelfLifeToDays = (shelfLifeStr) => {
    if (!shelfLifeStr || typeof shelfLifeStr !== 'string') {
        return null;
    }

    const normalized = shelfLifeStr.toLowerCase().trim();

    // Try to match patterns like "7 days", "2 weeks", "3 months", "1 year"
    const match = normalized.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/);
    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];

        if (unit.startsWith('day')) return value;
        if (unit.startsWith('week')) return value * 7;
        if (unit.startsWith('month')) return value * 30;
        if (unit.startsWith('year')) return value * 365;
    }

    // Try plain number (assume days)
    const plainNumber = parseInt(normalized, 10);
    if (!isNaN(plainNumber) && plainNumber > 0) {
        return plainNumber;
    }

    return null;
};

/**
 * Add a product to a store inventory.
 * Queries OpenFoodFacts for shelf life and calculates expiryDate.
 * If manual expiryDate exceeds the API-suggested period, it is rejected.
 */
const addProductToStore = async (batchId, storeId, shelfDate, manualExpiryDate) => {
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

    // 3. Query OpenFoodFacts for shelf life
    const shelfLifeDays = await fetchShelfLifeFromOpenFoodFacts(productBatch.productName);

    const effectiveShelfDate = shelfDate ? new Date(shelfDate) : new Date();
    let calculatedExpiryDate;

    if (shelfLifeDays !== null) {
        // API returned a shelf life — calculate expiry
        calculatedExpiryDate = new Date(effectiveShelfDate);
        calculatedExpiryDate.setDate(calculatedExpiryDate.getDate() + shelfLifeDays);

        // If a manual expiry was provided, validate it doesn't exceed the API threshold
        if (manualExpiryDate) {
            const manualExpiry = new Date(manualExpiryDate);
            if (manualExpiry > calculatedExpiryDate) {
                throw new Error(
                    `Manual expiry date (${manualExpiry.toISOString().split('T')[0]}) exceeds the ` +
                    `API-suggested shelf life of ${shelfLifeDays} days. ` +
                    `Maximum allowed expiry: ${calculatedExpiryDate.toISOString().split('T')[0]}`
                );
            }
            // Manual date is within range — use it
            calculatedExpiryDate = manualExpiry;
        }
    } else {
        // API unreachable or no data — fallback to manual entry
        if (!manualExpiryDate) {
            throw new Error(
                'OpenFoodFacts API could not determine shelf life. A manual expiryDate is required.'
            );
        }
        calculatedExpiryDate = new Date(manualExpiryDate);
    }

    // 4. Create inventory record
    const inventoryItem = new StoreInventory({
        batchId,
        storeId,
        shelfDate: effectiveShelfDate,
        expiryDate: calculatedExpiryDate,
        isAvailable: true
    });

    const savedItem = await inventoryItem.save();

    return {
        inventory: savedItem,
        shelfLifeDays,
        apiUsed: shelfLifeDays !== null
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
    fetchShelfLifeFromOpenFoodFacts,
    parseShelfLifeToDays,
    addProductToStore,
    updateStoreProduct,
    getStoreProduct,
    removeProduct
};
