const InvestmentComparison = require('../models/InvestmentComparison');
const fetch = require('node-fetch');
require("dotenv").config();


// Investment calculation logic with historical averages
const INVESTMENT_DATA = {
  gold: {
    avgReturn: {
      short: 0.08,    // 8% annual
      medium: 0.10,   // 10% annual
      long: 0.12      // 12% annual
    },
    riskLevel: "Medium",
    volatility: 0.15
  },
  fixedDeposit: {
    avgReturn: {
      short: 0.065,   // 6.5% annual
      medium: 0.07,   // 7% annual
      long: 0.075     // 7.5% annual
    },
    riskLevel: "Very Low",
    volatility: 0.01
  },
  mutualFunds: {
    avgReturn: {
      short: 0.10,    // 10% annual
      medium: 0.14,   // 14% annual
      long: 0.16      // 16% annual
    },
    riskLevel: "Medium",
    volatility: 0.25
  }
};

// Calculate final value based on investment parameters
const calculateFinalValue = (investment, amount, timePeriod, frequency) => {
  const periods = {
    short: 1,
    medium: 2,
    long: 5
  };
  
  const years = periods[timePeriod];
  const rate = INVESTMENT_DATA[investment].avgReturn[timePeriod];
  
  if (frequency === 'monthly') {
    // SIP calculation: Future Value of Annuity
    const monthlyAmount = amount;
    const monthlyRate = rate / 12;
    const months = years * 12;
    const fv = monthlyAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    return Math.round(fv);
  } else {
    // Lump sum: Compound Interest
    const fv = amount * Math.pow(1 + rate, years);
    return Math.round(fv);
  }
};

// Calculate suitability score based on user preferences
const calculateSuitability = (investment, userPreferences) => {
  let score = 0;
  const { riskPreference, investmentGoal, liquidityPreference, timePeriod } = userPreferences;
  
  // Risk alignment (40% weight)
  const riskScores = {
    gold: { low: 60, medium: 90, high: 70 },
    fixedDeposit: { low: 100, medium: 70, high: 40 },
    mutualFunds: { low: 40, medium: 80, high: 95 }
  };
  score += (riskScores[investment][riskPreference] || 50) * 0.4;
  
  // Goal alignment (30% weight)
  const goalScores = {
    gold: {
      "Capital Protection": 85,
      "Steady Income": 60,
      "Wealth Growth": 75,
      "Inflation Protection": 95,
      "Emergency Fund": 70
    },
    fixedDeposit: {
      "Capital Protection": 100,
      "Steady Income": 90,
      "Wealth Growth": 50,
      "Inflation Protection": 60,
      "Emergency Fund": 85
    },
    mutualFunds: {
      "Capital Protection": 60,
      "Steady Income": 70,
      "Wealth Growth": 95,
      "Inflation Protection": 80,
      "Emergency Fund": 50
    }
  };
  score += (goalScores[investment][investmentGoal] || 50) * 0.3;
  
  // Liquidity alignment (20% weight)
  const liquidityScores = {
    gold: { anytime: 85, some_time: 90, long_term: 80 },
    fixedDeposit: { anytime: 60, some_time: 80, long_term: 95 },
    mutualFunds: { anytime: 70, some_time: 85, long_term: 90 }
  };
  score += (liquidityScores[investment][liquidityPreference] || 50) * 0.2;
  
  // Time period alignment (10% weight)
  const timeScores = {
    gold: { short: 75, medium: 85, long: 90 },
    fixedDeposit: { short: 90, medium: 85, long: 75 },
    mutualFunds: { short: 70, medium: 85, long: 95 }
  };
  score += (timeScores[investment][timePeriod] || 50) * 0.1;
  
  return Math.round(score);
};

