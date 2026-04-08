const mongoose = require('mongoose');

const storeInventorySchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductBatch',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RetailStore'
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  quantityAvailable: {
    type: Number,
    default: 0,
    min: 0
  },
  unitPrice: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  batchDetails: {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductBatch'
    },
    harvestDate: Date,
    expiryDate: Date
  },
  shelfDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  qualityStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  storageConditions: {
    temperature: String,
    humidity: String,
    otherConditions: String
  },
  location: {
    storeName: String,
    address: String
  },
  lastRestocked: {
    type: Date
  },
  lastSold: {
    type: Date
  },
  salesHistory: [{
    date: Date,
    quantitySold: Number,
    revenue: Number
  }],
  status: {
    type: String,
    enum: ['available', 'out-of-stock', 'discontinued', 'damaged'],
    default: 'available'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add indexes for common queries
storeInventorySchema.index({ batchId: 1 });
storeInventorySchema.index({ storeId: 1 });
storeInventorySchema.index({ retailerId: 1 });
storeInventorySchema.index({ expiryDate: 1 });
storeInventorySchema.index({ isAvailable: 1 });
storeInventorySchema.index({ 'batchDetails.batchId': 1 });

module.exports = mongoose.model('StoreInventory', storeInventorySchema);