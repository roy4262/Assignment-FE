// Shared types for the frontend

export interface HoldingRow {
  stock: string; // Company name
  symbol: string; // e.g., HDFCBANK.NS
  exchangeCode: string | null; // optional exchange code
  sector: string; // e.g., Financials
  purchasePrice: number; // per-share buy price
  qty: number; // quantity owned
  investment: number; // purchasePrice * qty
  cmp: number; // current market price
  presentValue: number; // cmp * qty
  gainLoss: number; // presentValue - investment
  portfolioPercent: number; // percentage of portfolio
  peRatio: number | null; // P/E ratio
  latestEarnings: number | null; // EPS or latest earnings
}
