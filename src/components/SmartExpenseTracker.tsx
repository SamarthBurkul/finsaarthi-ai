import React, { useState, useEffect } from 'react';
import { Plus, TrendingDown, TrendingUp, Calendar, PieChart, Brain, Target, AlertTriangle, DollarSign, Download, Lightbulb, BarChart3, CheckCircle } from 'lucide-react';
import { getDeepAIAnalysis } from '../utils/groqApi';
<<<<<<< HEAD
import { sampleExpenses, expenseCategories, savingTips } from '../data/expenseData';
import { getExpenses, createExpense } from '../api/expenseService';
=======
import { expenseCategories, savingTips } from '../data/expenseData';
import * as expenseService from '../api/expenseService';
>>>>>>> af463aa0b74e9917119b5d08500c73c5b90334f8

interface Expense {
  id: string;
  amount: number;
  category: string;
  purpose: string;
  date: string;
  time: string;
  paymentMethod: string;
  riskScore?: number;
  fraudReasons?: string[];
  isFlagged?: boolean;
}

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

const SmartExpenseTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastFraudAnalysis, setLastFraudAnalysis] = useState<any>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: '',
    purpose: '',
    paymentMethod: 'UPI'
  });

<<<<<<< HEAD
  // Track if we're showing real MongoDB data vs sample data
  const [isUsingRealData, setIsUsingRealData] = useState(false);

  // Extracted fetch function so we can call it after adding expense
  const fetchExpensesFromDB = async () => {
    try {
      const data = await getExpenses({ period: viewMode, date: selectedDate });
      if (data.expenses && data.expenses.length > 0) {
        // Transform MongoDB format to component format
        const formatted = data.expenses.map((exp: any) => {
          // Safe date parsing with fallback
          const expDate = exp.expenseDate ? new Date(exp.expenseDate) : new Date();
          const isValidDate = !isNaN(expDate.getTime());
          const safeDate = isValidDate ? expDate : new Date();

=======
  // Fetch expenses from backend
  const loadExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await expenseService.getExpenses({ 
        period: viewMode,
        date: selectedDate 
      });
      
      if (result.expenses) {
        // Transform backend data to match frontend interface
        const transformedExpenses = result.expenses.map((exp: any) => {
          const expenseDate = exp.expenseDate ? new Date(exp.expenseDate) : new Date();
>>>>>>> af463aa0b74e9917119b5d08500c73c5b90334f8
          return {
            id: exp._id,
            amount: exp.amount,
            category: exp.category,
            purpose: exp.purpose,
<<<<<<< HEAD
            date: safeDate.toISOString().split('T')[0],
            time: safeDate.toLocaleTimeString('en-IN', { hour12: true }),
            paymentMethod: exp.paymentMethod,
            riskScore: exp.riskScore,
            fraudReasons: exp.fraudReasons,
            isFlagged: exp.isFlagged
          };
        });
        setExpenses(formatted);
        setIsUsingRealData(true);
        return true;
      } else {
        // No expenses in DB - check if user is logged in
        setExpenses(sampleExpenses);
        setIsUsingRealData(false);
        return false;
      }
    } catch (error) {
      console.error('Failed to fetch expenses, using sample data:', error);
      // Fallback to sample data if not logged in or API fails
      setExpenses(sampleExpenses);
      setIsUsingRealData(false);
      return false;
    }
  };
=======
            date: expenseDate.toISOString().split('T')[0],
            time: expenseDate.toLocaleTimeString('en-IN', { hour12: true }),
            paymentMethod: exp.paymentMethod || 'UPI'
          };
        });
        setExpenses(transformedExpenses);
      }
    } catch (err: any) {
      console.error('Error loading expenses:', err);
      setError(err?.message || 'Failed to load expenses');
      setExpenses([]); // Clear expenses on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [viewMode, selectedDate]);
>>>>>>> af463aa0b74e9917119b5d08500c73c5b90334f8

  useEffect(() => {
    fetchExpensesFromDB();
  }, [viewMode, selectedDate]);

  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.category || !newExpense.purpose) {
      alert('Please fill in all required fields: amount, category, and purpose');
      return;
    }

    setIsAddingExpense(true);
