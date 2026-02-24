const mongoose = require('mongoose');

const productBatchSchema = new mongoose.Schema({
  batchId: {
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
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  harvestDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'lbs', 'pieces', 'liters', 'gallons']
  },
  qualityGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'Premium', 'Standard', 'Substandard']
  },
  organicCertified: {
    type: Boolean,
    default: false
  },
  pesticideResidue: {
    type: String,
    enum: ['None', 'Low', 'Moderate', 'High']
  },
  farmLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  processingDetails: {
    facilityName: String,
    startDate: Date,
    endDate: Date,
    certifications: [String]
  },
  storageConditions: {
    temperature: String,
    humidity: String,
    otherConditions: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'sold'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  },
  qrCode: {
    type: String, // Stores the data URL of the QR code
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
productBatchSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

// Add indexes for common queries
productBatchSchema.index({ batchId: 1 });
productBatchSchema.index({ farmerId: 1 });
productBatchSchema.index({ harvestDate: 1 });
productBatchSchema.index({ expiryDate: 1 });
productBatchSchema.index({ status: 1 });

module.exports = mongoose.model('ProductBatch', productBatchSchema);