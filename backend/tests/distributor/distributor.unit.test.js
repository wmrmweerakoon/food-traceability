/**
 * Distributor — Unit Tests
 * Validates risk assessment and route calculation logic in isolation.
 */

// Mock dependencies
jest.mock('geolib');
const geolib = require('geolib');

const { 
    evaluateRiskFlag, 
    calculateRouteInfo, 
    TEMPERATURE_THRESHOLD 
} = require('../../src/components/distributor/distributorService');

describe('Distributor Unit Tests - Business Logic', () => {

    describe('evaluateRiskFlag', () => {
        test('should return "Normal" for temperature below threshold', () => {
            const temp = TEMPERATURE_THRESHOLD - 1;
            expect(evaluateRiskFlag(temp)).toBe('Normal');
        });

        test('should return "Normal" for temperature at threshold', () => {
            const temp = TEMPERATURE_THRESHOLD;
            expect(evaluateRiskFlag(temp)).toBe('Normal');
        });

        test('should return "High Risk" for temperature above threshold', () => {
            const temp = TEMPERATURE_THRESHOLD + 1;
            expect(evaluateRiskFlag(temp)).toBe('High Risk');
        });
    });

    describe('calculateRouteInfo', () => {
        test('should correctly format distance and duration based on geolib output', () => {
            // Mock geolib.getDistance to return 60,000 meters (60 km)
            geolib.getDistance.mockReturnValue(60000);

            const origin = [77.5946, 12.9716]; // Bangalore
            const destination = [77.6101, 12.9307]; // Koramangala

            const result = calculateRouteInfo(origin, destination);

            expect(result.distance).toBe('60.00 km');
            expect(result.distanceValue).toBe(60000);
            // 60km at 60km/h = 1 hour
            expect(result.duration).toBe('1 hrs');
            expect(result.durationValue).toBe(3600);
        });

        test('should return null and log warning if geolib throws an error', () => {
            geolib.getDistance.mockImplementation(() => {
                throw new Error('Geolib error');
            });

            const result = calculateRouteInfo([0, 0], [1, 1]);
            expect(result).toBeNull();
        });
    });
});
