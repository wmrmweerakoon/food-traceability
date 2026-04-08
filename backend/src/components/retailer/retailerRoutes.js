const express = require('express');
const router = express.Router();

const { authenticateToken, retailerOnly } = require('../../middleware/auth');

const {
    addProductToInventory,
    getInventoryItems,
    getInventoryItemById,
    updateInventoryItem,
    deleteInventoryItem,
    validateProductExpiry,
    getRetailerStores,
    getAvailableBatches
} = require('./inventoryController');


// All retailer routes require authentication + retailer role
router.use(authenticateToken, retailerOnly);


// Add product to inventory
// POST api/retailer/inventory
router.post('/inventory', addProductToInventory);


// Get all inventory items for logged-in retailer
// GET api/retailer/inventory
router.get('/inventory', getInventoryItems);


// Get single inventory item by ID
// GET api/retailer/inventory/:id
router.get('/inventory/:id', getInventoryItemById);


// Update inventory item
// PUT api/retailer/inventory/:id
router.put('/inventory/:id', updateInventoryItem);


// Delete inventory item
// DELETE api/retailer/inventory/:id
router.delete('/inventory/:id', deleteInventoryItem);


// Validate product expiry using OpenFoodFacts API
// POST api/retailer/validate-expiry
router.post('/validate-expiry', validateProductExpiry);


// Get retailer's stores
router.get('/stores', getRetailerStores);


// Get available product batches
router.get('/batches', getAvailableBatches);


module.exports = router;