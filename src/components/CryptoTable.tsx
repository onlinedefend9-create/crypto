import React, { useState } from "react";
import { Coin, PriceAlert } from "../types";
import { formatCurrency, generateSparklinePoints } from "../utils/formatters";
import { ArrowUpDown, ChevronLeft, ChevronRight, Eye, Bell } from "lucide-react";
import { motion } from "motion/react";

interface CryptoTableProps {
  coins: Coin[];
  currency: string;
  existingAlerts: PriceAlert[];
  onSelectCoin: (coin: Coin) => void;
  onSetAlert: (coin: Coin) => void;
  language?: "fr" | "en";
}

type SortField = "rank" | "price" | "change_24h" | "market_cap" | "volume_24h";
type SortOrder = "asc" | "desc";

export default function CryptoTable({
  coins,
  currency,
  existingAlerts,
  onSelectCoin,
  onSetAlert,
  language = "fr",
}: CryptoTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Localized texts
  const t = {
    fr: {
      title: "Marché des Actifs Numériques",
      desc: "Tri et filtres interactifs en direct. Cliquez sur une cryptomonnaie pour ouvrir ses graphiques avancés.",
      showBy: "Afficher par:",
      colPrice: "Prix",
      colMarketCap: "Cap. de marché",
      colVolume: "Volume 24h",
      colTrend: "Tendance 24h",
      colActions: "Actions",
      p1: "Affichage de",
      p2: "à",
      p3: "sur",
      p4: "cryptomonnaies",
      viewDetails: "Voir les détails",
      setAlert: "Définir une alerte de prix"
    },
    en: {
      title: "Digital Asset Market",
      desc: "Live interactive sorting and filtering. Click on a cryptocurrency to open its advanced charts.",
      showBy: "Show by:",
      colPrice: "Price",
      colMarketCap: "Market Cap",
      colVolume: "Volume 24h",
      colTrend: "24h Trend",
      colActions: "Actions",
      p1: "Showing",
      p2: "to",
      p3: "of",
      p4: "cryptocurrencies",
      viewDetails: "View details",
      setAlert: "Set price alert"
    }
  }[language];

  // Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to desc for new fields
    }
  };

  const sortedCoins = [...coins].sort((a, b) => {
    let aValue: number = 0;
    let bValue: number = 0;

    switch (sortField) {
      case "rank":
        aValue = a.rank;
        bValue = b.rank;
        break;
      case "price":
        aValue = a.quotes.USD.price;
        bValue = b.quotes.USD.price;
        break;
      case "change_24h":
        aValue = a.quotes.USD.percent_change_24h;
        bValue = b.quotes.USD.percent_change_24h;
        break;
      case "market_cap":
        aValue = a.quotes.USD.market_cap;
        bValue = b.quotes.USD.market_cap;
        break;
      case "volume_24h":
        aValue = a.quotes.USD.volume_24h;
        bValue = b.quotes.USD.volume_24h;
        break;
    }

    if (sortOrder === "asc") {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedCoins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedCoins.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Helper to draw a solid color badge based on change
  const renderChangeBadge = (change: number | undefined) => {
    if (change === undefined) return <span className="text-text-secondary font-mono">-</span>;
    const isPositive = change >= 0;
    return (
      <span
        className={`font-mono font-bold text-xs ${
          isPositive ? "text-price-green" : "text-price-red"
        }`}
      >
        {isPositive ? "+" : ""}
        {change.toFixed(2)}%
      </span>
    );
  };

  // Custom visual indicator for coin rank badge
  const renderRankBadge = (rank: number) => {
    if (rank === 1) return "bg-brand-yellow text-bg-main font-bold shadow-sm shadow-brand-yellow/20";
    if (rank === 2) return "bg-border-dark text-text-primary font-bold";
    if (rank === 3) return "bg-bg-stat text-text-primary border border-border-dark font-bold";
    return "bg-bg-main text-text-secondary";
  };

  // Generate color index based on coin name string
  const getAvatarStyle = (symbol: string) => {
    const code = symbol.charCodeAt(0) + (symbol.charCodeAt(1) || 0);
    const colors = [
      "from-[#f7931a] to-[#f7931a]/80 shadow-orange-950/15",
      "from-[#627eea] to-[#627eea]/80 shadow-blue-950/15",
      "from-[#26a17b] to-[#26a17b]/80 shadow-emerald-950/15",
      "from-purple-500 to-purple-600/80 shadow-purple-950/15",
      "from-pink-500 to-pink-600/80 shadow-pink-950/15",
      "from-sky-500 to-sky-600/80 shadow-sky-950/15"
    ];
    return colors[code % colors.length];
  };

  return (
    <div className="bg-bg-card border border-border-dark rounded-2xl p-4 md:p-6 shadow-xl max-w-7xl mx-auto my-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
            <span>{t.title}</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t.desc}
          </p>
        </div>

        {/* Items per page selector */}
        <div className="flex items-center gap-2 text-xs text-text-secondary self-end sm:self-auto">
          <span>{t.showBy}</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-bg-main border border-border-dark text-text-primary rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-yellow"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Main Cryptocurrencies Table */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-border-dark text-[11px] font-bold tracking-wider uppercase text-text-secondary">
              <th
                onClick={() => handleSort("rank")}
                className="py-3 px-4 cursor-pointer hover:text-text-primary transition-colors select-none w-16"
              >
                <div className="flex items-center gap-1">
                  <span>#</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Crypto</th>
              <th
                onClick={() => handleSort("price")}
                className="py-3 px-4 text-right cursor-pointer hover:text-text-primary transition-colors select-none"
              >
                <div className="flex items-center gap-1 justify-end">
                  <span>{t.colPrice}</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">1h</th>
              <th
                onClick={() => handleSort("change_24h")}
                className="py-3 px-4 text-right cursor-pointer hover:text-text-primary transition-colors select-none"
              >
                <div className="flex items-center gap-1 justify-end">
                  <span>24h</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">7j</th>
              <th
                onClick={() => handleSort("market_cap")}
                className="py-3 px-4 text-right cursor-pointer hover:text-text-primary transition-colors select-none"
              >
                <div className="flex items-center gap-1 justify-end">
                  <span>{t.colMarketCap}</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("volume_24h")}
                className="py-3 px-4 text-right cursor-pointer hover:text-text-primary transition-colors select-none"
              >
                <div className="flex items-center gap-1 justify-end">
                  <span>{t.colVolume}</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">{t.colTrend}</th>
              <th className="py-3 px-4 text-center w-24">{t.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((coin, index) => {
              const usdQuote = coin.quotes.USD;
              const isPositive24h = usdQuote.percent_change_24h >= 0;
              const hasActiveAlert = existingAlerts.some((alert) => alert.coinId === coin.id && alert.isActive);

              return (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  key={coin.id}
                  onClick={() => onSelectCoin(coin)}
                  className="border-b border-border-dark/60 hover:bg-bg-stat/40 transition-colors cursor-pointer group"
                >
                  {/* Rank */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 text-[10px] font-bold rounded font-mono ${renderRankBadge(
                        coin.rank
                      )}`}
                    >
                      {coin.rank}
                    </span>
                  </td>

                  {/* Coin Details (Avatar, Name, Symbol) */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAvatarStyle(coin.symbol)} flex items-center justify-center text-[10px] font-mono font-extrabold text-white shadow-md`}>
                        {coin.symbol.slice(0, 3)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary group-hover:text-brand-yellow transition-colors leading-tight">
                          {coin.name}
                        </span>
                        <span className="text-[10px] text-text-secondary font-bold tracking-wider font-mono uppercase mt-0.5">
                          {coin.symbol}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 text-right font-mono font-bold text-text-primary">
                    {formatCurrency(usdQuote.price, currency, usdQuote.price > 100 ? 2 : usdQuote.price > 1 ? 4 : 8)}
                  </td>

                  {/* 1h Change */}
                  <td className="py-4 px-4 text-right">
                    {renderChangeBadge(usdQuote.percent_change_1h)}
                  </td>

                  {/* 24h Change */}
                  <td className="py-4 px-4 text-right">
                    {renderChangeBadge(usdQuote.percent_change_24h)}
                  </td>

                  {/* 7d Change */}
                  <td className="py-4 px-4 text-right">
                    {renderChangeBadge(usdQuote.percent_change_7d)}
                  </td>

                  {/* Market Cap */}
                  <td className="py-4 px-4 text-right font-mono text-text-primary text-xs">
                    {formatCurrency(usdQuote.market_cap, currency, 0)}
                  </td>

                  {/* 24h Volume */}
                  <td className="py-4 px-4 text-right font-mono text-text-secondary text-xs">
                    {formatCurrency(usdQuote.volume_24h, currency, 0)}
                  </td>

                  {/* Trend Sparkline Canvas (Simple inline SVG path) */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-block">
                      <svg className="w-16 h-7 overflow-visible" strokeWidth="1.5" fill="none">
                        <path
                          d={generateSparklinePoints(
                            usdQuote.price,
                            usdQuote.percent_change_24h,
                            usdQuote.percent_change_7d,
                            64,
                            24
                          )}
                          className={isPositive24h ? "stroke-price-green" : "stroke-price-red"}
                        />
                      </svg>
                    </div>
                  </td>

                  {/* Fast Action Clickers */}
                  <td className="py-4 px-4 text-center" onClick={(e) => { e.stopPropagation(); }}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectCoin(coin)}
                        className="p-1.5 rounded-lg bg-bg-main border border-border-dark text-text-secondary hover:text-brand-yellow hover:border-brand-yellow/30 transition-all cursor-pointer"
                        title={t.viewDetails}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSetAlert(coin)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          hasActiveAlert
                            ? "bg-brand-yellow/15 border-brand-yellow text-brand-yellow shadow-sm shadow-brand-yellow/10 animate-pulse"
                            : "bg-bg-main border-border-dark text-text-secondary hover:text-brand-yellow hover:border-brand-yellow/30"
                        }`}
                        title={t.setAlert}
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-dark">
          <span className="text-xs text-text-secondary">
            {t.p1} <span className="font-bold text-text-primary">{indexOfFirstItem + 1}</span> {t.p2}{" "}
            <span className="font-bold text-text-primary">
              {Math.min(indexOfLastItem, sortedCoins.length)}
            </span>{" "}
            {t.p3} <span className="font-bold text-text-primary">{sortedCoins.length}</span> {t.p4}
          </span>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-border-dark bg-bg-main text-text-secondary hover:text-text-primary hover:border-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, i, arr) => {
                const prev = arr[i - 1];
                const showEllipsis = prev && page - prev > 1;

                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-1 text-border-dark">...</span>}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold ${
                        currentPage === page
                          ? "bg-brand-yellow border-brand-yellow text-bg-main"
                          : "border-border-dark bg-bg-main text-text-secondary hover:border-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-border-dark bg-bg-main text-text-secondary hover:text-text-primary hover:border-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

