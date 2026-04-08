const ProductBatch = require('../../models/ProductBatch');
const QRCode = require('qrcode');

// Generate a unique batch ID
const generateBatchId = () => {
  return `BATCH-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
};

// Create a new product batch
const createBatch = async (req, res) => {
  try {
    const {
      productName,
      harvestDate,
      expiryDate,
      quantity,
      unit,
      qualityGrade,
      organicCertified,
      pesticideResidue,
      storageConditions,
      notes,
    } = req.body;

    // Validate required fields
    if (!productName || !harvestDate || !expiryDate || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: productName, harvestDate, expiryDate, quantity, unit',
      });
    }

    // Check if user is authenticated and is a farmer
    if (!req.user || !req.user.id || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated properly',
      });
    }

    if (req.user.role !== 'ROLE_FARMER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Farmers only.',
      });
    }

    const frontendBaseUrl =
      process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

    // Create new batch
    const newBatch = new ProductBatch({
      batchId: generateBatchId(),
      productName,
      farmerId: req.user.id,
      harvestDate,
      expiryDate,
      quantity: parseFloat(quantity),
      unit,
      qualityGrade,
      organicCertified: !!organicCertified,
      pesticideResidue,
      storageConditions,
      notes,
    });

    const savedBatch = await newBatch.save();

    // Generate QR code that links to the public traceability page
    const qrData = `${frontendBaseUrl}/trace/${savedBatch.batchId}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    savedBatch.qrCode = qrCodeUrl;
    await savedBatch.save();

    return res.status(201).json({
      success: true,
      message: 'Product batch created successfully',
      data: {
        ...savedBatch.toObject(),
        qrCode: qrCodeUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during batch creation',
    });
  }
};

// Get all batches for a farmer
const getBatches = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ROLE_FARMER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Farmers only.',
      });
    }

    const batches = await ProductBatch.find({ farmerId: req.user.id }).populate(
      'farmerId',
      'username email firstName lastName'
    );

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a specific batch by ID
const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await ProductBatch.findById(id).populate(
      'farmerId',
      'username email firstName lastName'
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    if (
      batch.farmerId._id.toString() !== req.user.id &&
      req.user.role !== 'ROLE_ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Batch owner or admin only.',
      });
    }

    return res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a batch
const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const batch = await ProductBatch.findById(id).populate(
      'farmerId',
      'username email firstName lastName'
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    if (
      batch.farmerId._id.toString() !== req.user.id &&
      req.user.role !== 'ROLE_ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Batch owner or admin only.',
      });
    }

    const updatedBatch = await ProductBatch.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: updatedBatch,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a batch
const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await ProductBatch.findById(id).populate(
      'farmerId',
      'username email firstName lastName'
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    if (
      batch.farmerId._id.toString() !== req.user.id &&
      req.user.role !== 'ROLE_ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Batch owner or admin only.',
      });
    }

    await ProductBatch.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Generate QR code for a specific batch
const generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await ProductBatch.findById(id).populate(
      'farmerId',
      'username email firstName lastName'
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    if (
      batch.farmerId._id.toString() !== req.user.id &&
      req.user.role !== 'ROLE_ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Batch owner or admin only.',
      });
    }

    const frontendBaseUrl =
      process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

    const qrData = `${frontendBaseUrl}/trace/${batch.batchId}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    return res.status(200).json({
      success: true,
      data: {
        batchId: batch.batchId,
        qrCode: qrCodeUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  generateQRCode,
};