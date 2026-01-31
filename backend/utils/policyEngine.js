/**
 * Policy Analysis Engine for FinSaarthi
 * 
 * Analyzes transactions and attaches policy information:
 * - Refund eligibility
 * - Legal compliance notices
 * - Context-aware disclaimers
 * - Consultation recommendations
 * 
 * @module policyEngine
 */

const {
  REFUND_POLICIES,
  LEGAL_THRESHOLDS,
  DISCLAIMERS,
  CONSULTATION_TRIGGERS
} = require('../config/policies');

/**
 * Main policy analysis function
 * 
 * @param {Object} transaction - Transaction object with amount, category, etc.
 * @param {Object} fraudAnalysis - Fraud detection results (optional)
 * @returns {Object} Policy information object
 */
function analyzePolicies(transaction, fraudAnalysis = null) {
  const amount = Number(transaction.amount) || 0;
  const category = (transaction.category || 'general').toLowerCase();
  const riskScore = fraudAnalysis?.riskScore || 0;

  // 1. Refund Policy
  const refundPolicy = getRefundPolicy(category);

  // 2. Legal Notices
  const legalNotices = checkLegalCompliance(amount, category);

  // 3. Disclaimers
  const disclaimers = getApplicableDisclaimers(amount, category);

  // 4. Consultation Recommendations
  const consultations = getConsultationAdvice(amount, category, riskScore);

  return {
    refundPolicy,
    legalNotices,
    disclaimers,
    consultations
  };
}

/**
 * Get refund policy for a category
 * 
 * @param {string} category - Transaction category
 * @returns {Object} Refund policy details
 */
function getRefundPolicy(category) {
  const categoryKey = category.toLowerCase();
  const policy = REFUND_POLICIES[categoryKey] || REFUND_POLICIES['general'];

  return {
    category,
    eligible: policy.eligible,
    window: policy.window || 'N/A',
    conditions: policy.conditions || [],
    note: policy.note || '',
    reason: policy.reason || null,
    alternatives: policy.alternatives || [],
    legalNote: policy.legalNote || null,
    warning: policy.warning || null
  };
}

/**
 * Check legal compliance requirements
 * 
 * @param {number} amount - Transaction amount
 * @param {string} category - Transaction category
 * @returns {Array} Legal notices
 */
function checkLegalCompliance(amount, category) {
  const notices = [];

  // PAN requirement
  if (amount >= LEGAL_THRESHOLDS.PAN_REQUIRED.amount) {
    notices.push({
      type: 'PAN_REQUIRED',
      severity: 'medium',
      message: LEGAL_THRESHOLDS.PAN_REQUIRED.notice,
      regulation: LEGAL_THRESHOLDS.PAN_REQUIRED.regulation,
      action: LEGAL_THRESHOLDS.PAN_REQUIRED.action
    });
  }

  // PMLA reporting
  if (amount >= LEGAL_THRESHOLDS.PMLA_REPORTING.amount) {
    notices.push({
      type: 'PMLA_REPORTING',
      severity: 'high',
      message: LEGAL_THRESHOLDS.PMLA_REPORTING.notice,
      regulation: LEGAL_THRESHOLDS.PMLA_REPORTING.regulation,
      action: LEGAL_THRESHOLDS.PMLA_REPORTING.action
    });
  }

  // High-risk category warnings
  const highRiskCategories = ['crypto', 'gambling', 'betting', 'casino', 'lottery'];
  if (highRiskCategories.includes(category)) {
    notices.push({
      type: 'HIGH_RISK_CATEGORY',
      severity: 'high',
      message: `${category.charAt(0).toUpperCase() + category.slice(1)} transactions carry legal and financial risks`,
      regulation: 'Various Indian regulations restrict/prohibit this activity',
      action: 'Verify legality before proceeding with real transactions'
    });
  }

  // Investment category
  if (category === 'investment') {
    notices.push({
      type: 'INVESTMENT_RISK',
      severity: 'medium',
      message: 'Investment products are subject to market risks',
      regulation: 'SEBI (Securities and Exchange Board of India) regulations',
      action: 'Read all scheme-related documents carefully'
    });
  }

  return notices;
}

/**
 * Get applicable disclaimers
 * 
 * @param {number} amount - Transaction amount
 * @param {string} category - Transaction category
 * @returns {Array} Disclaimer texts
 */
function getApplicableDisclaimers(amount, category) {
  const disclaimers = [];

  // Always include global disclaimer
  disclaimers.push({
    type: 'GLOBAL',
    text: DISCLAIMERS.GLOBAL
  });

  // High-value disclaimer
  if (amount >= 50000) {
    disclaimers.push({
      type: 'HIGH_VALUE',
      text: DISCLAIMERS.HIGH_VALUE
    });
  }

  // Category-specific disclaimers
  if (category === 'investment') {
    disclaimers.push({
      type: 'INVESTMENT',
      text: DISCLAIMERS.INVESTMENT
    });
  }

  if (category === 'crypto') {
    disclaimers.push({
      type: 'CRYPTO',
      text: DISCLAIMERS.CRYPTO
    });
  }

  if (['gambling', 'betting', 'casino', 'lottery'].includes(category)) {
    disclaimers.push({
      type: 'GAMBLING',
      text: DISCLAIMERS.GAMBLING
    });
  }

  // Refund simulation disclaimer
  disclaimers.push({
    type: 'REFUND_SIMULATION',
    text: DISCLAIMERS.REFUND_SIMULATION
  });

  return disclaimers;
}

