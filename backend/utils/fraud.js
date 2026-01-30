// backend/utils/fraud.js

/**
 * Compute fraud risk score based on transaction patterns
 * @param {Object} currentTransaction - Current transaction details
 * @param {Array} recentTransactions - Recent transaction history
 * @returns {Object} Fraud analysis result
 */
function computeFraudRisk(currentTransaction, recentTransactions = []) {
  let riskScore = 0;
  const reasons = [];
  const { amount, category, date } = currentTransaction;

  // 1. Unusually large amount (>2x average)
  if (recentTransactions.length > 0) {
    const avgAmount = recentTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) / recentTransactions.length;
    if (amount > avgAmount * 2) {
      riskScore += 30;
      reasons.push(`Amount (₹${amount}) is unusually high (2x average: ₹${avgAmount.toFixed(2)})`);
    }
  }

  // 2. Very high absolute amount
  if (amount > 50000) {
    riskScore += 25;
    reasons.push(`High-value transaction (₹${amount})`);
  }

  // 3. Duplicate transactions (same amount and category within 1 hour)
  const oneHourAgo = new Date(date);
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
  const duplicate = recentTransactions.find(t => {
    return t.amount === amount && 
           t.category === category && 
           t.expenseDate && 
           new Date(t.expenseDate) > oneHourAgo;
  });

  if (duplicate) {
    riskScore += 35;
    reasons.push('Duplicate transaction detected within 1 hour');
  }

  // 4. Unusual time (late night transactions: 11 PM - 5 AM)
  const transactionHour = new Date(date).getHours();
  if (transactionHour >= 23 || transactionHour <= 5) {
    riskScore += 15;
    reasons.push('Transaction made during unusual hours (11 PM - 5 AM)');
  }

  // 5. Frequent small transactions (potential testing)
  if (amount < 100 && recentTransactions.filter(t => t.amount < 100).length >= 5) {
    riskScore += 20;
    reasons.push('Multiple small transactions detected (potential card testing)');
  }

  // 6. Sudden category change
  if (recentTransactions.length > 0) {
    const recentCategories = recentTransactions.slice(0, 5).map(t => t.category);
    if (!recentCategories.includes(category)) {
      riskScore += 10;
      reasons.push(`Unusual category: ${category}`);
    }
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  // Flag if risk score is above threshold
  const flagged = riskScore >= 50;

  return {
    riskScore,
    reasons,
    flagged,
    severity: riskScore >= 75 ? 'high' : riskScore >= 50 ? 'medium' : 'low',
  };
}

module.exports = {
  computeFraudRisk,
};
