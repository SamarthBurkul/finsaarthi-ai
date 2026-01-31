/**
 * Fraud Detection & Risk Scoring Engine
 * 
 * A rule-based fraud detection system that assigns risk scores (0-100) to transactions
 * using explainable heuristics. No ML required - pure deterministic logic.
 * 
 * @module fraud
 * @author FinSaarthi AI Team
 * @version 1.0.0
 */

// ============================================
// CONFIGURATION - Tune these thresholds as needed
// ============================================

const FRAUD_CONFIG = {
  // Absolute amount threshold for LARGE_AMOUNT rule (in INR)
  ABSOLUTE_THRESHOLD: 50000,

  // High-risk categories
  HIGH_RISK_CATEGORIES: ['gambling', 'crypto', 'porn', 'adult', 'casino', 'betting', 'lottery'],

  // Suspicious merchant keywords (partial match)
  SUSPICIOUS_MERCHANT_KEYWORDS: ['casino', 'bet', 'gamble', 'crypto', 'offshore', 'dark'],

  // Time window for frequency checks (in milliseconds)
  RAPID_FREQUENCY_WINDOW_MS: 10 * 60 * 1000, // 10 minutes
  MAX_TXNS_IN_WINDOW: 3,

  // Percentage of wallet balance for frequency sum check
  RAPID_SUM_THRESHOLD_PERCENT: 0.2, // 20% of balance

  // Round number detection
  ROUND_NUMBER_MULTIPLES: [1000, 5000, 10000], // Check for multiples of these amounts

  // Small threshold for trusted merchant check (in INR)
  TRUSTED_MERCHANT_THRESHOLD: 5000,

  // Default user profile values when not provided
  DEFAULT_HOME_COUNTRY: 'IN',
  DEFAULT_AVG_DAILY_SPENDING: 5000,

  // Risk score threshold for flagging
  FLAG_THRESHOLD: 50
};

// ============================================
// RULE WEIGHTS - Sum of all weights
// ============================================

