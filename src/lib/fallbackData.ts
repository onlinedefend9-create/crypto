// High-quality resilient fallback data for offline-first and static deployment support
export const BASELINE_CRYPTOS = [
  { id: "btc-bitcoin", name: "Bitcoin", symbol: "BTC", rank: 1, quotes: { USD: { price: 92450.00, percent_change_1h: 0.15, percent_change_24h: 2.45, percent_change_7d: 5.12, market_cap: 1810000000000, volume_24h: 38500000000 } } },
  { id: "eth-ethereum", name: "Ethereum", symbol: "ETH", rank: 2, quotes: { USD: { price: 3420.50, percent_change_1h: -0.05, percent_change_24h: -1.20, percent_change_7d: 2.84, market_cap: 412000000000, volume_24h: 19200000000 } } },
  { id: "usdt-tether", name: "Tether", symbol: "USDT", rank: 3, quotes: { USD: { price: 1.00, percent_change_1h: 0.00, percent_change_24h: 0.02, percent_change_7d: -0.05, market_cap: 118000000000, volume_24h: 52000000000 } } },
  { id: "bnb-binance-coin", name: "BNB", symbol: "BNB", rank: 4, quotes: { USD: { price: 585.20, percent_change_1h: 0.22, percent_change_24h: 1.15, percent_change_7d: -1.45, market_cap: 85000000000, volume_24h: 180000000 } } },
  { id: "sol-solana", name: "Solana", symbol: "SOL", rank: 5, quotes: { USD: { price: 182.40, percent_change_1h: 0.84, percent_change_24h: 5.80, percent_change_7d: 12.30, market_cap: 83000000000, volume_24h: 4100000000 } } },
  { id: "xrp-xrp", name: "XRP", symbol: "XRP", rank: 6, quotes: { USD: { price: 1.12, percent_change_1h: -0.12, percent_change_24h: -0.45, percent_change_7d: 14.20, market_cap: 64000000000, volume_24h: 2900000000 } } },
  { id: "usdc-usd-coin", name: "USD Coin", symbol: "USDC", rank: 7, quotes: { USD: { price: 1.00, percent_change_1h: 0.00, percent_change_24h: 0.00, percent_change_7d: 0.01, market_cap: 34000000000, volume_24h: 6200000000 } } },
  { id: "ada-cardano", name: "Cardano", symbol: "ADA", rank: 8, quotes: { USD: { price: 0.645, percent_change_1h: 0.41, percent_change_24h: 3.12, percent_change_7d: 8.95, market_cap: 23000000000, volume_24h: 750000000 } } },
  { id: "doge-dogecoin", name: "Dogecoin", symbol: "DOGE", rank: 9, quotes: { USD: { price: 0.385, percent_change_1h: -0.65, percent_change_24h: -2.30, percent_change_7d: 18.40, market_cap: 56000000000, volume_24h: 3400000000 } } },
  { id: "avax-avalanche", name: "Avalanche", symbol: "AVAX", rank: 10, quotes: { USD: { price: 34.80, percent_change_1h: 0.05, percent_change_24h: 0.85, percent_change_7d: 4.15, market_cap: 14000000000, volume_24h: 420000000 } } },
  { id: "shib-shiba-inu", name: "SHIB", symbol: "SHIB", rank: 11, quotes: { USD: { price: 0.00002450, percent_change_1h: -0.80, percent_change_24h: -3.40, percent_change_7d: 6.80, market_cap: 14500000000, volume_24h: 89000000 } } },
  { id: "dot-polkadot", name: "Polkadot", symbol: "DOT", rank: 12, quotes: { USD: { price: 6.12, percent_change_1h: 0.12, percent_change_24h: 1.25, percent_change_7d: 3.10, market_cap: 8900000000, volume_24h: 180000000 } } },
  { id: "link-chainlink", name: "Chainlink", symbol: "LINK", rank: 13, quotes: { USD: { price: 17.50, percent_change_1h: 0.35, percent_change_24h: 2.10, percent_change_7d: 7.40, market_cap: 10800000000, volume_24h: 350000000 } } },
  { id: "trx-tron", name: "TRON", symbol: "TRX", rank: 14, quotes: { USD: { price: 0.198, percent_change_1h: 0.02, percent_change_24h: 0.50, percent_change_7d: 2.15, market_cap: 17200000000, volume_24h: 280000000 } } },
  { id: "near-near-protocol", name: "NEAR Protocol", symbol: "NEAR", rank: 15, quotes: { USD: { price: 5.45, percent_change_1h: 1.05, percent_change_24h: 4.60, percent_change_7d: 9.30, market_cap: 6200000000, volume_24h: 210000000 } } }
];

