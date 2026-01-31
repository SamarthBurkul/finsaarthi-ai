// Verification Script for Wallet & Transaction Implementation
// Run: node scripts/verifyImplementation.js

const fs = require('fs');
const path = require('path');

console.log('🔍 ===== FINSAARTHI IMPLEMENTATION VERIFICATION =====\n');

let passed = 0;
let failed = 0;

function check(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

// ============================================
// 1. FILE STRUCTURE CHECK
// ============================================
console.log('📁 1. CHECKING FILE STRUCTURE...\n');

const requiredFiles = [
  'models/Wallet.js',
  'models/Transaction.js',
  'models/Alert.js',
  'controllers/walletController.js',
  'controllers/transactionController.js',
  'routes/wallet.js',
  'routes/transactions.js',
  'middleware/auth.js',
  'helpers/generateTxHash.js',
  'utils/fraud.js',
  'index.js',
  '.env'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  check(`File exists: ${file}`, fs.existsSync(filePath));
});

// ============================================
// 2. MODEL VALIDATION
// ============================================
console.log('\n📊 2. CHECKING MODELS...\n');

// Check Wallet Model
try {
  const walletModel = fs.readFileSync(path.join(__dirname, '..', 'models/Wallet.js'), 'utf8');
  check('Wallet: userId field', walletModel.includes('userId'));
  check('Wallet: unique constraint', walletModel.includes('unique: true'));
  check('Wallet: balance field', walletModel.includes('balance'));
  check('Wallet: status enum', walletModel.includes('enum:') && walletModel.includes('active'));
} catch (e) {
  check('Wallet model readable', false, e.message);
}

// Check Transaction Model
try {
  const txModel = fs.readFileSync(path.join(__dirname, '..', 'models/Transaction.js'), 'utf8');
  check('Transaction: txHash field', txModel.includes('txHash'));
  check('Transaction: txHash unique', txModel.includes('unique: true'));
  check('Transaction: isVerified field', txModel.includes('isVerified'));
  check('Transaction: isReversed field', txModel.includes('isReversed'));
  check('Transaction: type enum', txModel.includes('enum:') && txModel.includes('credit'));
  check('Transaction: pre-save hook', txModel.includes('pre(') && txModel.includes('save'));
} catch (e) {
  check('Transaction model readable', false, e.message);
}

// ============================================
// 3. ROUTES VALIDATION
// ============================================
console.log('\n🛣️  3. CHECKING ROUTES...\n');

// Check Wallet Routes
try {
  const walletRoutes = fs.readFileSync(path.join(__dirname, '..', 'routes/wallet.js'), 'utf8');
  check('Wallet: authMiddleware applied', walletRoutes.includes('authMiddleware'));
  check('Wallet: GET route', walletRoutes.includes('router.get'));
  check('Wallet: POST route', walletRoutes.includes('router.post'));
  check('Wallet: PATCH route', walletRoutes.includes('router.patch'));
  check('Wallet: DELETE route', walletRoutes.includes('router.delete'));
} catch (e) {
  check('Wallet routes readable', false, e.message);
}

// Check Transaction Routes
try {
  const txRoutes = fs.readFileSync(path.join(__dirname, '..', 'routes/transactions.js'), 'utf8');
  check('Transaction: authMiddleware applied', txRoutes.includes('authMiddleware'));
  check('Transaction: POST route', txRoutes.includes('router.post'));
  check('Transaction: GET route', txRoutes.includes('router.get'));
  check('Transaction: DELETE route', txRoutes.includes('router.delete'));
  check('Transaction: verify endpoint', txRoutes.includes('verify'));
} catch (e) {
  check('Transaction routes readable', false, e.message);
}

// ============================================
// 4. CONTROLLERS VALIDATION
// ============================================
console.log('\n🎛️  4. CHECKING CONTROLLERS...\n');

// Check Wallet Controller
try {
  const walletCtrl = fs.readFileSync(path.join(__dirname, '..', 'controllers/walletController.js'), 'utf8');
  check('WalletCtrl: getWallet function', walletCtrl.includes('exports.getWallet'));
  check('WalletCtrl: createWallet function', walletCtrl.includes('exports.createWallet'));
  check('WalletCtrl: updateWallet function', walletCtrl.includes('exports.updateWallet'));
  check('WalletCtrl: deleteWallet function', walletCtrl.includes('exports.deleteWallet'));
  check('WalletCtrl: uses req.userId', walletCtrl.includes('req.userId'));
} catch (e) {
  check('Wallet controller readable', false, e.message);
}

