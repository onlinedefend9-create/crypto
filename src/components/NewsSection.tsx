import React, { useState } from "react";
import { NewsArticle } from "../types";
import { Sparkles, ArrowUpRight, TrendingUp, TrendingDown, Minus, Info, Newspaper } from "lucide-react";
import { motion } from "motion/react";

interface NewsSectionProps {
  news: NewsArticle[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function NewsSection({ news, isLoading, onRefresh }: NewsSectionProps) {
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
            <span>Haussier (Positive)</span>
          </span>
        );
      case "négatif":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded bg-price-red/10 text-price-red border border-price-red/20 uppercase font-mono">
            <TrendingDown className="w-3 h-3" />
            <span>Baissier (Negative)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded bg-bg-stat text-text-secondary border border-border-dark uppercase font-mono">
            <Minus className="w-3 h-3" />
            <span>Neutre</span>
          </span>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "bitcoin":
        return "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20";
      case "altcoins":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "régulation":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "defi":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "sécurité":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "adoption":
        return "bg-price-green/10 text-price-green border-price-green/20";
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
          <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-brand-yellow" />
            <span>Actualités & Décryptage IA</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Traductions en temps réel et résumés analytiques de l'actualité crypto internationale, propulsés par Gemini 3.5.
          </p>
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
              Tous
            </button>
            <button
              onClick={() => setSelectedSentiment("positif")}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-colors ${
                selectedSentiment === "positif" ? "bg-price-green/20 text-price-green font-bold" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>Haussier</span>
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
              <span>Neutre</span>
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
              <span>Baissier</span>
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
            <option value="all">Toutes Catégories</option>
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
          <span className="text-[11px] font-bold text-text-primary tracking-wider uppercase font-mono block">Analyse Synthétique IA</span>
          <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
            Chaque article bénéficie d'une traduction et d'un résumé structurel optimisé pour la lecture rapide. Les scores de sentiment sont calculés par l'IA afin de refléter la tendance perçue du marché en temps réel.
          </p>
        </div>
      </div>

      {/* Grid of articles */}
      {filteredNews.length === 0 ? (
        <div className="bg-bg-main border border-border-dark border-dashed rounded-xl p-12 text-center">
          <Info className="w-8 h-8 text-text-secondary mx-auto mb-3" />
          <h3 className="text-sm font-bold text-text-primary">Aucun article trouvé</h3>
          <p className="text-xs text-text-secondary mt-1">
            Aucun article ne correspond aux critères de filtrage actuellement sélectionnés.
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
                  <span>Source ({article.source})</span>
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

