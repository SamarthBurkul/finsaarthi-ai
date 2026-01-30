const Wallet = require("../models/Wallet");

exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });

    // Avoid noisy 404s in the frontend when a user simply hasn't created a wallet yet.
    // Clients can treat `wallet: null` as "not created".
    if (!wallet) {
      return res.json({ wallet: null });
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

    const balance = initialBalance === undefined ? 0 : Number(initialBalance);
    if (!Number.isFinite(balance) || balance < 0) {
      return res.status(400).json({ error: "initialBalance must be a non-negative number" });
    }

    // Atomic upsert to avoid duplicate-key races and eliminate noisy 409s.
    // One wallet per user.
    const upsertPayload = {
      userId: req.userId,
      name: name || "Primary Wallet",
      currency: (currency || "INR").toUpperCase(),
      balance
    };

    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.userId },
      { $setOnInsert: upsertPayload },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    // We intentionally return 200 for both "created" and "already existed" to keep the client simple.
    return res.status(200).json({ wallet });
  } catch (error) {
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
