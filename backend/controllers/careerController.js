const CareerAnalysis = require('../models/Carrer');
const fetch = require('node-fetch');
require("dotenv").config();

// Salary calculation based on experience and location
const calculateSalaryRange = (experience, location, jobRole, industry) => {
  const baseExp = parseInt(experience);
  
  // Location multiplier
  const locationMultipliers = {
    'bangalore': 1.35,
    'mumbai': 1.30,
    'delhi': 1.25,
    'pune': 1.20,
    'hyderabad': 1.18,
    'chennai': 1.15,
    'remote': 1.10,
    'default': 1.0
  };
  
  const locationKey = location.toLowerCase();
  const locationMultiplier = Object.keys(locationMultipliers).find(key => 
    locationKey.includes(key)
  ) ? locationMultipliers[Object.keys(locationMultipliers).find(key => locationKey.includes(key))] : locationMultipliers.default;
  
  // Industry multiplier
  const industryMultipliers = {
    'technology': 1.25,
    'finance': 1.20,
    'consulting': 1.18,
    'healthcare': 1.10,
    'education': 0.85,
    'default': 1.0
  };
  
  const industryKey = industry.toLowerCase();
  const industryMultiplier = industryMultipliers[industryKey] || industryMultipliers.default;
  
  // Base salary calculation
  const baseSalary = Math.round((baseExp * 180000 + 350000) * locationMultiplier * industryMultiplier);
  
  return {
    min: Math.round(baseSalary * 0.75),
    max: Math.round(baseSalary * 1.5),
    average: baseSalary
  };
};

// Calculate career metrics
const calculateCareerMetrics = (experience, jobRole, skills, education) => {
  const baseExp = parseInt(experience);
  
  return {
    stabilityScore: Math.min(95, 55 + baseExp * 6),
    growthPotential: baseExp < 3 ? "High" : baseExp < 7 ? "Medium-High" : baseExp < 12 ? "Medium" : "Stable",
    automationRisk: jobRole.toLowerCase().includes('software') || jobRole.toLowerCase().includes('ai') || jobRole.toLowerCase().includes('data') ? "Low" : 
                   jobRole.toLowerCase().includes('engineer') || jobRole.toLowerCase().includes('analyst') ? "Medium-Low" : "Medium"
  };
};

// Generate AI insights using Perplexity
const generateAIInsights = async (careerData, salaryData, careerMetrics) => {
  try {
    const prompt = `You are an expert career advisor analyzing a professional's career trajectory.

Professional Profile:
- Job Role: ${careerData.currentJobRole}
- Experience: ${careerData.yearsOfExperience} years
- Location: ${careerData.workLocation}
- Skills: ${careerData.keySkills}
- Industry: ${careerData.industry}
- Education: ${careerData.educationLevel}

Current Analysis:
- Salary Range: ₹${salaryData.min.toLocaleString()} - ₹${salaryData.max.toLocaleString()}
- Career Stability: ${careerMetrics.stabilityScore}%
- Growth Potential: ${careerMetrics.growthPotential}
- Automation Risk: ${careerMetrics.automationRisk}

Provide strategic career guidance in the following JSON format:
{
  "careerPath": "2-3 sentences on optimal career progression path and timeline",
  "skillRecommendations": "2-3 sentences on high-value skills to acquire for career growth",
  "salaryNegotiation": "2-3 sentences on salary negotiation strategy and market positioning",
  "marketTrends": "2-3 sentences on industry trends and future opportunities"
}

Keep responses actionable, data-driven, and India-focused.`;

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
              content: "You are an expert career counselor and compensation analyst specializing in the Indian job market. Provide practical, actionable career advice."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 600
        })
      }
    );

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      throw new Error(`Perplexity API failed: ${errText}`);
    }

    const data = await apiResponse.json();
    const aiContent = data?.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("Invalid AI response");
    }

    // Try to parse JSON from response
    let aiInsights;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiInsights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      // Fallback if parsing fails
      aiInsights = {
        careerPath: `With ${careerData.yearsOfExperience} years of experience in ${careerData.currentJobRole}, focus on transitioning to senior/lead roles within the next 2-3 years.`,
        skillRecommendations: `Invest in learning cloud technologies, AI/ML fundamentals, and leadership skills to stay competitive in the ${careerData.industry} industry.`,
        salaryNegotiation: `Your current market value is around ₹${salaryData.average.toLocaleString()}. Research competitor offerings and highlight your unique skills during negotiations.`,
        marketTrends: `The ${careerData.industry} sector is experiencing strong growth, with increasing demand for professionals skilled in ${careerData.keySkills}.`
      };
    }

    return aiInsights;

  } catch (error) {
    console.error('AI Insights Error:', error.message);
    
    // Fallback insights
    return {
      careerPath: `With ${careerData.yearsOfExperience} years in ${careerData.currentJobRole}, consider targeting senior roles in high-growth companies or expanding into adjacent domains.`,
      skillRecommendations: `Focus on developing expertise in emerging technologies like AI, cloud computing, and data analytics while strengthening soft skills like leadership and communication.`,
      salaryNegotiation: `Based on your profile, you should target the ₹${salaryData.average.toLocaleString()} - ₹${salaryData.max.toLocaleString()} range. Build a strong case using market data and your achievements.`,
      marketTrends: `${careerData.industry} industry shows promising growth. Remote and hybrid roles are expanding, offering better compensation and flexibility.`
    };
  }
};

