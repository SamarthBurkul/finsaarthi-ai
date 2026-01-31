/**
 * Policy Configuration for FinSaarthi
 * 
 * Centralized policy rules for:
 * - Refund policies by category
 * - Legal & compliance thresholds
 * - Disclaimers
 * - Consultation recommendations
 * 
 * @module policies
 */

// ============================================
// REFUND POLICIES BY CATEGORY
// ============================================

const REFUND_POLICIES = {
  // Consumables & Services
  'Food': {
    eligible: true,
    window: '1 hour',
    conditions: ['Quality issues only', 'Not consumed', 'Photo evidence required'],
    note: 'Restaurant policy varies. Delivery apps: Follow platform T&C'
  },
  
  'food': {
    eligible: true,
    window: '1 hour',
    conditions: ['Quality issues only', 'Not consumed', 'Photo evidence required'],
    note: 'Restaurant policy varies. Delivery apps: Follow platform T&C'
  },

  // Travel & Transportation
  'Travel': {
    eligible: 'partial',
    window: 'Provider-dependent',
    conditions: ['Flight: As per airline policy', 'Cab: Cancel before pickup', 'Train: Before chart', 'Metro: Non-refundable'],
    note: 'Earlier cancellation = higher refund percentage'
  },
  
  'travel': {
    eligible: 'partial',
    window: 'Provider-dependent',
    conditions: ['Flight: As per airline policy', 'Cab: Cancel before pickup', 'Train: Before chart', 'Metro: Non-refundable'],
    note: 'Earlier cancellation = higher refund percentage'
  },

  // Retail & E-commerce
  'Shopping': {
    eligible: true,
    window: '7 days',
    conditions: ['Unopened packaging', 'Original tags attached', 'No damage', 'Receipt required'],
    note: 'Return shipping may apply. Electronics: 14-day window'
  },
  
  'shopping': {
    eligible: true,
    window: '7 days',
    conditions: ['Unopened packaging', 'Original tags attached', 'No damage', 'Receipt required'],
    note: 'Return shipping may apply. Electronics: 14-day window'
  },

  // Education
  'Education': {
    eligible: true,
    window: '14 days',
    conditions: ['Course < 10% completed', 'No certificate downloaded', 'Within cooling-off period'],
    note: 'Exam fees: Non-refundable after registration closes'
  },
  
  'education': {
    eligible: true,
    window: '14 days',
    conditions: ['Course < 10% completed', 'No certificate downloaded', 'Within cooling-off period'],
    note: 'Exam fees: Non-refundable after registration closes'
  },

  // Non-refundable
  'Bills': {
    eligible: false,
    reason: 'Utility services already consumed',
    alternatives: ['Dispute with provider for incorrect charges', 'Request adjustment on next bill'],
    note: 'Prepaid recharges: Check provider terms'
  },
  
  'bills': {
    eligible: false,
    reason: 'Utility services already consumed',
    alternatives: ['Dispute with provider for incorrect charges', 'Request adjustment on next bill'],
    note: 'Prepaid recharges: Check provider terms'
  },

  'Family': {
    eligible: 'depends',
    window: 'Varies by purchase type',
    conditions: ['Follows refund policy of specific purchase'],
    note: 'Gifts, services, medical: Check individual merchant policy'
  },
  
  'family': {
    eligible: 'depends',
    window: 'Varies by purchase type',
    conditions: ['Follows refund policy of specific purchase'],
    note: 'Gifts, services, medical: Check individual merchant policy'
  },

  'Entertainment': {
    eligible: true,
    window: '24 hours before event',
    conditions: ['Movie/concert: Not yet attended', 'Subscription: Within 7 days if unused'],
    note: 'Cancellation fee may apply (10-20%)'
  },
  
  'entertainment': {
    eligible: true,
    window: '24 hours before event',
    conditions: ['Movie/concert: Not yet attended', 'Subscription: Within 7 days if unused'],
    note: 'Cancellation fee may apply (10-20%)'
  },

  'Healthcare': {
    eligible: 'limited',
    window: '24-48 hours notice',
    conditions: ['Appointment cancellation before scheduled time', 'Medicines: Unopened only', 'Tests: Before sample collection'],
    note: 'Services rendered: Non-refundable'
  },
  
  'healthcare': {
    eligible: 'limited',
    window: '24-48 hours notice',
    conditions: ['Appointment cancellation before scheduled time', 'Medicines: Unopened only', 'Tests: Before sample collection'],
    note: 'Services rendered: Non-refundable'
  },

  'Fitness': {
    eligible: true,
    window: '7-30 days',
    conditions: ['Gym: Within trial period', 'Equipment: Unused with packaging', 'Classes: Before session starts'],
    note: 'Pro-rated refund for unused membership period'
  },
  
  'fitness': {
    eligible: true,
    window: '7-30 days',
    conditions: ['Gym: Within trial period', 'Equipment: Unused with packaging', 'Classes: Before session starts'],
    note: 'Pro-rated refund for unused membership period'
  },

  // High-risk categories
  'Investment': {
    eligible: false,
    reason: 'Market-linked products',
    alternatives: ['Redemption at current market value', 'Exit load may apply', 'Insurance: 15-day free look period'],
    note: 'Not a refund - subject to NAV/market rates'
  },
  
  'investment': {
    eligible: false,
    reason: 'Market-linked products',
    alternatives: ['Redemption at current market value', 'Exit load may apply', 'Insurance: 15-day free look period'],
    note: 'Not a refund - subject to NAV/market rates'
  },

  'crypto': {
    eligible: false,
    reason: 'Cryptocurrency exchanges have no-refund policy',
    legalNote: 'Crypto not legal tender in India',
    warning: 'High volatility. Price changes not refundable'
  },

  'gambling': {
    eligible: false,
    reason: 'Legally non-refundable',
    legalNote: 'Online gambling illegal in most Indian states',
    warning: 'High fraud risk. May be blocked by RBI'
  },

  'casino': {
    eligible: false,
    reason: 'Gambling transactions are final',
    legalNote: 'Physical casinos: Goa/Sikkim only'
  },

  'betting': {
    eligible: false,
    reason: 'Wagers placed are non-refundable',
    legalNote: 'Sports betting illegal in India (except horse racing)'
  },

  'lottery': {
    eligible: false,
    reason: 'Ticket purchase is final',
    legalNote: 'Only state-authorized lotteries legal'
  },

  'Insurance': {
    eligible: true,
    window: '15 days (free look period)',
    conditions: ['New policy only', 'No claims made', 'Submit cancellation request'],
    note: 'After 15 days: Surrender value only'
  },
  
  'insurance': {
    eligible: true,
    window: '15 days (free look period)',
    conditions: ['New policy only', 'No claims made', 'Submit cancellation request'],
    note: 'After 15 days: Surrender value only'
  },

  'Fuel': {
    eligible: false,
    reason: 'Consumable product delivered',
    alternatives: ['Quality issue: Contact pump manager'],
    note: 'Wrong fuel filled: Consumer liability'
  },
  
  'fuel': {
    eligible: false,
    reason: 'Consumable product delivered',
    alternatives: ['Quality issue: Contact pump manager'],
    note: 'Wrong fuel filled: Consumer liability'
  },

  'Other': {
    eligible: 'depends',
    window: 'Check merchant terms',
    conditions: ['Consumer Protection Act 2019 applies'],
    note: 'National Consumer Helpline: 1800-11-4000'
  },
  
  'other': {
    eligible: 'depends',
    window: 'Check merchant terms',
    conditions: ['Consumer Protection Act 2019 applies'],
    note: 'National Consumer Helpline: 1800-11-4000'
  },

  'Others': {
    eligible: 'depends',
    window: 'Check merchant terms',
    conditions: ['Consumer Protection Act 2019 applies'],
    note: 'National Consumer Helpline: 1800-11-4000'
  },

  'others': {
    eligible: 'depends',
    window: 'Check merchant terms',
    conditions: ['Consumer Protection Act 2019 applies'],
    note: 'National Consumer Helpline: 1800-11-4000'
  },

  // Default for unrecognized categories
  'general': {
    eligible: 'depends',
    window: 'Check merchant/provider terms',
    conditions: ['Consumer Protection Act 2019 applies'],
    note: 'Contact merchant for specific refund policy'
  }
};

