import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, PlusCircle, RefreshCcw, Trash2, Wallet as WalletIcon, X, AlertTriangle } from "lucide-react";

import * as walletService from "../api/walletService";
import * as transactionService from "../api/transactionService";
import type { Wallet } from "../types/wallet";
import type { Transaction } from "../types/transaction";
import SmartAlertPanel from "./SmartAlertPanel";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

const WalletDashboard: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<{ id: string; description: string } | null>(null);

  // Last transaction result with policy info
  const [lastTransactionResult, setLastTransactionResult] = useState<any>(null);
  const [showPolicyAlert, setShowPolicyAlert] = useState(false);

  const [createWalletForm, setCreateWalletForm] = useState({
    name: "Primary Wallet",
    currency: "INR",
    initialBalance: 0
  });

  const [txForm, setTxForm] = useState({
    type: "debit" as "credit" | "debit",
    amount: 0,
    category: "general",
    description: ""
  });

  const hasWallet = Boolean(wallet);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const w = await walletService.getWallet();
      const nextWallet = (w?.wallet || null) as Wallet | null;
      setWallet(nextWallet);

      // Only fetch transactions if a wallet exists.
      if (nextWallet) {
        const tx = await transactionService.getTransactions({ limit: 25 });
        setTransactions((tx.transactions || []) as Transaction[]);
      } else {
        setTransactions([]);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const balanceLabel = useMemo(() => {
    if (!wallet) return "—";
    return formatMoney(wallet.balance || 0, wallet.currency || "INR");
  }, [wallet]);

  const onCreateWallet = async () => {
    setError(null);
    try {
      const res = await walletService.createWallet({
        name: createWalletForm.name,
        currency: createWalletForm.currency,
        initialBalance: Number(createWalletForm.initialBalance) || 0
      });

      // If backend returns an existing wallet (idempotent create), this will still work.
      setWallet((res?.wallet || null) as Wallet | null);

      // Always reload to ensure we show the latest wallet + transaction list.
      await load();
    } catch (e: any) {
      // Backends may return 409 when a wallet already exists (one wallet per user).
      // In that case, just fetch and show the existing wallet + history.
      if (e?.status === 409 || /wallet already exists/i.test(String(e?.message || ""))) {
        await load();
        return;
      }

      setError(e?.message || "Failed to create wallet");
    }
  };

  const onCreateTransaction = async () => {
    if (!wallet) return;

    setError(null);
    try {
      const amt = Number(txForm.amount);
      if (!Number.isFinite(amt) || amt <= 0) {
        setError("Amount must be > 0");
        return;
      }

      const res = await transactionService.createTransaction({
        type: txForm.type,
        amount: amt,
        category: txForm.category,
        description: txForm.description
      });

      if (res.wallet) setWallet(res.wallet as Wallet);
      if (res.transaction) {
        setTransactions((prev) => [res.transaction as Transaction, ...prev]);
      } else {
        await load();
      }

      // Store transaction result with policy info and show alert
      setLastTransactionResult(res);
      setShowPolicyAlert(true);
      
      // Scroll to top to show the alert panel
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTxForm((p) => ({ ...p, amount: 0, description: "" }));
    } catch (e: any) {
      setError(e?.message || "Failed to create transaction");
    }
  };

  const onDeleteTransaction = async (id: string, description?: string) => {
    if (!wallet) return;

    // Show custom confirmation modal
    setTransactionToDelete({ 
      id, 
      description: description || "this transaction" 
    });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    setError(null);
    setLoading(true);
    setShowDeleteModal(false);
    
    try {
      await transactionService.deleteTransaction(transactionToDelete.id);
      // Reload wallet + list after successful deletion
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to delete transaction");
    } finally {
      setLoading(false);
      setTransactionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-red-500/30 p-6 max-w-md w-full mx-4 shadow-2xl animate-fadeIn">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Delete Transaction?</h3>
                <p className="text-gray-300 text-sm mb-2">
                  Are you sure you want to delete <span className="font-semibold text-white">"{transactionToDelete?.description}"</span>?
                </p>
                <p className="text-gray-400 text-xs">
                  This will reverse the balance change and cannot be undone.
                </p>
              </div>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-all border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Alert Panel - Show after transaction creation */}
      {showPolicyAlert && lastTransactionResult && (
        <div className="mb-6 animate-fadeIn">
          <SmartAlertPanel
            fraud={lastTransactionResult.fraud}
            policy={lastTransactionResult.policy}
            amount={lastTransactionResult.transaction?.amount || 0}
            category={lastTransactionResult.transaction?.category || 'general'}
            onClose={() => {
              setShowPolicyAlert(false);
              setLastTransactionResult(null);
            }}
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-500 flex items-center justify-center">
            <WalletIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Wallet</h2>
            <p className="text-sm text-gray-300">Balance & transaction history</p>
          </div>
        </div>

        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-300">Loading…</div>
      ) : !hasWallet ? (
        <div className="max-w-xl rounded-2xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Create your wallet</h3>
          <p className="text-sm text-gray-300 mb-4">
            You need a wallet before you can add transactions.
          </p>

          <div className="grid grid-cols-1 gap-3">
            <label className="text-sm text-gray-300">
              Name
              <input
                className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                value={createWalletForm.name}
                onChange={(e) => setCreateWalletForm((p) => ({ ...p, name: e.target.value }))}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-300">
                Currency
                <input
                  className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                  value={createWalletForm.currency}
                  onChange={(e) => setCreateWalletForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
                />
              </label>

              <label className="text-sm text-gray-300">
                Initial balance
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                  value={createWalletForm.initialBalance}
                  onChange={(e) => setCreateWalletForm((p) => ({ ...p, initialBalance: Number(e.target.value) }))}
                />
              </label>
            </div>

            <button
              onClick={() => void onCreateWallet()}
              className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            >
              <PlusCircle className="w-4 h-4" />
              Create Wallet
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-1">Current balance</h3>
              <div className="text-3xl font-bold text-cyan-300 mb-2">{balanceLabel}</div>
              <div className="text-sm text-gray-300">
                Status: <span className="text-white">{wallet?.status}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Add transaction</h3>

              <div className="grid grid-cols-1 gap-3">
                <label className="text-sm text-gray-300">
                  Type
                  <select
                    className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                    value={txForm.type}
                    onChange={(e) => setTxForm((p) => ({ ...p, type: e.target.value as any }))}
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </label>

                <label className="text-sm text-gray-300">
                  Amount
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                    value={txForm.amount}
                    onChange={(e) => setTxForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                  />
                </label>

                <div className="text-sm text-gray-300">
                  <label className="mb-2 block">Category</label>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                    {[
                      { value: 'Food', emoji: '🍔', color: 'from-orange-500/20 to-red-500/20 border-orange-500/40 hover:border-orange-400' },
                      { value: 'Travel', emoji: '✈️', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 hover:border-blue-400' },
                      { value: 'Shopping', emoji: '🛍️', color: 'from-pink-500/20 to-purple-500/20 border-pink-500/40 hover:border-pink-400' },
                      { value: 'Education', emoji: '📚', color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/40 hover:border-indigo-400' },
                      { value: 'Bills', emoji: '💡', color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40 hover:border-yellow-400' },
                      { value: 'Family', emoji: '👨‍👩‍👧‍👦', color: 'from-green-500/20 to-emerald-500/20 border-green-500/40 hover:border-green-400' },
                      { value: 'Entertainment', emoji: '🎬', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 hover:border-purple-400' },
                      { value: 'Healthcare', emoji: '⚕️', color: 'from-red-500/20 to-rose-500/20 border-red-500/40 hover:border-red-400' },
                      { value: 'Fitness', emoji: '💪', color: 'from-green-500/20 to-lime-500/20 border-green-500/40 hover:border-green-400' },
                      { value: 'Investment', emoji: '📈', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 hover:border-emerald-400' },
                      { value: 'Insurance', emoji: '🛡️', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 hover:border-blue-400' },
                      { value: 'Fuel', emoji: '⛽', color: 'from-gray-500/20 to-slate-500/20 border-gray-500/40 hover:border-gray-400' },
                      { value: 'Salary', emoji: '💰', color: 'from-green-500/20 to-emerald-500/20 border-green-500/40 hover:border-green-400' },
                      { value: 'Business', emoji: '💼', color: 'from-slate-500/20 to-zinc-500/20 border-slate-500/40 hover:border-slate-400' },
                      { value: 'Freelance', emoji: '💻', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 hover:border-cyan-400' },
                      { value: 'Gift', emoji: '🎁', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/40 hover:border-pink-400' },
                      { value: 'general', emoji: '📋', color: 'from-gray-500/20 to-slate-500/20 border-gray-500/40 hover:border-gray-400' },
                      { value: 'Others', emoji: '📌', color: 'from-gray-500/20 to-stone-500/20 border-gray-500/40 hover:border-gray-400' }
                    ].map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setTxForm((p) => ({ ...p, category: cat.value }))}
                        className={`
                          relative px-3 py-2.5 rounded-lg border transition-all duration-200
                          bg-gradient-to-br ${cat.color}
                          ${txForm.category === cat.value 
                            ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20 scale-105' 
                            : 'hover:scale-105 hover:shadow-md'
                          }
                        `}
                      >
                        <div className="text-2xl mb-1">{cat.emoji}</div>
                        <div className={`text-xs font-medium ${
                          txForm.category === cat.value ? 'text-cyan-300' : 'text-gray-300'
                        }`}>
                          {cat.value === 'general' ? 'General' : cat.value}
                        </div>
                        {txForm.category === cat.value && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="text-sm text-gray-300">
                  Description
                  <input
                    className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                    value={txForm.description}
                    onChange={(e) => setTxForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </label>

                <button
                  onClick={() => void onCreateTransaction()}
                  className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                >
                  {txForm.type === "credit" ? (
                    <ArrowUpCircle className="w-4 h-4" />
                  ) : (
                    <ArrowDownCircle className="w-4 h-4" />
                  )}
                  Add {txForm.type}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent transactions</h3>

            {transactions.length === 0 ? (
              <div className="text-gray-300">No transactions yet.</div>
            ) : (
              <div className="space-y-3">
                {transactions.map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between rounded-xl bg-black/20 border border-white/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {t.type === "credit" ? (
                        <ArrowUpCircle className="w-5 h-5 text-emerald-300" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-rose-300" />
                      )}

                      <div>
                        <div className="text-white font-medium">
                          {t.description || t.category || "Transaction"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(t.occurredAt).toLocaleString()} • {t.txHash.slice(0, 10)}…
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`font-semibold ${t.type === "credit" ? "text-emerald-300" : "text-rose-300"}`}>
                        {t.type === "credit" ? "+" : "-"}{formatMoney(t.amount, t.currency)}
                      </div>

                      <button
                        onClick={() => void onDeleteTransaction(t._id, t.description || t.category)}
                        disabled={loading}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 text-gray-200 border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDashboard;
