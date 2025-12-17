const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
console.log("API_URL in stockService:", API_URL);

export type RiskProfile = "low" | "moderate" | "high";

export interface StockReportPayload {
  monthlyIncome: number;
  savingsGoal: number;
  riskProfile: RiskProfile;
}

export async function createStockReport(
  payload: StockReportPayload,
  token: string
) {
  const res = await fetch(`${API_URL}/api/stock/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function getLatestStockReport(token: string) {
  const res = await fetch(`${API_URL}/api/stock/report/latest`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return text ? JSON.parse(text) : null;
}
