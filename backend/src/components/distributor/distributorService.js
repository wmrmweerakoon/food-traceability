const mongoose = require('mongoose');
const TransportDetails = require('../../models/TransportDetails');
const ProductBatch = require('../../models/ProductBatch');
const geolib = require('geolib');
const axios = require('axios');

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
 * Validate a location string using Google Maps Geocoding API.
 * Falls back to original string if GOOGLE_MAPS_API_KEY is not defined.
 */
const validateLocationWithMaps = async (locationString) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: { format: 'json', q: locationString, limit: 1 },
            headers: { 'User-Agent': 'Food-Traceability-App-Student-Project' }
        });
        return response.data[0]?.display_name || locationString;
    } catch (error) {
        console.warn('Map Geocoding failed, falling back:', error.message);
        return locationString;
    }
};

/**
 * Enriches a fully structured location object with actual Google Maps coordinates
 * Prevents the marker from showing up at [0,0] (Null Island in the ocean).
 */
const enrichLocationData = async (locationObj) => {
    if (!locationObj || !locationObj.locationName) return locationObj;
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: { format: 'json', q: locationObj.locationName, limit: 1 },
            headers: { 'User-Agent': 'Food-Traceability-App-Student-Project' }
        });
        const result = response.data[0];
        if (result) {
            return {
                ...locationObj,
                locationName: result.display_name,
                // GeoJSON format is [longitude, latitude]
                coordinates: [parseFloat(result.lon), parseFloat(result.lat)]
            };
        }
    } catch (error) {
        console.warn('Map enrichment failed:', error.message);
    }
    return locationObj;
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
    const productBatch = await ProductBatch.findOne({ batchId: batchId });
    if (!productBatch) {
        const error = new Error('Product batch not found. Cannot create transport for a non-existent batch.');
        error.statusCode = 404;
        throw error;
    }

    // 3. Check if transport already exists for this batch
    const existingTransport = await TransportDetails.findOne({ batchId: productBatch._id });
    if (existingTransport) {
        const error = new Error('Transport record already exists for this batch. Use PUT to update.');
        error.statusCode = 409;
        throw error;
    }

    // 4. Validate location string via Maps
    const validatedLocation = await validateLocationWithMaps(currentLocation);
    
    // 4.1 Lookup coordinates for initial location
    let initialCoords = null;
    try {
        const geoResp = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: { format: 'json', q: currentLocation, limit: 1 },
            headers: { 'User-Agent': 'Food-Traceability-App-Student-Project' }
        });
        if (geoResp.data[0]) {
            initialCoords = [parseFloat(geoResp.data[0].lon), parseFloat(geoResp.data[0].lat)];
        }
    } catch (e) { console.warn("Initial location geocode failed", e.message); }

    // 4.2 Enrich origin and destination coordinates via Maps
    const enrichedOrigin = await enrichLocationData(origin);
    const enrichedDestination = await enrichLocationData(destination);

    // 5. Evaluate risk flag
    const riskFlag = evaluateRiskFlag(storageTemperature);

    // 6. Calculate route info if coordinates provided
    let routeInfo = null;
    if (enrichedOrigin?.coordinates && enrichedDestination?.coordinates) {
        routeInfo = calculateRouteInfo(enrichedOrigin.coordinates, enrichedDestination.coordinates);
        if (routeInfo) {
            routeInfo.startAddress = `${enrichedOrigin.locationName || ''}, ${enrichedOrigin.address?.city || ''}, ${enrichedOrigin.address?.state || ''}`;
            routeInfo.endAddress = `${enrichedDestination.locationName || ''}, ${enrichedDestination.address?.city || ''}, ${enrichedDestination.address?.state || ''}`;
        }
    }

    // 7. Create unique transport ID
    const transportId = `TRANS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 8. Build and save transport record
    const newTransport = new TransportDetails({
        transportId,
        batchId: productBatch._id,
        transporterId: userId,
        vehicleNumber,
        currentLocation: validatedLocation,
        storageTemperature,
        deliveryStatus: 'Pending',
        riskFlag,
        warehouseLocation: warehouseLocation || undefined,
        origin: enrichedOrigin,
        destination: enrichedDestination,
        departureTime,
        estimatedArrivalTime,
        vehicleDetails,
        driverDetails,
        temperatureLogs: [{
            timestamp: new Date(),
            temperature: storageTemperature,
            location: {
                type: 'Point',
                coordinates: initialCoords || enrichedOrigin?.coordinates || [0, 0]
            }
        }]
    });

    const savedTransport = await newTransport.save();
    return savedTransport;
};

/**
 * Update logistics for an existing transport record (by batchId).
 * Handles temperature monitoring, location updates, and status transitions.
 */
const updateLogistics = async (batchIdInput, updateData, userId) => {
    const batchId = await resolveBatchId(batchIdInput);
    
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
        conditionNotes,
        origin,
        destination,
        departureTime,
        estimatedArrivalTime,
        latitude,
        longitude
    } = updateData;

    // 3. Build update object
    const update = {};

    // Update origin/destination with geocoding
    if (origin && origin.locationName !== transport.origin?.locationName) {
        update.origin = await enrichLocationData(origin);
    }
    if (destination && destination.locationName !== transport.destination?.locationName) {
        update.destination = await enrichLocationData(destination);
    }
    if (departureTime) update.departureTime = departureTime;
    if (estimatedArrivalTime) update.estimatedArrivalTime = estimatedArrivalTime;

    // Determine current point
    let currentPoint = null;
    if (latitude && longitude) {
        currentPoint = {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
    } else if (currentLocation) {
        // Fallback: Geocode the currentLocation string if no lat/lng provided
        try {
            const geoResp = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: { format: 'json', q: currentLocation, limit: 1 },
                headers: { 'User-Agent': 'Food-Traceability-App-Student-Project' }
            });
            if (geoResp.data[0]) {
                currentPoint = {
                    type: 'Point',
                    coordinates: [parseFloat(geoResp.data[0].lon), parseFloat(geoResp.data[0].lat)]
                };
            }
        } catch (e) { console.warn("Log geocode failed", e.message); }
    }

    // Update risk assessment if temperature provided
    if (storageTemperature !== undefined) {
        update.storageTemperature = storageTemperature;
        update.riskFlag = evaluateRiskFlag(storageTemperature);
    }

    // Always create a log entry if we have EITHER a temperature OR a location update
    if (storageTemperature !== undefined || currentPoint) {
        if (!update.$push) update.$push = {};
        update.$push.temperatureLogs = {
            timestamp: new Date(),
            temperature: storageTemperature !== undefined ? storageTemperature : transport.storageTemperature,
            ...(currentPoint ? { location: currentPoint } : {})
        };
    }

    // Update location name if provided
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

    // 4. Status flow validation & Normalization
    if (deliveryStatus) {
        // Normalize status to match Mongoose Enum (Pending, In-Transit, Delivered, Cancelled)
        let normalizedStatus = deliveryStatus;
        if (deliveryStatus.toLowerCase() === 'pending') normalizedStatus = 'Pending';
        if (deliveryStatus.toLowerCase() === 'in-transit') normalizedStatus = 'In-Transit';
        if (deliveryStatus.toLowerCase() === 'delivered') normalizedStatus = 'Delivered';
        if (deliveryStatus.toLowerCase() === 'cancelled') normalizedStatus = 'Cancelled';

        // Simplify "Delivered" flow: Auto-set dates/locations if missing
        if (normalizedStatus === 'Delivered') {
            const effectiveDeliveryDate = deliveryDate || update.deliveryDate || transport.deliveryDate || new Date();
            const effectiveWarehouse = warehouseLocation || update.warehouseLocation || transport.warehouseLocation || transport.destination?.locationName;

            update.actualArrivalTime = effectiveDeliveryDate;
            update.deliveryDate = effectiveDeliveryDate;
            update.warehouseLocation = effectiveWarehouse;
        }
        update.deliveryStatus = normalizedStatus;
    }

    update.updatedAt = Date.now();

    // 5. Apply update
    const updatedTransport = await TransportDetails.findOneAndUpdate(
        { batchId },
        update,
        { returnDocument: 'after', runValidators: true }
    )
        .populate('batchId', 'batchId productName harvestDate expiryDate')
        .populate('transporterId', 'username email firstName lastName');

    return updatedTransport;
};

/**
 * Helper to resolve human-readable batchId string to MongoDB ObjectId
 */
const resolveBatchId = async (batchId) => {
    // If it's already a valid ObjectId string, return it
    if (mongoose.Types.ObjectId.isValid(batchId)) return batchId;
    
    // Otherwise, find the ProductBatch by its human-readable batchId string
    const batch = await ProductBatch.findOne({ batchId });
    if (!batch) {
        const error = new Error(`Product batch with ID ${batchId} not found`);
        error.statusCode = 404;
        throw error;
    }
    return batch._id;
};

/**
 * Retrieve the full transport/logistics history for a specific batch.
 */
const getTransportHistory = async (batchIdInput) => {
    const batchId = await resolveBatchId(batchIdInput);
    const transport = await TransportDetails.findOne({ batchId })
        .populate('batchId', 'batchId productName harvestDate expiryDate quantity unit qualityGrade farmLocation')
        .populate('transporterId', 'username email firstName lastName');

    if (!transport) {
        const error = new Error('No transport records found for this product batch');
        error.statusCode = 404;
        throw error;
    }

    return {
        transportId: transport.transportId,
        batchInfo: transport.batchId,
        transporter: transport.transporterId,
        origin: transport.origin,
        destination: transport.destination,
        currentStatus: transport.deliveryStatus,
        riskLevel: transport.riskFlag,
        telemetry: transport.temperatureLogs
    };
};

/**
 * Delete a transport record.
 */
const deleteTransport = async (batchIdInput, userId) => {
    const batchId = await resolveBatchId(batchIdInput);
    const transport = await TransportDetails.findOne({ batchId });
    
    if (!transport) {
        const error = new Error('Transport record not found');
        error.statusCode = 404;
        throw error;
    }

    if (transport.transporterId.toString() !== userId.toString()) {
        const error = new Error('Access denied. Only the assigned transporter can delete this log.');
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
        .populate({
            path: 'batchId',
            select: 'batchId productName harvestDate expiryDate farmerId',
            populate: {
                path: 'farmerId',
                select: 'firstName lastName username'
            }
        })
        .populate('transporterId', 'username email firstName lastName');

    return transports;
};

/**
 * Get all available product batches not currently assigned to a transport.
 */
const getAvailableBatches = async () => {
    const transports = await TransportDetails.find().select('batchId');
    const assignedBatchIds = transports.map(t => t.batchId);
    
    return await ProductBatch.find({ _id: { $nin: assignedBatchIds } })
                             .populate('farmerId', 'firstName lastName username')
                             .select('batchId productName harvestDate expiryDate quantity farmerId');
};

module.exports = {
    addTransportInfo,
    updateLogistics,
    getTransportHistory,
    deleteTransport,
    getAllTransports,
    getAvailableBatches,
    calculateRouteInfo,
    validateLocationWithMaps,
    evaluateRiskFlag,
    TEMPERATURE_THRESHOLD
};
