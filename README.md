# 🌿 AgriTrace: Blockchain-Inspired Food Traceability System

[![Testing Status](https://img.shields.io/badge/Tests-43%2B%20Passing-success)](https://github.com/wmrmweerakoon/food-traceability)
[![Deployment](https://img.shields.io/badge/Deployment-Live-blue)](https://food-traceability-app.vercel.app)

AgriTrace is a high-fidelity food traceability platform designed to ensure transparency and accountability from farm to table. By digitizing every step of the supply chain, we empower consumers to verify the origin, quality, and journey of their food.

---

## 🌐 Live Application

> [!IMPORTANT]
> **Production Links for Evaluation:**
> *   **Frontend (UI)**: [https://food-traceability-app.vercel.app](https://food-traceability-app.vercel.app)
> *   **Backend (API)**: [https://food-traceability-backend.onrender.com](https://food-traceability-backend.onrender.com)
> *   **Database**: MongoDB Atlas (Cloud)

---

## ✨ Key Features

### 👨‍🌾 Multi-Role Ecosystem
- **Farmers**: Create batch identities, log harvest details, and generate unique QR codes.
- **Distributors**: Manage logistics, track transport routes, and calculate travel distances.
- **Retailers**: Monitor store inventory, manage pricing, and track global currency conversions.
- **Consumers**: Scan QR codes to view the entire "Journey of the Product."

### 🗺️ Real-Time Intelligence
- **Interactive Mapping**: Leaflet-based visualization of the transport journey.
- **Smart Logistics**: Automatic distance and ETA calculations using geographic data.
- **QR Traceability**: Dynamic QR code generation for every product batch.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Leaflet |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens), Bcrypt.js |
| **Testing** | Jest, Supertest, Artillery.io (Performance) |

---

## 🧪 Quality Assurance & Testing

This project adheres to rigorous testing standards required for the SLIIT evaluation.

### 🛡️ Unit & Integration Testing
We have implemented **43+ automated test cases** covering every component:
- **Farmer Services**: Verified batch creation and lifecycle.
- **Distributor Services**: Verified transport state transitions.
- **Retailer Services**: Confirmed inventory and pricing logic.
- **Consumer Services**: Validated traceability report generation.

**Command to run tests locally:**
```bash
cd backend
npm test
```

### 🚀 Performance Testing (Artillery)
We use **Artillery.io** for load testing to ensure system stability under concurrent traffic.
- **Local Test**: `npm run test:load`
- **Cloud Report**: `npm run test:load:cloud` (Visualized results via Artillery Cloud)

---

## 🚀 Deployment Architecture

### Backend (Render)
- **Host**: Render PaaS
- **Root**: `/backend`
- **Build**: `npm install`
- **Key Config**: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`

### Frontend (Vercel)
- **Host**: Vercel
- **Root**: `/frontend`
- **Framework**: Vite
- **Key Config**: `VITE_API_BASE_URL`

---

## 🛠️ Local Development Setup

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/wmrmweerakoon/food-traceability.git
   ```
2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Create .env with MONGODB_URI and JWT_SECRET
   npm run dev
   ```
3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 📄 License
This project is developed for educational purposes under the SLIIT AF Module.