// ============================================
// LEGAL & COMPLIANCE THRESHOLDS
// ============================================

const LEGAL_THRESHOLDS = {
  PAN_REQUIRED: {
    amount: 50000,
    notice: 'PAN documentation required for transactions ≥ ₹50,000',
    regulation: 'Income Tax Act, 1961 - Section 139A',
    action: 'Ensure PAN is linked to your account'
  },

  PMLA_REPORTING: {
    amount: 200000,
    notice: 'High-value transaction requiring compliance verification',
    regulation: 'Prevention of Money Laundering Act (PMLA), 2002',
    action: 'Additional KYC verification may be required'
  },

  CASH_TRANSACTION_LIMIT: {
    amount: 200000,
    notice: 'Cash transactions above ₹2,00,000 require reporting',
    regulation: 'Income Tax Act - Section 269ST',
    action: 'Use digital payment methods for large transactions'
  },

  FEMA_FOREIGN: {
    amount: 25000,
    notice: 'Foreign transactions may require FEMA compliance',
    regulation: 'Foreign Exchange Management Act (FEMA), 1999',
    action: 'Verify cross-border transaction regulations'
  }
};

// ============================================
// DISCLAIMERS
// ============================================

const DISCLAIMERS = {
  GLOBAL: 'FinSaarthi is a financial education and simulation platform. All transactions are virtual and non-monetary. This is not financial, legal, or investment advice.',

  HIGH_VALUE: 'This is a simulated high-value transaction for educational purposes. Real transactions of this nature require proper documentation and compliance verification.',

  INVESTMENT: 'Investment simulations are for learning only. Real investments carry market risk. Past performance is not indicative of future results. Consult a SEBI-registered advisor for actual investments.',

  CRYPTO: 'Cryptocurrency simulation for educational purposes only. Crypto assets are highly volatile and not recognized as legal tender in India. Real crypto trading carries significant risk.',

  GAMBLING: 'Gambling/betting simulation for educational awareness. Online gambling is illegal in most Indian states. This platform does not facilitate real gambling transactions.',

  REFUND_SIMULATION: 'Refund policies shown are educational references based on common merchant practices. Actual refund eligibility depends on specific merchant/service provider terms and conditions.'
};

