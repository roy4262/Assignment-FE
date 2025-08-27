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
  // Base URL from env (public for Next.js)
  const BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://assignment-be-whj6.onrender.com";

  // API path from env, defaults to /api/portfolio
  const API_PATH = (
    process.env.NEXT_PUBLIC_API_PATH || "/api/portfolio"
  ).replace(/^([^/])/, "/$1");

  // Refresh interval from env (ms), default 15000
  const refreshMsRaw = process.env.NEXT_PUBLIC_REFRESH_MS || "15000";
  const refreshMs = Number.parseInt(refreshMsRaw, 10);

  // Revalidate on focus flag from env, default false
  const revalidateOnFocus = /^(1|true|yes)$/i.test(
    process.env.NEXT_PUBLIC_REVALIDATE_ON_FOCUS || "false"
  );

  const url = `${BASE_URL.replace(/\/$/, "")}${API_PATH}`;

  return useSWR<{ holdings: HoldingRow[] }>(url, getJson, {
    refreshInterval: Number.isFinite(refreshMs) ? refreshMs : 15000,
    revalidateOnFocus,
  });
}
