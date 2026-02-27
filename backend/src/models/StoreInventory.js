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
        ref: 'RetailStore',
        required: true
    },
    retailerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

module.exports = mongoose.model('StoreInventory', storeInventorySchema);