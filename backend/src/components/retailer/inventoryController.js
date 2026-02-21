const StoreInventory = require('../../models/StoreInventory');
const ProductBatch = require('../../models/ProductBatch');
const axios = require('axios');

// Fetch product data from OpenFoodFacts API
const fetchProductDataFromOpenFoodFacts = async (barcode) => {
  try {
    if (!barcode) {
      throw new Error('Barcode is required to fetch product data');
    }

    // Clean the barcode to ensure it contains only digits
    const cleanBarcode = barcode.replace(/\D/g, '');
    
    // OpenFoodFacts API endpoint
    const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Food-Traceability-App 1.0 (contact@foodtraceability.com)'
      },
      timeout: 10000 // 10 second timeout
    });

    if (response.data.status !== 1) {
      throw new Error(`Product not found in OpenFoodFacts database: ${barcode}`);
    }

    return response.data.product;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(`OpenFoodFacts API error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to reach OpenFoodFacts API. Please check your internet connection.');
    } else {
      // Other errors
      throw new Error(error.message);
    }
  }
};

// Calculate shelf life based on harvest and expiry dates
const calculateShelfLife = (harvestDate, expiryDate) => {
  if (!harvestDate || !expiryDate) {
    return null;
  }

  const harvest = new Date(harvestDate);
 const expiry = new Date(expiryDate);
  
  // Calculate difference in days
  const timeDiff = expiry.getTime() - harvest.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return {
    totalDays: daysDiff,
    weeks: Math.floor(daysDiff / 7),
    months: Math.floor(daysDiff / 30)
  };
};

// Validate expiry date against product data
const validateExpiryDate = (productData, harvestDate, expiryDate) => {
  const validationResults = {
    isValid: true,
    warnings: [],
    recommendations: []
  };

  if (!harvestDate || !expiryDate) {
    validationResults.isValid = false;
    validationResults.warnings.push('Harvest date and expiry date are required for validation');
    return validationResults;
  }

  const shelfLife = calculateShelfLife(harvestDate, expiryDate);
  if (shelfLife && shelfLife.totalDays <= 0) {
    validationResults.isValid = false;
    validationResults.warnings.push('Expiry date is before or on harvest date');
  }

  // Compare with shelf life from OpenFoodFacts if available
  if (productData && productData.shelf_life_days) {
    const expectedExpiry = new Date(harvestDate);
    expectedExpiry.setDate(expectedExpiry.getDate() + parseInt(productData.shelf_life_days));
    
    const actualExpiry = new Date(expiryDate);
    
    const diffDays = Math.abs((expectedExpiry - actualExpiry) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) { // More than a week difference
      validationResults.warnings.push(`Expiry date differs significantly from expected shelf life (${productData.shelf_life_days} days)`);
      validationResults.recommendations.push(`Consider adjusting expiry date to ${expectedExpiry.toISOString().split('T')[0]} based on OpenFoodFacts data`);
    }
  }

  // Check if product is past its expiry date
  const today = new Date();
  const expiry = new Date(expiryDate);
  if (expiry < today) {
    validationResults.isValid = false;
    validationResults.warnings.push('Product is already expired');
  }

  return validationResults;
};

// Add product to store inventory
const addProductToInventory = async (req, res) => {
  try {
    const {
      productId,
      sku,
      productName,
      category,
      brand,
      supplierDetails,
      quantityAvailable,
      unitPrice,
      currency,
      location,
      minimumStockLevel,
      maximumStockLevel,
      batchDetails
    } = req.body;

    // Validate required fields
    if (!productId || !sku || !productName || !category || !quantityAvailable || !unitPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productId, sku, productName, category, quantityAvailable, unitPrice'
      });
    }

    // Check if user is a retailer
    if (req.user.role !== 'ROLE_RETAILER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Retailers only.'
      });
    }

    // Verify the product batch exists
    const productBatch = await ProductBatch.findById(productId);
    if (!productBatch) {
      return res.status(404).json({
        success: false,
        message: 'Product batch not found'
      });
    }

    // Try to fetch additional product information from OpenFoodFacts
    let openFoodFactsData = null;
    if (productBatch.barcode) {
      try {
        openFoodFactsData = await fetchProductDataFromOpenFoodFacts(productBatch.barcode);
      } catch (error) {
        console.warn(`Could not fetch data from OpenFoodFacts for barcode ${productBatch.barcode}:`, error.message);
        // Continue without OpenFoodFacts data
      }
    }

    // Validate expiry date
    const validation = validateExpiryDate(
      openFoodFactsData,
      productBatch.harvestDate,
      productBatch.expiryDate
    );

    // Create new inventory entry
    const newInventoryItem = new StoreInventory({
      productId,
      retailerId: req.user.id,
      sku,
      productName,
      category,
      brand,
      supplierDetails,
      quantityAvailable,
      unitPrice,
      currency,
      location,
      minimumStockLevel,
      maximumStockLevel,
      batchDetails: {
        batchId: productBatch._id,
        harvestDate: productBatch.harvestDate,
        expiryDate: productBatch.expiryDate
      },
      qualityStatus: validation.isValid ? 'good' : 'poor',
      status: validation.isValid ? 'available' : 'discontinued'
    });

    const savedInventory = await newInventoryItem.save();

    res.status(201).json({
      success: true,
      message: 'Product added to inventory successfully',
      data: {
        ...savedInventory.toObject(),
        openFoodFactsData,
        validation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get inventory items for a retailer
const getInventoryItems = async (req, res) => {
  try {
    // Check if user is a retailer
    if (req.user.role !== 'ROLE_RETAILER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Retailers only.'
      });
    }

    const inventoryItems = await StoreInventory.find({ retailerId: req.user.id })
      .populate('productId', 'batchId productName harvestDate expiryDate qualityGrade')
      .populate('retailerId', 'username email firstName lastName');

    res.status(200).json({
      success: true,
      count: inventoryItems.length,
      data: inventoryItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a specific inventory item by ID
const getInventoryItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const inventoryItem = await StoreInventory.findById(id)
      .populate('productId', 'batchId productName harvestDate expiryDate qualityGrade')
      .populate('retailerId', 'username email firstName lastName');

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Check if user is the retailer who owns the item or is an admin
    if (inventoryItem.retailerId._id.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Item owner or admin only.'
      });
    }

    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update inventory item
const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const inventoryItem = await StoreInventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Check if user is the retailer who owns the item or is an admin
    if (inventoryItem.retailerId.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Item owner or admin only.'
      });
    }

    const updatedInventory = await StoreInventory.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedInventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Validate expiry date using OpenFoodFacts API
const validateProductExpiry = async (req, res) => {
  try {
    const { batchId, harvestDate, expiryDate } = req.body;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required for expiry validation'
      });
    }

    // Get product batch information
    const productBatch = await ProductBatch.findById(batchId);
    if (!productBatch) {
      return res.status(404).json({
        success: false,
        message: 'Product batch not found'
      });
    }

    // Check if user has access to this batch
    if (productBatch.farmerId.toString() !== req.user.id && req.user.role !== 'ROLE_ADMIN' && req.user.role !== 'ROLE_RETAILER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Batch owner, retailer, or admin only.'
      });
    }

    // Try to fetch product data from OpenFoodFacts
    let openFoodFactsData = null;
    let validation = null;

    if (productBatch.barcode) {
      try {
        openFoodFactsData = await fetchProductDataFromOpenFoodFacts(productBatch.barcode);
      } catch (error) {
        console.warn(`Could not fetch data from OpenFoodFacts for barcode ${productBatch.barcode}:`, error.message);
        // Continue without OpenFoodFacts data
      }
    }

    // Perform validation regardless of OpenFoodFacts data availability
    validation = validateExpiryDate(
      openFoodFactsData,
      harvestDate || productBatch.harvestDate,
      expiryDate || productBatch.expiryDate
    );

    res.status(200).json({
      success: true,
      data: {
        batchId: productBatch._id,
        productName: productBatch.productName,
        harvestDate: harvestDate || productBatch.harvestDate,
        expiryDate: expiryDate || productBatch.expiryDate,
        openFoodFactsData,
        validation,
        shelfLife: calculateShelfLife(
          harvestDate || productBatch.harvestDate,
          expiryDate || productBatch.expiryDate
        )
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
  addProductToInventory,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  validateProductExpiry
};