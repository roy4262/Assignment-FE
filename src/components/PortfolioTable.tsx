"use client";

import { useMemo, useState } from "react";
import { useHoldings } from "@/lib/api";
import type { HoldingRow } from "@/types";

// Formatting helpers
const fmtNum = (n: number, digits = 2) =>
  n.toLocaleString(undefined, { maximumFractionDigits: digits });

function classNames(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

// Display '-' instead of NA/N.A/N/A/null/undefined
function isNAString(s: string) {
  const t = s.trim().toLowerCase();
  return t === "na" || t === "n/a" || t === "n.a" || t === "n.a.";
}
function asDash(v: unknown) {
  if (v == null) return "-";
  if (typeof v === "string" && isNAString(v)) return "-";
  return v as any;
}

// Category mapping (derived in frontend)
const normalize = (s: string) => s.trim().toLowerCase();
const CATEGORY_MAP = new Map<string, string>([
  [normalize("HDFC Bank"), "Financial Sector"],
  [normalize("Bajaj Finance"), "Financial Sector"],
  [normalize("ICICI Bank"), "Financial Sector"],
  [normalize("Bajaj Housing"), "Financial Sector"],
  [normalize("Savani Financials"), "Financial Sector"],

  [normalize("Affle India"), "Tech Sector"],
  [normalize("LTI Mindtree"), "Tech Sector"],
  [normalize("KPIT Tech"), "Tech Sector"],
  [normalize("Tata Tech"), "Tech Sector"],
  [normalize("BLS E-Services"), "Tech Sector"],
  [normalize("Tanla"), "Tech Sector"],

  [normalize("Dmart"), "Consumer"],
  [normalize("Tata Consumer"), "Consumer"],
  [normalize("Pidilite"), "Consumer"],

  [normalize("Tata Power"), "Power"],
  [normalize("KPI Green"), "Power"],
  [normalize("Suzlon"), "Power"],
  [normalize("Gensol"), "Power"],

  [normalize("Hariom Pipes"), "Pipe Sector"],
  [normalize("Astral"), "Pipe Sector"],
  [normalize("Polycab"), "Pipe Sector"],

  [normalize("Clean Science"), "Others"],
  [normalize("Deepak Nitrite"), "Others"],
  [normalize("Fine Organic"), "Others"],
  [normalize("Gravita"), "Others"],
  [normalize("SBI Life"), "Others"],
]);

function getCategory(stockName: string, fallbackSector?: string | null) {
  const key = normalize(stockName);
  const fallbackClean =
    fallbackSector && !isNAString(fallbackSector) ? fallbackSector : undefined;
  return CATEGORY_MAP.get(key) ?? (fallbackClean || "Others");
}

// Compute category groups and summaries
function groupByCategory(rows: HoldingRow[]) {
  const groups = new Map<
    string,
    {
      rows: HoldingRow[];
      totals: { investment: number; presentValue: number; gainLoss: number };
    }
  >();
  for (const r of rows) {
    const key = getCategory(r.stock, r.sector) || "Others";
    if (!groups.has(key)) {
      groups.set(key, {
        rows: [],
        totals: { investment: 0, presentValue: 0, gainLoss: 0 },
      });
    }
    const g = groups.get(key)!;
    g.rows.push(r);
    g.totals.investment += r.investment;
    g.totals.presentValue += r.presentValue;
    g.totals.gainLoss += r.gainLoss;
  }
  return groups;
}

export default function PortfolioTable() {
  const { data, error, isLoading } = useHoldings();
  const rows = data?.holdings ?? [];

  const groups = useMemo(() => groupByCategory(rows), [rows]);
  const totalPV = useMemo(
    () => rows.reduce((sum, r) => sum + r.presentValue, 0),
    [rows]
  );

  // Dropdown filter for categories
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categoryOptions = useMemo(
    () => ["All", ...Array.from(groups.keys())],
    [groups]
  );

  const filteredEntries = useMemo(() => {
    const entries = Array.from(groups.entries());
    if (selectedCategory === "All") return entries;
    return entries.filter(([k]) => k === selectedCategory);
  }, [groups, selectedCategory]);

  if (error) {
    return <div className="p-6 text-sm text-red-600">Failed to load data.</div>;
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  }

  if (!rows.length) {
    return <div className="p-6 text-sm text-gray-500">No data</div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100">
      <div className="overflow-x-auto">
        {/* Controls */}
        <div className="flex items-center gap-3 p-3">
          <label className="text-xs text-slate-600 dark:text-slate-300">
            Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 dark:border-slate-700"
          >
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <table className="min-w-[900px] w-full text-xs sm:text-sm md:text-[13px]">
          <thead className="bg-white dark:bg-slate-800/70">
            <tr className="border-b border-gray-200 dark:border-slate-700">
              {[
                "Stock",
                "Symbol",
                "Category",
                "Purchase Price",
                "Qty",
                "Investment",
                "CMP",
                "Present Value",
                "Gain/Loss",
                "P/E",
                "Latest Earnings",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-[11px] tracking-widest uppercase font-semibold text-blue-900 dark:text-blue-200"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map(([sector, g]) => (
              <SectorBlock
                key={sector}
                sector={sector}
                group={g}
                totalPV={totalPV}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectorBlock({
  sector,
  group,
  totalPV,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  sector: string;
  group: {
    rows: HoldingRow[];
    totals: { investment: number; presentValue: number; gainLoss: number };
  };
  totalPV: number;
}) {
  const { totals } = group;
  const sectorWeight = totalPV > 0 ? (totals.presentValue / totalPV) * 100 : 0;
  const stockCount = group.rows.length;
  return (
    <>
      {/* Category header with summary */}
      <tr className="bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700">
        <td
          className="px-6 py-3 font-semibold text-blue-900 dark:text-blue-200"
          colSpan={11}
        >
          <div className="flex items-center justify-between">
            <span>{sector}</span>
            <div className="flex items-center gap-6 text-xs">
              <span>
                <strong>Stocks:</strong> {stockCount}
              </span>
              <span>
                <strong>Category Weight:</strong> {fmtNum(sectorWeight, 1)}%
              </span>
              <span>
                <strong>Total Investment:</strong> {fmtNum(totals.investment)}
              </span>
              <span>
                <strong>Total Present Value:</strong>{" "}
                {fmtNum(totals.presentValue)}
              </span>
              <span
                className={classNames(
                  totals.gainLoss >= 0 ? "text-emerald-500" : "text-red-400"
                )}
              >
                <strong>Gain/Loss:</strong> {fmtNum(totals.gainLoss)}
              </span>
            </div>
          </div>
        </td>
      </tr>

      {/* Sector rows */}
      {group.rows.map((r) => (
        <tr
          key={r.symbol}
          className="border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3">{r.stock}</td>
          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-gray-600 dark:text-slate-300">
            {r.symbol}
          </td>
          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3">
            {getCategory(r.stock, r.sector)}
          </td>
          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right tabular-nums">
            {fmtNum(r.purchasePrice)}
          </td>
          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right tabular-nums">
            {r.qty}
          </td>
          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right tabular-nums">
            {fmtNum(r.investment)}
          </td>
          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right tabular-nums">
            {fmtNum(r.cmp)}
          </td>
          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right tabular-nums">
            {fmtNum(r.presentValue)}
          </td>
          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right tabular-nums">
            <span
              className={classNames(
                r.gainLoss >= 0 ? "text-emerald-500" : "text-red-400"
              )}
            >
              {fmtNum(r.gainLoss)}
            </span>
          </td>
          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right tabular-nums">
            {asDash(r.peRatio)}
          </td>
          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right tabular-nums">
            {asDash(r.latestEarnings)}
          </td>
        </tr>
      ))}
    </>
  );
}
