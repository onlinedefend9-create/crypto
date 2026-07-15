import React, { useState, useEffect } from "react";
import { 
  Workflow, 
  Play, 
  Search, 
  Code, 
  Sparkles, 
  Cpu, 
  Database, 
  AlertCircle, 
  Terminal, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  Clock, 
  ArrowRight, 
  ChevronRight,
  Shield,
  HelpCircle,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WorkflowRadarChart } from "./WorkflowRadarChart";
import NewsSection from "./NewsSection";
import { NewsArticle } from "../types";

interface WorkflowNode {
  id: string;
  label: string;
  role: string;
  type: "input" | "process" | "tool" | "eval";
  details?: string;
}

interface WorkflowPreset {
  id: string;
  name: string;
  category: "rag" | "coder" | "multi_agent" | "reasoning";
  categoryLabel: string;
  description: string;
  cognitiveCost: "Bas" | "Moyen" | "Élevé" | "Elite";
  recommendedModel: string;
  inputCostPerM: number;
  outputCostPerM: number;
  avgTokensIn: number;
  avgTokensOut: number;
  estimatedTimeSec: number;
  strengths: string[];
  nodes: WorkflowNode[];
  samplePrompts: string[];
  logsTemplate: (prompt: string, model: string, cost: string) => string[];
}

