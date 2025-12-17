// src/api/expenseService.ts
import { authFetch } from "../utils/authFetch";
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function getExpenses(params?: { period?: string; date?: string }) {
  const qs = new URLSearchParams();
  if (params?.period) qs.set("period", params.period);
  if (params?.date) qs.set("date", params.date);
  const res = await authFetch(`${API_URL}/api/expenses?${qs.toString()}`);
  return res.json();
}

export async function createExpense(payload: {
  amount: number;
  category: string;
  purpose: string;
  paymentMethod?: string;
  date?: string;
}) {
  const res = await authFetch(`${API_URL}/api/expenses`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteExpense(id: string) {
  const res = await authFetch(`${API_URL}/api/expenses/${id}`, { method: "DELETE" });
  return res.json();
}
