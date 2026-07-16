import React, { useState } from "react";
import { Coin, PriceAlert } from "../types";
import { formatCurrency } from "../utils/formatters";
import { X, Bell, Trash2, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PriceAlertModalProps {
  coin: Coin;
  currency: string;
  existingAlerts: PriceAlert[];
  onAddAlert: (targetPrice: number, condition: "above" | "below") => void;
  onRemoveAlert: (alertId: string) => void;
  onClose: () => void;
}

export default function PriceAlertModal({
  coin,
  currency,
  existingAlerts,
  onAddAlert,
  onRemoveAlert,
  onClose,
}: PriceAlertModalProps) {
  const currentPrice = coin.quotes.USD.price;
  const [targetPrice, setTargetPrice] = useState<string>(currentPrice.toString());
  const [condition, setCondition] = useState<"above" | "below">(
    // Default condition based on input relative to current price
    "above"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter alerts belonging to this coin
  const coinAlerts = existingAlerts.filter((alert) => alert.coinId === coin.id);

  // Quick percent helpers
  const applyPercentage = (percent: number) => {
    const value = currentPrice * (1 + percent / 100);
    // Keep 2, 4, or 8 decimals based on price magnitude
    const decimals = value > 100 ? 2 : value > 1 ? 4 : 8;
    setTargetPrice(value.toFixed(decimals));
    setCondition(percent >= 0 ? "above" : "below");
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(targetPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage("Veuillez entrer un prix cible valide supérieur à 0.");
      return;
    }

    if (parsedPrice === currentPrice) {
      setErrorMessage("Le prix cible doit être différent du prix actuel.");
      return;
    }

    // Auto-correct condition if it doesn't match the logic (e.g. above when price is lower)
    const finalCondition = parsedPrice > currentPrice ? "above" : "below";

    onAddAlert(parsedPrice, finalCondition);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* Backdrop closer */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-bg-card border border-border-dark rounded-2xl shadow-2xl overflow-hidden z-10 font-sans"
      >
        {/* Header decoration */}
        <div className="h-1.5 bg-gradient-to-r from-brand-yellow via-yellow-500 to-amber-600" />

        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-border-dark/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20">
              <Bell className="w-5 h-5 text-brand-yellow" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-text-primary tracking-tight">
                Alerte de Prix : <span className="text-brand-yellow">{coin.symbol}</span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {coin.name} • Rang #{coin.rank}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre d'alerte de prix"
            className="p-1.5 rounded-lg border border-border-dark bg-bg-main text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Market Status */}
          <div className="bg-bg-main border border-border-dark/60 rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs text-text-secondary font-semibold">Prix Actuel ({currency})</span>
            <span className="font-mono font-bold text-base text-text-primary">
              {formatCurrency(currentPrice, currency, currentPrice > 100 ? 2 : currentPrice > 1 ? 4 : 8)}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                Définir le Seuil de Prix
              </label>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={targetPrice}
                  onChange={(e) => {
                    setTargetPrice(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-bg-main border border-border-dark text-text-primary font-mono font-bold text-lg rounded-xl pl-4 pr-16 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 focus:border-brand-yellow transition-all"
                  placeholder="0.00"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary font-mono">
                  {currency}
                </div>
              </div>
            </div>

            {/* Quick shortcuts */}
            <div>
              <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                Raccourcis rapides :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "-5%", value: -5 },
                  { label: "-2%", value: -2 },
                  { label: "+2%", value: 2 },
                  { label: "+5%", value: 5 },
                  { label: "+10%", value: 10 },
                ].map((pct) => (
                  <button
                    key={pct.label}
                    type="button"
                    onClick={() => applyPercentage(pct.value)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-bg-stat hover:bg-brand-yellow hover:text-bg-main border border-border-dark text-text-secondary hover:border-brand-yellow transition-all cursor-pointer"
                  >
                    {pct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert Condition Warning Label */}
            {parseFloat(targetPrice) > 0 && parseFloat(targetPrice) !== currentPrice && (
              <div className="flex items-center gap-2 px-3 py-2 bg-bg-stat/60 border border-border-dark/40 rounded-lg text-xs">
                {parseFloat(targetPrice) > currentPrice ? (
                  <>
                    <ArrowUp className="w-4 h-4 text-price-green" />
                    <span className="text-text-secondary">
                      Déclenchera une alerte quand {coin.symbol} sera{" "}
                      <strong className="text-price-green font-bold">supérieur ou égal à</strong>{" "}
                      <span className="font-mono text-text-primary font-bold">
                        {formatCurrency(parseFloat(targetPrice), currency, parseFloat(targetPrice) > 100 ? 2 : parseFloat(targetPrice) > 1 ? 4 : 8)}
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-4 h-4 text-price-red" />
                    <span className="text-text-secondary">
                      Déclenchera une alerte quand {coin.symbol} sera{" "}
                      <strong className="text-price-red font-bold">inférieur ou égal à</strong>{" "}
                      <span className="font-mono text-text-primary font-bold">
                        {formatCurrency(parseFloat(targetPrice), currency, parseFloat(targetPrice) > 100 ? 2 : parseFloat(targetPrice) > 1 ? 4 : 8)}
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}

            {errorMessage && (
              <p className="text-xs font-bold text-price-red bg-price-red/10 border border-price-red/20 px-3 py-2 rounded-lg">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-bg-main font-extrabold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all shadow-md shadow-brand-yellow/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Créer la notification d'alerte
            </button>
          </form>

          {/* Active Alerts for this coin */}
          <div className="border-t border-border-dark/60 pt-4 mt-1">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
              Alertes actives pour {coin.symbol} ({coinAlerts.length})
            </h4>

            {coinAlerts.length === 0 ? (
              <p className="text-xs text-text-secondary italic bg-bg-main/40 border border-dashed border-border-dark/60 rounded-xl py-4 text-center">
                Aucune alerte de prix configurée pour cet actif.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {coinAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between p-3 bg-bg-main border border-border-dark rounded-xl"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg text-xs font-bold ${
                            alert.condition === "above"
                              ? "bg-price-green/10 text-price-green border border-price-green/20"
                              : "bg-price-red/10 text-price-red border border-price-red/20"
                          }`}
                        >
                          {alert.condition === "above" ? (
                            <ArrowUp className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold font-mono text-text-primary">
                            {formatCurrency(alert.targetPrice, currency, alert.targetPrice > 100 ? 2 : alert.targetPrice > 1 ? 4 : 8)}
                          </span>
                          <span className="text-[10px] text-text-secondary mt-0.5">
                            Créée au prix de {formatCurrency(alert.initialPriceAtCreation, currency, alert.initialPriceAtCreation > 100 ? 2 : alert.initialPriceAtCreation > 1 ? 4 : 8)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveAlert(alert.id)}
                        className="p-1.5 rounded-lg hover:bg-price-red/10 hover:border-price-red/20 text-text-secondary hover:text-price-red transition-all cursor-pointer border border-transparent"
                        title="Supprimer l'alerte"
                        aria-label="Supprimer l'alerte"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
