import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import { 
  ZoomIn, 
  ZoomOut, 
  Copy, 
  Check, 
  Brain, 
  Sliders, 
  Compass, 
  Play, 
  Pause,
  Info,
  Network,
  Cpu,
  Layers,
  Database,
  Terminal,
  FileCheck
} from "lucide-react";

interface RadarNode {
  name: string;
  id?: string;
  children?: RadarNode[];
}

interface WorkflowRadarChartProps {
  onSelectPreset: (presetId: string) => void;
  selectedPresetId: string;
}

const WORKFLOW_RADAR_DATA: RadarNode = {
  name: "CORE COGNITIF",
  children: [
    {
      name: "RAG & Recherche",
      id: "cat-rag",
      children: [
        {
          name: "RAG Sémantique",
          id: "rag-smart",
          children: [
            { name: "Requête & Embedding" },
            { name: "Recherche Vectorielle" },
            { name: "Synthèse LLM" },
            { name: "Filtre d'Hallucination" }
          ]
        }
      ]
    },
    {
      name: "Agentique",
      id: "cat-coder",
      children: [
        {
          name: "Agent de Codage Autonome",
          id: "coder-auto",
          children: [
            { name: "Analyse du Contexte" },
            { name: "Génération de Correctif" },
            { name: "Terminal de Test" },
            { name: "Auto-Correcteur" }
          ]
        }
      ]
    },
    {
      name: "Multi-Agent",
      id: "cat-multi",
      children: [
        {
          name: "Orchestration Multi-Agents",
          id: "multi-agent-crew",
          children: [
            { name: "Brief & Stratégie" },
            { name: "Agent Planificateur" },
            { name: "Agent Rédacteur" },
            { name: "Agent Expert SEO" }
          ]
        }
      ]
    },
    {
      name: "Raisonnement",
      id: "cat-reasoning",
      children: [
        {
          name: "Raisonnement Logique",
          id: "reasoning-chain",
          children: [
            { name: "Enoncé & Données" },
            { name: "Raisonnement Interne" },
            { name: "Interpréteur Python" },
            { name: "Validation Formelle" }
          ]
        }
      ]
    }
  ]
};

