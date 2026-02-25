const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ extended: false }));

// Routes
app.get('/', (req, res) => {
    res.send('API Running');
});

// Import component routes
const authRoutes = require('./components/auth/authRoutes');
const farmerRoutes = require('./components/farmer/farmerRoutes');
const distributorRoutes = require('./components/distributor/distributorRoutes');
const retailerRoutes = require('./components/retailer/retailerRoutes');
const consumerRoutes = require('./components/consumer/consumerRoutes');

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/distributor', distributorRoutes);
app.use('/api/retailer', retailerRoutes);
app.use('/api/consumer', consumerRoutes);

module.exports = app;