// Get pros and cons for each investment
const getInvestmentDetails = (investment, userPreferences) => {
  const details = {
    gold: {
      pros: [
        "Inflation hedge",
        "Physical asset",
        "Crisis protection",
        "Easy to sell"
      ],
      cons: [
        "No regular income",
        "Storage costs",
        "Market volatility",
        "No compounding"
      ],
      stability: 80,
      liquidity: 85
    },
    fixedDeposit: {
      pros: [
        "Guaranteed returns",
        "Capital protection",
        "Bank safety",
        "Predictable income"
      ],
      cons: [
        "Low returns",
        "Inflation erosion",
        "Limited liquidity",
        "Tax implications"
      ],
      stability: 100,
      liquidity: 60
    },
    mutualFunds: {
      pros: [
        "High growth potential",
        "Professional management",
        "Diversification",
        "SIP option"
      ],
      cons: [
        "Market risk",
        "No guaranteed returns",
        "Management fees",
        "Requires patience"
      ],
      stability: 70,
      liquidity: 85
    }
  };
  
  return details[investment];
};

// Generate AI reasoning using Perplexity API
const generateAIReasoning = async (results, userPreferences) => {
  const sortedResults = Object.entries(results)
    .map(([key, value]) => ({ investment: key, ...value }))
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  
  const best = sortedResults[0];
  const backup = sortedResults[1];
  
  const investmentNames = {
    gold: "Gold Investment",
    fixedDeposit: "Fixed Deposits",
    mutualFunds: "Mutual Funds"
  };
  
  try {
    // Prepare data for AI analysis
    const analysisData = sortedResults.map(r => ({
      name: investmentNames[r.investment],
      finalValue: r.finalValue,
      profit: r.profit,
      suitabilityScore: r.suitabilityScore,
      riskLevel: r.riskLevel,
      stability: r.stability,
      liquidity: r.liquidity
    }));

    const prompt = `You are an expert financial advisor analyzing investment options for a client. 

Client Profile:
- Risk Preference: ${userPreferences.riskPreference}
- Time Period: ${userPreferences.timePeriod}
- Investment Goal: ${userPreferences.investmentGoal}
- Liquidity Preference: ${userPreferences.liquidityPreference}

Investment Analysis Results:
${JSON.stringify(analysisData, null, 2)}

Based on the suitability scores and client profile, provide:
1. A clear, professional reasoning (2-3 sentences) explaining why "${investmentNames[best.investment]}" is the most suitable option
2. Brief explanations (1 sentence each) for why the other options ranked lower

Keep responses concise, educational, and focus on alignment with client preferences rather than guaranteeing returns.

Return the response STRICTLY in the following JSON format:
{
  "goldOutlook": "2–3 sentences explaining gold suitability",
  "fdOutlook": "2–3 sentences explaining fixed deposit suitability",
  "mutualFundOutlook": "2–3 sentences explaining mutual fund suitability",
  "finalVerdict": "1–2 sentence overall recommendation",
  "confidence": 0
}`;

const apiResponse = await fetch(
  "https://api.perplexity.ai/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content:
            "You are a financial education expert. Provide clear, educational investment guidance. Always emphasize that recommendations are educational and not financial guarantees."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  }
);

if (!apiResponse.ok) {
  const errText = await apiResponse.text();
  throw new Error(`Perplexity API failed: ${errText}`);
}

const data = await apiResponse.json();

    // Parse AI response
   const aiContent = data?.choices?.[0]?.message?.content;

if (!aiContent) {
  console.error("Unexpected Perplexity response:", data);
  throw new Error("Invalid Perplexity AI response");
}
    
let aiAnalysis;

try {
  const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    aiAnalysis = JSON.parse(jsonMatch[0]);
  } else {
    throw new Error('No JSON found');
  }
} catch (parseError) {
  aiAnalysis = {
    goldOutlook: "Gold offers stability and inflation protection based on historical performance.",
    fdOutlook: "Fixed deposits provide capital safety with predictable returns.",
    mutualFundOutlook: "Mutual funds offer higher growth potential with market-linked risk.",
 finalVerdict:
      `${investmentNames[best.investment]} is the most suitable option based on your risk profile and investment horizon.`,
    confidence: 75
  };
}


    return {
     bestOption: investmentNames[best.investment],
  backupOption: investmentNames[backup.investment],

  confidence: Number(aiAnalysis.confidence) || 75,

  goldOutlook: aiAnalysis.goldOutlook,
  fdOutlook: aiAnalysis.fdOutlook,
  mutualFundOutlook: aiAnalysis.mutualFundOutlook,

  finalVerdict: aiAnalysis.finalVerdict
    };

  } catch (error) {
    console.error('Perplexity API Error:', error.message);
    
    // Fallback to rule-based reasoning if API fails
    return {
      bestOption: investmentNames[best.investment],
      backupOption: investmentNames[backup.investment],
      confidence: 75,
      goldOutlook: `Gold Investment offers ${best.investment === 'gold' ? 'the best' : 'moderate'} alignment with your ${userPreferences.riskPreference} risk profile, providing inflation protection and crisis hedging.`,
      fdOutlook: `Fixed Deposits provide ${best.investment === 'fixedDeposit' ? 'excellent' : 'good'} capital safety with guaranteed returns, suitable for conservative investors seeking predictable income.`,
      mutualFundOutlook: `Mutual Funds offer ${best.investment === 'mutualFunds' ? 'optimal' : 'potential'} growth opportunities through diversified market exposure, ideal for long-term wealth building.`,
      finalVerdict: `Based on your ${userPreferences.riskPreference} risk appetite and ${userPreferences.timePeriod}-term timeline with a goal of ${userPreferences.investmentGoal}, ${investmentNames[best.investment]} emerged as the most suitable option with a ${best.suitabilityScore}% compatibility score.`
    };
  }
};

