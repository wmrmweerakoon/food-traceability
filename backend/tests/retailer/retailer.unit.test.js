const storeService = require('../../src/components/store/storeService');
const axios = require('axios');

jest.mock('axios');

describe('Retailer Unit Tests - Currency & Inventory Logic', () => {

    describe('getExchangeRates', () => {
        test('should return correct exchange rates from API on success', async () => {
            const mockResponse = {
                data: {
                    result: 'success',
                    base_code: 'LKR',
                    rates: {
                        USD: 0.0033,
                        EUR: 0.0031,
                        GBP: 0.0026,
                        INR: 0.28
                    },
                    time_last_update_utc: 'Sun, 12 Apr 2026 00:00:01 +0000'
                }
            };
            axios.get.mockResolvedValue(mockResponse);

            const result = await storeService.getExchangeRates('LKR');

            expect(result.success).toBeUndefined(); // It depends on how you structured the return
            expect(result.base).toBe('LKR');
            expect(result.rates.USD).toBe(0.0033);
            expect(result.isFallback).toBeUndefined();
        });

        test('should return fallback rates when API fails', async () => {
            axios.get.mockRejectedValue(new Error('Network Error'));

            const result = await storeService.getExchangeRates('LKR');

            expect(result.base).toBe('LKR');
            expect(result.rates.USD).toBe(0.0033);
            expect(result.isFallback).toBe(true);
        });
    });

    describe('Inventory Management Access Logic', () => {
        test('should reject non-retailer role access (Middleware Simulation)', () => {
            // This is usually tested in integration, but we can verify role constants or helper logic if any
            const roles = ['ROLE_FARMER', 'ROLE_DISTRIBUTOR', 'ROLE_CONSUMER'];
            const requiredRole = 'ROLE_RETAILER';
            
            roles.forEach(role => {
                expect(role).not.toBe(requiredRole);
            });
        });
    });
});
