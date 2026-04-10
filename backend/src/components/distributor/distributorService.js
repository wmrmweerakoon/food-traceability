const TransportDetails = require('../../models/TransportDetails');
const ProductBatch = require('../../models/ProductBatch');
const geolib = require('geolib');

// Temperature threshold in °C — batches above this are flagged "High Risk"
const TEMPERATURE_THRESHOLD = 8;

/**
 * Calculate distance and duration between two coordinate pairs.
 * Uses geolib for offline route estimation (no external API needed).
 */
const calculateRouteInfo = (originCoords, destCoords) => {
    try {
        const distanceInMeters = geolib.getDistance(
            { latitude: originCoords[1], longitude: originCoords[0] },
            { latitude: destCoords[1], longitude: destCoords[0] }
        );

        const distanceInKm = distanceInMeters / 1000;
        const averageSpeedKmh = 60;
        const durationInHours = distanceInKm / averageSpeedKmh;
        const durationInSeconds = Math.round(durationInHours * 3600);
        const durationInMinutes = Math.round(durationInSeconds / 60);

        let distanceText;
        if (distanceInKm < 1) {
            distanceText = `${distanceInMeters} m`;
        } else {
            distanceText = `${distanceInKm.toFixed(2)} km`;
        }

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

/**
 * Validate a location string using Google Maps Geocoding API (stub).
 * Currently returns the string as-is. Replace with real API call when
 * GOOGLE_MAPS_API_KEY is configured in .env.
 */
const validateLocationWithMaps = async (locationString) => {
    // Stub: In production, call Google Maps Geocoding API here
    // const response = await axios.get(
    //   `https://maps.googleapis.com/maps/api/geocode/json`,
    //   { params: { address: locationString, key: process.env.GOOGLE_MAPS_API_KEY } }
    // );
    // return response.data.results[0]?.formatted_address || locationString;
    return locationString;
};

/**
 * Evaluate risk flag based on storage temperature.
 */
const evaluateRiskFlag = (temperature) => {
    return temperature > TEMPERATURE_THRESHOLD ? 'High Risk' : 'Normal';
};

/**
 * Add initial transport info for a product batch.
 * Validates that the batchId exists in ProductBatch before creating.
 */
const addTransportInfo = async (data, userId) => {
    const {
        batchId,
        vehicleNumber,
        currentLocation,
        storageTemperature,
        origin,
        destination,
        departureTime,
        estimatedArrivalTime,
        vehicleDetails,
        driverDetails,
        warehouseLocation
    } = data;

    // 1. Validate required fields
    if (!batchId || !vehicleNumber || !currentLocation || storageTemperature === undefined) {
        const error = new Error('Missing required fields: batchId, vehicleNumber, currentLocation, storageTemperature');
        error.statusCode = 400;
        throw error;
    }

    // 2. Verify the batch exists
    const productBatch = await ProductBatch.findById(batchId);
    if (!productBatch) {
        const error = new Error('Product batch not found. Cannot create transport for a non-existent batch.');
        error.statusCode = 404;
        throw error;
    }

    // 3. Check if transport already exists for this batch
    const existingTransport = await TransportDetails.findOne({ batchId });
    if (existingTransport) {
        const error = new Error('Transport record already exists for this batch. Use PUT to update.');
        error.statusCode = 409;
        throw error;
    }

    // 4. Validate location string via Google Maps (stub)
    const validatedLocation = await validateLocationWithMaps(currentLocation);

    // 5. Evaluate risk flag
    const riskFlag = evaluateRiskFlag(storageTemperature);

    // 6. Calculate route info if coordinates provided
    let routeInfo = null;
    if (origin?.coordinates && destination?.coordinates) {
        routeInfo = calculateRouteInfo(origin.coordinates, destination.coordinates);
        if (routeInfo) {
            routeInfo.startAddress = `${origin.locationName || ''}, ${origin.address?.city || ''}, ${origin.address?.state || ''}`;
            routeInfo.endAddress = `${destination.locationName || ''}, ${destination.address?.city || ''}, ${destination.address?.state || ''}`;
        }
    }

    // 7. Create unique transport ID
    const transportId = `TRANS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 8. Build and save transport record
    const newTransport = new TransportDetails({
        transportId,
        batchId,
        transporterId: userId,
        vehicleNumber,
        currentLocation: validatedLocation,
        storageTemperature,
        deliveryStatus: 'Pending',
        riskFlag,
        warehouseLocation: warehouseLocation || undefined,
        origin,
        destination,
        departureTime,
        estimatedArrivalTime,
        vehicleDetails,
        driverDetails,
        temperatureLogs: [{
            timestamp: new Date(),
            temperature: storageTemperature
        }]
    });

    const savedTransport = await newTransport.save();
    return savedTransport;
};

/**
 * Update logistics for an existing transport record (by batchId).
 * Handles temperature monitoring, location updates, and status transitions.
 */
const updateLogistics = async (batchId, updateData, userId) => {
    // 1. Find the transport record
    const transport = await TransportDetails.findOne({ batchId });
    if (!transport) {
        const error = new Error('Transport record not found for this batch.');
        error.statusCode = 404;
        throw error;
    }

    // 2. Verify ownership
    if (transport.transporterId.toString() !== userId) {
        const error = new Error('Access denied. You can only update your own transport records.');
        error.statusCode = 403;
        throw error;
    }

    const {
        storageTemperature,
        currentLocation,
        deliveryStatus,
        warehouseLocation,
        deliveryDate,
        vehicleNumber,
        conditionNotes
    } = updateData;

    // 3. Build update object
    const update = {};

    // Update temperature and re-evaluate risk
    if (storageTemperature !== undefined) {
        update.storageTemperature = storageTemperature;
        update.riskFlag = evaluateRiskFlag(storageTemperature);

        // Append to temperature logs
        if (!update.$push) update.$push = {};
        update.$push.temperatureLogs = {
            timestamp: new Date(),
            temperature: storageTemperature,
            ...(currentLocation ? { location: currentLocation } : {})
        };
    }

    // Update location
    if (currentLocation) {
        const validatedLocation = await validateLocationWithMaps(currentLocation);
        update.currentLocation = validatedLocation;
    }

    // Update vehicle number
    if (vehicleNumber) {
        update.vehicleNumber = vehicleNumber;
    }

    // Update condition notes
    if (conditionNotes !== undefined) {
        update.conditionNotes = conditionNotes;
    }

    // Update warehouse location
    if (warehouseLocation) {
        update.warehouseLocation = warehouseLocation;
    }

    // Update delivery date
    if (deliveryDate) {
        update.deliveryDate = deliveryDate;
    }

    // 4. Status flow validation
    if (deliveryStatus) {
        // Cannot mark "Delivered" without deliveryDate and warehouseLocation
        if (deliveryStatus === 'Delivered') {
            const effectiveDeliveryDate = deliveryDate || update.deliveryDate || transport.deliveryDate;
            const effectiveWarehouse = warehouseLocation || update.warehouseLocation || transport.warehouseLocation;

            if (!effectiveDeliveryDate || !effectiveWarehouse) {
                const error = new Error(
                    'Cannot mark as "Delivered" without both deliveryDate and warehouseLocation. ' +
                    'Please provide these fields.'
                );
                error.statusCode = 400;
                throw error;
            }

            update.actualArrivalTime = effectiveDeliveryDate;
        }
        update.deliveryStatus = deliveryStatus;
    }

    update.updatedAt = Date.now();

    // 5. Apply update
    const updatedTransport = await TransportDetails.findOneAndUpdate(
        { batchId },
        update,
        { new: true, runValidators: true }
    )
        .populate('batchId', 'batchId productName harvestDate expiryDate')
        .populate('transporterId', 'username email firstName lastName');

    return updatedTransport;
};

/**
 * Retrieve the full transport/logistics history for a specific batch.
 */
const getTransportHistory = async (batchId) => {
    const transport = await TransportDetails.findOne({ batchId })
        .populate('batchId', 'batchId productName harvestDate expiryDate quantity unit qualityGrade farmLocation')
        .populate('transporterId', 'username email firstName lastName contactNumber');

    if (!transport) {
        const error = new Error('No transport record found for this batch.');
        error.statusCode = 404;
        throw error;
    }

    // Calculate route details if coordinates are available
    let routeDetails = null;
    if (transport.origin?.coordinates && transport.destination?.coordinates) {
        routeDetails = calculateRouteInfo(transport.origin.coordinates, transport.destination.coordinates);
        if (routeDetails) {
            routeDetails.startAddress = `${transport.origin.locationName || ''}, ${transport.origin.address?.city || ''}, ${transport.origin.address?.state || ''}`;
            routeDetails.endAddress = `${transport.destination.locationName || ''}, ${transport.destination.address?.city || ''}, ${transport.destination.address?.state || ''}`;
        }
    }

    return {
        transport: transport.toObject(),
        routeDetails
    };
};

/**
 * Delete a transport record by batchId. Only the owner can delete.
 */
const deleteTransport = async (batchId, userId) => {
    const transport = await TransportDetails.findOne({ batchId });

    if (!transport) {
        const error = new Error('Transport record not found for this batch.');
        error.statusCode = 404;
        throw error;
    }

    // Verify ownership
    if (transport.transporterId.toString() !== userId) {
        const error = new Error('Access denied. You can only delete your own transport records.');
        error.statusCode = 403;
        throw error;
    }

    await TransportDetails.findOneAndDelete({ batchId });
    return { message: 'Transport record deleted successfully' };
};

/**
 * Get all transports for a specific distributor.
 */
const getAllTransports = async (userId) => {
    const transports = await TransportDetails.find({ transporterId: userId })
        .populate('batchId', 'batchId productName harvestDate expiryDate')
        .populate('transporterId', 'username email firstName lastName');

    return transports;
};

module.exports = {
    addTransportInfo,
    updateLogistics,
    getTransportHistory,
    deleteTransport,
    getAllTransports,
    calculateRouteInfo,
    validateLocationWithMaps,
    evaluateRiskFlag,
    TEMPERATURE_THRESHOLD
};
