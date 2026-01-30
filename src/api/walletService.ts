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

export type CreateWalletPayload = {
  name?: string;
  currency?: string;
  initialBalance?: number;
};

export type UpdateWalletPayload = {
  name?: string;
  currency?: string;
  status?: "active" | "frozen" | "closed";
};

export async function getWallet() {
  const res = await authFetch(`${API_BASE_URL}/wallet`);
  return handle(res);
}

export async function createWallet(payload: CreateWalletPayload) {
  const res = await authFetch(`${API_BASE_URL}/wallet`, {

    method: "POST",
    body: JSON.stringify(payload)
  });
  return handle(res);
}

export async function updateWallet(payload: UpdateWalletPayload) {
  const res = await authFetch(`${API_BASE_URL}/wallet`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
  return handle(res);
}

export async function deleteWallet() {
  const res = await authFetch(`${API_BASE_URL}/wallet`, { method: "DELETE" });
  return handle(res);
}
