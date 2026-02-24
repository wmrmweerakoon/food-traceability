const mongoose = require('mongoose');

const storeInventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductBatch',
    required: true
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  supplierDetails: {
    name: String,
    contact: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  quantityAvailable: {
    type: Number,
    required: true,
    min: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  location: {
    storeName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  minimumStockLevel: {
    type: Number,
    default: 10
  },
  maximumStockLevel: {
    type: Number
  },
  batchDetails: {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductBatch'
    },
    harvestDate: Date,
    expiryDate: Date
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
storeInventorySchema.pre('save', function () {
  this.updatedAt = Date.now();
});

// Add indexes for common queries
storeInventorySchema.index({ sku: 1 });
storeInventorySchema.index({ retailerId: 1 });
storeInventorySchema.index({ productId: 1 });
storeInventorySchema.index({ status: 1 });
storeInventorySchema.index({ quantityAvailable: 1 });

module.exports = mongoose.model('StoreInventory', storeInventorySchema);