// Rich technical descriptions for each node in French
const NODE_DESCRIPTIONS: Record<string, { desc: string; icon: any; role: string }> = {
  "CORE COGNITIF": {
    desc: "Noyau d'orchestration central distribuant les charges cognitives vers les topologies spécialisées.",
    icon: Brain,
    role: "Routeur de Flux Général"
  },
  "RAG & Recherche": {
    desc: "Topologie dédiée à l'ingestion, vectorisation et extraction sémantique de connaissances documentaires tierces.",
    icon: Database,
    role: "Extraction de Vérité Terrain"
  },
  "RAG Sémantique": {
    desc: "Génération augmentée de récupération (RAG) avec filtrage à double niveau de fidélité et validation.",
    icon: Layers,
    role: "Pipeline Documentaire"
  },
  "Requête & Embedding": {
    desc: "Convertit instantanément la question naturelle en un plongement vectoriel à haute dimension (modèle text-embedding-004).",
    icon: Compass,
    role: "Vectorisation de l'intention"
  },
  "Recherche Vectorielle": {
    desc: "Exécute une recherche par similarité cosinus sur les index pour extraire les sections les plus proches.",
    icon: Database,
    role: "Recherche de Proches Voisins"
  },
  "Synthèse LLM": {
    desc: "Formule une réponse rédigée et sourcée en fusionnant les extraits dans un contexte d'instructions strictes.",
    icon: Cpu,
    role: "Inférence & Rédaction"
  },
  "Filtre d'Hallucination": {
    desc: "Modèle critique qui compare chaque phrase de la réponse finale aux sources d'origine pour éliminer les dérives sémantiques.",
    icon: FileCheck,
    role: "Garant de l'Exactitude"
  },
  "Agentique": {
    desc: "Topologie axée sur les tâches de développement en boucle fermée avec outils d'environnement et terminal interactif.",
    icon: Terminal,
    role: "Inférence Orientée Actions"
  },
  "Agent de Codage Autonome": {
    desc: "Agent capable d'ingérer l'AST de fichiers de code pour y injecter de nouvelles fonctionnalités de manière chirurgicale.",
    icon: Sliders,
    role: "Agent de Génération de Correctifs"
  },
  "Analyse du Contexte": {
    desc: "Exécute l'analyse statique des types, identifie les dépendances et génère l'arbre de dépendances du projet.",
    icon: Compass,
    role: "Analyse d'AST"
  },
  "Génération de Correctif": {
    desc: "Formule un bloc d'édition de précision (Unified diff) pour corriger l'anomalie ou ajouter la routine.",
    icon: Cpu,
    role: "Génération Structurelle"
  },
  "Terminal de Test": {
    desc: "Compile, exécute la suite de tests unitaires et récupère les traces de pile et codes d'erreur systèmes.",
    icon: Terminal,
    role: "Exécution Bac à Sable"
  },
  "Auto-Correcteur": {
    desc: "Analyse les stacktraces du terminal de test pour auto-corriger le code défectueux dans une nouvelle boucle.",
    icon: FileCheck,
    role: "Boucle d'Auto-Correction"
  },
  "Multi-Agent": {
    desc: "Topologie collaborative distribuant des rôles distincts à plusieurs sous-agents communicants de manière asynchrone.",
    icon: Network,
    role: "Orchestration Hiérarchique"
  },
  "Orchestration Multi-Agents": {
    desc: "Une équipe d'agents (Crew) : Planificateur, Rédacteur et Spécialiste SEO collaborant vers un livrable unique.",
    icon: Layers,
    role: "Manager de Crew"
  },
  "Brief & Stratégie": {
    desc: "Ingère l'objectif utilisateur et définit les profils des agents, leurs limites de tokens et budgets.",
    icon: Compass,
    role: "Initialiseur de Mission"
  },
  "Agent Planificateur": {
    desc: "Conçoit la structure logique de la réponse et organise les sections thématiques de façon séquentielle.",
    icon: Sliders,
    role: "Agent Stratégique"
  },
  "Agent Rédacteur": {
    desc: "Rédige le contenu rédactionnel brut à très haute vélocité avec une richesse lexicale adaptée à l'audience.",
    icon: Cpu,
    role: "Agent Créatif"
  },
  "Agent Expert SEO": {
    desc: "Analyse la structure sémantique, injecte les métadonnées et garantit l'alignement sur les algorithmes de recherche.",
    icon: FileCheck,
    role: "Agent Optimisateur"
  },
  "Raisonnement": {
    desc: "Topologie à chaîne de pensée de type o1/DeepSeek-R1 pour la résolution de problèmes mathématiques et financiers complexes.",
    icon: Brain,
    role: "Raisonnement Profond"
  },
  "Raisonnement Logique": {
    desc: "Boucle de raisonnement interne avec interpréteur de code intégré pour prouver les théorèmes par calcul.",
    icon: Layers,
    role: "Chaîne de Pensée Logique"
  },
  "Enoncé & Données": {
    desc: "Analyse la sémantique de l'énoncé complexe pour extraire les variables mathématiques et les constantes logiques.",
    icon: Compass,
    role: "Parsing d'Axiomes"
  },
  "Raisonnement Interne": {
    desc: "Génère des tokens de réflexion silencieux (thinking trace) pour explorer les hypothèses, tester et écarter les fausses pistes.",
    icon: Brain,
    role: "Chaîne de Réflexion Silencieuse"
  },
  "Interpréteur Python": {
    desc: "Écrit dynamiquement et exécute du code Python sandboxé pour valider empiriquement des équations physiques ou statistiques.",
    icon: Terminal,
    role: "Calculatrice Formelle"
  },
  "Validation Formelle": {
    desc: "Vérifie les contraintes logiques et sémantiques finales pour s'assurer de l'absence d'erreurs mathématiques.",
    icon: FileCheck,
    role: "Validateur Final"
  }
};

