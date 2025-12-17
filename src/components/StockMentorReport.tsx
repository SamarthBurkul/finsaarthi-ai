import React, { useEffect, useState } from "react";
import { createStockReport, getLatestStockReport, RiskProfile } from "../api/stockService";

const StockMentorReport: React.FC = () => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(50000);
  const [savingsGoal, setSavingsGoal] = useState<number>(200000);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("moderate");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const token = localStorage.getItem("authToken") || "";

  useEffect(() => {
    const loadLatest = async () => {
      if (!token) {
        setInitialLoading(false);
        return;
      }
      try {
        const latest = await getLatestStockReport(token);
        setReport(latest);
        setMonthlyIncome(latest.monthlyIncome);
        setSavingsGoal(latest.savingsGoal);
        setRiskProfile(latest.riskProfile);
      } catch (e) {
        console.error(e);
      } finally {
        setInitialLoading(false);
      }
    };
    loadLatest();
  }, [token]);

  const handleGenerate = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const newReport = await createStockReport(
        { monthlyIncome, savingsGoal, riskProfile },
        token
      );
      setReport(newReport);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20 text-soft-white">
        Please sign in to use StockMentor AI Report.
      </div>
    );
  }

  return (
    <section className="py-12 bg-jet-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-soft-white mb-6">
          StockMentor AI – Goal-based Report
        </h2>

        {/* Form */}
        <div className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-soft-white font-medium mb-2">
                Monthly Income (₹)
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-2 text-soft-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-soft-white font-medium mb-2">
                Savings Goal (₹)
              </label>
              <input
                type="number"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(Number(e.target.value))}
                className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-2 text-soft-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-soft-white font-medium mb-2">
                Risk Profile
              </label>
              <select
                value={riskProfile}
                onChange={(e) => setRiskProfile(e.target.value as RiskProfile)}
                className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-2 text-soft-white focus:border-green-400 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? "Generating report..." : "Generate AI learning report"}
            </button>
          </div>
        </div>

        {/* Report */}
        {initialLoading ? (
          <p className="text-slate-gray">Loading latest report…</p>
        ) : !report ? (
          <p className="text-slate-gray">
            No report yet. Enter details and click “Generate AI learning report”.
          </p>
        ) : (
          <div className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20 text-soft-white space-y-4">
            <h3 className="text-2xl font-bold mb-2">Your Learning Report</h3>
            <p className="text-slate-gray">{report.aiSummary}</p>

            <div>
              <h4 className="font-semibold mb-1">Scores</h4>
              <p className="text-slate-gray text-sm">
                Risk score: {report.scores?.riskScore} / 100
              </p>
              <p className="text-slate-gray text-sm">
                Learning suitability: {report.scores?.learningSuitability} / 100
              </p>
              <p className="text-slate-gray text-sm">
                Market emotion: {report.scores?.marketEmotion} / 100
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Key learning points</h4>
              <ul className="list-disc list-inside text-slate-gray text-sm">
                {report.learningPoints?.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StockMentorReport;
