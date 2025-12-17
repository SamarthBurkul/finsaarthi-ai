import React, { useState, useEffect } from 'react';
import { PiggyBank, Target, TrendingUp, Award, Download, Calendar, Coins, Zap } from 'lucide-react';
import jsPDF from 'jspdf';
import { savingsService } from '../api/savingsService';

const SmartSavings: React.FC = () => {
  const [dailyGoal, setDailyGoal] = useState(20);
  const [customAmount, setCustomAmount] = useState('');
  const [currentSavings, setCurrentSavings] = useState(0);
  const [streak, setStreak] = useState(0);
  const [daysSaved, setDaysSaved] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [goalPrice, setGoalPrice] = useState('');
  const [todaySaved, setTodaySaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [piggyAnimation, setPiggyAnimation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backendGoals, setBackendGoals] = useState<any[]>([]);

  const predefinedGoals = [
    { name: 'Mobile Phone', price: 15000, id: 'phone' },
    { name: 'Laptop', price: 50000, id: 'laptop' },
    { name: 'Bike', price: 80000, id: 'bike' },
    { name: 'Emergency Fund', price: 100000, id: 'emergency' },
    { name: 'Travel', price: 25000, id: 'travel' },
    { name: 'College Fees', price: 200000, id: 'college' }
  ];

  // Combine predefined and backend goals
  const allGoals = [
    ...predefinedGoals,
    ...backendGoals.map(g => ({ name: g.goalName, price: g.targetAmount, id: g._id }))
  ];

  // Load savings state from backend
  useEffect(() => {
    loadSavingsState();
    loadBackendGoals();
  }, []);

  const loadSavingsState = async () => {
    try {
      setLoading(true);
      const state = await savingsService.getState();
      setDailyGoal(state.dailyGoal);
      setCurrentSavings(state.currentSavings);
      setStreak(state.streak);
      setDaysSaved(state.daysSaved);
      setSelectedGoal(state.selectedGoal || '');
      setGoalPrice(state.goalPrice ? state.goalPrice.toString() : '');
      
      // Check if saved today
      const lastSaved = state.lastSavedDate ? new Date(state.lastSavedDate) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (lastSaved) {
        const lastSavedDate = new Date(lastSaved);
        lastSavedDate.setHours(0, 0, 0, 0);
        setTodaySaved(lastSavedDate.getTime() === today.getTime());
      }
    } catch (err: any) {
      console.error('Error loading savings:', err);
      setError('Failed to load savings data');
    } finally {
      setLoading(false);
    }
  };

  const loadBackendGoals = async () => {
    try {
      const fetchedGoals = await savingsService.getAllGoals();
      setBackendGoals(fetchedGoals);
    } catch (err: any) {
      console.error('Error loading backend goals:', err);
      // Don't show error to user, just use default goals
    }
  };

  const calculateProjections = (amount: number) => ({
    tenDays: amount * 10,
    oneMonth: amount * 30,
    hundredDays: amount * 100,
    oneYear: amount * 365
  });

  const markTodaySaved = async () => {
    if (todaySaved) {
      setError('You already saved today! Come back tomorrow 🎉');
      return;
    }

    try {
      setError('');
      setPiggyAnimation(true); // Start animation immediately
      const result = await savingsService.saveToday();
      
      // Update all states
      setCurrentSavings(result.currentSavings);
      setStreak(result.streak);
      setDaysSaved(result.daysSaved);
      setTodaySaved(true);
      
      // Clear error and stop animation
      setTimeout(() => setPiggyAnimation(false), 1000);
    } catch (err: any) {
      setPiggyAnimation(false);
      setError(err.message || 'Failed to save today');
      console.error('Save today error:', err);
    }
  };

  // Update daily goal
  const updateDailyGoal = async (newGoal: number) => {
    try {
      setError('');
      await savingsService.updateState({ dailyGoal: newGoal });
      setDailyGoal(newGoal);
      setCustomAmount(''); // Clear custom input when preset is selected
    } catch (err: any) {
      console.error('Error updating goal:', err);
      setError(err.message || 'Failed to update goal');
    }
  };

  // Update selected goal
  const updateSelectedGoal = async (goal: string, price: number) => {
    try {
      await savingsService.updateState({
        selectedGoal: goal,
        goalPrice: price
      });
      setSelectedGoal(goal);
      setGoalPrice(price.toString());
    } catch (err) {
      console.error('Error updating selected goal:', err);
    }
  };

  const analyzeHabits = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      // Call backend AI analysis endpoint
      const analysis = await savingsService.getAIAnalysis();
      setAiAnalysis(analysis);
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      setError('Failed to generate analysis. Showing basic insights.');
      
      // Fallback to basic analysis if backend fails
      const savingsRate = currentSavings > 0 && daysSaved > 0 ? currentSavings / daysSaved : dailyGoal;
      setAiAnalysis({
        savingsAssessment: {
          currentPerformance: currentSavings > 1000 ? "Good" : "Getting Started",
          savingsRate: `₹${Math.round(savingsRate)} per day average`,
          progressEvaluation: "Building good saving habits"
        },
        practicalTips: [
          "Track daily expenses to find saving opportunities",
          "Use the 50-30-20 rule: 50% needs, 30% wants, 20% savings",
          "Automate savings to make it effortless"
        ],
        smartAdvice: {
          increaseGoal: dailyGoal < 50 ? `Consider increasing to ₹${dailyGoal + 10}` : "Current goal is good",
          expenseReduction: "Review subscription services and dining out expenses",
          savingStrategy: "Start with small amounts and gradually increase"
        },
        goalGuidance: {
          timeToGoal: goalPrice ? `${Math.ceil((parseInt(goalPrice) - currentSavings) / dailyGoal)} days` : "Set a goal first",
          goalFeasibility: "Your goal is achievable with consistent saving",
          alternativeGoals: "Consider emergency fund as first priority"
        },
        moneyManagement: {
          emergencyFund: "Aim for 3-6 months of expenses as emergency fund",
          investmentReadiness: "Start investing after building emergency fund",
          budgetOptimization: "Use 50-30-20 budgeting method"
        },
        nextSteps: [
          "Increase daily goal by ₹5-10 when comfortable",
          "Set up automatic transfers to savings account",
          "Review and reduce unnecessary expenses"
        ]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const projections = calculateProjections(dailyGoal);
  const goalProgress = selectedGoal && goalPrice ? (currentSavings / parseInt(goalPrice)) * 100 : 0;
  const daysToGoal = selectedGoal && goalPrice ? Math.ceil((parseInt(goalPrice) - currentSavings) / dailyGoal) : 0;

  if (loading) {
    return (
      <section className="py-16 bg-jet-black min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading your savings...</div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-jet-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold text-soft-white mb-4">
            Smart <span className="bg-gradient-to-r from-green-400 via-lime-400 to-emerald-400 bg-clip-text text-transparent">Savings</span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-inter mb-4">
            Build wealth one day at a time with AI-powered habit tracking
          </p>
          <p className="text-blue-400 font-semibold">
            "You don't need a high salary to become wealthy. You only need the habit."
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Daily Goal Selection */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-xl font-semibold mb-6 text-soft-white flex items-center font-inter">
                <Target className="w-6 h-6 mr-2 text-emerald-400" />
                Daily Saving Goal
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[10, 20, 50].map(amount => (
                    <button
                      key={amount}
                      onClick={() => updateDailyGoal(amount)}
                      className={`p-3 rounded-lg font-semibold transition-all ${
                        dailyGoal === amount
                          ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white'
                          : 'border border-slate-gray/30 text-white hover:bg-emerald-500/10'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
                
                <div>
                  <input
                    type="number"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value && parseInt(e.target.value) > 0) {
                        updateDailyGoal(parseInt(e.target.value));
                      }
                    }}
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-inter"
                  />
                </div>

                {/* Projections */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white">10 days:</span>
                    <span className="text-emerald-400 font-semibold">₹{projections.tenDays.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">1 month:</span>
                    <span className="text-blue-400 font-semibold">₹{projections.oneMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">100 days:</span>
                    <span className="text-orange-400 font-semibold">₹{projections.hundredDays.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">1 year:</span>
                    <span className="text-emerald-400 font-semibold">₹{projections.oneYear.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Piggy Bank */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-xl font-semibold mb-6 text-soft-white flex items-center font-inter">
                <PiggyBank className="w-6 h-6 mr-2 text-emerald-400" />
                Your Digital Piggy Bank
              </h3>
              
              <div className="text-center space-y-6">
                <div className={`transition-transform duration-500 ${piggyAnimation ? 'scale-110' : 'scale-100'}`}>
                  <PiggyBank className="w-24 h-24 mx-auto text-emerald-400" />
                  {piggyAnimation && (
                    <div className="flex justify-center space-x-1 mt-2">
                      <Coins className="w-4 h-4 text-orange-400 animate-bounce" />
                      <Coins className="w-4 h-4 text-orange-400 animate-bounce" style={{animationDelay: '0.1s'}} />
                      <Coins className="w-4 h-4 text-orange-400 animate-bounce" style={{animationDelay: '0.2s'}} />
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-emerald-400 mb-2">
                    ₹{currentSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-gray">Total Saved</div>
                </div>

                <button
                  onClick={markTodaySaved}
                  disabled={todaySaved}
                  className={`bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 w-full ${todaySaved ? 'opacity-50' : ''}`}
                >
                  {todaySaved ? '✅ Today\'s Goal Complete!' : `💰 Save ₹${dailyGoal} Today`}
                </button>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{streak}</div>
                    <div className="text-white">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-400">{daysSaved}</div>
                    <div className="text-white">Days Saved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Goal Attachment */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-xl font-semibold mb-6 text-soft-white flex items-center font-inter">
                <Award className="w-6 h-6 mr-2 text-emerald-400" />
                Life Goals
              </h3>
              
              <div className="space-y-4">
                <select
                  value={selectedGoal}
                  onChange={(e) => {
                    const goalName = e.target.value;
                    const goal = allGoals.find(g => g.name === goalName);
                    if (goal) {
                      updateSelectedGoal(goalName, goal.price);
                    } else {
                      setSelectedGoal(goalName);
                    }
                  }}
                  className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white focus:border-emerald-400 focus:outline-none font-inter"
                >
                  <option value="">Select a goal</option>
                  {allGoals.map((goal, index) => (
                    <option key={goal.id || goal.name} value={goal.name}>
                      {goal.name} - ₹{goal.price.toLocaleString()}
                    </option>
                  ))}
                  <option value="custom">Custom Goal</option>
                </select>

                {selectedGoal === 'custom' && (
                  <input
                    type="number"
                    placeholder="Goal price (₹)"
                    value={goalPrice}
                    onChange={(e) => setGoalPrice(e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value) {
                        updateSelectedGoal('custom', parseInt(e.target.value));
                      }
                    }}
                    className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-inter"
                  />
                )}

                {selectedGoal && goalPrice && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white">Progress:</span>
                      <span className="text-emerald-400">{goalProgress.toFixed(1)}%</span>
                    </div>
                    
                    <div className="w-full bg-jet-black rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(goalProgress, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-soft-white">
                        ₹{(parseInt(goalPrice) - currentSavings).toLocaleString()} remaining
                      </div>
                      <div className="text-sm text-white">
                        {daysToGoal > 0 ? `${daysToGoal} days to go` : 'Goal achieved!'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="mt-8 grid lg:grid-cols-2 gap-8">
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-xl font-semibold mb-6 text-soft-white flex items-center">
                <Zap className="w-6 h-6 mr-2 text-emerald-400" />
                AI Savings Analysis
              </h3>
              
              <button
                onClick={analyzeHabits}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 w-full mb-6 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-deep-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Your Habits...</span>
                  </span>
                ) : (
                  <>📊 Get Savings Tips & Advice</>
                )}
              </button>

              {aiAnalysis && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Savings Performance</h4>
                    <p className="text-sm text-white">{aiAnalysis.savingsAssessment?.progressEvaluation}</p>
                    <p className="text-xs text-white mt-1">{aiAnalysis.savingsAssessment?.savingsRate}</p>
                  </div>
                  
                  <div className="p-4 bg-emerald-500/10 rounded-lg">
                    <h4 className="font-semibold text-emerald-400 mb-2">Smart Tips:</h4>
                    <ul className="text-sm text-white space-y-1">
                      {aiAnalysis.practicalTips?.map((tip: string, i: number) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-500/10 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">Next Steps:</h4>
                    <ul className="text-sm text-white space-y-1">
                      {aiAnalysis.nextSteps?.map((step: string, i: number) => (
                        <li key={i}>{i + 1}. {step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-xl font-semibold mb-6 text-soft-white flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-emerald-400" />
                Progress & Milestones
              </h3>
              
              <div className="space-y-4">
                {aiAnalysis?.smartAdvice && (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <h5 className="font-semibold text-emerald-400 mb-1 text-sm">Goal Increase:</h5>
                      <p className="text-xs text-white">{aiAnalysis.smartAdvice.increaseGoal}</p>
                    </div>
                    <div className="p-3 bg-teal-500/10 rounded-lg">
                      <h5 className="font-semibold text-teal-400 mb-1 text-sm">Expense Reduction:</h5>
                      <p className="text-xs text-white">{aiAnalysis.smartAdvice.expenseReduction}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <h5 className="font-semibold text-blue-400 mb-1 text-sm">Strategy:</h5>
                      <p className="text-xs text-white">{aiAnalysis.smartAdvice.savingStrategy}</p>
                    </div>
                  </div>
                )}

                {aiAnalysis?.goalGuidance && (
                  <div className="p-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-lg">
                    <h4 className="font-semibold text-teal-400 mb-2">Goal Guidance</h4>
                    <p className="text-sm text-white">{aiAnalysis.goalGuidance.goalFeasibility}</p>
                    <p className="text-xs text-white mt-1">Time to goal: {aiAnalysis.goalGuidance.timeToGoal}</p>
                  </div>
                )}

                {/* Download Report */}
                <button 
                  onClick={() => {
                    const pdf = new jsPDF();
                    
                    // Header
                    pdf.setFontSize(20);
                    pdf.setTextColor(16, 185, 129);
                    pdf.text('FinSaarthi SMART SAVINGS REPORT', 20, 30);
                    
                    // Savings Summary
                    pdf.setFontSize(14);
                    pdf.setTextColor(0, 0, 0);
                    pdf.text('SAVINGS SUMMARY', 20, 50);
                    pdf.setFontSize(10);
                    pdf.text(`Daily Goal: ₹${dailyGoal}`, 20, 65);
                    pdf.text(`Current Savings: ₹${currentSavings.toLocaleString()}`, 20, 75);
                    pdf.text(`Streak: ${streak} days`, 20, 85);
                    pdf.text(`Selected Goal: ${selectedGoal || 'None'}`, 20, 95);
                    
                    let yPos = 115;
                    
                    // Projections
                    pdf.setFontSize(14);
                    pdf.text('WEALTH PROJECTIONS', 20, yPos);
                    yPos += 15;
                    pdf.setFontSize(10);
                    pdf.text(`10 Days: ₹${projections.tenDays.toLocaleString()}`, 20, yPos);
                    yPos += 8;
                    pdf.text(`1 Month: ₹${projections.oneMonth.toLocaleString()}`, 20, yPos);
                    yPos += 8;
                    pdf.text(`100 Days: ₹${projections.hundredDays.toLocaleString()}`, 20, yPos);
                    yPos += 8;
                    pdf.text(`1 Year: ₹${projections.oneYear.toLocaleString()}`, 20, yPos);
                    yPos += 20;
                    
                    // AI Analysis
                    if (aiAnalysis) {
                      pdf.setFontSize(14);
                      pdf.text('AI SAVINGS ANALYSIS', 20, yPos);
                      yPos += 15;
                      pdf.setFontSize(10);
                      pdf.text(`Performance: ${aiAnalysis.savingsAssessment?.currentPerformance}`, 20, yPos);
                      yPos += 8;
                      pdf.text(`Savings Rate: ${aiAnalysis.savingsAssessment?.savingsRate}`, 20, yPos);
                      yPos += 15;
                      
                      if (aiAnalysis.practicalTips?.length > 0) {
                        pdf.setFontSize(12);
                        pdf.text('PRACTICAL TIPS', 20, yPos);
                        yPos += 10;
                        pdf.setFontSize(10);
                        aiAnalysis.practicalTips.forEach((tip: string, i: number) => {
                          pdf.text(`${i + 1}. ${tip}`, 20, yPos);
                          yPos += 8;
                        });
                        yPos += 5;
                      }
                      
                      if (aiAnalysis.nextSteps?.length > 0) {
                        pdf.setFontSize(12);
                        pdf.text('NEXT STEPS', 20, yPos);
                        yPos += 10;
                        pdf.setFontSize(10);
                        aiAnalysis.nextSteps.forEach((step: string, i: number) => {
                          pdf.text(`${i + 1}. ${step}`, 20, yPos);
                          yPos += 8;
                        });
                      }
                    }
                    
                    // Footer
                    pdf.setFontSize(8);
                    pdf.setTextColor(128, 128, 128);
                    pdf.text('Generated by FinSaarthi AI - Smart Savings Tracker', 20, 280);
                    
                    pdf.save(`Smart_Savings_Report_${new Date().toISOString().split('T')[0]}.pdf`);
                  }}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 w-full flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Savings Report (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartSavings;