import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  Shuffle, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  ArrowRightLeft, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  Zap
} from "lucide-react";

interface CoinComparison {
  symbol: string;
  price: string;
  change24h: string;
  sentiment: "haussier" | "baissier" | "neutre" | string;
  comparison: string;
  catalyst: string;
}

interface ComparisonData {
  summary: string;
  alignmentScore: number;
  alignmentLabel: string;
  coins: CoinComparison[];
  conclusion: string;
}

interface TrendNewsComparerProps {
  type?: "crypto" | "ai";
  language?: "fr" | "en";
}

export const TrendNewsComparer: React.FC<TrendNewsComparerProps> = ({ type = "crypto", language = "fr" }) => {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = type === "ai" 
        ? `/api/ai/compare-trends-news?lang=${language}` 
        : `/api/compare-trends-news?lang=${language}`;
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Erreur serveur: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(language === "en" ? "Unable to load comparison analysis." : "Impossible de charger l'analyse comparative.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [type, language]);

  // Helper to color-code sentiment
  const getSentimentStyles = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes("haussier") || s.includes("bullish") || s.includes("positif")) {
      return {
        bg: "bg-price-green/10 border-price-green/20",
        text: "text-price-green",
        icon: <TrendingUp className="h-4 w-4" />
      };
    }
    if (s.includes("baissier") || s.includes("bearish") || s.includes("négatif")) {
      return {
        bg: "bg-price-red/10 border-price-red/20",
        text: "text-price-red",
        icon: <TrendingDown className="h-4 w-4" />
      };
    }
    return {
      bg: "bg-text-secondary/10 border-text-secondary/20",
      text: "text-text-secondary",
      icon: <Shuffle className="h-4 w-4" />
    };
  };

  // Helper to color-code alignment score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-price-green";
    if (score >= 50) return "text-brand-yellow";
    return "text-price-red";
  };

  const getLocalizedTitle = () => {
    if (language === "en") {
      return type === "ai" 
        ? "Confrontation: News vs. Model Value" 
        : "Confrontation: News vs. Market Trends";
    }
    return type === "ai" 
      ? "Confrontation : News vs. Valeur des Modèles" 
      : "Confrontation : News vs. Tendances du Marché";
  };

  const getLocalizedDescription = () => {
    if (language === "en") {
      return type === "ai"
        ? "Instant cognitive analysis measuring the alignment between media hype and perceived value of large language models."
        : "Instant cognitive analysis measuring the alignment between media hype and real price charts.";
    }
    return type === "ai"
      ? "Analyse cognitive instantanée mesurant l'adéquation entre l'effervescence médiatique et la valeur perçue des grands modèles de langage."
      : "Analyse cognitive instantanée mesurant l'adéquation entre l'effervescence médiatique et les courbes de prix réelles.";
  };

  return (
    <div id="trend-news-comparer" className="w-full bg-bg-card border border-border-dark rounded-2xl p-6 relative overflow-hidden mt-6">
      {/* Decorative background grid/radial glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-brand-yellow/10 p-1.5 rounded-lg border border-brand-yellow/20">
              <ArrowRightLeft className="h-5 w-5 text-brand-yellow" />
            </div>
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              {getLocalizedTitle()}
            </h3>
            <span className="bg-brand-yellow/15 text-brand-yellow text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> {language === "en" ? "AI Synthesis" : "IA Synthèse"}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {getLocalizedDescription()}
          </p>
        </div>

        <button
          onClick={fetchComparison}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-main hover:bg-bg-stat text-text-primary border border-border-dark text-xs rounded-lg transition disabled:opacity-50 select-none"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{language === "en" ? "Recalculate correlation" : "Recalculer la corrélation"}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-yellow/10 border-t-brand-yellow"></div>
            <Zap className="absolute text-brand-yellow h-5 w-5 animate-pulse" />
          </div>
          <p className="mt-4 text-sm text-text-primary font-medium">
            {language === "en" ? "Comparative analysis in progress..." : "Analyse comparative en cours..."}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {language === "en" 
              ? "Polling the market and filtering media sentiment..." 
              : "Sondage du marché et filtrage des sentiments médiatiques..."}
          </p>
        </div>
      ) : error || !data ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-text-secondary text-sm">
          <p>{error || (language === "en" ? "Data unavailable." : "Données indisponibles.")}</p>
          <button
            onClick={fetchComparison}
            className="mt-4 px-4 py-2 bg-brand-yellow text-bg-main font-semibold text-xs rounded-lg transition"
          >
            {language === "en" ? "Retry" : "Réessayer"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Banner with Score Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-bg-main border border-border-dark rounded-xl p-5 items-center">
            {/* Score Wheel */}
            <div className="col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border-dark pb-4 md:pb-0 md:pr-6">
              <div className="relative flex items-center justify-center w-28 h-28">
                {/* Simulated circle path */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#1f2226"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#f0b90b"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={2 * Math.PI * 46 * (1 - data.alignmentScore / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold font-mono text-text-primary">
                    {data.alignmentScore}%
                  </span>
                  <span className={`text-[10px] font-bold tracking-wide uppercase text-center max-w-[85px] leading-tight ${getScoreColor(data.alignmentScore)}`}>
                    {data.alignmentLabel}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-text-secondary mt-2 text-center">
                {language === "en"
                  ? (type === "ai" ? "AI & Models Relevance Index" : "News-Market Correlation Index")
                  : (type === "ai" ? "Indice de pertinence IA & Modèles" : "Indice de corrélation News-Marché")}
              </p>
            </div>

            {/* AI Narrative Summary */}
            <div className="col-span-1 md:col-span-3 space-y-3">
              <div className="flex items-center gap-2 text-brand-yellow">
                <Lightbulb className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === "en" ? "Cognitive Synthesis Report" : "Note de synthèse cognitive"}
                </h4>
              </div>
              <p className="text-sm text-text-primary leading-relaxed">
                {data.summary}
              </p>
              <div className="flex items-center gap-2 text-xs text-text-secondary pt-1.5 border-t border-t-border-dark/60">
                {data.alignmentScore >= 75 ? (
                  <CheckCircle className="h-3.5 w-3.5 text-price-green" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-brand-yellow" />
                )}
                <span>
                  {data.alignmentScore >= 75 
                    ? (language === "en"
                        ? (type === "ai" 
                            ? "Models and prices are reacting rationally to current rumors and announcements."
                            : "Prices are reacting rationally and proportionally to current rumors and announcements.")
                        : (type === "ai" 
                            ? "Les modèles et tarifs réagissent de manière rationnelle aux rumeurs et annonces actuelles."
                            : "Les prix réagissent de manière rationnelle et proportionnelle aux rumeurs et annonces actuelles."))
                    : (language === "en"
                        ? (type === "ai"
                            ? "Perception divergence detected. The community is ignoring some underlying ecosystem signals."
                            : "Behavior divergence detected. The market is ignoring some key news signals.")
                        : (type === "ai"
                            ? "Divergence de perception détectée. La communauté ignore certains signaux de fond de l'écosystème."
                            : "Divergence de comportement détectée. Le marché ignore certains signaux clés de l'actualité."))}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Per Coin */}
          <div>
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
              {language === "en"
                ? (type === "ai" ? "Confrontation by Model & Actor" : "Confrontation by Major Asset")
                : (type === "ai" ? "Confrontation par Modèle & Acteur" : "Confrontation par Actif Majeur")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.coins.map((coin) => {
                const sentimentStyles = getSentimentStyles(coin.sentiment);
                const isPositive = !coin.change24h.includes("-");
                return (
                  <motion.div
                    key={coin.symbol}
                    whileHover={{ y: -4 }}
                    className="bg-bg-main border border-border-dark rounded-xl p-4 flex flex-col justify-between transition-all"
                  >
                    <div className="space-y-3">
                      {/* Top Bar with symbol and price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-primary text-base">{coin.symbol}</span>
                          <span className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded ${sentimentStyles.bg} ${sentimentStyles.text} border flex items-center gap-1`}>
                            {sentimentStyles.icon} {coin.sentiment}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold font-mono text-text-primary">{coin.price}</p>
                          <p className={`text-[10px] font-semibold font-mono ${isPositive ? "text-price-green" : "text-price-red"}`}>
                            {coin.change24h}
                          </p>
                        </div>
                      </div>

                      {/* Catalyst Banner */}
                      <div className="bg-bg-card/80 border border-border-dark rounded-lg px-2.5 py-1.5">
                        <span className="text-[9px] text-text-secondary block font-semibold uppercase tracking-wider">
                          {language === "en" ? "Key Catalyst" : "Catalyseur Clé"}
                        </span>
                        <span className="text-xs text-brand-yellow font-bold mt-0.5 block">
                          {coin.catalyst}
                        </span>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-text-secondary leading-relaxed pt-1">
                        {coin.comparison}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-dark/60 flex items-center justify-between text-[10px] text-text-secondary">
                      <span>
                        {language === "en"
                          ? (type === "ai" ? "Source: AI Research & RSS" : "Source: Coinpaprika & RSS")
                          : (type === "ai" ? "Source : AI Research & RSS" : "Source : Coinpaprika & RSS")}
                      </span>
                      <span className="text-brand-yellow/80 font-mono">
                        {language === "en" ? "Analyzed live" : "Analysé en direct"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Verdict Card */}
          <div className="bg-brand-yellow/5 border border-brand-yellow/20 rounded-xl p-4 flex gap-3.5 items-start">
            <div className="bg-brand-yellow/10 p-2 rounded-lg text-brand-yellow mt-0.5 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-brand-yellow uppercase tracking-wider">
                {language === "en"
                  ? (type === "ai" ? "Verdict & AI Impact Synthesis" : "Verdict & Arbitrage Outlook")
                  : (type === "ai" ? "Verdict & Synthèse d'Impact IA" : "Verdict & Perspective Arbitrage")}
              </h5>
              <p className="text-xs text-text-primary leading-relaxed mt-1">
                {data.conclusion}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
