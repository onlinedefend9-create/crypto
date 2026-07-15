import React, { useState, useEffect } from "react";
import { Coin, GlobalStats, NewsArticle, PriceAlert } from "./types";
import GlobalStatsBar from "./components/GlobalStatsBar";
import AiTokenCostsBar from "./components/AiTokenCostsBar";
import Header from "./components/Header";
import CryptoTable from "./components/CryptoTable";
import NewsSection from "./components/NewsSection";
import { CryptoRadarChart } from "./components/CryptoRadarChart";
import { TrendNewsComparer } from "./components/TrendNewsComparer";
import CoinDetailModal from "./components/CoinDetailModal";
import PriceAlertModal from "./components/PriceAlertModal";
import WorkflowLibrarySection from "./components/WorkflowLibrarySection";
import PlayToEarnSection from "./components/PlayToEarnSection";
import { formatCurrency } from "./utils/formatters";
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, HelpCircle, Shield, Award, Bell, X, Coins, Newspaper, Cpu, Workflow, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLastFetched, setNewsLastFetched] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [activeTab, setActiveTab] = useState<"prices" | "news" | "ai_trends" | "workflows" | "p2e">("prices");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  // Price Alert states
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selectedCoinForAlert, setSelectedCoinForAlert] = useState<Coin | null>(null);
  const [triggeredAlertNotifications, setTriggeredAlertNotifications] = useState<PriceAlert[]>([]);

  // Radar States
  const [radarData, setRadarData] = useState<any>(null);
  const [isLoadingRadar, setIsLoadingRadar] = useState(true);
  const [selectedRadarCoins, setSelectedRadarCoins] = useState<string[]>(["BTC", "ETH", "SOL"]);

  // AI trends and Radar states
  const [aiNews, setAiNews] = useState<NewsArticle[]>([]);
  const [aiNewsLastFetched, setAiNewsLastFetched] = useState<number | null>(null);
  const [aiRadarData, setAiRadarData] = useState<any>(null);
  const [isLoadingAiRadar, setIsLoadingAiRadar] = useState(true);
  const [selectedAiRadarModels, setSelectedAiRadarModels] = useState<string[]>(["Gemini", "Claude", "GPT-4", "DeepSeek", "Llama", "Qwen"]);
  const [isLoadingAiNews, setIsLoadingAiNews] = useState(true);

  // Loading states
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [showWarningBanner, setShowWarningBanner] = useState(true);

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
        setError(null);
        setIsFallbackMode(result.source === "fallback");
      } else {
        throw new Error("Impossible de charger le flux des prix des cryptos");
      }
    } catch (err: any) {
      console.error("Failed to load tickers:", err);
      setError("Erreur de connexion au serveur de prix. Veuillez réessayer.");
      setIsFallbackMode(false);
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

  const fetchNews = async (currentLang = language) => {
    try {
      setIsLoadingNews(true);
      const res = await fetch(`/api/news?lang=${currentLang}`);
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
        if (result.lastFetched) {
          setNewsLastFetched(result.lastFetched);
        }
      }
    } catch (err) {
      console.error("Failed to load news feed:", err);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const fetchRadar = async (activeCoins = selectedRadarCoins, currentLang = language) => {
    try {
      setIsLoadingRadar(true);
      const res = await fetch(`/api/radar?coins=${activeCoins.join(",")}&lang=${currentLang}`);
      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }
      const result = await res.json();
      if (result) {
        setRadarData(result);
      }
    } catch (err) {
      console.error("Failed to load radar data:", err);
    } finally {
      setIsLoadingRadar(false);
    }
  };

  const fetchAiNews = async (currentLang = language) => {
    try {
      setIsLoadingAiNews(true);
      const res = await fetch(`/api/ai/news?lang=${currentLang}`);
      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }
      const result = await res.json();
      if (result && Array.isArray(result.data)) {
        setAiNews(result.data);
        if (result.lastFetched) {
          setAiNewsLastFetched(result.lastFetched);
        }
      }
    } catch (err) {
      console.error("Failed to load AI news feed:", err);
    } finally {
      setIsLoadingAiNews(false);
    }
  };

  const fetchAiRadar = async (activeModels = selectedAiRadarModels, currentLang = language) => {
    try {
      setIsLoadingAiRadar(true);
      const res = await fetch(`/api/ai/radar?coins=${activeModels.join(",")}&lang=${currentLang}`);
      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }
      const result = await res.json();
      if (result) {
        setAiRadarData(result);
      }
    } catch (err) {
      console.error("Failed to load AI radar data:", err);
    } finally {
      setIsLoadingAiRadar(false);
    }
  };

  const handleSelectedRadarCoinsChange = (newCoins: string[]) => {
    setSelectedRadarCoins(newCoins);
    fetchRadar(newCoins, language);
  };

  const handleSelectedAiRadarModelsChange = (newModels: string[]) => {
    setSelectedAiRadarModels(newModels);
    fetchAiRadar(newModels, language);
  };

  // Synchronized refresh trigger
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    setIsFallbackMode(false);
    setShowWarningBanner(true);
    if (activeTab === "ai_trends") {
      await Promise.all([fetchAiNews(language), fetchAiRadar(selectedAiRadarModels, language)]);
    } else {
      await Promise.all([fetchCoins(), fetchGlobalStats(), fetchNews(language), fetchRadar(selectedRadarCoins, language)]);
    }
    setIsRefreshing(false);
  };

  // Language-independent Core Data Load
  useEffect(() => {
    fetchCoins();
    fetchGlobalStats();
  }, []);

  // Language-dependent Data Load (fires on mount AND when language toggles)
  useEffect(() => {
    fetchNews(language);
    fetchRadar(selectedRadarCoins, language);
    fetchAiNews(language);
    fetchAiRadar(selectedAiRadarModels, language);
  }, [language]);

  // Play dynamic synthetic beep using Web Audio API
  const playNotificationSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.15); // C6
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.45);
      osc2.stop(ctx.currentTime + 0.45);
    } catch (err) {
      console.warn("AudioContext block:", err);
    }
  };

  // Load alerts from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("crypto_price_alerts");
      if (saved) {
        setAlerts(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load alerts:", e);
    }
  }, []);

  // Save alerts to localStorage on updates
  useEffect(() => {
    try {
      localStorage.setItem("crypto_price_alerts", JSON.stringify(alerts));
    } catch (e) {
      console.error("Failed to save alerts:", e);
    }
  }, [alerts]);

  // Monitor price threshold triggers whenever pricing data finishes updating
  useEffect(() => {
    if (coins.length === 0) return;

    setAlerts((prevAlerts) => {
      let hasUpdates = false;
      const newlyTriggered: PriceAlert[] = [];

      const updated = prevAlerts.map((alert) => {
        if (!alert.isActive) return alert;

        const currentCoin = coins.find((c) => c.id === alert.coinId);
        if (!currentCoin) return alert;

        const currentPrice = currentCoin.quotes.USD.price;
        let isTriggered = false;

        if (alert.condition === "above" && currentPrice >= alert.targetPrice) {
          isTriggered = true;
        } else if (alert.condition === "below" && currentPrice <= alert.targetPrice) {
          isTriggered = true;
        }

        if (isTriggered) {
          hasUpdates = true;
          const triggered = {
            ...alert,
            isActive: false,
            triggeredAt: new Date().toISOString(),
          };
          newlyTriggered.push(triggered);
          return triggered;
        }

        return alert;
      });

      if (hasUpdates) {
        setTriggeredAlertNotifications((prev) => [...prev, ...newlyTriggered]);
        playNotificationSound();
        return updated;
      }

      return prevAlerts;
    });
  }, [coins]);

  const handleAddAlert = (targetPrice: number, condition: "above" | "below") => {
    if (!selectedCoinForAlert) return;
    
    const newAlert: PriceAlert = {
      id: Math.random().toString(36).substring(2, 9),
      coinId: selectedCoinForAlert.id,
      coinName: selectedCoinForAlert.name,
      coinSymbol: selectedCoinForAlert.symbol,
      targetPrice,
      condition,
      createdAt: new Date().toISOString(),
      isActive: true,
      initialPriceAtCreation: selectedCoinForAlert.quotes.USD.price,
    };

    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleRemoveAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  // Filter coins based on search
  const filteredCoins = coins.filter((coin) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query)
    );
  });

  const footerT = {
    fr: {
      col1Desc: "Une plateforme complète de suivi d'actifs numériques. Clone d'apprentissage localisé en français avec données synthétisées en continu.",
      col1Copyright: "© 2026 Coinpaprika Clone FR. Tous droits réservés.",
      col2Nav: "Navigation",
      tabPrices: "Prix des Cryptos",
      tabNews: "Actualités Crypto",
      tabAi: "Agents & Modèles IA",
      tabWorkflows: "Workflows IA",
      col3Title: "Responsabilité",
      col3Desc: "Les prix et actualités sont fournis uniquement à titre indicatif et éducatif. Aucun élément présenté sur ce site ne constitue un conseil en investissement.",
      col4Title: "Technologies",
      col5Title: "À propos",
      col5Desc: "Ce clone reproduit l'identité visuelle de la version française de Coinpaprika, avec des optimisations techniques pour la fluidité d'affichage mobile et de bureau.",
      netWarnTitle: "Avertissement réseau",
      netWarnDesc: "Le serveur Coinpaprika officiel est temporairement ralenti ou le quota est restreint. Des données de secours réalistes sont actuellement servies pour assurer un service ininterrompu."
    },
    en: {
      col1Desc: "A complete platform for tracking digital assets. Learning clone localized in English with continuously synthesized data.",
      col1Copyright: "© 2026 Coinpaprika Clone EN. All rights reserved.",
      col2Nav: "Navigation",
      tabPrices: "Crypto Prices",
      tabNews: "Crypto News",
      tabAi: "AI Agents & Models",
      tabWorkflows: "AI Workflows",
      col3Title: "Disclaimer",
      col3Desc: "Prices and news are provided for informational and educational purposes only. Nothing on this site constitutes investment advice.",
      col4Title: "Technologies",
      col5Title: "About",
      col5Desc: "This clone reproduces the visual identity of Coinpaprika, with technical optimizations for seamless mobile and desktop display.",
      netWarnTitle: "Network Alert",
      netWarnDesc: "The official Coinpaprika server is temporarily slow or rate-limited. Realistic fallback data is currently being served to ensure uninterrupted service."
    }
  }[language];

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col justify-between font-sans selection:bg-brand-yellow selection:text-bg-main">
      <div>
        {/* Global Stats Bar */}
        <GlobalStatsBar
          stats={globalStats}
          currency={currency}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          language={language}
        />

        {/* AI Provider & Agent token pricing bar */}
        <AiTokenCostsBar language={language} />

        {/* Branding Navigation Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currency={currency}
          setCurrency={setCurrency}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
          setLanguage={setLanguage}
        />

        {/* Server connection error alerts */}
        {(error || isFallbackMode) && showWarningBanner && (
          <div className="max-w-7xl mx-auto px-6 mt-4">
            <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl p-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-brand-yellow uppercase tracking-wide">
                    {error ? (language === "en" ? "Connection Error" : "Erreur de connexion") : footerT.netWarnTitle}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {error ? error : footerT.netWarnDesc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWarningBanner(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-stat transition-colors cursor-pointer"
                title={language === "en" ? "Dismiss" : "Ignorer"}
              >
                <X className="w-4 h-4" />
              </button>
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
                existingAlerts={alerts}
                onSelectCoin={(coin) => setSelectedCoin(coin)}
                onSetAlert={(coin) => setSelectedCoinForAlert(coin)}
                language={language}
              />
            )
          ) : activeTab === "ai_trends" ? (
            <>
              {/* AI Radar Chart showing search intent dendrogram */}
              <div className="max-w-7xl mx-auto px-6 pt-6">
                <CryptoRadarChart
                  data={aiRadarData}
                  isLoading={isLoadingAiRadar}
                  onRefresh={() => fetchAiRadar(selectedAiRadarModels)}
                  selectedCoins={selectedAiRadarModels}
                  onSelectedCoinsChange={handleSelectedAiRadarModelsChange}
                  type="ai"
                />
              </div>

              {/* Confrontation of Trends vs News */}
              <div className="max-w-7xl mx-auto px-6">
                <TrendNewsComparer type="ai" language={language} />
              </div>

              {/* AI News Panel */}
              <NewsSection
                news={aiNews}
                isLoading={isLoadingAiNews}
                onRefresh={handleRefresh}
                lastFetched={aiNewsLastFetched}
                language={language}
                title={language === "en" ? "AI Agents & Models News Feed" : "Fils d'Actualités - Agents & Modèles IA"}
                description={language === "en" ? "Latest semantic developments across the Artificial Intelligence ecosystem" : "Dernières actualités sémantiques de l'écosystème de l'Intelligence Artificielle"}
              />
            </>
          ) : activeTab === "workflows" ? (
            <WorkflowLibrarySection searchQuery={searchQuery} />
          ) : activeTab === "p2e" ? (
            <PlayToEarnSection />
          ) : (
            <>
              {/* Crypto Radar Chart showing search intent dendrogram */}
              <div className="max-w-7xl mx-auto px-6 pt-6">
                <CryptoRadarChart
                  data={radarData}
                  isLoading={isLoadingRadar}
                  onRefresh={() => fetchRadar(selectedRadarCoins)}
                  selectedCoins={selectedRadarCoins}
                  onSelectedCoinsChange={handleSelectedRadarCoinsChange}
                  type="crypto"
                />
              </div>

              {/* Confrontation of Trends vs News */}
              <div className="max-w-7xl mx-auto px-6">
                <TrendNewsComparer type="crypto" language={language} />
              </div>

              {/* Crypto News Panel with AI translations */}
              <NewsSection
                news={news}
                isLoading={isLoadingNews}
                onRefresh={handleRefresh}
                lastFetched={newsLastFetched}
                language={language}
              />
            </>
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

      {/* Price Alert Modal */}
      {selectedCoinForAlert && (
        <PriceAlertModal
          coin={selectedCoinForAlert}
          currency={currency}
          existingAlerts={alerts}
          onAddAlert={handleAddAlert}
          onRemoveAlert={handleRemoveAlert}
          onClose={() => setSelectedCoinForAlert(null)}
        />
      )}

      {/* Triggered Alert Notifications Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {triggeredAlertNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              className="bg-bg-card border border-brand-yellow/30 shadow-2xl rounded-2xl p-4 flex gap-3 items-start pointer-events-auto border-l-4 border-l-brand-yellow"
            >
              <div className="p-2 bg-brand-yellow/10 rounded-xl text-brand-yellow shrink-0">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-brand-yellow/10 text-brand-yellow px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Alerte Déclenchée
                  </span>
                  <span className="text-[10px] text-text-secondary font-mono">
                    {new Date(notification.triggeredAt || "").toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-text-primary tracking-tight mt-1">
                  {notification.coinName} ({notification.coinSymbol})
                </h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Le seuil de{" "}
                  <strong className="text-brand-yellow font-bold">
                    {formatCurrency(notification.targetPrice, currency, notification.targetPrice > 100 ? 2 : notification.targetPrice > 1 ? 4 : 8)}
                  </strong>{" "}
                  a été franchi ({notification.condition === "above" ? "à la hausse" : "à la baisse"}).
                </p>
              </div>
              <button
                onClick={() => {
                  setTriggeredAlertNotifications((prev) =>
                    prev.filter((n) => n.id !== notification.id)
                  );
                }}
                className="p-1.5 rounded-lg hover:bg-bg-stat text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Coinpaprika-styled Footing */}
      <footer className="bg-bg-card border-t border-border-dark py-12 px-6 mt-12 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Column 1: Logotype */}
          <div className="flex flex-col gap-3">
            <span className="font-extrabold text-lg text-text-primary tracking-tight">
              coin<span className="text-brand-yellow">paprika</span>
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              {footerT.col1Desc}
            </p>
            <span className="text-[10px] text-text-secondary/60 font-mono mt-2 block">
              {footerT.col1Copyright}
            </span>
          </div>

          {/* Column 2: Navigation */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold uppercase text-text-primary tracking-widest font-mono flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-brand-yellow" />
              {footerT.col2Nav}
            </span>
            <ul className="text-xs text-text-secondary flex flex-col gap-2.5 font-mono">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("prices");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`hover:text-brand-yellow cursor-pointer transition-colors text-left flex items-center gap-2 w-full ${
                    activeTab === "prices" ? "text-brand-yellow font-bold" : ""
                  }`}
                >
                  <Coins className="w-3.5 h-3.5 shrink-0" />
                  <span>{footerT.tabPrices}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("news");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`hover:text-brand-yellow cursor-pointer transition-colors text-left flex items-center gap-2 w-full ${
                    activeTab === "news" ? "text-brand-yellow font-bold" : ""
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5 shrink-0" />
                  <span>{footerT.tabNews}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("ai_trends");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`hover:text-brand-yellow cursor-pointer transition-colors text-left flex items-center gap-2 w-full ${
                    activeTab === "ai_trends" ? "text-brand-yellow font-bold" : ""
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 shrink-0" />
                  <span>{footerT.tabAi}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("workflows");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`hover:text-brand-yellow cursor-pointer transition-colors text-left flex items-center gap-2 w-full ${
                    activeTab === "workflows" ? "text-brand-yellow font-bold" : ""
                  }`}
                >
                  <Workflow className="w-3.5 h-3.5 shrink-0" />
                  <span>{footerT.tabWorkflows}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal disclosures */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold uppercase text-text-primary tracking-widest font-mono flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-text-secondary" />
              {footerT.col3Title}
            </span>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              {footerT.col3Desc}
            </p>
          </div>

          {/* Column 4: Tech highlights */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold uppercase text-text-primary tracking-widest font-mono flex items-center gap-1.5">
              <Award className="w-4 h-4 text-text-secondary" />
              {footerT.col4Title}
            </span>
            <ul className="text-xs text-text-secondary flex flex-col gap-1.5 font-mono">
              <li>• React 19 & Vite</li>
              <li>• Node.js & Express</li>
              <li>• Gemini 3.5 (IA)</li>
              <li>• Recharts (Graphes)</li>
              <li>• Motion (Animations)</li>
            </ul>
          </div>

          {/* Column 5: Support / Community links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold uppercase text-text-primary tracking-widest font-mono flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-text-secondary" />
              {footerT.col5Title}
            </span>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              {footerT.col5Desc}
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}
