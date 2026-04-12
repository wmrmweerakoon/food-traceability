/**
 * Consumer — Unit Tests
 * Validates feedback aggregation logic in isolation.
 */

const { getFeedbackByBatch } = require('../../src/components/consumer/traceabilityService');

// Mock models
jest.mock('../../src/models/ProductBatch');
jest.mock('../../src/models/Feedback');

const ProductBatch = require('../../src/models/ProductBatch');
const Feedback = require('../../src/models/Feedback');

describe('Consumer Unit Tests - Traceability Logic', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getFeedbackByBatch', () => {
        test('should calculate average rating correctly for multiple feedbacks', async () => {
            // Mock product batch find
            ProductBatch.findOne.mockResolvedValue({ _id: 'batch123' });

            // Mock feedbacks
            const mockFeedbacks = [
                { rating: 5, comment: 'Great' },
                { rating: 4, comment: 'Good' },
                { rating: 3, comment: 'Okay' }
            ];
            
            // Handle chaining: Feedback.find().populate().sort()
            const sortMock = jest.fn().mockResolvedValue(mockFeedbacks);
            const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
            Feedback.find.mockReturnValue({ populate: populateMock });

            const result = await getFeedbackByBatch('batch123');

            expect(result.totalReviews).toBe(3);
            // (5+4+3)/3 = 4.0
            expect(result.averageRating).toBe(4.0);
            expect(result.reviews).toEqual(mockFeedbacks);
        });

        test('should return 0 average for zero feedbacks', async () => {
            ProductBatch.findOne.mockResolvedValue({ _id: 'batchEmpty' });
            
            const sortMock = jest.fn().mockResolvedValue([]);
            const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
            Feedback.find.mockReturnValue({ populate: populateMock });

            const result = await getFeedbackByBatch('batchEmpty');

            expect(result.totalReviews).toBe(0);
            expect(result.averageRating).toBe(0);
        });
    });
});
