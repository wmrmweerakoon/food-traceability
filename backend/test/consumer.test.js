const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const traceabilityService = require('../src/components/consumer/traceabilityService');
const ProductBatch = require('../src/models/ProductBatch');
const TransportDetails = require('../src/models/TransportDetails');
const StoreInventory = require('../src/models/StoreInventory');
const User = require('../src/models/User');

jest.setTimeout(30000);

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Consumer Traceability Service', () => {

    it('should aggregate product history successfully', async () => {
        // Mock Data Creation

        // 1. Create a Farmer
        const farmer = new User({
            username: 'farmertest',
            email: 'farmer@test.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            role: 'ROLE_FARMER'
        });
        await farmer.save();

        // 2. Create a Product Batch
        const batch = new ProductBatch({
            batchId: 'BATCH-1234',
            productName: 'Organic Apples',
            farmerId: farmer._id,
            harvestDate: new Date('2023-10-01'),
            expiryDate: new Date('2023-11-01'),
            quantity: 100,
            unit: 'kg',
            qualityGrade: 'A',
            organicCertified: true,
            pesticideResidue: 'None'
        });
        await batch.save();

        // 3. Create a Transporter
        const transporter = new User({
            username: 'transportertest',
            email: 'transporter@test.com',
            password: 'password123',
            firstName: 'Bob',
            lastName: 'Trucker',
            role: 'ROLE_DISTRIBUTOR'
        });
        await transporter.save();

        // 4. Create Transport Details
        const transport = new TransportDetails({
            transportId: 'TRANS-1',
            batchId: batch._id,
            transporterId: transporter._id,
            origin: { locationName: 'Farm ABC' },
            destination: { locationName: 'Store XYZ' },
            departureTime: new Date('2023-10-02'),
            estimatedArrivalTime: new Date('2023-10-03'),
            actualArrivalTime: new Date('2023-10-03'),
            status: 'delivered'
        });
        await transport.save();

        // 5. Create a Retailer
        const retailer = new User({
            username: 'retailertest',
            email: 'retailer@test.com',
            password: 'password123',
            firstName: 'Alice',
            lastName: 'Store',
            role: 'ROLE_RETAILER'
        });
        await retailer.save();

        // 6. Create Store Inventory
        const inventory = new StoreInventory({
            productId: batch._id,
            retailerId: retailer._id,
            sku: 'SKU-APPLES',
            productName: 'Organic Apples',
            category: 'Fruits',
            quantityAvailable: 50,
            unitPrice: 5.99,
            batchDetails: {
                batchId: batch._id,
                expiryDate: new Date('2023-11-01')
            },
            location: {
                storeName: 'Alice Groceries'
            }
        });
        await inventory.save();


        // Test the service execution
        const history = await traceabilityService.getProductHistory('BATCH-1234');

        // Assertions
        expect(history).toBeDefined();

        expect(history.farm.productName).toBe('Organic Apples');
        expect(history.farm.farmer.name).toBe('John Doe');

        expect(history.transport.length).toBe(1);
        expect(history.transport[0].transporter).toBe('Bob Trucker');
        expect(history.transport[0].status).toBe('delivered');

        expect(history.store.length).toBe(1);
        expect(history.store[0].sku).toBe('SKU-APPLES');
        expect(history.store[0].retailer.storeName).toBe('Alice Groceries');

    });

    it('should throw "Product not found" on unknown batch ID', async () => {
         await expect(traceabilityService.getProductHistory('UNKNOWN-999')).rejects.toThrow('Product not found');
    });

});
