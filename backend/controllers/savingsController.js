const { SavingsState, DailySavingLog, LifeGoal } = require('../models/saving');

// ==================== SAVINGS STATE CONTROLLERS ====================

// Get current savings state
exports.getSavingsState = async (req, res) => {
  try {
    let savingsState = await SavingsState.findOne({ userId: req.userId });
    
    // Create default state if doesn't exist
    if (!savingsState) {
      savingsState = new SavingsState({
        userId: req.userId,
        dailyGoal: 20,
        currentSavings: 0,
        streak: 0,
        daysSaved: 0
      });
      await savingsState.save();
    }
    
    res.json(savingsState);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update savings state (daily goal, selected goal, etc.)
exports.updateSavingsState = async (req, res) => {
  try {
    const { dailyGoal, selectedGoal, goalPrice } = req.body;
    
    let savingsState = await SavingsState.findOne({ userId: req.userId });
    
    if (!savingsState) {
      savingsState = new SavingsState({ userId: req.userId });
    }
    
    if (dailyGoal !== undefined) savingsState.dailyGoal = dailyGoal;
    if (selectedGoal !== undefined) savingsState.selectedGoal = selectedGoal;
    if (goalPrice !== undefined) savingsState.goalPrice = goalPrice;
    
    await savingsState.save();
    
    res.json(savingsState);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== SAVE TODAY CONTROLLER ====================

// Mark today as saved
exports.saveToday = async (req, res) => {
  try {
    let savingsState = await SavingsState.findOne({ userId: req.userId });
    
    if (!savingsState) {
      savingsState = new SavingsState({
        userId: req.userId,
        dailyGoal: 20
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if already saved today
    const alreadySaved = await DailySavingLog.findOne({
      userId: req.userId,
      date: { 
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (alreadySaved) {
      return res.status(400).json({ error: 'Already saved today!' });
    }
    
    // Update streak logic
    const lastSaved = savingsState.lastSavedDate 
      ? new Date(savingsState.lastSavedDate) 
      : null;
    
    if (lastSaved) {
      lastSaved.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - lastSaved) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day - increment streak
        savingsState.streak += 1;
      } else if (daysDiff > 1) {
        // Streak broken - reset to 1
        savingsState.streak = 1;
      }
    } else {
      // First save ever
      savingsState.streak = 1;
    }
    
    // Update savings state
    savingsState.currentSavings += savingsState.dailyGoal;
    savingsState.daysSaved += 1;
    savingsState.lastSavedDate = today;
    
    await savingsState.save();
    
    // Create daily log
    const dailyLog = new DailySavingLog({
      userId: req.userId,
      date: new Date(),
      amountSaved: savingsState.dailyGoal,
      streakAtSave: savingsState.streak
    });
    
    await dailyLog.save();
    
    res.json({
      message: 'Savings recorded!',
      currentSavings: savingsState.currentSavings,
      streak: savingsState.streak,
      daysSaved: savingsState.daysSaved
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== SAVING LOGS CONTROLLER ====================

// Get saving logs history
exports.getSavingLogs = async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    
    const query = { userId: req.userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const logs = await DailySavingLog.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    // Calculate statistics
    const totalSaved = logs.reduce((sum, log) => sum + log.amountSaved, 0);
    const avgPerDay = logs.length > 0 ? totalSaved / logs.length : 0;
    
    res.json({
      logs,
      statistics: {
        totalTransactions: logs.length,
        totalSaved,
        avgPerDay: Math.round(avgPerDay)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== PROJECTIONS CONTROLLER ====================

// Get savings projections
exports.getProjections = async (req, res) => {
  try {
    let savingsState = await SavingsState.findOne({ userId: req.userId });
    
    const dailyAmount = savingsState ? savingsState.dailyGoal : 20;
    
    const projections = {
      tenDays: dailyAmount * 10,
      oneMonth: dailyAmount * 30,
      hundredDays: dailyAmount * 100,
      oneYear: dailyAmount * 365
    };
    
    res.json(projections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== LIFE GOALS CONTROLLERS ====================

// Get all life goals
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await LifeGoal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new life goal
exports.createGoal = async (req, res) => {
  try {
    const { goalName, targetAmount, targetDate } = req.body;
    
    if (!goalName || !targetAmount) {
      return res.status(400).json({ error: 'Goal name and target amount are required' });
    }
    
    const goal = new LifeGoal({
      userId: req.userId,
      goalName,
      targetAmount,
      targetDate: targetDate || null
    });
    
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update life goal
exports.updateGoal = async (req, res) => {
  try {
    const { currentSavedAmount, status } = req.body;
    
    const goal = await LifeGoal.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    if (currentSavedAmount !== undefined) goal.currentSavedAmount = currentSavedAmount;
    if (status !== undefined) goal.status = status;
    
    // Auto-complete if target reached
    if (goal.currentSavedAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }
    
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete life goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await LifeGoal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const savingsState = await SavingsState.findOne({ userId: req.userId });
    const goals = await LifeGoal.find({ userId: req.userId, status: 'active' });
    
    // Get last 7 days logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentLogs = await DailySavingLog.find({
      userId: req.userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });
    
    const weeklyTotal = recentLogs.reduce((sum, log) => sum + log.amountSaved, 0);
    
    res.json({
      savingsState: savingsState || {
        currentSavings: 0,
        streak: 0,
        daysSaved: 0,
        dailyGoal: 20
      },
      activeGoals: goals.length,
      weeklyTotal,
      recentActivity: recentLogs.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== AI ANALYSIS CONTROLLER ====================

// Get AI-powered savings analysis
exports.getAIAnalysis = async (req, res) => {
  try {
    const savingsState = await SavingsState.findOne({ userId: req.userId });
    
    if (!savingsState) {
      return res.status(404).json({ error: 'No savings data found' });
    }

    const { dailyGoal, currentSavings, streak, daysSaved, selectedGoal, goalPrice } = savingsState;
    
    // Calculate metrics
    const savingsRate = currentSavings > 0 && daysSaved > 0 ? currentSavings / daysSaved : dailyGoal;
    const monthlyProjection = savingsRate * 30;
    const yearlyProjection = savingsRate * 365;
    const consistencyRate = daysSaved > 0 ? (streak / daysSaved * 100) : 0;
    
    // Determine performance level
    let performanceLevel = 'Getting Started';
    if (currentSavings >= 10000 && streak >= 30) performanceLevel = 'Excellent';
    else if (currentSavings >= 5000 && streak >= 15) performanceLevel = 'Good';
    else if (currentSavings >= 1000 && streak >= 7) performanceLevel = 'Average';
    
    // Generate practical analysis
    const analysis = {
      savingsAssessment: {
        currentPerformance: performanceLevel,
        savingsRate: `₹${Math.round(savingsRate)} per day average`,
        progressEvaluation: `You've saved ${daysSaved} days with a ${streak}-day streak. ${consistencyRate > 70 ? 'Excellent consistency!' : 'Keep building the habit!'}`
      },
      practicalTips: [
        dailyGoal < 50 ? 'Start small and gradually increase your daily goal as you build the habit' : 'Your daily goal is good. Focus on consistency',
        'Review your expenses weekly to find additional savings opportunities',
        streak < 7 ? 'Try to maintain a 7-day streak first, then aim for 30 days' : 'Great streak! Keep it going',
        'Use the 24-hour rule: Wait 24 hours before making impulse purchases'
      ],
      smartAdvice: {
        increaseGoal: dailyGoal < 100 ? `Consider increasing to ₹${dailyGoal + 20} once you maintain a 30-day streak` : 'Your goal is ambitious. Focus on consistency',
        expenseReduction: 'Track dining out, subscriptions, and entertainment expenses - these are often the easiest to optimize',
        savingStrategy: consistencyRate > 70 ? 'Your consistency is great! Consider automating transfers to a high-interest savings account' : 'Focus on building consistency. Set daily reminders'
      },
      goalGuidance: {
        timeToGoal: goalPrice && goalPrice > currentSavings ? `${Math.ceil((goalPrice - currentSavings) / dailyGoal)} days at current rate` : selectedGoal ? 'Goal achieved! Set a new one' : 'Set a goal to stay motivated',
        goalFeasibility: goalPrice ? (goalPrice / yearlyProjection < 2 ? 'Very achievable within 2 years' : 'Ambitious but possible with consistency') : 'Select a goal to track progress',
        alternativeGoals: currentSavings < 50000 ? 'Consider building a ₹50,000 emergency fund first' : 'You have a good emergency base. Time to invest!'
      },
      moneyManagement: {
        emergencyFund: currentSavings < 100000 ? `Build up to ₹1,00,000 for emergencies (currently at ${Math.round(currentSavings/100000*100)}%)` : 'Excellent emergency fund! Consider investing surplus',
        investmentReadiness: currentSavings >= 50000 ? 'You\'re ready to explore mutual funds or SIPs' : 'Focus on building emergency fund first',
        budgetOptimization: 'Follow 50-30-20 rule: 50% needs, 30% wants, 20% savings/investments'
      },
      nextSteps: [
        consistencyRate < 70 ? 'Set daily reminders to maintain consistency' : 'Increase your daily goal by 10-20%',
        'Open a separate high-interest savings account for your goals',
        currentSavings >= 50000 ? 'Consult a financial advisor about investment options' : 'Focus on reaching ₹50,000 milestone'
      ],
      projections: {
        monthly: Math.round(monthlyProjection),
        yearly: Math.round(yearlyProjection),
        threeYears: Math.round(yearlyProjection * 3)
      },
      statistics: {
        totalSaved: currentSavings,
        averagePerDay: Math.round(savingsRate),
        streak: streak,
        consistency: Math.round(consistencyRate)
      }
    };

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
