const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const ProductBatch = require('../../src/models/ProductBatch');
const { connect, closeDatabase, clearDatabase } = require('../setup');

let farmerToken, farmerId;

beforeAll(async () => {
    await connect();

    // Create a farmer user
    const farmer = await User.create({
        username: 'farmer_int_test',
        email: 'farmer_int@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Farmer',
        role: 'ROLE_FARMER'
    });
    farmerId = farmer._id;

    farmerToken = jwt.sign(
        { id: farmer._id, role: farmer.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
    );
});

afterAll(async () => {
    await closeDatabase();
});

beforeEach(async () => {
    await clearDatabase();
    // Re-create user after clear if needed or keep User collection
    await User.create({
        _id: farmerId,
        username: 'farmer_int_test',
        email: 'farmer_int@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Farmer',
        role: 'ROLE_FARMER'
    });
});

describe('Farmer Batch Management API', () => {

    describe('POST /api/farmer/batches', () => {
        test('should create a new batch with valid data', async () => {
            const res = await request(app)
                .post('/api/farmer/batches')
                .set('Authorization', `Bearer ${farmerToken}`)
                .send({
                    productName: 'Organic Tomatoes',
                    harvestDate: '2026-02-20',
                    expiryDate: '2026-03-20',
                    quantity: 500,
                    unit: 'kg',
                    qualityGrade: 'A'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.productName).toBe('Organic Tomatoes');
            expect(res.body.data.batchId).toBeDefined();
            expect(res.body.data.qrCode).toBeDefined();
        });

        test('should fail if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/farmer/batches')
                .set('Authorization', `Bearer ${farmerToken}`)
                .send({ productName: '' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('should fail if user is not a farmer', async () => {
            const consumerToken = jwt.sign(
                { id: new User()._id, role: 'ROLE_CONSUMER' },
                process.env.JWT_SECRET || 'your-secret-key'
            );

            const res = await request(app)
                .post('/api/farmer/batches')
                .set('Authorization', `Bearer ${consumerToken}`)
                .send({ productName: 'Test' });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/farmer/batches', () => {
        test('should return all batches for the authenticated farmer', async () => {
            // Seed a batch
            await ProductBatch.create({
                batchId: 'B-001',
                productName: 'Apples',
                farmerId: farmerId,
                harvestDate: new Date(),
                expiryDate: new Date(),
                quantity: 10,
                unit: 'kg'
            });

            const res = await request(app)
                .get('/api/farmer/batches')
                .set('Authorization', `Bearer ${farmerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].productName).toBe('Apples');
        });
    });

    describe('GET /api/farmer/batches/:id', () => {
        test('should return a specific batch by ID', async () => {
            const batch = await ProductBatch.create({
                batchId: 'B-SPECIFIC',
                productName: 'Specific Crop',
                farmerId: farmerId,
                harvestDate: new Date(),
                expiryDate: new Date(),
                quantity: 10,
                unit: 'kg'
            });

            const res = await request(app)
                .get(`/api/farmer/batches/${batch._id}`)
                .set('Authorization', `Bearer ${farmerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.productName).toBe('Specific Crop');
        });

        test('should return 404 for non-existent batch', async () => {
            const fakeId = new User()._id;
            const res = await request(app)
                .get(`/api/farmer/batches/${fakeId}`)
                .set('Authorization', `Bearer ${farmerToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/farmer/batches/:id', () => {
        test('should delete a batch owned by the farmer', async () => {
            const batch = await ProductBatch.create({
                batchId: 'B-DELETE',
                productName: 'To Delete',
                farmerId: farmerId,
                harvestDate: new Date(),
                expiryDate: new Date(),
                quantity: 10,
                unit: 'kg'
            });

            const res = await request(app)
                .delete(`/api/farmer/batches/${batch._id}`)
                .set('Authorization', `Bearer ${farmerToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('deleted');

            const check = await ProductBatch.findById(batch._id);
            expect(check).toBeNull();
        });

        test('should not allow deleting another farmer\'s batch', async () => {
            const otherFarmerId = new User()._id;
            const otherBatch = await ProductBatch.create({
                batchId: 'B-OTHER',
                productName: 'Other Farmer Crop',
                farmerId: otherFarmerId,
                harvestDate: new Date(),
                expiryDate: new Date(),
                quantity: 10,
                unit: 'kg'
            });

            const res = await request(app)
                .delete(`/api/farmer/batches/${otherBatch._id}`)
                .set('Authorization', `Bearer ${farmerToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/farmer/batches/:id', () => {
        test('should update an existing batch with valid data', async () => {
            const batch = await ProductBatch.create({
                batchId: 'B-UPDATE',
                productName: 'Old Apples',
                farmerId: farmerId,
                harvestDate: new Date(),
                expiryDate: new Date(),
                quantity: 10,
                unit: 'kg'
            });

            const res = await request(app)
                .put(`/api/farmer/batches/${batch._id}`)
                .set('Authorization', `Bearer ${farmerToken}`)
                .send({
                    productName: 'Updated Apples',
                    quantity: 25
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.productName).toBe('Updated Apples');
            expect(res.body.data.quantity).toBe(25);
        });

        test('should reject updates to batches owned by others', async () => {
            const otherBatch = await ProductBatch.create({
                batchId: 'B-OTHER-UP',
                productName: 'Not Mine',
                farmerId: new mongoose.Types.ObjectId(),
                harvestDate: new Date(),
                expiryDate: new Date(),
                quantity: 10,
                unit: 'kg'
            });

            const res = await request(app)
                .put(`/api/farmer/batches/${otherBatch._id}`)
                .set('Authorization', `Bearer ${farmerToken}`)
                .send({ productName: 'Hacked' });

            expect(res.statusCode).toBe(403);
        });
    });
});
