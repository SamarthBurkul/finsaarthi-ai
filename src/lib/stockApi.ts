const ALPHA_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;

export interface DailyPricePoint {
  month: string;
  price: number;
  volume: number;
}

export async function getDailyPrices(symbol: string): Promise<DailyPricePoint[]> {
  if (!ALPHA_KEY) {
    throw new Error("Missing VITE_ALPHA_VANTAGE_KEY");
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(
    symbol
  )}&apikey=${ALPHA_KEY}`;

  const res = await fetch(url);
  

  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`);

  const data = await res.json();
  console.log("Alpha raw response:", data);
  const series = data["Time Series (Daily)"];
  if (!series) throw new Error("No daily data from Alpha Vantage");

  const entries = Object.entries(series)
    .slice(0, 6)
    .reverse() as [string, any][];

  return entries.map(([date, v]) => ({
    month: date,
    price: Number(v["4. close"]),
    volume: Number(v["5. volume"]),
  }));
}
