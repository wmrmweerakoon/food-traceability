const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

// Models
const User = require('../../src/models/User');
const ProductBatch = require('../../src/models/ProductBatch');
const TransportDetails = require('../../src/models/TransportDetails');

let mongoServer;

// Test user data
const distributorUser = {
    _id: new mongoose.Types.ObjectId(),
    username: 'distributor1',
    email: 'distributor@test.com',
    password: 'hashedpassword',
    role: 'ROLE_DISTRIBUTOR',
    firstName: 'Test',
    lastName: 'Distributor',
};

const farmerUser = {
    _id: new mongoose.Types.ObjectId(),
    username: 'farmer1',
    email: 'farmer@test.com',
    password: 'hashedpassword',
    role: 'ROLE_FARMER',
    firstName: 'Test',
    lastName: 'Farmer',
};

const consumerUser = {
    _id: new mongoose.Types.ObjectId(),
    username: 'consumer1',
    email: 'consumer@test.com',
    password: 'hashedpassword',
    role: 'ROLE_CONSUMER',
    firstName: 'Test',
    lastName: 'Consumer',
};

// Generate JWT tokens for test users
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id.toString(), role: user.role, email: user.email },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        { expiresIn: '1h' }
    );
};

let distributorToken, farmerToken, consumerToken;

