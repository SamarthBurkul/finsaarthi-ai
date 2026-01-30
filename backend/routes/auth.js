// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user');

const router = express.Router();

/**
 * Sign Up - Create new user account
 * POST /api/auth/signup
 */
router.post('/signup', asyncHandler(async (req, res, next) => {
  try {
    const { fullName, email, password, firebaseUid } = req.body || {};

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      // If firebase sign-in and firebaseUid present, return token for convenience
      if (firebaseUid && existingUser.firebaseUid) {
        const token = jwt.sign(
          { userId: existingUser._id, email: existingUser.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' }
        );
        return res.status(200).json({
          success: true,
          message: 'User already exists',
          token,
          user: { id: existingUser._id, fullName: existingUser.fullName, email: existingUser.email }
        });
      }
      return res.status(409).json({ success: false, error: 'Email already registered. Please sign in instead.' });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = await User.create({
      fullName: fullName || 'User',
      email: normalizedEmail,
      password: hashedPassword,
      firebaseUid: firebaseUid || null
    });

    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d'
    });

    console.log('✅ New user created:', newUser.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email }
    });
  } catch (err) {
    // asyncHandler will automatically catch and forward errors
    throw err;
  }
}));

/**
 * Sign In - Authenticate existing user
 * POST /api/auth/signin
 */
router.post('/signin', asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    if (!user.password) {
      return res.status(400).json({ success: false, error: 'Account created with Google. Please sign in with Google.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d'
    });

    console.log('✅ User signed in:', user.email);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email }
    });
  } catch (err) {
    throw err;
  }
}));

/**
 * Verify token (GET /api/auth/verify)
 */
router.get('/verify', asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.status(200).json({ success: true, user: { id: user._id, fullName: user.fullName, email: user.email } });
  } catch (err) {
    throw err;
  }
}));

/**
 * Logout (client handles token removal; route included for completeness)
 */
router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
