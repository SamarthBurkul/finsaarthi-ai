// KEEP this line:
import React, { useState, useEffect } from "react";

// DELETE this duplicate line completely:
// import React, { useState } from "react";

import {
  TrendingUp,
  AlertTriangle,   // <- use AlertTriangle, not AlertGuardian
  Download,
  BookOpen,
  Target,
  Brain,
  Eye,
  Heart,
} from "lucide-react";

import jsPDF from "jspdf";
import { getDailyPrices } from "../lib/stockApi";

const StockMentorAI: React.FC = () => {
  const [stockData, setStockData] = useState({
    stockName: "",
    riskLevel: "",
    investmentGoal: "",
    experienceLevel: "",
    investmentAmount: "",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setStockData((prev) => ({ ...prev, [field]: value }));
  };

  const analyzeStock = async () => {
    if (
      !stockData.stockName ||
      !stockData.riskLevel ||
      !stockData.experienceLevel
    )
      return;

    setIsAnalyzing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const riskScore =
        stockData.riskLevel === "Low Risk"
          ? 30
          : stockData.riskLevel === "Medium Risk"
          ? 60
          : 85;

      let priceHistory;
      try {
        priceHistory = await getDailyPrices(stockData.stockName.trim());
        setUsedFallback(false);
      } catch (err) {
        console.error("Alpha Vantage error:", err);
        priceHistory = [
          { month: "Jan", price: 520, volume: 85 },
          { month: "Feb", price: 545, volume: 92 },
          { month: "Mar", price: 510, volume: 78 },
          { month: "Apr", price: 580, volume: 95 },
          { month: "May", price: 620, volume: 88 },
          { month: "Jun", price: 590, volume: 82 },
        ];
        setUsedFallback(true);
      }

      const volatilityScore = Math.random() * 40 + 30;

      setAnalysis({
        companyOverview: {
          sector: "Technology",
          description: `${stockData.stockName} operates in the technology sector, focusing on innovative solutions and digital transformation. The company has shown consistent growth patterns typical of tech stocks.`,
          marketCap: "Large Cap",
          fundamentals: "Strong revenue growth with moderate debt levels",
        },
        behaviorAnalysis: {
          volatility: Math.round(volatilityScore),
          trendPattern: "Upward with periodic corrections",
          marketSentiment: "Moderately Bullish",
          priceRange: "Educational range based on recent closes",
        },
        riskAssessment: {
          overallRisk: stockData.riskLevel,
          riskScore,
          riskFactors: [
            "Market volatility impact",
            "Sector-specific regulations",
            "Competition pressure",
            "Economic cycle dependency",
          ],
          suitabilityScore:
            stockData.experienceLevel === "Beginner"
              ? 65
              : stockData.experienceLevel === "Intermediate"
              ? 80
              : 90,
        },
        educationalRecommendation: {
          action:
            riskScore < 40
              ? "LEARN TO BUY"
              : riskScore < 70
              ? "LEARN TO HOLD"
              : "LEARN TO AVOID",
          reasoning:
            riskScore < 40
              ? "Good for learning conservative investing"
              : riskScore < 70
              ? "Moderate risk teaches balanced approach"
              : "High risk - study before considering",
          learningPoints: [
            "Understand company fundamentals",
            "Study market timing",
            "Learn risk management",
            "Practice portfolio diversification",
          ],
        },
        futureOutlook: {
          timeframe: "3-5 Years",
          growthPotential: "Moderate to High",
          industryTrends: "Digital transformation driving growth",
          challenges: "Increased competition and regulatory changes",
          educationalValue:
            "Excellent for learning long-term investing principles",
        },
        beginnerMistakes: [
          "Buying based on tips without research",
          "Panic selling during market dips",
          "Not understanding company business model",
          "Investing more than affordable loss",
          "Following crowd emotions instead of analysis",
        ],
        emotionalRiskAwareness: {
          crashScenario: "Stock could drop 30-50% during market crashes",
          psychologicalImpact: "High stress and fear of loss",
          recoveryTime: "12-24 months typically",
          learningValue: "Teaches importance of emotional discipline",
        },
        whoShouldLearn:
          stockData.experienceLevel === "Beginner"
            ? "New investors wanting to understand market basics"
            : stockData.experienceLevel === "Intermediate"
            ? "Investors learning advanced analysis techniques"
            : "Experienced investors studying sector-specific patterns",
        commonMisbelief:
          "Stock prices always go up in long term - Reality: Markets are cyclical with ups and downs",
        marketEmotionIndicator: {
          currentMood: "Cautiously Optimistic",
          fearGreedIndex: 55,
          recommendation: "Good time for educational analysis and learning",
        },
        skillsLearned: [
          "Fundamental analysis basics",
          "Risk assessment techniques",
          "Market timing awareness",
          "Emotional discipline in investing",
        ],
        chartData: {
          priceHistory,
          riskMetrics: [
            { metric: "Volatility", value: volatilityScore },
            { metric: "Liquidity", value: 85 },
            { metric: "Growth", value: 75 },
            { metric: "Stability", value: 100 - riskScore },
          ],
        },
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const LineChartComponent = ({
    data,
    title,
    color,
  }: {
    data: any[];
    title: string;
    color: string;
  }) => {
    const maxValue = Math.max(...data.map((item) => item.price));
    const minValue = Math.min(...data.map((item) => item.price));
    const range = maxValue - minValue || 1;

    const points = data.map((item, index) => ({
      x: (index / (data.length - 1 || 1)) * 300,
      y: 120 - ((item.price - minValue) / range) * 100,
    }));

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">
          {title}
        </h4>
        <svg width="320" height="150" className="mx-auto">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>

          <path
            d={`M 10,130 L ${points
              .map((p) => `${p.x + 10},${p.y + 10}`)
              .join(" L ")} L 310,130 Z`}
            fill={`url(#gradient-${color})`}
          />

          <path
            d={`M ${points
              .map((p) => `${p.x + 10},${p.y + 10}`)
              .join(" L ")}`}
            stroke={color}
            strokeWidth="3"
            fill="none"
          />

          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x + 10}
              cy={point.y + 10}
              r="4"
              fill={color}
              className="hover:r-6 transition-all"
            />
          ))}
        </svg>

        <div className="flex justify-between mt-4 text-sm">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-slate-gray">{item.month}</p>
              <p className="text-soft-white font-bold">₹{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RadarChartComponent = ({
    data,
    title,
  }: {
    data: any[];
    title: string;
  }) => {
    const centerX = 100;
    const centerY = 100;
    const radius = 80;
    const angleStep = (2 * Math.PI) / data.length;

    const points = data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const value = (item.value / 100) * radius;
      return {
        x: centerX + Math.cos(angle) * value,
        y: centerY + Math.sin(angle) * value,
        labelX: centerX + Math.cos(angle) * (radius + 20),
        labelY: centerY + Math.sin(angle) * (radius + 20),
        metric: item.metric,
        value: item.value,
      };
    });

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">
          {title}
        </h4>
        <svg width="200" height="200" className="mx-auto">
          {[20, 40, 60, 80].map((r) => (
            <circle
              key={r}
              cx={centerX}
              cy={centerY}
              r={r}
              fill="none"
              stroke="#374151"
              strokeWidth="1"
            />
          ))}

          {data.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={centerX + Math.cos(angle) * radius}
                y2={centerY + Math.sin(angle) * radius}
                stroke="#374151"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="rgba(59, 130, 246, 0.3)"
            stroke="#3B82F6"
            strokeWidth="2"
          />

          {points.map((point, index) => (
            <circle key={index} cx={point.x} cy={point.y} r="4" fill="#3B82F6" />
          ))}

          {points.map((point, index) => (
            <text
              key={index}
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              className="text-xs fill-slate-gray"
            >
              {point.metric}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  const generatePDFReport = () => {
    if (!analysis) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("StockMentor AI - Educational Analysis", 20, 30);

    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text(
      "⚠️ EDUCATIONAL PREDICTION - NOT A FINANCIAL GUARANTEE",
      20,
      45
    );

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Stock Analysis:", 20, 65);
    doc.setFontSize(10);
    doc.text(`Stock: ${stockData.stockName}`, 20, 75);
    doc.text(`Risk Level: ${analysis.riskAssessment.overallRisk}`, 20, 85);
    doc.text(
      `Recommendation: ${analysis.educationalRecommendation.action}`,
      20,
      95
    );

    doc.setFontSize(12);
    doc.text("Company Overview:", 20, 115);
    doc.setFontSize(10);
    doc.text(`Sector: ${analysis.companyOverview.sector}`, 20, 125);
    doc.text(analysis.companyOverview.description, 20, 135, { maxWidth: 170 });

    doc.setFontSize(12);
    doc.text("Learning Points:", 20, 165);
    doc.setFontSize(10);
    analysis.educationalRecommendation.learningPoints.forEach(
      (point: string, index: number) => {
        doc.text(`• ${point}`, 20, 175 + index * 10);
      }
    );

    doc.setFontSize(12);
    doc.text("Common Beginner Mistakes:", 20, 220);
    doc.setFontSize(10);
    analysis.beginnerMistakes.slice(0, 3).forEach(
      (mistake: string, index: number) => {
        doc.text(`• ${mistake}`, 20, 230 + index * 10);
      }
    );

    doc.save("stockmentor-educational-analysis.pdf");
  };

  return (
    <section className="py-16 bg-jet-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold text-soft-white mb-4">
            Stock
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Mentor AI
            </span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-inter">
            Educational Market Advisor - Learn stock analysis and investment
            principles safely
          </p>
        </div>

        {!analysis ? (
          <div className="max-w-4xl mx-auto bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-bold">
                  Educational Purpose Only - Not Financial Advice
                </span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">
              📚 Enter Stock Details for Learning
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-soft-white font-medium mb-2">
                    Stock Name *
                  </label>
                  <input
                    type="text"
                    value={stockData.stockName}
                    onChange={(e) =>
                      handleInputChange("stockName", e.target.value)
                    }
                    placeholder="e.g., RELIANCE.BSE, TCS.BSE, INFY.BSE"
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-green-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-soft-white font-medium mb-2">
                    Risk Level *
                  </label>
                  <select
                    value={stockData.riskLevel}
                    onChange={(e) =>
                      handleInputChange("riskLevel", e.target.value)
                    }
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white focus:border-green-400 focus:outline-none"
                  >
                    <option value="">Select Risk Level</option>
                    <option value="Low Risk">Low Risk</option>
                    <option value="Medium Risk">Medium Risk</option>
                    <option value="High Risk">High Risk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-soft-white font-medium mb-2">
                    Investment Goal
                  </label>
                  <select
                    value={stockData.investmentGoal}
                    onChange={(e) =>
                      handleInputChange("investmentGoal", e.target.value)
                    }
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white focus:border-green-400 focus:outline-none"
                  >
                    <option value="">Select Goal</option>
                    <option value="Short-term learning">
                      Short-term learning
                    </option>
                    <option value="Long-term learning">
                      Long-term learning
                    </option>
                    <option value="Wealth building learning">
                      Wealth building learning
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-soft-white font-medium mb-2">
                    Experience Level *
                  </label>
                  <select
                    value={stockData.experienceLevel}
                    onChange={(e) =>
                      handleInputChange("experienceLevel", e.target.value)
                    }
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white focus:border-green-400 focus:outline-none"
                  >
                    <option value="">Select Experience</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-soft-white font-medium mb-2">
                    Investment Amount Range (Optional)
                  </label>
                  <select
                    value={stockData.investmentAmount}
                    onChange={(e) =>
                      handleInputChange("investmentAmount", e.target.value)
                    }
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white focus:border-green-400 focus:outline-none"
                  >
                    <option value="">Select Amount Range</option>
                    <option value="₹10,000 - ₹50,000">₹10,000 - ₹50,000</option>
                    <option value="₹50,000 - ₹1,00,000">
                      ₹50,000 - ₹1,00,000
                    </option>
                    <option value="₹1,00,000 - ₹5,00,000">
                      ₹1,00,000 - ₹5,00,000
                    </option>
                    <option value="₹5,00,000+">₹5,00,000+</option>
                  </select>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20">
                  <h4 className="font-bold text-soft-white mb-3">
                    🎓 What You'll Learn
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-gray">
                    <li>• Company fundamentals and sector analysis</li>
                    <li>• Risk assessment and management techniques</li>
                    <li>• Market behavior and emotional factors</li>
                    <li>• Common investment mistakes to avoid</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={analyzeStock}
                disabled={
                  isAnalyzing ||
                  !stockData.stockName ||
                  !stockData.riskLevel ||
                  !stockData.experienceLevel
                }
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {isAnalyzing
                  ? "📊 Generating Educational Analysis..."
                  : "🚀 Generate Educational Analysis"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <span className="text-red-400 font-bold text-lg">
                  ⚠️ EDUCATIONAL PREDICTION - NOT A FINANCIAL GUARANTEE
                </span>
              </div>
            </div>

            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">
                🏢 Company Overview
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-soft-white mb-2">
                      What {stockData.stockName} Does
                    </h4>
                    <p className="text-slate-gray">
                      {analysis.companyOverview.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-soft-white mb-2">Sector</h4>
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                      {analysis.companyOverview.sector}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-soft-white mb-2">
                      Market Cap
                    </h4>
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      {analysis.companyOverview.marketCap}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-soft-white mb-2">
                      Fundamentals
                    </h4>
                    <p className="text-slate-gray">
                      {analysis.companyOverview.fundamentals}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="space-y-2">
              {usedFallback && (
                <p className="text-xs text-slate-gray text-center">
                  Using educational sample prices (live API data not available
                  for this symbol or rate-limited).
                </p>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <LineChartComponent
                  title="📈 Price Movement (Educational)"
                  data={analysis.chartData.priceHistory}
                  color="#10B981"
                />

                <RadarChartComponent
                  title="📊 Risk Metrics Analysis"
                  data={analysis.chartData.riskMetrics}
                />
              </div>
            </div>

            {/* Remaining sections unchanged: Educational Recommendation, Risk Assessment, etc. */}
            {/* ... keep all your existing JSX below here as in your latest version ... */}

            {/* Educational Recommendation */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">
                🎓 Educational Recommendation
              </h3>

              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-bold ${
                    analysis.educationalRecommendation.action === "LEARN TO BUY"
                      ? "bg-green-500/20 text-green-400"
                      : analysis.educationalRecommendation.action ===
                        "LEARN TO HOLD"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {analysis.educationalRecommendation.action}
                </div>
              </div>

              <p className="text-slate-gray text-center mb-6">
                {analysis.educationalRecommendation.reasoning}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-soft-white mb-4">
                    📚 Key Learning Points
                  </h4>
                  <ul className="space-y-2">
                    {analysis.educationalRecommendation.learningPoints.map(
                      (point: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2"
                        >
                          <BookOpen className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                          <span className="text-slate-gray text-sm">
                            {point}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-soft-white mb-4">
                    🎯 Who Should Learn This
                  </h4>
                  <p className="text-slate-gray mb-4">
                    {analysis.whoShouldLearn}
                  </p>
                  <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                    <h5 className="font-bold text-purple-400 mb-2">
                      💡 Skills You'll Learn
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillsLearned.map(
                        (skill: string, index: number) => (
                          <span
                            key={index}
                            className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment, Mistakes, Emotional Awareness, Future Outlook, Misbelief, Action buttons */}
            {/* keep exactly as in your previous working file, no changes needed there */}
          </div>
        )}
      </div>
    </section>
  );
};

export default StockMentorAI;
