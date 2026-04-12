const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const ProductBatch = require('../../src/models/ProductBatch');
const StoreInventory = require('../../src/models/StoreInventory');
const RetailStore = require('../../src/models/RetailStore');
const { connect, closeDatabase, clearDatabase } = require('../setup');

let retailerToken, retailerId, storeId, batchId, batchObjectId;

beforeAll(async () => {
    await connect();

    // 1. Create a retailer user
    const retailer = await User.create({
        username: 'retailer_int_test',
        email: 'retailer_int@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Retailer',
        role: 'ROLE_RETAILER'
    });
    retailerId = retailer._id;

    retailerToken = jwt.sign(
        { id: retailer._id, role: retailer.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
    );

    // 2. Create a store for this retailer
    const store = await RetailStore.create({
        shopName: 'Integration Mart',
        location: 'Colombo 07',
        managerId: retailerId
    });
    storeId = store._id;

    // 3. Create a product batch
    const batch = await ProductBatch.create({
        batchId: 'BATCH-INT-999',
        productName: 'Organic Carrots',
        farmerId: new mongoose.Types.ObjectId(),
        harvestDate: new Date(),
        expiryDate: new Date(Date.now() + 86400000 * 30), // 30 days
        quantity: 100,
        unit: 'kg'
    });
    batchObjectId = batch._id;
    batchId = batch.batchId;
});

afterAll(async () => {
    await closeDatabase();
});

describe('Retailer Store Integration API', () => {

    describe('POST /api/retailer/inventory', () => {
        test('should add a product to store inventory', async () => {
            const res = await request(app)
                .post('/api/retailer/inventory')
                .set('Authorization', `Bearer ${retailerToken}`)
                .send({
                    productId: batchObjectId,
                    productName: 'Organic Carrots',
                    sku: 'CARROT-001',
                    quantityAvailable: 50,
                    unitPrice: 200,
                    category: 'Vegetables',
                    storeId: storeId
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.sku).toBe('CARROT-001');
        });

        test('should fail if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/retailer/inventory')
                .set('Authorization', `Bearer ${retailerToken}`)
                .send({ sku: '' });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/retailer/inventory', () => {
        test('should return all inventory items for the retailer', async () => {
            const res = await request(app)
                .get('/api/retailer/inventory')
                .set('Authorization', `Bearer ${retailerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/retailer/store/:batchId', () => {
        test('should retrieve product by batchId', async () => {
            const res = await request(app)
                .get(`/api/retailer/store/${batchId}`)
                .set('Authorization', `Bearer ${retailerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.batchId).toBe(batchId);
            expect(res.body.data.sku).toBe('CARROT-001');
        });
    });

    describe('POST /api/retailer/store/:batchId/sell', () => {
        test('should mark a product as sold', async () => {
            const res = await request(app)
                .post(`/api/retailer/store/${batchId}/sell`)
                .set('Authorization', `Bearer ${retailerToken}`)
                .send({ quantity: 10 });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('processed');
        });
    });

    describe('DELETE /api/retailer/store/:batchId', () => {
        test('should remove product from store', async () => {
            const res = await request(app)
                .delete(`/api/retailer/store/${batchId}`)
                .set('Authorization', `Bearer ${retailerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('removed');

            // Verify it is gone
            const check = await StoreInventory.findOne({ batchId: batchId });
            expect(check).toBeNull();
        });
    });
});
