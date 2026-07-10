import React from "react";
import { GlobalStats } from "../types";
import { formatCurrency, formatPercent, formatLargeNumber } from "../utils/formatters";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface GlobalStatsBarProps {
  stats: GlobalStats | null;
  currency: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function GlobalStatsBar({ stats, currency, onRefresh, isRefreshing }: GlobalStatsBarProps) {
  if (!stats) {
    return (
      <div className="bg-bg-stat text-text-secondary text-xs py-2 px-6 border-b border-border-dark flex justify-between items-center h-8 animate-pulse">
        <div className="h-4 bg-border-dark w-1/3 rounded"></div>
        <div className="h-4 bg-border-dark w-1/12 rounded"></div>
      </div>
    );
  }

  const isCapPositive = stats.market_cap_change_24h >= 0;

  return (
    <div className="bg-bg-stat text-text-secondary text-[12px] h-auto md:h-8 py-2 md:py-0 px-6 border-b border-border-dark flex flex-wrap gap-y-2 justify-between items-center font-sans">
      <div className="flex flex-wrap items-center gap-x-5 md:gap-x-6">
        <div className="flex items-center gap-1">
          <span>Cryptos:</span>
          <span className="font-semibold text-text-primary font-mono">
            {formatLargeNumber(stats.cryptocurrencies_number)}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <span>Cap. Globale:</span>
          <span className="font-semibold text-text-primary font-mono">
            {formatCurrency(stats.market_cap_usd, currency, 0)}
          </span>
          <span
            className={`flex items-center font-mono font-medium ${
              isCapPositive ? "text-price-green" : "text-price-red"
            }`}
          >
            {isCapPositive ? (
              <TrendingUp className="w-3 h-3 mr-0.5 inline" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-0.5 inline" />
            )}
            {formatPercent(stats.market_cap_change_24h)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span>Vol. 24h:</span>
          <span className="font-semibold text-price-green font-mono">
            {formatCurrency(stats.volume_24h_usd, currency, 0)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span>Dominance BTC:</span>
          <span className="font-semibold text-brand-yellow font-mono">
            {stats.bitcoin_dominance_percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      <button
        onClick={onRefresh}
        className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-brand-yellow transition-colors cursor-pointer bg-bg-card border border-border-dark px-2.5 py-0.5 rounded ml-auto md:ml-0"
        title="Actualiser les prix et actualités"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-brand-yellow" : ""}`} />
        <span>Actualiser</span>
      </button>
    </div>
  );
}

