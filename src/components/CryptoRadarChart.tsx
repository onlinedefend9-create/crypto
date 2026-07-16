import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, RefreshCw, ZoomIn, ZoomOut, Maximize2, Copy, Check } from "lucide-react";

interface RadarNode {
  name: string;
  children?: RadarNode[];
}

interface CryptoRadarChartProps {
  data: RadarNode | null;
  isLoading: boolean;
  onRefresh?: () => void;
  selectedCoins?: string[];
  onSelectedCoinsChange?: (coins: string[]) => void;
  type?: "crypto" | "ai";
}

export const CryptoRadarChart: React.FC<CryptoRadarChartProps> = ({
  data,
  isLoading,
  onRefresh,
  selectedCoins = ["BTC", "ETH", "SOL"],
  onSelectedCoinsChange,
  type = "crypto",
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const AVAILABLE_COINS = [
    { symbol: "BTC", name: "Bitcoin", color: "#f0b90b" },
    { symbol: "ETH", name: "Ethereum", color: "#c084fc" },
    { symbol: "SOL", name: "Solana", color: "#22d3ee" },
    { symbol: "BNB", name: "BNB", color: "#f97316" },
    { symbol: "XRP", name: "XRP", color: "#3b82f6" },
    { symbol: "ADA", name: "Cardano", color: "#06b6d4" },
    { symbol: "DOGE", name: "Dogecoin", color: "#eab308" },
    { symbol: "LINK", name: "Chainlink", color: "#6366f1" },
    { symbol: "USD", name: "Dollar US (Fiat)", color: "#0ecb81" },
    { symbol: "EUR", name: "Euro (Fiat)", color: "#ec4899" },
    { symbol: "CNY", name: "Yuan (CNY) - BRICS", color: "#ef4444" },
    { symbol: "RUB", name: "Rouble (RUB) - BRICS", color: "#38bdf8" },
    { symbol: "INR", name: "Roupie (INR) - BRICS", color: "#fb923c" }
  ];

  const AVAILABLE_MODELS = [
    { symbol: "Gemini", name: "Google Gemini", color: "#3b82f6" },
    { symbol: "Claude", name: "Anthropic Claude", color: "#f59e0b" },
    { symbol: "GPT-4", name: "OpenAI GPT-4", color: "#10b981" },
    { symbol: "DeepSeek", name: "DeepSeek R1/V3", color: "#06b6d4" },
    { symbol: "Llama", name: "Meta Llama", color: "#8b5cf6" },
    { symbol: "Qwen", name: "Alibaba Qwen", color: "#ec4899" }
  ];

  const activeItems = type === "ai" ? AVAILABLE_MODELS : AVAILABLE_COINS;

  const handleToggleCoin = (symbol: string) => {
    if (!onSelectedCoinsChange) return;
    if (selectedCoins.includes(symbol)) {
      if (selectedCoins.length <= 1) return;
      onSelectedCoinsChange(selectedCoins.filter(c => c !== symbol));
    } else {
      if (selectedCoins.length >= 5) {
        onSelectedCoinsChange([...selectedCoins.slice(1), symbol]);
      } else {
        onSelectedCoinsChange([...selectedCoins, symbol]);
      }
    }
  };

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = 850;
    const height = 850;
    const radius = width / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Define cyber glow filters and gradients
    const defs = svg.append("defs");

    // Cyber Glow Filters
    const createGlowFilter = (id: string, color: string, stdDev: number) => {
      const filter = defs.append("filter")
        .attr("id", id)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
      filter.append("feGaussianBlur")
        .attr("stdDeviation", stdDev)
        .attr("result", "blur");
      
      const merge = filter.append("feMerge");
      merge.append("feMergeNode").attr("in", "blur");
      merge.append("feMergeNode").attr("in", "SourceGraphic");
    };

    createGlowFilter("glow-yellow", "#f0b90b", 5);
    createGlowFilter("glow-cyan", "#00f2fe", 4);
    createGlowFilter("glow-purple", "#c084fc", 4);
    createGlowFilter("glow-green", "#0ecb81", 4);
    createGlowFilter("glow-orange", "#f97316", 4);
    createGlowFilter("glow-blue", "#3b82f6", 4);
    createGlowFilter("glow-teal", "#06b6d4", 4);
    createGlowFilter("glow-gold", "#eab308", 4);
    createGlowFilter("glow-indigo", "#6366f1", 4);
    createGlowFilter("glow-pink", "#ec4899", 4);
    createGlowFilter("glow-red", "#ef4444", 4);

    // Gradients for links
    const yellowCyanGrad = defs.append("linearGradient")
      .attr("id", "yellow-cyan-grad")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    yellowCyanGrad.append("stop").attr("offset", "0%").attr("stop-color", "#f0b90b");
    yellowCyanGrad.append("stop").attr("offset", "100%").attr("stop-color", "#00f2fe");

    // Main group with dynamic scale for zoom controls
    const mainGroup = svg
      .attr("viewBox", `-${radius} -${radius} ${width} ${height}`)
      .append("g")
      .attr("transform", `scale(${zoomLevel})`);

    // Layout radial of type Cluster (Dendrogramme)
    const cluster = d3.cluster<RadarNode>().size([2 * Math.PI, radius - 160]);
    const root = d3.hierarchy(data).sort((a, b) => {
      const order = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "LINK", "DOT", "USD", "EUR", "CNY", "RUB", "INR"];
      const aIdx = order.indexOf(a.data.name);
      const bIdx = order.indexOf(b.data.name);
      if (aIdx !== -1 && bIdx !== -1) {
        return aIdx - bIdx;
      }
      return d3.ascending(a.data.name, b.data.name);
    });

    cluster(root);

    // 1. Draw Radar concentric grid circles (Background Radar Screen)
    const depths = [0, radius - 300, radius - 215, radius - 160];
    const depthLabels = type === "ai"
      ? ["", "MODÈLES", "AXES D'AGENT", "AGENTS / SYSTÈMES"]
      : ["", "ACTIFS", "QUESTIONS", "RUMEURS"];
    
    const radarGrid = mainGroup.append("g")
      .attr("class", "radar-grid")
      .style("opacity", 0.4);

    depths.forEach((d, i) => {
      if (d === 0) return;
      // Circle grid
      radarGrid.append("circle")
        .attr("r", d)
        .attr("fill", "none")
        .attr("stroke", "#1e222b")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");

      // Grid Label
      radarGrid.append("text")
        .attr("y", -d - 4)
        .attr("text-anchor", "middle")
        .attr("fill", "#565c66")
        .attr("font-size", "8px")
        .attr("font-family", "monospace")
        .attr("letter-spacing", "0.15em")
        .text(depthLabels[i]);
    });

    // Radar sweeps/axes lines (4 axes)
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = (angle * Math.PI) / 180;
      radarGrid.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (radius - 160) * Math.cos(rad))
        .attr("y2", (radius - 160) * Math.sin(rad))
        .attr("stroke", "#1e222b")
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "2 8");
    }

    // 2. Draw links (elegant cyber lines)
    const linkGenerator = d3.linkRadial<any, any>()
      .angle(d => d.x)
      .radius(d => d.y);

    const links = mainGroup.append("g")
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("class", "transition-all duration-300")
      .attr("d", linkGenerator)
      .attr("fill", "none")
      .attr("stroke", d => {
        if (hoveredNode) {
          const isTarget = d.target.data.name === hoveredNode || 
                           d.target.descendants().some(desc => desc.data.name === hoveredNode);
          if (isTarget) {
            // High-voltage glow paths matching coin sentiments
            const coin = d.target.ancestors().find(anc => anc.depth === 1)?.data.name;
            const matchedCfg = activeItems.find(c => c.symbol === coin);
            if (matchedCfg) return matchedCfg.color;
            return "#0ecb81";
          }
        }
        return "#0ecb81"; // Beautiful tactical green path by default
      })
      .attr("stroke-width", d => {
        if (hoveredNode) {
          const isTarget = d.target.data.name === hoveredNode || 
                           d.target.descendants().some(desc => desc.data.name === hoveredNode);
          if (isTarget) return 2.5;
        }
        return 1.25;
      })
      .attr("opacity", d => {
        if (hoveredNode) {
          const isTarget = d.target.data.name === hoveredNode || 
                           d.target.descendants().some(desc => desc.data.name === hoveredNode) ||
                           d.source.data.name === hoveredNode;
          return isTarget ? 1.0 : 0.08;
        }
        return 0.25; // Subtle glowing grid opacity for default state
      })
      .attr("filter", d => {
        if (hoveredNode) {
          const isTarget = d.target.data.name === hoveredNode || 
                           d.target.descendants().some(desc => desc.data.name === hoveredNode);
          if (isTarget) {
            const coin = d.target.ancestors().find(anc => anc.depth === 1)?.data.name;
            if (coin === "BTC") return "url(#glow-yellow)";
            if (coin === "ETH") return "url(#glow-purple)";
            if (coin === "SOL") return "url(#glow-cyan)";
            if (coin === "BNB") return "url(#glow-orange)";
            if (coin === "DOGE") return "url(#glow-gold)";
            if (coin === "XRP") return "url(#glow-blue)";
            if (coin === "ADA") return "url(#glow-teal)";
            if (coin === "LINK") return "url(#glow-indigo)";
            if (coin === "DOT") return "url(#glow-pink)";
            if (coin === "USD") return "url(#glow-green)";
            if (coin === "EUR") return "url(#glow-pink)";
            if (coin === "CNY") return "url(#glow-red)";
            if (coin === "RUB") return "url(#glow-blue)";
            if (coin === "INR") return "url(#glow-orange)";
            return "url(#glow-green)";
          }
        }
        return null;
      });

    // 3. Create nodes container
    const node = mainGroup.append("g")
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .attr("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        setHoveredNode(d.data.name);
        const path = d.ancestors().reverse().map(anc => anc.data.name);
        setHoveredPath(path);
      })
      .on("mouseleave", () => {
        setHoveredNode(null);
        setHoveredPath([]);
      });

    // Node circles - Cyber style
    node.append("circle")
      .attr("fill", d => {
        if (d.depth === 0) return "#f0b90b"; // Root: Glowing gold
        if (d.depth === 1) {
          const matchedCfg = activeItems.find(c => c.symbol === d.data.name);
          if (matchedCfg) return matchedCfg.color;
          return "#0ecb81";
        }
        if (d.depth === 2) return "#475266"; // Question Nodes: High tech dark blue
        return "#eaecef"; // Leaves: Soft cyber white
      })
      .attr("r", d => {
        if (d.depth === 0) return 9;
        if (d.depth === 1) return 7;
        if (d.depth === 2) return 5;
        return 3.5;
      })
      .attr("stroke", d => {
        if (d.depth === 0) return "rgba(240, 185, 11, 0.4)";
        if (d.depth === 1) return "#181a20";
        return "#0b0e11";
      })
      .attr("stroke-width", d => {
        if (d.depth === 0) return 6; // Outer radar shadow ring
        return 2;
      })
      .attr("filter", d => {
        if (hoveredNode === d.data.name) {
          if (d.depth === 1) {
            const coin = d.data.name;
            if (coin === "BTC" || coin === "Gemini") return "url(#glow-yellow)";
            if (coin === "ETH" || coin === "Claude") return "url(#glow-purple)";
            if (coin === "SOL" || coin === "GPT-4") return "url(#glow-cyan)";
            if (coin === "BNB" || coin === "Llama") return "url(#glow-orange)";
            if (coin === "DOGE") return "url(#glow-gold)";
            if (coin === "XRP" || coin === "DeepSeek") return "url(#glow-blue)";
            if (coin === "ADA" || coin === "Qwen") return "url(#glow-teal)";
            if (coin === "LINK") return "url(#glow-indigo)";
            if (coin === "DOT") return "url(#glow-pink)";
            if (coin === "USD") return "url(#glow-green)";
            if (coin === "EUR") return "url(#glow-pink)";
            if (coin === "CNY") return "url(#glow-red)";
            if (coin === "RUB") return "url(#glow-blue)";
            if (coin === "INR") return "url(#glow-orange)";
          }
          return "url(#glow-green)";
        }
        if (d.depth === 0) return "url(#glow-yellow)";
        return null;
      })
      .attr("class", "transition-all duration-300 hover:scale-130");

    // Add glowing core for root node
    node.filter(d => d.depth === 0)
      .append("circle")
      .attr("r", 4)
      .attr("fill", "#ffffff")
      .attr("filter", "url(#glow-yellow)");

    // 4. Texts - Sharp typography with Web 3.0 Bold/Italic style
    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI === !d.children ? 12 : -12)
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .text(d => d.data.name)
      .attr("fill", d => {
        if (hoveredNode === d.data.name) return "#ffffff";
        if (d.depth === 0) return "#f0b90b";
        if (d.depth === 1) {
          const matchedCfg = activeItems.find(c => c.symbol === d.data.name);
          if (matchedCfg) return matchedCfg.color;
          return "#0ecb81";
        }
        if (d.depth === 2) return "#94a3b8"; // Slate-400 for better visibility
        return "#f8fafc"; // Slate-50 for leaf nodes
      })
      .attr("font-size", d => {
        if (d.depth === 0) return "16px";
        if (d.depth === 1) return "14px";
        if (d.depth === 2) return "12px";
        return "11px";
      })
      .style("font-weight", d => d.depth === 3 ? "700" : "800")
      .style("font-style", "italic") // Apply italic style to all texts for Web 3.0 sleek vibe
      .style("font-family", "JetBrains Mono, SFMono-Regular, monospace, sans-serif")
      .style("letter-spacing", d => d.depth === 1 ? "0.05em" : "normal")
      .style("text-shadow", "0 0 6px #000000, 0 0 12px #000000, 0 2px 4px #000000") // Triple black stroke shadow for extreme readability on pure black background
      .attr("opacity", d => {
        if (hoveredNode) {
          const isActive = d.data.name === hoveredNode || 
                           d.ancestors().some(anc => anc.data.name === hoveredNode) ||
                           d.descendants().some(desc => desc.data.name === hoveredNode);
          return isActive ? 1.0 : 0.35;
        }
        return 1.0;
      });

  }, [data, zoomLevel, hoveredNode]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  const handleCopyText = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCoinData = (coinName: string): RadarNode | null => {
    if (!data || !data.children) return null;
    return data.children.find(c => c.name === coinName) || null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-bg-card border border-border-dark rounded-2xl p-8 text-center">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-yellow/10 border-t-brand-yellow"></div>
          <HelpCircle className="absolute text-brand-yellow h-6 w-6 animate-pulse" />
        </div>
        <p className="mt-6 text-text-primary font-medium">Analyse Cognitive par l'IA...</p>
        <p className="text-xs text-text-secondary mt-2 max-w-md">
          Génération d'un arbre d'intentions de recherche AnswerThePublic en temps réel sur les monnaies sélectionnées : {selectedCoins.join(", ")}.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-bg-card border border-border-dark rounded-2xl p-8 text-center">
        <p className="text-text-secondary text-sm">Aucune donnée d'intentions de recherche disponible.</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-bg-main font-semibold text-xs rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw className="h-4 w-4" /> Réessayer
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-black border border-border-dark rounded-2xl p-6 relative overflow-hidden"
      id="crypto-radar-widget"
      ref={containerRef}
    >
      {/* Header section inside card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow animate-pulse" />
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              {type === "ai" ? "Radar Sémantique IA & Modèles" : "Crypto Radar Intentions d'Achat"}
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {type === "ai" 
              ? `Analyse sémantique cognitive des questions chaudes de l'écosystème IA (${selectedCoins.join(", ")})`
              : `Analyse sémantique cognitive des questions chaudes du marché (${selectedCoins.join(", ")})`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-bg-main border border-border-dark rounded-lg p-1 mr-1">
            <button
              onClick={handleZoomOut}
              title="Zoom arrière"
              aria-label="Zoom arrière"
              className="p-1.5 hover:bg-bg-card text-text-secondary hover:text-text-primary rounded transition"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Réinitialiser zoom"
              aria-label="Réinitialiser zoom"
              className="px-2 text-[10px] font-mono text-text-secondary hover:text-text-primary hover:bg-bg-card rounded transition"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom avant"
              aria-label="Zoom avant"
              className="p-1.5 hover:bg-bg-card text-text-secondary hover:text-text-primary rounded transition"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Refresh Action */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              aria-label="Actualiser les données"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-main hover:bg-bg-stat text-text-primary border border-border-dark text-xs rounded-lg transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          )}
        </div>
      </div>

      {/* Coin Selector Panel for Monnaies Réelles / Modèles IA */}
      <div className="bg-bg-main border border-border-dark/60 rounded-xl p-3.5 mb-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-brand-yellow uppercase tracking-wider font-mono">
              {type === "ai" ? "Filtre Sémantique (Modèles IA - Max 5)" : "Filtre Sémantique (Fiat vs Cryptos - Max 5)"}
            </span>
            <p className="text-[11px] text-text-secondary">
              {type === "ai"
                ? "Sélectionnez et comparez l'arborescence des intentions de recherche et des préoccupations pour chaque modèle majeur."
                : "Projetez et comparez les intentions de recherche réelles des monnaies fiduciaires (USD, EUR) face aux crypto-monnaies majeures."}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {activeItems.map(coin => {
              const isSelected = selectedCoins.includes(coin.symbol);
              return (
                <button
                  key={coin.symbol}
                  onClick={() => handleToggleCoin(coin.symbol)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected 
                      ? "bg-[#0b0e11] border text-brand-yellow shadow-[0_0_10px_rgba(240,185,11,0.15)]"
                      : "bg-[#181a20]/40 border border-border-dark/60 text-text-secondary hover:text-text-primary hover:border-border-dark"
                  }`}
                  style={{
                    boxShadow: isSelected ? `0 0 10px ${coin.color}25` : undefined,
                    borderColor: isSelected ? coin.color : undefined,
                    color: isSelected ? coin.color : undefined
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: coin.color }} />
                  <span>{coin.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main layout with chart and sidebar info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        {/* Legends & Information */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-bg-main border border-border-dark rounded-xl p-4 space-y-3.5">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Légende de l'Arbre</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-brand-yellow border border-bg-card" />
                <div>
                  <p className="text-xs font-semibold text-text-primary">Racine (Moyenne)</p>
                  <p className="text-[10px] text-text-secondary">Focus global du Radar</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-price-green border border-bg-card" />
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    {type === "ai" ? "Branches Modèles" : "Branches Actifs"}
                  </p>
                  <p className="text-[10px] text-text-secondary">{selectedCoins.join(", ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-text-secondary border border-bg-card" />
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    {type === "ai" ? "Axes d'Agent" : "Angles de Recherche"}
                  </p>
                  <p className="text-[10px] text-text-secondary">
                    {type === "ai" ? "Agents, Frameworks, Usages, Limites, Futur" : "Pourquoi, Comment, Combien, Si, Où"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-text-primary border border-bg-card" />
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    {type === "ai" ? "Agents & Cas d'usages" : "Signaux Chauds"}
                  </p>
                  <p className="text-[10px] text-text-secondary">
                    {type === "ai" ? "Implémentations et architectures d'agents" : "Intentions d'actualités clés"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-bg-main border border-border-dark rounded-xl p-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">Note Interactive</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Survolez n'importe quel nœud ou étiquette pour mettre en surbrillance l'arborescence et suivre la logique sémantique cognitive d'achat.
            </p>
          </div>
        </div>

        {/* SVG Radial Graph */}
        <div className="lg:col-span-3 flex justify-center items-center bg-[#000000] p-6 rounded-2xl border border-[#1f2226] min-h-[480px] shadow-inner relative overflow-hidden group">
          {/* Cyberpunk grid overlay background effect */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e222b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
          <svg
            ref={svgRef}
            className="w-full max-w-[550px] md:max-w-[620px] h-auto select-none overflow-visible relative z-10"
          ></svg>

          {/* Affichage Horizontal Interactif du nœud survolé */}
          <AnimatePresence>
            {hoveredNode && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-4 left-4 right-4 bg-bg-main/95 backdrop-blur-md border border-brand-yellow/30 rounded-xl p-3 z-20 flex flex-col gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
              >
                {/* Fil d'Ariane Sémantique Horizontal */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-text-secondary">
                  <span className="text-[9px] bg-brand-yellow/10 text-brand-yellow px-1 rounded border border-brand-yellow/20">CHEMIN</span>
                  {hoveredPath.map((nodeName, idx) => {
                    const isLast = idx === hoveredPath.length - 1;
                    const coinCfg = AVAILABLE_COINS.find(c => c.symbol === nodeName);
                    const labelColor = coinCfg?.color || "#ffffff";
                    
                    return (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span className="opacity-40">➔</span>}
                        <span 
                          className={`px-1.5 py-0.5 rounded ${
                            idx === 0 
                              ? "bg-brand-yellow/10 font-bold text-brand-yellow" 
                              : idx === 1 
                                ? "bg-bg-stat font-bold" 
                                : isLast 
                                  ? "text-brand-yellow font-extrabold animate-pulse" 
                                  : "text-text-primary"
                          }`}
                          style={idx === 1 ? { color: labelColor, borderColor: `${labelColor}40`, borderWidth: 1 } : {}}
                        >
                          {nodeName}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Titre Horizontal Principal et Copie */}
                <div className="flex items-center justify-between gap-4 border-t border-border-dark/60 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-text-secondary uppercase tracking-wider">Donnée exploitée (Horizontale) :</span>
                    <span className="text-xs sm:text-sm font-extrabold text-text-primary tracking-tight font-mono select-all select-text">
                      {hoveredNode}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleCopyText(hoveredNode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card hover:bg-bg-stat text-text-primary border border-border-dark text-[11px] font-mono rounded-lg transition active:scale-95 shrink-0 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-price-green" />
                        <span className="text-price-green">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-brand-yellow" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Explorateur Horizontal Sémantique */}
      <div className="mt-8 pt-6 border-t border-border-dark space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Maximize2 className="h-4 w-4 text-brand-yellow" />
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
              Projection Horizontale Cognitive ({selectedCoins[0] || (type === "ai" ? "Gemini" : "BTC")})
            </h4>
          </div>
          {hoveredPath.length > 0 ? (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 rounded animate-pulse">
              Survol Radar Actif
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-bg-stat text-text-secondary border border-border-dark rounded">
              Aperçu - {selectedCoins[0] || (type === "ai" ? "Gemini" : "BTC")}
            </span>
          )}
        </div>

        {/* Dynamic Breadcrumbs / Breadcrumbs Path */}
        <div className="bg-bg-main border border-border-dark/60 rounded-xl p-3 min-h-[48px] flex items-center overflow-x-auto whitespace-nowrap scrollbar-none">
          {hoveredPath.length === 0 ? (
            <p className="text-xs text-text-secondary italic font-mono">
              Survolez un nœud du radar sémantique pour projeter son arborescence de recherche linéaire.
            </p>
          ) : (
            <div className="flex items-center gap-2.5 font-mono text-xs">
              {hoveredPath.map((nodeName, index) => {
                const isLast = index === hoveredPath.length - 1;
                let badgeStyle = "bg-bg-stat text-text-secondary border border-border-dark";
                if (index === 0) {
                  badgeStyle = "bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30";
                } else if (index === 1) {
                  const coinCfg = activeItems.find(c => c.symbol === nodeName);
                  const color = coinCfg?.color || "#0ecb81";
                  return (
                    <React.Fragment key={index}>
                      {index > 0 && <span className="text-text-secondary text-xs opacity-50">➔</span>}
                      <span 
                        className="px-2.5 py-1 rounded-lg font-bold border"
                        style={{ 
                          backgroundColor: `${color}15`, 
                          borderColor: color, 
                          color: color 
                        }}
                      >
                        {nodeName}
                      </span>
                    </React.Fragment>
                  );
                } else if (index === 2) {
                  badgeStyle = "bg-[#475266]/20 text-[#94a3b8] border border-[#475266]/60 font-semibold";
                } else if (isLast) {
                  badgeStyle = "bg-price-green/10 text-price-green border border-price-green/30 font-bold shadow-[0_0_8px_rgba(14,203,129,0.1)]";
                }

                return (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="text-text-secondary text-xs opacity-50">➔</span>}
                    <motion.span 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`px-2.5 py-1 rounded-lg ${badgeStyle}`}
                    >
                      {nodeName}
                    </motion.span>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Horizontal dimensions layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {(() => {
            let activeCoin = selectedCoins[0] || (type === "ai" ? "Gemini" : "BTC");
            if (hoveredPath.length > 1) {
              activeCoin = hoveredPath[1];
            }
            const activeCoinData = getCoinData(activeCoin);
            const activeCoinConfig = activeItems.find(c => c.symbol === activeCoin);
            const activeColor = activeCoinConfig?.color || "#f0b90b";
            const categoriesList = type === "ai"
              ? ["Agents", "Frameworks", "Usages", "Limites", "Futur"]
              : ["Pourquoi", "Comment", "Combien", "Si", "Où"];

            return categoriesList.map((category, index) => {
              const categoryNode = activeCoinData?.children?.find(cat => cat.name === category);
              const isCategoryHovered = hoveredPath.includes(category);
              const questions = categoryNode?.children || [];

              return (
                <div 
                  key={category}
                  className={`border rounded-xl p-3 flex flex-col justify-between transition-all duration-300 ${
                    index === 0 || index === 1 || index === 2 || index === 3 || index === 4
                      ? ""
                      : isCategoryHovered 
                        ? "bg-[#1e2329]/30 border-opacity-100 shadow-[0_0_12px_rgba(240,185,11,0.05)]" 
                        : "bg-bg-main border-border-dark/60"
                  }`}
                  style={{
                    backgroundColor: index === 0 ? "#ffa900" : (index === 1 ? "#390000" : (index === 2 ? "#000b26" : (index === 3 ? "#595959" : (index === 4 ? "#51feb6" : undefined)))),
                    borderColor: index === 0 ? "#2c0000" : (index === 4 ? "#0c0c0c" : (isCategoryHovered ? activeColor : undefined)),
                    color: (index === 0 || index === 4) ? "#000000" : undefined
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-border-dark/60 pb-1.5 mb-2">
                      <span 
                        className="text-[11px] font-bold uppercase tracking-wider font-mono"
                        style={{ color: (index === 0 || index === 4) ? "#000000" : (isCategoryHovered ? "#ffffff" : activeColor) }}
                      >
                        {category}
                      </span>
                      <span 
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                        style={{
                          color: (index === 0 || index === 4) ? "#000000" : "var(--text-secondary)",
                          backgroundColor: (index === 0 || index === 4) ? "rgba(0,0,0,0.1)" : "var(--bg-card)",
                          borderColor: (index === 0 || index === 4) ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)"
                        }}
                      >
                        {questions.length}
                      </span>
                    </div>

                    {questions.length === 0 ? (
                      <p className="text-[10px] italic" style={{ color: (index === 0 || index === 4) ? "rgba(0,0,0,0.6)" : "var(--text-secondary)" }}>Aucun signal sémantique</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {questions.map((q, idx) => {
                          const isLeafHovered = hoveredNode === q.name;
                          return (
                            <motion.li 
                              key={idx}
                              animate={isLeafHovered ? { scale: 1.02 } : { scale: 1 }}
                              className={`text-[11px] leading-relaxed p-1.5 rounded-lg transition-all duration-200 border ${
                                isLeafHovered 
                                  ? "border-opacity-100 font-medium" 
                                  : "border-transparent"
                              }`}
                              style={{
                                borderColor: isLeafHovered ? (index === 0 ? "#2c0000" : (index === 4 ? "#0c0c0c" : activeColor)) : undefined,
                                boxShadow: isLeafHovered ? `0 0 10px ${activeColor}15` : undefined,
                                color: (index === 0 || index === 4) ? "#000000" : undefined,
                                backgroundColor: (index === 0 || index === 4) ? "rgba(255,255,255,0.2)" : (isLeafHovered ? "var(--bg-card)" : "rgba(255,255,255,0.02)")
                              }}
                            >
                              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ backgroundColor: index === 0 ? "#2c0000" : (index === 4 ? "#0c0c0c" : activeColor) }} />
                              {q.name}
                            </motion.li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  
                  <div 
                    className="mt-2 pt-2 border-t flex justify-between items-center text-[9px] font-mono"
                    style={{
                      borderColor: (index === 0 || index === 4) ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.1)",
                      color: (index === 0 || index === 4) ? "rgba(0,0,0,0.6)" : "var(--text-secondary)"
                    }}
                  >
                    <span>Axe cognitif</span>
                    <span className="opacity-40">➔</span>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </motion.div>
  );
};
