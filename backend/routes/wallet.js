const express = require('express');

const Wallet = require('../models/Wallet');
const auth = require('../middleware/auth');

const router = express.Router();

// Ensure auth middleware is applied to all routes.
router.use(auth);

// GET /api/wallet - get current user's wallet
router.get('/', async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    return res.json({ success: true, wallet });
  } catch (err) {
    return next(err);
  }
});

// POST /api/wallet - create wallet for current user (one wallet per user)
router.post('/', async (req, res, next) => {
  try {
    const { name, currency, initialBalance } = req.body || {};

    const existing = await Wallet.findOne({ user: req.user.id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Wallet already exists' });
    }

    const balance = initialBalance === undefined ? 0 : Number(initialBalance);
    if (!Number.isFinite(balance) || balance < 0) {
      return res.status(400).json({ success: false, message: 'initialBalance must be a non-negative number' });
    }

    const wallet = await Wallet.create({
      user: req.user.id,
      name: name || undefined,
      currency: currency || undefined,
      balance
    });

    return res.status(201).json({ success: true, wallet });
  } catch (err) {
    // handle duplicate key (one wallet per user)
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Wallet already exists' });
    }
    return next(err);
  }
});

// PATCH /api/wallet - update wallet details (not balance)
router.patch('/', async (req, res, next) => {
  try {
    const { name, currency, status } = req.body || {};

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (currency !== undefined) updates.currency = currency;
    if (status !== undefined) updates.status = status;

    const wallet = await Wallet.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    return res.json({ success: true, wallet });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/wallet - delete wallet
router.delete('/', async (req, res, next) => {
  try {
    const wallet = await Wallet.findOneAndDelete({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    return res.json({ success: true, wallet });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
