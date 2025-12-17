// src/components/SmartBudgetAI.tsx
import React, { useState } from "react";
import { analyzeBudget } from "../api/budgetService";
import {
  Brain,
  TrendingUp,
  CheckCircle,
  Download,
  DollarSign,
  Receipt,
} from "lucide-react";
import jsPDF from "jspdf";
import SmartExpenseTracker from "./SmartExpenseTracker";

const SmartBudgetAI: React.FC = () => {
  const [budgetData, setBudgetData] = useState({
    income: "",
    rent: "",
    food: "",
    emi: "",
    travel: "",
    savingsGoal: "",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"budget" | "expenses">("budget");

  const handleInputChange = (field: string, value: string) => {
    setBudgetData((prev) => ({ ...prev, [field]: value }));
  };

  // <-- Replaced generateBudget: calls backend analyzeBudget service -->
  const generateBudget = async () => {
    if (!budgetData.income || !budgetData.savingsGoal) return;
    setIsAnalyzing(true);
    try {
      const payload = {
        monthlyIncome: parseInt(budgetData.income || "0", 10),
        expenses: {
          rentHousing: parseInt(budgetData.rent || "0", 10),
          foodGroceries: parseInt(budgetData.food || "0", 10),
          emiLoans: parseInt(budgetData.emi || "0", 10),
          travelTransport: parseInt(budgetData.travel || "0", 10),
        },
        savingsGoal: parseInt(budgetData.savingsGoal || "0", 10),
      };

      const data = await analyzeBudget(payload);
      // backend should return the same analysis shape used by the UI
      setAnalysis(data);
    } catch (err) {
      console.error("Budget analysis failed", err);
      // user-facing fallback
      alert("Failed to analyze budget. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  // <-- end generateBudget -->

  const PieChartComponent = ({ data, title }: { data: any[]; title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const colors = [
      "#D4AF37",
      "#B76E79",
      "#4F46E5",
      "#059669",
      "#DC2626",
      "#7C3AED",
    ];

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">
          {title}
        </h4>
        <div className="flex items-center justify-center">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.map((item, index) => {
              const angle = total === 0 ? 0 : (item.value / total) * 360;
              const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
              const x2 =
                100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 =
                100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
              const largeArc = angle > 180 ? 1 : 0;
              const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
              currentAngle += angle;

              return (
                <path
                  key={index}
                  d={path}
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2`}
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="text-slate-gray text-sm">{item.name}</span>
              </div>
              <span className="text-soft-white font-medium">₹{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BarChartComponent = ({ data, title }: { data: any[]; title: string }) => {
    const maxValue = Math.max(...data.map((item) => item.value));
    const colors = ["#D4AF37", "#B76E79", "#4F46E5", "#059669"];

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">
          {title}
        </h4>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-gray text-sm">{item.name}</span>
                <span className="text-soft-white font-medium">{item.value}%</span>
              </div>
              <div className="w-full bg-charcoal-gray rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${maxValue === 0 ? 0 : (item.value / maxValue) * 100}%`,
                    backgroundColor: colors[index % colors.length],
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "text-green-400 bg-green-400/20";
      case "Medium":
        return "text-yellow-400 bg-yellow-400/20";
      case "High":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-slate-gray bg-slate-gray/20";
    }
  };

  return (
    <section className="py-16 bg-jet-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold text-soft-white mb-4">
            Smart
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Budget AI
            </span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-inter">
            AI-powered budget analysis with beautiful visualizations and expert
            financial guidance
          </p>

          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={() => setActiveTab("budget")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "budget"
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white"
                  : "border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Budget Analysis
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "expenses"
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white"
                  : "border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black"
              }`}
            >
              <Receipt className="w-4 h-4" />
              Expense Tracker
            </button>
          </div>
        </div>

        {activeTab === "expenses" ? (
          <SmartExpenseTracker />
        ) : !analysis ? (
          <div className="max-w-2xl mx-auto bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
            <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">
              💰 Enter Your Monthly Budget
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-soft-white font-medium mb-2">
                  Monthly Income *
                </label>
                <input
                  type="number"
                  value={budgetData.income}
                  onChange={(e) => handleInputChange("income", e.target.value)}
                  placeholder="Enter total monthly income"
                  className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-soft-white font-medium mb-2">
                    Rent/Housing
                  </label>
                  <input
                    type="number"
                    value={budgetData.rent}
                    onChange={(e) => handleInputChange("rent", e.target.value)}
                    placeholder="Monthly rent"
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-soft-white font-medium mb-2">
                    Food & Groceries
                  </label>
                  <input
                    type="number"
                    value={budgetData.food}
                    onChange={(e) => handleInputChange("food", e.target.value)}
                    placeholder="Food expenses"
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-soft-white font-medium mb-2">
                    EMI/Loans
                  </label>
                  <input
                    type="number"
                    value={budgetData.emi}
                    onChange={(e) => handleInputChange("emi", e.target.value)}
                    placeholder="Total EMI"
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-soft-white font-medium mb-2">
                    Travel & Transport
                  </label>
                  <input
                    type="number"
                    value={budgetData.travel}
                    onChange={(e) => handleInputChange("travel", e.target.value)}
                    placeholder="Travel expenses"
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-soft-white font-medium mb-2">
                  Savings Goal *
                </label>
                <input
                  type="number"
                  value={budgetData.savingsGoal}
                  onChange={(e) =>
                    handleInputChange("savingsGoal", e.target.value)
                  }
                  placeholder="Monthly savings target"
                  className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="text-center">
                <button
                  onClick={generateBudget}
                  disabled={isAnalyzing || !budgetData.income || !budgetData.savingsGoal}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50"
                >
                  {isAnalyzing ? "🧠 AI Analyzing..." : "🚀 Generate Smart Budget"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Budget Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <DollarSign className="w-8 h-8 mb-3" />
                <h4 className="font-bold mb-1">Income</h4>
                <p className="text-2xl font-bold">₹{budgetData.income}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
                <TrendingUp className="w-8 h-8 mb-3" />
                <h4 className="font-bold mb-1">Expenses</h4>
                <p className="text-2xl font-bold">
                  ₹{analysis.budgetSummary.totalExpenses}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                <CheckCircle className="w-8 h-8 mb-3" />
                <h4 className="font-bold mb-1">Balance</h4>
                <p className="text-2xl font-bold">
                  ₹{analysis.budgetSummary.netBalance}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <Brain className="w-8 h-8 mb-3" />
                <h4 className="font-bold mb-1">Health Score</h4>
                <p className="text-2xl font-bold">
                  {analysis.financialHealth.healthScore}/100
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-8">
              <PieChartComponent
                title="💰 Budget Breakdown"
                data={[
                  { name: "Rent", value: analysis.budgetBreakdown.rent },
                  { name: "Food", value: analysis.budgetBreakdown.food },
                  { name: "EMI", value: analysis.budgetBreakdown.emi },
                  { name: "Travel", value: analysis.budgetBreakdown.travel },
                  { name: "Savings", value: analysis.budgetBreakdown.savings },
                  { name: "Others", value: analysis.budgetBreakdown.miscellaneous },
                ].filter((item) => item.value > 0)}
              />

              <BarChartComponent
                title="📊 Financial Health Metrics"
                data={[
                  { name: "Health Score", value: analysis.financialHealth.healthScore },
                  { name: "Savings Rate", value: analysis.budgetSummary.savingsRatio },
                  { name: "Expense Ratio", value: analysis.budgetSummary.expenseRatio },
                  { name: "Success Rate", value: analysis.budgetSummary.savingsSuccessRate },
                ]}
              />
            </div>

            {/* Financial Health Analysis */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">
                🧠 AI Financial Analysis
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {analysis.financialHealth.healthScore}
                    </span>
                  </div>
                  <h4 className="font-bold text-soft-white mb-2">Health Score</h4>
                  <p className="text-slate-gray text-sm">Overall financial wellness</p>
                </div>

                <div className="text-center">
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full ${getRiskColor(
                      analysis.financialHealth.riskLevel
                    )} mb-4`}
                  >
                    <span className="font-bold">{analysis.financialHealth.riskLevel} Risk</span>
                  </div>
                  <h4 className="font-bold text-soft-white mb-2">Risk Level</h4>
                  <p className="text-slate-gray text-sm">Financial risk assessment</p>
                </div>

                <div className="text-center">
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full ${
                      analysis.financialHealth.emiSafetyStatus === "Safe"
                        ? "bg-green-400/20 text-green-400"
                        : "bg-red-400/20 text-red-400"
                    } mb-4`}
                  >
                    <span className="font-bold">{analysis.financialHealth.emiSafetyStatus}</span>
                  </div>
                  <h4 className="font-bold text-soft-white mb-2">EMI Status</h4>
                  <p className="text-slate-gray text-sm">Loan burden analysis</p>
                </div>
              </div>
            </div>

            {/* Expert Tips */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">
                💡 Expert Financial Tips
              </h3>

              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                {analysis.expertTips.map((tip: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">{tip.category[0]}</span>
                    </div>
                    <h4 className="font-bold text-soft-white mb-2 text-center">{tip.category}</h4>
                    <p className="text-slate-gray text-sm mb-3">{tip.tip}</p>
                    <p className="text-purple-400 text-xs font-medium">✓ {tip.benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">
                🎯 Smart Recommendations
              </h3>

              <div className="space-y-4">
                {analysis.smartRecommendations.map((rec: any, index: number) => (
                  <div key={index} className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-xl p-6 border border-blue-500/20">
                    <div className="flex items-start space-x-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${rec.priority === "High" ? "bg-red-500 text-white" : "bg-yellow-500 text-black"}`}>
                        {rec.priority}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-soft-white mb-2">{rec.action}</h4>
                        <p className="text-slate-gray text-sm mb-2">{rec.method}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-green-400 font-medium">💰 ₹{rec.savings}/month</p>
                          <p className="text-blue-400 text-sm">⏱️ {rec.timeline}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The rest of the UI remains unchanged */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  const doc = new jsPDF();
                  doc.text("SmartBudget AI Report", 20, 20);
                  doc.text(`Income: ₹${budgetData.income}`, 20, 40);
                  doc.text(`Health Score: ${analysis.financialHealth.healthScore}/100`, 20, 60);
                  doc.save("budget-report.pdf");
                }}
                className="bg-gradient-to-r from-gold to-rose-gold text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Report</span>
              </button>

              <button
                onClick={() => {
                  setAnalysis(null);
                  setBudgetData({
                    income: "",
                    rent: "",
                    food: "",
                    emi: "",
                    travel: "",
                    savingsGoal: "",
                  });
                }}
                className="bg-charcoal-gray text-soft-white px-6 py-3 rounded-xl font-semibold hover:bg-jet-black transition-all duration-300"
              >
                ← New Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SmartBudgetAI;