const WORKFLOW_PRESETS: WorkflowPreset[] = [
  {
    id: "rag-smart",
    name: "RAG & Recherche Sémantique Avancée",
    category: "rag",
    categoryLabel: "RAG & Recherche",
    description: "Pipeline d'extraction sémantique et de génération contextualisée avec filtre anti-hallucination. Idéal pour l'interrogation de bases documentaires d'entreprise.",
    cognitiveCost: "Moyen",
    recommendedModel: "Gemini 1.5 Flash",
    inputCostPerM: 0.075,
    outputCostPerM: 0.30,
    avgTokensIn: 15000,
    avgTokensOut: 800,
    estimatedTimeSec: 1.8,
    strengths: [
      "Coût extrêmement maîtrisé grâce au modèle Flash",
      "Filtre de vérité terrain intégré",
      "Support des fenêtres de contexte ultra-larges"
    ],
    samplePrompts: [
      "Quelles sont les clauses de non-responsabilité dans notre rapport financier Q2 ?",
      "Synthétiser la politique de télétravail basée sur le manuel RH.",
      "Vérifier si le contrat stipule une indemnité de rupture."
    ],
    nodes: [
      { id: "r1", label: "Requête & Embedding", role: "Vectorisation de l'intention", type: "input", details: "Convertit la question en vecteur numérique à haute dimension" },
      { id: "r2", label: "Recherche Vectorielle", role: "Retrieval sémantique (RAG)", type: "tool", details: "Extrait les 5 passages les plus pertinents de la base de données" },
      { id: "r3", label: "Synthèse LLM", role: "Génération contextualisée", type: "process", details: "Rédige une réponse claire basée uniquement sur les faits extraits" },
      { id: "r4", label: "Filtre d'Hallucination", role: "Évaluation de fidélité", type: "eval", details: "Compare l'affirmation finale avec les sources pour éviter les mensonges" }
    ],
    logsTemplate: (prompt, model, cost) => [
      `[00:00.2] ⚡ Ingestion de la requête utilisateur: "${prompt}"`,
      `[00:00.5] 🔍 Vectorisation de l'intention et lancement de la recherche sémantique...`,
      `[00:00.8] 🗄️ Base Vectorielle: 8 documents trouvés. Filtrage des 4 meilleurs passages pertinents.`,
      `[00:01.2] 🧠 Envoi du prompt contextuel au modèle ${model} (In: 15k tokens, Out: 800 tokens).`,
      `[00:01.5] ⚙️ Modèle en cours de génération sémantique...`,
      `[00:01.7] 🛡️ Évaluation finale: Lancement du filtre anti-hallucination d'origine.`,
      `[00:01.8] ✅ Confiance de fidélité: 99.1%. Réponse validée et formatée avec succès !`,
      `[00:01.8] 📊 Métriques finales de l'exécution: Coût estimé à ${cost} USD.`
    ]
  },
  {
    id: "coder-auto",
    name: "Agent de Codage Autonome & Auto-Correction",
    category: "coder",
    categoryLabel: "Agentique & Boucle",
    description: "Agent autonome capable de comprendre un bug ou une consigne, d'analyser le code source existant, de générer un correctif de précision, de tester et de corriger ses propres erreurs en boucle.",
    cognitiveCost: "Elite",
    recommendedModel: "Claude 3.5 Sonnet",
    inputCostPerM: 3.00,
    outputCostPerM: 15.00,
    avgTokensIn: 45000,
    avgTokensOut: 4500,
    estimatedTimeSec: 8.5,
    strengths: [
      "Précision d'écriture de code d'élite",
      "Boucle de rétroaction autonome via terminal d'exécution",
      "Excellence sur la correction d'architectures existantes"
    ],
    samplePrompts: [
      "Corriger l'erreur de dépassement d'indice dans le trieur d'alertes de prix.",
      "Ajouter un validateur d'adresse e-mail RFC-compliancy dans auth.ts.",
      "Optimiser la boucle de rendu de la table pour éviter les re-renders inutiles."
    ],
    nodes: [
      { id: "c1", label: "Analyse du Contexte", role: "Ingestion & Repérage", type: "input", details: "Lit les fichiers cibles et extrait l'AST (Arbre de Syntaxe)" },
      { id: "c2", label: "Génération de Correctif", role: "Création de code d'élite", type: "process", details: "Rédige le code de correction avec des commentaires structurés" },
      { id: "c3", label: "Terminal de Test", role: "Exécution automatique", type: "tool", details: "Lance npm run test dans un bac à sable sécurisé" },
      { id: "c4", label: "Auto-Correcteur", role: "Critique & Boucle", type: "eval", details: "Si le test échoue, analyse l'erreur de pile et relance l'écriture" }
    ],
    logsTemplate: (prompt, model, cost) => [
      `[00:00.5] ⚡ Reçu instruction d'agent: "${prompt}"`,
      `[00:01.2] 📂 Analyse de l'arborescence projet: Lecture des fichiers cibles et repérage de l'AST...`,
      `[00:02.5] 🧠 Modèle principal ${model} formule la solution (In: 45k tokens, Out: 4.5k tokens)...`,
      `[00:04.8] ✍️ Écriture du correctif de code dans la mémoire virtuelle de l'agent.`,
      `[00:05.5] 🧪 Lancement automatique de la suite de tests unitaires via le module d'outils...`,
      `[00:06.8] ❌ Test #1 Échoué: "TypeError: Cannot read properties of undefined (reading 'price')".`,
      `[00:07.1] 🔄 Auto-Correction: Ingestion de l'erreur par le critique et réécriture de la ligne 42...`,
      `[00:08.2] 🧪 Re-test unitaire: Tous les tests passent avec succès (12/12).`,
      `[00:08.5] ✅ Correctif validé et fusionné. Coût estimé d'inférence: ${cost} USD.`
    ]
  },
  {
    id: "multi-agent-crew",
    name: "Orchestration Multi-Agents Collaborative (SEO & Rédaction)",
    category: "multi_agent",
    categoryLabel: "Multi-Agent",
    description: "Équipe d'agents de rédaction et d'analyse travaillant en parallèle sous un modèle hiérarchique. Le Planificateur conçoit le plan, le Rédacteur écrit le contenu brut, et le Spécialiste SEO audite et améliore les métadonnées.",
    cognitiveCost: "Élevé",
    recommendedModel: "Gemini 1.5 Pro",
    inputCostPerM: 1.25,
    outputCostPerM: 5.00,
    avgTokensIn: 25000,
    avgTokensOut: 3200,
    estimatedTimeSec: 5.2,
    strengths: [
      "Division stricte des rôles et expertises",
      "Échanges asynchrones entre agents de confiance",
      "Grande cohérence finale sur les documents volumineux"
    ],
    samplePrompts: [
      "Rédiger un article de blog complet sur l'impact de l'IA générative dans la DeFi.",
      "Créer une fiche produit optimisée SEO pour une plateforme de gestion d'alertes crypto.",
      "Rédiger un guide utilisateur pour notre application de benchmarking d'agents."
    ],
    nodes: [
      { id: "m1", label: "Brief & Stratégie", role: "Objectifs marketing", type: "input", details: "Prend en compte l'audience cible et les mots-clés" },
      { id: "m2", label: "Agent Planificateur", role: "Création de structure", type: "process", details: "Divise le sujet en sections logiques et attribue les tâches" },
      { id: "m3", label: "Agent Rédacteur", role: "Rédaction créative", type: "tool", details: "Génère un contenu riche et fluide pour chaque section" },
      { id: "m4", label: "Agent Expert SEO", role: "Revue & Mots-clés", type: "eval", details: "Optimise la densité des mots-clés, la structure Hx et le maillage" }
    ],
    logsTemplate: (prompt, model, cost) => [
      `[00:00.2] ⚡ Brief d'orchestration reçu: "${prompt}"`,
      `[00:00.8] 👷 Initialisation de l'équipe (Crew): Planificateur, Rédacteur, Expert SEO opérationnels.`,
      `[00:01.5] 📋 [Agent Planificateur] Conçoit le plan structuré de l'article (4 grandes sections).`,
      `[00:02.8] ✍️ [Agent Rédacteur] Débute la rédaction créative à haute vélocité avec le modèle ${model}...`,
      `[00:04.2] 📝 Rédaction terminée: 1200 mots générés. Transmission du brouillon à l'Agent SEO.`,
      `[00:04.8] 🔍 [Agent Expert SEO] Analyse sémantique de l'article, insertion stratégique de métadonnées.`,
      `[00:05.1] 💅 Ajustements typographiques et intégration des tags de référencement naturel.`,
      `[00:05.2] ✅ Publication du contenu validé à 100% par la Crew. Coût d'inférence: ${cost} USD.`
    ]
  },
  {
    id: "reasoning-chain",
    name: "Raisonnement Logique & Analyse Mathématique",
    category: "reasoning",
    categoryLabel: "Raisonnement Pur",
    description: "Pipeline conçu pour la résolution de problèmes analytiques complexes ou de calculs financiers. Utilise une chaîne de pensée explicite (Reasoning loop) de type o1/R1 avec exécution de scripts Python en bac à sable pour une précision sans faille.",
    cognitiveCost: "Elite",
    recommendedModel: "DeepSeek R1",
    inputCostPerM: 0.55,
    outputCostPerM: 2.19,
    avgTokensIn: 8000,
    avgTokensOut: 6000,
    estimatedTimeSec: 6.8,
    strengths: [
      "Performances exceptionnelles sur la logique formelle",
      "Chaîne de réflexion interne (Chain-of-Thought) transparente",
      "Précision mathématique garantie par exécution de code"
    ],
    samplePrompts: [
      "Calculer le rendement composé annuel d'un portefeuille crypto avec 12% d'APY et réinvestissement mensuel sur 5 ans.",
      "Résoudre l'équation d'arbitrage de spreads triangulaires sur 3 pools de liquidité décentralisés.",
      "Auditer la formule mathématique d'émission de jetons de notre contrat de staking."
    ],
    nodes: [
      { id: "s1", label: "Enoncé & Données", role: "Spécification formelle", type: "input", details: "Définit les variables d'entrée et les contraintes mathématiques" },
      { id: "s2", label: "Raisonnement Interne", role: "Pensée profonde (CoT)", type: "process", details: "Génère des hypothèses logiques et des étapes de déduction explicites" },
      { id: "s3", label: "Interpréteur Python", role: "Précision de calcul", type: "tool", details: "Écrit et exécute un script Python pour calculer les résultats numériques" },
      { id: "s4", label: "Validation Formelle", role: "Auto-vérification", type: "eval", details: "S'assure que le résultat numérique correspond aux équations de base" }
    ],
    logsTemplate: (prompt, model, cost) => [
      `[00:00.3] ⚡ Données du problème reçues: "${prompt}"`,
      `[00:00.9] 🧠 Lancement du module de raisonnement logique profond ${model}...`,
      `[00:01.8] 🤔 <Pensée Interne> : "Il s'agit d'un problème d'APY composé. Formule: A = P(1 + r/n)^(nt)..."`,
      `[00:03.5] 🤔 <Pensée Interne> : "Je dois générer un code Python pour simuler les intérêts réinvestis avec précision s'il y a des prélèvements..."`,
      `[00:04.8] 🛠️ Outil Calculateur: Génération et exécution du script python_executor.py dans le sandbox...`,
      `[00:05.8] 🖥️ Sortie du script: "Portefeuille final: $17,623.41 | Intérêts cumulés: $7,623.41"`,
      `[00:06.5] 🔍 Vérification de la cohérence et de l'absence d'erreurs d'arrondi.`,
      `[00:06.8] ✅ Résolution mathématique certifiée rigoureuse. Coût d'inférence: ${cost} USD.`
    ]
  }
];

