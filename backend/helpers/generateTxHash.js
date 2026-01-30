const crypto = require('crypto');

function generateTxHash(payload = '') {
  const nonce = crypto.randomBytes(16).toString('hex');
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const input = `${Date.now()}-${nonce}-${body}`;
  return crypto.createHash('sha256').update(input).digest('hex');
}

module.exports = { generateTxHash };
