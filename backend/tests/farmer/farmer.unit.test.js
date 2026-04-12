/**
 * Farmer — Unit Tests
 * Validates batch ID generation logic in isolation.
 */

const { generateBatchId } = require('../../src/utils/batchHelper');

describe('Farmer Unit Tests - Batch Helper', () => {
    
    test('generateBatchId should return a string starting with BATCH-', () => {
        const id = generateBatchId();
        expect(typeof id).toBe('string');
        expect(id.startsWith('BATCH-')).toBe(true);
    });

    test('generateBatchId should generate unique IDs', () => {
        const id1 = generateBatchId();
        const id2 = generateBatchId();
        expect(id1).not.toBe(id2);
    });

    test('generateBatchId should contain a timestamp part', () => {
        const id = generateBatchId();
        const parts = id.split('-');
        expect(parts.length).toBe(3);
        expect(isNaN(parseInt(parts[1]))).toBe(false);
    });
});