// Main comparison endpoint
exports.compareInvestments = async (req, res) => {
  try {
    const {
      selectedInvestments,
      investmentAmount,
      timePeriod,
      riskPreference,
      investmentGoal,
      liquidityPreference,
      investmentFrequency,
      considerTax
    } = req.body;
    
    // Validation
    if (!selectedInvestments || selectedInvestments.length === 0) {
      return res.status(400).json({ error: 'Select at least one investment option' });
    }
    
    if (selectedInvestments.length > 3) {
      return res.status(400).json({ error: 'Maximum 3 investment options allowed' });
    }
    
    if (!investmentAmount || investmentAmount < 5000) {
      return res.status(400).json({ error: 'Minimum investment amount is ₹5,000' });
    }
    
    // Map investment names to keys
    const investmentMap = {
      "Gold Investment": "gold",
      "Fixed Deposits": "fixedDeposit",
      "Mutual Funds": "mutualFunds"
    };
    
    // Calculate results for all investments (even if not selected, for comparison)
    const results = {};
    const userPreferences = {
      riskPreference,
      investmentGoal,
      liquidityPreference,
      timePeriod
    };
    
    ['gold', 'fixedDeposit', 'mutualFunds'].forEach(investment => {
      const finalValue = calculateFinalValue(investment, investmentAmount, timePeriod, investmentFrequency);
      const profit = finalValue - (investmentFrequency === 'monthly' 
        ? investmentAmount * ({ short: 12, medium: 24, long: 60 }[timePeriod])
        : investmentAmount);
      
      const details = getInvestmentDetails(investment, userPreferences);
      
      results[investment] = {
        finalValue,
        profit: Math.round(profit),
        riskLevel: INVESTMENT_DATA[investment].riskLevel,
        suitabilityScore: calculateSuitability(investment, userPreferences),
        ...details
      };
    });
    
    // Generate AI verdict (now async with Perplexity API)
    const aiVerdict = await generateAIReasoning(results, userPreferences);
    
    // Save to database
    const comparison = new InvestmentComparison({
      userId: req.userId,
      selectedInvestments,
      investmentAmount,
      timePeriod,
      riskPreference,
      investmentGoal,
      liquidityPreference,
      investmentFrequency,
      considerTax,
      results,
      aiVerdict
    });
    
    await comparison.save();
    
    res.json({
      message: 'Investment comparison completed',
      results,
      aiVerdict,
      disclaimer: 'This is an educational prediction based on historical data and not a financial guarantee. Actual returns may vary. Please consult a financial advisor before investing.'
    });
    
  } catch (error) {
    console.error('Investment comparison error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get comparison history
exports.getComparisonHistory = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const history = await InvestmentComparison.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specific comparison
exports.getComparison = async (req, res) => {
  try {
    const comparison = await InvestmentComparison.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }
    
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
