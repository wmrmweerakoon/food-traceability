const express = require('express');
const router = express.Router();
const { authenticateToken, distributorOnly } = require('../../middleware/auth');
const {
  // New spec endpoints
  addTransport,
  getTransportByBatchId,
  updateTransport,
  deleteTransport,
  // Legacy endpoints
  createTransport,
  getTransports,
  getTransportById,
  updateTransportStatus,
  trackRouteUpdate,
  getRouteDetails
} = require('./transportController');

// All distributor routes require authentication and distributor role
router.use(authenticateToken, distributorOnly);

// ─── New spec-aligned endpoints (by batchId) ─────────────────────────────────

// @route   POST api/distributor/transport
// @desc    Add initial transport info for a product batch
// @access  Private (Distributor)
router.post('/transport', addTransport);

// @route   GET api/distributor/transport/:batchId
// @desc    View transport details for a batch
// @access  Private (Distributor)
router.get('/transport/:batchId', getTransportByBatchId);

// @route   PUT api/distributor/transport/:batchId
// @desc    Update location, temperature, or status
// @access  Private (Distributor)
router.put('/transport/:batchId', updateTransport);

// @route   DELETE api/distributor/transport/:batchId
// @desc    Remove transport record for a batch
// @access  Private (Distributor)
router.delete('/transport/:batchId', deleteTransport);

// ─── Legacy endpoints (by transport _id) — backward compatible ────────────────

// @route   POST api/distributor/transports
// @desc    Create a new transport record (legacy)
// @access  Private (Distributor)
router.post('/transports', createTransport);

// @route   GET api/distributor/transports
// @desc    Get all transports for the logged-in distributor
// @access  Private (Distributor)
router.get('/transports', getTransports);

// @route   GET api/distributor/transports/:id
// @desc    Get a specific transport by ID
// @access  Private (Distributor)
router.get('/transports/:id', getTransportById);

// @route   PUT api/distributor/transports/:id
// @desc    Update a transport status
// @access  Private (Distributor)
router.put('/transports/:id', updateTransportStatus);

// @route   PUT api/distributor/transports/:id/route-update
// @desc    Update route information and track transport
// @access  Private (Distributor)
router.put('/transports/:id/route-update', trackRouteUpdate);

// @route   GET api/distributor/transports/:id/route-details
// @desc    Get route details between origin and destination
// @access  Private (Distributor)
router.get('/transports/:id/route-details', getRouteDetails);

module.exports = router;