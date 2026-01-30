export type WalletStatus = "active" | "frozen" | "closed";

export interface Wallet {
  _id: string;
  userId: string;
  name: string;
  currency: string;
  balance: number;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
}
