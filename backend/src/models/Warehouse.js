const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  warehouseId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    address: { type: String, required: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  climateControlled: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Full', 'Maintenance', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
