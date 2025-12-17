const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth'); // ✅ Changed from 'auth' to 'authMiddleware'

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, firebaseUid } = req.body;

    // 🔹 FIREBASE SIGNUP
    if (firebaseUid) {
      let user = await User.findOne({ firebaseUid });

      if (!user) {
        user = new User({
          fullName,
          email,
          firebaseUid,
          authProvider: 'firebase'
        });
        await user.save();
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Firebase user created',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email
        }
      });
    }

    // 🔹 MONGO SIGNUP (existing logic)
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      fullName,
      email,
      password,
      authProvider: 'mongo'
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error); // ✅ Add logging
    res.status(500).json({ error: error.message });
  }
});


// Sign In
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signin error:', error); // ✅ Add logging
    res.status(500).json({ error: error.message });
  }
});

// ✅ Use authMiddleware instead of auth
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -confirmPassword');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error); // ✅ Add logging
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;