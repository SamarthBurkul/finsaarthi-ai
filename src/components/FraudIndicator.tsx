import React from 'react';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';

/**
 * FraudIndicator Component
 * 
 * Compact component to show fraud risk inline with transactions
 * Can be embedded in existing transaction lists
 * 
 * Usage:
 * import FraudIndicator from './components/FraudIndicator';
 * 
 * <FraudIndicator 
 *   riskScore={75} 
 *   reasons={[{code: 'LARGE_AMOUNT', message: '...', weight: 60}]}
 * />
 */

interface FraudReason {
  code: string;
  message: string;
  weight?: number;
}

interface FraudIndicatorProps {
  riskScore?: number;
  reasons?: FraudReason[];
}

export const FraudIndicator: React.FC<FraudIndicatorProps> = ({ riskScore = 0, reasons = [] }) => {
  if (riskScore === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="text-xs font-medium">Safe</span>
      </div>
    );
  }

  const getBadgeStyle = () => {
    if (riskScore >= 75) return 'bg-red-100 text-red-800 border-red-200';
    if (riskScore >= 50) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (riskScore >= 25) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getIcon = () => {
    if (riskScore >= 50) return <AlertTriangle className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${getBadgeStyle()}`}>
        {getIcon()}
        <span>Risk: {riskScore}</span>
      </div>

      {reasons.length > 0 && (
        <div className="group relative">
          <button className="text-xs text-gray-500 hover:text-gray-700 underline">
            {reasons.length} flag{reasons.length > 1 ? 's' : ''}
          </button>

          {/* Tooltip */}
          <div className="hidden group-hover:block absolute z-10 w-80 p-3 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Risk Factors:</p>
            <div className="space-y-2">
              {reasons.map((reason, idx) => (
                <div key={idx} className="text-xs">
                  <span className="font-semibold text-gray-900">{reason.code}</span>
                  <p className="text-gray-600 mt-0.5">{reason.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example usage in existing TransactionList component:
 * 
 * const TransactionList = ({ transactions }) => {
 *   return (
 *     <div>
 *       {transactions.map(tx => (
 *         <div key={tx._id} className="border-b p-4">
 *           <div className="flex justify-between items-center">
 *             <div>
 *               <p className="font-medium">{tx.description}</p>
 *               <p className="text-sm text-gray-600">₹{tx.amount}</p>
 *             </div>
 *             
 *             <FraudIndicator 
 *               riskScore={tx.metadata?.fraud?.riskScore || 0}
 *               reasons={tx.metadata?.fraud?.reasons || []}
 *             />
 *           </div>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * };
 */

export default FraudIndicator;


/**
 * ========================================
 * INTEGRATION EXAMPLE: Update existing TransactionSimulator.tsx
 * ========================================
 */

/*
// Add this import at the top of your TransactionSimulator.tsx:
import FraudIndicator from './FraudIndicator';

// Then in your transaction list rendering, add the fraud indicator:

<div className="space-y-3">
  {transactions.map((tx) => (
    <div key={tx._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
              {tx.type === 'credit' ? '↑' : '↓'}
            </span>
            <div>
              <p className="font-semibold text-gray-900">{tx.description || 'Transaction'}</p>
              <p className="text-sm text-gray-600">{tx.category}</p>
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-4">
            <p className={`text-lg font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
              {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(tx.occurredAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Add fraud indicator here *\/}
        <div className="ml-4">
          <FraudIndicator 
            riskScore={tx.metadata?.fraud?.riskScore || 0}
            reasons={tx.metadata?.fraud?.reasons || []}
          />
        </div>
      </div>
    </div>
  ))}
</div>
*/


/**
 * ========================================
 * ALTERNATIVE: Fraud Alert Banner Component
 * ========================================
 * 
 * Show a prominent banner when creating a high-risk transaction
 */

interface Transaction {
  metadata?: {
    fraud?: {
      riskScore?: number;
      reasons?: FraudReason[];
    };
  };
}

interface FraudAlertBannerProps {
  transaction: Transaction;
}

export const FraudAlertBanner: React.FC<FraudAlertBannerProps> = ({ transaction }) => {
  const riskScore = transaction?.metadata?.fraud?.riskScore || 0;
  const reasons = transaction?.metadata?.fraud?.reasons || [];

  if (riskScore < 50) return null;

  return (
    <div className={`rounded-lg p-4 mb-4 ${riskScore >= 75
        ? 'bg-red-50 border-2 border-red-500'
        : 'bg-orange-50 border-2 border-orange-500'
      }`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-6 h-6 mt-0.5 ${riskScore >= 75 ? 'text-red-600' : 'text-orange-600'
          }`} />

        <div className="flex-1">
          <h4 className={`font-bold mb-1 ${riskScore >= 75 ? 'text-red-900' : 'text-orange-900'
            }`}>
            {riskScore >= 75 ? '🚨 High Risk Transaction Detected' : '⚠️ Transaction Flagged for Review'}
          </h4>

          <p className="text-sm text-gray-700 mb-2">
            This transaction has been flagged with a risk score of <span className="font-bold">{riskScore}</span>
          </p>

          {reasons.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold text-gray-600 uppercase">Risk Factors:</p>
              {reasons.map((reason, idx) => (
                <div key={idx} className="text-sm bg-white rounded px-3 py-2">
                  <span className="font-semibold text-gray-900">{reason.code}: </span>
                  <span className="text-gray-700">{reason.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button className="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50">
              Review Transaction
            </button>
            <button className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


/**
 * ========================================
 * Usage in Transaction Creation Response
 * ========================================
 * 
 * Show banner after creating a transaction if flagged:
 */

/*
const handleCreateTransaction = async (data) => {
  try {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Show success message
      setMessage(`Transaction successful!`);
      
      // If flagged, show alert banner
      if (result.fraud?.flagged) {
        setFlaggedTransaction(result.transaction);
        setShowFraudBanner(true);
      }
      
      // Refresh transactions
      fetchTransactions();
    }
  } catch (error) {
    console.error('Transaction error:', error);
  }
};

// In your JSX:
{showFraudBanner && flaggedTransaction && (
  <FraudAlertBanner transaction={flaggedTransaction} />
)}
*/
