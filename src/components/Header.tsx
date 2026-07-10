import React from "react";
import { Search, Flame, Coins, Newspaper } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  activeTab: "prices" | "news";
  setActiveTab: (tab: "prices" | "news") => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  currency,
  setCurrency,
  activeTab,
  setActiveTab,
}: HeaderProps) {
  return (
    <header className="bg-bg-card border-b border-border-dark sticky top-0 z-40 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand Logotype */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Custom stylized Coinpaprika logo from the theme */}
            <div className="w-8 h-8 rounded-lg bg-brand-yellow flex items-center justify-center shadow-lg shadow-black/30">
              <Flame className="w-5 h-5 text-bg-main" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white flex items-center">
                CoinPaprika <span className="text-text-secondary font-normal ml-1.5 text-base">FR</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-brand-yellow/10 text-brand-yellow font-bold uppercase rounded border border-brand-yellow/30 font-mono">
                  Sleek
                </span>
              </span>
              <span className="text-[11px] text-text-secondary font-mono -mt-1">
                Marché en direct & Actualités
              </span>
            </div>
          </div>
        </div>

        {/* Localized Tabs & Interactive Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Navigation Tab Toggle styled with the theme palette */}
          <div className="flex bg-bg-main p-1 rounded-lg border border-border-dark">
            <button
              onClick={() => setActiveTab("prices")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "prices"
                  ? "bg-brand-yellow text-bg-main font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Prix des Cryptos</span>
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "news"
                  ? "bg-brand-yellow text-bg-main font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Actualités Crypto</span>
            </button>
          </div>

          {/* Quick Search and Currency Selectors */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto ml-auto">
            {/* Search Box - matching .search-bar styles from design */}
            <div className="relative flex-1 sm:w-60">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-3.5 w-3.5 text-text-secondary" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "prices"
                    ? "Rechercher une crypto... (ex: BTC, ETH)"
                    : "Rechercher dans les actualités..."
                }
                className="w-full bg-border-dark border-none rounded-md py-1.5 pl-9 pr-4 text-xs text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all font-sans"
              />
            </div>

            {/* Currency select toggle */}
            <div className="flex bg-bg-main border border-border-dark rounded-md p-0.5">
              {(["USD", "EUR", "BTC"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded font-mono transition-colors cursor-pointer ${
                    currency === curr
                      ? "bg-bg-stat text-brand-yellow"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

