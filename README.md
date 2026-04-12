# 🌿 AgriTrace: Full-Stack Food Traceability Platform

[![Testing Status](https://img.shields.io/badge/Tests-43%2B%20Passing-success)](https://github.com/wmrmweerakoon/food-traceability)
[![Deployment](https://img.shields.io/badge/Deployment-Live-blue)](https://food-traceability-app.vercel.app)

AgriTrace is a high-fidelity food traceability platform designed to ensure transparency and accountability from farm to table. By digitizing every step of the supply chain, we empower consumers to verify the origin, quality, and journey of their food.

---

## 🌐 Live Production Application

> [!IMPORTANT]
> **Production Links for Evaluation:**
> *   **Frontend UI**: [https://food-traceability-app.vercel.app](https://food-traceability-app.vercel.app)
> *   **Backend API**: [https://food-traceability-backend.onrender.com](https://food-traceability-backend.onrender.com)
> *   **Database**: MongoDB Atlas (Cloud Cluster)

---

## 🏗️ Setup Instructions

### i. Prerequisites
- **Node.js**: v20.x or higher
- **NPM**: v10.x or higher
- **MongoDB**: Local installation or MongoDB Atlas account
- **Git**: For version control

### ii. Local Installation (Step-by-Step)
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/wmrmweerakoon/food-traceability.git
    cd food-traceability
    ```
2.  **Install Application Dependencies**:
    ```bash
    # install root workspace tools
    npm install
    # install backend dependencies
    cd backend && npm install
    # install frontend dependencies
    cd ../frontend && npm install
    ```

### iii. Environment Configuration
Create a `.env` file in the **`/backend`** directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=evaluation_secret_key_2026
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the **`/frontend`** directory:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### iv. Development Execution
Open two terminal windows:

**Terminal 1 (Backend Server)**:
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend Client)**:
```bash
cd frontend
npm run dev
```

---

## 📖 API Endpoint Documentation

### Global Requirements
- **Authentication**: JWT Bearer Token required in the `Authorization` header for all private routes.
- **Content-Type**: `application/json`

---

### 🔐 Authentication Service (Auth)

#### 1. User Registration
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Access**: Public
- **Request Format**: 
  - `username`, `email`, `password`, `firstName`, `lastName` (Required)
  - `firstName`, `lastName`, `contactNumber`, `role`, `address` (Optional)
- **Response Format (Success 201)**:
  - `success`: Boolean
  - `data.token`: JWT Access Token
  - `data.user`: User profile object (excluding password)
- **Example Request**:
```json
{
  "username": "maleesha_farmer",
  "email": "farmer@example.com",
  "password": "securePassword123",
  "firstName": "Maleesha",
  "lastName": "Perera",
  "role": "ROLE_FARMER"
}
```

#### 2. User Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Format**: `email`, `password`.
- **Response Format (Success 200)**: includes `token` and `user`.

---

### 👨‍🌾 Farmer Service (Producer)

#### 1. Create Product Batch
- **URL**: `/api/farmer/batches`
- **Method**: `POST`
- **Auth**: Private (Requires `ROLE_FARMER`)
- **Request Format**:
```json
{
  "productName": "Organic Carrots",
  "harvestDate": "2026-04-12",
  "expiryDate": "2026-05-12",
  "quantity": 500,
  "unit": "kg",
  "qualityGrade": "A"
}
```
- **Response Format**: Returns created batch with unique `batchId` and `qrCode` API URL.

---

### 🚛 Distributor Service (Logistics)

#### 1. Add Transport Record
- **URL**: `/api/distributor/transport`
- **Method**: `POST`
- **Auth**: Private (`ROLE_DISTRIBUTOR`)
- **Payload**: `batchId`, `origin`, `destination`, `temperature`.
- **Response Example**:
```json
{
  "success": true,
  "message": "Transport record added",
  "data": { "status": "Initiated", "currentLocation": "Origin Point" }
}
```

---

### 🏪 Retailer Service (Store Management)

#### 1. Add Product to Store
- **URL**: `/api/retailer/inventory`
- **Method**: `POST`
- **Auth**: Private (`ROLE_RETAILER`)
- **Payload**: `batchId`, `productName`, `quantity`, `pricePerUnit`.

---

### 🥗 Consumer Service (Traceability)

#### 1. Get Complete Traceability Report
- **URL**: `/api/consumer/trace/:batchId`
- **Method**: `GET`
- **Access**: Public (QR Code Scan)
- **Response Profile**:
  - `batch`: Origin and harvest data (Farmer)
  - `transport`: All logistics touchpoints (Distributor)
  - `retailer`: Final stock and sale verification (Retailer)

---

## 🚀 Deployment Report (Cloud Hosting)

### i. Backend Platform (Node.js)
- **Platform**: **Render Cloud** (Web Service).
- **Setup Steps**:
  1. Link GitHub repository.
  2. Direct Root Directory to `backend/`.
  3. Commands: Build (`npm install`), Start (`node server.js`).
  4. Environment Variables configured for MongoDB and JWT.

### ii. Frontend Hosting (React)
- **Platform**: **Vercel** (Edge Optimization).
- **Setup Steps**:
  1. Import Project.
  2. Root Directory: `frontend/`.
  3. Inject `VITE_API_BASE_URL` pointing to Render's live URL.

### iii. Active Deployment Evidence
| Render Dashboard | Vercel Analytics |
| :--- | :--- |
| ![Render](./screenshots/render.png) | ![Vercel](./screenshots/vercel.png) |

---

## 🧪 Testing Instruction Report

This project utilizes a robust automated testing infrastructure to ensure 100% endpoint stability.

### i. Unit Testing
Tests individual functions and logic isolation (Pricing, JWT validation).
- **Command**: `npm test` inside `/backend`.

### ii. Integration Testing (Setup and Execution)
Validates the full API lifecycle between different services.
- **Setup**: Tests automatically initialize an isolated environment using the `tests/setup.js` configuration.
- **Execution**: `npm test` runs all integration suites across farmer, distributor, retailer, and consumer roles.

### iii. Performance Testing (Setup and Execution)
Simulates high concurrent traffic load using **Artillery.io**.
- **Setup**: Install artillery (`npm install -g artillery`).
- **Execution**: `npm run test:load`.
- **Reporting**: `npm run test:load:cloud` (Visual performance dashboards).

### iv. Testing Environment Configuration Details
1.  **Isolation**: We use `mongodb-memory-server` to run a temporary, in-memory MongoDB instance for every test session.
2.  **State Management**: `beforeAll` and `afterEach` hooks in `setup.js` handle automatic database cleanup and connection persistence.
3.  **Mocking**: Authentication is bypassed or mocked using auto-generated test tokens to ensure tests focus on business logic.

---

## 👥 Group Details
- **Group ID**: [Your Group ID]
- **Members**:
    - [Name 1] (ID: [ID 1])
    - [Name 2] (ID: [ID 2])
    - [Name 3] (ID: [ID 3])
    - [Name 4] (ID: [ID 4])

---
Developed for the SLIIT Application Framework (AF) Module evaluation. 🌿
