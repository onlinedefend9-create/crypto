import React, { useState } from "react";
import { NewsArticle } from "../types";
import { Sparkles, ArrowUpRight, TrendingUp, TrendingDown, Minus, Info, Newspaper } from "lucide-react";
import { motion } from "motion/react";

interface NewsSectionProps {
  news: NewsArticle[];
  isLoading: boolean;
  onRefresh: () => void;
  lastFetched?: number | null;
  title?: string;
  description?: string;
  language?: "fr" | "en";
}

export default function NewsSection({
  news,
  isLoading,
  onRefresh,
  lastFetched,
  title,
  description,
  language = "fr",
}: NewsSectionProps) {
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const t = {
    fr: {
      defaultTitle: "Actualités & Décryptage Crypto",
      defaultDesc: "Traductions en temps réel et résumés analytiques de l'actualité crypto internationale, propulsés par Gemini 3.5.",
      all: "Tous",
      bullish: "Haussier",
      neutral: "Neutre",
      bearish: "Baissier",
      allCategories: "Toutes Catégories",
      aiAnalysis: "Analyse Synthétique IA",
      aiAnalysisDesc: "Chaque article bénéficie d'une traduction et d'un résumé structurel optimisé pour la lecture rapide. Les scores de sentiment sont calculés par l'IA afin de refléter la tendance perçue du marché en temps réel.",
      noArticle: "Aucun article trouvé",
      noArticleDesc: "Aucun article ne correspond aux critères de filtrage actuellement sélectionnés.",
      source: "Source",
      activeSync: "Synchronisation arrière-plan active :",
      every10min: "(Toutes les 10 min)"
    },
    en: {
      defaultTitle: "Crypto News & Analytics",
      defaultDesc: "Real-time translations and analytical summaries of international crypto news, powered by Gemini 3.5.",
      all: "All",
      bullish: "Bullish",
      neutral: "Neutral",
      bearish: "Bearish",
      allCategories: "All Categories",
      aiAnalysis: "AI Analytical Summary",
      aiAnalysisDesc: "Each article features a structural summary and translation optimized for speed-reading. Sentiment scores are computed by AI to reflect perceived market trends in real time.",
      noArticle: "No articles found",
      noArticleDesc: "No articles match the currently selected filtering criteria.",
      source: "Source",
      activeSync: "Active background sync:",
      every10min: "(Every 10 min)"
    }
  }[language];

  const displayTitle = title || t.defaultTitle;
  const displayDescription = description || t.defaultDesc;

  const categories = ["all", ...Array.from(new Set(news.map((item) => item.category)))];

  const filteredNews = news.filter((article) => {
    const matchesSentiment = selectedSentiment === "all" || article.sentiment === selectedSentiment;
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSentiment && matchesCategory;
  });

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positif":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded bg-price-green/10 text-price-green border border-price-green/20 uppercase font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>{t.bullish}</span>
          </span>
        );
      case "négatif":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded bg-price-red/10 text-price-red border border-price-red/20 uppercase font-mono">
            <TrendingDown className="w-3 h-3" />
            <span>{t.bearish}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded bg-bg-stat text-text-secondary border border-border-dark uppercase font-mono">
            <Minus className="w-3 h-3" />
            <span>{t.neutral}</span>
          </span>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "bitcoin":
        return "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20";
      case "altcoins":
      case "modèles":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "régulation":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "defi":
      case "agents":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "sécurité":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "adoption":
        return "bg-price-green/10 text-price-green border-price-green/20";
      case "programmation":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-text-secondary/10 text-text-secondary border-border-dark";
    }
  };

  if (isLoading) {
    return (
      <section className="py-8 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-border-dark w-1/4 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-bg-card border border-border-dark rounded-xl p-5 h-64 flex flex-col justify-between animate-pulse">
              <div>
                <div className="h-4 bg-border-dark w-1/3 rounded mb-3"></div>
                <div className="h-5 bg-border-dark w-full rounded mb-2"></div>
                <div className="h-5 bg-border-dark w-4/5 rounded"></div>
              </div>
              <div className="h-10 bg-border-dark w-full rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 max-w-7xl mx-auto px-6 font-sans">
      {/* Header section with smart insights indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-border-dark pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-brand-yellow" />
              <span>{displayTitle}</span>
            </h2>
            <div className="flex items-center gap-1.5 bg-price-green/10 text-price-green text-[9px] font-bold px-2 py-0.5 rounded border border-price-green/20 font-mono">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-price-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-price-green"></span>
              </span>
              <span>RSS SYNC AUTO</span>
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {displayDescription}
          </p>
          {lastFetched && (
            <p className="text-[10px] text-text-secondary mt-1 font-mono flex items-center gap-1">
              <span>{t.activeSync}</span>
              <span className="text-brand-yellow font-bold">{new Date(lastFetched).toLocaleTimeString()}</span>
              <span className="text-[9px] text-text-secondary/60">{t.every10min}</span>
            </p>
          )}
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sentiment buttons */}
          <div className="flex bg-bg-main p-1 rounded-lg border border-border-dark text-xs">
            <button
              onClick={() => setSelectedSentiment("all")}
              className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${
                selectedSentiment === "all" ? "bg-bg-stat text-brand-yellow font-bold" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setSelectedSentiment("positif")}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
                selectedSentiment === "positif" ? "bg-price-green/20 text-price-green font-bold" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>{t.bullish}</span>
              <span className="px-1 text-[10px] rounded bg-price-green/10">
                {news.filter((n) => n.sentiment === "positif").length}
              </span>
            </button>
            <button
              onClick={() => setSelectedSentiment("neutre")}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
                selectedSentiment === "neutre" ? "bg-border-dark text-text-primary font-bold" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>{t.neutral}</span>
              <span className="px-1 text-[10px] rounded bg-bg-stat">
                {news.filter((n) => n.sentiment === "neutre").length}
              </span>
            </button>
            <button
              onClick={() => setSelectedSentiment("négatif")}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
                selectedSentiment === "négatif" ? "bg-price-red/20 text-price-red font-bold" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>{t.bearish}</span>
              <span className="px-1 text-[10px] rounded bg-price-red/10">
                {news.filter((n) => n.sentiment === "négatif").length}
              </span>
            </button>
          </div>

          {/* Category dropdown selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-bg-main border border-border-dark text-text-primary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-yellow"
          >
            <option value="all">{t.allCategories}</option>
            {categories.filter((cat) => cat !== "all").map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI disclaimer card */}
      <div className="bg-bg-card border border-border-dark rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="p-2 rounded bg-brand-yellow/10 text-brand-yellow shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-text-primary tracking-wider uppercase font-mono block">{t.aiAnalysis}</span>
          <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
            {t.aiAnalysisDesc}
          </p>
        </div>
      </div>

      {/* Grid of articles */}
      {filteredNews.length === 0 ? (
        <div className="bg-bg-main border border-border-dark border-dashed rounded-xl p-12 text-center">
          <Info className="w-8 h-8 text-text-secondary mx-auto mb-3" />
          <h3 className="text-sm font-bold text-text-primary">{t.noArticle}</h3>
          <p className="text-xs text-text-secondary mt-1">
            {t.noArticleDesc}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article, index) => (
            <motion.article
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              key={article.id}
              className="bg-bg-card border border-border-dark hover:border-text-secondary rounded-xl p-5 flex flex-col justify-between transition-all group hover:shadow-lg hover:shadow-black/20"
            >
              <div>
                {/* Meta details */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded border ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  <span className="text-[10px] text-text-secondary font-mono">
                    {article.pubDate}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-brand-yellow transition-colors">
                  {article.title}
                </h3>

                {/* Summary / Analytique */}
                <div className="mt-3 text-xs text-text-secondary leading-relaxed border-l-2 border-border-dark pl-3">
                  {article.summary}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-4 border-t border-border-dark/60 flex items-center justify-between">
                {/* Sentiment Badge */}
                {getSentimentBadge(article.sentiment)}

                {/* Direct Link */}
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-yellow hover:text-brand-yellow/80 transition-colors"
                >
                  <span>{t.source} ({article.source})</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}