// Main career analysis endpoint
exports.analyzeCareer = async (req, res) => {
  try {
    const {
      currentJobRole,
      yearsOfExperience,
      workLocation,
      keySkills,
      industry,
      educationLevel
    } = req.body;

    // Validation
    if (!currentJobRole || !yearsOfExperience || !workLocation || !keySkills || !industry || !educationLevel) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (yearsOfExperience < 0 || yearsOfExperience > 50) {
      return res.status(400).json({ error: 'Invalid years of experience' });
    }

    // Calculate salary range
    const currentSalary = calculateSalaryRange(yearsOfExperience, workLocation, currentJobRole, industry);

    // Calculate growth predictions
    const growthPrediction = {
      oneYear: Math.round(currentSalary.average * 1.15),
      threeYear: Math.round(currentSalary.average * 1.50),
      fiveYear: Math.round(currentSalary.average * 1.95)
    };

    // Career analysis
    const careerAnalysis = calculateCareerMetrics(yearsOfExperience, currentJobRole, keySkills, educationLevel);

    // Skill analysis
    const skillAnalysis = {
      highValue: ["AI/ML", "Cloud Computing (AWS/Azure)", "Data Science", "Full Stack Development", "DevOps", "Blockchain"],
      mediumValue: ["Project Management", "Digital Marketing", "UI/UX Design", "Business Analysis", "Cybersecurity"],
      lowValue: ["Basic Excel", "Manual Testing", "Legacy Systems", "Data Entry", "Basic HTML/CSS"]
    };

    // Financial advice
    const financialAdvice = {
      monthlySavings: Math.round(currentSalary.average * 0.25 / 12),
      emergencyFund: Math.round(currentSalary.average * 0.6),
      investmentReady: currentSalary.average > 500000,
      loanEligibility: Math.round(currentSalary.average * 10)
    };

    // Life goals
    const lifeGoals = {
      houseAffordability: Math.round(currentSalary.average * 15),
      carBudget: Math.round(currentSalary.average * 1.2),
      travelBudget: Math.round(currentSalary.average * 0.2),
      retirementCorpus: Math.round(currentSalary.average * 30)
    };

    // Market comparison
    const marketComparison = {
      nationalAverage: 720000,
      industryAverage: Math.round(currentSalary.average * 1.08),
      percentile: Math.min(98, Math.max(5, Math.round((currentSalary.average / 1000000) * 100)))
    };

    // Career opportunities
    const careerOpportunities = [
      { role: `Senior ${currentJobRole}`, salaryIncrease: 35, timeline: "1-2 years" },
      { role: `Lead ${currentJobRole}`, salaryIncrease: 65, timeline: "2-4 years" },
      { role: `Manager/Principal`, salaryIncrease: 95, timeline: "4-6 years" }
    ];

    // Side income ideas
    const sideIncomeIdeas = [
      { idea: "Freelance Consulting", potential: Math.round(currentSalary.average * 0.35), effort: "Medium" },
      { idea: "Online Course/Content Creation", potential: Math.round(currentSalary.average * 0.25), effort: "High" },
      { idea: "Technical Mentoring/Coaching", potential: Math.round(currentSalary.average * 0.20), effort: "Low" }
    ];

    // Generate AI insights
    const aiInsights = await generateAIInsights(
      { currentJobRole, yearsOfExperience, workLocation, keySkills, industry, educationLevel },
      currentSalary,
      careerAnalysis
    );

    // Save to database
    const analysis = new CareerAnalysis({
      userId: req.userId,
      currentJobRole,
      yearsOfExperience,
      workLocation,
      keySkills,
      industry,
      educationLevel,
      currentSalary,
      growthPrediction,
      careerAnalysis,
      skillAnalysis,
      financialAdvice,
      lifeGoals,
      marketComparison,
      careerOpportunities,
      sideIncomeIdeas,
      aiInsights
    });

    await analysis.save();

    res.json({
      message: 'Career analysis completed',
      currentSalary,
      growthPrediction,
      careerAnalysis,
      skillAnalysis,
      financialAdvice,
      lifeGoals,
      marketComparison,
      careerOpportunities,
      sideIncomeIdeas,
      aiInsights,
      disclaimer: 'This analysis is for educational purposes based on market data and AI predictions. Actual salaries may vary based on company, role specifics, and negotiation.'
    });

  } catch (error) {
    console.error('Career analysis error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get analysis history
exports.getAnalysisHistory = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const history = await CareerAnalysis.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specific analysis
exports.getAnalysis = async (req, res) => {
  try {
    const analysis = await CareerAnalysis.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
