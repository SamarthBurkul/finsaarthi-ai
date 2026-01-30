/**
 * Fraud Detection Test Suite
 * 
 * Run: node backend/test-fraud.js
 */

const { computeFraudRisk } = require("./utils/fraud");

console.log("\n" + "=".repeat(70));
console.log("FRAUD DETECTION ENGINE - TEST SUITE");
console.log("=".repeat(70) + "\n");

// Test 1: Large Amount
console.log("TEST 1: Large Amount Transaction");
console.log("-".repeat(70));
const test1 = computeFraudRisk({ amount: 75000, category: "Travel", date: new Date() }, []);
console.log(`Input: ₹75,000 | Travel`);
console.log(`Risk Score: ${test1.riskScore}/100`);
console.log(`Flagged: ${test1.flagged ? "✓ YES" : "✗ NO"}`);
console.log(`Reasons: ${test1.reasons.length > 0 ? test1.reasons.join(", ") : "None"}`);
console.log();

// Test 2: Crypto Category
console.log("TEST 2: Suspicious Category (Crypto)");
console.log("-".repeat(70));
const test2 = computeFraudRisk({ amount: 5000, category: "crypto", date: new Date() }, []);
console.log(`Input: ₹5,000 | Crypto`);
console.log(`Risk Score: ${test2.riskScore}/100`);
console.log(`Flagged: ${test2.flagged ? "✓ YES" : "✗ NO"}`);
console.log(`Reasons: ${test2.reasons.join(", ")}`);
console.log();

// Test 3: Rapid Transfers
console.log("TEST 3: Rapid Frequency Transfers");
console.log("-".repeat(70));
const now = new Date();
const recent = [
  { amount: 5000, expenseDate: new Date(now - 2 * 60 * 1000) },
  { amount: 3000, expenseDate: new Date(now - 4 * 60 * 1000) },
  { amount: 4000, expenseDate: new Date(now - 6 * 60 * 1000) },
];
const test3 = computeFraudRisk({ amount: 10000, category: "Travel", date: now }, recent);
console.log(`Input: ₹10,000 with 3 recent transactions`);
console.log(`Risk Score: ${test3.riskScore}/100`);
console.log(`Flagged: ${test3.flagged ? "✓ YES" : "✗ NO"}`);
console.log(`Reasons: ${test3.reasons.join(", ")}`);
console.log();

// Test 4: Very Large Amount
console.log("TEST 4: Very Large Amount (>₹1,00,000)");
console.log("-".repeat(70));
const test4 = computeFraudRisk({ amount: 150000, category: "Investment", date: new Date() }, []);
console.log(`Input: ₹1,50,000 | Investment`);
console.log(`Risk Score: ${test4.riskScore}/100`);
console.log(`Flagged: ${test4.flagged ? "✓ YES" : "✗ NO"}`);
console.log(`Reasons: ${test4.reasons.join(", ")}`);
console.log();

// Test 5: Unusual Time
console.log("TEST 5: Unusual Time (Late Night)");
console.log("-".repeat(70));
const lateNight = new Date();
lateNight.setHours(2, 30, 0);
const test5 = computeFraudRisk({ amount: 15000, category: "Shopping", date: lateNight }, []);
console.log(`Input: ₹15,000 | 2:30 AM`);
console.log(`Risk Score: ${test5.riskScore}/100`);
console.log(`Flagged: ${test5.flagged ? "✓ YES" : "✗ NO"}`);
console.log(`Reasons: ${test5.reasons.join(", ")}`);
console.log();

// Test 6: Safe Transaction
console.log("TEST 6: Safe Transaction");
console.log("-".repeat(70));
const test6 = computeFraudRisk({ amount: 500, category: "Food", date: new Date(new Date().setHours(14, 0)) }, []);
console.log(`Input: ₹500 | Food | 2:00 PM`);
console.log(`Risk Score: ${test6.riskScore}/100`);
console.log(`Flagged: ${test6.flagged ? "✓ YES" : "✗ NO"}`);
console.log(`Reasons: ${test6.reasons.length > 0 ? test6.reasons.join(", ") : "None - SAFE"}`);
console.log();

// Test 7: Complex Scenario
console.log("TEST 7: Complex Scenario (Multiple Rules Triggered)");
console.log("-".repeat(70));
const lateNight2 = new Date();
lateNight2.setHours(3, 0, 0);
const recent2 = [
  { amount: 35000, expenseDate: new Date(lateNight2 - 2 * 60 * 1000) },
  { amount: 40000, expenseDate: new Date(lateNight2 - 4 * 60 * 1000) },
  { amount: 30000, expenseDate: new Date(lateNight2 - 6 * 60 * 1000) },
];
const test7 = computeFraudRisk(
  { amount: 200000, category: "crypto", date: lateNight2 },
  recent2
);
console.log(`Input: ₹2,00,000 | Crypto | 3:00 AM (with recent high-value transfers)`);
console.log(`Risk Score: ${test7.riskScore}/100`);
console.log(`Flagged: ${test7.flagged ? "✓ YES - CRITICAL" : "✗ NO"}`);
console.log(`Reasons:`);
test7.reasons.forEach(r => console.log(`  • ${r}`));
console.log();

console.log("=".repeat(70));
console.log("TEST SUMMARY");
console.log("=".repeat(70));
const tests = [
  { name: "Large Amount", score: test1.riskScore, flagged: test1.flagged },
  { name: "Crypto Category", score: test2.riskScore, flagged: test2.flagged },
  { name: "Rapid Transfers", score: test3.riskScore, flagged: test3.flagged },
  { name: "Very Large Amount", score: test4.riskScore, flagged: test4.flagged },
  { name: "Unusual Time", score: test5.riskScore, flagged: test5.flagged },
  { name: "Safe Transaction", score: test6.riskScore, flagged: test6.flagged },
  { name: "Complex Scenario", score: test7.riskScore, flagged: test7.flagged },
];

console.log("\n");
tests.forEach(t => {
  console.log(`${t.name.padEnd(25)} | Score: ${String(t.score).padStart(3)}/100 | Flagged: ${t.flagged ? "YES" : "NO"}`);
});
console.log("\n" + "=".repeat(70) + "\n");
