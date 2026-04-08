const mongoose = require('mongoose');

const retailStoreSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for common queries
retailStoreSchema.index({ managerId: 1 });
retailStoreSchema.index({ shopName: 1 });

module.exports = mongoose.model('RetailStore', retailStoreSchema);
