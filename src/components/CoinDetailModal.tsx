import React, { useState, useEffect } from "react";
import { Coin } from "../types";
import { formatCurrency, formatLargeNumber, formatPercent } from "../utils/formatters";
import { X, Calculator, Info, Landmark, Layers, TrendingUp, TrendingDown, Clock, ArrowRightLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";

interface CoinDetailModalProps {
  coin: Coin | null;
  currency: string;
  onClose: () => void;
}

export default function CoinDetailModal({ coin, currency, onClose }: CoinDetailModalProps) {
  const [cryptoAmount, setCryptoAmount] = useState<string>("1");
  const [fiatAmount, setFiatAmount] = useState<string>("");
  const [chartData, setChartData] = useState<any[]>([]);

  // Auto calculate fiat value when coin or cryptoAmount changes
  useEffect(() => {
    if (!coin) return;
    const usdPrice = coin.quotes.USD.price;
    let rate = 1;
    if (currency === "EUR") rate = 0.92;
    if (currency === "BTC") rate = 1 / 92450;

    const price = usdPrice * rate;
    const qty = parseFloat(cryptoAmount);
    if (!isNaN(qty)) {
      setFiatAmount((qty * price).toFixed(currency === "BTC" ? 6 : 2));
    } else {
      setFiatAmount("");
    }
  }, [cryptoAmount, coin, currency]);

  // Handle fiat input change
  const handleFiatChange = (value: string) => {
    setFiatAmount(value);
    if (!coin) return;
    const usdPrice = coin.quotes.USD.price;
    let rate = 1;
    if (currency === "EUR") rate = 0.92;
    if (currency === "BTC") rate = 1 / 92450;

    const price = usdPrice * rate;
    const fiatVal = parseFloat(value);
    if (!isNaN(fiatVal) && price > 0) {
      setCryptoAmount((fiatVal / price).toFixed(6));
    } else {
      setCryptoAmount("");
    }
  };

  // Generate gorgeous, organic mock historical data that matches the exact coin's current characteristics
  useEffect(() => {
    if (!coin) return;
    
    const currentPrice = coin.quotes.USD.price;
    const percentChange24h = coin.quotes.USD.percent_change_24h;
    const percentChange7d = coin.quotes.USD.percent_change_7d;
    
    const pointsCount = 30;
    const generatedData = [];
    const now = Date.now();
    
    // Simulate organic price curves
    let price = currentPrice / (1 + percentChange24h / 100);
    for (let i = pointsCount; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const factor = (pointsCount - i) / pointsCount;
      
      // Multi-frequency sine waves + noise to simulate highly organic market cycles
      const cycle1 = Math.sin(factor * Math.PI * 4) * 0.05;
      const cycle2 = Math.cos(factor * Math.PI * 8) * 0.02;
      const trend = (percentChange7d / 100) * (factor - 0.5) * 1.5;
      const noise = (Math.random() - 0.5) * 0.03;
      
      const multiplier = 1 + trend + cycle1 + cycle2 + noise;
      const pointPrice = currentPrice * multiplier;
      
      generatedData.push({
        date: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        price: Number(pointPrice.toFixed(currentPrice > 100 ? 2 : currentPrice > 1 ? 4 : 8)),
      });
    }

    // Force last point to match the exact current price
    if (generatedData.length > 0) {
      generatedData[generatedData.length - 1].price = currentPrice;
    }
    setChartData(generatedData);
  }, [coin]);

  if (!coin) return null;

  const usdQuote = coin.quotes.USD;
  const isPositive24h = usdQuote.percent_change_24h >= 0;
  
  // Choose currency rate multiplier
  let rate = 1;
  let currencySymbol = "$";
  if (currency === "EUR") {
    rate = 0.92;
    currencySymbol = "€";
  } else if (currency === "BTC") {
    rate = 1 / 92450;
    currencySymbol = "₿";
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#0b0e11]/85 backdrop-blur-md font-sans">
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative bg-bg-card border border-border-dark rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="absolute top-6 right-6 p-1.5 rounded-lg bg-bg-main border border-border-dark text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-border-dark/60 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-yellow flex items-center justify-center text-base font-extrabold text-bg-main shadow-lg">
                {coin.symbol.slice(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-text-primary">{coin.name}</h1>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-bg-main text-brand-yellow border border-border-dark font-mono">
                    Rang #{coin.rank}
                  </span>
                </div>
                <p className="text-xs text-text-secondary font-bold tracking-widest font-mono uppercase mt-0.5">
                  {coin.symbol} / {currency}
                </p>
              </div>
            </div>

            {/* Price display with changes */}
            <div className="flex flex-col md:items-end">
              <span className="text-2xl md:text-3xl font-extrabold text-text-primary font-mono">
                {formatCurrency(usdQuote.price, currency, usdQuote.price > 100 ? 2 : usdQuote.price > 1 ? 4 : 8)}
              </span>
              <div className="flex items-center gap-3 mt-1.5 text-xs">
                <span className="text-text-secondary">24h :</span>
                <span className={`font-mono font-bold flex items-center gap-0.5 ${isPositive24h ? "text-price-green" : "text-price-red"}`}>
                  {isPositive24h ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {formatPercent(usdQuote.percent_change_24h)}
                </span>
                <span className="text-border-dark">|</span>
                <span className="text-text-secondary">7j :</span>
                <span className={`font-mono font-semibold ${usdQuote.percent_change_7d >= 0 ? "text-price-green" : "text-price-red"}`}>
                  {formatPercent(usdQuote.percent_change_7d)}
                </span>
              </div>
            </div>
          </div>

          {/* Grid Layout: Chart & Quick Converter / Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart Area (2/3 columns on large screens) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-text-primary font-mono flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-yellow" />
                  Historique 30 Jours (Simulation Réaliste)
                </span>
                <span className="text-[10px] text-text-secondary font-mono">USD</span>
              </div>
              
              {/* Recharts Area Chart container */}
              <div className="h-64 bg-bg-main/40 border border-border-dark rounded-2xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f0b90b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f0b90b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="#848e9c"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#848e9c"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#181a20", borderColor: "#2b2f36", borderRadius: "12px" }}
                      labelClassName="text-text-secondary text-xs font-sans font-bold"
                      itemStyle={{ color: "#eaecef", fontSize: "11px", fontFamily: "monospace" }}
                      formatter={(val: number) => [`$ ${val}`, "Prix"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#f0b90b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Extra technical tags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-bg-main/40 border border-border-dark/60 rounded-xl p-3">
                  <span className="text-[10px] text-text-secondary block font-bold uppercase tracking-wider">ATH Historique</span>
                  <span className="font-mono text-xs font-bold text-text-primary block mt-1">
                    {usdQuote.ath_price ? `$ ${usdQuote.ath_price.toFixed(2)}` : "N/A"}
                  </span>
                </div>
                <div className="bg-bg-main/40 border border-border-dark/60 rounded-xl p-3">
                  <span className="text-[10px] text-text-secondary block font-bold uppercase tracking-wider">Écart ATH</span>
                  <span className="font-mono text-xs font-bold text-price-red block mt-1">
                    {usdQuote.percent_from_price_ath ? `${usdQuote.percent_from_price_ath.toFixed(1)}%` : "N/A"}
                  </span>
                </div>
                <div className="bg-bg-main/40 border border-border-dark/60 rounded-xl p-3">
                  <span className="text-[10px] text-text-secondary block font-bold uppercase tracking-wider">Volume 24h</span>
                  <span className="font-mono text-xs font-bold text-text-primary block mt-1">
                    {formatCurrency(usdQuote.volume_24h, "USD", 0)}
                  </span>
                </div>
                <div className="bg-bg-main/40 border border-border-dark/60 rounded-xl p-3">
                  <span className="text-[10px] text-text-secondary block font-bold uppercase tracking-wider">Dominance</span>
                  <span className="font-mono text-xs font-bold text-brand-yellow block mt-1">
                    {coin.symbol === "BTC" ? "58.1%" : coin.symbol === "ETH" ? "13.2%" : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Calculator Convertisseur & Metrics Panel */}
            <div className="flex flex-col gap-6">
              {/* Localized Calculator Converter */}
              <div className="bg-bg-stat border border-border-dark rounded-2xl p-5 shadow-lg">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow font-mono flex items-center gap-2 mb-4 border-b border-border-dark pb-2">
                  <Calculator className="w-4 h-4" />
                  Convertisseur en Direct
                </h3>

                <div className="flex flex-col gap-3">
                  {/* Crypto Input Box */}
                  <div className="bg-bg-main border border-border-dark rounded-xl p-3 flex flex-col">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider font-mono">
                      Quantité {coin.symbol}
                    </label>
                    <div className="flex items-center mt-1">
                      <input
                        type="number"
                        value={cryptoAmount}
                        onChange={(e) => setCryptoAmount(e.target.value)}
                        className="bg-transparent text-text-primary font-mono text-sm focus:outline-none w-full"
                        placeholder="0.0"
                      />
                      <span className="text-xs font-bold text-brand-yellow font-mono ml-2">
                        {coin.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Intersect icon */}
                  <div className="flex justify-center -my-1 z-10">
                    <div className="p-1.5 rounded-full bg-bg-card border border-border-dark text-text-secondary">
                      <ArrowRightLeft className="w-3.5 h-3.5 rotate-90" />
                    </div>
                  </div>

                  {/* Fiat/Value Input Box */}
                  <div className="bg-bg-main border border-border-dark rounded-xl p-3 flex flex-col">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider font-mono">
                      Équivalence {currency}
                    </label>
                    <div className="flex items-center mt-1">
                      <input
                        type="number"
                        value={fiatAmount}
                        onChange={(e) => handleFiatChange(e.target.value)}
                        className="bg-transparent text-text-primary font-mono text-sm focus:outline-none w-full"
                        placeholder="0.0"
                      />
                      <span className="text-xs font-bold text-text-secondary font-mono ml-2">
                        {currencySymbol}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-text-secondary mt-3 text-center italic">
                  Calculé sur un cours de 1 {coin.symbol} ={" "}
                  {formatCurrency(usdQuote.price, currency, usdQuote.price > 100 ? 2 : usdQuote.price > 1 ? 4 : 8)}
                </p>
              </div>

              {/* General details table */}
              <div className="bg-bg-main/40 border border-border-dark rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-text-secondary font-mono flex items-center gap-2 border-b border-border-dark pb-2">
                  <Info className="w-4 h-4 text-text-secondary" />
                  Caractéristiques d'Émission
                </h3>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-text-secondary" />
                    Offre Circulante
                  </span>
                  <span className="font-mono font-bold text-text-primary">
                    {coin.circulating_supply ? formatLargeNumber(coin.circulating_supply) : "N/A"} {coin.symbol}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-text-secondary" />
                    Offre Maximale
                  </span>
                  <span className="font-mono font-bold text-text-primary">
                    {coin.max_supply ? formatLargeNumber(coin.max_supply) : "Illimitée"} {coin.symbol}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-border-dark/50">
                  <span className="text-text-secondary">Volume 24h / Cap</span>
                  <span className="font-mono text-text-secondary">
                    {((usdQuote.volume_24h / usdQuote.market_cap) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

