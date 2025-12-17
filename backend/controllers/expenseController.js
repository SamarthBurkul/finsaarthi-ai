// backend/controllers/expenseController.js
const Expense = require("../models/Expense");

exports.createExpense = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, category, purpose, paymentMethod, date } = req.body;

    const expense = await Expense.create({
      userId,
      amount,
      category,
      purpose,
      paymentMethod: paymentMethod || "UPI",
      expenseDate: date ? new Date(date) : new Date()
    });

    return res.status(201).json(expense);
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
