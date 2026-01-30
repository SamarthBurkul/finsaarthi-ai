// src/api/budgetService.ts
import { authFetch } from "../utils/authFetch";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function analyzeBudget(payload: {
  monthlyIncome: number;
  expenses?: { rentHousing?: number; foodGroceries?: number; emiLoans?: number; travelTransport?: number };
  savingsGoal: number;
  month?: number;
  year?: number;
}) {
  const res = await authFetch(`${API_BASE_URL}/budget/analyze`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return res.json();
}
