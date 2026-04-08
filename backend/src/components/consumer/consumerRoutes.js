const express = require('express');
const router = express.Router();
const { authenticateToken, consumerOnly } = require('../../middleware/auth');
const { 
  getTraceabilityReport,
  generateQRCode
} = require('./traceabilityController');

const consumerController = require('./consumerController');

// Public Consumer Routes
router.post('/login', consumerController.login);
router.post('/register', consumerController.register);

// The traceability endpoints could be public, but project structure might prefer protected ones. 
// Given the requirements "GET /api/consumer/trace/:batchId: Public access (or protected)" Let's make it public for now since tracing via QR scan might happen without logging in.
router.get('/trace/:batchId', getTraceabilityReport);

// Protected routes
router.use(authenticateToken, consumerOnly);

// Consumer Profile Management
router.get('/:id', consumerController.getProfile);
router.put('/:id', consumerController.updateProfile);
router.delete('/:id', consumerController.deleteAccount);

// Generates QR Code to the trace route
router.get('/qrcode/:batchId', generateQRCode);

// --- New Consumer Feedback Routes ---
// Submit feedback for a product batch
router.post('/feedback/:batchId', consumerController.submitFeedback || require('./traceabilityController').submitFeedback);

// Get all feedback for a specific product batch
router.get('/feedback/:batchId', consumerController.getFeedback || require('./traceabilityController').getFeedback);

// Generate 3rd Party QR code for feedback 
router.get('/qrcode-feedback/:batchId', consumerController.generateFeedbackQRCode || require('./traceabilityController').generateFeedbackQRCode);

module.exports = router;