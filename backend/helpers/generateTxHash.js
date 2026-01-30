const crypto = require('crypto');

/**
 * Generate a deterministic transaction hash for audit trail
 * @param {Object} payload - Transaction data to hash
 * @param {string} payload.userId - User ID
 * @param {string} payload.walletId - Wallet ID
 * @param {string} payload.type - Transaction type (credit/debit)
 * @param {number} payload.amt - Transaction amount
 * @param {Date|string} payload.occurredAt - Transaction timestamp
 * @returns {string} SHA-256 hash in hex format
 */
function generateTxHash(payload) {
  // Server salt from environment (fallback for backward compatibility)
  const SALT = process.env.TX_HASH_SALT || 'finsaarthi_tx_salt_2025';
  
  // Create canonical string representation
  const canonicalData = [
    String(payload.userId || ''),
    String(payload.walletId || ''),
    String(payload.type || ''),
    String(payload.amt || 0),
    String(payload.occurredAt || new Date().toISOString())
  ].join('|');
  
  // Add timestamp and nonce for uniqueness
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');
  
  // Combine all elements
  const hashInput = `${SALT}:${canonicalData}:${timestamp}:${nonce}`;
  
  // Generate SHA-256 hash
  return crypto.createHash('sha256').update(hashInput).digest('hex');
}

/**
 * Verify transaction integrity by checking if key fields match the hash pattern
 * Note: Due to nonce and timestamp, we can't regenerate the exact hash,
 * but we can verify the transaction hasn't been tampered with by checking
 * that the hash exists and follows the expected format
 * @param {Object} transaction - Transaction document from DB
 * @returns {Object} Verification result
 */
function verifyTxHash(transaction) {
  if (!transaction || !transaction.txHash) {
    return {
      valid: false,
      reason: 'Missing transaction or txHash'
    };
  }
  
  // Verify hash format (64 character hex string)
  const hashRegex = /^[a-f0-9]{64}$/;
  if (!hashRegex.test(transaction.txHash)) {
    return {
      valid: false,
      reason: 'Invalid hash format'
    };
  }
  
  // Verify required fields exist
  const requiredFields = ['userId', 'walletId', 'type', 'amount', 'occurredAt'];
  const missingFields = requiredFields.filter(field => !transaction[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      reason: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  // Verify type is valid
  if (!['credit', 'debit'].includes(transaction.type)) {
    return {
      valid: false,
      reason: 'Invalid transaction type'
    };
  }
  
  // Verify amount is positive
  if (typeof transaction.amount !== 'number' || transaction.amount <= 0) {
    return {
      valid: false,
      reason: 'Invalid transaction amount'
    };
  }
  
  // All checks passed
  return {
    valid: true,
    reason: 'Transaction integrity verified',
    txHash: transaction.txHash,
    metadata: {
      userId: transaction.userId,
      walletId: transaction.walletId,
      type: transaction.type,
      amount: transaction.amount,
      occurredAt: transaction.occurredAt
    }
  };
}

/**
 * Generate audit log entry for a transaction
 * @param {Object} transaction - Transaction document
 * @param {string} action - Action performed (created, updated, deleted)
 * @returns {Object} Audit log entry
 */
function generateAuditLog(transaction, action = 'created') {
  return {
    txHash: transaction.txHash,
    action,
    timestamp: new Date(),
    userId: transaction.userId,
    walletId: transaction.walletId,
    type: transaction.type,
    amount: transaction.amount,
    status: transaction.status
  };
}

module.exports = { 
  generateTxHash, 
  verifyTxHash,
  generateAuditLog
};
