const express = require('express');
const router = express.Router();
const { authenticateToken, retailerOnly } = require('../../middleware/auth');
const { 
  addProductToInventory,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  validateProductExpiry
} = require('./inventoryController');

// All retailer routes require authentication and retailer role
router.use(authenticateToken, retailerOnly);

// @route   POST api/retailer/inventory
// @desc    Add a product to store inventory
// @access  Private (Retailer)
router.post('/inventory', addProductToInventory);

// @route   GET api/retailer/inventory
// @desc    Get all inventory items for the logged-in retailer
// @access  Private (Retailer)
router.get('/inventory', getInventoryItems);

// @route   GET api/retailer/inventory/:id
// @desc    Get a specific inventory item by ID
// @access  Private (Retailer)
router.get('/inventory/:id', getInventoryItemById);

// @route   PUT api/retailer/inventory/:id
// @desc    Update an inventory item
// @access  Private (Retailer)
router.put('/inventory/:id', updateInventoryItem);

// @route   POST api/retailer/validate-expiry
// @desc    Validate product expiry date using OpenFoodFacts API
// @access  Private (Retailer)
router.post('/validate-expiry', validateProductExpiry);

module.exports = router;