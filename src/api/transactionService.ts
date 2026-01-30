import { authFetch } from "../utils/authFetch";

// Prefer VITE_API_URL (used elsewhere in the app). It should include the `/api` prefix.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

async function handle(res: Response) {
  if (!res.ok) {
    const body = await parseJsonSafe(res);
    const msg = body?.error || body?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    // @ts-expect-error attach status
    err.status = res.status;
    // @ts-expect-error attach body
    err.body = body;
    throw err;
  }
  return parseJsonSafe(res);
}

export type CreateTransactionPayload = {
  walletId?: string;
  type: "credit" | "debit";
  amount: number;
  currency?: string;
  description?: string;
  category?: string;
  status?: "pending" | "completed" | "failed";
  metadata?: Record<string, unknown>;
  occurredAt?: string;
};

export async function createTransaction(payload: CreateTransactionPayload) {
  const res = await authFetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return handle(res);
}

export async function getTransactions(params?: {
  walletId?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
  skip?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.walletId) qs.set("walletId", params.walletId);
  if (params?.type) qs.set("type", params.type);
  if (params?.status) qs.set("status", params.status);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  if (params?.skip !== undefined) qs.set("skip", String(params.skip));

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await authFetch(`${API_BASE_URL}/transactions${suffix}`);
  return handle(res);
}

export async function getTransaction(id: string) {
  const res = await authFetch(`${API_BASE_URL}/transactions/${id}`);
  return handle(res);
}

export async function updateTransaction(id: string, payload: {
  description?: string;
  category?: string;
  status?: "pending" | "completed" | "failed";
  metadata?: Record<string, unknown>;
}) {
  const res = await authFetch(`${API_BASE_URL}/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  return handle(res);
}

export async function deleteTransaction(id: string) {
  const res = await authFetch(`${API_BASE_URL}/transactions/${id}`, { method: "DELETE" });
  return handle(res);
}