// Test batch data
let testBatchA, testBatchB;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Disconnect any existing connections
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(mongoUri);

    // Create test users
    await User.create(distributorUser);
    await User.create(farmerUser);
    await User.create(consumerUser);

    // Generate tokens
    distributorToken = generateToken(distributorUser);
    farmerToken = generateToken(farmerUser);
    consumerToken = generateToken(consumerUser);

    // Create test product batches
    testBatchA = await ProductBatch.create({
        batchId: 'BATCH-TEST-A',
        productName: 'Organic Tomatoes',
        farmerId: farmerUser._id,
        harvestDate: new Date('2026-02-20'),
        expiryDate: new Date('2026-03-20'),
        quantity: 500,
        unit: 'kg',
        qualityGrade: 'A',
    });

    testBatchB = await ProductBatch.create({
        batchId: 'BATCH-TEST-B',
        productName: 'Fresh Apples',
        farmerId: farmerUser._id,
        harvestDate: new Date('2026-02-22'),
        expiryDate: new Date('2026-03-22'),
        quantity: 300,
        unit: 'kg',
        qualityGrade: 'Premium',
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

afterEach(async () => {
    // Clean up transport records between tests
    await TransportDetails.deleteMany({});
});

// ────────────────────────────────────────────────────────────────────────────────
// TEST 1: Unauthorized Access
// ────────────────────────────────────────────────────────────────────────────────
describe('Unauthorized Access', () => {
    test('should reject POST /api/distributor/transport without auth token', async () => {
        const res = await request(app)
            .post('/api/distributor/transport')
            .send({
                batchId: testBatchA._id,
                vehicleNumber: 'KA-01-1234',
                currentLocation: 'Bangalore',
                storageTemperature: 4,
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test('should reject POST /api/distributor/transport from ROLE_CONSUMER', async () => {
        const res = await request(app)
            .post('/api/distributor/transport')
            .set('Authorization', `Bearer ${consumerToken}`)
            .send({
                batchId: testBatchA._id,
                vehicleNumber: 'KA-01-1234',
                currentLocation: 'Bangalore',
                storageTemperature: 4,
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });

    test('should reject POST /api/distributor/transport from ROLE_FARMER', async () => {
        const res = await request(app)
            .post('/api/distributor/transport')
            .set('Authorization', `Bearer ${farmerToken}`)
            .send({
                batchId: testBatchA._id,
                vehicleNumber: 'KA-01-1234',
                currentLocation: 'Bangalore',
                storageTemperature: 4,
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────────
// TEST 2: Data Integrity — Batch Isolation
// ────────────────────────────────────────────────────────────────────────────────
describe('Data Integrity', () => {
    test('updating temperature for Batch A should NOT affect Batch B', async () => {
        // Create transport for Batch A
        await request(app)
            .post('/api/distributor/transport')
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({
                batchId: testBatchA._id,
                vehicleNumber: 'KA-01-1234',
                currentLocation: 'Bangalore',
                storageTemperature: 4,
            });

        // Create transport for Batch B
        await request(app)
            .post('/api/distributor/transport')
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({
                batchId: testBatchB._id,
                vehicleNumber: 'KA-02-5678',
                currentLocation: 'Mumbai',
                storageTemperature: 3,
            });

        // Update Batch A temperature to 12°C (High Risk)
        await request(app)
            .put(`/api/distributor/transport/${testBatchA._id}`)
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({ storageTemperature: 12 });

        // Verify Batch B is untouched
        const batchBRes = await request(app)
            .get(`/api/distributor/transport/${testBatchB._id}`)
            .set('Authorization', `Bearer ${distributorToken}`);

        expect(batchBRes.body.data.transport.storageTemperature).toBe(3);
        expect(batchBRes.body.data.transport.riskFlag).toBe('Normal');

        // Verify Batch A has updated values
        const batchARes = await request(app)
            .get(`/api/distributor/transport/${testBatchA._id}`)
            .set('Authorization', `Bearer ${distributorToken}`);

        expect(batchARes.body.data.transport.storageTemperature).toBe(12);
        expect(batchARes.body.data.transport.riskFlag).toBe('High Risk');
    });
});

// ────────────────────────────────────────────────────────────────────────────────
// TEST 3: API Integration — Location Processing (Mock geolib)
// ────────────────────────────────────────────────────────────────────────────────
describe('API Integration — Location Processing', () => {
    test('should process location strings and store them correctly', async () => {
        const res = await request(app)
            .post('/api/distributor/transport')
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({
                batchId: testBatchA._id,
                vehicleNumber: 'KA-01-1234',
                currentLocation: 'Whitefield, Bangalore, Karnataka',
                storageTemperature: 4,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.currentLocation).toBe('Whitefield, Bangalore, Karnataka');
    });

    test('should calculate route info when coordinates are provided', async () => {
        const res = await request(app)
            .post('/api/distributor/transport')
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({
                batchId: testBatchA._id,
                vehicleNumber: 'KA-01-1234',
                currentLocation: 'Bangalore',
                storageTemperature: 4,
                origin: {
                    locationName: 'Farm A',
                    coordinates: [77.5946, 12.9716], // Bangalore
                },
                destination: {
                    locationName: 'Warehouse B',
                    coordinates: [72.8777, 19.076],  // Mumbai
                },
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.data).toBeDefined();
    });
});

// ────────────────────────────────────────────────────────────────────────────────
// TEST 4: Status Flow Validation
// ────────────────────────────────────────────────────────────────────────────────
describe('Status Flow Validation', () => {
    test('should NOT allow "Delivered" without deliveryDate and warehouseLocation', async () => {
        // Create transport
        await request(app)
            .post('/api/distributor/transport')
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({
                batchId: testBatchA._id,
                vehicleNumber: 'KA-01-1234',
                currentLocation: 'Bangalore',
                storageTemperature: 4,
            });

        // Try to mark Delivered without required fields
        const res = await request(app)
            .put(`/api/distributor/transport/${testBatchA._id}`)
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({ deliveryStatus: 'Delivered' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('deliveryDate');
        expect(res.body.message).toContain('warehouseLocation');
    });

    test('should allow "Delivered" when deliveryDate AND warehouseLocation are provided', async () => {
        // Create transport
        await request(app)
            .post('/api/distributor/transport')
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({
                batchId: testBatchA._id,
                vehicleNumber: 'KA-01-1234',
                currentLocation: 'Bangalore',
                storageTemperature: 4,
            });

        // Mark Delivered with all required fields
        const res = await request(app)
            .put(`/api/distributor/transport/${testBatchA._id}`)
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({
                deliveryStatus: 'Delivered',
                deliveryDate: '2026-02-26T10:00:00Z',
                warehouseLocation: 'Mumbai Central Warehouse',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.deliveryStatus).toBe('Delivered');
        expect(res.body.data.warehouseLocation).toBe('Mumbai Central Warehouse');
    });
});

// ────────────────────────────────────────────────────────────────────────────────
// TEST 5: Temperature Threshold — Risk Flagging
// ────────────────────────────────────────────────────────────────────────────────
describe('Temperature Threshold — Risk Flagging', () => {
    test('storageTemperature <= 8°C should have riskFlag "Normal"', async () => {
        const res = await request(app)
            .post('/api/distributor/transport')
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({
                batchId: testBatchA._id,
                vehicleNumber: 'KA-01-1234',
                currentLocation: 'Bangalore',
                storageTemperature: 4,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.riskFlag).toBe('Normal');
    });

    test('storageTemperature > 8°C should flag as "High Risk"', async () => {
        const res = await request(app)
            .post('/api/distributor/transport')
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({
                batchId: testBatchA._id,
                vehicleNumber: 'KA-01-1234',
                currentLocation: 'Bangalore',
                storageTemperature: 12,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.riskFlag).toBe('High Risk');
    });

    test('updating temperature above threshold should change riskFlag to "High Risk"', async () => {
        // Create with normal temp
        await request(app)
            .post('/api/distributor/transport')
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({
                batchId: testBatchA._id,
                vehicleNumber: 'KA-01-1234',
                currentLocation: 'Bangalore',
                storageTemperature: 4,
            });

        // Update temp above threshold
        const res = await request(app)
            .put(`/api/distributor/transport/${testBatchA._id}`)
            .set('Authorization', `Bearer ${distributorToken}`)
            .send({ storageTemperature: 15 });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.riskFlag).toBe('High Risk');
        expect(res.body.data.storageTemperature).toBe(15);
    });
});
