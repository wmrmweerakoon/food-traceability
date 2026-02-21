const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const { register, login, getCurrentUser } = require('./authController');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;

