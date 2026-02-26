const storeService = require('./storeService');

/**
 * POST /api/store
 * Add a product to a retail store's inventory.
 * Body: { batchId, storeId, shelfDate?, expiryDate? }
 */
const addToStore = async (req, res) => {
    try {
        const { batchId, storeId, shelfDate, expiryDate } = req.body;

        if (!batchId || !storeId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: batchId, storeId'
            });
        }

        const result = await storeService.addProductToStore(batchId, storeId, shelfDate, expiryDate);

        res.status(201).json({
            success: true,
            message: 'Product added to store successfully',
            data: result
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404
            : error.message.includes('exceeds') ? 400
                : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET /api/store/:batchId
 * Get store inventory details for a specific batch.
 */
const getStoreDetails = async (req, res) => {
    try {
        const { batchId } = req.params;

        const inventoryItem = await storeService.getStoreProduct(batchId);

        res.status(200).json({
            success: true,
            data: inventoryItem
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * PUT /api/store/:batchId
 * Update a store inventory item (e.g. mark as sold).
 * Body: { isAvailable?, shelfDate?, expiryDate? }
 */
const updateStoreItem = async (req, res) => {
    try {
        const { batchId } = req.params;
        const updateData = req.body;

        const updatedItem = await storeService.updateStoreProduct(batchId, updateData);

        res.status(200).json({
            success: true,
            message: 'Store item updated successfully',
            data: updatedItem
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * DELETE /api/store/:batchId
 * Remove a product from the store inventory.
 */
const deleteStoreItem = async (req, res) => {
    try {
        const { batchId } = req.params;

        const result = await storeService.removeProduct(batchId);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addToStore,
    getStoreDetails,
    updateStoreItem,
    deleteStoreItem
};
