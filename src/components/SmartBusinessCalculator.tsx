import React, { useState, useEffect } from 'react';
import { Calculator, Play, Square, TrendingUp, BarChart3, Brain, Target, Calendar, DollarSign, Award, AlertTriangle } from 'lucide-react';
import { getDeepAIAnalysis } from '../utils/groqApi';

interface BusinessSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  calculations: number[];
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
}

interface DailyStats {
  date: string;
  sales: number;
  transactions: number;
  profit: number;
}

const SmartBusinessCalculator: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<BusinessSession | null>(null);
  const [displayValue, setDisplayValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [businessSessions, setBusinessSessions] = useState<BusinessSession[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Generate dummy data for demo
  const generateDummyData = (): BusinessSession[] => {
    const sessions: BusinessSession[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      const calculations = [];
      const transactionCount = Math.floor(Math.random() * 50) + 20;
      
      for (let j = 0; j < transactionCount; j++) {
        calculations.push(Math.floor(Math.random() * 2000) + 50);
      }
      
      const totalSales = calculations.reduce((sum, calc) => sum + calc, 0);
      
      sessions.push({
        id: `session-${i}`,
        date: date.toISOString().split('T')[0],
        startTime: '09:00 AM',
        endTime: '08:00 PM',
        calculations,
        totalSales,
        transactionCount,
        averageTransaction: Math.round(totalSales / transactionCount)
      });
    }
    
    return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  useEffect(() => {
    const savedSessions = localStorage.getItem('kanima-business-sessions');
    if (savedSessions) {
      setBusinessSessions(JSON.parse(savedSessions));
    } else {
      const dummyData = generateDummyData();
      setBusinessSessions(dummyData);
      localStorage.setItem('kanima-business-sessions', JSON.stringify(dummyData));
    }
  }, []);

  useEffect(() => {
    if (businessSessions.length > 0) {
      localStorage.setItem('kanima-business-sessions', JSON.stringify(businessSessions));
    }
  }, [businessSessions]);

  const startTracking = () => {
    const newSession: BusinessSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString('en-IN', { hour12: true }),
      endTime: '',
      calculations: [],
      totalSales: 0,
      transactionCount: 0,
      averageTransaction: 0
    };
    
    setCurrentSession(newSession);
    setIsTracking(true);
    setDisplayValue('0');
  };

  const stopTracking = () => {
    if (currentSession) {
      const endTime = new Date().toLocaleTimeString('en-IN', { hour12: true });
      const totalSales = currentSession.calculations.reduce((sum, calc) => sum + calc, 0);
      const transactionCount = currentSession.calculations.length;
      
      const completedSession: BusinessSession = {
        ...currentSession,
        endTime,
        totalSales,
        transactionCount,
        averageTransaction: transactionCount > 0 ? Math.round(totalSales / transactionCount) : 0
      };
      
      setBusinessSessions(prev => [completedSession, ...prev]);
      setCurrentSession(null);
      setIsTracking(false);
      setDisplayValue('0');
    }
  };

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplayValue(num);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? num : displayValue + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(displayValue);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplayValue(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(displayValue);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      
      // Store calculation if tracking
      if (isTracking && currentSession && newValue > 0) {
        setCurrentSession({
          ...currentSession,
          calculations: [...currentSession.calculations, newValue]
        });
      }

      setDisplayValue(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clearCalculator = () => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    
    const recentSessions = businessSessions.slice(0, 7);
    const totalSales = recentSessions.reduce((sum, session) => sum + session.totalSales, 0);
    const totalTransactions = recentSessions.reduce((sum, session) => sum + session.transactionCount, 0);
    const averageDailySales = totalSales / recentSessions.length;

    try {
      const analysisData = {
        totalSales,
        totalTransactions,
        averageDailySales,
        sessionsCount: recentSessions.length,
        bestDay: recentSessions.reduce((best, session) => session.totalSales > best.totalSales ? session : best, recentSessions[0]),
        worstDay: recentSessions.reduce((worst, session) => session.totalSales < worst.totalSales ? session : worst, recentSessions[0]),
        monthlyTotal,
        bestDaySales,
        averageDaily
      };

      const result = await getDeepAIAnalysis('business', analysisData, { insights: true });
      setAiInsights(result.analysis || 'Your business shows consistent performance. Focus on peak hours optimization and customer retention strategies for better growth.');
      
      // Update smart tips with AI insights
      const tipsElement = document.getElementById('smart-tips');
      if (tipsElement && result.analysis) {
        const tips = [
          `Peak hours: ${averageDailySales > 50000 ? '10-12 AM & 6-8 PM' : '2-4 PM & 6-8 PM'}`,
          `Best selling day: ${bestDaySales > 70000 ? 'Saturday' : 'Friday'}`,
          `Avg transaction growing by ${((bestDaySales - averageDaily) / averageDaily * 100).toFixed(1)}%`,
          monthlyTotal > 250000 ? 'Expand product range' : 'Consider loyalty program'
        ];
        tipsElement.innerHTML = tips.map(tip => `<p class="text-white">• ${tip}</p>`).join('');
      }
    } catch (error) {
      setAiInsights('Your business data shows good potential for growth. Consider tracking peak hours, optimizing inventory during high-sales periods, and implementing customer loyalty programs to increase repeat business.');
    }
    
    setIsAnalyzing(false);
  };

  const getChartData = () => {
    if (viewMode === 'daily') {
      const days = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
        const daySession = businessSessions.find(session => session.date === date.toISOString().split('T')[0]);
        days.push({
          label: date.getDate().toString(),
          value: daySession ? daySession.totalSales : 0
        });
      }
      return days;
    } else if (viewMode === 'weekly') {
      const weeks = [];
      const today = new Date();
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(today.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
        const weekSessions = businessSessions.filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        });
        const weekTotal = weekSessions.reduce((sum, session) => sum + session.totalSales, 0);
        weeks.push({
          label: `W${4-i}`,
          value: weekTotal
        });
      }
      return weeks;
    } else {
      const months = [];
      const today = new Date();
      for (let i = 3; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthSessions = businessSessions.filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate.getMonth() === date.getMonth() && sessionDate.getFullYear() === date.getFullYear();
        });
        const monthTotal = monthSessions.reduce((sum, session) => sum + session.totalSales, 0);
        months.push({
          label: date.toLocaleDateString('en-US', { month: 'short' }),
          value: monthTotal
        });
      }
      return months;
    }
  };

  const BarChartComponent = ({ data, title }: { data: any[], title: string }) => {
    const maxValue = Math.max(...data.map(item => item.value));

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">{title}</h4>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-12 text-sm text-white">{item.label}</div>
              <div className="flex-1 bg-charcoal-gray rounded-full h-6 relative overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((item.value / maxValue) * 100, 100)}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className="text-xs text-soft-white font-bold">₹{(item.value / 1000).toFixed(1)}K</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LineChartComponent = ({ data, title }: { data: any[], title: string }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 300,
      y: 150 - (item.value / maxValue) * 120
    }));

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">{title}</h4>
        <svg width="320" height="180" className="mx-auto">
          <defs>
            <linearGradient id="businessLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#84CC16" />
            </linearGradient>
          </defs>
          
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1="10" y1={30 + i * 30} x2="310" y2={30 + i * 30} stroke="#374151" strokeWidth="0.5" />
          ))}
          
          <path
            d={`M ${points.map(p => `${p.x + 10},${p.y + 30}`).join(' L ')}`}
            stroke="url(#businessLineGradient)"
            strokeWidth="3"
            fill="none"
          />
          
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x + 10}
              cy={point.y + 30}
              r="4"
              fill="#F59E0B"
              className="hover:r-6 transition-all"
            />
          ))}
        </svg>
        
        <div className="flex justify-between mt-4 text-sm">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-white">{item.label}</p>
              <p className="text-soft-white font-bold">₹{(item.value / 1000).toFixed(1)}K</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const todaySession = businessSessions.find(session => session.date === new Date().toISOString().split('T')[0]);
  const chartData = getChartData();
  const monthlyTotal = businessSessions.slice(0, 30).reduce((sum, session) => sum + session.totalSales, 0);
  const weeklyTotal = chartData.reduce((sum, item) => sum + item.value, 0);
  const bestDaySales = Math.max(...businessSessions.slice(0, 7).map(s => s.totalSales));
  const averageDaily = Math.round(businessSessions.slice(0, 7).reduce((sum, s) => sum + s.totalSales, 0) / 7);

  return (
    <section className="py-16 bg-jet-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-ubuntu font-bold text-soft-white mb-4">
            Smart Business <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-lime-400 bg-clip-text text-transparent">Calculator</span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-ubuntu">
            Track daily sales, store business data, and get AI-powered profit insights for local shopkeepers
          </p>
        </div>

        {/* Business Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
            <DollarSign className="w-8 h-8 mb-3" />
            <h4 className="font-bold mb-1">Today's Sales</h4>
            <p className="text-2xl font-bold">₹{todaySession ? todaySession.totalSales.toLocaleString() : (currentSession?.calculations.reduce((sum, calc) => sum + calc, 0) || 0).toLocaleString()}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <BarChart3 className="w-8 h-8 mb-3" />
            <h4 className="font-bold mb-1">Transactions</h4>
            <p className="text-2xl font-bold">{todaySession ? todaySession.transactionCount : (currentSession?.calculations.length || 0)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <Target className="w-8 h-8 mb-3" />
            <h4 className="font-bold mb-1">Weekly Total</h4>
            <p className="text-2xl font-bold">₹{(weeklyTotal / 1000).toFixed(1)}K</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <Award className="w-8 h-8 mb-3" />
            <h4 className="font-bold mb-1">Monthly Total</h4>
            <p className="text-2xl font-bold">₹{(monthlyTotal / 1000).toFixed(1)}K</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator */}
          <div className="lg:col-span-1">
            <div className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-soft-white">Smart Calculator</h3>
                <div className="flex gap-2">
                  {!isTracking ? (
                    <button
                      onClick={startTracking}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={stopTracking}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </button>
                  )}
                </div>
              </div>

              {/* Calculator Display */}
              <div className="bg-jet-black rounded-lg p-4 mb-4">
                <div className="text-right text-3xl font-mono text-soft-white mb-2">{displayValue}</div>
                {isTracking && (
                  <div className="text-right text-sm text-emerald-400">
                    Tracking: {currentSession?.calculations.length || 0} calculations
                  </div>
                )}
              </div>

              {/* Calculator Buttons */}
              <div className="grid grid-cols-4 gap-3">
                <button onClick={clearCalculator} className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg font-semibold transition-colors">C</button>
                <button onClick={() => inputOperation('÷')} className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg font-semibold transition-colors">÷</button>
                <button onClick={() => inputOperation('×')} className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg font-semibold transition-colors">×</button>
                <button onClick={() => inputOperation('-')} className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg font-semibold transition-colors">-</button>
                
                <button onClick={() => inputNumber('7')} className="bg-slate-gray hover:bg-slate-600 text-white p-4 rounded-lg font-semibold transition-colors">7</button>
                <button onClick={() => inputNumber('8')} className="bg-slate-gray hover:bg-slate-600 text-white p-4 rounded-lg font-semibold transition-colors">8</button>
                <button onClick={() => inputNumber('9')} className="bg-slate-gray hover:bg-slate-600 text-white p-4 rounded-lg font-semibold transition-colors">9</button>
                <button onClick={() => inputOperation('+')} className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg font-semibold transition-colors row-span-2">+</button>
                
                <button onClick={() => inputNumber('4')} className="bg-slate-gray hover:bg-slate-600 text-white p-4 rounded-lg font-semibold transition-colors">4</button>
                <button onClick={() => inputNumber('5')} className="bg-slate-gray hover:bg-slate-600 text-white p-4 rounded-lg font-semibold transition-colors">5</button>
                <button onClick={() => inputNumber('6')} className="bg-slate-gray hover:bg-slate-600 text-white p-4 rounded-lg font-semibold transition-colors">6</button>
                
                <button onClick={() => inputNumber('1')} className="bg-slate-gray hover:bg-slate-600 text-white p-4 rounded-lg font-semibold transition-colors">1</button>
                <button onClick={() => inputNumber('2')} className="bg-slate-gray hover:bg-slate-600 text-white p-4 rounded-lg font-semibold transition-colors">2</button>
                <button onClick={() => inputNumber('3')} className="bg-slate-gray hover:bg-slate-600 text-white p-4 rounded-lg font-semibold transition-colors">3</button>
                <button onClick={performCalculation} className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-lg font-semibold transition-colors row-span-2">=</button>
                
                <button onClick={() => inputNumber('0')} className="bg-slate-gray hover:bg-slate-600 text-white p-4 rounded-lg font-semibold transition-colors col-span-2">0</button>
                <button onClick={() => inputNumber('.')} className="bg-slate-gray hover:bg-slate-600 text-white p-4 rounded-lg font-semibold transition-colors">.</button>
              </div>
            </div>
          </div>

          {/* Business Analytics */}
          <div className="lg:col-span-2">
            <div className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-soft-white">Business Analytics</h3>
                <button
                  onClick={generateAIInsights}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  <Brain className="w-4 h-4" />
                  {isAnalyzing ? 'Analyzing...' : 'AI Insights'}
                </button>
              </div>

              {/* Chart Controls */}
              <div className="flex gap-2 mb-6">
                {(['daily', 'weekly', 'monthly'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      viewMode === mode 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-jet-black text-white hover:bg-slate-gray'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              {/* Performance Charts */}
              <div className="space-y-6">
                <BarChartComponent
                  title={`📊 ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Performance`}
                  data={chartData}
                />
                <LineChartComponent
                  title={`📈 ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Trend`}
                  data={chartData}
                />
              </div>

              {/* Recent Sessions */}
              <div className="bg-jet-black rounded-xl p-6">
                <h4 className="text-lg font-bold text-soft-white mb-4">Recent Business Days</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {businessSessions.slice(0, 7).map(session => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-charcoal-gray rounded-lg">
                      <div>
                        <p className="font-semibold text-soft-white">{new Date(session.date).toLocaleDateString()}</p>
                        <p className="text-sm text-white">{session.transactionCount} transactions • {session.startTime} - {session.endTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-emerald-400">₹{session.totalSales.toLocaleString()}</p>
                        <p className="text-sm text-white">Avg: ₹{session.averageTransaction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20">
            <div className="flex items-start gap-4">
              <Brain className="w-8 h-8 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-soft-white mb-4">AI Business Insights</h3>
                <div className="text-white leading-relaxed space-y-3">
                  {aiInsights.split('. ').map((sentence, index) => (
                    <p key={index} className="text-white">{sentence.trim()}{sentence.includes('.') ? '' : '.'}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Performance Summary */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-2xl p-6 border border-emerald-500/20">
            <h4 className="text-lg font-semibold text-emerald-400 mb-4">📊 Performance Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white">Best Day Sales:</span>
                <span className="text-emerald-400 font-bold">₹{bestDaySales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Average Daily:</span>
                <span className="text-emerald-400 font-bold">₹{averageDaily.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Growth Trend:</span>
                <span className="text-emerald-400 font-bold">+{((bestDaySales - averageDaily) / averageDaily * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
            <h4 className="text-lg font-semibold text-blue-400 mb-4">🎯 Business Goals</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white">Monthly Target:</span>
                <span className="text-blue-400 font-bold">₹2,50,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Achieved:</span>
                <span className="text-blue-400 font-bold">₹{monthlyTotal.toLocaleString()}</span>
              </div>
              <div className="w-full bg-charcoal-gray rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full" style={{ width: `${Math.min((monthlyTotal / 250000) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl p-6 border border-orange-500/20">
            <h4 className="text-lg font-semibold text-orange-400 mb-4">💡 AI Smart Tips</h4>
            <div className="space-y-2 text-sm" id="smart-tips">
              <p className="text-white">• Peak hours: 2-4 PM & 6-8 PM</p>
              <p className="text-white">• Best selling day: Saturday</p>
              <p className="text-white">• Avg transaction growing by 8%</p>
              <p className="text-white">• Consider loyalty program</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartBusinessCalculator;