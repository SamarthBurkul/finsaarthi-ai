import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, TrendingUp, Activity } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * FraudAlertsDashboard Component
 * 
 * Displays fraud alerts and risk scores for transactions
 * Shows real-time risk monitoring
 * 
 * Usage:
 * import FraudAlertsDashboard from './components/FraudAlertsDashboard';
 * <FraudAlertsDashboard />
 */

interface FraudReason {
  code: string;
  message: string;
  weight?: number;
}

interface FraudData {
  riskScore: number;
  flagged?: boolean;
  reasons?: FraudReason[];
}

interface Transaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  category: string;
  occurredAt: string;
  metadata?: {
    fraud?: FraudData;
  };
}

interface Alert {
  _id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: string;
  metadata?: {
    riskScore?: number;
    transactionAmount?: number;
  };
}

const FraudAlertsDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'flagged'>('all');

  // Fetch alerts and transactions
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      // Fetch alerts
      const alertsRes = await fetch(`${API_BASE_URL}/transactions/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const alertsData = await alertsRes.json();

      // Fetch transactions
      const txRes = await fetch(`${API_BASE_URL}/transactions?limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const txData = await txRes.json();

      setAlerts(alertsData.alerts || []);
      setTransactions(txData.transactions || []);
    } catch (error) {
      console.error('Error fetching fraud data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get risk badge color
  const getRiskBadge = (score: number) => {
    if (score >= 75) return { color: 'bg-red-500', text: 'Critical', icon: '🚨' };
    if (score >= 50) return { color: 'bg-orange-500', text: 'High', icon: '⚠️' };
    if (score >= 25) return { color: 'bg-yellow-500', text: 'Medium', icon: '⚡' };
    return { color: 'bg-green-500', text: 'Low', icon: '✅' };
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const riskScore = tx.metadata?.fraud?.riskScore || 0;
    const isFlagged = tx.metadata?.fraud?.flagged || false;

    if (filter === 'all') return true;
    if (filter === 'flagged') return isFlagged;
    if (filter === 'high') return riskScore >= 50;
    if (filter === 'medium') return riskScore >= 25 && riskScore < 50;
    return true;
  });

  // Calculate stats
  const stats = {
    totalAlerts: alerts.length,
    highRisk: transactions.filter(tx => (tx.metadata?.fraud?.riskScore || 0) >= 75).length,
    flaggedToday: alerts.filter(a => {
      const today = new Date().toDateString();
      return new Date(a.createdAt).toDateString() === today;
    }).length,
    avgRiskScore: transactions.reduce((sum, tx) => sum + (tx.metadata?.fraud?.riskScore || 0), 0) / (transactions.length || 1)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading fraud data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Fraud Detection Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Monitor transaction risk and security alerts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAlerts}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Flagged Today</p>
                <p className="text-2xl font-bold text-orange-600">{stats.flaggedToday}</p>
              </div>
              <Activity className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Risk Score</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(stats.avgRiskScore)}</p>
              </div>
              <Shield className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              Recent Alerts
            </h2>
            <div className="space-y-4">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert._id}
                  className={`p-4 rounded-lg border-l-4 ${alert.severity === 'high'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-orange-50 border-orange-500'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${alert.severity === 'high' ? 'bg-red-500' : 'bg-orange-500'
                          }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium">{alert.message}</p>
                      {alert.metadata?.riskScore && (
                        <p className="text-sm text-gray-600 mt-2">
                          Risk Score: <span className="font-bold">{alert.metadata.riskScore}</span>
                          {' | '}Amount: ₹{alert.metadata.transactionAmount?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions with Fraud Scores */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              Transaction Risk Monitor
            </h2>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {(['all', 'flagged', 'high', 'medium'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Risk Score</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reasons</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((tx) => {
                  const fraudData: FraudData = tx.metadata?.fraud || { riskScore: 0, reasons: [] };
                  const riskScore = fraudData.riskScore || 0;
                  const badge = getRiskBadge(riskScore);
                  const reasons = fraudData.reasons || [];

                  return (
                    <tr key={tx._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(tx.occurredAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-semibold ${tx.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.type === 'debit' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                        {tx.category}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{badge.icon}</span>
                          <div>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${badge.color}`}>
                              {riskScore}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{badge.text}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {reasons.length > 0 ? (
                          <div className="space-y-1">
                            {reasons.slice(0, 2).map((reason, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-semibold text-gray-700">{reason.code}:</span>
                                <span className="text-gray-600 ml-1">{reason.message}</span>
                              </div>
                            ))}
                            {reasons.length > 2 && (
                              <p className="text-xs text-gray-500">+{reasons.length - 2} more</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No issues detected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions match the selected filter</p>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default FraudAlertsDashboard;
