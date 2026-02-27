/**
 * Store & Expiry Management — Unit Tests
 * Tests cover: OpenFoodFacts integration, safety restrictions,
 * status toggling, and role-based security.
 */

// ── Mock axios before importing the service ──
jest.mock('axios');
const axios = require('axios');

// ── Mock Mongoose models ──
jest.mock('../../src/models/StoreInventory');
jest.mock('../../src/models/ProductBatch');
jest.mock('../../src/models/RetailStore');

const StoreInventory = require('../../src/models/StoreInventory');
const ProductBatch = require('../../src/models/ProductBatch');
const RetailStore = require('../../src/models/RetailStore');

const {
    fetchShelfLifeFromOpenFoodFacts,
    parseShelfLifeToDays,
    addProductToStore,
    updateStoreProduct,
    getStoreProduct,
    removeProduct
} = require('../../src/components/store/storeService');

// ── Helpers ──
const mockProductBatch = {
    _id: '507f1f77bcf86cd799439011',
    batchId: 'BATCH-12345',
    productName: 'Fresh Apples',
    farmerId: '507f1f77bcf86cd799439022',
    harvestDate: new Date('2026-02-20'),
    expiryDate: new Date('2026-03-20')
};

const mockStore = {
    _id: '507f1f77bcf86cd799439033',
    shopName: 'Green Grocery',
    location: 'Colombo',
    managerId: '507f1f77bcf86cd799439044'
};

// ── Test Suites ──

