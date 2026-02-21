const geolib = require('geolib');
const TransportDetails = require('../../models/TransportDetails');
const User = require('../../models/User');
const ProductBatch = require('../../models/ProductBatch');

// Helper function to calculate distance and duration between two coordinates
const calculateRouteInfo = (originCoords, destCoords) => {
  try {
    // Calculate distance in meters
    const distanceInMeters = geolib.getDistance(
      { latitude: originCoords[1], longitude: originCoords[0] },
      { latitude: destCoords[1], longitude: destCoords[0] }
    );

    // Convert to kilometers
    const distanceInKm = distanceInMeters / 1000;
    
    // Estimate duration (assuming average speed of 60 km/h for driving)
    const averageSpeedKmh = 60;
    const durationInHours = distanceInKm / averageSpeedKmh;
    const durationInSeconds = Math.round(durationInHours * 3600);
    const durationInMinutes = Math.round(durationInSeconds / 60);

    // Format distance
    let distanceText;
    if (distanceInKm < 1) {
      distanceText = `${distanceInMeters} m`;
    } else {
      distanceText = `${distanceInKm.toFixed(2)} km`;
    }

    // Format duration
    let durationText;
    if (durationInMinutes < 60) {
      durationText = `${durationInMinutes} mins`;
    } else {
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;
      durationText = minutes > 0 ? `${hours} hrs ${minutes} mins` : `${hours} hrs`;
    }

    return {
      distance: distanceText,
      distanceValue: distanceInMeters,
      duration: durationText,
      durationValue: durationInSeconds
    };
  } catch (error) {
    console.warn('Route calculation error:', error.message);
    return null;
  }
};

// Create a new transport record
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
      routePreferences
    } = req.body;

    // Validate required fields
    if (!batchId || !origin || !destination || !departureTime || !estimatedArrivalTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: batchId, origin, destination, departureTime, estimatedArrivalTime'
      });
    }

    // Check if user is a distributor
    if (req.user.role !== 'ROLE_DISTRIBUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Distributors only.'
      });
    }

    // Verify the batch exists and belongs to a farmer
    const productBatch = await ProductBatch.findById(batchId);
    if (!productBatch) {
      return res.status(404).json({
        success: false,
        message: 'Product batch not found'
      });
    }

    // Create unique transport ID
    const transportId = `TRANS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate distance and duration using coordinates
    let routeInfo = null;
    if (origin.coordinates && destination.coordinates) {
      routeInfo = calculateRouteInfo(origin.coordinates, destination.coordinates);
      if (routeInfo) {
        routeInfo.startAddress = `${origin.locationName}, ${origin.address?.city || ''}, ${origin.address?.state || ''}`;
        routeInfo.endAddress = `${destination.locationName}, ${destination.address?.city || ''}, ${destination.address?.state || ''}`;
      }
    }

    // Create new transport record
    const newTransport = new TransportDetails({
      transportId,
      batchId,
      transporterId: req.user.id,
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

// Get all transports for a distributor
const getTransports = async (req, res) => {
  try {
    // Check if user is a distributor
    if (req.user.role !== 'ROLE_DISTRIBUTOR') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Distributors only.'
      });
    }

    const transports = await TransportDetails.find({ transporterId: req.user.id })
      .populate('batchId', 'batchId productName harvestDate expiryDate')
      .populate('transporterId', 'username email firstName lastName');

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

// Get a specific transport by ID
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

    // Check if user is the transporter who owns the record or is an admin
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

// Update transport status and location
const updateTransportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualArrivalTime, currentLocation, temperatureLog } = req.body;

    const transport = await TransportDetails.findById(id);
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Transport record not found'
      });
    }

    // Check if user is the transporter who owns the record or is an admin
    if (transport.transporterId.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Transport owner or admin only.'
      });
    }

    // Prepare update object
    const updateData = {};
    if (status) updateData.status = status;
    if (actualArrivalTime) updateData.actualArrivalTime = actualArrivalTime;
    if (currentLocation) {
      updateData.currentLocation = currentLocation;
      // Add to location history
      if (!updateData.locationHistory) updateData.locationHistory = [];
      updateData.locationHistory.push({
        location: currentLocation,
        timestamp: new Date()
      });
    }
    if (temperatureLog) {
      if (!updateData.temperatureLogs) updateData.temperatureLogs = [];
      updateData.temperatureLogs.push({
        ...temperatureLog,
        timestamp: new Date()
      });
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

// Track route updates using coordinates
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

    // Check if user is the transporter who owns the record or is an admin
    if (transport.transporterId.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Transport owner or admin only.'
      });
    }

    // Update current location
    const currentLocation = {
      coordinates: [lng, lat], // GeoJSON format (longitude, latitude)
      timestamp: new Date()
    };

    const updatedTransport = await TransportDetails.findByIdAndUpdate(
      id,
      { 
        currentLocation,
        $push: { 
          locationHistory: {
            location: currentLocation,
            timestamp: new Date()
          }
        },
        updatedAt: Date.now()
      },
      { new: true }
    );

    // Calculate estimated time to destination using coordinates
    let eta = null;
    if (transport.destination.coordinates) {
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

// Get route details between origin and destination
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

    // Check if user has access to this transport record
    if (
      transport.transporterId.toString() !== req.user.id && 
      transport.batchId.toString() !== req.user.id && 
      req.user.role !== 'ROLE_ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Transport owner, related parties, or admin only.'
      });
    }

    // Get route details using coordinates
    let routeDetails = null;
    if (transport.origin.coordinates && transport.destination.coordinates) {
      routeDetails = calculateRouteInfo(transport.origin.coordinates, transport.destination.coordinates);
      if (routeDetails) {
        routeDetails.startAddress = `${transport.origin.locationName}, ${transport.origin.address?.city || ''}, ${transport.origin.address?.state || ''}`;
        routeDetails.endAddress = `${transport.destination.locationName}, ${transport.destination.address?.city || ''}, ${transport.destination.address?.state || ''}`;
      }
    }

    // Return transport details with route info if available
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
  createTransport,
  getTransports,
  getTransportById,
  updateTransportStatus,
  trackRouteUpdate,
  getRouteDetails
};