const RULE_WEIGHTS = {
  LARGE_AMOUNT: 60,
  HIGH_RISK_CATEGORY: 40,
  SUSPICIOUS_MERCHANT: 30,
  FREQUENT_TXNS: 25,
  LOCATION_MISMATCH: 25,
  ROUND_NUMBER_PATTERN: 5,
  NEGATIVE_BALANCE_RISK: 35
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safely get nested property from object
 * @private
 */
function getSafe(obj, path, defaultValue = null) {
  try {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Check if amount is a round number (multiple of common values)
 * @private
 */
function isRoundNumber(amount) {
  return FRAUD_CONFIG.ROUND_NUMBER_MULTIPLES.some(multiple => {
    return amount % multiple === 0 && amount >= multiple;
  });
}

/**
 * Calculate average transaction amount from recent transactions
 * @private
 */
function calculateAvgTxnAmount(recentTransactions) {
  if (!Array.isArray(recentTransactions) || recentTransactions.length === 0) {
    return 0;
  }

  const sum = recentTransactions.reduce((acc, tx) => {
    return acc + (Number(tx.amount) || 0);
  }, 0);

  return sum / recentTransactions.length;
}

/**
 * Get transactions within a time window
 * @private
 */
function getTransactionsInWindow(recentTransactions, windowMs, currentTimestamp) {
  if (!Array.isArray(recentTransactions)) {
    return [];
  }

  const cutoffTime = new Date(currentTimestamp).getTime() - windowMs;

  return recentTransactions.filter(tx => {
    const txTime = new Date(tx.occurredAt || tx.timestamp || tx.createdAt).getTime();
    return txTime >= cutoffTime;
  });
}

/**
 * Check if merchant is in suspicious list
 * @private
 */
function isSuspiciousMerchant(merchant, trustedMerchants = []) {
  if (!merchant || typeof merchant !== 'string') {
    return false;
  }

  const merchantLower = merchant.toLowerCase();

  // Check if merchant contains suspicious keywords
  const hasSuspiciousKeyword = FRAUD_CONFIG.SUSPICIOUS_MERCHANT_KEYWORDS.some(keyword =>
    merchantLower.includes(keyword)
  );

  if (hasSuspiciousKeyword) {
    return true;
  }

  // If trusted merchants list exists and merchant is not in it, it's suspicious
  if (Array.isArray(trustedMerchants) && trustedMerchants.length > 0) {
    const isNotTrusted = !trustedMerchants.some(trusted =>
      merchantLower.includes(trusted.toLowerCase()) || trusted.toLowerCase().includes(merchantLower)
    );
    return isNotTrusted;
  }

  return false;
}

// ============================================
// FRAUD DETECTION RULES
// ============================================

/**
 * Rule 1: LARGE_AMOUNT
 * Triggers when amount exceeds maximum of: 50% of balance, 3x avg daily spending, or absolute threshold
 * @private
 */
function checkLargeAmount(transaction, wallet, userProfile) {
  const amount = Number(transaction.amount) || 0;
  const balance = Number(wallet?.balance) || 0;
  const avgDailySpending = Number(userProfile?.avgDailySpending) || FRAUD_CONFIG.DEFAULT_AVG_DAILY_SPENDING;

  const threshold1 = balance * 0.5;
  const threshold2 = avgDailySpending * 3;
  const threshold3 = FRAUD_CONFIG.ABSOLUTE_THRESHOLD;

  const maxThreshold = Math.max(threshold1, threshold2, threshold3);
  const matched = amount > maxThreshold;

  return {
    matched,
    weight: matched ? RULE_WEIGHTS.LARGE_AMOUNT : 0,
    info: {
      amount,
      maxThreshold: Math.round(maxThreshold),
      thresholds: {
        halfBalance: Math.round(threshold1),
        threeXAvgSpending: Math.round(threshold2),
        absolute: threshold3
      }
    }
  };
}

/**
 * Rule 2: HIGH_RISK_CATEGORY
 * Triggers when transaction category is in high-risk list
 * @private
 */
function checkHighRiskCategory(transaction) {
  const category = (transaction.category || '').toLowerCase().trim();
  const matched = FRAUD_CONFIG.HIGH_RISK_CATEGORIES.includes(category);

  return {
    matched,
    weight: matched ? RULE_WEIGHTS.HIGH_RISK_CATEGORY : 0,
    info: {
      category,
      highRiskCategories: FRAUD_CONFIG.HIGH_RISK_CATEGORIES
    }
  };
}

/**
 * Rule 3: SUSPICIOUS_MERCHANT
 * Triggers when merchant is suspicious or not in trusted list (for amounts > threshold)
 * @private
 */
function checkSuspiciousMerchant(transaction, userProfile) {
  const merchant = getSafe(transaction, 'metadata.merchant') || transaction.merchant || '';
  const amount = Number(transaction.amount) || 0;
  const trustedMerchants = userProfile?.trustedMerchants || [];

  // Only check for larger amounts
  if (amount <= FRAUD_CONFIG.TRUSTED_MERCHANT_THRESHOLD) {
    return {
      matched: false,
      weight: 0,
      info: {
        merchant,
        amount,
        reason: 'Amount below threshold for merchant check'
      }
    };
  }

  const isSuspicious = isSuspiciousMerchant(merchant, trustedMerchants);

  return {
    matched: isSuspicious,
    weight: isSuspicious ? RULE_WEIGHTS.SUSPICIOUS_MERCHANT : 0,
    info: {
      merchant,
      amount,
      trustedMerchantsCount: trustedMerchants.length,
      isSuspicious
    }
  };
}

/**
 * Rule 4: FREQUENT_TXNS
 * Triggers when too many debits in short time OR sum exceeds threshold
 * @private
 */
function checkFrequentTransactions(transaction, wallet, recentTransactions) {
  if (!Array.isArray(recentTransactions)) {
    recentTransactions = [];
  }

  const currentTimestamp = transaction.occurredAt || transaction.timestamp || new Date();
  const windowMs = FRAUD_CONFIG.RAPID_FREQUENCY_WINDOW_MS;

  // Get transactions in window (excluding current transaction)
  const txnsInWindow = getTransactionsInWindow(recentTransactions, windowMs, currentTimestamp);

  // Count debits only
  const debitsInWindow = txnsInWindow.filter(tx =>
    (tx.type || '').toLowerCase() === 'debit'
  );

  const debitCount = debitsInWindow.length;
  const debitSum = debitsInWindow.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const balance = Number(wallet?.balance) || 0;
  const balanceThreshold = balance * FRAUD_CONFIG.RAPID_SUM_THRESHOLD_PERCENT;

  const tooManyDebits = debitCount >= FRAUD_CONFIG.MAX_TXNS_IN_WINDOW;
  const sumExceedsThreshold = debitSum > balanceThreshold;

  const matched = tooManyDebits || sumExceedsThreshold;

  return {
    matched,
    weight: matched ? RULE_WEIGHTS.FREQUENT_TXNS : 0,
    info: {
      debitCount,
      maxAllowed: FRAUD_CONFIG.MAX_TXNS_IN_WINDOW,
      debitSum: Math.round(debitSum),
      balanceThreshold: Math.round(balanceThreshold),
      windowMinutes: windowMs / (60 * 1000),
      triggers: {
        tooManyDebits,
        sumExceedsThreshold
      }
    }
  };
}

/**
 * Rule 5: LOCATION_MISMATCH
 * Triggers when transaction country doesn't match user's home country
 * @private
 */
function checkLocationMismatch(transaction, userProfile) {
  const txCountry = getSafe(transaction, 'location.country') ||
    getSafe(transaction, 'metadata.location.country') ||
    getSafe(transaction, 'metadata.ipGeo.country');

  const homeCountry = userProfile?.homeCountry || FRAUD_CONFIG.DEFAULT_HOME_COUNTRY;

  // If no transaction country, can't determine mismatch
  if (!txCountry) {
    return {
      matched: false,
      weight: 0,
      info: {
        reason: 'No location data available',
        homeCountry
      }
    };
  }

  const matched = txCountry.toUpperCase() !== homeCountry.toUpperCase();

  return {
    matched,
    weight: matched ? RULE_WEIGHTS.LOCATION_MISMATCH : 0,
    info: {
      txCountry: txCountry.toUpperCase(),
      homeCountry: homeCountry.toUpperCase(),
      mismatch: matched
    }
  };
}

/**
 * Rule 6: ROUND_NUMBER_PATTERN
 * Triggers when amount is suspiciously round and unusual for user
 * @private
 */
function checkRoundNumberPattern(transaction, recentTransactions) {
  const amount = Number(transaction.amount) || 0;
  const isRound = isRoundNumber(amount);

  if (!isRound) {
    return {
      matched: false,
      weight: 0,
      info: {
        amount,
        isRound: false
      }
    };
  }

  // Check if round numbers are unusual for this user
  const avgAmount = calculateAvgTxnAmount(recentTransactions);
  const significantlyLarger = amount > avgAmount * 2;

  const matched = isRound && (avgAmount === 0 || significantlyLarger);

  return {
    matched,
    weight: matched ? RULE_WEIGHTS.ROUND_NUMBER_PATTERN : 0,
    info: {
      amount,
      isRound,
      avgAmount: Math.round(avgAmount),
      significantlyLarger
    }
  };
}

/**
 * Rule 7: NEGATIVE_BALANCE_RISK
 * Triggers when debit would overdraw the wallet
 * @private
 */
function checkNegativeBalanceRisk(transaction, wallet) {
  const type = (transaction.type || '').toLowerCase();
  const amount = Number(transaction.amount) || 0;
  const balance = Number(wallet?.balance) || 0;

  // Only applies to debit transactions
  if (type !== 'debit') {
    return {
      matched: false,
      weight: 0,
      info: {
        type,
        reason: 'Not a debit transaction'
      }
    };
  }

  const matched = amount > balance;

  return {
    matched,
    weight: matched ? RULE_WEIGHTS.NEGATIVE_BALANCE_RISK : 0,
    info: {
      amount,
      balance,
      wouldOverdraw: matched,
      deficit: matched ? Math.round(amount - balance) : 0
    }
  };
}

// ============================================
// MAIN FRAUD SCORING FUNCTION
// ============================================

/**
 * Score a transaction for fraud risk
 * 
 * @async
 * @param {Object} params - Scoring parameters
 * @param {Object} params.transaction - Transaction object with userId, amount, type, category, merchant, etc.
 * @param {Object} params.wallet - Wallet object with balance, currency
 * @param {Array} params.recentTransactions - Recent transactions for the user (last 24 hours ideally)
 * @param {Object} [params.userProfile] - Optional user profile with thresholds and preferences
 * @param {string[]} [params.userProfile.trustedMerchants] - List of trusted merchant names
 * @param {number} [params.userProfile.avgDailySpending] - Average daily spending amount
 * @param {string} [params.userProfile.homeCountry] - User's home country code (ISO 2-letter)
 * 
 * @returns {Promise<Object>} Fraud scoring result
 * @returns {number} return.riskScore - Risk score from 0-100
 * @returns {Array<Object>} return.reasons - Human-readable reasons for the score
 * @returns {string} return.reasons[].code - Rule code that triggered
 * @returns {string} return.reasons[].message - Human-readable message
 * @returns {number} return.reasons[].weight - Weight contribution to score
 * @returns {Object} return.details - Detailed breakdown of all rules
 * @returns {Object} return.details.ruleBreakdown - Per-rule results
 * @returns {Object} return.details.computed - Computed metrics
 * 
 * @example
 * const result = await scoreTransaction({
 *   transaction: { 
 *     userId: '123', 
 *     amount: 75000, 
 *     type: 'debit',
 *     category: 'gambling',
 *     occurredAt: new Date()
 *   },
 *   wallet: { balance: 50000, currency: 'INR' },
 *   recentTransactions: [...],
 *   userProfile: { 
 *     avgDailySpending: 2000,
 *     homeCountry: 'IN',
 *     trustedMerchants: ['Amazon', 'Flipkart']
 *   }
 * });
 * 
 * // Result:
 * // {
 * //   riskScore: 95,
 * //   reasons: [
 * //     { code: 'LARGE_AMOUNT', message: 'Transaction amount (₹75,000) exceeds safe threshold', weight: 60 },
 * //     { code: 'HIGH_RISK_CATEGORY', message: 'High-risk category: gambling', weight: 40 }
 * //   ],
 * //   details: { ... }
 * // }
 */
async function scoreTransaction({ transaction, wallet, recentTransactions = [], userProfile = {} }) {
  // ============================================
  // DEFENSIVE CHECKS - Handle missing data gracefully
  // ============================================

  if (!transaction) {
    throw new Error('Transaction object is required');
  }

  // Use conservative defaults if wallet is missing
  const safeWallet = wallet || {
    balance: 0,
    currency: 'INR',
    userId: transaction.userId
  };

  // Ensure recentTransactions is an array
  const safeRecentTxns = Array.isArray(recentTransactions) ? recentTransactions : [];

  // Ensure userProfile has defaults
  const safeUserProfile = {
    avgDailySpending: FRAUD_CONFIG.DEFAULT_AVG_DAILY_SPENDING,
    homeCountry: FRAUD_CONFIG.DEFAULT_HOME_COUNTRY,
    trustedMerchants: [],
    ...userProfile
  };

  // ============================================
  // RUN ALL FRAUD DETECTION RULES
  // ============================================

  const ruleResults = {
    LARGE_AMOUNT: checkLargeAmount(transaction, safeWallet, safeUserProfile),
    HIGH_RISK_CATEGORY: checkHighRiskCategory(transaction),
    SUSPICIOUS_MERCHANT: checkSuspiciousMerchant(transaction, safeUserProfile),
    FREQUENT_TXNS: checkFrequentTransactions(transaction, safeWallet, safeRecentTxns),
    LOCATION_MISMATCH: checkLocationMismatch(transaction, safeUserProfile),
    ROUND_NUMBER_PATTERN: checkRoundNumberPattern(transaction, safeRecentTxns),
    NEGATIVE_BALANCE_RISK: checkNegativeBalanceRisk(transaction, safeWallet)
  };

  // ============================================
  // CALCULATE TOTAL RISK SCORE (capped at 100)
  // ============================================

  let totalScore = 0;
  Object.values(ruleResults).forEach(result => {
    totalScore += result.weight;
  });

  // Cap at 100 and round to integer
  const riskScore = Math.min(100, Math.round(totalScore));

  // ============================================
  // BUILD HUMAN-READABLE REASONS
  // ============================================

  const reasons = [];

  // LARGE_AMOUNT
  if (ruleResults.LARGE_AMOUNT.matched) {
    const info = ruleResults.LARGE_AMOUNT.info;
    reasons.push({
      code: 'LARGE_AMOUNT',
      message: `Transaction amount (₹${info.amount.toLocaleString()}) exceeds safe threshold (₹${info.maxThreshold.toLocaleString()})`,
      weight: RULE_WEIGHTS.LARGE_AMOUNT
    });
  }

  // HIGH_RISK_CATEGORY
  if (ruleResults.HIGH_RISK_CATEGORY.matched) {
    const category = ruleResults.HIGH_RISK_CATEGORY.info.category;
    reasons.push({
      code: 'HIGH_RISK_CATEGORY',
      message: `High-risk category detected: ${category}`,
      weight: RULE_WEIGHTS.HIGH_RISK_CATEGORY
    });
  }

  // SUSPICIOUS_MERCHANT
  if (ruleResults.SUSPICIOUS_MERCHANT.matched) {
    const merchant = ruleResults.SUSPICIOUS_MERCHANT.info.merchant;
    reasons.push({
      code: 'SUSPICIOUS_MERCHANT',
      message: merchant ? `Suspicious or untrusted merchant: ${merchant}` : 'Merchant not in trusted list',
      weight: RULE_WEIGHTS.SUSPICIOUS_MERCHANT
    });
  }

  // FREQUENT_TXNS
  if (ruleResults.FREQUENT_TXNS.matched) {
    const info = ruleResults.FREQUENT_TXNS.info;
    const msg = info.triggers.tooManyDebits
      ? `Rapid transactions detected: ${info.debitCount} debits in ${info.windowMinutes} minutes`
      : `High transaction volume: ₹${info.debitSum.toLocaleString()} in ${info.windowMinutes} minutes`;
    reasons.push({
      code: 'FREQUENT_TXNS',
      message: msg,
      weight: RULE_WEIGHTS.FREQUENT_TXNS
    });
  }

  // LOCATION_MISMATCH
  if (ruleResults.LOCATION_MISMATCH.matched) {
    const info = ruleResults.LOCATION_MISMATCH.info;
    reasons.push({
      code: 'LOCATION_MISMATCH',
      message: `Transaction location (${info.txCountry}) differs from home country (${info.homeCountry})`,
      weight: RULE_WEIGHTS.LOCATION_MISMATCH
    });
  }

  // ROUND_NUMBER_PATTERN
  if (ruleResults.ROUND_NUMBER_PATTERN.matched) {
    const amount = ruleResults.ROUND_NUMBER_PATTERN.info.amount;
    reasons.push({
      code: 'ROUND_NUMBER_PATTERN',
      message: `Unusually round transaction amount: ₹${amount.toLocaleString()}`,
      weight: RULE_WEIGHTS.ROUND_NUMBER_PATTERN
    });
  }

  // NEGATIVE_BALANCE_RISK
  if (ruleResults.NEGATIVE_BALANCE_RISK.matched) {
    const info = ruleResults.NEGATIVE_BALANCE_RISK.info;
    reasons.push({
      code: 'NEGATIVE_BALANCE_RISK',
      message: `Insufficient funds: Transaction (₹${info.amount.toLocaleString()}) exceeds balance (₹${info.balance.toLocaleString()})`,
      weight: RULE_WEIGHTS.NEGATIVE_BALANCE_RISK
    });
  }

  // Sort reasons by weight (highest first)
  reasons.sort((a, b) => b.weight - a.weight);

  // ============================================
  // COMPUTE ADDITIONAL METRICS
  // ============================================

  const avgTxnAmount = calculateAvgTxnAmount(safeRecentTxns);
  const txnsInLastHour = getTransactionsInWindow(
    safeRecentTxns,
    60 * 60 * 1000, // 1 hour
    transaction.occurredAt || new Date()
  );
  const txnCountLastHour = txnsInLastHour.length;
  const txnSumLastHour = txnsInLastHour.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  // ============================================
  // RETURN COMPLETE RESULT
  // ============================================

  return {
    riskScore,
    reasons,
    details: {
      ruleBreakdown: ruleResults,
      computed: {
        avgTxnAmount: Math.round(avgTxnAmount),
        txnCountLastHour,
        txnSumLastHour: Math.round(txnSumLastHour)
      }
    }
  };
}

// ============================================
// SIMPLE FRAUD RISK FUNCTION (for expense controller)
// ============================================

/**
 * Compute fraud risk synchronously for expense controller
 * This is a simpler version that doesn't require wallet/recentTransactions
 * 
 * @param {Object} expense - Expense object with amount, category, date
 * @param {Array} recentTransactions - Optional recent transactions
 * @returns {Object} { riskScore, reasons, flagged }
 */
function computeFraudRisk(expense, recentTransactions = []) {
  const amount = Number(expense.amount) || 0;
  const category = (expense.category || '').toLowerCase().trim();
  const date = expense.date instanceof Date ? expense.date : new Date();

  let riskScore = 0;
  const reasons = [];

  // Rule 1: Large Amount (>₹50,000)
  if (amount > FRAUD_CONFIG.ABSOLUTE_THRESHOLD) {
    riskScore += RULE_WEIGHTS.LARGE_AMOUNT;
    reasons.push(`Large transaction amount: ₹${amount.toLocaleString()} (threshold: ₹${FRAUD_CONFIG.ABSOLUTE_THRESHOLD.toLocaleString()})`);
  }

  // Rule 2: High Risk Category
  if (FRAUD_CONFIG.HIGH_RISK_CATEGORIES.includes(category)) {
    riskScore += RULE_WEIGHTS.HIGH_RISK_CATEGORY;
    reasons.push(`High-risk category detected: ${category}`);
  }

  // Rule 3: Very Large Amount (>₹100,000)
  if (amount > 100000) {
    riskScore += 15;
    reasons.push(`Very large amount: ₹${amount.toLocaleString()} (>₹100,000)`);
  }

  // Rule 4: Unusual Time (11 PM - 5 AM)
  const hour = date.getHours();
  if (hour < 5 || hour >= 23) {
    riskScore += 10;
    reasons.push(`Transaction at unusual time: ${hour}:00 (late night/early morning)`);
  }

  // Rule 5: Round Number Pattern
  if (isRoundNumber(amount) && amount > 10000) {
    riskScore += RULE_WEIGHTS.ROUND_NUMBER_PATTERN;
    reasons.push(`Suspiciously round amount: ₹${amount.toLocaleString()}`);
  }

  // Rule 6: Frequent transactions check (if recent transactions provided)
  if (Array.isArray(recentTransactions) && recentTransactions.length >= 5) {
    const recentSum = recentTransactions.slice(0, 5).reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    if (amount > recentSum * 0.5) {
      riskScore += 10;
      reasons.push(`Amount exceeds 50% of recent 5 transaction total`);
    }
  }

  // Cap at 100
  riskScore = Math.min(100, riskScore);

  return {
    riskScore,
    reasons,
    flagged: riskScore >= FRAUD_CONFIG.FLAG_THRESHOLD
  };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  scoreTransaction,
  computeFraudRisk,
  FRAUD_CONFIG,
  RULE_WEIGHTS
};

// ============================================
// UNIT TEST CASES (for reference)
// ============================================

/**
 * TEST CASE 1: Large gambling transaction
 * 
 * Input:
 * {
 *   transaction: { 
 *     userId: 'user123',
 *     amount: 75000, 
 *     type: 'debit',
 *     category: 'gambling',
 *     occurredAt: new Date()
 *   },
 *   wallet: { balance: 50000, currency: 'INR' },
 *   recentTransactions: [],
 *   userProfile: { avgDailySpending: 2000, homeCountry: 'IN' }
 * }
 * 
 * Expected Output:
 * {
 *   riskScore: 100,
 *   reasons: [
 *     { code: 'LARGE_AMOUNT', message: '...', weight: 60 },
 *     { code: 'HIGH_RISK_CATEGORY', message: '...', weight: 40 },
 *     { code: 'NEGATIVE_BALANCE_RISK', message: '...', weight: 35 }
 *   ],
 *   details: { ... }
 * }
 * Note: Score capped at 100 even though total weights = 135
 */

/**
 * TEST CASE 2: Normal small transaction
 * 
 * Input:
 * {
 *   transaction: { 
 *     userId: 'user123',
 *     amount: 500, 
 *     type: 'debit',
 *     category: 'food',
 *     occurredAt: new Date()
 *   },
 *   wallet: { balance: 50000, currency: 'INR' },
 *   recentTransactions: [],
 *   userProfile: { avgDailySpending: 2000, homeCountry: 'IN' }
 * }
 * 
 * Expected Output:
 * {
 *   riskScore: 0,
 *   reasons: [],
 *   details: { 
 *     ruleBreakdown: { ... all matched: false },
 *     computed: { ... }
 *   }
 * }
 */

/**
 * TEST CASE 3: Rapid transactions from foreign location
 * 
 * Input:
 * {
 *   transaction: { 
 *     userId: 'user123',
 *     amount: 15000, 
 *     type: 'debit',
 *     category: 'shopping',
 *     location: { country: 'US' },
 *     occurredAt: new Date()
 *   },
 *   wallet: { balance: 100000, currency: 'INR' },
 *   recentTransactions: [
 *     { amount: 10000, type: 'debit', occurredAt: new Date(Date.now() - 5*60*1000) },
 *     { amount: 12000, type: 'debit', occurredAt: new Date(Date.now() - 7*60*1000) },
 *     { amount: 8000, type: 'debit', occurredAt: new Date(Date.now() - 9*60*1000) }
 *   ],
 *   userProfile: { avgDailySpending: 5000, homeCountry: 'IN' }
 * }
 * 
 * Expected Output:
 * {
 *   riskScore: 50,
 *   reasons: [
 *     { code: 'FREQUENT_TXNS', message: '...', weight: 25 },
 *     { code: 'LOCATION_MISMATCH', message: '...', weight: 25 }
 *   ],
 *   details: { ... }
 * }
 */