export const BASELINE_GLOBAL = {
  market_cap_usd: 3120000000000,
  volume_24h_usd: 145000000000,
  bitcoin_dominance_percentage: 58.1,
  cryptocurrencies_number: 14500,
  market_cap_change_24h: 1.85,
  volume_24h_change_24h: 8.40
};

export const BASELINE_NEWS = [
  {
    id: "news-1",
    title: "Le Bitcoin frôle un nouveau sommet historique porté par l'adoption institutionnelle",
    summary: "Le prix du Bitcoin continue sa trajectoire haussière en s'approchant des 93 000 dollars. Cette dynamique est largement alimentée par des flux continus vers les ETF Bitcoin au comptant et l'intérêt grandissant des trésoreries d'entreprises.",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "il y a 35 minutes",
    sentiment: "positif",
    category: "Bitcoin"
  },
  {
    id: "news-2",
    title: "La mise à jour d'Ethereum Pectra planifiée pour la fin d'année : ce qu'il faut savoir",
    summary: "Les développeurs d'Ethereum ont confirmé les avancées majeures pour le prochain hard fork nommé Pectra. Cette mise à jour vise à optimiser l'abstraction de compte et à réduire davantage les frais de gaz sur les solutions de seconde couche (Layer 2).",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "il y a 2 heures",
    sentiment: "neutre",
    category: "Altcoins"
  },
  {
    id: "news-3",
    title: "Régulation MiCA en Europe : Les émetteurs de stablecoins s'adaptent aux nouvelles exigences",
    summary: "L'entrée en vigueur progressive du règlement MiCA (Markets in Crypto-Assets) pousse les géants du stablecoin à revoir leur conformité en Europe. Cercle (USDC) renforce sa présence tandis que d'autres émetteurs modifient leurs structures de réserves.",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "il y a 4 heures",
    sentiment: "neutre",
    category: "Régulation"
  },
  {
    id: "news-4",
    title: "Solana dépasse le cap des volumes de transactions quotidiens face aux congestions",
    summary: "Le réseau Solana enregistre des volumes record sur ses plateformes d'échange décentralisées, surpassant brièvement d'autres réseaux majeurs. Les validateurs travaillent activement sur l'implémentation de correctifs pour stabiliser le débit face à l'afflux d'utilisateurs.",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "il y a 6 heures",
    sentiment: "positif",
    category: "DeFi"
  },
  {
    id: "news-5",
    title: "Alerte Sécurité : Un protocole DeFi majeur victime d'une attaque de prêt flash de 5M$",
    summary: "Un piratage complexe utilisant des prêts flash (flash loans) a drainé près de 5 millions de dollars d'un protocole de prêt algorithmique populaire. Les équipes de sécurité ont figé les contrats et collaborent pour récupérer les fonds dérobés.",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "il y a 8 heures",
    sentiment: "négatif",
    category: "Sécurité"
  },
  {
    id: "news-6",
    title: "L'adoption des micro-paiements crypto s'accélère dans le e-commerce mondial",
    summary: "Une nouvelle étude révèle une hausse de 35% de l'intégration des passerelles de paiement crypto par les commerçants en ligne cette année. Les frais réduits et la rapidité de règlement séduisent de plus en plus de PME.",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "il y a 12 heures",
    sentiment: "positif",
    category: "Adoption"
  }
];

export const BASELINE_NEWS_EN = [
  {
    id: "news-1",
    title: "Bitcoin nears new all-time high driven by institutional adoption",
    summary: "The price of Bitcoin continues its upward trajectory, approaching $93,000. This momentum is largely fueled by continuous inflows into spot Bitcoin ETFs and growing interest from corporate treasuries.",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "35 minutes ago",
    sentiment: "positive",
    category: "Bitcoin"
  },
  {
    id: "news-2",
    title: "Ethereum Pectra upgrade planned for end of year: what you need to know",
    summary: "Ethereum developers confirmed major progress for the upcoming hard fork named Pectra. This update aims to optimize account abstraction and further reduce gas fees on layer-2 solutions.",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "2 hours ago",
    sentiment: "neutral",
    category: "Altcoins"
  },
  {
    id: "news-3",
    title: "MiCA regulation in Europe: Stablecoin issuers adapt to new requirements",
    summary: "The gradual entry into force of the MiCA (Markets in Crypto-Assets) regulation pushes stablecoin giants to review their compliance in Europe. Circle (USDC) is strengthening its presence while other issuers adjust their reserve structures.",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "4 hours ago",
    sentiment: "neutral",
    category: "Regulation"
  },
  {
    id: "news-4",
    title: "Solana exceeds daily transaction volume records despite occasional congestion",
    summary: "The Solana network is seeing record volumes on its decentralized exchanges, briefly surpassing other major chains. Validators are actively working on patches to stabilize throughput during user spikes.",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "6 hours ago",
    sentiment: "positive",
    category: "DeFi"
  },
  {
    id: "news-5",
    title: "Security Alert: Major DeFi protocol loses $5M in flash loan exploit",
    summary: "A complex hack utilizing flash loans drained nearly $5 million from a popular algorithmic lending protocol. Security teams froze contracts and are collaborating to recover stolen funds.",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "8 hours ago",
    sentiment: "negative",
    category: "Security"
  },
  {
    id: "news-6",
    title: "Crypto micro-payments adoption accelerates in global e-commerce",
    summary: "A new study reveals a 35% increase in online merchants integrating crypto payment gateways this year. Lower fees and instant settlement are appealing to more and more SMEs.",
    source: "Coinpaprika News",
    link: "https://coinpaprika.com",
    pubDate: "12 hours ago",
    sentiment: "positive",
    category: "Adoption"
  }
];

