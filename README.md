# 🌿 AgriTrace: Blockchain-Inspired Food Traceability System

[![Testing Status](https://img.shields.io/badge/Tests-43%2B%20Passing-success)](https://github.com/wmrmweerakoon/food-traceability)
[![Deployment](https://img.shields.io/badge/Deployment-Live-blue)](https://food-traceability-app.vercel.app)

AgriTrace is a high-fidelity food traceability platform designed to ensure transparency and accountability from farm to table. By digitizing every step of the supply chain, we empower consumers to verify the origin, quality, and journey of their food.

---

## 🌐 Live Production Links

*   **Frontend UI**: [https://food-traceability-app.vercel.app](https://food-traceability-app.vercel.app)
*   **Backend API**: [https://food-traceability-backend.onrender.com](https://food-traceability-backend.onrender.com)
*   **Database**: MongoDB Atlas (Cloud Cluster)

---

## 🏗️ Setup Instructions

### i. Prerequisites
- **Node.js**: v18.x or higher
- **NPM**: v9.x or higher
- **MongoDB**: Local installation or MongoDB Atlas account
- **Git**: For version control

### ii. Local Installation (Step-by-Step)
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/wmrmweerakoon/food-traceability.git
    cd food-traceability
    ```
2.  **Install Global Workspace Dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Backend**:
    ```bash
    cd backend
    npm install
    # Create a .env file (see Configuration section)
    ```
4.  **Setup Frontend**:
    ```bash
    cd ../frontend
    npm install
    # Create a .env file (see Configuration section)
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

### iv. Running the Application
Open two terminal windows:

**Terminal 1 (Backend)**:
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

---

## 📖 API Endpoint Documentation

### Authentication Requirements
- **Public**: No authentication needed.
- **Private (User)**: Requires a valid JWT Bearer Token in the `Authorization` header.
- **Role-Based**: Requires a JWT token and a specific user role (Farmer, Distributor, etc.).

---

### 🔐 Authentication Service

#### 1. User Registration
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Access**: Public
- **Request Format**: `application/json`
- **Payload Example**:
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
- **Success Response (201)**:
```json
{
  "success": true,
  "data": { "token": "eyJhbG...", "user": { "id": "...", "role": "ROLE_FARMER" } }
}
```

#### 2. User Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Access**: Public
- **Payload Example**:
```json
{
  "email": "farmer@example.com",
  "password": "securePassword123"
}
```
- **Success Response (200)**: returns JWT token and user profile.

---

### 👨‍🌾 Farmer Service (Batch Management)

#### 1. Create Product Batch
- **URL**: `/api/farmer/batches`
- **Method**: `POST`
- **Access**: Private (Role: `ROLE_FARMER`)
- **Payload**:
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
- **Response**: Returns the created batch with a unique `batchId` and a generated QR Code URL.

---

### 🚛 Distributor Service (Logistics)

#### 1. Initiate Transport
- **URL**: `/api/distributor/transport`
- **Method**: `POST`
- **Access**: Private (Role: `ROLE_DISTRIBUTOR`)
- **Payload**:
```json
{
  "batchId": "BATCH-123456",
  "origin": "Colombo Farm",
  "destination": "Kandy Warehouse",
  "temperature": 4.5
}
```

#### 2. Update Logistics Status
- **URL**: `/api/distributor/transport/:batchId`
- **Method**: `PUT`
- **Payload**:
```json
{
  "status": "In Transit",
  "currentLocation": { "lat": 6.9271, "lng": 79.8612 }
}
```

---

### 🥗 Consumer Service (Traceability)

#### 1. View Product Journey
- **URL**: `/api/consumer/trace/:batchId`
- **Method**: `GET`
- **Access**: Public
- **Response**:
```json
{
  "success": true,
  "data": {
    "batch": { "productName": "...", "harvestDate": "..." },
    "transport": [ { "status": "Delivered", "timestamp": "..." } ],
    "retailer": { "shopName": "SuperMart", "saleDate": "..." }
  }
}
```

---

## 🚀 Deployment Report

### Platforms & Infrastructure
- **Backend Deployment**: Hosted on **Render** (Node.js Workspace).
- **Frontend Deployment**: Hosted on **Vercel** (Vite Optimized).
- **Database Architecture**: **MongoDB Atlas** (Global Cloud Cluster).

### Setup & Evidence
1.  **Source Control**: Unified GitHub repository with automated CI/CD triggers.
2.  **Environment Sync**: Secrets managed via platform-native vault (Render Envs/Vercel Envs).
3.  **Live Evidence**:
    | Render Backend (Success) | Vercel Frontend (Success) |
    | :--- | :--- |
    | ![Render](./screenshots/render.png) | ![Vercel](./screenshots/vercel.png) |

---

## 🧪 Testing Instruction Report

### i. Testing Architecture
The project employs a three-tier testing strategy: **Unit**, **Integration**, and **Performance**.

### ii. Local Test Execution
To run the full suite (43+ cases) locally:
```bash
cd backend
npm test
```

### iii. Performance Testing Execution
Managed via **Artillery.io**:
1. **Setup**: `npm install -g artillery`
2. **Execution**: `npm run test:load` (Simulates 250+ users)
3. **Cloud Reporting**: `npm run test:load:cloud`

### iv. Integration Testing Details
Integration tests validate the end-to-end data flow between components (e.g., ensuring a batch created by a Farmer is visible to a Consumer).
- **Tooling**: `supertest` + `jest`.
- **Command**: `npm test tests/farmer/farmer.integration.test.js`

### v. Testing Environment Configuration
To ensure reliability and 100% test isolation, we use the following configuration:
1.  **In-Memory Database**: We utilize `mongodb-memory-server` in `tests/setup.js`. This creates a fresh, temporary database for every test run, ensuring zero data pollution.
2.  **Auto-Auth Hooks**: Integration tests use `beforeAll` hooks to automatically register/login test users and inject the generated JWT into subsequent request headers.
3.  **Cleanup Logic**: `afterEach` hooks programmatically clear all collections, ensuring each test case starts with a "blank slate."

---

## 👥 Group Details
- **Group ID**: [Your Group ID]
- **Members**:
    - [Name 1] (Student ID: [ID 1])
    - [Name 2] (Student ID: [ID 2])
    - [Name 3] (Student ID: [ID 3])
    - [Name 4] (Student ID: [ID 4])

---
Developed for SLIIT Application Framework (AF) Module evaluation. 🌿
