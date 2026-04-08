const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductBatch',
    required: true
  },
  consumerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer',
    required: false // Optional, so consumers can leave anonymous feedback
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for fast retrieval of feedback for a specific batch
feedbackSchema.index({ batchId: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
