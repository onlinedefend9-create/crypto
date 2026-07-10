import React, { useState, useEffect } from "react";
import { Coin, GlobalStats, NewsArticle } from "./types";
import GlobalStatsBar from "./components/GlobalStatsBar";
import Header from "./components/Header";
import CryptoTable from "./components/CryptoTable";
import NewsSection from "./components/NewsSection";
import CoinDetailModal from "./components/CoinDetailModal";
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, HelpCircle, Shield, Award } from "lucide-react";

export default function App() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [activeTab, setActiveTab] = useState<"prices" | "news">("prices");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  // Loading states
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core Data Fetchers
  const fetchCoins = async () => {
    try {
      setIsLoadingCoins(true);
      const res = await fetch("/api/tickers");
      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${contentType}`);
      }
      const result = await res.json();
      if (result && Array.isArray(result.data)) {
        setCoins(result.data);
      } else {
        throw new Error("Impossible de charger le flux des prix des cryptos");
      }
    } catch (err: any) {
      console.error("Failed to load tickers:", err);
      setError("Erreur de connexion au serveur de prix. Veuillez réessayer.");
    } finally {
      setIsLoadingCoins(false);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      setIsLoadingGlobal(true);
      const res = await fetch("/api/global");
      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${contentType}`);
      }
      const result = await res.json();
      if (result && result.data) {
        setGlobalStats(result.data);
      }
    } catch (err) {
      console.error("Failed to load global market stats:", err);
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const fetchNews = async () => {
    try {
      setIsLoadingNews(true);
      const res = await fetch("/api/news");
      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${contentType}`);
      }
      const result = await res.json();
      if (result && Array.isArray(result.data)) {
        setNews(result.data);
      }
    } catch (err) {
      console.error("Failed to load news feed:", err);
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Synchronized refresh trigger
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    await Promise.all([fetchCoins(), fetchGlobalStats(), fetchNews()]);
    setIsRefreshing(false);
  };

  // Initial Data Load
  useEffect(() => {
    fetchCoins();
    fetchGlobalStats();
    fetchNews();
  }, []);

  // Filter coins based on search
  const filteredCoins = coins.filter((coin) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col justify-between font-sans selection:bg-brand-yellow selection:text-bg-main">
      <div>
        {/* Global Stats Bar */}
        <GlobalStatsBar
          stats={globalStats}
          currency={currency}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Branding Navigation Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currency={currency}
          setCurrency={setCurrency}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Server connection error alerts */}
        {error && (
          <div className="max-w-7xl mx-auto px-6 mt-4">
            <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-brand-yellow uppercase tracking-wide">Avertissement réseau</h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Le serveur Coinpaprika officiel est temporairement ralenti ou le quota est restreint. Des données de secours réalistes sont actuellement servies pour assurer un service ininterrompu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <main className="flex-1">
          {activeTab === "prices" ? (
            isLoadingCoins && coins.length === 0 ? (
              // Loading Skeleton Grid
              <div className="py-12 max-w-7xl mx-auto px-6">
                <div className="bg-bg-card border border-border-dark rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
                  <div className="h-6 bg-bg-stat w-1/4 rounded"></div>
                  <div className="h-4 bg-bg-stat w-full rounded"></div>
                  <div className="h-4 bg-bg-stat w-full rounded"></div>
                  <div className="h-12 bg-bg-stat w-full rounded mt-2"></div>
                </div>
              </div>
            ) : (
              // Interactive Crypto Pricing Table
              <CryptoTable
                coins={filteredCoins}
                currency={currency}
                onSelectCoin={(coin) => setSelectedCoin(coin)}
              />
            )
          ) : (
            // Crypto News Panel with AI translations
            <NewsSection
              news={news}
              isLoading={isLoadingNews}
              onRefresh={handleRefresh}
            />
          )}
        </main>
      </div>

      {/* Detail overlay Modal */}
      {selectedCoin && (
        <CoinDetailModal
          coin={selectedCoin}
          currency={currency}
          onClose={() => setSelectedCoin(null)}
        />
      )}

      {/* Coinpaprika-styled Footing */}
      <footer className="bg-bg-card border-t border-border-dark py-12 px-6 mt-12 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Logotype */}
          <div className="flex flex-col gap-3">
            <span className="font-extrabold text-lg text-text-primary tracking-tight">
              coin<span className="text-brand-yellow">paprika</span>
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              Une plateforme complète de suivi d'actifs numériques. Clone d'apprentissage localisé en français avec données synthétisées en continu.
            </p>
            <span className="text-[10px] text-text-secondary/60 font-mono mt-2 block">
              © 2026 Coinpaprika Clone FR. Tous droits réservés.
            </span>
          </div>

          {/* Column 2: Legal disclosures */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold uppercase text-text-primary tracking-widest font-mono flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-text-secondary" />
              Clause de Non-Responsabilité
            </span>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Les prix et actualités sont fournis uniquement à titre indicatif et éducatif. Aucun élément présenté sur ce site ne constitue un conseil en investissement.
            </p>
          </div>

          {/* Column 3: Tech highlights */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold uppercase text-text-primary tracking-widest font-mono flex items-center gap-1.5">
              <Award className="w-4 h-4 text-text-secondary" />
              Technologies utilisées
            </span>
            <ul className="text-xs text-text-secondary flex flex-col gap-1.5 font-mono">
              <li>• React 19 & Vite</li>
              <li>• Node.js & Express</li>
              <li>• Gemini 3.5-flash (IA)</li>
              <li>• Recharts (Graphiques)</li>
              <li>• Motion (Animations)</li>
            </ul>
          </div>

          {/* Column 4: Support / Community links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold uppercase text-text-primary tracking-widest font-mono flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-text-secondary" />
              À propos du clone
            </span>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Ce clone reproduit l'identité visuelle de la version française de Coinpaprika, avec des optimisations techniques pour la fluidité d'affichage mobile et de bureau.
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}
