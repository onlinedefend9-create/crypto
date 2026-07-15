import React from "react";
import { Search, Coins, Newspaper, Cpu, Workflow, Gamepad2, Activity, Globe } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  activeTab: "prices" | "news" | "ai_trends" | "workflows" | "p2e";
  setActiveTab: (tab: "prices" | "news" | "ai_trends" | "workflows" | "p2e") => void;
  language: "fr" | "en";
  setLanguage: (lang: "fr" | "en") => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  currency,
  setCurrency,
  activeTab,
  setActiveTab,
  language,
  setLanguage,
}: HeaderProps) {
  // Translate terms dynamically
  const labels = {
    fr: {
      prices: "Prix des Cryptos",
      news: "Actualités Crypto",
      aiTrends: "Agents & Modèles IA",
      workflows: "Bibliothèque de Workflows",
      p2e: "Jeux Play-to-Earn",
      devops: "RSS & DevOps",
      searchCrypto: "Rechercher une crypto... (ex: BTC, ETH)",
      searchNews: "Rechercher dans les actualités...",
    },
    en: {
      prices: "Crypto Prices",
      news: "Crypto News",
      aiTrends: "AI Agents & Models",
      workflows: "Workflow Library",
      p2e: "Play-to-Earn Games",
      devops: "RSS & DevOps",
      searchCrypto: "Search crypto... (e.g. BTC, ETH)",
      searchNews: "Search news...",
    }
  }[language];

  return (
    <header className="bg-bg-card border-b border-border-dark sticky top-0 z-40 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand Logotype */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-black text-[20px] tracking-wider text-white flex items-center uppercase font-sans">
                RESUME<span className="text-emerald-400 font-bold ml-1 text-[14px] bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 rounded font-mono">FLOW</span>
              </span>
            </div>
          </div>
        </div>

        {/* Localized Tabs & Interactive Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Navigation Tab Toggle styled with the theme palette */}
          <div className="flex bg-bg-main p-1 rounded-lg border border-border-dark flex-wrap sm:flex-nowrap gap-1">
            <button
              onClick={() => setActiveTab("prices")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "prices"
                  ? "bg-brand-yellow text-bg-main font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>{labels.prices}</span>
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "news"
                  ? "bg-brand-yellow text-bg-main font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>{labels.news}</span>
            </button>
            <button
              onClick={() => setActiveTab("ai_trends")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "ai_trends"
                  ? "bg-brand-yellow text-bg-main font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>{labels.aiTrends}</span>
            </button>
            <button
              onClick={() => setActiveTab("workflows")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "workflows"
                  ? "bg-brand-yellow text-bg-main font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Workflow className="w-4 h-4" />
              <span>{labels.workflows}</span>
            </button>
            <button
              onClick={() => setActiveTab("p2e")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "p2e"
                  ? "bg-brand-yellow text-bg-main font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>{labels.p2e}</span>
            </button>
          </div>

          {/* Quick Search and Selectors */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto ml-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-48 lg:w-56">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-3.5 w-3.5 text-text-secondary" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "prices"
                    ? labels.searchCrypto
                    : labels.searchNews
                }
                className="w-full bg-border-dark border-none rounded-md py-1.5 pl-9 pr-4 text-xs text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all font-sans"
              />
            </div>

            {/* Language Selection Toggle */}
            <div className="flex bg-bg-main border border-border-dark rounded-md p-0.5 items-center">
              <Globe className="w-3 h-3 text-text-secondary mx-1.5" />
              <button
                onClick={() => setLanguage("fr")}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                  language === "fr"
                    ? "bg-bg-stat text-brand-yellow"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                FR 🇫🇷
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                  language === "en"
                    ? "bg-bg-stat text-brand-yellow"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                EN 🇬🇧
              </button>
            </div>

            {/* Currency select toggle */}
            <div className="flex bg-bg-main border border-border-dark rounded-md p-0.5">
              {(["USD", "EUR", "BTC"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded font-mono transition-colors cursor-pointer ${
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

