# Component 3 – Retailer Store & Expiry Management Service

## Overview

This component manages retail store inventory and ensures food safety through automated expiry validation. It bridges the gap between distribution and consumers by tracking which product batches are available at which retail locations, and enforces shelf-life safety thresholds using the [OpenFoodFacts API](https://world.openfoodfacts.org/).

---

## Architecture

```
storeRoutes.js → storeController.js → storeService.js → Models (StoreInventory, RetailStore, ProductBatch)
                                            ↓
                                    OpenFoodFacts API
```

**Pattern:** Route → Controller → Service → Model (Clean Architecture)

---

## MongoDB Schemas

### RetailStore (`RetailStore.js`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `shopName` | String | Yes | Name of the retail store |
| `location` | String | Yes | Physical location/address |
| `managerId` | ObjectId → User | Yes | Store manager (ROLE_RETAILER) |
| `createdAt` | Date | Auto | Mongoose timestamp |
| `updatedAt` | Date | Auto | Mongoose timestamp |

### StoreInventory (`StoreInventory.js`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `batchId` | String | Yes | — | Links to ProductBatch.batchId |
| `storeId` | ObjectId → RetailStore | Yes | — | The retail store holding this product |
| `shelfDate` | Date | No | `Date.now` | When the product was placed on shelf |
| `expiryDate` | Date | Yes | — | Calculated or manual expiry date |
| `isAvailable` | Boolean | No | `true` | Whether the product is still available |
| `createdAt` | Date | Auto | — | Mongoose timestamp |
| `updatedAt` | Date | Auto | — | Mongoose timestamp |

---

## OpenFoodFacts Integration

### How It Works

1. **Retailer inputs** a `batchId` and optional `shelfDate`
2. The service looks up the `ProductBatch` to get the `productName`
3. System queries OpenFoodFacts search API: `GET /cgi/search.pl?search_terms={productName}&json=1`
4. Parses the `shelf_life` field from the first matching product
5. Calculates `expiryDate = shelfDate + shelf_life_in_days`

### Shelf Life Parsing

The `parseShelfLifeToDays()` function handles common formats:

| Input | Output (days) |
|-------|---------------|
| `"7 days"` | 7 |
| `"2 weeks"` | 14 |
| `"3 months"` | 90 |
| `"1 year"` | 365 |

### Safety Validation

- If the API returns a shelf life, the system **rejects** any manual expiry date that exceeds `shelfDate + shelfLifeDays`
- If the API is **unreachable**, the system falls back to accepting manual entry

### Fallback Mechanism

When the OpenFoodFacts API is unavailable:
- The system logs a warning and returns `null` for shelf life
- Manual `expiryDate` entry is accepted without restriction
- The response indicates `apiUsed: false`

---

## API Endpoints

All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

### POST `/api/store`
**Access:** `ROLE_RETAILER`

Add a product batch to the store inventory.

**Request Body:**
```json
{
  "batchId": "BATCH-12345-ABCDEF",
  "storeId": "507f1f77bcf86cd799439033",
  "shelfDate": "2026-03-01",
  "expiryDate": "2026-03-08"
}
```

- `batchId` (required) — The ProductBatch batchId string
- `storeId` (required) — The RetailStore ObjectId
- `shelfDate` (optional) — Defaults to current date
- `expiryDate` (optional) — If API provides shelf life, this is validated against it

**Response (201):**
```json
{
  "success": true,
  "message": "Product added to store successfully",
  "data": {
    "inventory": { "batchId": "...", "storeId": "...", "shelfDate": "...", "expiryDate": "...", "isAvailable": true },
    "shelfLifeDays": 7,
    "apiUsed": true
  }
}
```

### GET `/api/store/:batchId`
**Access:** `ROLE_RETAILER`, `ROLE_ADMIN`

Retrieve store inventory details for a specific batch.

### PUT `/api/store/:batchId`
**Access:** `ROLE_RETAILER`

Update inventory item fields. Common use: marking a product as sold.

**Request Body:**
```json
{
  "isAvailable": false
}
```

### DELETE `/api/store/:batchId`
**Access:** `ROLE_RETAILER`

Remove a product from the store inventory.

---

## Running Tests

```bash
cd /path/to/food-traceability/backend
npm install --save-dev jest
npx jest tests/store.test.js --verbose
```

Tests cover:
1. **API Integration** — Mocked OpenFoodFacts responses for correct date calculation
2. **Safety Restriction** — Rejection of expiry dates exceeding API threshold
3. **Status Toggle** — `isAvailable` toggling for sold/available states
4. **Role Security** — Verification that `ROLE_FARMER` is denied access
