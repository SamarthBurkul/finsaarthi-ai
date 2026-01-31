// backend/controllers/expenseController.js
const Expense = require("../models/Expense");
const Alert = require("../models/Alert");

exports.createExpense = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, category, purpose, paymentMethod, date } = req.body;

    // Create expense without fraud detection
    const expense = await Expense.create({
      userId,
      amount,
      category,
      purpose,
      paymentMethod: paymentMethod || "UPI",
      expenseDate: date ? new Date(date) : new Date(),
    });

    return res.status(201).json(expense.toObject());
  } catch (err) {
    console.error("createExpense:", err);
    return res.status(500).json({ message: "Server error creating expense" });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const userId = req.userId;
    const { period = "monthly", date } = req.query; // period: daily|weekly|monthly
    const target = date ? new Date(date) : new Date();

    let start, end;
    if (period === "daily") {
      start = new Date(target.setHours(0,0,0,0));
      end = new Date(target.setHours(23,59,59,999));
    } else if (period === "weekly") {
      const d = new Date(target);
      const day = d.getDay();
      start = new Date(d);
      start.setDate(d.getDate() - day);
      start.setHours(0,0,0,0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23,59,59,999);
    } else {
      // monthly
      start = new Date(target.getFullYear(), target.getMonth(), 1);
      end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23,59,59,999);
    }

    const expenses = await Expense.find({
      userId,
      expenseDate: { $gte: start, $lte: end }
    }).sort({ expenseDate: -1 });

    return res.json({ expenses });
  } catch (err) {
    console.error("getExpenses:", err);
    return res.status(500).json({ message: "Server error fetching expenses" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const doc = await Expense.findOneAndDelete({ _id: id, userId });
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error("deleteExpense:", err);
    return res.status(500).json({ message: "Server error deleting expense" });
  }
};
// Get all fraud alerts for user
exports.getAlerts = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    let query = { userId };
    if (status) query.status = status;

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .populate("transactionId", "amount category purpose expenseDate");

    return res.json({ alerts });
  } catch (err) {
    console.error("getAlerts:", err);
    return res.status(500).json({ message: "Server error fetching alerts" });
  }
};

// Get flagged transactions
exports.getFlaggedTransactions = async (req, res) => {
  try {
    const userId = req.userId;

    const flaggedExpenses = await Expense.find({
      userId,
      isFlagged: true,
    }).sort({ expenseDate: -1 });

    return res.json({ flaggedExpenses });
  } catch (err) {
    console.error("getFlaggedTransactions:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching flagged transactions" });
  }
};

// Acknowledge alert
exports.acknowledgeAlert = async (req, res) => {
  try {
    const userId = req.userId;
    const { alertId } = req.params;

    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId },
      { status: "acknowledged" },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    return res.json({ alert });
  } catch (err) {
    console.error("acknowledgeAlert:", err);
    return res.status(500).json({ message: "Server error acknowledging alert" });
  }
};

// Resolve alert
exports.resolveAlert = async (req, res) => {
  try {
    const userId = req.userId;
    const { alertId } = req.params;
    const { userResponse } = req.body;

    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId },
      {
        status: "resolved",
        userResponse,
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    return res.json({ alert });
  } catch (err) {
    console.error("resolveAlert:", err);
    return res.status(500).json({ message: "Server error resolving alert" });
  }
};