const WORKFLOW_NEWS: NewsArticle[] = [
  {
    id: "wf-news-1",
    title: "D’LangChain à LangGraph : La révolution des agents cycliques et persistants",
    summary: "L’évolution des architectures d'agents autonomes favorise désormais les graphes cycliques et les mécanismes de persistance d’état natifs, remplaçant les chaînes séquentielles rigides par des boucles de rétroaction complexes.",
    source: "Orchestra Journal",
    link: "#",
    pubDate: "il y a 45 minutes",
    sentiment: "positif",
    category: "Agents"
  },
  {
    id: "wf-news-2",
    title: "RAG Multi-Vectoriel & Graph RAG : Repousser les limites de la contextualisation d'entreprise",
    summary: "Le couplage de bases de données vectorielles et de graphes de connaissances (Graph RAG) permet d'extraire des relations sémantiques profondes, éliminant jusqu'à 95% des hallucinations sur les corpus documentaires denses d'entreprise.",
    source: "DataVector News",
    link: "#",
    pubDate: "il y a 3 heures",
    sentiment: "positif",
    category: "RAG"
  },
  {
    id: "wf-news-3",
    title: "Optimisation de l'inférence : Comment le routage de modèles réduit la facture de 70%",
    summary: "Les nouveaux pipelines hybrides routent dynamiquement les requêtes simples vers des modèles rapides de type Flash (comme Gemini 1.5 Flash) et ne sollicitent les modèles lourds (R1 ou Claude Sonnet) qu'en cas d'impasse logique.",
    source: "Inference Tech",
    link: "#",
    pubDate: "il y a 5 heures",
    sentiment: "positif",
    category: "Modèles"
  },
  {
    id: "wf-news-4",
    title: "Sécurité des workflows agentiques : Le risque critique d'injection de prompts indirects",
    summary: "Une nouvelle série d'attaques montre que des agents analysant des documents tiers peuvent être détournés si des instructions malveillantes y sont dissimulées, forçant le déploiement d'observateurs de sécurité d'entrée.",
    source: "CyberDefense IA",
    link: "#",
    pubDate: "il y a 8 heures",
    sentiment: "négatif",
    category: "Sécurité"
  },
  {
    id: "wf-news-5",
    title: "Programmation par démonstration : Les agents apprennent à orchestrer des API complexes",
    summary: "Les interfaces de programmation visuelle s'effacent devant des techniques où l'agent apprend à orchestrer des API complexes simplement en analysant des sessions d'enregistrement utilisateur et des traces de terminaux.",
    source: "AI UX Lab",
    link: "#",
    pubDate: "il y a 12 heures",
    sentiment: "positif",
    category: "Programmation"
  },
  {
    id: "wf-news-6",
    title: "Revue de gouvernance : Les défis juridiques de l'autonomie décisionnelle des multi-agents",
    summary: "Qui est responsable de la signature d'un mauvais contrat par un agent autonome ? L'Union européenne prépare une annexe à l'AI Act spécifiquement dédiée aux responsabilités légales des équipages d'agents.",
    source: "LegisTech Europe",
    link: "#",
    pubDate: "il y a 1 jour",
    sentiment: "neutre",
    category: "Régulation"
  }
];