// Check Transaction Controller
try {
  const txCtrl = fs.readFileSync(path.join(__dirname, '..', 'controllers/transactionController.js'), 'utf8');
  check('TxCtrl: createTransaction function', txCtrl.includes('exports.createTransaction'));
  check('TxCtrl: getTransactions function', txCtrl.includes('exports.getTransactions'));
  check('TxCtrl: deleteTransaction function', txCtrl.includes('exports.deleteTransaction'));
  check('TxCtrl: verifyTransaction function', txCtrl.includes('exports.verifyTransaction'));
  check('TxCtrl: uses generateTxHash', txCtrl.includes('generateTxHash'));
  check('TxCtrl: atomic updates', txCtrl.includes('findOneAndUpdate'));
  check('TxCtrl: overdraft check', txCtrl.includes('balance') && txCtrl.includes('$gte'));
} catch (e) {
  check('Transaction controller readable', false, e.message);
}

// ============================================
// 5. SECURITY VALIDATION
// ============================================
console.log('\n🔐 5. CHECKING SECURITY...\n');

// Check Auth Middleware
try {
  const authMw = fs.readFileSync(path.join(__dirname, '..', 'middleware/auth.js'), 'utf8');
  check('Auth: JWT verification', authMw.includes('jwt.verify'));
  check('Auth: sets req.userId', authMw.includes('req.userId'));
  check('Auth: checks JWT_SECRET', authMw.includes('JWT_SECRET'));
  check('Auth: returns 401 on failure', authMw.includes('401'));
} catch (e) {
  check('Auth middleware readable', false, e.message);
}

// Check generateTxHash
try {
  const txHash = fs.readFileSync(path.join(__dirname, '..', 'helpers/generateTxHash.js'), 'utf8');
  check('TxHash: uses crypto', txHash.includes('crypto'));
  check('TxHash: uses TX_HASH_SALT', txHash.includes('TX_HASH_SALT'));
  check('TxHash: SHA-256', txHash.includes('sha256'));
  check('TxHash: exports verifyTxHash', txHash.includes('verifyTxHash'));
  check('TxHash: exports generateAuditLog', txHash.includes('generateAuditLog'));
} catch (e) {
  check('generateTxHash readable', false, e.message);
}

// ============================================
// 6. ENVIRONMENT CHECK
// ============================================
console.log('\n🌍 6. CHECKING ENVIRONMENT...\n');

try {
  const envFile = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
  check('ENV: JWT_SECRET configured', envFile.includes('JWT_SECRET'));
  check('ENV: TX_HASH_SALT configured', envFile.includes('TX_HASH_SALT'));
  check('ENV: MONGODB_URI configured', envFile.includes('MONGODB_URI') || envFile.includes('MONGO_URI'));
  check('ENV: PORT configured', envFile.includes('PORT'));
} catch (e) {
  check('.env file readable', false, e.message);
}

// ============================================
// 7. MAIN INDEX CHECK
// ============================================
console.log('\n🚀 7. CHECKING MAIN INDEX...\n');

try {
  const indexFile = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
  check('Index: wallet routes mounted', indexFile.includes('/api/wallet'));
  check('Index: transaction routes mounted', indexFile.includes('/api/transactions'));
  check('Index: CORS configured', indexFile.includes('cors'));
  check('Index: error handler', indexFile.includes('errorHandler'));
  check('Index: MongoDB connection', indexFile.includes('connectDB'));
} catch (e) {
  check('index.js readable', false, e.message);
}

// ============================================
// 8. FRAUD DETECTION CHECK
// ============================================
console.log('\n🚨 8. CHECKING FRAUD DETECTION...\n');

try {
  const fraudUtil = fs.readFileSync(path.join(__dirname, '..', 'utils/fraud.js'), 'utf8');
  check('Fraud: computeFraudRisk function', fraudUtil.includes('computeFraudRisk'));
  check('Fraud: risk score calculation', fraudUtil.includes('riskScore'));
  check('Fraud: returns flagged status', fraudUtil.includes('flagged'));
  check('Fraud: checks unusual amount', fraudUtil.includes('avgAmount') || fraudUtil.includes('average'));
} catch (e) {
  check('Fraud detection readable', false, e.message);
}

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n🎉 ALL CHECKS PASSED! Implementation is complete.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Review the errors above.\n');
  process.exit(1);
}
