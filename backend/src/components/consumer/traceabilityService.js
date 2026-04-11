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
    .populate('retailerId', 'username email firstName lastName contactNumber')
    .populate('storeId', 'shopName location')
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
      expiryDate: productBatch.expiryDate,
      quantity: productBatch.quantity,
      unit: productBatch.unit,
      pesticideResidue: productBatch.pesticideResidue,
      storageConditions: productBatch.storageConditions,
      organicCertified: productBatch.organicCertified,
      qualityGrade: productBatch.qualityGrade,
      notes: productBatch.notes
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
          storeName: i.storeId?.shopName || 'Verified Merchant'
      } : null,
      storeName: i.storeId?.shopName || 'Verified Merchant',
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

const saveFeedback = async (batchId, feedbackData) => {
  if (!batchId) {
    throw new Error('Batch ID is required');
  }

  const { rating, comment, consumerId } = feedbackData;

  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Verify the batch exists
  let productBatch;
  if (batchId.match(/^[0-9a-fA-F]{24}$/)) {
    productBatch = await ProductBatch.findById(batchId);
  } else {
    productBatch = await ProductBatch.findOne({ batchId });
  }

  if (!productBatch) {
    throw new Error('Product not found');
  }

  const Feedback = require('../../models/Feedback');

  const feedback = new Feedback({
    batchId: productBatch._id,
    consumerId: consumerId || null,
    rating,
    comment
  });

  await feedback.save();
  return feedback;
};

const getFeedbackByBatch = async (batchId) => {
  if (!batchId) {
    throw new Error('Batch ID is required');
  }

  let productBatch;
  if (batchId.match(/^[0-9a-fA-F]{24}$/)) {
    productBatch = await ProductBatch.findById(batchId);
  } else {
    productBatch = await ProductBatch.findOne({ batchId });
  }

  if (!productBatch) {
    throw new Error('Product not found');
  }

  const Feedback = require('../../models/Feedback');
  const feedbacks = await Feedback.find({ batchId: productBatch._id })
    .populate('consumerId', 'firstName lastName')
    .sort({ createdAt: -1 });

  // Calculate average rating
  const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
  const averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;

  return {
    averageRating: parseFloat(averageRating),
    totalReviews: feedbacks.length,
    reviews: feedbacks
  };
};

const getDailyHealthTip = async () => {
    try {
        const axios = require('axios');
        // Switching to Fruityvice API for actual food-related data
        const response = await axios.get('https://www.fruityvice.com/api/fruit/all');
        
        if (response.data && Array.isArray(response.data)) {
            // Pick a random fruit from the list
            const index = Math.floor(Math.random() * response.data.length);
            const fruit = response.data[index];
            const fact = `${fruit.name}s are a healthy choice with approx. ${fruit.nutritions.calories} calories and ${fruit.nutritions.sugar}g of natural sugar per 100g!`;
            
            return {
                success: true,
                tip: fact,
                fruitName: fruit.name,
                nutritions: fruit.nutritions
            };
        } else {
            throw new Error('Failed to fetch nutritional data');
        }
    } catch (error) {
        console.error('Nutrition API Error:', error.message);
        return {
            success: true,
            tip: "Stay hydrated and eat fresh fruits for better energy throughout the day!",
            isFallback: true
        };
    }
};

module.exports = {
  getProductHistory,
  saveFeedback,
  getFeedbackByBatch,
  getDailyHealthTip
};
