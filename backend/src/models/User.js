const mongoose = require('mongoose');

// Define roles
const ROLES = {
  FARMER: 'ROLE_FARMER',
  DISTRIBUTOR: 'ROLE_DISTRIBUTOR',
  RETAILER: 'ROLE_RETAILER',
  CONSUMER: 'ROLE_CONSUMER',
  ADMIN: 'ROLE_ADMIN'
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.CONSUMER
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true
 },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
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
userSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Add compound index for email and username
userSchema.index({ email: 1, username: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
module.exports.ROLES = ROLES;
