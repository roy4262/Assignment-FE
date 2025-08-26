# 🎨 Frontend (Next.js + React + Tailwind)

Responsive UI that displays portfolio holdings with live updates, sector grouping, and clear gain/loss indicators.

## ✨ Features

- Portfolio table with key metrics
- Category (sector) grouping and summaries
- Auto-refresh every 15s (SWR)
- Graceful states: loading, error, empty
- Dark mode friendly styles

## 🔌 Config

Create `.env.local`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## 🏃 Run locally

```bash
npm install
npm run dev
# build/start
npm run build
npm start
```

- App: http://localhost:3000

## 📁 Key Files

- `src/pages/index.tsx` – page shell + heading
- `src/components/PortfolioTable.tsx` – main table
- `src/lib/api.ts` – SWR fetcher and endpoint config

## 🧮 Display columns

- Stock, Symbol, Category, Purchase Price, Qty
- Investment, CMP, Present Value, Gain/Loss
- P/E, Latest Earnings (EPS)

## 🧠 Notes

- Uses SWR for caching + revalidation
- Formats NA-like values as `-`
- Category mapping done client-side for a simple demo
