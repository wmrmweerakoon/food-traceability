const express = require('express');
const router = express.Router();
const { authenticateToken, consumerOnly } = require('../../middleware/auth');
const { 
  getTraceabilityReport,
  getProductStatus,
  searchProducts
} = require('./traceabilityController');

// @route   GET api/consumer/traceability/:batchId
// @desc    Get complete traceability report for a product batch
// @access  Public (QR code scan - no login required)
router.get('/traceability/:batchId', getTraceabilityReport);

// All other consumer routes require authentication and consumer role
router.use(authenticateToken, consumerOnly);

// @route   GET api/consumer/status/:batchId
// @desc    Get simplified status of a product batch
// @access  Private (Consumer)
router.get('/status/:batchId', getProductStatus);

// @route   GET api/consumer/search
// @desc    Search for products by name or batch ID
// @access  Private (Consumer)
router.get('/search', searchProducts);

module.exports = router;