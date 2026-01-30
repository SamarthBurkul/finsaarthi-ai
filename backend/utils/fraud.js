/**
 * Fraud Detection Engine
 * Rule-based heuristic system for assigning risk scores to transactions
 * 
 * Scoring Rules:
 * - Large Amount (>₹50,000): +60 points
 * - Suspicious Category: +20 points
 * - Rapid Frequency (>3 txns in 10 min): +20 points
 * - Very Large Amount (>₹1,00,000): +15 points
 * - Unusual Time (11 PM - 5 AM): +10 points
 * 
 * Final score capped at 100
 */

function computeFraudRisk(transaction, recentTransactions = []) {
  let riskScore = 0;
  const reasons = [];

  // ============================================
  // RULE 1: Large Amount Transaction (>₹50,000)
  // ============================================
  const LARGE_AMOUNT_THRESHOLD = 50000;
  const LARGE_AMOUNT_POINTS = 60;

  if (transaction.amount > LARGE_AMOUNT_THRESHOLD) {
    riskScore += LARGE_AMOUNT_POINTS;
    reasons.push(
      `Large transaction amount: ₹${transaction.amount} (threshold: ₹${LARGE_AMOUNT_THRESHOLD})`
    );
  }

  // ============================================
  // RULE 2: Suspicious Category
  // ============================================
  const SUSPICIOUS_CATEGORIES = ["crypto", "gambling", "unknown"];
  const SUSPICIOUS_CATEGORY_POINTS = 20;

  const categoryLower = (transaction.category || "").toLowerCase().trim();
  if (SUSPICIOUS_CATEGORIES.includes(categoryLower)) {
    riskScore += SUSPICIOUS_CATEGORY_POINTS;
    reasons.push(`Suspicious category detected: ${transaction.category}`);
  }

  // ============================================
  // RULE 3: Rapid Frequency Transfers
  // ============================================
  const RAPID_TRANSFER_THRESHOLD = 3;
  const RAPID_TRANSFER_TIME_WINDOW = 10 * 60 * 1000; // 10 minutes
  const RAPID_TRANSFER_POINTS = 20;

  if (recentTransactions && Array.isArray(recentTransactions)) {
    const now = new Date(transaction.date || Date.now());
    const recentCount = recentTransactions.filter((tx) => {
      const txTime = new Date(tx.expenseDate || tx.date || 0);
      return now - txTime < RAPID_TRANSFER_TIME_WINDOW;
    }).length;

    if (recentCount > RAPID_TRANSFER_THRESHOLD) {
      riskScore += RAPID_TRANSFER_POINTS;
      reasons.push(
        `Rapid transfers detected: ${recentCount} transactions in last 10 minutes`
      );
    }
  }

  // ============================================
  // RULE 4: Very Large Amount (>₹1,00,000)
  // ============================================
  const VERY_LARGE_THRESHOLD = 100000;
  const VERY_LARGE_POINTS = 15;

  if (transaction.amount > VERY_LARGE_THRESHOLD) {
    riskScore += VERY_LARGE_POINTS;
    reasons.push(
      `Very large amount: ₹${transaction.amount} (>₹${VERY_LARGE_THRESHOLD})`
    );
  }

  // ============================================
  // RULE 5: Unusual Time (11 PM - 5 AM)
  // ============================================
  const UNUSUAL_TIME_POINTS = 10;
  const transactionHour = new Date(transaction.date || Date.now()).getHours();
  const isUnusualTime = transactionHour < 5 || transactionHour > 23;

  if (isUnusualTime) {
    riskScore += UNUSUAL_TIME_POINTS;
    reasons.push(
      `Transaction at unusual time: ${transactionHour}:00 (late night/early morning)`
    );
  }

  // ============================================
  // CAP SCORE AT 100
  // ============================================
  riskScore = Math.min(riskScore, 100);
  riskScore = Math.max(riskScore, 0);

  // ============================================
  // DETERMINE IF FLAGGED (Score > 70)
  // ============================================
  const FLAGGED_THRESHOLD = 70;
  const flagged = riskScore > FLAGGED_THRESHOLD;

  return {
    riskScore,
    reasons,
    flagged,
  };
}

module.exports = {
  computeFraudRisk,
};
