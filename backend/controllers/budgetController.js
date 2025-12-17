// backend/controllers/budgetController.js
/**
 * Minimal budget analyzer controller.
 * Returns the same shape the frontend UI expects.
 */

const analyzeBudget = async (req, res) => {
  try {
    const {
      monthlyIncome,
      expenses = {},
      savingsGoal = 0,
      month,
      year,
    } = req.body || {};

    const income = Number(monthlyIncome) || 0;
    const rent = Number(expenses.rentHousing) || 0;
    const food = Number(expenses.foodGroceries) || 0;
    const emi = Number(expenses.emiLoans) || 0;
    const travel = Number(expenses.travelTransport) || 0;
    const savingsGoalNum = Number(savingsGoal) || 0;

    const totalExpenses = rent + food + emi + travel;
    const netBalance = income - totalExpenses;
    const savings = Math.min(savingsGoalNum, Math.max(0, netBalance));

    // Compose response matching the UI's expected shape
    const response = {
      budgetSummary: {
        totalExpenses,
        netBalance,
        savingsSuccessRate:
          savingsGoalNum > 0 ? Math.min(Math.round((netBalance / savingsGoalNum) * 100), 100) : 0,
        expenseRatio: income > 0 ? Math.round((totalExpenses / income) * 100) : 0,
        savingsRatio: income > 0 ? Math.round((savingsGoalNum / income) * 100) : 0,
      },

      financialHealth: {
        healthScore: Math.max(20, Math.min(95, 100 - (income > 0 ? Math.round((totalExpenses / income) * 100) : 0))),
        riskLevel: totalExpenses > income * 0.8 ? "High" : totalExpenses > income * 0.6 ? "Medium" : "Low",
        emiSafetyStatus: emi > income * 0.3 ? "Risky" : "Safe",
      },

      budgetBreakdown: {
        rent,
        food,
        emi,
        travel,
        savings,
        miscellaneous: Math.max(0, netBalance - savings),
      },

      moneyLeaks: [
        { category: "Food", amount: Math.round(food * 0.3), reason: "Dining out expenses", impact: "Medium" },
        { category: "Travel", amount: Math.round(travel * 0.2), reason: "Unnecessary trips", impact: "Low" },
      ],

      smartRecommendations: [
        { priority: "High", action: "Build emergency fund", method: "Save ₹3000/month separately", savings: 3000, timeline: "6 months" },
        { priority: "Medium", action: "Reduce food costs", method: "Cook at home 4 days/week", savings: Math.round(food * 0.2), timeline: "Immediate" },
        { priority: "Medium", action: "Start SIP investment", method: "₹5000/month in equity funds", savings: Math.round(Math.max(0, netBalance) * 0.3), timeline: "This month" },
        { priority: "Low", action: "Optimize subscriptions", method: "Cancel unused services", savings: 1500, timeline: "This week" }
      ],

      expertTips: [
        { category: "Budgeting", tip: "Follow 50-30-20 rule: 50% needs, 30% wants, 20% savings", benefit: "Balanced financial life" },
        { category: "Investment", tip: "Start SIP with ₹5000/month in diversified equity funds", benefit: "12-15% annual returns" },
        { category: "Emergency", tip: "Build emergency fund equal to 6 months expenses", benefit: "Complete financial security" },
        { category: "Tax Planning", tip: "Invest ₹1.5L in ELSS funds annually", benefit: "Save ₹46,800 in taxes" },
        { category: "Insurance", tip: "Get term life insurance of 10x annual income", benefit: "Family financial protection" }
      ],

      detailedInsights: {
        strengths: netBalance > 0 ? ["Positive cash flow", "Savings discipline"] : ["Budget awareness"],
        weaknesses: totalExpenses > income * 0.7 ? ["High expense ratio", "Limited savings"] : ["Room for optimization"],
        opportunities: ["Investment growth", "Tax savings", "Side income"],
        threats: ["Inflation impact", "Income loss risk", "Medical emergencies"]
      },

      // echo some metadata back so client can show month/year if provided
      meta: { month: month || null, year: year || null },
    };

    return res.json(response);
  } catch (err) {
    console.error("analyzeBudget error:", err);
    return res.status(500).json({ error: "Failed to analyze budget" });
  }
};

module.exports = { analyzeBudget };
