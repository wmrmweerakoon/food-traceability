const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../../src/app');
const ProductBatch = require('../../src/models/ProductBatch');
const User = require('../../src/models/User');
const { connect, closeDatabase, clearDatabase } = require('../setup');

let testBatchId;
let consumerToken, consumerId;

beforeAll(async () => {
    await connect();
    
    // Create a consumer user
    const consumer = await User.create({
        username: 'consumer_int_test',
        email: 'consumer_int@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Consumer',
        role: 'ROLE_CONSUMER'
    });
    consumerId = consumer._id.toString();

    consumerToken = jwt.sign(
        { id: consumer._id, role: consumer.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
    );

    // Seed a product batch
    const batch = await ProductBatch.create({
        batchId: 'BATCH-CONSUMER-INT',
        productName: 'Sweet Strawberries',
        farmerId: new mongoose.Types.ObjectId(), // Mock farmer ID
        harvestDate: new Date(),
        expiryDate: new Date(),
        quantity: 100,
        unit: 'kg'
    });
    testBatchId = batch.batchId;
});

afterAll(async () => {
    await closeDatabase();
});

describe('Consumer Integration API', () => {

    describe('GET /api/consumer/trace/:batchId', () => {
        test('should return full traceability report for valid batchId', async () => {
            const res = await request(app).get(`/api/consumer/trace/${testBatchId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.farm.batchId).toBe(testBatchId);
        });

        test('should return 404 for non-existent batchId', async () => {
            const res = await request(app).get('/api/consumer/trace/INVALID-999');

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/consumer/feedback/:batchId', () => {
        test('should submit anonymous feedback successfully', async () => {
            const res = await request(app)
                .post(`/api/consumer/feedback/${testBatchId}`)
                .send({
                    rating: 5,
                    comment: 'Absolutely fresh and delicious!'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('submitted');
        });
    });

    describe('Profile Management (Protected)', () => {
        test('should update consumer profile successfully', async () => {
            const res = await request(app)
                .put(`/api/consumer/${consumerId}`)
                .set('Authorization', `Bearer ${consumerToken}`)
                .send({
                    firstName: 'UpdatedName'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.firstName).toBe('UpdatedName');
        });

        test('should reject profile update for another user', async () => {
            const res = await request(app)
                .put('/api/consumer/69db0efc566723ed9978a111') // Fake ID
                .set('Authorization', `Bearer ${consumerToken}`)
                .send({ firstName: 'Hacked' });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('should delete consumer account successfully', async () => {
            const res = await request(app)
                .delete(`/api/consumer/${consumerId}`)
                .set('Authorization', `Bearer ${consumerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('deleted');
        });
    });

    describe('GET /api/consumer/health-tip', () => {
        test('should fetch a health tip', async () => {
            const res = await request(app).get('/api/consumer/health-tip');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
    });
});
