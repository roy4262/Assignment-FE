import useSWR from "swr";
import type { HoldingRow } from "@/types";

// Simple JSON fetcher (GET)
const getJson = async <T>(url: string): Promise<T> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return (await r.json()) as T;
};

// Fetch holdings from backend (expects { holdings: HoldingRow[] })
export function useHoldings() {
  return useSWR<{ holdings: HoldingRow[] }>(
    process.env.NEXT_PUBLIC_BACKEND_URL
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/portfolio`
      : "http://localhost:5000/api/portfolio",
    getJson,
    {
      refreshInterval: 15000, // dynamic updates every 15s
      revalidateOnFocus: false,
    }
  );
}
