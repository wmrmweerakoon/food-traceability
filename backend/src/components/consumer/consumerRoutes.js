const express = require('express');
const router = express.Router();
const { authenticateToken, consumerOnly } = require('../../middleware/auth');
const { 
  getTraceabilityReport,
  generateQRCode,
  submitFeedback,
  getFeedback,
  generateFeedbackQRCode
} = require('./traceabilityController');
const consumerController = require('./consumerController');

// ===== Public Routes (no login required) =====

// Consumer login and register
router.post('/login', consumerController.login);
router.post('/register', consumerController.register);

// @route   GET api/consumer/trace/:batchId
// @desc    Get complete traceability report for a product batch
// @access  Public (QR code scan - no login required)
router.get('/trace/:batchId', getTraceabilityReport);

// ===== Protected Routes (consumer login required) =====
router.use(authenticateToken, consumerOnly);

// Consumer Profile Management
router.get('/:id', consumerController.getProfile);
router.put('/:id', consumerController.updateProfile);
router.delete('/:id', consumerController.deleteAccount);

// Generate QR Code for a batch
router.get('/qrcode/:batchId', generateQRCode);

// Consumer Feedback Routes
router.post('/feedback/:batchId', submitFeedback);
router.get('/feedback/:batchId', getFeedback);
router.get('/qrcode-feedback/:batchId', generateFeedbackQRCode);

module.exports = router;