export const BASELINE_AI_NEWS = [
  {
    id: "ai-news-1",
    title: "DeepSeek-V3 bouscule les géants de la Silicon Valley avec un coût de calcul divisé par dix",
    summary: "Le nouveau modèle de fondation open-source DeepSeek-V3 fait sensation. Grâce à une architecture Mixture-of-Experts ultra-optimisée, il atteint des performances comparables aux meilleurs modèles commerciaux pour une fraction de leur coût d'entraînement.",
    source: "AI Frontiers",
    link: "https://github.com/deepseek-ai",
    pubDate: "il y a 25 minutes",
    sentiment: "positif",
    category: "Modèles"
  },
  {
    id: "ai-news-2",
    title: "Gemini 2.5 Flash introduit de nouveaux agents autonomes en temps réel",
    summary: "Google a dévoilé une mise à jour majeure pour Gemini, axée sur les agents multimodaux capables d'exécuter des tâches complexes sur le web en arrière-plan. La vitesse d'inférence a été améliorée de 40%, ouvrant la voie à des assistants hautement réactifs.",
    source: "Google DeepMind",
    link: "https://ai.google.dev",
    pubDate: "il y a 2 heures",
    sentiment: "positif",
    category: "Agents"
  },
  {
    id: "ai-news-3",
    title: "Claude 3.7 Sonnet s'impose comme le nouveau standard d'excellence pour le codage",
    summary: "Les derniers benchmarks de développement logiciel placent Claude 3.7 Sonnet loin devant ses concurrents. Sa capacité à comprendre les architectures multi-fichiers et à appliquer des refactorisations de code complexes en fait l'outil préféré des ingénieurs.",
    source: "Anthropic Research",
    link: "https://anthropic.com",
    pubDate: "il y a 4 heures",
    sentiment: "positif",
    category: "Programmation"
  },
  {
    id: "ai-news-4",
    title: "Régulation : L'Union Européenne publie les directives d'application de l'AI Act",
    summary: "La Commission Européenne a clarifié les obligations de transparence et d'audit de sécurité pour les fournisseurs de modèles de fondation généralistes. Les entreprises ont 12 mois pour se conformer sous peine d'amendes importantes.",
    source: "EU Tech Policy",
    link: "https://europa.eu",
    pubDate: "il y a 6 heures",
    sentiment: "neutre",
    category: "Régulation"
  }
];

export const BASELINE_AI_NEWS_EN = [
  {
    id: "ai-news-1",
    title: "DeepSeek-V3 shakes up Silicon Valley giants with compute costs cut tenfold",
    summary: "The new open-source foundation model DeepSeek-V3 is creating a buzz. Thanks to an ultra-optimized Mixture-of-Experts architecture, it achieves performance comparable to leading commercial models for a fraction of their training cost.",
    source: "AI Frontiers",
    link: "https://github.com/deepseek-ai",
    pubDate: "25 minutes ago",
    sentiment: "positive",
    category: "Models"
  },
  {
    id: "ai-news-2",
    title: "Gemini 2.5 Flash introduces new autonomous real-time agents",
    summary: "Google unveiled a major update for Gemini, focused on multimodal agents capable of executing complex web tasks in the background. Inference speed has been improved by 40%, paving the way for highly responsive assistants.",
    source: "Google DeepMind",
    link: "https://ai.google.dev",
    pubDate: "2 hours ago",
    sentiment: "positive",
    category: "Agents"
  },
  {
    id: "ai-news-3",
    title: "Claude 3.7 Sonnet establishes itself as the new standard of excellence for coding",
    summary: "The latest software engineering benchmarks place Claude 3.7 Sonnet far ahead of competitors. Its ability to understand multi-file architectures and apply complex code refactorings makes it the preferred tool for developers.",
    source: "Anthropic Research",
    link: "https://anthropic.com",
    pubDate: "4 hours ago",
    sentiment: "positive",
    category: "Coding"
  },
  {
    id: "ai-news-4",
    title: "Regulation: European Union publishes guidelines for AI Act implementation",
    summary: "The European Commission clarified transparency and safety audit obligations for providers of general-purpose foundation models. Companies have 12 months to comply or face significant fines.",
    source: "EU Tech Policy",
    link: "https://europa.eu",
    pubDate: "6 hours ago",
    sentiment: "neutral",
    category: "Regulation"
  }
];

