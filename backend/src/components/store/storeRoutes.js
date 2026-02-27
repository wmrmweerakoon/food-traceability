const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../../middleware/auth');
const {
    addToStore,
    getStoreDetails,
    updateStoreItem,
    deleteStoreItem
} = require('./storeController');

// All store routes require authentication
router.use(authenticateToken);

// @route   POST /api/store
// @desc    Add a product to store inventory
// @access  Private (Retailer)
router.post('/', authorizeRoles('ROLE_RETAILER'), addToStore);

// @route   GET /api/store/:batchId
// @desc    Get store inventory details for a batch
// @access  Private (Retailer, Admin)
router.get('/:batchId', authorizeRoles('ROLE_RETAILER', 'ROLE_ADMIN'), getStoreDetails);

// @route   PUT /api/store/:batchId
// @desc    Update a store inventory item
// @access  Private (Retailer)
router.put('/:batchId', authorizeRoles('ROLE_RETAILER'), updateStoreItem);

// @route   DELETE /api/store/:batchId
// @desc    Remove a product from store inventory
// @access  Private (Retailer)
router.delete('/:batchId', authorizeRoles('ROLE_RETAILER'), deleteStoreItem);

module.exports = router;
