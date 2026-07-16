import React, { useState, useMemo } from "react";
import { 
  Gamepad2, 
  Search, 
  Layers, 
  Coins, 
  Users, 
  TrendingUp, 
  Flame, 
  ArrowUpDown, 
  ChevronRight, 
  Star, 
  ExternalLink, 
  Calculator, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Filter,
  RefreshCw,
  Trophy,
  Activity,
  Heart,
  LayoutGrid,
  AreaChart as ChartIcon,
  Cpu,
  Milestone,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip as RechartsTooltip, 
  Cell,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";

interface BlockchainGame {
  id: string;
  name: string;
  genre: string;
  blockchain: string;
  platform: string;
  tokenSymbol: string;
  tokenPrice: number;
  tokenChange24h: number;
  dau: number; // Daily Active Users
  dauChange24h: number;
  socialScore: number; // Out of 100
  status: "Live" | "Beta" | "Presale" | "Alpha";
  nftSupport: boolean;
  freeToPlay: boolean;
  score: number; // Overall Rating
  earnPotential: "High" | "Medium" | "Low";
  thumbnail: string;
  description: string;
}

const P2E_GAMES_DATA: BlockchainGame[] = [
  {
    id: "g1",
    name: "Axie Infinity",
    genre: "Auto-Battler / Breed",
    blockchain: "Ronin",
    platform: "PC / Android",
    tokenSymbol: "AXS",
    tokenPrice: 5.42,
    tokenChange24h: 3.45,
    dau: 125000,
    dauChange24h: 1.2,
    socialScore: 89,
    status: "Live",
    nftSupport: true,
    freeToPlay: false,
    score: 8.7,
    earnPotential: "Medium",
    thumbnail: "🦖",
    description: "Le pionnier du Play-to-Earn où vous combattez, élevez et collectionnez des créatures fantastiques nommées Axies."
  },
  {
    id: "g2",
    name: "Illuvium",
    genre: "RPG / Open World",
    blockchain: "Ethereum",
    platform: "PC / Mac",
    tokenSymbol: "ILV",
    tokenPrice: 38.65,
    tokenChange24h: 8.21,
    dau: 45000,
    dauChange24h: 12.8,
    socialScore: 92,
    status: "Beta",
    nftSupport: true,
    freeToPlay: true,
    score: 9.1,
    earnPotential: "High",
    thumbnail: "🦁",
    description: "Un jeu d'aventure RPG en monde ouvert avec des graphismes AAA où vous capturez des bêtes divines appelées Illuvials."
  },
  {
    id: "g3",
    name: "Decentraland",
    genre: "Virtual World",
    blockchain: "Ethereum",
    platform: "Web / PC",
    tokenSymbol: "MANA",
    tokenPrice: 0.325,
    tokenChange24h: -1.15,
    dau: 8900,
    dauChange24h: -2.4,
    socialScore: 82,
    status: "Live",
    nftSupport: true,
    freeToPlay: true,
    score: 8.0,
    earnPotential: "Medium",
    thumbnail: "🏙️",
    description: "Le métavers décentralisé de premier plan où les utilisateurs achètent des parcelles de terrain (LAND), créent et monétisent du contenu."
  },
  {
    id: "g4",
    name: "The Sandbox",
    genre: "Sandbox / Metaverse",
    blockchain: "Ethereum",
    platform: "PC / Mac",
    tokenSymbol: "SAND",
    tokenPrice: 0.358,
    tokenChange24h: 4.88,
    dau: 14200,
    dauChange24h: 6.5,
    socialScore: 85,
    status: "Live",
    nftSupport: true,
    freeToPlay: true,
    score: 8.3,
    earnPotential: "Medium",
    thumbnail: "👾",
    description: "Créez, jouez et possédez des actifs de jeu voxel virtuels construits de manière modulaire au sein de l'écosystème Sandbox."
  },
  {
    id: "g5",
    name: "Splinterlands",
    genre: "Trading Card Game",
    blockchain: "Hive",
    platform: "Web / Mobile",
    tokenSymbol: "SPS",
    tokenPrice: 0.012,
    tokenChange24h: -0.45,
    dau: 85000,
    dauChange24h: -0.8,
    socialScore: 78,
    status: "Live",
    nftSupport: true,
    freeToPlay: true,
    score: 7.9,
    earnPotential: "Low",
    thumbnail: "🃏",
    description: "Un jeu de cartes à collectionner rapide et tactique entièrement basé sur des contrats intelligents et transactions Hive instantanées."
  },
  {
    id: "g6",
    name: "Star Atlas",
    genre: "Space Strategy / MMO",
    blockchain: "Solana",
    platform: "PC (Epic Games)",
    tokenSymbol: "ATLAS",
    tokenPrice: 0.0031,
    tokenChange24h: 15.42,
    dau: 32000,
    dauChange24h: 22.1,
    socialScore: 94,
    status: "Alpha",
    nftSupport: true,
    freeToPlay: false,
    score: 9.3,
    earnPotential: "High",
    thumbnail: "🚀",
    description: "Une odyssée spatiale de stratégie à grande échelle construite sur Unreal Engine 5 avec une économie galactique pilotée sur Solana."
  },
  {
    id: "g7",
    name: "Parallel",
    genre: "Sci-Fi TCG",
    blockchain: "Base",
    platform: "PC",
    tokenSymbol: "PRIME",
    tokenPrice: 8.14,
    tokenChange24h: 6.95,
    dau: 28000,
    dauChange24h: 14.2,
    socialScore: 90,
    status: "Live",
    nftSupport: true,
    freeToPlay: true,
    score: 8.9,
    earnPotential: "High",
    thumbnail: "🪐",
    description: "Un jeu de cartes de science-fiction primé combinant gameplay hautement compétitif et intégration sémantique Web3."
  },
  {
    id: "g8",
    name: "Pixels",
    genre: "Farming RPG / Social",
    blockchain: "Ronin",
    platform: "Web",
    tokenSymbol: "PIXEL",
    tokenPrice: 0.185,
    tokenChange24h: 11.23,
    dau: 245000,
    dauChange24h: 8.9,
    socialScore: 91,
    status: "Live",
    nftSupport: true,
    freeToPlay: true,
    score: 8.8,
    earnPotential: "Medium",
    thumbnail: "👩‍🌾",
    description: "Un jeu de rôle pixelisé en monde ouvert captivant basé sur l'agriculture, le commerce et l'exploration de quêtes."
  }
];

// Color mapping for chains
const CHAIN_COLORS: Record<string, string> = {
  "Ronin": "#3b82f6",     // Ronin blue
  "Ethereum": "#6366f1",  // Indy/Purple
  "Solana": "#14b8a6",    // Teal Solana
  "Hive": "#ef4444",      // Hive red
  "Base": "#a855f7"       // Base purple
};

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as BlockchainGame;
    return (
      <div className="bg-bg-main border border-border-dark p-4 rounded-xl shadow-2xl max-w-xs space-y-2 font-sans text-xs">
        <div className="flex items-center gap-2">
          <span className="text-xl">{data.thumbnail}</span>
          <div>
            <span className="font-bold text-white block">{data.name}</span>
            <span className="text-[10px] font-mono text-brand-yellow font-bold bg-brand-yellow/10 px-1.5 py-0.2 rounded mt-0.5 inline-block">{data.tokenSymbol}</span>
          </div>
        </div>
        <p className="text-[11px] text-text-secondary leading-normal">{data.description}</p>
        <div className="border-t border-border-dark/60 pt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[10px]">
          <div>
            <span className="text-text-secondary block">Blockchain:</span>
            <span className="text-white font-bold" style={{ color: CHAIN_COLORS[data.blockchain] || "#f0b90b" }}>{data.blockchain}</span>
          </div>
          <div>
            <span className="text-text-secondary block">Note Globale:</span>
            <span className="text-brand-yellow font-bold">★ {data.score.toFixed(1)}/10</span>
          </div>
          <div>
            <span className="text-text-secondary block">Joueurs (DAU):</span>
            <span className="text-white font-bold">{data.dau.toLocaleString("fr-FR")}</span>
          </div>
          <div>
            <span className="text-text-secondary block">Gains:</span>
            <span className="text-green-400 font-bold">{data.earnPotential}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PlayToEarnSection() {
  const [games, setGames] = useState<BlockchainGame[]>(P2E_GAMES_DATA);
  const [selectedGame, setSelectedGame] = useState<BlockchainGame | null>(P2E_GAMES_DATA[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [blockchainFilter, setBlockchainFilter] = useState<string>("All");
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"score" | "dau" | "tokenPrice" | "socialScore">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // View mode switcher: "list" (Table & Simulator) vs "chart" (Best Games vs Frameworks mapping)
  const [activeViewMode, setActiveViewMode] = useState<"list" | "chart">("list");

  // Calculator Simulator state
  const [calcDailyHours, setCalcDailyHours] = useState<number>(2);
  const [calcWinRate, setCalcWinRate] = useState<number>(55);
  const [calcMultiplier, setCalcMultiplier] = useState<number>(1.2); // NFT Multiplier

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(["g1", "g6"]);

  const blockchains = ["All", "Ethereum", "Solana", "Ronin", "Hive", "Base"];
  const genres = ["All", "RPG / Open World", "Virtual World", "Space Strategy / MMO", "Trading Card Game", "Auto-Battler / Breed", "Farming RPG / Social"];

  const handleFavoriteToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleSort = (field: "score" | "dau" | "tokenPrice" | "socialScore") => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Filtered and Sorted Games
  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        const matchSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            game.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            game.genre.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchBlockchain = blockchainFilter === "All" || game.blockchain.includes(blockchainFilter);
        const matchGenre = genreFilter === "All" || game.genre === genreFilter;

        return matchSearch && matchBlockchain && matchGenre;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortOrder === "asc") {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [games, searchQuery, blockchainFilter, genreFilter, sortBy, sortOrder]);

  // Aggregate Stats per Framework for advanced mapping insights
  const frameworkAnalytics = useMemo(() => {
    const summary: Record<string, { totalDau: number; totalGames: number; avgScore: number; bestGame: string; bestScore: number }> = {};
    
    // Initialize
    blockchains.slice(1).forEach(bc => {
      summary[bc] = { totalDau: 0, totalGames: 0, avgScore: 0, bestGame: "-", bestScore: 0 };
    });

    games.forEach(game => {
      const bc = game.blockchain;
      if (summary[bc]) {
        summary[bc].totalDau += game.dau;
        summary[bc].totalGames += 1;
        summary[bc].avgScore += game.score;
        if (game.score > summary[bc].bestScore) {
          summary[bc].bestScore = game.score;
          summary[bc].bestGame = game.name;
        }
      }
    });

    // Calculate averages and transform to array
    return Object.entries(summary).map(([name, stat]) => ({
      name,
      totalDau: stat.totalDau,
      totalGames: stat.totalGames,
      avgScore: stat.totalGames > 0 ? Number((stat.avgScore / stat.totalGames).toFixed(2)) : 0,
      bestGame: stat.bestGame,
      bestScore: stat.bestScore
    })).filter(item => item.totalGames > 0);
  }, [games]);

  // Find overall leader insights
  const highestRatedGame = useMemo(() => {
    return [...games].sort((a, b) => b.score - a.score)[0];
  }, [games]);

  const dominantFramework = useMemo(() => {
    return [...frameworkAnalytics].sort((a, b) => b.totalDau - a.totalDau)[0];
  }, [frameworkAnalytics]);

  // Simulator Calculations
  const calculateEarnings = (game: BlockchainGame) => {
    let baseTokenRewardPerHour = 5; 
    if (game.earnPotential === "High") baseTokenRewardPerHour = 12;
    if (game.earnPotential === "Low") baseTokenRewardPerHour = 2;

    const dailyTokens = baseTokenRewardPerHour * calcDailyHours * (calcWinRate / 50) * calcMultiplier;
    const dailyUsd = dailyTokens * game.tokenPrice;
    
    return {
      tokensDaily: dailyTokens.toFixed(2),
      usdDaily: dailyUsd.toFixed(2),
      usdWeekly: (dailyUsd * 7).toFixed(2),
      usdMonthly: (dailyUsd * 30).toFixed(2)
    };
  };

  const currentEarnings = selectedGame ? calculateEarnings(selectedGame) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Overview Head */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Gamepad2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-extrabold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">WEB3 GAMING MATRIX</span>
              <h1 className="text-2xl font-black text-text-primary tracking-tight font-sans mt-0.5">
                Play-to-Earn Analytics & Mapping
              </h1>
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-1 max-w-xl">
            Suivi des performances des jeux blockchain. Cartographiez les meilleurs jeux vis-à-vis de leur framework et de leur volume d'utilisateurs.
          </p>
        </div>

        {/* Quick statistics widgets */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-bg-card border border-border-dark px-3.5 py-2 rounded-xl flex items-center gap-3 shadow-lg">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-secondary block">GAMERS ACTIFS (DAU)</span>
              <span className="text-xs font-bold text-white">587,600 DAU</span>
            </div>
          </div>
          <div className="bg-bg-card border border-border-dark px-3.5 py-2 rounded-xl flex items-center gap-3 shadow-lg">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-secondary block">SECTEUR TREND 24H</span>
              <span className="text-xs font-bold text-emerald-400">+5.74%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Switcher Tab bar */}
      <div className="flex items-center justify-between border-b border-border-dark pb-3 mb-6">
        <div className="flex items-center gap-2 bg-bg-main p-1 rounded-xl border border-border-dark">
          <button
            onClick={() => setActiveViewMode("list")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeViewMode === "list"
                ? "bg-emerald-500 text-bg-main font-bold shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Tableau des Jeux & Simulateur</span>
          </button>
          <button
            onClick={() => setActiveViewMode("chart")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeViewMode === "chart"
                ? "bg-emerald-500 text-bg-main font-bold shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <ChartIcon className="w-4 h-4" />
            <span>Cartographie : Jeux VS Frameworks</span>
          </button>
        </div>

        {/* Info label */}
        <span className="text-[10px] font-mono text-text-secondary hidden sm:inline-block">
          Dernière mise à jour sémantique : <strong>Live</strong>
        </span>
      </div>

      {/* Conditionally Render views */}
      <AnimatePresence mode="wait">
        {activeViewMode === "list" ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* Left Column (8 units): Filtering Controls and Games List Table */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Advanced Search & Filtering Area */}
              <div className="bg-bg-card border border-border-dark rounded-2xl p-4.5 space-y-4">
                <div className="flex flex-col md:flex-row gap-3.5">
                  {/* Search */}
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-4 w-4 text-text-secondary" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un jeu P2E, un token (ex: AXS, ILV)..."
                      className="w-full bg-bg-main border border-border-dark rounded-xl py-2 pl-9 pr-4 text-xs text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>

                  {/* Blockchain selection filter */}
                  <div className="flex items-center gap-2 bg-bg-main border border-border-dark rounded-xl px-2.5 py-1">
                    <Filter className="w-3.5 h-3.5 text-text-secondary" />
                    <select
                      id="p2e-blockchain-select"
                      aria-label="Filtrer par Blockchain"
                      value={blockchainFilter}
                      onChange={(e) => setBlockchainFilter(e.target.value)}
                      className="bg-transparent text-xs text-text-primary font-mono focus:outline-none cursor-pointer"
                    >
                      {blockchains.map(bc => (
                        <option key={bc} value={bc} className="bg-bg-card text-text-primary">{bc === "All" ? "Toutes Blockchains" : bc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Genre selection filter */}
                  <div className="flex items-center gap-2 bg-bg-main border border-border-dark rounded-xl px-2.5 py-1">
                    <Layers className="w-3.5 h-3.5 text-text-secondary" />
                    <select
                      id="p2e-genre-select"
                      aria-label="Filtrer par Genre"
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                      className="bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer"
                    >
                      {genres.map(g => (
                        <option key={g} value={g} className="bg-bg-card text-text-primary">{g === "All" ? "Tous Genres" : g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Micro Tags overview */}
                <div className="flex flex-wrap items-center gap-2.5 border-t border-border-dark/60 pt-3.5">
                  <span className="text-[10px] font-mono text-text-secondary uppercase">Chaînes actives :</span>
                  {blockchains.slice(1).map(bc => (
                    <button
                      key={bc}
                      onClick={() => setBlockchainFilter(bc)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                        blockchainFilter === bc 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold" 
                          : "bg-bg-main text-text-secondary border border-border-dark hover:text-text-primary cursor-pointer"
                      }`}
                    >
                      {bc}
                    </button>
                  ))}
                  {blockchainFilter !== "All" && (
                    <button 
                      onClick={() => setBlockchainFilter("All")}
                      className="text-[10px] text-emerald-400 hover:underline ml-auto cursor-pointer font-mono"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive games catalog table container */}
              <div className="bg-bg-card border border-border-dark rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-dark bg-bg-main/50 text-[10px] font-mono text-text-secondary uppercase tracking-wider select-none">
                        <th className="py-3 px-4 text-center w-12">Fav</th>
                        <th className="py-3 px-4">Jeu / Projet</th>
                        <th className="py-3 px-4 cursor-pointer hover:bg-bg-main/80" onClick={() => handleSort("tokenPrice")}>
                          <div className="flex items-center gap-1">
                            <span>Token ($)</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:bg-bg-main/80" onClick={() => handleSort("dau")}>
                          <div className="flex items-center gap-1">
                            <span>DAU (Actifs)</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:bg-bg-main/80" onClick={() => handleSort("socialScore")}>
                          <div className="flex items-center gap-1">
                            <span>Score Social</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:bg-bg-main/80 text-right" onClick={() => handleSort("score")}>
                          <div className="flex items-center gap-1 justify-end">
                            <span>Note globale</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark/60">
                      {filteredGames.length > 0 ? (
                        filteredGames.map((game) => {
                          const isSelected = selectedGame?.id === game.id;
                          const isFav = favorites.includes(game.id);

                          return (
                            <tr
                              key={game.id}
                              onClick={() => setSelectedGame(game)}
                              className={`group cursor-pointer transition-colors duration-200 text-xs ${
                                isSelected 
                                  ? "bg-emerald-500/5 border-l-2 border-l-emerald-500" 
                                  : "hover:bg-bg-main/60"
                              }`}
                            >
                              {/* Star Favorite toggle */}
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  onClick={(e) => handleFavoriteToggle(game.id, e)}
                                  aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                                  title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                                  className="text-text-secondary hover:text-brand-yellow transition cursor-pointer"
                                >
                                  <Star className={`w-4 h-4 ${isFav ? "fill-brand-yellow text-brand-yellow" : ""}`} />
                                </button>
                              </td>

                              {/* Game name & category */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xl shrink-0 w-8 h-8 rounded-lg bg-bg-main border border-border-dark flex items-center justify-center">
                                    {game.thumbnail}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-text-primary group-hover:text-emerald-400 transition">
                                        {game.name}
                                      </span>
                                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                        game.status === "Live" ? "bg-green-500/10 text-green-400" :
                                        game.status === "Beta" ? "bg-blue-500/10 text-blue-400" :
                                        game.status === "Alpha" ? "bg-orange-500/10 text-orange-400" :
                                        "bg-purple-500/10 text-purple-400"
                                      }`}>
                                        {game.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-text-secondary mt-0.5">
                                      <span>{game.genre}</span>
                                      <span>•</span>
                                      <span 
                                        className="font-mono text-[9px] px-1 rounded border"
                                        style={{ 
                                          color: CHAIN_COLORS[game.blockchain], 
                                          borderColor: `${CHAIN_COLORS[game.blockchain]}30`, 
                                          backgroundColor: `${CHAIN_COLORS[game.blockchain]}08` 
                                        }}
                                      >
                                        {game.blockchain}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Token, Symbol and Change */}
                              <td className="py-3.5 px-4">
                                <div className="font-mono font-bold text-text-primary flex items-center gap-1">
                                  <span>${game.tokenPrice >= 1 ? game.tokenPrice.toFixed(2) : game.tokenPrice.toFixed(4)}</span>
                                  <span className="text-[10px] font-normal text-text-secondary">({game.tokenSymbol})</span>
                                </div>
                                <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 mt-0.5 ${
                                  game.tokenChange24h >= 0 ? "text-price-green" : "text-price-red"
                                }`}>
                                  {game.tokenChange24h >= 0 ? "+" : ""}{game.tokenChange24h}%
                                </span>
                              </td>

                              {/* DAU and trend */}
                              <td className="py-3.5 px-4 font-mono">
                                <div className="font-bold text-text-primary">
                                  {game.dau.toLocaleString("fr-FR")}
                                </div>
                                <div className="text-[10px] text-text-secondary mt-0.5 flex items-center gap-1">
                                  <span className={game.dauChange24h >= 0 ? "text-price-green" : "text-price-red"}>
                                    {game.dauChange24h >= 0 ? "▲" : "▼"} {Math.abs(game.dauChange24h)}%
                                  </span>
                                  <span>24h</span>
                                </div>
                              </td>

                              {/* Social Engagement index */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-bg-main h-1.5 rounded-full overflow-hidden border border-border-dark/60">
                                    <div 
                                      className="bg-indigo-500 h-full rounded-full animate-pulse" 
                                      style={{ width: `${game.socialScore}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-text-primary font-bold">{game.socialScore}/100</span>
                                </div>
                              </td>

                              {/* Game Overall Rating */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-bg-main rounded-lg border border-border-dark font-mono font-black text-brand-yellow shadow-[0_0_8px_rgba(240,185,11,0.05)]">
                                  <Trophy className="w-3 h-3 text-brand-yellow" />
                                  <span>{game.score.toFixed(1)}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-text-secondary text-xs">
                            Aucun projet de jeu ne correspond à vos filtres sémantiques.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column (4 units): Detail Panel & Live Simulator */}
            <div className="lg:col-span-4 space-y-6">
              {selectedGame ? (
                <div className="space-y-6">
                  
                  {/* Detailed Project Profile */}
                  <div className="bg-bg-card border border-border-dark rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 bg-bg-main rounded-xl border border-border-dark flex items-center justify-center">
                          {selectedGame.thumbnail}
                        </span>
                        <div>
                          <h3 className="text-base font-black text-text-primary tracking-tight font-sans">
                            {selectedGame.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-mono text-text-secondary">Token:</span>
                            <span className="text-xs font-mono font-bold text-brand-yellow">{selectedGame.tokenSymbol}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Share/Web link */}
                      <a 
                        href="https://playtoearn.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 bg-bg-main border border-border-dark text-text-secondary hover:text-emerald-400 hover:border-emerald-500/30 rounded-lg transition cursor-pointer"
                        title="Voir sur PlayToEarn"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {selectedGame.description}
                    </p>

                    {/* Tags Metadata */}
                    <div className="grid grid-cols-2 gap-2 border-t border-border-dark/60 pt-4 text-[11px]">
                      <div className="bg-bg-main p-2.5 rounded-xl border border-border-dark/60">
                        <span className="text-text-secondary block text-[9px] font-mono uppercase">Potentiel Gain</span>
                        <span className={`font-bold mt-0.5 block ${
                          selectedGame.earnPotential === "High" ? "text-price-green" :
                          selectedGame.earnPotential === "Medium" ? "text-brand-yellow" :
                          "text-text-secondary"
                        }`}>{selectedGame.earnPotential}</span>
                      </div>

                      <div className="bg-bg-main p-2.5 rounded-xl border border-border-dark/60">
                        <span className="text-text-secondary block text-[9px] font-mono uppercase">Free-to-Play</span>
                        <span className="font-bold text-white block mt-0.5">
                          {selectedGame.freeToPlay ? "Oui (Entrée Libre)" : "Achat NFT requis"}
                        </span>
                      </div>

                      <div className="bg-bg-main p-2.5 rounded-xl border border-border-dark/60">
                        <span className="text-text-secondary block text-[9px] font-mono uppercase">Support NFT</span>
                        <span className="font-bold text-indigo-400 block mt-0.5">Actif (ERC-721/1155)</span>
                      </div>

                      <div className="bg-bg-main p-2.5 rounded-xl border border-border-dark/60">
                        <span className="text-text-secondary block text-[9px] font-mono uppercase">Plateforme</span>
                        <span className="font-bold text-white block mt-0.5 truncate">{selectedGame.platform}</span>
                      </div>
                    </div>
                  </div>

                  {/* Live earnings simulator calculator */}
                  <div className="bg-bg-card border border-border-dark rounded-2xl p-6 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                      <Calculator className="w-24 h-24 text-emerald-400" />
                    </div>

                    <div className="flex items-center gap-2 border-b border-border-dark/60 pb-3 mb-4">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                        Simulateur de Gains P2E
                      </h4>
                    </div>

                    <div className="space-y-4">
                      {/* Hours per day range */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-text-secondary">Temps de jeu quotidien :</span>
                          <span className="font-mono text-emerald-400 font-bold">{calcDailyHours} heures</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="8" 
                          step="1"
                          value={calcDailyHours}
                          onChange={(e) => setCalcDailyHours(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer bg-bg-main h-1.5 rounded-lg appearance-none"
                        />
                      </div>

                      {/* Ratio Win rate range */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-text-secondary">Taux de Victoire estimé :</span>
                          <span className="font-mono text-emerald-400 font-bold">{calcWinRate}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="30" 
                          max="90" 
                          step="5"
                          value={calcWinRate}
                          onChange={(e) => setCalcWinRate(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer bg-bg-main h-1.5 rounded-lg appearance-none"
                        />
                      </div>

                      {/* NFT Power multiplier select */}
                      <div>
                        <span className="text-xs text-text-secondary block mb-1.5">Niveau de l'avatar NFT :</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Standard", val: 1.0 },
                            { label: "Elite", val: 1.5 },
                            { label: "Mythic", val: 2.2 }
                          ].map(nft => (
                            <button
                              key={nft.label}
                              onClick={() => setCalcMultiplier(nft.val)}
                              className={`px-2.5 py-1.5 rounded-lg border text-[10.5px] font-mono transition cursor-pointer ${
                                calcMultiplier === nft.val 
                                  ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold" 
                                  : "bg-bg-main border-border-dark text-text-secondary hover:text-text-primary"
                              }`}
                            >
                              {nft.label} ({nft.val}x)
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Calculated Results Area */}
                      {currentEarnings && (
                        <div className="bg-bg-main border border-border-dark rounded-xl p-4 space-y-3 mt-4">
                          <div className="flex items-center justify-between border-b border-border-dark/60 pb-2">
                            <span className="text-xs text-text-secondary">Jetons récoltés / jour :</span>
                            <span className="font-mono font-bold text-white">
                              {currentEarnings.tokensDaily} {selectedGame.tokenSymbol}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <div className="bg-bg-card p-2 rounded-lg text-center border border-border-dark/40">
                              <span className="text-[9px] font-mono text-text-secondary block">JOUR</span>
                              <span className="text-xs font-extrabold text-green-400 mt-0.5 block">${currentEarnings.usdDaily}</span>
                            </div>
                            <div className="bg-bg-card p-2 rounded-lg text-center border border-border-dark/40">
                              <span className="text-[9px] font-mono text-text-secondary block">SEMAINE</span>
                              <span className="text-xs font-extrabold text-green-400 mt-0.5 block">${currentEarnings.usdWeekly}</span>
                            </div>
                            <div className="bg-bg-card p-2 rounded-lg text-center border border-border-dark/40">
                              <span className="text-[9px] font-mono text-text-secondary block">MOIS</span>
                              <span className="text-xs font-extrabold text-green-400 mt-0.5 block">${currentEarnings.usdMonthly}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-[9.5px] text-text-secondary italic text-center font-mono">
                        Les simulations sont indicatives et basées sur l'état actuel de la tokenomics.
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-bg-card border border-border-dark rounded-2xl p-6 text-center text-text-secondary text-xs">
                  Sélectionnez un jeu dans la liste pour démarrer la simulation.
                </div>
              )}
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="chart-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* Left side (8 units): Scatter Matrix and Framework Comparison */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Scatter Plot Chart: Game Ratings vs Blockchain */}
              <div className="bg-bg-card border border-border-dark rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono">
                      Matrice Score vs. Framework (Blockchain)
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Positionnement de chaque jeu selon sa note globale. La taille de la bulle correspond à l'engagement social.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHAIN_COLORS.Ronin }} />
                      <span className="text-text-primary">Ronin</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHAIN_COLORS.Solana }} />
                      <span className="text-text-primary">Solana</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHAIN_COLORS.Ethereum }} />
                      <span className="text-text-primary">Ethereum</span>
                    </div>
                  </div>
                </div>

                <div className="h-[380px] w-full bg-bg-main/30 rounded-xl border border-border-dark/60 p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(30,34,43,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(30,34,43,0.15)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                  
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                      <CartesianGrid stroke="#1e222b" strokeDasharray="3 3" />
                      <XAxis 
                        type="category" 
                        dataKey="blockchain" 
                        name="Framework" 
                        stroke="#64748b" 
                        style={{ fontSize: "10px", fontFamily: "JetBrains Mono" }}
                        tickLine={false}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="score" 
                        name="Score" 
                        domain={[7.5, 9.8]} 
                        stroke="#64748b"
                        style={{ fontSize: "10px", fontFamily: "JetBrains Mono" }}
                        tickLine={false}
                        label={{ value: 'Note Globale (★ / 10)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: '10px', fontFamily: 'sans-serif' }, offset: 10 }}
                      />
                      <ZAxis 
                        type="number" 
                        dataKey="socialScore" 
                        range={[100, 500]} 
                        name="Bulle d'engagement" 
                      />
                      <RechartsTooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#1e293b' }} />
                      <Scatter name="Jeux" data={games}>
                        {games.map((entry, index) => {
                          const color = CHAIN_COLORS[entry.blockchain] || "#f0b90b";
                          const isSelected = selectedGame?.id === entry.id;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={color} 
                              stroke={isSelected ? "#ffffff" : "transparent"}
                              strokeWidth={isSelected ? 2 : 0}
                              className="cursor-pointer hover:scale-110 transition-all"
                              onClick={() => setSelectedGame(entry)}
                            />
                          );
                        })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart comparing cumulative DAU players per blockchain */}
              <div className="bg-bg-card border border-border-dark rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono">
                    Volume de Joueurs Actifs (DAU) par Écosystème
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Comparaison de l'adoption réelle par framework technologique (Base, Ronin, Solana, Hive, Ethereum).
                  </p>
                </div>

                <div className="h-[240px] w-full bg-bg-main/30 rounded-xl border border-border-dark/60 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={frameworkAnalytics} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid stroke="#1e222b" strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b"
                        style={{ fontSize: "10px", fontFamily: "JetBrains Mono" }}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#64748b"
                        style={{ fontSize: "10px", fontFamily: "JetBrains Mono" }}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <RechartsTooltip 
                        formatter={(value: any) => [`${Number(value).toLocaleString("fr-FR")} Joueurs`, "DAU"]}
                        contentStyle={{ backgroundColor: "#0b0e11", borderColor: "#1e222b", borderRadius: "12px", fontSize: "11px", color: "#fff" }}
                      />
                      <Bar dataKey="totalDau" radius={[6, 6, 0, 0]}>
                        {frameworkAnalytics.map((entry, index) => {
                          const color = CHAIN_COLORS[entry.name] || "#10b981";
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Right side (4 units): Dynamic Bento Insights Panel */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Leaderboard Summary Metrics */}
              <div className="bg-bg-card border border-border-dark rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-border-dark/60 pb-3">
                  <Trophy className="w-4 h-4 text-brand-yellow" />
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                    Rapport de Performance
                  </h4>
                </div>

                {/* KPI 1: Highly rated */}
                {highestRatedGame && (
                  <div className="bg-bg-main p-4 rounded-xl border border-border-dark/60 space-y-2">
                    <span className="text-[10px] font-mono text-text-secondary uppercase block">
                      ★ Leader de l'excellence
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-xs">{highestRatedGame.name}</span>
                      <span className="text-brand-yellow font-black font-mono text-xs">{highestRatedGame.score}/10</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-normal">
                      Ce jeu sur <strong className="text-teal-400 font-mono">{highestRatedGame.blockchain}</strong> détient la meilleure note de notre panel.
                    </p>
                  </div>
                )}

                {/* KPI 2: Dominant ecosystem */}
                {dominantFramework && (
                  <div className="bg-bg-main p-4 rounded-xl border border-border-dark/60 space-y-2">
                    <span className="text-[10px] font-mono text-text-secondary uppercase block">
                      ⚡ Écosystème le plus actif
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-xs">{dominantFramework.name}</span>
                      <span className="text-emerald-400 font-bold font-mono text-xs">{dominantFramework.totalDau.toLocaleString("fr-FR")} DAU</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-normal">
                      Le réseau <strong style={{ color: CHAIN_COLORS[dominantFramework.name] }}>{dominantFramework.name}</strong> centralise le plus de flux de joueurs.
                    </p>
                  </div>
                )}

                {/* Summary Table of Averages per chain */}
                <div className="space-y-2.5 pt-2">
                  <h5 className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
                    Résumé des Moyennes par Framework :
                  </h5>
                  <div className="space-y-2">
                    {frameworkAnalytics.map(fa => (
                      <div key={fa.name} className="flex items-center justify-between text-xs bg-bg-main/40 px-3 py-2 rounded-lg border border-border-dark/40">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHAIN_COLORS[fa.name] }} />
                          <span className="text-text-primary font-bold font-mono text-[11px]">{fa.name}</span>
                        </div>
                        <div className="text-right text-[10.5px] font-mono text-text-secondary">
                          <span>Note Moy: <strong className="text-white">{fa.avgScore}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Framework selection selector sync */}
              <div className="bg-bg-card border border-border-dark rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-border-dark/60 pb-3">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                    Sélecteur Sémantique
                  </h4>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  Sélectionnez un framework blockchain ci-dessous pour filtrer instantanément notre base de données vers le panneau principal :
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {blockchains.map(bc => (
                    <button
                      key={bc}
                      onClick={() => {
                        setBlockchainFilter(bc);
                        setActiveViewMode("list"); // Auto switch back to view list
                      }}
                      className={`px-3 py-2 border rounded-xl text-xs font-mono transition-all text-left flex flex-col justify-between h-[68px] cursor-pointer ${
                        blockchainFilter === bc 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold" 
                          : "bg-bg-main border-border-dark text-text-secondary hover:text-text-primary hover:border-border-dark/80"
                      }`}
                    >
                      <span className="text-[10px] text-text-secondary font-mono">{bc === "All" ? "Tous" : "Chain"}</span>
                      <span className="font-bold text-white text-[11px] block mt-1 truncate">{bc === "All" ? "Tous Frameworks" : bc}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
