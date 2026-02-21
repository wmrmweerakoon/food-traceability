const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const ROLES = User.ROLES;

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token is required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    req.user = decoded;
    next();
  });
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Specific role middleware functions
const farmerOnly = (req, res, next) => {
  authorizeRoles(ROLES.FARMER)(req, res, next);
};

const distributorOnly = (req, res, next) => {
  authorizeRoles(ROLES.DISTRIBUTOR)(req, res, next);
};

const retailerOnly = (req, res, next) => {
  authorizeRoles(ROLES.RETAILER)(req, res, next);
};

const consumerOnly = (req, res, next) => {
  authorizeRoles(ROLES.CONSUMER)(req, res, next);
};

const adminOnly = (req, res, next) => {
  authorizeRoles(ROLES.ADMIN)(req, res, next);
};

// Combined middleware for role hierarchy (e.g., admin can access everything)
const adminOrSelf = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Admin can access any resource
  if (req.user.role === ROLES.ADMIN) {
    return next();
  }

  // User can access their own resource
  if (req.params.userId && req.user.id === req.params.userId) {
    return next();
  }

  // For routes with user-specific data
  if (req.body.userId && req.user.id === req.body.userId) {
    return next();
  }

  return res.status(403).json({ 
    success: false, 
    message: 'Access denied. Admin or resource owner required.' 
  });
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  farmerOnly,
  distributorOnly,
  retailerOnly,
  consumerOnly,
  adminOrSelf,
  ROLES
};