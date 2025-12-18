import React, { useState } from 'react';
import { Calculator, TrendingUp, PiggyBank, Home, Repeat, DollarSign, BarChart3, AlertTriangle, Brain, Download, Target, Lightbulb, Store } from 'lucide-react';
import SmartBusinessCalculator from './SmartBusinessCalculator';
import { calculateEMI, calculateSIP, calculateFD, calculateRD, calculateSimpleInterest, calculateCompoundInterest, calculateSavingsGrowth } from '../utils/calculations';
import { getDeepAIAnalysis } from '../utils/groqApi';
import { CalculatorResult } from '../types';
import jsPDF from 'jspdf';

const AdvancedCalculatorHub: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState('emi');
  const [showBusinessCalculator, setShowBusinessCalculator] = useState(false);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('compound');
  const [formData, setFormData] = useState({
    principal: '',
    rate: '',
    tenure: '',
    monthlyAmount: '',
    years: '',
    time: ''
  });

  const calculators = [
    { 
      id: 'emi', 
      name: 'EMI Calculator', 
      icon: Home, 
      definition: 'An EMI Calculator helps you find out how much money you need to pay every month for your loan based on the loan amount, interest rate, and time period.'
    },
    { 
      id: 'sip', 
      name: 'SIP Calculator', 
      icon: TrendingUp, 
      definition: 'The SIP Calculator helps you understand how your small monthly investments grow into a big amount over a long period.'
    },
    { 
      id: 'fd', 
      name: 'FD Calculator', 
      icon: PiggyBank, 
      definition: 'The FD Calculator helps you know how much your one-time investment will grow after a fixed time at a fixed interest rate.'
    },
    { 
      id: 'rd', 
      name: 'RD Calculator', 
      icon: Repeat, 
      definition: 'The RD Calculator shows how much money you will get in the future by saving a fixed amount every month in a bank deposit.'
    },
    { 
      id: 'interest', 
      name: 'Interest Calculator', 
      icon: DollarSign, 
      definition: 'This calculator shows how much extra money you earn or pay as interest over time, using either simple interest or interest that grows on interest (compound).'
    },
    { 
      id: 'savings', 
      name: 'Savings Growth', 
      icon: BarChart3, 
      definition: 'The Savings Growth Calculator shows how your regular savings increase over time and how much wealth you can build in the future.'
    },
    { 
      id: 'business', 
      name: 'Business Calculator', 
      icon: Calculator, 
      definition: 'A smart calculator for shopkeepers that tracks daily sales, stores business data, and provides AI-powered profit insights for better business management.'
    }
  ];

  const getRiskLevel = (calculatorType: string, values: any, result: any) => {
    try {
      switch (calculatorType) {
        case 'emi':
          const rate = parseFloat(values.rate) || 0;
          const emiAmount = result.monthlyPayment || 0;
          const loanAmount = parseFloat(values.principal) || 0;
          if (rate > 15 || (loanAmount > 0 && emiAmount > loanAmount * 0.1)) return { level: 'High', color: '#EF4444', message: 'High interest rate or EMI burden' };
          if (rate > 10 || (loanAmount > 0 && emiAmount > loanAmount * 0.07)) return { level: 'Medium', color: '#FACC15', message: 'Moderate EMI - manageable' };
          return { level: 'Safe', color: '#22C55E', message: 'Affordable EMI structure' };
        case 'sip':
          const sipRate = parseFloat(values.rate) || 0;
          const sipAmount = parseFloat(values.monthlyAmount) || 0;
          if (sipRate > 18 || sipAmount < 1000) return { level: 'High', color: '#EF4444', message: 'Very aggressive expectations or low investment' };
          if (sipRate > 12 || sipAmount < 3000) return { level: 'Medium', color: '#FACC15', message: 'Moderate risk investment' };
          return { level: 'Safe', color: '#22C55E', message: 'Conservative wealth building' };
        case 'fd':
          const fdRate = parseFloat(values.rate) || 0;
          if (fdRate > 9) return { level: 'Medium', color: '#FACC15', message: 'Above market FD rate' };
          return { level: 'Safe', color: '#22C55E', message: 'Secure fixed deposit' };
        case 'rd':
          const rdAmount = parseFloat(values.monthlyAmount) || 0;
          if (rdAmount < 500) return { level: 'Medium', color: '#FACC15', message: 'Very small monthly deposit' };
          return { level: 'Safe', color: '#22C55E', message: 'Disciplined savings approach' };
        case 'interest':
          const intRate = parseFloat(values.rate) || 0;
          if (intRate > 12) return { level: 'Medium', color: '#FACC15', message: 'High interest rate scenario' };
          return { level: 'Safe', color: '#22C55E', message: 'Standard interest calculation' };
        case 'savings':
          const savingsAmount = parseFloat(values.monthlyAmount) || 0;
          if (savingsAmount < 1000) return { level: 'Medium', color: '#FACC15', message: 'Low monthly savings amount' };
          return { level: 'Safe', color: '#22C55E', message: 'Good savings habit' };
        default:
          return { level: 'Safe', color: '#22C55E', message: 'Standard financial calculation' };
      }
    } catch (error) {
      return { level: 'Safe', color: '#22C55E', message: 'Unable to assess risk' };
    }
  };

  const handleCalculate = async () => {
    try {
      let calculationResult: CalculatorResult;
      
      switch (activeCalculator) {
        case 'emi':
          calculationResult = calculateEMI(parseFloat(formData.principal) || 0, parseFloat(formData.rate) || 0, parseFloat(formData.tenure) || 1);
          break;
        case 'sip':
          calculationResult = calculateSIP(parseFloat(formData.monthlyAmount) || 0, parseFloat(formData.rate) || 0, parseFloat(formData.years) || 1);
          break;
        case 'fd':
          calculationResult = calculateFD(parseFloat(formData.principal) || 0, parseFloat(formData.rate) || 0, parseFloat(formData.years) || 1);
          break;
        case 'rd':
          calculationResult = calculateRD(parseFloat(formData.monthlyAmount) || 0, parseFloat(formData.rate) || 0, parseFloat(formData.years) || 1);
          break;
        case 'interest':
          calculationResult = interestType === 'simple' 
            ? calculateSimpleInterest(parseFloat(formData.principal) || 0, parseFloat(formData.rate) || 0, parseFloat(formData.time) || 1)
            : calculateCompoundInterest(parseFloat(formData.principal) || 0, parseFloat(formData.rate) || 0, parseFloat(formData.time) || 1);
          break;
        case 'savings':
          calculationResult = calculateSavingsGrowth(parseFloat(formData.monthlyAmount) || 0, parseFloat(formData.rate) || 0, parseFloat(formData.years) || 1);
          break;
        default:
          return;
      }
      
      setResult(calculationResult);
      
      setIsLoadingAI(true);
      const analysis = await getDeepAIAnalysis(activeCalculator, formData, calculationResult);
      setAiAnalysis(analysis);
      setIsLoadingAI(false);
    } catch (error) {
      console.error('Calculation error:', error);
      setIsLoadingAI(false);
    }
  };

  const renderForm = () => {
    const inputClass = "w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-ubuntu transition-all duration-300";
    const labelClass = "block text-soft-white font-medium mb-2 font-ubuntu";

    switch (activeCalculator) {
      case 'emi':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Loan Amount (₹)</label>
              <input type="number" value={formData.principal} onChange={(e) => setFormData({...formData, principal: e.target.value})} className={inputClass} placeholder="e.g., 500000" />
            </div>
            <div>
              <label className={labelClass}>Interest Rate (% per annum)</label>
              <input type="number" value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} className={inputClass} placeholder="e.g., 8.5" />
            </div>
            <div>
              <label className={labelClass}>Tenure (months)</label>
              <input type="number" value={formData.tenure} onChange={(e) => setFormData({...formData, tenure: e.target.value})} className={inputClass} placeholder="e.g., 240" />
            </div>
          </div>
        );
      case 'sip':
      case 'rd':
      case 'savings':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Monthly Amount (₹)</label>
              <input type="number" value={formData.monthlyAmount} onChange={(e) => setFormData({...formData, monthlyAmount: e.target.value})} className={inputClass} placeholder="e.g., 5000" />
            </div>
            <div>
              <label className={labelClass}>Expected Return (% per annum)</label>
              <input type="number" value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} className={inputClass} placeholder="e.g., 12" />
            </div>
            <div>
              <label className={labelClass}>Period (years)</label>
              <input type="number" value={formData.years} onChange={(e) => setFormData({...formData, years: e.target.value})} className={inputClass} placeholder="e.g., 10" />
            </div>
          </div>
        );
      case 'fd':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Principal Amount (₹)</label>
              <input type="number" value={formData.principal} onChange={(e) => setFormData({...formData, principal: e.target.value})} className={inputClass} placeholder="e.g., 100000" />
            </div>
            <div>
              <label className={labelClass}>Interest Rate (% per annum)</label>
              <input type="number" value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} className={inputClass} placeholder="e.g., 6.5" />
            </div>
            <div>
              <label className={labelClass}>Duration (years)</label>
              <input type="number" value={formData.years} onChange={(e) => setFormData({...formData, years: e.target.value})} className={inputClass} placeholder="e.g., 5" />
            </div>
          </div>
        );
      case 'interest':
        return (
          <div className="space-y-4">
            <div className="flex space-x-4 mb-4">
              <button onClick={() => setInterestType('simple')} className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${interestType === 'simple' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105' : 'bg-charcoal-gray text-soft-white border border-slate-gray/30 hover:border-emerald-400/50 hover:bg-jet-black'}`}>Simple Interest</button>
              <button onClick={() => setInterestType('compound')} className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${interestType === 'compound' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105' : 'bg-charcoal-gray text-soft-white border border-slate-gray/30 hover:border-emerald-400/50 hover:bg-jet-black'}`}>Compound Interest</button>
            </div>
            <div>
              <label className={labelClass}>Principal Amount (₹)</label>
              <input type="number" value={formData.principal} onChange={(e) => setFormData({...formData, principal: e.target.value})} className={inputClass} placeholder="e.g., 50000" />
            </div>
            <div>
              <label className={labelClass}>Interest Rate (% per annum)</label>
              <input type="number" value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} className={inputClass} placeholder="e.g., 8" />
            </div>
            <div>
              <label className={labelClass}>Time Period (years)</label>
              <input type="number" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className={inputClass} placeholder="e.g., 3" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const generatePDF = () => {
    if (!result || !aiAnalysis) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Financial Analysis Report', 20, 30);
    
    doc.setFontSize(14);
    doc.text(`Calculator: ${calculators.find(c => c.id === activeCalculator)?.name}`, 20, 50);
    
    doc.setFontSize(12);
    doc.text('Results:', 20, 70);
    if (result.monthlyPayment) doc.text(`Monthly EMI: ₹${result.monthlyPayment.toLocaleString()}`, 20, 85);
    if (result.maturityAmount) doc.text(`Maturity Amount: ₹${result.maturityAmount.toLocaleString()}`, 20, 100);
    if (result.totalInterest) doc.text(`Total Interest: ₹${result.totalInterest.toLocaleString()}`, 20, 115);
    
    doc.text('AI Analysis:', 20, 135);
    const analysisText = aiAnalysis.analysis?.replace(/\*/g, '') || 'Analysis complete';
    const splitText = doc.splitTextToSize(analysisText, 170);
    doc.text(splitText, 20, 150);
    
    doc.text(`Financial Score: ${aiAnalysis.score}/100`, 20, 200);
    
    doc.save(`${activeCalculator}-analysis-report.pdf`);
  };

  const renderResults = () => {
    if (!result) return null;

    const risk = getRiskLevel(activeCalculator, formData, result);

    return (
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center font-ubuntu text-soft-white">
              <BarChart3 className="w-5 h-5 mr-2 text-emerald-400" />
              Calculation Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.monthlyPayment && (
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-slate-gray font-ubuntu">Monthly EMI</p>
                  <p className="text-2xl font-bold text-blue-400">₹{result.monthlyPayment.toLocaleString()}</p>
                </div>
              )}
              {result.maturityAmount && (
                <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <p className="text-sm text-slate-gray font-ubuntu">Maturity Amount</p>
                  <p className="text-2xl font-bold text-emerald-400">₹{result.maturityAmount.toLocaleString()}</p>
                </div>
              )}
              {result.totalInterest && (
                <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/20">
                  <p className="text-sm text-slate-gray font-ubuntu">Total Interest</p>
                  <p className="text-2xl font-bold text-orange-400">₹{result.totalInterest.toLocaleString()}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 rounded-lg border" style={{borderColor: risk.color, backgroundColor: `${risk.color}10`}}>
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5" style={{color: risk.color}} />
                <span className="font-semibold font-ubuntu" style={{color: risk.color}}>Risk Level: {risk.level}</span>
              </div>
              <p className="text-sm text-soft-white font-ubuntu">{risk.message}</p>
            </div>
          </div>
          
          {aiAnalysis && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg p-4 border border-emerald-500/20">
                <h6 className="text-sm font-semibold text-emerald-400 mb-3">📊 Financial Score</h6>
                <div className="relative h-24">
                  <svg width="100%" height="100%">
                    <circle cx="50%" cy="50%" r="30" fill="none" stroke="#374151" strokeWidth="4" />
                    <circle cx="50%" cy="50%" r="30" fill="none" stroke="#10B981" strokeWidth="4" 
                      strokeDasharray={`${(aiAnalysis.score / 100) * 188} 188`} 
                      strokeLinecap="round" transform="rotate(-90 50% 50%)" />
                    <text x="50%" y="55%" textAnchor="middle" className="text-lg fill-soft-white font-ubuntu font-bold">
                      {aiAnalysis.score}
                    </text>
                  </svg>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                <h6 className="text-sm font-semibold text-blue-400 mb-3">🎯 Prediction</h6>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-gray">1 Year</span>
                    <span className="text-xs text-blue-400 font-bold">+15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-gray">5 Year</span>
                    <span className="text-xs text-blue-400 font-bold">+85%</span>
                  </div>
                  <div className="w-full bg-slate-gray/30 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-4 border border-purple-500/20">
                <h6 className="text-sm font-semibold text-purple-400 mb-3">📈 Growth Trend</h6>
                <div className="relative h-16">
                  <svg width="100%" height="100%">
                    <path d="M10,50 Q30,30 50,35 T90,15" stroke="#8B5CF6" strokeWidth="3" fill="none" />
                    <circle cx="90" cy="15" r="3" fill="#8B5CF6" />
                    <circle cx="50" cy="35" r="2" fill="#8B5CF6" opacity="0.7" />
                    <text x="50%" y="90%" textAnchor="middle" className="text-xs fill-soft-white font-ubuntu">Excellent</text>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          {aiAnalysis && (
            <div className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent font-ubuntu flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-emerald-400 animate-pulse" />
                  AI Analysis
                </h4>
                <button onClick={generatePDF} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              
              {isLoadingAI ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <p className="text-slate-gray font-ubuntu text-center text-sm">🧠 AI analyzing...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-jet-black rounded-lg p-4 border border-emerald-500/10 max-h-40 overflow-y-auto">
                    <p className="text-xs text-soft-white font-ubuntu leading-relaxed">
                      {aiAnalysis.analysis?.replace(/\*/g, '') || 'AI analysis complete.'}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/20">
                      <h5 className="text-xs font-semibold text-blue-400 mb-2 flex items-center">
                        <Target className="w-3 h-3 mr-1" /> Smart Tips
                      </h5>
                      <div className="space-y-1">
                        <p className="text-xs text-soft-white">• Increase investment by 10% annually</p>
                        <p className="text-xs text-soft-white">• Review portfolio quarterly</p>
                        <p className="text-xs text-soft-white">• Diversify across asset classes</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg p-3 border border-emerald-500/20">
                      <h5 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center">
                        <Lightbulb className="w-3 h-3 mr-1" /> Recommendations
                      </h5>
                      <p className="text-xs text-soft-white">Your financial strategy shows strong potential. Consider tax-saving options for better returns.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
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
          <h2 className="text-4xl font-ubuntu font-bold text-soft-white mb-4">
            Advanced <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Financial Calculator Suite</span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-ubuntu">
            Professional-grade calculators with AI insights, predictions, and comprehensive analysis.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {calculators.map((calc) => {
            const Icon = calc.id === 'business' ? Store : calc.icon;
            return (
              <button
                key={calc.id}
                onClick={() => {
                  if (calc.id === 'business') {
                    setShowBusinessCalculator(true);
                  } else {
                    setActiveCalculator(calc.id);
                    setResult(null);
                    setAiAnalysis(null);
                    setShowBusinessCalculator(false);
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 font-ubuntu ${
                  (activeCalculator === calc.id && !showBusinessCalculator) || (calc.id === 'business' && showBusinessCalculator)
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'bg-charcoal-gray text-soft-white hover:bg-jet-black border border-slate-gray/30 hover:border-emerald-400/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{calc.name}</span>
              </button>
            );
          })}
        </div>

        {showBusinessCalculator ? (
          <SmartBusinessCalculator />
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-2xl font-semibold mb-4 flex items-center font-ubuntu text-soft-white">
                <Calculator className="w-6 h-6 mr-2 text-emerald-400" />
                {calculators.find(c => c.id === activeCalculator)?.name}
              </h3>
              
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                <p className="text-soft-white font-ubuntu leading-relaxed">
                  {calculators.find(c => c.id === activeCalculator)?.definition}
                </p>
              </div>
              
              {renderForm()}
              
              <button
                onClick={handleCalculate}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 w-full mt-6 text-lg"
              >
                🚀 Calculate
              </button>
            </div>

            {renderResults()}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdvancedCalculatorHub;