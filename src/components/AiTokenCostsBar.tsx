import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Info, Cpu, Database, TrendingUp, TrendingDown, Landmark, Globe } from "lucide-react";

interface CostItem {
  id: string;
  type: "llm" | "platform" | "index";
  name: string;
  provider: string;
  priceTag: string;
  comparisonBadge: string;
  badgeColor: string; // Tailwind color classes
  description: string;
  agenticStrengths: string[];
  change?: string; // e.g. "+3.45%" or "-1.20%"
  isPositive?: boolean;
  crossedScenario?: {
    setup: string;
    totalCost: string;
    efficiency: string;
  };
}

export default function AiTokenCostsBar({ language = "fr" }: { language?: "fr" | "en" }) {
  const [hoveredItem, setHoveredItem] = useState<CostItem | null>(null);

  const t = {
    fr: {
      platform: "PLATEFORME",
      index: "INDICE",
      crossed: "Croisé :",
      llmProvider: "Fournisseur LLM",
      indexStock: "Indice / Valeur Tech",
      providerPlatform: "Prestataire / Plateforme",
      impactRole: "Impact & Rôle Stratégique :",
      crossedScenario: "Scénario Croisé Optimisé :",
      architecture: "Architecture :",
      estimatedCost: "Coût estimé :",
      efficiency: "Rendement :"
    },
    en: {
      platform: "PLATFORM",
      index: "INDEX",
      crossed: "Hybrid :",
      llmProvider: "LLM Provider",
      indexStock: "Index / Tech Stock",
      providerPlatform: "Provider / Platform",
      impactRole: "Strategic Role & Impact:",
      crossedScenario: "Optimized Hybrid Scenario:",
      architecture: "Architecture:",
      estimatedCost: "Estimated Cost:",
      efficiency: "Efficiency:"
    }
  }[language];

  const stockIndices: CostItem[] = [
    {
      id: "index-nasdaq",
      type: "index",
      name: "NASDAQ 100",
      provider: "Index Boursier",
      priceTag: "19,832.50",
      comparisonBadge: "+1.85%",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      change: "+1.85%",
      isPositive: true,
      description: "Indice phare des valeurs technologiques mondiales, tiré par la demande de processeurs graphiques et d'infrastructures cloud IA.",
      agenticStrengths: ["Indice global de la Tech", "Baromètre de l'investissement IA", "Volatilité corrélée aux LLM"]
    },
    {
      id: "index-nvidia",
      type: "index",
      name: "NVIDIA Corp (NVDA)",
      provider: "Nasdaq",
      priceTag: "$134.80",
      comparisonBadge: "+4.12%",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      change: "+4.12%",
      isPositive: true,
      description: "Leader mondial des puces de calcul IA (GPUs H100/Blackwell) alimentant les plus grands clusters de modèles d'agents.",
      agenticStrengths: ["Fournisseur hardware majeur", "Monopole de facto du calcul IA", "Support de CUDA"]
    },
    {
      id: "index-microsoft",
      type: "index",
      name: "Microsoft (MSFT)",
      provider: "Nasdaq",
      priceTag: "$418.50",
      comparisonBadge: "-0.45%",
      badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      change: "-0.45%",
      isPositive: false,
      description: "Principal investisseur d'OpenAI, créateur de Copilot Studio et fournisseur cloud via Azure AI.",
      agenticStrengths: ["Leader de la distribution entreprise", "Infrastructure Azure mondiale", "Intégration d'outils Office"]
    },
    {
      id: "index-alphabet",
      type: "index",
      name: "Alphabet Inc (GOOGL)",
      provider: "Nasdaq",
      priceTag: "$182.30",
      comparisonBadge: "+2.60%",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      change: "+2.60%",
      isPositive: true,
      description: "Créateur de l'écosystème Gemini, inventeur du Transformer original, et propriétaire d'Android & Google Cloud.",
      agenticStrengths: ["TPU de calcul personnalisés", "Écosystème de données universel", "Recherche web intégrée native"]
    },
    {
      id: "index-asx-ai",
      type: "index",
      name: "Global AI ETF (BOTZ)",
      provider: "NYSE",
      priceTag: "$32.40",
      comparisonBadge: "+1.95%",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      change: "+1.95%",
      isPositive: true,
      description: "Fonds indiciel regroupant les plus grandes entreprises mondiales de robotique et d'intelligence artificielle.",
      agenticStrengths: ["Panier diversifié IA", "Suivi macro de la robotique", "Stabilité sectorielle"]
    },
    {
      id: "index-meta",
      type: "index",
      name: "Meta Platforms (META)",
      provider: "Nasdaq",
      priceTag: "$534.10",
      comparisonBadge: "+3.15%",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      change: "+3.15%",
      isPositive: true,
      description: "Pionnier des modèles d'IA open-source (Llama) à l'échelle industrielle, favorisant la souveraineté technologique locale.",
      agenticStrengths: ["Champion de l'Open-Source", "Distribution grand public", "Forte capacité hardware"]
    }
  ];

  const costItems: CostItem[] = [
    // --- LLM Providers ---
    {
      id: "gemini-flash",
      type: "llm",
      name: "Gemini 1.5 Flash",
      provider: "Google AI",
      priceTag: "In: $0.075/M • Out: $0.30/M",
      comparisonBadge: "-97% vs Pro",
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      description: "Modèle ultra-rapide par excellence, optimisé pour les contextes massifs de 1M+ tokens.",
      agenticStrengths: ["Multi-agents haute fréquence", "Appels d'outils parallèles", "Streaming audio live"],
      crossedScenario: {
        setup: "Dify.ai + Gemini 1.5 Flash",
        totalCost: "$0.003 / 100 requêtes",
        efficiency: "Rentabilité maximale"
      }
    },
    {
      id: "gemini-pro",
      type: "llm",
      name: "Gemini 1.5 Pro",
      provider: "Google AI",
      priceTag: "In: $1.25/M • Out: $5.00/M",
      comparisonBadge: "Contexte 2M",
      badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      description: "Le modèle d'excellence multimodale avec la plus grande fenêtre de contexte du marché.",
      agenticStrengths: ["Analyse de dépôts de code complets", "Raisonnement ultra-longue portée", "Planification complexe"],
      crossedScenario: {
        setup: "LangGraph + Gemini 1.5 Pro",
        totalCost: "$0.05 / exécution longue",
        efficiency: "Précision cognitive"
      }
    },
    {
      id: "claude-sonnet",
      type: "llm",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      priceTag: "In: $3.00/M • Out: $15.00/M",
      comparisonBadge: "Top Code & Agentic",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      description: "La référence absolue pour le codage autonome et le contrôle d'interfaces OS (Computer Use).",
      agenticStrengths: ["Computer Use (Contrôle d'OS)", "Génération de code complexe", "Raisonnement logique"],
      crossedScenario: {
        setup: "CrewAI Enterprise + Claude 3.5",
        totalCost: "$0.12 / agent software engineer",
        efficiency: "Productivité maximale"
      }
    },
    {
      id: "gpt-4o",
      type: "llm",
      name: "GPT-4o",
      provider: "OpenAI",
      priceTag: "In: $2.50/M • Out: $10.00/M",
      comparisonBadge: "Stable & Structuré",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      description: "Modèle d'orchestration robuste et mûr, leader sur les APIs Assistants et les JSON structurés.",
      agenticStrengths: ["Intégration Assistants API", "Vision par ordinateur stable", "Outils de données"],
      crossedScenario: {
        setup: "Voiceflow + GPT-4o API",
        totalCost: "$0.04 / session utilisateur",
        efficiency: "Stabilité d'intégration"
      }
    },
    {
      id: "deepseek-r1",
      type: "llm",
      name: "DeepSeek R1",
      provider: "DeepSeek",
      priceTag: "In: $0.55/M • Out: $2.19/M",
      comparisonBadge: "-93% vs o1 Pro",
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      description: "Modèle de raisonnement pur (Reasoning model) open-source aux performances comparables à OpenAI o1.",
      agenticStrengths: ["Mathématiques & Logique stricte", "Audit de code open-source", "Inférence ultra-économique"],
      crossedScenario: {
        setup: "Flowise + DeepSeek R1 local/cloud",
        totalCost: "$0.008 / boucle de raisonnement",
        efficiency: "Intelligence à prix cassé"
      }
    },
    {
      id: "llama-3",
      type: "llm",
      name: "Llama 3.3 70B",
      provider: "Meta",
      priceTag: "Poids libres / Auto-hébergé",
      comparisonBadge: "100% Souverain",
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      description: "Modèle open-source de référence pour un déploiement sécurisé sur serveurs internes.",
      agenticStrengths: ["Souveraineté totale des données", "Affinage personnalisé", "Contrôle local"],
      crossedScenario: {
        setup: "Self-Hosted Flowise + Llama 3.3",
        totalCost: "0$ token (Seul le coût serveur GPU s'applique)",
        efficiency: "Souveraineté absolue"
      }
    },

    // --- AI Agent Platforms / Providers ---
    {
      id: "langgraph-cloud",
      type: "platform",
      name: "LangGraph Cloud",
      provider: "LangChain",
      priceTag: "$0.05 / exécution agentique",
      comparisonBadge: "Devs Graphes",
      badgeColor: "text-red-400 bg-red-500/10 border-red-500/20",
      description: "Framework d'orchestration d'agents sous forme de graphes cycliques avec gestion d'états robustes.",
      agenticStrengths: ["Persistance de l'état (Time-Travel)", "Supervision humaine interactive", "Multi-agents complexes"],
      crossedScenario: {
        setup: "LangGraph + DeepSeek R1",
        totalCost: "$0.05 + $0.005 LLM = ~$0.055 / run",
        efficiency: "Économies astronomiques"
      }
    },
    {
      id: "crewai-enterprise",
      type: "platform",
      name: "CrewAI Enterprise",
      provider: "CrewAI Inc.",
      priceTag: "$150 / dev / mois",
      comparisonBadge: "Multi-Agent Prêt",
      badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
      description: "Plateforme d'orchestration orientée 'rôles' et collaboration multi-agents de niveau production.",
      agenticStrengths: ["Attribution automatique de rôles", "Mémoire à long terme intégrée", "Support Slack/Teams"],
      crossedScenario: {
        setup: "CrewAI + Gemini 1.5 Flash",
        totalCost: "Abonnement fixe + ~$0.01 / tâche lourde",
        efficiency: "Idéal pour les workflows d'entreprise"
      }
    },
    {
      id: "dify-saas",
      type: "platform",
      name: "Dify.ai",
      provider: "Dify Technologies",
      priceTag: "$59.90 / mois (Team plan)",
      comparisonBadge: "Low-Code visuel",
      badgeColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      description: "Moteur d'application d'IA visuel combinant orchestration d'agents, RAG et pipelines d'outils complexes.",
      agenticStrengths: ["Concepteur de workflow graphique", "RAG vectoriel de pointe intégré", "Monitoring de prompts"],
      crossedScenario: {
        setup: "Dify.ai Cloud + Claude 3.5 Sonnet",
        totalCost: "Abonnement fixe + $0.05 / requête",
        efficiency: "Mise en production ultra-rapide"
      }
    },
    {
      id: "voiceflow",
      type: "platform",
      name: "Voiceflow Pro",
      provider: "Voiceflow Inc.",
      priceTag: "$250 / mois (10k AI steps)",
      comparisonBadge: "Conversationnel",
      badgeColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
      description: "Leader mondial de la conception d'agents conversationnels et vocaux professionnels.",
      agenticStrengths: ["Système d'intentions hybride", "Tests en bac à sable intégrés", "Déploiement omnicanal direct"],
      crossedScenario: {
        setup: "Voiceflow + GPT-4o mini",
        totalCost: "0.01$ supplémentaire par étape",
        efficiency: "Expérience client vocale fluide"
      }
    }
  ];

  const llmItems = costItems.filter((item) => item.type === "llm");
  const platformItems = costItems.filter((item) => item.type === "platform");

  // Mix stock indices & LLM pricing on Row 1
  const row1Items = [...stockIndices, ...llmItems];
  // Agent platforms and scenarios on Row 2
  const row2Items = [...platformItems];

  // Tripling for seamless infinite scroll loops with no cuts
  const tripledRow1 = [...row1Items, ...row1Items, ...row1Items];
  const tripledRow2 = [...row2Items, ...row2Items, ...row2Items];

  return (
    <div className="relative w-full bg-black text-black text-[11px] border-b-2 border-brand-yellow/30 py-3.5 px-6 font-sans select-none z-40 overflow-hidden flex flex-col gap-3 shadow-lg shadow-brand-yellow/5">
      
      {/* Visual enhancement top subtle highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-brand-yellow to-emerald-500 opacity-80" />

      {/* Inject custom highly-optimized hardware-accelerated ticker keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ticker-scroll-left-fast {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333333%, 0, 0); }
        }
        @keyframes ticker-scroll-left-slow {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333333%, 0, 0); }
        }
        .ticker-scroller-track-row1 {
          display: flex;
          width: max-content;
          animation: ticker-scroll-left-fast 48s linear infinite;
        }
        .ticker-scroller-track-row2 {
          display: flex;
          width: max-content;
          animation: ticker-scroll-left-slow 40s linear infinite;
        }
        .ticker-scroller-track-row1:hover,
        .ticker-scroller-track-row2:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* Row 1 Ticker (Indices + LLM Pricing) - Full Width */}
      <div className="relative w-full overflow-hidden py-1">
        {/* Subtle glowing side masks */}
        <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

        <div className="ticker-scroller-track-row1 flex items-center gap-7">
          {tripledRow1.map((item, index) => {
            const isIndex = item.type === "index";
            return (
              <div
                key={`row1-${item.id}-${index}`}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                className="flex items-center gap-2.5 cursor-help px-3 py-1.5 bg-slate-900/90 border border-slate-800 hover:border-blue-400/60 hover:bg-slate-900/105 rounded-lg transition-all duration-150 shadow-sm"
              >
                {isIndex ? (
                  <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-pulse" />
                )}
                
                {/* Provider badge for indexing */}
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">
                  {isIndex ? t.index : "LLM"}
                </span>

                <span className="font-extrabold text-slate-100 text-[11px] whitespace-nowrap">
                  {item.name}
                </span>

                <span className="font-mono text-slate-300 font-medium whitespace-nowrap">
                  {item.priceTag}
                </span>

                {isIndex ? (
                  <span className={`flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    item.isPositive 
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" 
                      : "text-rose-400 bg-rose-500/10 border-rose-500/25"
                  }`}>
                    {item.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {item.change}
                  </span>
                ) : (
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border whitespace-nowrap ${item.badgeColor}`}>
                    {item.comparisonBadge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2 Ticker (AI Agent Platforms & Scenarios) - Full Width */}
      <div className="relative w-full overflow-hidden py-1 border-t border-slate-900/80 pt-3">
        {/* Subtle glowing side masks */}
        <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

        <div className="ticker-scroller-track-row2 flex items-center gap-7">
          {tripledRow2.map((item, index) => (
            <div
              key={`row2-${item.id}-${index}`}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              className="flex items-center gap-2.5 cursor-help px-3 py-1.5 bg-slate-900/90 border border-slate-800 hover:border-brand-yellow/60 hover:bg-slate-900/105 rounded-lg transition-all duration-150 shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
              
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">
                {t.platform}
              </span>

              <span className="font-extrabold text-slate-100 text-[11px] whitespace-nowrap">
                {item.name}
              </span>

              <span className="font-mono text-slate-300 font-medium whitespace-nowrap">
                {item.priceTag}
              </span>

              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border whitespace-nowrap ${item.badgeColor}`}>
                {item.comparisonBadge}
              </span>

              {item.crossedScenario && (
                <div className="flex items-center gap-1.5 ml-1 bg-brand-yellow/5 border border-brand-yellow/15 px-2 py-0.5 rounded text-[9px] text-brand-yellow/90">
                  <span className="font-semibold uppercase text-[8px] opacity-75">{t.crossed}</span>
                  <span className="font-mono font-bold text-white">{item.crossedScenario.totalCost}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Dynamic Tooltip/Modal */}
      <AnimatePresence>
        {hoveredItem && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute left-6 right-6 md:left-auto md:right-[15%] top-[102%] mt-1 w-80 bg-slate-900 border-2 border-slate-700 shadow-2xl rounded-xl p-4.5 z-50 pointer-events-none"
          >
            {/* Header info */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${
                  hoveredItem.type === "llm" 
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                    : hoveredItem.type === "index"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {hoveredItem.type === "llm" ? t.llmProvider : hoveredItem.type === "index" ? t.indexStock : t.providerPlatform}
                </span>
                <h4 className="text-xs font-black text-white mt-1 flex items-center gap-1.5">
                  {hoveredItem.name}
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-brand-yellow">
                {hoveredItem.provider}
              </span>
            </div>

            <p className="text-[10px] text-slate-300 leading-relaxed mb-3">
              {hoveredItem.description}
            </p>

            {/* Strengths */}
            <div className="mb-3 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1 mb-1.5">
                <Cpu className="w-3 h-3 text-emerald-400" />
                {t.impactRole}
              </span>
              <ul className="space-y-1">
                {hoveredItem.agenticStrengths.map((str, index) => (
                  <li key={index} className="flex items-center gap-1.5 text-[9px] text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-brand-yellow" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Crossed Hybrid Scenario */}
            {hoveredItem.crossedScenario && (
              <div className="border-t border-dashed border-slate-800 pt-2.5">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-yellow flex items-center gap-1 mb-1.5">
                  <Database className="w-3 h-3" />
                  {t.crossedScenario}
                </span>
                <div className="bg-brand-yellow/5 border border-brand-yellow/20 rounded p-2.5 text-[9px]">
                  <div className="flex justify-between text-white font-medium mb-0.5">
                    <span>{t.architecture}</span>
                    <span className="text-brand-yellow font-bold">{hoveredItem.crossedScenario.setup}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{t.estimatedCost}</span>
                    <span className="text-emerald-400 font-mono font-bold">{hoveredItem.crossedScenario.totalCost}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[8px] italic mt-0.5 opacity-80">
                    <span>{t.efficiency}</span>
                    <span>{hoveredItem.crossedScenario.efficiency}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
