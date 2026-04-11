const StoreInventory = require('../../models/StoreInventory');
const ProductBatch = require('../../models/ProductBatch');
const axios = require('axios');

// Fetch product data from OpenFoodFacts API
const fetchProductDataFromOpenFoodFacts = async(barcode) => {
    try {
        if (!barcode) {
            throw new Error('Barcode is required to fetch product data');
        }
        const cleanBarcode = barcode.replace(/\D/g, '');
        const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`;
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'AgriTrace-App 1.0'
            },
            timeout: 10000
        });
        if (response.data.status !== 1) {
            throw new Error(`Product not found: ${barcode}`);
        }
        return response.data.product;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Calculate shelf life
const calculateShelfLife = (harvestDate, expiryDate) => {
    if (!harvestDate || !expiryDate) return null;
    const harvest = new Date(harvestDate);
    const expiry = new Date(expiryDate);
    const daysDiff = Math.ceil((expiry.getTime() - harvest.getTime()) / (1000 * 3600 * 24));
    return {
        totalDays: daysDiff,
        weeks: Math.floor(daysDiff / 7),
        months: Math.floor(daysDiff / 30)
    };
};

// Validate expiry date
const validateExpiryDate = (productData, harvestDate, expiryDate) => {
    const results = { isValid: true, warnings: [], recommendations: [] };
    if (!harvestDate || !expiryDate) {
        results.isValid = false;
        results.warnings.push('Harvest and expiry dates required');
        return results;
    }
    const shelfLife = calculateShelfLife(harvestDate, expiryDate);
    if (shelfLife && shelfLife.totalDays <= 0) {
        results.isValid = false;
        results.warnings.push('Expiry date is invalid (before harvest)');
    }
    const today = new Date();
    if (new Date(expiryDate) < today) {
        results.isValid = false;
        results.warnings.push('Product is already expired');
    }
    return results;
};

// Add product to store inventory
const addProductToInventory = async(req, res) => {
    try {
        const { productId, sku, productName, category, quantityAvailable, unitPrice, storeId, manualExpiry } = req.body;
        
        if (!productId || !sku || !productName || !category || !quantityAvailable || !unitPrice) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const productBatch = await ProductBatch.findById(productId);
        if (!productBatch) return res.status(404).json({ success: false, message: 'Batch not found' });

        let openFoodFactsData = null;
        if (productBatch.barcode) {
            try { 
                openFoodFactsData = await fetchProductDataFromOpenFoodFacts(productBatch.barcode); 
            } catch (e) { console.warn(e.message); }
        }

        const validation = validateExpiryDate(openFoodFactsData, productBatch.harvestDate, manualExpiry || productBatch.expiryDate);

        const newInventoryItem = new StoreInventory({
            productId,
            retailerId: req.user.id,
            sku,
            productName,
            category,
            quantityAvailable,
            unitPrice,
            batchId: productBatch.batchId,
            storeId,
            expiryDate: manualExpiry || productBatch.expiryDate,
            qualityStatus: validation.isValid ? 'good' : 'poor',
            status: validation.isValid ? 'available' : 'discontinued',
            batchDetails: {
                batchId: productBatch._id,
                harvestDate: productBatch.harvestDate,
                expiryDate: productBatch.expiryDate
            }
        });

        await newInventoryItem.save();
        res.status(201).json({ success: true, message: 'Product added to inventory', data: newInventoryItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get inventory items for a retailer
const getInventoryItems = async(req, res) => {
    try {
        const inventoryItems = await StoreInventory.find({ retailerId: req.user.id })
            .populate({
                path: 'productId',
                select: 'batchId productName harvestDate expiryDate qualityGrade farmerId',
                populate: {
                    path: 'farmerId',
                    select: 'firstName lastName username'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: inventoryItems.length, data: inventoryItems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single inventory item by ID
const getInventoryItemById = async(req, res) => {
    try {
        const item = await StoreInventory.findById(req.params.id).populate('productId');
        if (!item || item.retailerId.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update inventory item
const updateInventoryItem = async(req, res) => {
    try {
        const updatedItem = await StoreInventory.findOneAndUpdate(
            { _id: req.params.id, retailerId: req.user.id },
            { ...req.body, updatedAt: Date.now() },
            { returnDocument: 'after', runValidators: true }
        );
        if (!updatedItem) return res.status(404).json({ success: false, message: 'Item not found' });
        res.status(200).json({ success: true, data: updatedItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete inventory item
const deleteInventoryItem = async(req, res) => {
    try {
        const item = await StoreInventory.findOneAndDelete({ _id: req.params.id, retailerId: req.user.id });
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        res.status(200).json({ success: true, message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Validate product expiry using OpenFoodFacts
const validateProductExpiry = async(req, res) => {
    try {
        const { batchId } = req.body;
        const productBatch = await ProductBatch.findById(batchId);
        if (!productBatch) return res.status(404).json({ success: false, message: 'Batch not found' });

        let openFoodFactsData = null;
        if (productBatch.barcode) {
            try { openFoodFactsData = await fetchProductDataFromOpenFoodFacts(productBatch.barcode); } catch (e) {}
        }

        const validation = validateExpiryDate(openFoodFactsData, productBatch.harvestDate, productBatch.expiryDate);
        res.status(200).json({
            success: true,
            data: {
                productName: productBatch.productName,
                openFoodFactsData,
                validation,
                shelfLife: calculateShelfLife(productBatch.harvestDate, productBatch.expiryDate)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get retailer's stores
const getRetailerStores = async(req, res) => {
    try {
        const RetailStore = require('../../models/RetailStore');
        const stores = await RetailStore.find({ managerId: req.user.id });
        res.status(200).json({ success: true, data: stores });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get incoming shipments
const getIncomingShipments = async(req, res) => {
    try {
        const TransportDetails = require('../../models/TransportDetails');
        const deliveredTransports = await TransportDetails.find({ deliveryStatus: 'Delivered' }).populate('batchId');
        const existingInventoryBatchIds = await StoreInventory.find().distinct('productId');
        
        const incomingShipments = deliveredTransports.filter(t => 
            !existingInventoryBatchIds.find(id => id.toString() === t.batchId?._id?.toString())
        );

        res.status(200).json({ success: true, count: incomingShipments.length, data: incomingShipments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get available batches
const getAvailableBatches = async(req, res) => {
    try {
        const existingInventoryBatchIds = await StoreInventory.find().distinct('productId');
        const batches = await ProductBatch.find({ 
            status: 'active', 
            _id: { $nin: existingInventoryBatchIds } 
        }).populate('farmerId', 'firstName lastName username');
        res.status(200).json({ success: true, data: batches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// New BatchId Based Endpoints (Harmonization)
const getItemByBatchId = async(req, res) => {
    try {
        const item = await StoreInventory.findOne({ batchId: req.params.batchId, retailerId: req.user.id }).populate('productId');
        if (!item) return res.status(404).json({ success: false, message: 'Batch not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateItemByBatchId = async(req, res) => {
    try {
        const item = await StoreInventory.findOneAndUpdate(
            { batchId: req.params.batchId, retailerId: req.user.id },
            { ...req.body, updatedAt: Date.now() },
            { returnDocument: 'after', runValidators: true }
        );
        if (!item) return res.status(404).json({ success: false, message: 'Batch not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteItemByBatchId = async(req, res) => {
    try {
        const item = await StoreInventory.findOneAndDelete({ batchId: req.params.batchId, retailerId: req.user.id });
        if (!item) return res.status(404).json({ success: false, message: 'Batch not found' });
        res.status(200).json({ success: true, message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const sellProductByBatchId = async(req, res) => {
    try {
        const { quantity = 1 } = req.body;
        const item = await StoreInventory.findOne({ batchId: req.params.batchId, retailerId: req.user.id });
        if (!item) return res.status(404).json({ success: false, message: 'Product not found' });
        if (item.quantityAvailable < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

        item.quantityAvailable -= quantity;
        if (item.quantityAvailable === 0) item.status = 'out-of-stock';
        item.salesHistory.push({ date: new Date(), quantitySold: quantity, revenue: quantity * item.unitPrice });
        await item.save();
        res.status(200).json({ success: true, message: 'Sale processed', data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createStore = async(req, res) => {
    try {
        const { shopName, location } = req.body;
        if (!shopName || !location) {
            return res.status(400).json({ success: false, message: 'Shop name and location are required' });
        }
        const RetailStore = require('../../models/RetailStore');
        const newStore = new RetailStore({
            shopName,
            location,
            managerId: req.user.id
        });
        await newStore.save();
        res.status(201).json({ success: true, message: 'Store created successfully', data: newStore });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateStore = async(req, res) => {
    try {
        const RetailStore = require('../../models/RetailStore');
        const store = await RetailStore.findOneAndUpdate(
            { _id: req.params.id, managerId: req.user.id },
            { ...req.body, updatedAt: Date.now() },
            { returnDocument: 'after', runValidators: true }
        );
        if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
        res.status(200).json({ success: true, message: 'Store updated', data: store });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteStore = async(req, res) => {
    try {
        const RetailStore = require('../../models/RetailStore');
        const store = await RetailStore.findOneAndDelete({ _id: req.params.id, managerId: req.user.id });
        if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
        res.status(200).json({ success: true, message: 'Store removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch global exchange rates for LKR (or base currency)
const getGlobalPricing = async (req, res) => {
    try {
        // Using open.er-api.com which is free and requires no key for latest rates
        const response = await axios.get('https://open.er-api.com/v6/latest/LKR');
        
        if (response.data && response.data.result === 'success') {
            const rates = {
                USD: response.data.rates.USD,
                EUR: response.data.rates.EUR,
                GBP: response.data.rates.GBP,
                INR: response.data.rates.INR
            };
            
            res.status(200).json({
                success: true,
                base: 'LKR',
                rates,
                updatedAt: response.data.time_last_update_utc
            });
        } else {
            throw new Error('Failed to fetch exchange rates');
        }
    } catch (error) {
        console.error('Currency API Error:', error.message);
        // Fallback rates if API fails
        res.status(200).json({
            success: true,
            base: 'LKR',
            rates: { USD: 0.0033, EUR: 0.0031, GBP: 0.0026, INR: 0.28 },
            isFallback: true
        });
    }
};

module.exports = {
    addProductToInventory,
    getInventoryItems,
    getInventoryItemById,
    updateInventoryItem,
    deleteInventoryItem,
    validateProductExpiry,
    getRetailerStores,
    getAvailableBatches,
    getIncomingShipments,
    getItemByBatchId,
    updateItemByBatchId,
    deleteItemByBatchId,
    sellProductByBatchId,
    createStore,
    updateStore,
    deleteStore,
    getGlobalPricing
};
