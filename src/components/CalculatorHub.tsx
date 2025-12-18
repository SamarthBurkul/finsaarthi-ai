import React, { useState } from 'react';
import { Calculator, TrendingUp, PiggyBank, Home, Car, GraduationCap, BarChart3, Brain, Sparkles } from 'lucide-react';
import { calculateEMI, calculateSIP, calculateFD, calculateSavingsGrowth } from '../utils/calculations';

import { CalculatorResult } from '../types';

const CalculatorHub: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState('emi');
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const [formData, setFormData] = useState({
    principal: '',
    rate: '',
    tenure: '',
    monthlyAmount: '',
    years: ''
  });

  const calculators = [
    { id: 'emi', name: 'EMI Calculator', icon: Home, color: 'bg-blue-500' },
    { id: 'sip', name: 'SIP Calculator', icon: TrendingUp, color: 'bg-green-500' },
    { id: 'fd', name: 'FD Calculator', icon: PiggyBank, color: 'bg-purple-500' },
    { id: 'savings', name: 'Savings Growth', icon: BarChart3, color: 'bg-orange-500' }
  ];

  const handleCalculate = async () => {
    let calculationResult: CalculatorResult;
    
    switch (activeCalculator) {
      case 'emi':
        calculationResult = calculateEMI(
          parseFloat(formData.principal),
          parseFloat(formData.rate),
          parseFloat(formData.tenure)
        );
        break;
      case 'sip':
        calculationResult = calculateSIP(
          parseFloat(formData.monthlyAmount),
          parseFloat(formData.rate),
          parseFloat(formData.years)
        );
        break;
      case 'fd':
        calculationResult = calculateFD(
          parseFloat(formData.principal),
          parseFloat(formData.rate),
          parseFloat(formData.years)
        );
        break;
      case 'savings':
        calculationResult = calculateSavingsGrowth(
          parseFloat(formData.monthlyAmount),
          parseFloat(formData.rate),
          parseFloat(formData.years)
        );
        break;
      default:
        return;
    }
    
    setResult(calculationResult);
    

  };

  const renderCalculatorForm = () => {
    switch (activeCalculator) {
      case 'emi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-soft-white font-medium mb-2">Loan Amount (₹)</label>
              <input
                type="number"
                value={formData.principal}
                onChange={(e) => setFormData({...formData, principal: e.target.value})}
                className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none"
                placeholder="e.g., 500000"
              />
            </div>
            <div>
              <label className="block text-soft-white font-medium mb-2">Interest Rate (% per annum)</label>
              <input
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none"
                placeholder="e.g., 8.5"
              />
            </div>
            <div>
              <label className="block text-soft-white font-medium mb-2">Tenure (months)</label>
              <input
                type="number"
                value={formData.tenure}
                onChange={(e) => setFormData({...formData, tenure: e.target.value})}
                className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none"
                placeholder="e.g., 240"
              />
            </div>
          </div>
        );
      case 'sip':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-soft-white font-medium mb-2">Monthly Investment (₹)</label>
              <input
                type="number"
                value={formData.monthlyAmount}
                onChange={(e) => setFormData({...formData, monthlyAmount: e.target.value})}
                className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none"
                placeholder="e.g., 5000"
              />
            </div>
            <div>
              <label className="block text-soft-white font-medium mb-2">Expected Return (% per annum)</label>
              <input
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <label className="block text-soft-white font-medium mb-2">Investment Period (years)</label>
              <input
                type="number"
                value={formData.years}
                onChange={(e) => setFormData({...formData, years: e.target.value})}
                className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none"
                placeholder="e.g., 10"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20 mt-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-soft-white">
          <BarChart3 className="w-5 h-5 mr-2 text-emerald-400" />
          Calculation Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.monthlyPayment && (
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
              <p className="text-sm text-slate-gray">Monthly EMI</p>
              <p className="text-2xl font-bold text-blue-400">₹{result.monthlyPayment.toLocaleString()}</p>
            </div>
          )}
          {result.maturityAmount && (
            <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg border border-emerald-500/20">
              <p className="text-sm text-slate-gray">Maturity Amount</p>
              <p className="text-2xl font-bold text-emerald-400">₹{result.maturityAmount.toLocaleString()}</p>
            </div>
          )}
          {result.totalInterest && (
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
              <p className="text-sm text-slate-gray">Total Interest</p>
              <p className="text-2xl font-bold text-purple-400">₹{result.totalInterest.toLocaleString()}</p>
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
            Smart Banking <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">Calculator Hub</span>
          </h2>
          <p className="text-lg text-slate-gray max-w-2xl mx-auto font-ubuntu">
            Calculate EMI, SIP returns, FD maturity, and more with AI-powered insights and recommendations.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <button
                key={calc.id}
                onClick={() => {
                  setActiveCalculator(calc.id);
                  setResult(null);
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeCalculator === calc.id
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

        <div className="max-w-4xl mx-auto">
          <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
            <h3 className="text-2xl font-semibold mb-6 flex items-center text-soft-white">
              <Calculator className="w-6 h-6 mr-2 text-emerald-400" />
              {calculators.find(c => c.id === activeCalculator)?.name}
            </h3>
            
            {renderCalculatorForm()}
            
            <button
              onClick={handleCalculate}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 w-full mt-6 text-lg"
            >
              🚀 Calculate
            </button>
          </div>

          {renderResult()}
        </div>
      </div>
    </section>
  );
};

export default CalculatorHub;