export const WorkflowRadarChart: React.FC<WorkflowRadarChartProps> = ({
  onSelectPreset,
  selectedPresetId,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(0.95);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  useEffect(() => {
    if (!svgRef.current) return;

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

    createGlowFilter("glow-yellow", "#f0b90b", 6);
    createGlowFilter("glow-cyan", "#06b6d4", 5);
    createGlowFilter("glow-purple", "#a855f7", 5);
    createGlowFilter("glow-orange", "#f97316", 5);
    createGlowFilter("glow-blue", "#3b82f6", 5);
    createGlowFilter("glow-green", "#22c55e", 5);

    // Main group with dynamic scale for zoom controls
    const mainGroup = svg
      .attr("viewBox", `-${radius} -${radius} ${width} ${height}`)
      .append("g")
      .attr("transform", `scale(${zoomLevel})`);

    // Layout radial of type Cluster (Dendrogramme)
    const cluster = d3.cluster<RadarNode>().size([2 * Math.PI, radius - 180]);
    const root = d3.hierarchy(WORKFLOW_RADAR_DATA);

    cluster(root);

    // 1. ROTATING BACKGROUND GROUP (High Performance, contains radar sweep, grid, and particles)
    const rotatingBg = mainGroup.append("g")
      .attr("class", isRotating ? "animate-radar-spin" : "");

    // 1a. Scatter background decorative network/starfield particles inside the rotating background
    const numStars = 60;
    const random = d3.randomNormal(0, radius - 200);
    const starsData = Array.from({ length: numStars }, () => {
      const r = Math.max(10, Math.min(radius - 200, Math.abs(random())));
      const angle = Math.random() * 2 * Math.PI;
      return {
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2
      };
    });

    rotatingBg.append("g")
      .attr("class", "starfield")
      .selectAll("circle")
      .data(starsData)
      .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.size)
      .attr("fill", "#94a3b8")
      .attr("opacity", d => d.opacity);

    // 1b. Draw concentric grid circles in rotating background
    const depths = [0, radius - 320, radius - 230, radius - 180];
    const depthLabels = ["", "CATÉGORIES", "WORKFLOWS", "ÉTAPES DU FLUX"];
    
    const radarGrid = rotatingBg.append("g")
      .attr("class", "radar-grid")
      .style("opacity", 0.45);

    depths.forEach((d, i) => {
      if (d === 0) return;
      // Circle grid
      radarGrid.append("circle")
        .attr("r", d)
        .attr("fill", "none")
        .attr("stroke", "#1f2229")
        .attr("stroke-width", 1.2)
        .attr("stroke-dasharray", i === 3 ? "2 6" : "6 6");

      // Outer rings grid highlights
      radarGrid.append("circle")
        .attr("r", d + 2)
        .attr("fill", "none")
        .attr("stroke", "#13161c")
        .attr("stroke-width", 0.5);

      // Grid Label
      radarGrid.append("text")
        .attr("y", -d - 6)
        .attr("text-anchor", "middle")
        .attr("fill", "#64748b")
        .attr("font-size", "8.5px")
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("letter-spacing", "0.2em")
        .attr("font-weight", "bold")
        .text(depthLabels[i]);
    });

    // Radar axes inside rotating background
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = (angle * Math.PI) / 180;
      radarGrid.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (radius - 170) * Math.cos(rad))
        .attr("y2", (radius - 170) * Math.sin(rad))
        .attr("stroke", "#1e222b")
        .attr("stroke-width", 0.6)
        .attr("stroke-dasharray", "4 8");
    }

    // 1c. Elegant glowing radar sweep gradient wedge
    const sweepArc = d3.arc<any>()
      .innerRadius(0)
      .outerRadius(radius - 170)
      .startAngle(0)
      .endAngle(Math.PI / 4); // 45-degree sweeping arc

    const sweepGradientId = "radar-sweep-gradient";
    const sweepGrad = defs.append("radialGradient")
      .attr("id", sweepGradientId)
      .attr("cx", "0%")
      .attr("cy", "0%")
      .attr("r", "100%");
    
    sweepGrad.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f0b90b")
      .attr("stop-opacity", 0.08);
    sweepGrad.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f0b90b")
      .attr("stop-opacity", 0.0);

    rotatingBg.append("path")
      .attr("d", sweepArc(null))
      .attr("fill", `url(#${sweepGradientId})`)
      .attr("opacity", 0.65)
      .attr("transform", "rotate(-25)");

    // 2. STATIC NETWORKS / LINKS (Rendered outside background so they are clear)
    const linkGenerator = d3.linkRadial<any, any>()
      .angle(d => d.x)
      .radius(d => d.y);

    const linksGroup = mainGroup.append("g").attr("class", "network-links");

    // Underlay subtle link shadow lines
    linksGroup.selectAll(".underlink")
      .data(root.links())
      .join("path")
      .attr("d", linkGenerator)
      .attr("fill", "none")
      .attr("stroke", "#0e1116")
      .attr("stroke-width", 4)
      .attr("opacity", 0.8);

    // Main links with dynamic category colors
    const links = linksGroup.selectAll(".main-link")
      .data(root.links())
      .join("path")
      .attr("class", "transition-all duration-300")
      .attr("d", linkGenerator)
      .attr("fill", "none")
      .attr("stroke", d => {
        const cat = d.target.ancestors().find(anc => anc.depth === 1)?.data.name;
        if (cat === "RAG & Recherche") return "#3b82f6";
        if (cat === "Agentique") return "#f97316";
        if (cat === "Multi-Agent") return "#a855f7";
        if (cat === "Raisonnement") return "#06b6d4";
        return "#f0b90b";
      })
      .attr("stroke-width", d => {
        if (hoveredNode) {
          const isTarget = d.target.data.name === hoveredNode || 
                           d.target.descendants().some(desc => desc.data.name === hoveredNode);
          if (isTarget) return 3.0;
        }
        const isPresetSelected = d.target.data.id === selectedPresetId || 
                                 d.target.ancestors().some(anc => anc.data.id === selectedPresetId);
        return isPresetSelected ? 2.5 : 1.25;
      })
      .attr("opacity", d => {
        if (hoveredNode) {
          const isTarget = d.target.data.name === hoveredNode || 
                           d.target.descendants().some(desc => desc.data.name === hoveredNode) ||
                           d.source.data.name === hoveredNode;
          return isTarget ? 1.0 : 0.08;
        }
        const isPresetSelected = d.target.data.id === selectedPresetId || 
                                 d.target.ancestors().some(anc => anc.data.id === selectedPresetId);
        return isPresetSelected ? 0.85 : 0.3;
      })
      .attr("filter", d => {
        const cat = d.target.ancestors().find(anc => anc.depth === 1)?.data.name;
        const isPresetSelected = d.target.data.id === selectedPresetId || 
                                 d.target.ancestors().some(anc => anc.data.id === selectedPresetId);

        if (hoveredNode) {
          const isTarget = d.target.data.name === hoveredNode || 
                           d.target.descendants().some(desc => desc.data.name === hoveredNode);
          if (isTarget) {
            if (cat === "RAG & Recherche") return "url(#glow-blue)";
            if (cat === "Agentique") return "url(#glow-orange)";
            if (cat === "Multi-Agent") return "url(#glow-purple)";
            if (cat === "Raisonnement") return "url(#glow-cyan)";
          }
        } else if (isPresetSelected) {
          if (cat === "RAG & Recherche") return "url(#glow-blue)";
          if (cat === "Agentique") return "url(#glow-orange)";
          if (cat === "Multi-Agent") return "url(#glow-purple)";
          if (cat === "Raisonnement") return "url(#glow-cyan)";
        }
        return null;
      });

    // 2a. SIGNAL FLOWS / GLOWING TRAVELING PARTICLES
    // Overlay dashed flowing links that represent data traveling along active paths
    const pulses = mainGroup.append("g")
      .attr("class", "signal-pulses")
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("d", linkGenerator)
      .attr("fill", "none")
      .attr("stroke", d => {
        const cat = d.target.ancestors().find(anc => anc.depth === 1)?.data.name;
        if (cat === "RAG & Recherche") return "#93c5fd";
        if (cat === "Agentique") return "#fed7aa";
        if (cat === "Multi-Agent") return "#e9d5ff";
        if (cat === "Raisonnement") return "#cffafe";
        return "#fef08a";
      })
      .attr("stroke-width", d => {
        const isTargetHovered = hoveredNode && (
          d.target.data.name === hoveredNode || d.target.descendants().some(desc => desc.data.name === hoveredNode)
        );
        return isTargetHovered ? 3.5 : 2.0;
      })
      .attr("stroke-dasharray", "8 16")
      .attr("class", "animate-radar-pulse-flow")
      .attr("opacity", d => {
        if (hoveredNode) {
          const isTarget = d.target.data.name === hoveredNode || 
                           d.target.descendants().some(desc => desc.data.name === hoveredNode);
          return isTarget ? 1.0 : 0.0;
        }
        // Always pulse traveling signals on the selected preset path!
        const isPresetSelected = d.target.data.id === selectedPresetId || 
                                 d.target.ancestors().some(anc => anc.data.id === selectedPresetId);
        return isPresetSelected ? 0.75 : 0.15;
      })
      .attr("filter", d => {
        const cat = d.target.ancestors().find(anc => anc.depth === 1)?.data.name;
        if (cat === "RAG & Recherche") return "url(#glow-blue)";
        if (cat === "Agentique") return "url(#glow-orange)";
        if (cat === "Multi-Agent") return "url(#glow-purple)";
        if (cat === "Raisonnement") return "url(#glow-cyan)";
        return null;
      });

    // 3. INTERACTIVE NODES CONTAINER
    const nodesGroup = mainGroup.append("g").attr("class", "network-nodes");

    const node = nodesGroup.selectAll("g")
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
      })
      .on("click", (event, d) => {
        // Find if this is inside or is the preset node itself (depth === 2)
        const clickedPreset = d.ancestors().find(anc => anc.depth === 2);
        if (clickedPreset && clickedPreset.data.id) {
          onSelectPreset(clickedPreset.data.id);
        } else if (d.depth === 1) {
          // If category clicked, find its preset
          const presetChild = d.descendants().find(desc => desc.depth === 2);
          if (presetChild && presetChild.data.id) {
            onSelectPreset(presetChild.data.id);
          }
        }
      });

    // Add extra glowing pulse rings specifically behind active selected preset nodes
    node.filter(d => d.depth === 2 && d.data.id === selectedPresetId)
      .append("circle")
      .attr("r", 14)
      .attr("fill", "none")
      .attr("stroke", "#f0b90b")
      .attr("stroke-width", 1.5)
      .attr("class", "animate-radar-ring-pulse")
      .attr("filter", "url(#glow-yellow)");

    // Node circles - Cyber style
    node.append("circle")
      .attr("fill", d => {
        if (d.depth === 0) return "#f0b90b"; // Root Core
        if (d.depth === 1) {
          if (d.data.name === "RAG & Recherche") return "#3b82f6";
          if (d.data.name === "Agentique") return "#f97316";
          if (d.data.name === "Multi-Agent") return "#a855f7";
          return "#06b6d4"; // Raisonnement
        }
        if (d.depth === 2) {
          // Highlight currently selected preset
          if (d.data.id === selectedPresetId) return "#f0b90b";
          return "#1e293b";
        }
        return "#ffffff"; // Leaves / Steps
      })
      .attr("r", d => {
        if (d.depth === 0) return 10;
        if (d.depth === 1) return 7.5;
        if (d.depth === 2) return 6.5;
        return 4.5;
      })
      .attr("stroke", d => {
        if (d.depth === 0) return "rgba(240, 185, 11, 0.4)";
        if (d.depth === 2) {
          if (d.data.id === selectedPresetId) return "#ffffff";
          const cat = d.ancestors().find(anc => anc.depth === 1)?.data.name;
          if (cat === "RAG & Recherche") return "#3b82f6";
          if (cat === "Agentique") return "#f97316";
          if (cat === "Multi-Agent") return "#a855f7";
          return "#06b6d4";
        }
        if (d.depth === 3) {
          const cat = d.ancestors().find(anc => anc.depth === 1)?.data.name;
          if (cat === "RAG & Recherche") return "#1d4ed8";
          if (cat === "Agentique") return "#c2410c";
          if (cat === "Multi-Agent") return "#7e22ce";
          return "#0e7490";
        }
        return "#0b0e11";
      })
      .attr("stroke-width", d => {
        if (d.depth === 0) return 6;
        if (d.depth === 2) return d.data.id === selectedPresetId ? 3.0 : 2.0;
        return 1.8;
      })
      .attr("filter", d => {
        const cat = d.ancestors().find(anc => anc.depth === 1)?.data.name;
        if (hoveredNode === d.data.name) {
          if (cat === "RAG & Recherche") return "url(#glow-blue)";
          if (cat === "Agentique") return "url(#glow-orange)";
          if (cat === "Multi-Agent") return "url(#glow-purple)";
          if (cat === "Raisonnement") return "url(#glow-cyan)";
          return "url(#glow-yellow)";
        }
        if (d.depth === 0) return "url(#glow-yellow)";
        if (d.depth === 2 && d.data.id === selectedPresetId) return "url(#glow-yellow)";
        return null;
      })
      .attr("class", "transition-all duration-300 hover:scale-130");

    // Add glowing core for root node
    node.filter(d => d.depth === 0)
      .append("circle")
      .attr("r", 4.5)
      .attr("fill", "#ffffff")
      .attr("filter", "url(#glow-yellow)");

    // 4. Texts - Dynamic styling with modern JetBrains Mono
    node.append("text")
      .attr("dy", "0.32em")
      .attr("x", d => d.x < Math.PI === !d.children ? 14 : -14)
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .text(d => d.data.name)
      .attr("fill", d => {
        if (hoveredNode === d.data.name) return "#ffffff";
        if (d.depth === 0) return "#f0b90b";
        if (d.depth === 1) {
          if (d.data.name === "RAG & Recherche") return "#60a5fa";
          if (d.data.name === "Agentique") return "#fb923c";
          if (d.data.name === "Multi-Agent") return "#c084fc";
          return "#22d3ee";
        }
        if (d.depth === 2) {
          if (d.data.id === selectedPresetId) return "#f0b90b";
          return "#f8fafc";
        }
        return "#94a3b8"; // Leaf nodes
      })
      .attr("font-size", d => {
        if (d.depth === 0) return "14px";
        if (d.depth === 1) return "13px";
        if (d.depth === 2) return "12px";
        return "10.5px";
      })
      .style("font-weight", d => {
        if (d.depth === 0) return "900";
        if (d.depth === 2) return d.data.id === selectedPresetId ? "900" : "700";
        if (d.depth === 1) return "800";
        return "500";
      })
      .style("font-style", d => d.depth < 3 ? "italic" : "normal")
      .style("font-family", "JetBrains Mono, SFMono-Regular, monospace, sans-serif")
      .style("text-shadow", "0 0 6px #000000, 0 0 12px #000000")
      .attr("opacity", d => {
        if (hoveredNode) {
          const isActive = d.data.name === hoveredNode || 
                           d.ancestors().some(anc => anc.data.name === hoveredNode) ||
                           d.descendants().some(desc => desc.data.name === hoveredNode);
          return isActive ? 1.0 : 0.25;
        }
        // Highlight active preset route
        const isPresetSelected = d.data.id === selectedPresetId || 
                                 d.ancestors().some(anc => anc.data.id === selectedPresetId);
        return isPresetSelected ? 1.0 : 0.8;
      });

  }, [zoomLevel, hoveredNode, selectedPresetId, isRotating]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.4));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.65));
  const handleResetZoom = () => setZoomLevel(0.95);

  const handleCopyText = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Extract metadata of the hovered node for the smart panel
  const getHoveredMetadata = () => {
    if (!hoveredNode) return null;
    return NODE_DESCRIPTIONS[hoveredNode] || {
      desc: "Composant topologique de décision et d'orchestration cognitive modélisé.",
      icon: Network,
      role: "Maillon de flux cognitif"
    };
  };

  const activeMeta = getHoveredMetadata();
  const IconComponent = activeMeta?.icon || Info;

  return (
    <div className="bg-bg-card border border-border-dark rounded-2xl p-6 relative overflow-hidden" id="workflow-radar-widget">
      
      {/* Self-contained CSS Animations to avoid tailwind.config overrides */}
      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-radar-spin {
          animation: radar-spin 160s linear infinite;
          transform-origin: center;
        }
        
        @keyframes pulse-flow {
          from { stroke-dashoffset: 48; }
          to { stroke-dashoffset: 0; }
        }
        .animate-radar-pulse-flow {
          animation: pulse-flow 2s linear infinite;
        }

        @keyframes ring-pulse {
          0% { transform: scale(0.9) rotate(0deg); opacity: 0.9; }
          50% { transform: scale(1.3) rotate(180deg); opacity: 0.2; }
          100% { transform: scale(0.9) rotate(360deg); opacity: 0.9; }
        }
        .animate-radar-ring-pulse {
          animation: ring-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          transform-origin: center;
        }
      `}</style>

      {/* Header section inside card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow animate-pulse" />
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 font-sans tracking-tight">
              Radar Topologique des Workflows IA
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Moteur de rendu vectoriel d'orchestration cognitive. Visualisez et commutez les topologies d'étapes.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          {/* Scan Auto Rotation Toggle */}
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-mono transition cursor-pointer ${
              isRotating 
                ? "bg-brand-yellow/10 border-brand-yellow/30 text-brand-yellow font-bold" 
                : "bg-bg-main border-border-dark text-text-secondary hover:text-text-primary"
            }`}
            title={isRotating ? "Mettre le sonar en pause" : "Activer la rotation du sonar"}
          >
            {isRotating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Sonar Actif</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Sonar Statique</span>
              </>
            )}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-bg-main border border-border-dark rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              title="Zoom arrière"
              className="p-1.5 hover:bg-bg-card text-text-secondary hover:text-text-primary rounded transition cursor-pointer"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Réinitialiser zoom"
              className="px-2 text-[10px] font-mono text-text-secondary hover:text-text-primary hover:bg-bg-card rounded transition cursor-pointer"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom avant"
              className="p-1.5 hover:bg-bg-card text-text-secondary hover:text-text-primary rounded transition cursor-pointer"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Legend, Instructions and Details Card */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          
          {/* Detailed Topology explanation card */}
          <div className="bg-bg-main border border-border-dark rounded-xl p-4.5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">Topologie Actuelle</h4>
              <span className="text-[10px] font-mono bg-bg-card px-2 py-0.5 border border-border-dark rounded text-brand-yellow font-semibold animate-pulse">LIVE</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-dark/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                  <span className="text-xs font-bold text-text-primary">RAG & Recherche</span>
                </div>
                <span className="text-[10.5px] font-mono text-text-secondary">4 Nodes</span>
              </div>

              <div className="flex items-center justify-between border-b border-border-dark/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                  <span className="text-xs font-bold text-text-primary">Agentique & Code</span>
                </div>
                <span className="text-[10.5px] font-mono text-text-secondary">4 Nodes</span>
              </div>

              <div className="flex items-center justify-between border-b border-border-dark/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                  <span className="text-xs font-bold text-text-primary">Orchestre Multi-Agent</span>
                </div>
                <span className="text-[10.5px] font-mono text-text-secondary">4 Nodes</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                  <span className="text-xs font-bold text-text-primary">Raisonnement Pur</span>
                </div>
                <span className="text-[10.5px] font-mono text-text-secondary">4 Nodes</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Tooltip Panel */}
          <div className="bg-bg-main border border-border-dark rounded-xl p-4.5 flex-1 flex flex-col justify-between min-h-[190px]">
            <AnimatePresence mode="wait">
              {hoveredNode && activeMeta ? (
                <motion.div
                  key={hoveredNode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col h-full justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-brand-yellow/10 rounded-lg border border-brand-yellow/20">
                        <IconComponent className="w-4 h-4 text-brand-yellow" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-brand-yellow uppercase tracking-wider block font-bold leading-none">
                          {activeMeta.role}
                        </span>
                        <h4 className="text-sm font-black text-text-primary tracking-tight font-mono">
                          {hoveredNode}
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed font-sans">
                      {activeMeta.desc}
                    </p>
                  </div>

                  <div className="border-t border-border-dark/60 pt-2 flex items-center justify-between text-[10px] font-mono text-text-secondary">
                    <span>Statut de sélection :</span>
                    <span className="text-brand-yellow font-bold">Cliquez pour charger</span>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-border-dark/40 rounded-lg">
                        <Brain className="w-4 h-4 text-text-secondary" />
                      </div>
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                        Inspecteur Sémantique
                      </h4>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Survolez n'importe quelle étape du réseau ou nœud technologique pour inspecter son rôle et sa fonction cognitive en temps réel.
                    </p>
                  </div>

                  <div className="bg-bg-card/60 p-2.5 rounded-lg border border-border-dark/40 text-[11px] text-text-secondary flex gap-2 items-start leading-relaxed font-mono">
                    <span className="text-brand-yellow">⚡</span>
                    <span><strong>Sélection directe :</strong> Cliquez sur un workflow pour charger son prompt et sa simulation.</span>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Column: D3 SVG Radial Sonar Canvas */}
        <div className="lg:col-span-8 flex justify-center items-center bg-[#000000] p-4 sm:p-6 rounded-2xl border border-border-dark/80 shadow-2xl relative overflow-hidden group min-h-[480px]">
          {/* Cyber grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,34,43,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(30,34,43,0.15)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#1e222b_1px,transparent_1px)] [background-size:12px_12px] opacity-25 pointer-events-none" />
          
          <svg
            ref={svgRef}
            className="w-full max-w-[530px] md:max-w-[600px] h-auto select-none overflow-visible relative z-10"
          ></svg>

          {/* Interactive Hover Breadcrumbs */}
          <AnimatePresence>
            {hoveredNode && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-4 left-4 right-4 bg-bg-main/95 backdrop-blur-md border border-brand-yellow/30 rounded-xl p-3 z-20 flex flex-col gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
              >
                {/* Semantic Path */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-text-secondary">
                  <span className="text-[9px] bg-brand-yellow/10 text-brand-yellow px-1.5 py-0.5 rounded border border-brand-yellow/20 font-extrabold">CHEMIN COGNITIF</span>
                  {hoveredPath.map((nodeName, idx) => {
                    const isLast = idx === hoveredPath.length - 1;
                    return (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span className="opacity-40">➔</span>}
                        <span 
                          className={`px-1.5 py-0.5 rounded ${
                            idx === 0 
                              ? "bg-brand-yellow/10 font-bold text-brand-yellow" 
                              : idx === 1 
                                ? "bg-bg-card font-bold text-white border border-border-dark" 
                                : isLast 
                                  ? "text-brand-yellow font-extrabold animate-pulse" 
                                  : "text-text-primary"
                          }`}
                        >
                          {nodeName}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Main Label and Copy button */}
                <div className="flex items-center justify-between gap-4 border-t border-border-dark/60 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-text-secondary uppercase tracking-wider">Cible active :</span>
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
                        <span className="text-price-green font-bold">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-brand-yellow" />
                        <span>Copier ID</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
