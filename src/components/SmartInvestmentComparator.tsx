import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, Download, Target, DollarSign, BarChart3, Shield, CheckCircle, XCircle, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import investmentService from '../api/investmentService';

interface InvestmentOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const INVESTMENT_OPTIONS: InvestmentOption[] = [
  { id: 'Gold Investment', name: 'Gold Investment', icon: '🥇', description: 'Physical / Digital' },
  { id: 'Fixed Deposits', name: 'Fixed Deposits', icon: '🏦', description: 'Bank / Corporate' },
  { id: 'Mutual Funds', name: 'Mutual Funds', icon: '📈', description: 'Equity / Hybrid' }
];

const SmartInvestmentComparator: React.FC = () => {
  const [investmentData, setInvestmentData] = useState({
    selectedInvestments: [] as string[],
    amount: '',
    timePeriod: '',
    riskPreference: '',
    investmentGoal: '',
    liquidityPreference: '',
    investmentFrequency: 'lump_sum',
    considerTax: false
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const toggleInvestmentSelection = (investment: string) => {
    setInvestmentData(prev => {
      const selected = prev.selectedInvestments.includes(investment)
        ? prev.selectedInvestments.filter(i => i !== investment)
        : prev.selectedInvestments.length < 3
          ? [...prev.selectedInvestments, investment]
          : prev.selectedInvestments;
      return { ...prev, selectedInvestments: selected };
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setInvestmentData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateInputs = () => {
    if (investmentData.selectedInvestments.length === 0) {
      setError('Please select at least 1 investment option');
      return false;
    }
    if (!investmentData.amount || parseInt(investmentData.amount) < 5000) {
      setError('Minimum investment amount is ₹5,000');
      return false;
    }
    if (!investmentData.timePeriod) {
      setError('Please select a time period');
      return false;
    }
    if (!investmentData.riskPreference) {
      setError('Please select your risk preference');
      return false;
    }
    if (!investmentData.investmentGoal) {
      setError('Please select your investment goal');
      return false;
    }
    if (!investmentData.liquidityPreference) {
      setError('Please select your liquidity preference');
      return false;
    }
    return true;
  };

  const compareInvestments = async () => {
    if (!validateInputs()) return;
    
    setIsAnalyzing(true);
    setError('');

    try {
      const response = await investmentService.compareInvestments({
        selectedInvestments: investmentData.selectedInvestments,
        investmentAmount: parseInt(investmentData.amount),
        timePeriod: investmentData.timePeriod,
        riskPreference: investmentData.riskPreference,
        investmentGoal: investmentData.investmentGoal,
        liquidityPreference: investmentData.liquidityPreference,
        investmentFrequency: investmentData.investmentFrequency,
        considerTax: investmentData.considerTax
      });

      setComparison(response);
    } catch (err: any) {
      setError(err.message || 'Failed to compare investments. Please try again.');
      console.error('Comparison error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const BarChartComponent = ({ data, title }: { data: any[], title: string }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    const colors = ['#FFD700', '#4F46E5', '#10B981'];

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">{title}</h4>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white text-sm">{item.name}</span>
                <span className="text-soft-white font-bold">₹{(item.value / 100000).toFixed(1)}L</span>
              </div>
              <div className="w-full bg-charcoal-gray rounded-full h-4">
                <div
                  className="h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: colors[index]
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PieChartComponent = ({ data, title }: { data: any[], title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const colors = ['#FFD700', '#4F46E5', '#10B981'];

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">{title}</h4>
        <div className="flex items-center justify-center">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (item.value / total) * 360;
              const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
              const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
              const largeArc = angle > 180 ? 1 : 0;
              
              const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={path}
                  fill={colors[index]}
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
                <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: colors[index] }}></div>
                <span className="text-white text-sm">{item.name}</span>
              </div>
              <span className="text-soft-white font-medium">{((item.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const generatePDFReport = () => {
    if (!comparison || !comparison.results) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Investment Comparison Report', 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);
    doc.text('EDUCATIONAL PREDICTION - NOT A FINANCIAL GUARANTEE', 20, 42);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Comparison Results:', 20, 60);
    
    let yPos = 70;
    Object.entries(comparison.results).forEach(([key, investment]: [string, any]) => {
      const names: any = { gold: 'Gold', fixedDeposit: 'Fixed Deposit', mutualFunds: 'Mutual Funds' };
      doc.setFontSize(10);
      doc.text(`${names[key]}: ₹${investment.finalValue?.toLocaleString()} (Profit: ₹${investment.profit?.toLocaleString()})`, 20, yPos);
      doc.text(`  Risk: ${investment.riskLevel} | Suitability: ${investment.suitabilityScore}%`, 20, yPos + 7);
      yPos += 20;
    });
    
    if (comparison.aiVerdict) {
      doc.setFontSize(14);
      doc.text('AI Recommendation:', 20, yPos + 10);
      doc.setFontSize(10);
      doc.text(`Best Option: ${comparison.aiVerdict.bestOption}`, 20, yPos + 20);
      doc.text(`Backup: ${comparison.aiVerdict.backupOption}`, 20, yPos + 27);
      doc.text(`Confidence: ${comparison.aiVerdict.confidence}%`, 20, yPos + 34);
      doc.text('Reasoning:', 20, yPos + 44);
      const reasoning = doc.splitTextToSize(comparison.aiVerdict.reasoning, 170);
      doc.text(reasoning, 20, yPos + 51);
    }
    
    doc.save('investment-comparison-report.pdf');
  };

  return (
    <section className="py-16 relative overflow-hidden bg-[#0C2B4E]">
  <div className="
    absolute inset-0
    bg-gradient-to-br from-black/40 to-slate-900/60
    backdrop-blur-xl
  "></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold text-soft-white mb-4">
            Smart Investment <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">Comparator</span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-inter">
            AI-powered comparison of Gold, Fixed Deposits, and Mutual Funds based on your profile
          </p>
        </div>

        {!comparison ? (
          <div className="max-w-6xl mx-auto bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-8">
              <div className="flex items-center justify-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-bold">📚 Educational Prediction - Not a Financial Guarantee</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">
              💰 Configure Your Investment Comparison
            </h3>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">{error}</span>
                </div>
              </div>
            )}
            
            {/* 1️⃣ Investment Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-soft-white mb-4 flex items-center">
                <span className="bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                Select Investment Options (Min: 1, Max: 3) *
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {INVESTMENT_OPTIONS.map(option => (
                  <div
                    key={option.id}
                    onClick={() => toggleInvestmentSelection(option.id)}
                    className={`cursor-pointer rounded-xl p-6 border-2 transition-all duration-300 ${
                      investmentData.selectedInvestments.includes(option.id)
                        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500'
                        : 'bg-jet-black border-slate-gray/30 hover:border-slate-gray'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl">{option.icon}</span>
                      {investmentData.selectedInvestments.includes(option.id) && (
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>
                    <h5 className="text-soft-white font-bold mb-1">{option.name}</h5>
                    <p className="text-white text-sm">{option.description}</p>
                  </div>
                ))}
              </div>
              <p className="text-white text-sm mt-2 flex items-center">
                <Info className="w-4 h-4 mr-1" />
                Selected: {investmentData.selectedInvestments.length}/3
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* 2️⃣ Investment Amount */}
                <div>
                  <label className="block text-soft-white font-medium mb-2 flex items-center">
                    <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                    Investment Amount *
                  </label>
                  <input
                    type="number"
                    value={investmentData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="Minimum ₹5,000"
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none"
                  />
                  <p className="text-white text-xs mt-1">Enter the total amount you plan to invest</p>
                </div>

                {/* 3️⃣ Time Period */}
                <div>
                  <label className="block text-soft-white font-medium mb-2 flex items-center">
                    <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                    Time Period *
                  </label>
                  <select
                    value={investmentData.timePeriod}
                    onChange={(e) => handleInputChange('timePeriod', e.target.value)}
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="">Select Time Period</option>
                    <option value="short">Short term (≤ 1 year)</option>
                    <option value="medium">Medium term (1–3 years)</option>
                    <option value="long">Long term (3+ years)</option>
                  </select>
                </div>

                {/* 4️⃣ Risk Preference */}
                <div>
                  <label className="block text-soft-white font-medium mb-2 flex items-center">
                    <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">4</span>
                    Risk Preference *
                  </label>
                  <select
                    value={investmentData.riskPreference}
                    onChange={(e) => handleInputChange('riskPreference', e.target.value)}
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="">Select Risk Level</option>
                    <option value="low">Low - Safety First</option>
                    <option value="medium">Medium - Balanced Approach</option>
                    <option value="high">High - Growth Focus</option>
                  </select>
                </div>

                {/* 5️⃣ Investment Goal */}
                <div>
                  <label className="block text-soft-white font-medium mb-2 flex items-center">
                    <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">5</span>
                    Investment Goal *
                  </label>
                  <select
                    value={investmentData.investmentGoal}
                    onChange={(e) => handleInputChange('investmentGoal', e.target.value)}
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="">Select Investment Goal</option>
                    <option value="Capital Protection">Capital Protection</option>
                    <option value="Steady Income">Steady Income</option>
                    <option value="Wealth Growth">Wealth Growth</option>
                    <option value="Inflation Protection">Inflation Protection</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* 6️⃣ Liquidity Preference */}
                <div>
                  <label className="block text-soft-white font-medium mb-2 flex items-center">
                    <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">6</span>
                    Liquidity Preference *
                  </label>
                  <select
                    value={investmentData.liquidityPreference}
                    onChange={(e) => handleInputChange('liquidityPreference', e.target.value)}
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="">Select Liquidity Need</option>
                    <option value="anytime">Need anytime access</option>
                    <option value="some_time">Can lock for some time</option>
                    <option value="long_term">Long-term lock acceptable</option>
                  </select>
                </div>

                {/* 7️⃣ Investment Frequency */}
                <div>
                  <label className="block text-soft-white font-medium mb-2 flex items-center">
                    <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">7</span>
                    Investment Frequency *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex-1">
                      <input
                        type="radio"
                        name="frequency"
                        value="lump_sum"
                        checked={investmentData.investmentFrequency === 'lump_sum'}
                        onChange={(e) => handleInputChange('investmentFrequency', e.target.value)}
                        className="mr-2"
                      />
                      <span className={`inline-block w-full cursor-pointer rounded-xl px-4 py-3 text-center border ${
                        investmentData.investmentFrequency === 'lump_sum'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-jet-black border-slate-gray/30 text-white'
                      }`}>
                        💰 One-time (Lump Sum)
                      </span>
                    </label>
                    <label className="flex-1">
                      <input
                        type="radio"
                        name="frequency"
                        value="monthly"
                        checked={investmentData.investmentFrequency === 'monthly'}
                        onChange={(e) => handleInputChange('investmentFrequency', e.target.value)}
                        className="mr-2 hidden"
                      />
                      <span className={`inline-block w-full cursor-pointer rounded-xl px-4 py-3 text-center border ${
                        investmentData.investmentFrequency === 'monthly'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-jet-black border-slate-gray/30 text-white'
                      }`}>
                        📅 Monthly (SIP)
                      </span>
                    </label>
                  </div>
                </div>

                {/* 8️⃣ Tax Sensitivity */}
                <div>
                  <label className="flex items-center cursor-pointer bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 hover:border-emerald-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={investmentData.considerTax}
                      onChange={(e) => handleInputChange('considerTax', e.target.checked)}
                      className="mr-3 w-5 h-5"
                    />
                    <div>
                      <span className="text-soft-white font-medium">Consider tax impact in analysis</span>
                      <p className="text-white text-xs">Recommended for comprehensive comparison</p>
                    </div>
                  </label>
                </div>

                {/* Action Button */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-xl p-6 border border-emerald-500/20">
                  <h4 className="font-bold text-soft-white mb-3 text-center">Ready to Compare?</h4>
                  <p className="text-white text-sm text-center mb-4">
                    We'll analyze your selections and provide an AI-powered recommendation
                  </p>
                  <button
                    onClick={compareInvestments}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isAnalyzing ? '🧠 AI Analyzing Your Options...' : '🚀 Compare Investments Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Warning Banner */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                <span className="text-orange-400 font-bold text-lg">📚 {comparison.disclaimer || 'Educational Prediction - Not a Financial Guarantee'}</span>
              </div>
            </div>

            {/* Investment Comparison Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {comparison.results && Object.entries(comparison.results).map(([key, investment]: [string, any]) => {
                const investmentColors: any = {
                  gold: { from: 'yellow-500', to: 'yellow-600', border: 'yellow-500', text: 'yellow-400' },
                  fixedDeposit: { from: 'blue-500', to: 'blue-600', border: 'blue-500', text: 'blue-400' },
                  mutualFunds: { from: 'green-500', to: 'green-600', border: 'green-500', text: 'green-400' }
                };
                const investmentIcons: any = {
                  gold: '🥇',
                  fixedDeposit: '🏦',
                  mutualFunds: '📈'
                };
                const investmentNames: any = {
                  gold: 'Gold Investment',
                  fixedDeposit: 'Fixed Deposits',
                  mutualFunds: 'Mutual Funds'
                };
                const colors = investmentColors[key];
                
                return (
                  <div key={key} className={`bg-gradient-to-br from-${colors.from}/10 to-${colors.to}/10 rounded-2xl p-6 border border-${colors.border}/20 relative`}>
                    {comparison.aiVerdict?.bestOption === investmentNames[key] && (
                      <div className="absolute -top-3 -right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                        ⭐ BEST CHOICE
                      </div>
                    )}
                    {comparison.aiVerdict?.backupOption === investmentNames[key] && (
                      <div className="absolute -top-3 -right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                        🥈 BACKUP
                      </div>
                    )}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-12 h-12 bg-${colors.from} rounded-full flex items-center justify-center text-2xl`}>
                        {investmentIcons[key]}
                      </div>
                      <h3 className="text-xl font-bold text-soft-white">{investmentNames[key]}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white">Final Value:</span>
                        <span className="text-soft-white font-bold">₹{investment.finalValue?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Estimated Profit:</span>
                        <span className="text-green-400 font-bold">₹{investment.profit?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Risk Level:</span>
                        <span className={`font-bold ${
                          investment.riskLevel === 'Very Low' || investment.riskLevel === 'Low' ? 'text-green-400' :
                          investment.riskLevel === 'Medium' ? 'text-orange-400' : 'text-red-400'
                        }`}>{investment.riskLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Suitability Score:</span>
                        <span className="text-blue-400 font-bold">{investment.suitabilityScore}%</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-gray/20">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">Stability:</span>
                          <span className="text-blue-400 font-medium">{investment.stability}%</span>
                        </div>
                        <div className="w-full bg-charcoal-gray rounded-full h-2 mt-1">
                          <div className="h-2 bg-blue-400 rounded-full transition-all duration-1000" style={{ width: `${investment.stability}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white">Liquidity:</span>
                          <span className="text-green-400 font-medium">{investment.liquidity}%</span>
                        </div>
                        <div className="w-full bg-charcoal-gray rounded-full h-2 mt-1">
                          <div className="h-2 bg-green-400 rounded-full transition-all duration-1000" style={{ width: `${investment.liquidity}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Section */}
            {comparison.results && (
              <div className="grid md:grid-cols-2 gap-8">
                <BarChartComponent
                  title="💰 Final Value Comparison"
                  data={[
                    { name: 'Gold', value: comparison.results.gold?.finalValue || 0 },
                    { name: 'Fixed Deposit', value: comparison.results.fixedDeposit?.finalValue || 0 },
                    { name: 'Mutual Funds', value: comparison.results.mutualFunds?.finalValue || 0 }
                  ]}
                />
                
                <PieChartComponent
                  title="📊 Profit Distribution"
                  data={[
                    { name: 'Gold', value: comparison.results.gold?.profit || 0 },
                    { name: 'Fixed Deposit', value: comparison.results.fixedDeposit?.profit || 0 },
                    { name: 'Mutual Funds', value: comparison.results.mutualFunds?.profit || 0 }
                  ]}
                />
              </div>
            )}

            {/* AI Verdict Section */}
            {comparison.aiVerdict && (
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border-2 border-purple-500/30">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-soft-white mb-2">🤖 AI Final Verdict</h3>
                  <p className="text-white">Expert Analysis Based on Your Profile</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Most Suitable Option */}
                  <div className="text-center bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl p-6 border-2 border-emerald-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="font-bold text-emerald-400 mb-2 text-sm uppercase tracking-wide">🏆 Most Suitable</h4>
                    <p className="text-soft-white font-bold text-xl">{comparison.aiVerdict.bestOption}</p>
                    <p className="text-white text-sm mt-2">Best match for your profile</p>
                  </div>
                  
                  {/* Backup Option */}
                  <div className="text-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border-2 border-yellow-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="font-bold text-yellow-400 mb-2 text-sm uppercase tracking-wide">🥈 Backup Option</h4>
                    <p className="text-soft-white font-bold text-xl">{comparison.aiVerdict.backupOption}</p>
                    <p className="text-white text-sm mt-2">Second-best alternative</p>
                  </div>
                  
                  {/* Confidence Score */}
                  <div className="text-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border-2 border-blue-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-white font-bold text-2xl">{comparison.aiVerdict.confidence}%</span>
                    </div>
                    <h4 className="font-bold text-blue-400 mb-2 text-sm uppercase tracking-wide">🎯 Model Confidence</h4>
                    <p className="text-soft-white font-bold text-xl">High Accuracy</p>
                    <p className="text-white text-sm mt-2">Based on analysis patterns</p>
                  </div>
                </div>
                
                {/* AI Reasoning - Explainability */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30 mb-6">
                  <h4 className="font-bold text-emerald-400 mb-3 text-lg flex items-center">
                    <span className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">💡</span>
                    AI Reasoning - Why This Recommendation?
                  </h4>
                  <p className="text-white leading-relaxed text-lg">{comparison.aiVerdict.reasoning}</p>
                </div>

                {/* Why Not Chosen Section */}
                {comparison.aiVerdict.whyNotChosen && comparison.aiVerdict.whyNotChosen.length > 0 && (
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/30">
                    <h4 className="font-bold text-orange-400 mb-4 text-lg flex items-center">
                      <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">❌</span>
                      Why Other Options Ranked Lower
                    </h4>
                    <div className="space-y-4">
                      {comparison.aiVerdict.whyNotChosen.map((item: any, index: number) => (
                        <div key={index} className="bg-jet-black/50 rounded-lg p-4 border border-orange-500/20">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <XCircle className="w-5 h-5 text-orange-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-soft-white font-bold mb-1">{item.investment}</h5>
                              <p className="text-white text-sm leading-relaxed">{item.reason}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                      <p className="text-blue-400 text-sm flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        <span><strong>Key Trade-offs:</strong> Higher returns often come with higher risk. Lower-ranked options may still be suitable depending on market conditions and personal circumstances.</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Detailed Analysis */}
            {comparison.results && (
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(comparison.results).map(([key, investment]: [string, any]) => {
                  const investmentNames: any = {
                    gold: 'Gold Investment',
                    fixedDeposit: 'Fixed Deposits',
                    mutualFunds: 'Mutual Funds'
                  };
                  return (
                    <div key={key} className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20 hover:border-emerald-500/30 transition-colors">
                      <h4 className="font-bold text-soft-white mb-4 text-lg">{investmentNames[key]} Analysis</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-green-400 mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" /> Pros
                          </h5>
                          <ul className="space-y-2">
                            {investment.pros?.map((pro: string, index: number) => (
                              <li key={index} className="text-white text-sm flex items-start">
                                <span className="text-green-400 mr-2">•</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-red-400 mb-2 flex items-center">
                            <XCircle className="w-4 h-4 mr-1" /> Cons
                          </h5>
                          <ul className="space-y-2">
                            {investment.cons?.map((con: string, index: number) => (
                              <li key={index} className="text-white text-sm flex items-start">
                                <span className="text-red-400 mr-2">•</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Educational Disclaimer Section */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
              <h3 className="text-2xl font-bold text-soft-white mb-4 text-center">📚 Important Disclaimer</h3>
              <div className="space-y-4 text-white">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                  <p className="leading-relaxed">
                    <strong className="text-orange-400">Educational Purpose Only:</strong> All predictions and recommendations provided by this tool are based on historical data patterns and statistical models. They are meant for educational purposes and should not be considered as financial advice or guaranteed returns.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <p className="leading-relaxed">
                    <strong className="text-blue-400">Market Risks:</strong> Actual investment returns can vary significantly due to market volatility, economic conditions, regulatory changes, and other unforeseen factors. Past performance does not guarantee future results.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <p className="leading-relaxed">
                    <strong className="text-emerald-400">Professional Advice:</strong> We strongly recommend consulting with a certified financial advisor or planner before making any investment decisions. This tool provides comparative analysis based on your inputs but cannot account for all personal circumstances.
                  </p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                  <p className="text-yellow-400 font-medium text-center">
                    ⚠️ Suitability scores reflect alignment with your stated preferences, not guaranteed performance ⚠️
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={generatePDFReport}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Download PDF Report</span>
              </button>
              
              <button
                onClick={() => {
                  setComparison(null);
                  setInvestmentData({
                    selectedInvestments: [],
                    amount: '',
                    timePeriod: '',
                    riskPreference: '',
                    investmentGoal: '',
                    liquidityPreference: '',
                    investmentFrequency: 'lump_sum',
                    considerTax: false
                  });
                  setError('');
                }}
                className="bg-gradient-to-r from-slate-600 to-slate-700 text-soft-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
              >
                🔄 New Comparison
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SmartInvestmentComparator;