/**
 * Get consultation recommendations
 * 
 * @param {number} amount - Transaction amount
 * @param {string} category - Transaction category
 * @param {number} riskScore - Fraud risk score
 * @returns {Array} Consultation recommendations
 */
function getConsultationAdvice(amount, category, riskScore) {
  const consultations = [];

  // Financial Advisor
  const faConditions = CONSULTATION_TRIGGERS.FINANCIAL_ADVISOR.conditions;
  for (const condition of faConditions) {
    if (condition.type === 'amount' && amount >= condition.threshold) {
      consultations.push({
        type: 'FINANCIAL_ADVISOR',
        priority: 'medium',
        message: condition.message,
        helpline: CONSULTATION_TRIGGERS.FINANCIAL_ADVISOR.helpline,
        info: CONSULTATION_TRIGGERS.FINANCIAL_ADVISOR.info
      });
      break;
    }
    if (condition.type === 'category' && condition.values.includes(category)) {
      consultations.push({
        type: 'FINANCIAL_ADVISOR',
        priority: 'medium',
        message: condition.message,
        helpline: CONSULTATION_TRIGGERS.FINANCIAL_ADVISOR.helpline,
        info: CONSULTATION_TRIGGERS.FINANCIAL_ADVISOR.info
      });
      break;
    }
  }

  // Legal Consultation
  const legalConditions = CONSULTATION_TRIGGERS.LEGAL_CONSULTATION.conditions;
  for (const condition of legalConditions) {
    if (condition.type === 'category' && condition.values.includes(category)) {
      consultations.push({
        type: 'LEGAL_CONSULTATION',
        priority: 'high',
        message: condition.message,
        helpline: CONSULTATION_TRIGGERS.LEGAL_CONSULTATION.helpline,
        info: CONSULTATION_TRIGGERS.LEGAL_CONSULTATION.info
      });
      break;
    }
    if (condition.type === 'amount' && amount >= condition.threshold) {
      consultations.push({
        type: 'LEGAL_CONSULTATION',
        priority: 'medium',
        message: condition.message,
        helpline: CONSULTATION_TRIGGERS.LEGAL_CONSULTATION.helpline,
        info: CONSULTATION_TRIGGERS.LEGAL_CONSULTATION.info
      });
      break;
    }
  }

  // Fraud Expert
  if (riskScore >= 70) {
    const fraudCondition = CONSULTATION_TRIGGERS.FRAUD_EXPERT.conditions[0];
    consultations.push({
      type: 'FRAUD_EXPERT',
      priority: 'high',
      message: fraudCondition.message,
      helpline: CONSULTATION_TRIGGERS.FRAUD_EXPERT.helpline,
      info: CONSULTATION_TRIGGERS.FRAUD_EXPERT.info
    });
  }

  // Tax Advisor
  if (amount >= 200000) {
    const taxCondition = CONSULTATION_TRIGGERS.TAX_ADVISOR.conditions[0];
    consultations.push({
      type: 'TAX_ADVISOR',
      priority: 'medium',
      message: taxCondition.message,
      helpline: CONSULTATION_TRIGGERS.TAX_ADVISOR.helpline,
      info: CONSULTATION_TRIGGERS.TAX_ADVISOR.info
    });
  }

  return consultations;
}

/**
 * Get a simplified risk badge for minimal UI display
 * 
 * @param {number} riskScore - Fraud risk score
 * @param {Object} policyInfo - Policy analysis result
 * @returns {Object} Badge information
 */
function getRiskBadge(riskScore, policyInfo) {
  const hasHighRiskNotices = policyInfo.legalNotices.some(n => n.severity === 'high');
  const hasHighPriorityConsultation = policyInfo.consultations.some(c => c.priority === 'high');

  let level = 'safe';
  let color = 'green';
  let icon = '🟢';

  if (riskScore >= 70 || hasHighRiskNotices || hasHighPriorityConsultation) {
    level = 'high-risk';
    color = 'red';
    icon = '🔴';
  } else if (riskScore >= 40 || policyInfo.legalNotices.length > 0) {
    level = 'review';
    color = 'yellow';
    icon = '🟡';
  }

  return {
    level,
    color,
    icon,
    text: level === 'safe' ? 'Safe' : level === 'review' ? 'Review' : 'High Risk',
    action: level === 'safe' ? null : 'View details in Wallet for more information'
  };
}

module.exports = {
  analyzePolicies,
  getRefundPolicy,
  checkLegalCompliance,
  getApplicableDisclaimers,
  getConsultationAdvice,
  getRiskBadge
};
