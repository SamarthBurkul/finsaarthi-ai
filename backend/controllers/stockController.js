const { StockAIReport } = require("../models/stock");


exports.createStockReport = async (req, res) => {
  try {
    const { monthlyIncome, savingsGoal, riskProfile } = req.body;

    if (!monthlyIncome || !savingsGoal || !riskProfile) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // TODO: Replace this block with real AI call if you want
    const riskScore =
      riskProfile === "low" ? 35 : riskProfile === "moderate" ? 60 : 80;

    const report = await StockAIReport.create({
      userId: req.userId,
      monthlyIncome,
      savingsGoal,
      riskProfile,
      scores: {
        riskScore,
        learningSuitability:
          riskProfile === "low" ? 75 : riskProfile === "moderate" ? 80 : 65,
        marketEmotion: 55,
      },
      learningPoints: [
        "Understand the basics of equity markets",
        "Learn how risk tolerance affects asset allocation",
        "Study SIP vs lump-sum investing strategies",
      ],
      skillsYouWillLearn: [
        "Portfolio diversification",
        "Risk assessment",
        "Long-term investing mindset",
      ],
      riskFactorsToLearnAbout: [
        "Market volatility",
        "Interest rate changes",
        "Company-specific risk",
      ],
      commonBeginnerMistakes: [
        "Investing without emergency fund",
        "Over-concentrating in single stock",
        "Panic selling during corrections",
      ],
      emotionalRiskAwareness: {
        scenario: "Market correction of 20–30%",
        psychologicalImpact: "Fear and temptation to exit at loss",
        learningValue:
          "Teaches importance of asset allocation and staying invested for goals",
      },
      futureOutlook: {
        growthPotential: "Moderate to high over 5–10 years",
        industryTrends: "Growing financialization and retail participation",
        challenges: "Short-term volatility and emotional decision making",
        educationalValue:
          "Excellent sandbox to learn disciplined goal-based investing",
      },
      aiSummary:
        "This plan is suitable to learn structured, goal-based stock investing while keeping risk within your chosen profile.",
    });

    res.status(201).json(report);
  } catch (err) {
    console.error("createStockReport error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getLatestStockReport = async (req, res) => {
  try {
    const report = await StockAIReport.findOne({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!report) {
      return res.status(404).json({ error: "No report found" });
    }

    res.json(report);
  } catch (err) {
    console.error("getLatestStockReport error:", err);
    res.status(500).json({ error: err.message });
  }
};
