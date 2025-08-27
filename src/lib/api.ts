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
  const BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://assignment-be-whj6.onrender.com";
  const url = `${BASE_URL.replace(/\/$/, "")}/api/portfolio`;

  return useSWR<{ holdings: HoldingRow[] }>(url, getJson, {
    refreshInterval: 15000, // dynamic updates every 15s
    revalidateOnFocus: false,
  });
}
