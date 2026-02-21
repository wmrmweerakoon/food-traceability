const ProductBatch = require('../../models/ProductBatch');
const TransportDetails = require('../../models/TransportDetails');
const StoreInventory = require('../../models/StoreInventory');
const User = require('../../models/User');

// Traceability Engine - Aggregates data from all services based on batchId
const getTraceabilityReport = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required for traceability report'
      });
    }

    // Find the product batch information
    let productBatch;
    if (batchId.match(/^[0-9a-fA-F]{24}$/)) {
      // If batchId is an ObjectId, search by _id
      productBatch = await ProductBatch.findById(batchId)
        .populate('farmerId', 'username email firstName lastName contactNumber address');
    } else {
      // Otherwise, search by batchId field
      productBatch = await ProductBatch.findOne({ batchId })
        .populate('farmerId', 'username email firstName lastName contactNumber address');
    }

    if (!productBatch) {
      return res.status(404).json({
        success: false,
        message: 'Product batch not found'
      });
    }

    // Find all transport records for this batch
    const transportRecords = await TransportDetails.find({ batchId: productBatch._id })
      .populate('transporterId', 'username email firstName lastName contactNumber')
      .sort({ departureTime: 1 }); // Sort by departure time chronologically

    // Find all store inventory records for this batch
    const inventoryRecords = await StoreInventory.find({ 
      'batchDetails.batchId': productBatch._id 
    })
      .populate('retailerId', 'username email firstName lastName contactNumber')
      .populate('productId', 'productName batchId');

    // Compile traceability report
    const traceabilityReport = {
      batchInfo: {
        _id: productBatch._id,
        batchId: productBatch.batchId,
        productName: productBatch.productName,
        productImage: productBatch.productImage,
        quantity: productBatch.quantity,
        unit: productBatch.unit,
        qualityGrade: productBatch.qualityGrade,
        organicCertified: productBatch.organicCertified,
        pesticideResidue: productBatch.pesticideResidue,
        status: productBatch.status,
        notes: productBatch.notes,
        createdAt: productBatch.createdAt,
        updatedAt: productBatch.updatedAt
      },
      farmerInfo: {
        ...productBatch.farmerId.toObject(),
        harvestDate: productBatch.harvestDate,
        expiryDate: productBatch.expiryDate,
        farmLocation: productBatch.farmLocation,
        processingDetails: productBatch.processingDetails,
        storageConditions: productBatch.storageConditions
      },
      transportHistory: transportRecords.map(transport => ({
        transportId: transport.transportId,
        transporter: {
          name: `${transport.transporterId.firstName} ${transport.transporterId.lastName}`,
          contact: transport.transporterId.contactNumber,
          email: transport.transporterId.email
        },
        origin: transport.origin,
        destination: transport.destination,
        departureTime: transport.departureTime,
        estimatedArrivalTime: transport.estimatedArrivalTime,
        actualArrivalTime: transport.actualArrivalTime,
        vehicleDetails: transport.vehicleDetails,
        driverDetails: transport.driverDetails,
        temperatureLogs: transport.temperatureLogs,
        conditionNotes: transport.conditionNotes,
        status: transport.status,
        routeInfo: transport.routeInfo,
        documents: transport.documents,
        createdAt: transport.createdAt,
        updatedAt: transport.updatedAt
      })),
      retailLocations: inventoryRecords.map(inventory => ({
        retailer: {
          name: `${inventory.retailerId.firstName} ${inventory.retailerId.lastName}`,
          contact: inventory.retailerId.contactNumber,
          email: inventory.retailerId.email,
          storeName: inventory.location?.storeName,
          storeAddress: inventory.location?.address
        },
        sku: inventory.sku,
        productName: inventory.productName,
        category: inventory.category,
        brand: inventory.brand,
        quantityAvailable: inventory.quantityAvailable,
        unitPrice: inventory.unitPrice,
        currency: inventory.currency,
        qualityStatus: inventory.qualityStatus,
        status: inventory.status,
        location: inventory.location,
        lastRestocked: inventory.lastRestocked,
        lastSold: inventory.lastSold,
        createdAt: inventory.createdAt,
        updatedAt: inventory.updatedAt
      })),
      timeline: generateTimeline(productBatch, transportRecords, inventoryRecords),
      summary: {
        totalTransportSteps: transportRecords.length,
        totalRetailLocations: inventoryRecords.length,
        totalJourneyDays: calculateTotalJourneyDays(productBatch, transportRecords),
        currentStatus: determineCurrentStatus(productBatch, transportRecords, inventoryRecords)
      }
    };

    res.status(200).json({
      success: true,
      data: traceabilityReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Generate chronological timeline of the product journey
const generateTimeline = (productBatch, transportRecords, inventoryRecords) => {
  const timelineEvents = [];

  // Add farming/harvest event
  timelineEvents.push({
    stage: 'Production',
    event: 'Product harvested',
    timestamp: productBatch.harvestDate,
    location: productBatch.farmLocation,
    details: {
      farmer: productBatch.farmerId.username,
      batchId: productBatch.batchId,
      quantity: productBatch.quantity,
      qualityGrade: productBatch.qualityGrade
    },
    status: 'completed'
  });

  // Add processing event if available
  if (productBatch.processingDetails) {
    timelineEvents.push({
      stage: 'Processing',
      event: 'Product processed',
      timestamp: productBatch.processingDetails.startDate,
      location: productBatch.processingDetails.facilityName,
      details: {
        facilityName: productBatch.processingDetails.facilityName,
        certifications: productBatch.processingDetails.certifications
      },
      status: 'completed'
    });
  }

  // Add transportation events
  transportRecords.forEach(transport => {
    timelineEvents.push({
      stage: 'Transportation',
      event: 'Product transported',
      timestamp: transport.departureTime,
      location: transport.origin,
      details: {
        transportId: transport.transportId,
        transporter: transport.transporterId.username,
        origin: transport.origin.locationName,
        destination: transport.destination.locationName,
        vehicle: transport.vehicleDetails?.vehicleType,
        driver: transport.driverDetails?.name
      },
      status: transport.status
    });

    // Add arrival event
    if (transport.actualArrivalTime) {
      timelineEvents.push({
        stage: 'Transportation',
        event: 'Product arrived at destination',
        timestamp: transport.actualArrivalTime,
        location: transport.destination,
        details: {
          transportId: transport.transportId,
          transporter: transport.transporterId.username,
          origin: transport.origin.locationName,
          destination: transport.destination.locationName
        },
        status: 'completed'
      });
    }
  });

  // Add retail events
  inventoryRecords.forEach(inventory => {
    timelineEvents.push({
      stage: 'Retail',
      event: 'Product stocked at retail location',
      timestamp: inventory.createdAt,
      location: inventory.location,
      details: {
        retailer: inventory.retailerId.username,
        storeName: inventory.location?.storeName,
        sku: inventory.sku,
        quantity: inventory.quantityAvailable,
        price: inventory.unitPrice
      },
      status: inventory.status
    });
  });

  // Sort events by timestamp
  return timelineEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

// Calculate total journey days from harvest to current status
const calculateTotalJourneyDays = (productBatch, transportRecords) => {
  const harvestDate = new Date(productBatch.harvestDate);
  let endDate = new Date();

  // If there are transport records, use the latest arrival time
  if (transportRecords.length > 0) {
    const lastTransport = transportRecords.reduce((latest, current) => 
      new Date(current.actualArrivalTime) > new Date(latest.actualArrivalTime) ? current : latest
    );
    
    if (lastTransport.actualArrivalTime) {
      endDate = new Date(lastTransport.actualArrivalTime);
    }
  }

  const timeDiff = endDate.getTime() - harvestDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert to days
};

// Determine the current status of the product
const determineCurrentStatus = (productBatch, transportRecords, inventoryRecords) => {
  // Check if batch is expired
  const expiryDate = new Date(productBatch.expiryDate);
  const currentDate = new Date();
  
  if (expiryDate < currentDate) {
    return 'expired';
  }

  // Check retail inventory status
  if (inventoryRecords.length > 0) {
    const availableInStores = inventoryRecords.some(inv => inv.status === 'available' && inv.quantityAvailable > 0);
    if (availableInStores) {
      return 'available_at_retail';
    }
    return 'sold_out';
  }

 // Check transport status
  if (transportRecords.length > 0) {
    const activeTransports = transportRecords.filter(t => t.status === 'in-transit');
    if (activeTransports.length > 0) {
      return 'in_transit';
    }
    
    const deliveredTransports = transportRecords.filter(t => t.status === 'delivered');
    if (deliveredTransports.length > 0) {
      return 'delivered_to_retail';
    }
  }

  // Default to production if not in transport or retail
  return 'with_producer';
};

// Get product status by batch ID (simplified version)
const getProductStatus = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      });
    }

    let productBatch;
    if (batchId.match(/^[0-9a-fA-F]{24}$/)) {
      productBatch = await ProductBatch.findById(batchId);
    } else {
      productBatch = await ProductBatch.findOne({ batchId });
    }

    if (!productBatch) {
      return res.status(404).json({
        success: false,
        message: 'Product batch not found'
      });
    }

    // Determine status using the helper function
    const status = determineCurrentStatus(
      productBatch,
      await TransportDetails.find({ batchId: productBatch._id }),
      await StoreInventory.find({ 'batchDetails.batchId': productBatch._id })
    );

    const expiryDate = new Date(productBatch.expiryDate);
    const currentDate = new Date();
    const isExpired = expiryDate < currentDate;

    res.status(200).json({
      success: true,
      data: {
        batchId: productBatch.batchId,
        productName: productBatch.productName,
        status: status,
        isExpired: isExpired,
        expiryDate: productBatch.expiryDate,
        daysUntilExpiry: Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search products by name or partial batch ID
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search for products by name or batch ID
    const productBatches = await ProductBatch.find({
      $or: [
        { productName: { $regex: query, $options: 'i' } },
        { batchId: { $regex: query, $options: 'i' } }
      ]
    }).limit(20); // Limit results to 20

    const results = await Promise.all(productBatches.map(async (batch) => {
      const transportCount = await TransportDetails.countDocuments({ batchId: batch._id });
      const inventoryCount = await StoreInventory.countDocuments({ 'batchDetails.batchId': batch._id });
      
      return {
        batchId: batch.batchId,
        productName: batch.productName,
        harvestDate: batch.harvestDate,
        expiryDate: batch.expiryDate,
        status: batch.status,
        transportCount,
        inventoryCount,
        qualityGrade: batch.qualityGrade
      };
    }));

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getTraceabilityReport,
  getProductStatus,
  searchProducts
};