describe('Store Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // 1. API Integration — Correct date calculation
    // ─────────────────────────────────────────────
    describe('OpenFoodFacts API Integration', () => {
        test('parseShelfLifeToDays parses "7 days" correctly', () => {
            expect(parseShelfLifeToDays('7 days')).toBe(7);
        });

        test('parseShelfLifeToDays parses "2 weeks" correctly', () => {
            expect(parseShelfLifeToDays('2 weeks')).toBe(14);
        });

        test('parseShelfLifeToDays parses "3 months" correctly', () => {
            expect(parseShelfLifeToDays('3 months')).toBe(90);
        });

        test('parseShelfLifeToDays parses "1 year" correctly', () => {
            expect(parseShelfLifeToDays('1 year')).toBe(365);
        });

        test('parseShelfLifeToDays returns null for invalid input', () => {
            expect(parseShelfLifeToDays(null)).toBeNull();
            expect(parseShelfLifeToDays('')).toBeNull();
            expect(parseShelfLifeToDays('unknown')).toBeNull();
        });

        test('fetchShelfLifeFromOpenFoodFacts returns shelf life days on success', async () => {
            axios.get.mockResolvedValue({
                data: {
                    products: [
                        { product_name: 'Apple', shelf_life: '14 days' }
                    ]
                }
            });

            const result = await fetchShelfLifeFromOpenFoodFacts('Apple');
            expect(result).toBe(14);
            expect(axios.get).toHaveBeenCalledTimes(1);
        });

        test('fetchShelfLifeFromOpenFoodFacts returns null when API has no shelf_life', async () => {
            axios.get.mockResolvedValue({
                data: {
                    products: [
                        { product_name: 'Apple' } // no shelf_life field
                    ]
                }
            });

            const result = await fetchShelfLifeFromOpenFoodFacts('Apple');
            expect(result).toBeNull();
        });

        test('fetchShelfLifeFromOpenFoodFacts returns null when API is unreachable', async () => {
            axios.get.mockRejectedValue(new Error('Network Error'));

            const result = await fetchShelfLifeFromOpenFoodFacts('Apple');
            expect(result).toBeNull();
        });

        test('addProductToStore calculates expiryDate correctly from API shelf life', async () => {
            const shelfDate = new Date('2026-03-01');

            ProductBatch.findOne.mockResolvedValue(mockProductBatch);
            RetailStore.findById.mockResolvedValue(mockStore);

            // Mock OpenFoodFacts: 7 days shelf life
            axios.get.mockResolvedValue({
                data: {
                    products: [{ product_name: 'Fresh Apples', shelf_life: '7 days' }]
                }
            });

            const saveMock = jest.fn().mockImplementation(function () {
                return Promise.resolve(this);
            });

            StoreInventory.mockImplementation((data) => ({
                ...data,
                save: saveMock
            }));

            const result = await addProductToStore('BATCH-12345', mockStore._id, shelfDate);

            expect(result.shelfLifeDays).toBe(7);
            expect(result.apiUsed).toBe(true);

            // Verify the expiry date is shelfDate + 7 days = March 8
            const expectedExpiry = new Date('2026-03-08');
            const savedExpiryDate = saveMock.mock.instances[0].expiryDate;
            expect(savedExpiryDate.toISOString().split('T')[0]).toBe(
                expectedExpiry.toISOString().split('T')[0]
            );
        });
    });

    // ─────────────────────────────────────────────
    // 2. Safety Restriction — Reject exceeding expiry
    // ─────────────────────────────────────────────
    describe('Safety Restriction', () => {
        test('rejects manual expiry date that exceeds API-suggested shelf life', async () => {
            const shelfDate = new Date('2026-03-01');
            const manualExpiry = new Date('2026-04-01'); // Way beyond 7 days

            ProductBatch.findOne.mockResolvedValue(mockProductBatch);
            RetailStore.findById.mockResolvedValue(mockStore);

            // Mock OpenFoodFacts: 7 days shelf life
            axios.get.mockResolvedValue({
                data: {
                    products: [{ product_name: 'Fresh Apples', shelf_life: '7 days' }]
                }
            });

            await expect(
                addProductToStore('BATCH-12345', mockStore._id, shelfDate, manualExpiry)
            ).rejects.toThrow('exceeds the API-suggested shelf life');
        });

        test('accepts manual expiry date within API-suggested shelf life', async () => {
            const shelfDate = new Date('2026-03-01');
            const manualExpiry = new Date('2026-03-05'); // Within 7 days

            ProductBatch.findOne.mockResolvedValue(mockProductBatch);
            RetailStore.findById.mockResolvedValue(mockStore);

            axios.get.mockResolvedValue({
                data: {
                    products: [{ product_name: 'Fresh Apples', shelf_life: '7 days' }]
                }
            });

            const saveMock = jest.fn().mockImplementation(function () {
                return Promise.resolve(this);
            });

            StoreInventory.mockImplementation((data) => ({
                ...data,
                save: saveMock
            }));

            const result = await addProductToStore('BATCH-12345', mockStore._id, shelfDate, manualExpiry);

            expect(result.apiUsed).toBe(true);
            // Should use the manual expiry, not the calculated one
            const savedExpiryDate = saveMock.mock.instances[0].expiryDate;
            expect(savedExpiryDate.toISOString().split('T')[0]).toBe('2026-03-05');
        });

        test('allows manual entry when API is unreachable (fallback)', async () => {
            const shelfDate = new Date('2026-03-01');
            const manualExpiry = new Date('2026-04-01');

            ProductBatch.findOne.mockResolvedValue(mockProductBatch);
            RetailStore.findById.mockResolvedValue(mockStore);

            // API fails
            axios.get.mockRejectedValue(new Error('Network Error'));

            const saveMock = jest.fn().mockImplementation(function () {
                return Promise.resolve(this);
            });

            StoreInventory.mockImplementation((data) => ({
                ...data,
                save: saveMock
            }));

            const result = await addProductToStore('BATCH-12345', mockStore._id, shelfDate, manualExpiry);

            expect(result.apiUsed).toBe(false);
            expect(result.shelfLifeDays).toBeNull();
        });
    });

    // ─────────────────────────────────────────────
    // 3. Status Toggle — isAvailable update
    // ─────────────────────────────────────────────
    describe('Status Toggle', () => {
        test('marking product as "Sold" sets isAvailable to false', async () => {
            const mockInventoryItem = {
                _id: '507f1f77bcf86cd799439055',
                batchId: 'BATCH-12345',
                storeId: mockStore._id,
                isAvailable: true,
                save: jest.fn().mockImplementation(function () {
                    return Promise.resolve(this);
                })
            };

            StoreInventory.findOne.mockResolvedValue(mockInventoryItem);

            const result = await updateStoreProduct('BATCH-12345', { isAvailable: false });

            expect(result.isAvailable).toBe(false);
            expect(mockInventoryItem.save).toHaveBeenCalledTimes(1);
        });

        test('marking product as "Available" sets isAvailable to true', async () => {
            const mockInventoryItem = {
                _id: '507f1f77bcf86cd799439055',
                batchId: 'BATCH-12345',
                storeId: mockStore._id,
                isAvailable: false,
                save: jest.fn().mockImplementation(function () {
                    return Promise.resolve(this);
                })
            };

            StoreInventory.findOne.mockResolvedValue(mockInventoryItem);

            const result = await updateStoreProduct('BATCH-12345', { isAvailable: true });

            expect(result.isAvailable).toBe(true);
        });
    });

    // ─────────────────────────────────────────────
    // 4. Role Security (via Controller + Middleware)
    // ─────────────────────────────────────────────
    describe('Role Security', () => {
        const { authorizeRoles } = require('../../src/middleware/auth');

        test('authorizeRoles rejects ROLE_FARMER for ROLE_RETAILER route', () => {
            const middleware = authorizeRoles('ROLE_RETAILER');

            const req = { user: { role: 'ROLE_FARMER' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('Access denied')
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        test('authorizeRoles allows ROLE_RETAILER for ROLE_RETAILER route', () => {
            const middleware = authorizeRoles('ROLE_RETAILER');

            const req = { user: { role: 'ROLE_RETAILER' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('authorizeRoles allows ROLE_ADMIN for retailer/admin route', () => {
            const middleware = authorizeRoles('ROLE_RETAILER', 'ROLE_ADMIN');

            const req = { user: { role: 'ROLE_ADMIN' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    // ─────────────────────────────────────────────
    // 5. CRUD — getStoreProduct and removeProduct
    // ─────────────────────────────────────────────
    describe('CRUD Operations', () => {
        test('getStoreProduct returns populated inventory item', async () => {
            const populateMock = jest.fn().mockResolvedValue({
                batchId: 'BATCH-12345',
                storeId: mockStore,
                isAvailable: true
            });

            StoreInventory.findOne.mockReturnValue({
                populate: populateMock
            });

            const result = await getStoreProduct('BATCH-12345');

            expect(result.batchId).toBe('BATCH-12345');
            expect(result.storeId).toEqual(mockStore);
            expect(StoreInventory.findOne).toHaveBeenCalledWith({ batchId: 'BATCH-12345' });
        });

        test('getStoreProduct throws when not found', async () => {
            StoreInventory.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await expect(getStoreProduct('BATCH-MISSING')).rejects.toThrow('not found');
        });

        test('removeProduct deletes the record', async () => {
            StoreInventory.findOne.mockResolvedValue({
                batchId: 'BATCH-12345'
            });
            StoreInventory.deleteOne.mockResolvedValue({ deletedCount: 1 });

            const result = await removeProduct('BATCH-12345');

            expect(result.message).toContain('removed');
            expect(StoreInventory.deleteOne).toHaveBeenCalledWith({ batchId: 'BATCH-12345' });
        });

        test('removeProduct throws when not found', async () => {
            StoreInventory.findOne.mockResolvedValue(null);

            await expect(removeProduct('BATCH-MISSING')).rejects.toThrow('not found');
        });
    });
});