export default function WorkflowLibrarySection({ searchQuery: externalSearchQuery }: { searchQuery: string }) {
  const [activeCategory, setActiveCategory] = useState<"all" | "rag" | "coder" | "multi_agent" | "reasoning">("all");
  const [selectedPreset, setSelectedPreset] = useState<WorkflowPreset>(WORKFLOW_PRESETS[0]);
  
  // Custom prompt state
  const [customPrompt, setCustomPrompt] = useState<string>("");
  
  // Interactive Simulation states
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const handleSelectPresetFromRadar = (presetId: string) => {
    const preset = WORKFLOW_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(preset);
      // Smoothly scroll to the simulator playground below
      setTimeout(() => {
        const simulatorEl = document.getElementById("workflow-simulator");
        if (simulatorEl) {
          simulatorEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  };

  // Sync sample prompt when preset changes
  useEffect(() => {
    setCustomPrompt(selectedPreset.samplePrompts[0]);
    // Reset simulation if preset changes
    setIsSimulating(false);
    setCurrentStepIndex(-1);
    setSimulatedLogs([]);
    setActiveNodeId(null);
  }, [selectedPreset]);

  // Handle local searching and filtering
  const filteredPresets = WORKFLOW_PRESETS.filter(p => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const searchWord = externalSearchQuery.toLowerCase().trim();
    const matchesSearch = !searchWord || 
      p.name.toLowerCase().includes(searchWord) || 
      p.description.toLowerCase().includes(searchWord) ||
      p.strengths.some(s => s.toLowerCase().includes(searchWord));
    return matchesCategory && matchesSearch;
  });

  // Calculate dynamic pricing
  const calculateCost = (preset: WorkflowPreset) => {
    const inputCost = (preset.avgTokensIn * preset.inputCostPerM) / 1000000;
    const outputCost = (preset.avgTokensOut * preset.outputCostPerM) / 1000000;
    return (inputCost + outputCost).toFixed(5);
  };

  // Launch simulated run
  const handleStartSimulation = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setCurrentStepIndex(0);
    setSimulatedLogs([]);
    
    const promptToUse = customPrompt.trim() || selectedPreset.samplePrompts[0];
    const costValue = calculateCost(selectedPreset);
    const templateLogs = selectedPreset.logsTemplate(promptToUse, selectedPreset.recommendedModel, costValue);
    
    // Total nodes mapped to step pacing
    // Step index mappings:
    // 0: Initial prompt ingest (node input)
    // 1-2: Processing/Retrieve logs
    // 3: Process node active
    // 4: Tool node active
    // 5: Eval node active
    // 6+: Completion
    
    let currentLogLine = 0;
    setSimulatedLogs([templateLogs[0]]);
    setActiveNodeId(selectedPreset.nodes[0].id);

    const interval = setInterval(() => {
      currentLogLine++;
      if (currentLogLine < templateLogs.length) {
        // Add log
        setSimulatedLogs(prev => [...prev, templateLogs[currentLogLine]]);
        
        // Dynamically shift active node highlight based on log timeline percentages
        const pct = currentLogLine / templateLogs.length;
        if (pct < 0.25) {
          setActiveNodeId(selectedPreset.nodes[0].id); // Input Node
        } else if (pct < 0.50) {
          setActiveNodeId(selectedPreset.nodes[1].id); // Process Node
        } else if (pct < 0.75) {
          setActiveNodeId(selectedPreset.nodes[2].id); // Tool Node
        } else {
          setActiveNodeId(selectedPreset.nodes[3].id); // Eval Node
        }
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setActiveNodeId(null);
      }
    }, 950);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
      {/* Header and Category Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-brand-yellow shrink-0 animate-pulse" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider font-sans">
              Bibliothèque de Workflows IA
            </h2>
          </div>
          <p className="text-xs text-text-secondary mt-1 max-w-xl">
            Explorez des modèles de workflows structurés par type et fonctionnalité. Testez l'interactivité d'un flux en temps réel et analysez la circulation de l'état sémantique d'un bout à l'autre.
          </p>
        </div>

        {/* Quick Categories Filter */}
        <div className="flex flex-wrap bg-bg-card p-1 rounded-lg border border-border-dark shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-brand-yellow text-bg-main font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setActiveCategory("rag")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeCategory === "rag"
                ? "bg-brand-yellow text-bg-main font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            RAG
          </button>
          <button
            onClick={() => setActiveCategory("coder")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeCategory === "coder"
                ? "bg-brand-yellow text-bg-main font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Agentique
          </button>
          <button
            onClick={() => setActiveCategory("multi_agent")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeCategory === "multi_agent"
                ? "bg-brand-yellow text-bg-main font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Multi-Agent
          </button>
          <button
            onClick={() => setActiveCategory("reasoning")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeCategory === "reasoning"
                ? "bg-brand-yellow text-bg-main font-bold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Raisonnement
          </button>
        </div>
      </div>

      {/* SECTION 1: Workflow Radar Chart / Circular Dendrogram */}
      <div>
        <WorkflowRadarChart
          onSelectPreset={handleSelectPresetFromRadar}
          selectedPresetId={selectedPreset.id}
        />
      </div>

      {/* SECTION 2: Interactive Simulator */}
      <div id="workflow-simulator" className="pt-8 border-t border-border-dark scroll-mt-20">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-brand-yellow shrink-0" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
              Simulateur Interactif & Console de Trace
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Choisissez un modèle ci-dessous, personnalisez votre consigne d'entrée, puis lancez la simulation pas à pas de l'exécution agentique.
          </p>
        </div>

        {/* Main split-screen grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left column: Preset Selection list */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider font-mono">
                Modèles Disponibles ({filteredPresets.length})
              </span>
              {externalSearchQuery && (
                <span className="text-[10px] text-brand-yellow font-mono italic">
                  Filtre de recherche actif
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const isActive = selectedPreset.id === preset.id;
                const cost = calculateCost(preset);
                
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                      isActive
                        ? "bg-bg-card border-brand-yellow shadow-lg shadow-brand-yellow/5"
                        : "bg-bg-card/70 border-border-dark hover:border-brand-yellow/30 text-text-secondary hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <span className="text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded border border-brand-yellow/20 bg-brand-yellow/5 text-brand-yellow">
                        {preset.categoryLabel}
                      </span>
                      <span className="text-[10px] font-mono text-text-secondary">
                        Coût: <strong className="text-white font-bold">${cost}</strong>/run
                      </span>
                    </div>

                    <h3 className={`text-xs font-black uppercase tracking-wide group-hover:text-brand-yellow transition-colors ${
                      isActive ? "text-brand-yellow" : "text-white"
                    }`}>
                      {preset.name}
                    </h3>

                    <p className="text-[11px] text-text-secondary leading-relaxed mt-1.5 line-clamp-2">
                      {preset.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-border-dark/60 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-text-secondary">
                        Conseil: <span className="text-white">{preset.recommendedModel}</span>
                      </span>
                      <span className="flex items-center gap-1 text-text-primary">
                        Complexité: 
                        <strong className={`px-1.5 py-0.2 rounded text-[9px] ${
                          preset.cognitiveCost === "Bas" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          preset.cognitiveCost === "Moyen" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          preset.cognitiveCost === "Élevé" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {preset.cognitiveCost}
                        </strong>
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredPresets.length === 0 && (
                <div className="bg-bg-card border border-border-dark rounded-xl p-8 text-center text-text-secondary">
                  <AlertCircle className="w-8 h-8 mx-auto text-brand-yellow mb-2 opacity-60" />
                  <p className="text-xs">Aucun modèle de workflow ne correspond à vos filtres actuels.</p>
                  <button 
                    onClick={() => { setActiveCategory("all"); }}
                    className="text-xs text-brand-yellow underline mt-2 font-bold cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Interactive Flow & Simulation */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Active Workflow details panel */}
            <div className="bg-bg-card border border-border-dark rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-border-dark/60 pb-3 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-brand-yellow font-mono">
                  Topologie Logique du Graphe
                </span>
                <span className="text-[10px] font-mono text-text-secondary">
                  Modèle recommandé: <strong className="text-white">{selectedPreset.recommendedModel}</strong>
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                {selectedPreset.description}
              </p>

              {/* Dynamic Graph Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative py-4 bg-bg-main/60 rounded-xl border border-border-dark/40 p-4 mb-6">
                {selectedPreset.nodes.map((node, idx) => {
                  const isNodeActive = activeNodeId === node.id;
                  
                  return (
                    <div key={node.id} className="relative flex flex-col items-center">
                      {/* Visual Connector arrow on medium+ screens */}
                      {idx < selectedPreset.nodes.length - 1 && (
                        <div className="hidden sm:block absolute top-[24px] left-[calc(50%+30px)] right-[calc(-50%+30px)] h-[1px] bg-gradient-to-r from-brand-yellow/30 to-brand-yellow/5 z-0" />
                      )}

                      {/* Node Visual Card */}
                      <div className={`w-full bg-bg-card border rounded-xl p-3 text-center relative z-10 transition-all duration-300 ${
                        isNodeActive
                          ? "border-brand-yellow shadow-lg shadow-brand-yellow/10 scale-105"
                          : "border-border-dark hover:border-brand-yellow/20"
                      }`}>
                        {/* Active glow indicator */}
                        {isNodeActive && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow"></span>
                          </span>
                        )}

                        <span className="text-[8px] font-mono text-brand-yellow uppercase tracking-widest font-black block">
                          Nœud {idx + 1}
                        </span>
                        <h4 className="text-[10px] font-bold text-white uppercase mt-1 truncate">
                          {node.label}
                        </h4>
                        <p className="text-[9px] text-text-secondary mt-0.5 leading-tight font-mono truncate">
                          {node.role}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Prompts and interactive simulator runner */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold font-mono">
                    Sélectionner ou Écrire une consigne d'entrée :
                  </label>
                  <button
                    onClick={() => {
                      const idx = Math.floor(Math.random() * selectedPreset.samplePrompts.length);
                      setCustomPrompt(selectedPreset.samplePrompts[idx]);
                    }}
                    className="text-[10px] text-brand-yellow hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Aléatoire
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ex: Écrire une consigne de test..."
                    className="flex-1 bg-bg-main border border-border-dark text-xs text-white rounded-xl p-3 outline-none focus:ring-1 focus:ring-brand-yellow placeholder-text-secondary"
                    disabled={isSimulating}
                  />
                  
                  <button
                    onClick={handleStartSimulation}
                    disabled={isSimulating}
                    className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shrink-0 ${
                      isSimulating
                        ? "bg-bg-stat border border-border-dark text-text-secondary cursor-not-allowed"
                        : "bg-brand-yellow text-bg-main hover:bg-brand-yellow/90 cursor-pointer shadow-lg shadow-brand-yellow/10"
                    }`}
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Simulation...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 shrink-0 fill-current" />
                        Lancer
                      </>
                    )}
                  </button>
                </div>

                {/* Sample Prompts quick chips */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedPreset.samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCustomPrompt(p)}
                      disabled={isSimulating}
                      className="text-[9px] text-text-secondary bg-bg-stat hover:text-white px-2 py-1 rounded border border-border-dark/60 cursor-pointer transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Log Console terminal */}
            <div className="bg-slate-950 border border-border-dark rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-border-dark/60">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand-yellow" />
                  <span className="text-[10px] font-mono text-white font-bold tracking-wider uppercase">
                    Terminal de Trace d'Inférence
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-brand-yellow font-mono">
                  <span className={`w-1.5 h-1.5 rounded-full bg-brand-yellow ${isSimulating ? "animate-pulse" : ""}`} />
                  <span>{isSimulating ? "TRACEUR ACTIF" : "CONSOLE PRÊTE"}</span>
                </div>
              </div>

              <div className="p-4 font-mono text-[10px] leading-relaxed min-h-[180px] max-h-[250px] overflow-y-auto space-y-2 select-text bg-slate-950/95">
                {simulatedLogs.map((log, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === simulatedLogs.length - 1 && !isSimulating;
                  return (
                    <div 
                      key={idx} 
                      className={`transition-opacity duration-300 ${
                        isLast ? "text-emerald-400 font-bold" : isFirst ? "text-brand-yellow" : "text-slate-300"
                      }`}
                    >
                      {log}
                    </div>
                  );
                })}

                {simulatedLogs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8 text-center">
                    <Terminal className="w-8 h-8 text-slate-700 mb-1" />
                    <p className="italic">Les logs s'afficheront ici lors du lancement de la simulation.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 3: Workflow News Section */}
      <div className="border-t border-border-dark pt-8">
        <NewsSection
          news={WORKFLOW_NEWS}
          isLoading={false}
          onRefresh={() => {}}
          title="Fils d'Actualités - Workflows IA"
          description="Actualités récentes sur l'orchestration sémantique d'agents, architectures logiques et nouvelles topologies cognitives."
        />
      </div>
    </div>
  );
}