// ============================================
// CONSULTATION RECOMMENDATIONS
// ============================================

const CONSULTATION_TRIGGERS = {
  FINANCIAL_ADVISOR: {
    conditions: [
      { type: 'amount', threshold: 100000, message: 'Consider consulting a financial advisor for large transactions' },
      { type: 'category', values: ['investment', 'Investment'], message: 'Consult a SEBI-registered investment advisor' }
    ],
    helpline: 'SEBI Investor Helpline: 1800-266-7575',
    info: 'Professional guidance recommended for significant financial decisions'
  },

  LEGAL_CONSULTATION: {
    conditions: [
      { type: 'category', values: ['gambling', 'crypto', 'betting', 'casino'], message: 'Legal consultation recommended for regulatory compliance' },
      { type: 'amount', threshold: 500000, message: 'High-value transaction - consider legal review' }
    ],
    helpline: 'Legal Services Authority: 15100',
    info: 'Understand legal implications before proceeding'
  },

  FRAUD_EXPERT: {
    conditions: [
      { type: 'riskScore', threshold: 70, message: 'High fraud risk detected - review transaction carefully' }
    ],
    helpline: 'Cyber Crime Helpline: 1930',
    info: 'Report suspicious activity to authorities'
  },

  TAX_ADVISOR: {
    conditions: [
      { type: 'amount', threshold: 200000, message: 'Transaction may have tax implications' }
    ],
    helpline: 'Income Tax Helpline: 1800-180-1961',
    info: 'Understand tax implications of large transactions'
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  REFUND_POLICIES,
  LEGAL_THRESHOLDS,
  DISCLAIMERS,
  CONSULTATION_TRIGGERS
};
