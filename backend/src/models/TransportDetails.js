const mongoose = require('mongoose');

const transportDetailsSchema = new mongoose.Schema({
  transportId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductBatch',
    required: true
  },
  transporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    locationName: {
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
  destination: {
    locationName: {
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
  departureTime: {
    type: Date,
    required: true
  },
  estimatedArrivalTime: {
    type: Date,
    required: true
  },
  actualArrivalTime: {
    type: Date
  },
  vehicleDetails: {
    vehicleType: String,
    vehicleNumber: String,
    capacity: String,
    refrigerated: {
      type: Boolean,
      default: false
    }
  },
  driverDetails: {
    name: String,
    licenseNumber: String,
    contactNumber: String
  },
  temperatureLogs: [{
    timestamp: Date,
    temperature: Number,
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [Number]
    }
  }],
  conditionNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['in-transit', 'delivered', 'delayed', 'cancelled'],
    default: 'in-transit'
  },
  insuranceDetails: {
    company: String,
    policyNumber: String,
    coverageAmount: Number
  },
  documents: [{
    documentType: String,
    documentUrl: String,
    uploadDate: Date
  }],
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
transportDetailsSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Add indexes for common queries
transportDetailsSchema.index({ transportId: 1 });
transportDetailsSchema.index({ batchId: 1 });
transportDetailsSchema.index({ transporterId: 1 });
transportDetailsSchema.index({ status: 1 });
transportDetailsSchema.index({ departureTime: 1 });

module.exports = mongoose.model('TransportDetails', transportDetailsSchema);