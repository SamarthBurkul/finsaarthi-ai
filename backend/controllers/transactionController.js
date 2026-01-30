const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { generateTxHash } = require("../helpers/generateTxHash");

function parseAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

async function findWalletForUser(userId, walletId) {
  if (walletId) {
    return Wallet.findOne({ _id: walletId, userId });
  }
  return Wallet.findOne({ userId });
}

exports.createTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { walletId, type, amount, currency, description, category, status, metadata, occurredAt } = req.body || {};

    if (!type || !["credit", "debit"].includes(type)) {
      return res.status(400).json({ error: "type must be one of: credit, debit" });
    }

    const amt = parseAmount(amount);
    if (amt === null) {
      return res.status(400).json({ error: "amount must be a number > 0" });
    }

    const wallet = await findWalletForUser(userId, walletId);
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    if (wallet.status !== "active") {
      return res.status(400).json({ error: `Wallet status is ${wallet.status}` });
    }

    // Adjust balance (atomic update per operation)
    let updatedWallet;
    if (type === "credit") {
      updatedWallet = await Wallet.findOneAndUpdate(
        { _id: wallet._id, userId, status: "active" },
        { $inc: { balance: amt } },
        { new: true }
      );

      if (!updatedWallet) {
        return res.status(400).json({ error: "Wallet is not active" });
      }
    } else {
      updatedWallet = await Wallet.findOneAndUpdate(
        { _id: wallet._id, userId, status: "active", balance: { $gte: amt } },
        { $inc: { balance: -amt } },
        { new: true }
      );

      if (!updatedWallet) {
        return res.status(400).json({ error: "Insufficient funds" });
      }
    }

    const txHash = generateTxHash({ userId, walletId: String(wallet._id), type, amt, occurredAt });

    try {
      const tx = await Transaction.create({
        userId,
        walletId: wallet._id,
        txHash,
        type,
        amount: amt,
        currency: (currency || updatedWallet.currency || "INR").toUpperCase(),
        description: description || "",
        category: category || "general",
        status: status || "completed",
        metadata: metadata || {},
        occurredAt: occurredAt ? new Date(occurredAt) : new Date()
      });

      return res.status(201).json({ transaction: tx, wallet: updatedWallet });
    } catch (txErr) {
      // Best-effort rollback balance if tx creation fails
      try {
        const rollbackInc = type === "credit" ? -amt : amt;
        await Wallet.updateOne({ _id: wallet._id, userId }, { $inc: { balance: rollbackInc } });
      } catch (rollbackErr) {
        console.error("createTransaction rollback failed:", rollbackErr);
      }

      throw txErr;
    }
  } catch (error) {
    console.error("createTransaction:", error);
    return res.status(500).json({ error: "Server error creating transaction" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { walletId, type, status, from, to, limit = 50, skip = 0 } = req.query || {};

    const query = { userId };
    if (walletId) query.walletId = walletId;
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

    return res.json({ transactions: txs });
  } catch (error) {
    console.error("getTransactions:", error);
    return res.status(500).json({ error: "Server error fetching transactions" });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    return res.json({ transaction: tx });
  } catch (error) {
    console.error("getTransaction:", error);
    return res.status(500).json({ error: "Server error fetching transaction" });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { description, category, status, metadata } = req.body || {};

    const updates = {};
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (status !== undefined) updates.status = status;
    if (metadata !== undefined) updates.metadata = metadata;

    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    return res.json({ transaction: tx });
  } catch (error) {
    console.error("updateTransaction:", error);
    return res.status(500).json({ error: "Server error updating transaction" });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.userId;

    const tx = await Transaction.findOne({ _id: req.params.id, userId });
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    // Reverse the balance impact
    const amt = Number(tx.amount) || 0;
    const inc = tx.type === "credit" ? -amt : amt;

    // If reversing a credit, ensure we don't go below zero.
    if (inc < 0) {
      const wallet = await Wallet.findOne({ _id: tx.walletId, userId });
      if (!wallet) return res.status(404).json({ error: "Wallet not found" });
      if (wallet.balance < amt) {
        return res.status(400).json({ error: "Cannot delete: wallet balance would go negative" });
      }
    }

    await Wallet.updateOne({ _id: tx.walletId, userId }, { $inc: { balance: inc } });
    await tx.deleteOne();

    return res.json({ success: true });
  } catch (error) {
    console.error("deleteTransaction:", error);
    return res.status(500).json({ error: "Server error deleting transaction" });
  }
};
