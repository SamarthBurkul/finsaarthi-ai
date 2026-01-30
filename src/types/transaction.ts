export type TransactionType = "credit" | "debit";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  _id: string;
  userId: string;
  walletId: string;
  txHash: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  category: string;
  status: TransactionStatus;
  occurredAt: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
