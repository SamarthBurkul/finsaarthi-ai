const Wallet = require("../models/Wallet");

exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res.json({ wallet });
  } catch (error) {
    console.error("getWallet:", error);
    return res.status(500).json({ error: "Server error fetching wallet" });
  }
};

exports.createWallet = async (req, res) => {
  try {
    const { name, currency, initialBalance } = req.body || {};

    const existing = await Wallet.findOne({ userId: req.userId });
    if (existing) {
      return res.status(409).json({ error: "Wallet already exists" });
    }

    const balance = initialBalance === undefined ? 0 : Number(initialBalance);
    if (!Number.isFinite(balance) || balance < 0) {
      return res.status(400).json({ error: "initialBalance must be a non-negative number" });
    }

    const wallet = await Wallet.create({
      userId: req.userId,
      name: name || "Primary Wallet",
      currency: (currency || "INR").toUpperCase(),
      balance
    });

    return res.status(201).json({ wallet });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Wallet already exists" });
    }

    console.error("createWallet:", error);
    return res.status(500).json({ error: "Server error creating wallet" });
  }
};

exports.updateWallet = async (req, res) => {
  try {
    const { name, currency, status } = req.body || {};

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (currency !== undefined) updates.currency = String(currency).toUpperCase();
    if (status !== undefined) updates.status = status;

    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res.json({ wallet });
  } catch (error) {
    console.error("updateWallet:", error);
    return res.status(500).json({ error: "Server error updating wallet" });
  }
};

exports.deleteWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOneAndDelete({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("deleteWallet:", error);
    return res.status(500).json({ error: "Server error deleting wallet" });
  }
};
