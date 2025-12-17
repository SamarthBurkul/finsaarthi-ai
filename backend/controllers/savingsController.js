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