<<<<<<< HEAD

    try {
      // Call backend API to create expense with fraud detection
      const result = await createExpense({
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        purpose: newExpense.purpose,
        paymentMethod: newExpense.paymentMethod,
      });

      // Show fraud analysis immediately
      setLastFraudAnalysis({
        riskScore: result.riskScore || 0,
        fraudReasons: result.fraudReasons || [],
        isFlagged: result.flagged || false,
        amount: result.amount,
        category: result.category
      });

      // Re-fetch ALL expenses from MongoDB to replace sample data with real data
      await fetchExpensesFromDB();

=======
    setError(null);
    
    try {
      const amount = parseFloat(newExpense.amount);
      
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than 0');
        setIsAddingExpense(false);
        return;
      }
      
      // Call backend API to create expense
      const result = await expenseService.createExpense({
        amount,
        category: newExpense.category,
        purpose: newExpense.purpose,
        paymentMethod: newExpense.paymentMethod,
        date: new Date().toISOString()
      });
      
      console.log('Expense created:', result);

      // Transform and add to local state
      const expenseDate = result.expenseDate ? new Date(result.expenseDate) : new Date();
      const newExp: Expense = {
        id: result._id,
        amount: result.amount,
        category: result.category,
        purpose: result.purpose,
        date: expenseDate.toISOString().split('T')[0],
        time: expenseDate.toLocaleTimeString('en-IN', { hour12: true }),
        paymentMethod: result.paymentMethod || 'UPI'
      };

      setExpenses(prev => [newExp, ...prev]);
      
>>>>>>> af463aa0b74e9917119b5d08500c73c5b90334f8
      setNewExpense({ amount: '', category: '', purpose: '', paymentMethod: 'UPI' });
      setShowAddExpense(false);
      
      // Reload to get fresh data
      await loadExpenses();
      
      alert('✅ Expense added successfully!');
    } catch (error: any) {
      console.error('Error adding expense:', error);
<<<<<<< HEAD
      // Fallback: create expense locally if API fails
      const amount = parseFloat(newExpense.amount);
      const date = new Date();
      const expense: Expense = {
        id: Date.now().toString(),
        amount: amount,
        category: newExpense.category,
        purpose: newExpense.purpose,
        date: date.toISOString().split('T')[0],
        time: date.toLocaleTimeString('en-IN', { hour12: true }),
        paymentMethod: newExpense.paymentMethod,
        riskScore: 0,
        fraudReasons: [],
        isFlagged: false
      };
      setExpenses(prev => [expense, ...prev]);
      setLastFraudAnalysis({
        riskScore: 0,
        fraudReasons: ['Unable to analyze - saved locally'],
        isFlagged: false,
        amount: amount,
        category: newExpense.category
      });
      setNewExpense({ amount: '', category: '', purpose: '', paymentMethod: 'UPI' });
=======
      const errorMessage = error?.message || 'Failed to add expense. Please check your connection and try again.';
      setError(errorMessage);
      alert(`❌ Error: ${errorMessage}`);
>>>>>>> af463aa0b74e9917119b5d08500c73c5b90334f8
    } finally {
      setIsAddingExpense(false);
    }
  };

  const getFilteredExpenses = () => {
    const today = new Date();
    const selected = new Date(selectedDate);

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);

      switch (viewMode) {
        case 'daily':
          return expenseDate.toDateString() === selected.toDateString();
        case 'weekly':
          const weekStart = new Date(selected);
          weekStart.setDate(selected.getDate() - selected.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return expenseDate >= weekStart && expenseDate <= weekEnd;
        case 'monthly':
          return expenseDate.getMonth() === selected.getMonth() &&
            expenseDate.getFullYear() === selected.getFullYear();
        default:
          return true;
      }
    });
  };

  const getCategoryData = (): CategoryData[] => {
    const filtered = getFilteredExpenses();
    const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);

    const categoryTotals = expenseCategories.map(cat => {
      const amount = filtered
        .filter(exp => exp.category === cat.name)
        .reduce((sum, exp) => sum + exp.amount, 0);

      return {
        name: cat.name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: cat.color
      };
    }).filter(cat => cat.amount > 0);

    return categoryTotals.sort((a, b) => b.amount - a.amount);
  };

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    const filtered = getFilteredExpenses();
    const categoryData = getCategoryData();
    const totalSpent = filtered.reduce((sum, exp) => sum + exp.amount, 0);

    try {
      const analysisData = {
        totalExpenses: totalSpent,
        transactionCount: filtered.length,
        topCategory: categoryData[0]?.name || 'None',
        categories: categoryData,
        period: viewMode,
        averageTransaction: filtered.length > 0 ? totalSpent / filtered.length : 0
      };

      const result = await getDeepAIAnalysis('expense', analysisData, { insights: true });
      setAiInsights(result.analysis || 'Based on your spending patterns, consider setting category-wise budgets and tracking daily expenses to improve financial discipline.');
    } catch (error) {
      setAiInsights('Your spending analysis shows opportunities for optimization. Focus on reducing expenses in your top spending categories and building consistent saving habits for better financial health. Consider setting monthly budgets for each category and tracking daily expenses. Use the 50-30-20 rule for better money management. Automate savings to build an emergency fund covering 6 months of expenses.');
    }
    setIsAnalyzing(false);
  };

  const LineChartComponent = ({ data, title }: { data: any[]; title: string }) => {
    // defensive defaults
    if (!data || data.length === 0) {
      return (
        <div className="bg-jet-black rounded-xl p-6">
          <h4 className="text-lg font-bold text-soft-white mb-4 text-center">{title}</h4>
          <div className="flex items-center justify-center text-slate-gray">No data</div>
        </div>
      );
    }

    // ensure maxValue is at least 1 to avoid division by zero
    const rawValues = data.map((d) => Number(d.value) || 0);
    const maxValue = Math.max(...rawValues, 1);
    const width = 300;
    const height = 150;
    const paddingX = 10;
    const paddingY = 30;
    const usableWidth = width;
    const usableHeight = height;

    const pointCount = data.length;
    const points = rawValues.map((val, idx) => {
      // when there's only one point, place it near the middle
      const x =
        pointCount === 1 ? usableWidth / 2 : (idx / Math.max(1, pointCount - 1)) * usableWidth;
      // clamp computed y to avoid NaN / Infinity
      const ratio = isFinite(maxValue) && maxValue > 0 ? val / maxValue : 0;
      const y = usableHeight - ratio * (usableHeight * 0.8); // leave top/bottom padding visually
      return { x: Math.round(x), y: Math.round(y) };
    });

    // build path string only if we have valid points
    const pathD =
      points.length > 0
        ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x + paddingX},${p.y + paddingY}`).join(" ")
        : "";

    // prepare small ticks/labels for bottom (safe mapping)
    const labels = data.map((d, i) => ({
      label: d.label || `${i + 1}`,
      value: d.value || 0,
    }));

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">{title}</h4>

        <svg width={width + paddingX * 2} height={height + paddingY * 2} className="mx-auto block">
          {/* gridlines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={paddingX}
              y1={paddingY + (i * (usableHeight / 4))}
              x2={paddingX + usableWidth}
              y2={paddingY + (i * (usableHeight / 4))}
              stroke="#374151"
              strokeWidth={0.5}
              strokeOpacity={0.8}
            />
          ))}

          {/* path */}
          {pathD && (
            <path
              d={pathD}
              stroke="url(#expenseGradient)"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* gradient definition */}
          <defs>
            <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="50%" stopColor="#4ECDC4" />
              <stop offset="100%" stopColor="#45B7D1" />
            </linearGradient>
          </defs>

          {/* points */}
          {points.map((p, idx) => {
            // ensure numeric
            const cx = Number(p.x) + paddingX;
            const cy = Number(p.y) + paddingY;
            if (!isFinite(cx) || !isFinite(cy)) return null;
            return <circle key={idx} cx={cx} cy={cy} r={4} fill="#FF6B6B" />;
          })}
        </svg>

        {/* bottom labels */}
        <div className="flex justify-between mt-4 text-sm">
          {labels.map((item, index) => (
            <div key={index} className="text-center truncate" style={{ width: `${100 / labels.length}%` }}>
              <p className="text-white">{item.label}</p>
              <p className="text-soft-white font-bold">₹{(item.value / 1000).toFixed(1)}K</p>
            </div>
          ))}
        </div>
      </div>
    );
  };


  const PieChartComponent = ({ data, title }: { data: CategoryData[], title: string }) => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    let currentAngle = 0;

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">{title}</h4>
        <div className="flex items-center justify-center">
          <svg width="200" height="200" className="mx-auto">
            {data.slice(0, 6).map((item, index) => {
              const percentage = (item.amount / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;

              const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
              const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              currentAngle += angle;

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="#1F2937"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
        </div>
        <div className="mt-4 space-y-2">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-soft-white">{item.name}</span>
              </div>
              <span className="text-white">{item.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BarChartComponent = ({ data, title }: { data: CategoryData[], title: string }) => {
    const maxAmount = Math.max(...data.map(item => item.amount));

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">{title}</h4>
        <div className="space-y-3">
          {data.slice(0, 8).map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-xs text-white truncate">{item.name}</div>
              <div className="flex-1 bg-charcoal-gray rounded-full h-6 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${(item.amount / maxAmount) * 100}%`,
                    backgroundColor: item.color
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className="text-xs text-soft-white font-bold">₹{(item.amount / 1000).toFixed(1)}K</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalAmount = getFilteredExpenses().reduce((sum, exp) => sum + exp.amount, 0);
  const transactionCount = getFilteredExpenses().length;
  const categoryData = getCategoryData();

  // Get weekly data for trend chart
  const getTrendData = () => {
    if (viewMode === 'daily') {
      const days = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
        const dayExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.toDateString() === date.toDateString();
        });
        const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        days.push({
          label: date.getDate().toString(),
          value: dayTotal
        });
      }
      return days;
    } else if (viewMode === 'weekly') {
      const weeks = [];
      const today = new Date();
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(today.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
        const weekExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate >= weekStart && expDate <= weekEnd;
        });
        const weekTotal = weekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        weeks.push({
          label: `W${4 - i}`,
          value: weekTotal
        });
      }
      return weeks;
    } else {
      const months = [];
      const today = new Date();
      for (let i = 3; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
        });
        const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        months.push({
          label: date.toLocaleDateString('en-US', { month: 'short' }),
          value: monthTotal
        });
      }
      return months;
    }
  };

  return (
    <section className="py-16 bg-jet-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-ubuntu font-bold text-soft-white mb-4">
            Smart Expense <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 bg-clip-text text-transparent">Tracker</span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-ubuntu">
            Track every payment, understand your spending, and save smarter with AI insights
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading expenses...</p>
            </div>
          </div>
        ) : (
          <>
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
            <DollarSign className="w-8 h-8 mb-3" />
            <h4 className="font-bold mb-1">Total Spent</h4>
            <p className="text-2xl font-bold">₹{(totalAmount / 1000).toFixed(1)}K</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <BarChart3 className="w-8 h-8 mb-3" />
            <h4 className="font-bold mb-1">Transactions</h4>
            <p className="text-2xl font-bold">{transactionCount}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <Target className="w-8 h-8 mb-3" />
            <h4 className="font-bold mb-1">Avg Transaction</h4>
            <p className="text-2xl font-bold">₹{transactionCount > 0 ? Math.round(totalAmount / transactionCount) : 0}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <PieChart className="w-8 h-8 mb-3" />
            <h4 className="font-bold mb-1">Top Category</h4>
            <p className="text-lg font-bold">{categoryData[0]?.name || 'None'}</p>
          </div>
        </div>

        {/* View Controls */}
        <div className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${viewMode === mode
                    ? 'bg-emerald-500 text-white'
                    : 'bg-jet-black text-slate-gray hover:text-soft-white'
                    }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-4 items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-jet-black border border-slate-gray/30 rounded-lg text-soft-white focus:border-emerald-400 focus:outline-none"
              />
              <button
                onClick={generateAIInsights}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <Brain className="w-4 h-4" />
                {isAnalyzing ? 'Analyzing...' : 'AI Insights'}
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <LineChartComponent
            title={`📈 ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Spending Trend`}
            data={getTrendData()}
          />

          <PieChartComponent
            data={categoryData}
            title="🥧 Category Distribution"
          />

          <BarChartComponent
            data={categoryData}
            title="📊 Top Categories"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Expense List */}
          <div className="lg:col-span-2 bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20">
            <h3 className="text-xl font-bold text-soft-white mb-6">Recent Transactions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getFilteredExpenses().length === 0 ? (
                <div className="text-center py-8 text-white">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No expenses found for the selected period</p>
                </div>
              ) : (
                getFilteredExpenses().slice(0, 10).map(expense => {
                  const category = expenseCategories.find(cat => cat.name === expense.category);
                  const riskColor = !expense.riskScore ? 'text-green-400' :
                    expense.riskScore <= 30 ? 'text-green-400' :
                      expense.riskScore <= 70 ? 'text-yellow-400' :
                        'text-red-500';

                  return (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-jet-black rounded-lg hover:bg-slate-gray/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: category?.color + '20' }}>
                          {category?.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-soft-white">{expense.purpose}</p>
                          <p className="text-sm text-white">{expense.category} • {expense.paymentMethod}</p>
                          <p className="text-xs text-white">{expense.date} at {expense.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-red-400">-₹{expense.amount}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20">
            <h3 className="text-xl font-bold text-soft-white mb-6">Category Breakdown</h3>
            <div className="space-y-4">
              {categoryData.slice(0, 8).map(category => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span className="text-soft-white">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-soft-white">₹{category.amount.toLocaleString()}</p>
                    <p className="text-xs text-white">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <div className="mt-8 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-8 h-8 text-purple-400" />
              <h3 className="text-2xl font-bold text-soft-white">AI Financial Insights</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Overview Section */}
              <div className="bg-jet-black/50 rounded-xl p-5 border border-purple-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-soft-white">📊 Overview</h4>
                </div>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const filtered = getFilteredExpenses();
                    const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
                    const avg = filtered.length > 0 ? total / filtered.length : 0;
                    const topCat = getCategoryData()[0];
                    return (
                      <>
                        <p className="text-white">• <span className="text-soft-white font-semibold">Total Spent:</span> ₹{total.toLocaleString()}</p>
                        <p className="text-white">• <span className="text-soft-white font-semibold">Transactions:</span> {filtered.length}</p>
                        <p className="text-white">• <span className="text-soft-white font-semibold">Average:</span> ₹{Math.round(avg).toLocaleString()}</p>
                        {topCat && <p className="text-white">• <span className="text-soft-white font-semibold">Top Category:</span> {topCat.name} ({topCat.percentage.toFixed(0)}%)</p>}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Spending Pattern */}
              <div className="bg-jet-black/50 rounded-xl p-5 border border-pink-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-pink-400" />
                  <h4 className="font-bold text-soft-white">📈 Spending Pattern</h4>
                </div>
                <div className="space-y-2 text-sm text-white">
                  {(() => {
                    const topCat = getCategoryData()[0];
                    if (!topCat) return <p>No spending data yet.</p>;
                    
                    if (topCat.percentage > 40) {
                      return (
                        <>
                          <p>• <span className="text-yellow-400 font-semibold">{topCat.name}</span> dominates your expenses</p>
                          <p>• Consider diversifying spending across categories</p>
                          <p>• Set category-specific budget limits</p>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <p>• Balanced spending across categories</p>
                          <p>• Top category: <span className="text-emerald-400 font-semibold">{topCat.name}</span></p>
                          <p>• Good financial distribution</p>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Savings Opportunities */}
              <div className="bg-jet-black/50 rounded-xl p-5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-soft-white">💡 Save Money</h4>
                </div>
                <div className="space-y-2 text-sm text-white">
                  <p>• Track daily expenses consistently</p>
                  <p>• Apply 50-30-20 budgeting rule</p>
                  <p>• Reduce non-essential spending by 10%</p>
                  <p>• Automate savings each month</p>
                </div>
              </div>

              {/* Budget Optimization */}
              <div className="bg-jet-black/50 rounded-xl p-5 border border-blue-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <h4 className="font-bold text-soft-white">✅ Action Steps</h4>
                </div>
                <div className="space-y-2 text-sm text-white">
                  <p>• Set monthly budget for each category</p>
                  <p>• Build emergency fund (6 months expenses)</p>
                  <p>• Review expenses weekly</p>
                  <p>• Cut unnecessary subscriptions</p>
                </div>
              </div>
            </div>

            {/* Risk Alert if high spending */}
            {(() => {
              const filtered = getFilteredExpenses();
              const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
              const topCat = getCategoryData()[0];
              
              if (topCat && topCat.percentage > 50) {
                return (
                  <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-semibold text-sm">⚠️ Overspending Risk Detected</p>
                      <p className="text-red-300 text-xs mt-1">
                        {topCat.name} category accounts for {topCat.percentage.toFixed(0)}% of your expenses. 
                        Consider reducing spending in this category to maintain financial balance.
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}

        {/* Smart Saving Tips */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 border border-emerald-500/20">
          <div className="flex items-start gap-4">
            <Lightbulb className="w-8 h-8 text-emerald-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold text-soft-white mb-6">Smart Money-Saving Tips</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {savingTips.slice(0, 6).map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-white text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-charcoal-gray rounded-2xl p-8 w-full max-w-2xl border border-slate-gray/20 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-soft-white mb-6 text-center">💰 Add New Expense</h2>
<<<<<<< HEAD

              {/* Fraud Analysis Display */}
              {lastFraudAnalysis && (
                <div className={`mb-8 rounded-xl p-6 border-2 ${lastFraudAnalysis.isFlagged
                  ? 'bg-red-500/10 border-red-500'
                  : lastFraudAnalysis.riskScore > 30
                    ? 'bg-yellow-500/10 border-yellow-500'
                    : 'bg-green-500/10 border-green-500'
                  }`}>
                  <div className="flex items-center gap-3 mb-3">
                    {lastFraudAnalysis.isFlagged ? (
                      <>
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <h3 className="text-xl font-bold text-red-500">🚨 FRAUD ALERT - FLAGGED</h3>
                      </>
                    ) : lastFraudAnalysis.riskScore > 30 ? (
                      <>
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        <h3 className="text-xl font-bold text-yellow-500">⚠️ WARNING - Moderate Risk</h3>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <h3 className="text-xl font-bold text-green-500">✓ SAFE - Low Risk</h3>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-soft-white font-semibold">Risk Score</span>
                        <span className={`text-2xl font-bold ${lastFraudAnalysis.riskScore <= 30 ? 'text-green-400' :
                          lastFraudAnalysis.riskScore <= 70 ? 'text-yellow-400' :
                            'text-red-500'
                          }`}>
                          {lastFraudAnalysis.riskScore}/100
                        </span>
                      </div>

                      {/* Risk Bar */}
                      <div className="w-full bg-black/60 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${lastFraudAnalysis.riskScore <= 30 ? 'bg-green-500' :
                            lastFraudAnalysis.riskScore <= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          style={{ width: `${lastFraudAnalysis.riskScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-black/40 rounded-lg p-4">
                      <p className="text-soft-white font-semibold mb-3">Transaction Details:</p>
                      <div className="space-y-2 text-sm">
                        <p className="text-white">💰 Amount: <span className="font-bold text-red-400">₹{lastFraudAnalysis.amount}</span></p>
                        <p className="text-white">🏷️ Category: <span className="font-bold">{lastFraudAnalysis.category}</span></p>
                        <p className="text-white">🕐 Time: <span className="font-bold">{new Date().toLocaleTimeString('en-IN', { hour12: true })}</span></p>
                      </div>
                    </div>

                    {/* Fraud Reasons */}
                    {lastFraudAnalysis.fraudReasons && lastFraudAnalysis.fraudReasons.length > 0 && (
                      <div className="bg-black/40 rounded-lg p-4">
                        <p className="text-soft-white font-semibold mb-3">🚨 Risk Factors Detected:</p>
                        <ul className="space-y-2 text-sm text-white">
                          {lastFraudAnalysis.fraudReasons.map((reason: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="bg-black/40 rounded-lg p-4">
                      <p className="text-soft-white font-semibold mb-3">💡 Recommendation:</p>
                      <p className="text-sm text-white">
                        {lastFraudAnalysis.isFlagged
                          ? "This transaction has been flagged due to multiple risk factors. Please review it carefully. You should verify this expense is legitimate before confirming."
                          : lastFraudAnalysis.riskScore > 30
                            ? "This transaction shows some unusual characteristics. Proceed with caution and verify the details are correct."
                            : "This transaction appears normal. No fraud indicators detected."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}


=======
              
>>>>>>> af463aa0b74e9917119b5d08500c73c5b90334f8
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-soft-white mb-2">💵 Amount (₹)</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-4 py-3 bg-jet-black border border-slate-gray/30 rounded-lg text-soft-white placeholder-white focus:border-emerald-400 focus:outline-none"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-soft-white mb-2">📝 Purpose</label>
                    <input
                      type="text"
                      value={newExpense.purpose}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, purpose: e.target.value }))}
                      className="w-full px-4 py-3 bg-jet-black border border-slate-gray/30 rounded-lg text-soft-white placeholder-white focus:border-emerald-400 focus:outline-none"
                      placeholder="What was this expense for?"
                    />
                    <div className="mt-2 text-xs text-white">
                      💡 Be specific: "Lunch at XYZ Restaurant" instead of just "Food"
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-soft-white mb-2">💳 Payment Method</label>
                    <select
                      value={newExpense.paymentMethod}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-4 py-3 bg-jet-black border border-slate-gray/30 rounded-lg text-soft-white focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Wallet">Wallet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-soft-white mb-2">🏷️ Category</label>
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {expenseCategories.map(category => (
                      <button
                        key={category.name}
                        onClick={() => setNewExpense(prev => ({ ...prev, category: category.name }))}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-1 ${newExpense.category === category.name
                          ? 'border-emerald-500 bg-emerald-500/20'
                          : 'border-slate-gray/30 hover:border-slate-gray/50 bg-jet-black'
                          }`}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-xs font-medium text-soft-white text-center">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowAddExpense(false);
                    setLastFraudAnalysis(null);
                  }}
                  className="flex-1 px-6 py-3 bg-jet-black border border-slate-gray/30 text-soft-white rounded-lg hover:bg-slate-gray/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addExpense}
                  disabled={!newExpense.amount || !newExpense.category || !newExpense.purpose || isAddingExpense}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isAddingExpense ? '⏳ Adding...' : '💰 Add Expense'}
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </section>
  );
};

export default SmartExpenseTracker;