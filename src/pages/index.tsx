import dynamic from "next/dynamic";

const PortfolioTable = dynamic(() => import("@/components/PortfolioTable"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen font-sans px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-6">
      <div className="mx-auto w-full max-w-[1800px] space-y-4">
        <header className="pt-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Portfolio Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Live holdings, sector breakdown, and performance at a glance.
          </p>
        </header>
        <PortfolioTable />
      </div>
    </main>
  );
}
