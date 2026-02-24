const ProductBatch = require('../../models/ProductBatch');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Generate a unique batch ID
const generateBatchId = () => {
  return `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Create a new product batch
const createBatch = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug log
    console.log('Authenticated user:', req.user); // Debug log

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
      notes 
    } = req.body;

    // Validate required fields
    if (!productName || !harvestDate || !expiryDate || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productName, harvestDate, expiryDate, quantity, unit'
      });
    }

    // Check if user is authenticated and is a farmer
    if (!req.user || !req.user.id || !req.user.role) {
      console.error('User not properly authenticated:', req.user);
      return res.status(401).json({
        success: false,
        message: 'User not authenticated properly'
      });
    }

    if (req.user.role !== 'ROLE_FARMER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Farmers only.'
      });
    }

    // Create new batch
    const newBatch = new ProductBatch({
      batchId: generateBatchId(),
      productName,
      farmerId: req.user.id,
      harvestDate,
      expiryDate,
      quantity: parseFloat(quantity), // Ensure quantity is a number
      unit,
      qualityGrade,
      organicCertified: !!organicCertified, // Ensure boolean
      pesticideResidue,
      storageConditions,
      notes
    });

    console.log('Creating new batch:', newBatch); // Debug log
    const savedBatch = await newBatch.save();
    console.log('Batch saved successfully:', savedBatch._id); // Debug log

    // Generate QR code for the batch
    const qrData = JSON.stringify({
      batchId: savedBatch.batchId,
      productName: savedBatch.productName,
      farmerId: savedBatch.farmerId,
      harvestDate: savedBatch.harvestDate,
      expiryDate: savedBatch.expiryDate
    });

    console.log('Generating QR code...'); // Debug log
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    console.log('QR code generated successfully'); // Debug log
    
    // Update the batch with QR code URL
    savedBatch.qrCode = qrCodeUrl;
    await savedBatch.save();
    console.log('Batch updated with QR code'); // Debug log

    res.status(201).json({
      success: true,
      message: 'Product batch created successfully',
      data: {
        ...savedBatch.toObject(),
        qrCode: qrCodeUrl
      }
    });
  } catch (error) {
    console.error('Error in createBatch:', error); // Enhanced error logging
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during batch creation'
    });
  }
};

// Get all batches for a farmer
const getBatches = async (req, res) => {
  try {
    // Check if user is a farmer
    if (req.user.role !== 'ROLE_FARMER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Farmers only.'
      });
    }

    const batches = await ProductBatch.find({ farmerId: req.user.id }).populate('farmerId', 'username email firstName lastName');

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a specific batch by ID
const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find batch and populate farmer info
    const batch = await ProductBatch.findById(id).populate('farmerId', 'username email firstName lastName');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if user is the farmer who owns the batch or is an admin
    if (batch.farmerId._id.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Batch owner or admin only.'
      });
    }

    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a batch
const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the batch
    const batch = await ProductBatch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if user is the farmer who owns the batch or is an admin
    if (batch.farmerId.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Batch owner or admin only.'
      });
    }

    // Update batch
    const updatedBatch = await ProductBatch.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: updatedBatch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a batch
const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the batch
    const batch = await ProductBatch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if user is the farmer who owns the batch or is an admin
    if (batch.farmerId.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Batch owner or admin only.'
      });
    }

    await ProductBatch.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Generate QR code for a specific batch
const generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the batch
    const batch = await ProductBatch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if user is the farmer who owns the batch or is an admin
    if (batch.farmerId.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Batch owner or admin only.'
      });
    }

    // Generate QR code with batch information
    const qrData = JSON.stringify({
      batchId: batch.batchId,
      productName: batch.productName,
      farmerId: batch.farmerId,
      harvestDate: batch.harvestDate,
      expiryDate: batch.expiryDate,
      createdAt: batch.createdAt
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData);

    res.status(200).json({
      success: true,
      data: {
        batchId: batch.batchId,
        qrCode: qrCodeUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  generateQRCode
};