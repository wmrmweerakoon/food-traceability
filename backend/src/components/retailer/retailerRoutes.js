const express = require('express');
const router = express.Router();

const { authenticateToken, retailerOnly } = require('../../middleware/auth');

const {
    addProductToInventory,
    getInventoryItems,
    getInventoryItemById,
    updateInventoryItem,
    deleteInventoryItem,
    getRetailerStores,
    getAvailableBatches,
    getIncomingShipments,
    getItemByBatchId,
    updateItemByBatchId,
    deleteItemByBatchId,
    sellProductByBatchId,
    createStore,
    updateStore,
    deleteStore,
    getGlobalPricing
} = require('./inventoryController');


// All retailer routes require authentication + retailer role
router.use(authenticateToken, retailerOnly);


// --- Standard Inventory Routes (UI Compatibility) ---
router.post('/inventory', addProductToInventory);
router.get('/inventory', getInventoryItems);
router.get('/inventory/:id', getInventoryItemById);
router.put('/inventory/:id', updateInventoryItem);
router.delete('/inventory/:id', deleteInventoryItem);

// --- Strict Functional Requirements (Matching Project Spec) ---
// POST /store Add Product to Store
router.post('/store', addProductToInventory);
// GET /store/:batchId View Store Product
router.get('/store/:batchId', getItemByBatchId);
// PUT /store/:batchId Update Store Details
router.put('/store/:batchId', updateItemByBatchId);
// DELETE /store/:batchId Remove Product
router.delete('/store/:batchId', deleteItemByBatchId);
// POST /store/:batchId/sell Sell Product
router.post('/store/:batchId/sell', sellProductByBatchId);


// --- Additional Utility Routes ---
router.get('/incoming-shipments', getIncomingShipments);
router.get('/stores', getRetailerStores);
router.post('/stores', createStore);
router.put('/stores/:id', updateStore);
router.delete('/stores/:id', deleteStore);
router.get('/batches', getAvailableBatches);
router.get('/global-pricing', getGlobalPricing);


module.exports = router;