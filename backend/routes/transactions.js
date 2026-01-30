const express = require('express');
const mongoose = require('mongoose');

const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { generateTxHash } = require('../helpers/generateTxHash');

const router = express.Router();

// Ensure auth middleware is applied to all routes.
router.use(auth);

function parseAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

async function resolveWallet({ walletId, userId, session }) {
  if (walletId) {
    return Wallet.findOne({ _id: walletId, user: userId }).session(session);
  }
  return Wallet.findOne({ user: userId }).session(session);
}

function applyBalanceDelta({ wallet, type, amount }) {
  const delta = type === 'credit' ? amount : -amount;
  const nextBalance = Number((wallet.balance + delta).toFixed(2));

  if (delta < 0 && nextBalance < 0) {
    const err = new Error('Insufficient funds');
    err.statusCode = 400;
    throw err;
  }

  wallet.balance = nextBalance;
}

// POST /api/transactions - create a transaction and adjust wallet balance
router.post('/', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { walletId, type, amount, currency, description, category, status, metadata, occurredAt } = req.body || {};

    if (!['credit', 'debit'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be one of: credit, debit' });
    }

    const amt = parseAmount(amount);
    if (amt === null) {
      return res.status(400).json({ success: false, message: 'amount must be a number > 0' });
    }

    const wallet = await resolveWallet({ walletId, userId, session });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    if (wallet.status !== 'active') {
      return res.status(400).json({ success: false, message: `Wallet status is ${wallet.status}` });
    }

    applyBalanceDelta({ wallet, type, amount: amt });
    await wallet.save({ session });

    // Use the existing helper when creating transactions.
    let txHash;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      txHash = generateTxHash({ userId, walletId: String(wallet._id), type, amt, occurredAt, attempt });
      // Transaction.exists doesn't always honor session in older mongoose; use findOne.
      // eslint-disable-next-line no-await-in-loop
      const exists = await Transaction.findOne({ txHash }).session(session).select('_id');
      if (!exists) break;
    }

    const txDocs = await Transaction.create(
      [
        {
          user: userId,
          wallet: wallet._id,
          txHash,
          type,
          amount: amt,
          currency: (currency || wallet.currency || 'USD').toUpperCase(),
          description: description || '',
          category: category || 'general',
          status: status || 'completed',
          metadata: metadata || {},
          occurredAt: occurredAt || undefined
        }
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      transaction: txDocs[0],
      wallet
    });
  } catch (err) {
    await session.abortTransaction();
    return next(err);
  } finally {
    session.endSession();
  }
});

// GET /api/transactions - list transactions for current user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      walletId,
      type,
      status,
      from,
      to,
      limit = 50,
      skip = 0
    } = req.query || {};

    const query = { user: userId };
    if (walletId) query.wallet = walletId;
    if (type) query.type = type;
    if (status) query.status = status;

    if (from || to) {
      query.occurredAt = {};
      if (from) query.occurredAt.$gte = new Date(from);
      if (to) query.occurredAt.$lte = new Date(to);
    }

    const txs = await Transaction.find(query)
      .sort({ occurredAt: -1, _id: -1 })
      .skip(Math.max(0, Number(skip) || 0))
      .limit(Math.min(200, Math.max(1, Number(limit) || 50)));

    return res.json({ success: true, transactions: txs });
  } catch (err) {
    return next(err);
  }
});

// GET /api/transactions/:id - get one transaction
router.get('/:id', async (req, res, next) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    return res.json({ success: true, transaction: tx });
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/transactions/:id - update non-financial fields
router.patch('/:id', async (req, res, next) => {
  try {
    const { description, category, status, metadata } = req.body || {};

    const updates = {};
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (status !== undefined) updates.status = status;
    if (metadata !== undefined) updates.metadata = metadata;

    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    return res.json({ success: true, transaction: tx });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/transactions/:id - delete a transaction and reverse wallet balance
router.delete('/:id', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;

    const tx = await Transaction.findOne({ _id: req.params.id, user: userId }).session(session);
    if (!tx) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const wallet = await Wallet.findOne({ _id: tx.wallet, user: userId }).session(session);
    if (!wallet) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    // Reverse the balance impact.
    const reverseType = tx.type === 'credit' ? 'debit' : 'credit';
    applyBalanceDelta({ wallet, type: reverseType, amount: tx.amount });
    await wallet.save({ session });

    await tx.deleteOne({ session });

    await session.commitTransaction();

    return res.json({ success: true, deleted: true, wallet });
  } catch (err) {
    await session.abortTransaction();
    return next(err);
  } finally {
    session.endSession();
  }
});

module.exports = router;
