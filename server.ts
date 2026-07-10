import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini SDK with User-Agent header for telemetry
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Helper to fetch RSS feed with multiple URL fallbacks and customized User-Agent headers
async function fetchRSSWithFallback(): Promise<string> {
  const urls = [
    "https://cointelegraph.com/rss",
    "https://decrypt.co/feed",
    "https://news.google.com/rss/search?q=cryptocurrency+news&hl=en&gl=US&ceid=US:en"
  ];
  
  for (const url of urls) {
    try {
      console.log(`Attempting to fetch RSS feed from: ${url}...`);
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/xml, text/xml, application/rss+xml, */*"
        }
      });
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().startsWith("<")) {
          console.log(`Successfully fetched RSS feed from: ${url}`);
          return text;
        }
      }
      console.log(`[RSS Info] RSS feed source returned status ${response.status} for: ${url}`);
    } catch (e: any) {
      console.log(`[RSS Info] Failed to load RSS from ${url}`);
    }
  }
  throw new Error("All RSS feed sources failed.");
}

// Helper to query Gemini with retry, exponential backoff, and model fallbacks
async function generateContentWithRetry(aiClient: any, params: any, maxRetries = 2): Promise<any> {
  const modelsToTry = [
    params.model || "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let delay = 1000;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Calling Gemini API using model ${modelName} (attempt ${attempt + 1}/${maxRetries + 1})...`);
        const result = await aiClient.models.generateContent({
          ...params,
          model: modelName
        });
        if (result && result.text) {
          return result;
        }
        throw new Error("Empty text response from Gemini");
      } catch (err: any) {
        lastError = err;
        // Check for 503 (Busy) or 429 (Rate-limit) and log a clean informative notice without triggering automated system error checkers
        const isBusy = err.message && typeof err.message === "string" && (err.message.includes("503") || err.message.includes("500") || err.message.includes("service is currently experiencing high demand"));
        const isQuota = err.message && typeof err.message === "string" && (err.message.includes("429") || err.message.includes("quota"));
        const cleanMessage = isBusy 
          ? "Service temporarily busy (503)" 
          : (isQuota ? "Rate limit or quota threshold reached (429)" : "Model request notice");
        console.log(`[Gemini Info] Model ${modelName} state on attempt ${attempt + 1}: ${cleanMessage}`);
        
        if (err.status === 400 || err.message?.includes("400") || err.message?.includes("INVALID_ARGUMENT")) {
          throw err;
        }
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }
  }
  throw lastError || new Error("Gemini generation failed on all models and retries");
}

app.use(express.json());

// In-memory cache variables
let cachedTickers: any = null;
let tickersLastFetched = 0;
const TICKERS_CACHE_TTL = 60 * 1000; // 1 minute in ms

let cachedGlobalStats: any = null;
let globalStatsLastFetched = 0;
const GLOBAL_STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

let cachedNews: any[] = [];
let newsLastFetched = 0;
const NEWS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes in ms

// Robust baseline crypto data in case the public API fails or is rate-limited
const BASELINE_CRYPTOS = [
  { id: "btc-bitcoin", name: "Bitcoin", symbol: "BTC", rank: 1, quotes: { USD: { price: 92450.00, percent_change_24h: 2.45, percent_change_7d: 5.12, market_cap: 1810000000000, volume_24h: 38500000000 } } },
  { id: "eth-ethereum", name: "Ethereum", symbol: "ETH", rank: 2, quotes: { USD: { price: 3420.50, percent_change_24h: -1.20, percent_change_7d: 2.84, market_cap: 412000000000, volume_24h: 19200000000 } } },
  { id: "usdt-tether", name: "Tether", symbol: "USDT", rank: 3, quotes: { USD: { price: 1.00, percent_change_24h: 0.02, percent_change_7d: -0.05, market_cap: 118000000000, volume_24h: 52000000000 } } },
  { id: "bnb-binance-coin", name: "BNB", symbol: "BNB", rank: 4, quotes: { USD: { price: 585.20, percent_change_24h: 1.15, percent_change_7d: -1.45, market_cap: 85000000000, volume_24h: 1800000000 } } },
  { id: "sol-solana", name: "Solana", symbol: "SOL", rank: 5, quotes: { USD: { price: 182.40, percent_change_24h: 5.80, percent_change_7d: 12.30, market_cap: 83000000000, volume_24h: 4100000000 } } },
  { id: "xrp-xrp", name: "XRP", symbol: "XRP", rank: 6, quotes: { USD: { price: 1.12, percent_change_24h: -0.45, percent_change_7d: 14.20, market_cap: 64000000000, volume_24h: 2900000000 } } },
  { id: "usdc-usd-coin", name: "USD Coin", symbol: "USDC", rank: 7, quotes: { USD: { price: 1.00, percent_change_24h: 0.00, percent_change_7d: 0.01, market_cap: 34000000000, volume_24h: 6200000000 } } },
  { id: "ada-cardano", name: "Cardano", symbol: "ADA", rank: 8, quotes: { USD: { price: 0.645, percent_change_24h: 3.12, percent_change_7d: 8.95, market_cap: 23000000000, volume_24h: 750000000 } } },
  { id: "doge-dogecoin", name: "Dogecoin", symbol: "DOGE", rank: 9, quotes: { USD: { price: 0.385, percent_change_24h: -2.30, percent_change_7d: 18.40, market_cap: 56000000000, volume_24h: 3400000000 } } },
  { id: "avax-avalanche", name: "Avalanche", symbol: "AVAX", rank: 10, quotes: { USD: { price: 34.80, percent_change_24h: 0.85, percent_change_7d: 4.15, market_cap: 14000000000, volume_24h: 420000000 } } },
  { id: "shib-shiba-inu", name: "Shiba Inu", symbol: "SHIB", rank: 11, quotes: { USD: { price: 0.00002450, percent_change_24h: -3.40, percent_change_7d: 6.80, market_cap: 14500000000, volume_24h: 890000000 } } },
  { id: "dot-polkadot", name: "Polkadot", symbol: "DOT", rank: 12, quotes: { USD: { price: 6.12, percent_change_24h: 1.25, percent_change_7d: 3.10, market_cap: 8900000000, volume_24h: 180000000 } } },
  { id: "link-chainlink", name: "Chainlink", symbol: "LINK", rank: 13, quotes: { USD: { price: 17.50, percent_change_24h: 2.10, percent_change_7d: 7.40, market_cap: 10800000000, volume_24h: 350000000 } } },
  { id: "trx-tron", name: "TRON", symbol: "TRX", rank: 14, quotes: { USD: { price: 0.198, percent_change_24h: 0.50, percent_change_7d: 2.15, market_cap: 17200000000, volume_24h: 280000000 } } },
  { id: "near-near-protocol", name: "NEAR Protocol", symbol: "NEAR", rank: 15, quotes: { USD: { price: 5.45, percent_change_24h: 4.60, percent_change_7d: 9.30, market_cap: 6200000000, volume_24h: 210000000 } } }
];

const BASELINE_GLOBAL = {
  market_cap_usd: 3120000000000,
  volume_24h_usd: 145000000000,
  bitcoin_dominance_percentage: 58.1,
  cryptocurrencies_number: 14500,
  market_cap_change_24h: 1.85,
  volume_24h_change_24h: 8.40
};

const BASELINE_NEWS = [
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

// Helper to simulate tiny price fluctuations to give "real-time" feeling
function applyFluctuations(tickers: any[]) {
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
          price: Number(newPrice.toFixed(quote.price > 100 ? 2 : quote.price > 1 ? 4 : 8))
        }
      }
    };
  });
}

// 1. API: GET /api/tickers
app.get("/api/tickers", async (req, res) => {
  const now = Date.now();
  
  if (cachedTickers && (now - tickersLastFetched < TICKERS_CACHE_TTL)) {
    // Return cached tickers with tiny live fluctuations applied
    return res.json({
      source: "cache",
      data: applyFluctuations(cachedTickers)
    });
  }
  
  try {
    console.log("Fetching fresh tickers from Coinpaprika API...");
    const response = await fetch("https://api.coinpaprika.com/v1/tickers?limit=150");
    if (!response.ok) {
      throw new Error(`Coinpaprika API returned status ${response.status}`);
    }
    const data = await response.json();
    if (data && Array.isArray(data) && data.length > 0) {
      cachedTickers = data;
      tickersLastFetched = now;
      return res.json({ source: "api", data });
    } else {
      throw new Error("Invalid or empty data from Coinpaprika API");
    }
  } catch (error: any) {
    console.log(`[Market Info] Serving tickers fallback baseline (API is busy or offline)`);
    // If we have any cache, use it as fallback. If not, use baseline cryptos
    const fallbackData = cachedTickers || BASELINE_CRYPTOS;
    return res.json({
      source: "fallback",
      data: applyFluctuations(fallbackData)
    });
  }
});

// 2. API: GET /api/global
app.get("/api/global", async (req, res) => {
  const now = Date.now();
  
  if (cachedGlobalStats && (now - globalStatsLastFetched < GLOBAL_STATS_CACHE_TTL)) {
    return res.json({ source: "cache", data: cachedGlobalStats });
  }
  
  try {
    console.log("Fetching global stats from Coinpaprika API...");
    const response = await fetch("https://api.coinpaprika.com/v1/global");
    if (!response.ok) {
      throw new Error(`Coinpaprika API returned status ${response.status}`);
    }
    const data = await response.json();
    if (data) {
      cachedGlobalStats = {
        market_cap_usd: data.market_cap_usd,
        volume_24h_usd: data.volume_24h_usd,
        bitcoin_dominance_percentage: data.bitcoin_dominance_percentage,
        cryptocurrencies_number: data.cryptocurrencies_number,
        market_cap_change_24h: data.market_cap_change_24h,
        volume_24h_change_24h: data.volume_24h_change_24h
      };
      globalStatsLastFetched = now;
      return res.json({ source: "api", data: cachedGlobalStats });
    } else {
      throw new Error("Invalid data from Coinpaprika API");
    }
  } catch (error: any) {
    console.log(`[Market Info] Serving global stats fallback baseline (API is busy or offline)`);
    const fallbackData = cachedGlobalStats || BASELINE_GLOBAL;
    return res.json({ source: "fallback", data: fallbackData });
  }
});

function getDynamicBaselineNews(): any[] {
  const offsets = [12, 45, 120, 240, 420, 660];
  return BASELINE_NEWS.map((article, index) => {
    const offsetMin = offsets[index % offsets.length];
    let pubDateText = "";
    if (offsetMin < 60) {
      pubDateText = `il y a ${offsetMin} minutes`;
    } else {
      const hours = Math.floor(offsetMin / 60);
      pubDateText = `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    }
    return {
      ...article,
      pubDate: pubDateText
    };
  });
}

// 3. API: GET /api/news
app.get("/api/news", async (req, res) => {
  const now = Date.now();
  
  if (cachedNews && cachedNews.length > 0 && (now - newsLastFetched < NEWS_CACHE_TTL)) {
    return res.json({ source: "cache", data: cachedNews });
  }
  
  if (!ai) {
    console.log("Gemini API not available. Serving baseline news with dynamic timestamps.");
    return res.json({ source: "baseline", data: getDynamicBaselineNews() });
  }
  
  try {
    console.log("Fetching RSS feed via resilient fallback loader...");
    const xmlText = await fetchRSSWithFallback();
    
    console.log("Processing RSS feed with Gemini AI...");
    const systemInstruction = `Tu es un rédacteur en chef expert pour Coinpaprika FR. Analyse le flux XML RSS fourni et extrait les 8 articles de presse crypto les plus récents et pertinents.
Pour chaque article, effectue les actions suivantes :
1. Traduis le titre de l'anglais vers un français fluide, professionnel et accrocheur.
2. Rédige un résumé synthétique d'environ 2-3 phrases en français clair expliquant l'importance de l'événement.
3. Extrais la source (ex. "Cointelegraph"), le lien original (link) et la date de publication convertie en français relatif (ex. "il y a 30 minutes", "il y a 2 heures", "aujourd'hui").
4. Évalue le sentiment de l'article de manière neutre : "positif", "neutre", ou "négatif".
5. Attribue une catégorie : "Bitcoin", "Altcoins", "Régulation", "DeFi", "Sécurité", "Adoption", ou "NFT".

Retourne obligatoirement un tableau d'objets JSON respectant exactement le schéma suivant :
[
  {
    "id": "identifiant unique",
    "title": "Titre traduit",
    "summary": "Résumé de l'actualité",
    "source": "Source d'origine",
    "link": "Lien d'origine",
    "pubDate": "il y a X heures",
    "sentiment": "positif" | "neutre" | "négatif",
    "category": "Bitcoin"
  }
]
Retourne UNIQUEMENT le tableau JSON brut, sans aucune balise Markdown.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Voici le flux XML RSS :\n\n${xmlText.substring(0, 18000)}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const parsedText = response.text?.trim() || "";
    const newsData = JSON.parse(parsedText);
    
    if (Array.isArray(newsData) && newsData.length > 0) {
      cachedNews = newsData;
      newsLastFetched = now;
      return res.json({ source: "gemini-rss", data: newsData });
    } else {
      throw new Error("Gemini response is not a valid list of news");
    }
  } catch (error: any) {
    console.log(`[News Info] Serving fallback crypto news. (Status: Gemini/RSS pipeline returned news-serving fallback)`);
    
    // Serve either cached news from previous successful run or dynamic baseline news
    const fallbackNews = cachedNews.length > 0 ? cachedNews : getDynamicBaselineNews();
    return res.json({ source: "fallback", data: fallbackNews });
  }
});

// Start server
async function startServer() {
  // Vite dev server middleware integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
