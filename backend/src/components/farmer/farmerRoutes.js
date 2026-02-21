const express = require('express');
const router = express.Router();
const { authenticateToken, farmerOnly } = require('../../middleware/auth');
const { 
  createBatch, 
  getBatches, 
  getBatchById, 
  updateBatch, 
  deleteBatch, 
  generateQRCode 
} = require('./batchController');

// All farmer routes require authentication and farmer role
router.use(authenticateToken, farmerOnly);

// @route   POST api/farmer/batches
// @desc    Create a new product batch
// @access  Private (Farmer)
router.post('/batches', createBatch);

// @route   GET api/farmer/batches
// @desc    Get all batches for the logged-in farmer
// @access  Private (Farmer)
router.get('/batches', getBatches);

// @route   GET api/farmer/batches/:id
// @desc    Get a specific batch by ID
// @access  Private (Farmer)
router.get('/batches/:id', getBatchById);

// @route   PUT api/farmer/batches/:id
// @desc    Update a batch
// @access  Private (Farmer)
router.put('/batches/:id', updateBatch);

// @route   DELETE api/farmer/batches/:id
// @desc    Delete a batch
// @access  Private (Farmer)
router.delete('/batches/:id', deleteBatch);

// @route   GET api/farmer/batches/:id/qrcode
// @desc    Generate QR code for a batch
// @access  Private (Farmer)
router.get('/batches/:id/qrcode', generateQRCode);

module.exports = router;