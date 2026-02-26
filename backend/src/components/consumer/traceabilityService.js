const ProductBatch = require('../../models/ProductBatch');
const TransportDetails = require('../../models/TransportDetails');
const StoreInventory = require('../../models/StoreInventory');

const getProductHistory = async (batchId) => {
  if (!batchId) {
    throw new Error('Batch ID is required');
  }

  // Step A: Fetch production data
  let productBatch;
  if (batchId.match(/^[0-9a-fA-F]{24}$/)) {
    productBatch = await ProductBatch.findById(batchId)
      .populate('farmerId', 'username email firstName lastName contactNumber address');
  } else {
    productBatch = await ProductBatch.findOne({ batchId })
      .populate('farmerId', 'username email firstName lastName contactNumber address');
  }

  if (!productBatch) {
    throw new Error('Product not found');
  }

  // Step B: Fetch transit data
  const transportRecords = await TransportDetails.find({ batchId: productBatch._id })
    .populate('transporterId', 'username email firstName lastName contactNumber')
    .sort({ departureTime: 1 });

  // Step C: Fetch retail data
  const inventoryRecords = await StoreInventory.find({
    'batchDetails.batchId': productBatch._id
  })
    .populate('retailerId', 'username email firstName lastName contactNumber storeName location')
    .populate('productId', 'productName batchId');

  // Step D: Merge into a unified JSON response
  return {
    farm: {
      batchId: productBatch.batchId,
      productName: productBatch.productName,
      farmer: productBatch.farmerId ? {
        name: `${productBatch.farmerId.firstName} ${productBatch.farmerId.lastName}`,
        contact: productBatch.farmerId.contactNumber,
        address: productBatch.farmerId.address
      } : null,
      location: productBatch.farmLocation,
      harvestDate: productBatch.harvestDate,
      fertilizer: productBatch.pesticideResidue, // Using pesticideResidue as proxy for fertilizer info based on schema
      organicCertified: productBatch.organicCertified,
      qualityGrade: productBatch.qualityGrade,
    },
    transport: transportRecords.map(t => ({
      transportId: t.transportId,
      transporter: t.transporterId ? `${t.transporterId.firstName} ${t.transporterId.lastName}` : null,
      origin: t.origin,
      destination: t.destination,
      departureTime: t.departureTime,
      actualArrivalTime: t.actualArrivalTime,
      vehicleDetails: t.vehicleDetails,
      storageConditions: {
        temperatureLogs: t.temperatureLogs,
        notes: t.conditionNotes
      },
      status: t.status
    })),
    store: inventoryRecords.map(i => ({
      sku: i.sku,
      retailer: i.retailerId ? {
          name: `${i.retailerId.firstName} ${i.retailerId.lastName}`,
          storeName: i.location?.storeName || 'Unknown Store'
      } : null,
      shelfDate: i.createdAt,
      expiryDate: i.batchDetails?.expiryDate || productBatch.expiryDate,
      location: i.location,
      status: i.status,
      qualityStatus: i.qualityStatus,
      price: i.unitPrice,
      currency: i.currency
    }))
  };
};

module.exports = {
  getProductHistory
};
