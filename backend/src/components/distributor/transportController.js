const distributorService = require('./distributorService');
const TransportDetails = require('../../models/TransportDetails');
const ProductBatch = require('../../models/ProductBatch');

// ─── New spec-aligned endpoints (by batchId) ─────────────────────────────────

/**
 * POST /api/distributor/transport
 * Add initial transport info for a product batch.
 */
const addTransport = async (req, res) => {
  try {
    const savedTransport = await distributorService.addTransportInfo(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Transport record created successfully',
      data: savedTransport
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/distributor/transport/:batchId
 * View transport details for a specific batch.
 */
const getTransportByBatchId = async (req, res) => {
  try {
    const { batchId } = req.params;
    const result = await distributorService.getTransportHistory(batchId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/distributor/transport/:batchId
 * Update location, temperature, status, etc.
 */
const updateTransport = async (req, res) => {
  try {
    const { batchId } = req.params;
    const updatedTransport = await distributorService.updateLogistics(batchId, req.body, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Transport record updated successfully',
      data: updatedTransport
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * DELETE /api/distributor/transport/:batchId
 * Remove transport record for a batch.
 */
const deleteTransport = async (req, res) => {
  try {
    const { batchId } = req.params;
    const result = await distributorService.deleteTransport(batchId, req.user.id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// ─── Legacy endpoints (by transport _id) — backward compatible ────────────────

const { calculateRouteInfo } = require('./distributorService');

/**
 * POST /api/distributor/transports (legacy)
 */
const createTransport = async (req, res) => {
  try {
    const {
      batchId,
      origin,
      destination,
      departureTime,
      estimatedArrivalTime,
      vehicleDetails,
      driverDetails,
      vehicleNumber: vn,
      currentLocation: cl,
      storageTemperature: st
    } = req.body;

    if (!batchId || !origin || !destination || !departureTime || !estimatedArrivalTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: batchId, origin, destination, departureTime, estimatedArrivalTime'
      });
    }

    if (req.user.role !== 'ROLE_DISTRIBUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Distributors only.'
      });
    }

    const productBatch = await ProductBatch.findById(batchId);
    if (!productBatch) {
      return res.status(404).json({
        success: false,
        message: 'Product batch not found'
      });
    }

    const transportId = `TRANS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    let routeInfo = null;
    if (origin.coordinates && destination.coordinates) {
      routeInfo = calculateRouteInfo(origin.coordinates, destination.coordinates);
      if (routeInfo) {
        routeInfo.startAddress = `${origin.locationName}, ${origin.address?.city || ''}, ${origin.address?.state || ''}`;
        routeInfo.endAddress = `${destination.locationName}, ${destination.address?.city || ''}, ${destination.address?.state || ''}`;
      }
    }

    const newTransport = new TransportDetails({
      transportId,
      batchId,
      transporterId: req.user.id,
      vehicleNumber: vn || vehicleDetails?.vehicleNumber || 'N/A',
      currentLocation: cl || origin.locationName || 'Origin',
      storageTemperature: st !== undefined ? st : 0,
      origin,
      destination,
      departureTime,
      estimatedArrivalTime,
      vehicleDetails,
      driverDetails,
      ...routeInfo ? { routeInfo } : {}
    });

    const savedTransport = await newTransport.save();

    res.status(201).json({
      success: true,
      message: 'Transport record created successfully',
      data: savedTransport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/distributor/transports (legacy)
 */
const getTransports = async (req, res) => {
  try {
    const transports = await distributorService.getAllTransports(req.user.id);
    res.status(200).json({
      success: true,
      count: transports.length,
      data: transports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/distributor/transports/:id (legacy)
 */
const getTransportById = async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await TransportDetails.findById(id)
      .populate('batchId', 'batchId productName harvestDate expiryDate')
      .populate('transporterId', 'username email firstName lastName');

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Transport record not found'
      });
    }

    if (transport.transporterId._id.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Transport owner or admin only.'
      });
    }

    res.status(200).json({
      success: true,
      data: transport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/distributor/transports/:id (legacy)
 */
const updateTransportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualArrivalTime, currentLocation, temperatureLog, deliveryStatus, storageTemperature } = req.body;

    const transport = await TransportDetails.findById(id);
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Transport record not found'
      });
    }

    if (transport.transporterId.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Transport owner or admin only.'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;
    if (actualArrivalTime) updateData.actualArrivalTime = actualArrivalTime;
    if (currentLocation) updateData.currentLocation = currentLocation;
    if (storageTemperature !== undefined) {
      updateData.storageTemperature = storageTemperature;
      updateData.riskFlag = storageTemperature > 8 ? 'High Risk' : 'Normal';
    }
    if (temperatureLog) {
      if (!updateData.$push) updateData.$push = {};
      updateData.$push.temperatureLogs = {
        ...temperatureLog,
        timestamp: new Date()
      };
    }

    const updatedTransport = await TransportDetails.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Transport record updated successfully',
      data: updatedTransport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/distributor/transports/:id/route-update (legacy)
 */
const trackRouteUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required for location tracking'
      });
    }

    const transport = await TransportDetails.findById(id);
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Transport record not found'
      });
    }

    if (transport.transporterId.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Transport owner or admin only.'
      });
    }

    const updatedTransport = await TransportDetails.findByIdAndUpdate(
      id,
      {
        currentLocation: `${lat}, ${lng}`,
        updatedAt: Date.now()
      },
      { new: true }
    );

    let eta = null;
    if (transport.destination?.coordinates) {
      const routeInfo = calculateRouteInfo([lng, lat], transport.destination.coordinates);
      if (routeInfo) {
        eta = {
          distance: routeInfo.distance,
          duration: routeInfo.duration,
          timestamp: new Date()
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...updatedTransport.toObject(),
        ...(eta ? { estimatedTimeToDestination: eta } : {})
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/distributor/transports/:id/route-details (legacy)
 */
const getRouteDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await TransportDetails.findById(id);
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Transport record not found'
      });
    }

    if (
      transport.transporterId.toString() !== req.user.id &&
      req.user.role !== 'ROLE_ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Transport owner or admin only.'
      });
    }

    let routeDetails = null;
    if (transport.origin?.coordinates && transport.destination?.coordinates) {
      routeDetails = calculateRouteInfo(transport.origin.coordinates, transport.destination.coordinates);
      if (routeDetails) {
        routeDetails.startAddress = `${transport.origin.locationName}, ${transport.origin.address?.city || ''}, ${transport.origin.address?.state || ''}`;
        routeDetails.endAddress = `${transport.destination.locationName}, ${transport.destination.address?.city || ''}, ${transport.destination.address?.state || ''}`;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...transport.toObject(),
        ...(routeDetails ? { routeDetails } : {})
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
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
};