export function applyClientFluctuations(tickers: any[]) {
  return tickers.map((ticker) => {
    const quote = ticker.quotes?.USD;
    if (!quote) return ticker;
    // Tiny random change (-0.1% to +0.1%)
    const change = 1 + (Math.random() - 0.5) * 0.002;
    const newPrice = quote.price * change;
    return {
      ...ticker,
      quotes: {
        ...ticker.quotes,
        USD: {
          ...quote,
          price: newPrice,
          last_updated: new Date().toISOString()
        }
      }
    };
  });
}

export function getFallbackRadar(coins: string[], lang: "fr" | "en") {
  return {
    name: "Crypto Radar",
    children: coins.map(coin => {
      const cUpper = coin.toUpperCase();
      if (lang === "en") {
        return {
          name: cUpper,
          children: [
            {
              name: "Why",
              children: [
                { name: `Growing institutional interest in ${cUpper}` },
                { name: "Network efficiency gains" }
              ]
            },
            {
              name: "How",
              children: [
                { name: "Increased volume on decentralized exchanges" }
              ]
            },
            {
              name: "How much",
              children: [
                { name: `Approaching key resistance levels` }
              ]
            },
            {
              name: "If",
              children: [
                { name: "Adoption trends remain positive" }
              ]
            },
            {
              name: "Where",
              children: [
                { name: "Activity shifting to smart contracts" }
              ]
            }
          ]
        };
      } else {
        return {
          name: cUpper,
          children: [
            {
              name: "Pourquoi",
              children: [
                { name: `Intérêt institutionnel croissant pour ${cUpper}` },
                { name: "Gains d'efficacité du réseau" }
              ]
            },
            {
              name: "Comment",
              children: [
                { name: "Volume en hausse sur les plateformes décentralisées" }
              ]
            },
            {
              name: "Combien",
              children: [
                { name: `Approche de résistances clés` }
              ]
            },
            {
              name: "Si",
              children: [
                { name: "Les tendances d'adoption restent positives" }
              ]
            },
            {
              name: "Où",
              children: [
                { name: "Migration de l'activité vers les smart contracts" }
              ]
            }
          ]
        };
      }
    })
  };
}

export function getFallbackAiRadar(models: string[], lang: "fr" | "en") {
  return {
    name: "AI Radar",
    children: models.map(model => {
      const mName = model.charAt(0).toUpperCase() + model.slice(1);
      if (lang === "en") {
        return {
          name: mName,
          children: [
            { name: "Agents", children: [{ name: `${mName} Autonomous Web Agents` }, { name: "Code Assistant Tools" }] },
            { name: "Frameworks", children: [{ name: "LangChain Integrations" }, { name: "SDK Clients" }] },
            { name: "Usages", children: [{ name: "Large-scale reasoning tasks" }, { name: "Low-latency voice interaction" }] },
            { name: "Limits", children: [{ name: "Context window costs" }, { name: "Hallucination risks" }] },
            { name: "Future", children: [{ name: "Native OS integrations" }] }
          ]
        };
      } else {
        return {
          name: mName,
          children: [
            { name: "Agents", children: [{ name: `Agents web autonomes ${mName}` }, { name: "Outils d'assistance au code" }] },
            { name: "Frameworks", children: [{ name: "Intégrations LangChain" }, { name: "Clients SDK officiels" }] },
            { name: "Usages", children: [{ name: "Tâches de raisonnement à grande échelle" }, { name: "Interaction vocale basse latence" }] },
            { name: "Limites", children: [{ name: "Coûts des fenêtres de contexte" }, { name: "Risques d'hallucinations" }] },
            { name: "Futur", children: [{ name: "Intégrations OS natives" }] }
          ]
        };
      }
    })
  };
}
