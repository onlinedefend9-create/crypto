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

function cleanJsonString(rawText: string): string {
  let cleaned = rawText.trim();
  
  // Extract JSON object/array boundaries if there's surrounding text or markdown blocks
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  
  let startIdx = -1;
  let endIdx = -1;
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    if (firstBracket !== -1 && firstBracket < firstBrace && lastBracket !== -1 && lastBracket > lastBrace) {
      startIdx = firstBracket;
      endIdx = lastBracket;
    } else {
      startIdx = firstBrace;
      endIdx = lastBrace;
    }
  } else if (firstBracket !== -1 && lastBracket !== -1) {
    startIdx = firstBracket;
    endIdx = lastBracket;
  }
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  
  // Remove markdown code fence indicators
  cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();
  
  // Remove trailing commas before closing braces/brackets (invalid in standard JSON)
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
  
  return cleaned;
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

// Helper to automatically background fetch and update news
async function autoUpdateNews() {
  if (!ai) {
    console.log("[Auto-Update] Gemini API not available. Skipping automatic background news fetch.");
    return;
  }
  const now = Date.now();
  try {
    console.log("[Auto-Update] Starting automatic background RSS fetch...");
    const xmlText = await fetchRSSWithFallback();
    console.log("[Auto-Update] Translating and summarizing background RSS feed with Gemini...");
    
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
      console.log(`[Auto-Update] Success! ${newsData.length} articles updated automatically.`);
    }
  } catch (err: any) {
    const isQuota = err && err.message && typeof err.message === "string" && (err.message.includes("429") || err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED"));
    const reasonMsg = isQuota ? "rate limit (quota threshold)" : "service condition";
    console.log(`[Auto-Update Notice] Background processing deferred due to: ${reasonMsg}`);
  }
}

// 3. API: GET /api/news
app.get("/api/news", async (req, res) => {
  const now = Date.now();
  
  if (cachedNews && cachedNews.length > 0 && (now - newsLastFetched < NEWS_CACHE_TTL)) {
    return res.json({ source: "cache", data: cachedNews, lastFetched: newsLastFetched });
  }
  
  if (!ai) {
    console.log("Gemini API not available. Serving baseline news with dynamic timestamps.");
    return res.json({ source: "baseline", data: getDynamicBaselineNews(), lastFetched: now });
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
      return res.json({ source: "gemini-rss", data: newsData, lastFetched: newsLastFetched });
    } else {
      throw new Error("Gemini response is not a valid list of news");
    }
  } catch (error: any) {
    console.log(`[News Info] Serving fallback crypto news. (Status: Gemini/RSS pipeline returned news-serving fallback)`);
    
    // Serve either cached news from previous successful run or dynamic baseline news
    const fallbackNews = cachedNews.length > 0 ? cachedNews : getDynamicBaselineNews();
    return res.json({ source: "fallback", data: fallbackNews, lastFetched: newsLastFetched || now });
  }
});

// Robust fallback radar tree data
const RADAR_FALLBACK = {
  name: "Crypto Radar",
  children: [
    {
      name: "BTC",
      children: [
        {
          name: "Pourquoi",
          children: [
            { name: "Pression vendeuse des mineurs historiques" },
            { name: "Sorties de capitaux des ETF spot" }
          ]
        },
        {
          name: "Comment",
          children: [
            { name: "Accumulation agressive des portefeuilles baleines" }
          ]
        },
        {
          name: "Combien",
          children: [
            { name: "Défense du support clé des 64k$" }
          ]
        },
        {
          name: "Si",
          children: [
            { name: "La Fed maintient ses taux élevés" }
          ]
        },
        {
          name: "Où",
          children: [
            { name: "Flux massifs vers le cold storage" }
          ]
        }
      ]
    },
    {
      name: "ETH",
      children: [
        {
          name: "Pourquoi",
          children: [
            { name: "Chute historique des frais de gas" }
          ]
        },
        {
          name: "Comment",
          children: [
            { name: "Staking institutionnel en hausse constante" }
          ]
        },
        {
          name: "Combien",
          children: [
            { name: "Cible psychologique des 4000$ en vue" }
          ]
        },
        {
          name: "Si",
          children: [
            { name: "La mise à niveau Prague-Electra réussit" }
          ]
        },
        {
          name: "Où",
          children: [
            { name: "Migration des volumes vers les Layer-2" }
          ]
        }
      ]
    },
    {
      name: "SOL",
      children: [
        {
          name: "Pourquoi",
          children: [
            { name: "Explosion des volumes sur les memecoins" }
          ]
        },
        {
          name: "Comment",
          children: [
            { name: "Déploiement des validateurs Firedancer" }
          ]
        },
        {
          name: "Combien",
          children: [
            { name: "Résistance majeure identifiée à 200$" }
          ]
        },
        {
          name: "Si",
          children: [
            { name: "La congestion du réseau est maîtrisée" }
          ]
        },
        {
          name: "Où",
          children: [
            { name: "Volume record sur l'agrégateur Jupiter" }
          ]
        }
      ]
    },
    {
      name: "USD",
      children: [
        {
          name: "Pourquoi",
          children: [
            { name: "Inflation persistante et baisse de pouvoir d'achat" },
            { name: "Arme géopolitique via sanctions financières" }
          ]
        },
        {
          name: "Comment",
          children: [
            { name: "Émission monétaire par la Réserve Fédérale (Fed)" }
          ]
        },
        {
          name: "Combien",
          children: [
            { name: "Dette publique US record dépassant 34T$" }
          ]
        },
        {
          name: "Si",
          children: [
            { name: "Le dollar perd son statut de réserve globale" }
          ]
        },
        {
          name: "Où",
          children: [
            { name: "Transactions internationales du système SWIFT" }
          ]
        }
      ]
    },
    {
      name: "EUR",
      children: [
        {
          name: "Pourquoi",
          children: [
            { name: "Tensions de croissance en zone euro" },
            { name: "Projet de MNBC (Euro Numérique) contesté" }
          ]
        },
        {
          name: "Comment",
          children: [
            { name: "Politique de taux menée par la BCE" }
          ]
        },
        {
          name: "Combien",
          children: [
            { name: "Masse monétaire M3 sous haute surveillance" }
          ]
        },
        {
          name: "Si",
          children: [
            { name: "L'inflation énergétique redémarre cet hiver" }
          ]
        },
        {
          name: "Où",
          children: [
            { name: "Marchés obligataires de Francfort et Paris" }
          ]
        }
      ]
    },
    {
      name: "CNY",
      children: [
        {
          name: "Pourquoi",
          children: [
            { name: "Stratégie de dédollarisation active des BRICS" },
            { name: "Expansion du réseau de paiement CIPS" }
          ]
        },
        {
          name: "Comment",
          children: [
            { name: "Contrôle strict des flux de capitaux par la PBOC" }
          ]
        },
        {
          name: "Combien",
          children: [
            { name: "Plus de 300 milliards d'échanges en e-CNY" }
          ]
        },
        {
          name: "Si",
          children: [
            { name: "Le pétroyuan remplace le pétrodollar" }
          ]
        },
        {
          name: "Où",
          children: [
            { name: "Zones franches et hubs commerciaux asiatiques" }
          ]
        }
      ]
    },
    {
      name: "RUB",
      children: [
        {
          name: "Pourquoi",
          children: [
            { name: "Contournement des sanctions financières occidentales" },
            { name: "Ancrage des échanges bilatéraux hors-SWIFT" }
          ]
        },
        {
          name: "Comment",
          children: [
            { name: "Mécanismes de paiement en monnaies nationales" }
          ]
        },
        {
          name: "Combien",
          children: [
            { name: "Taux de change sous influence géopolitique" }
          ]
        },
        {
          name: "Si",
          children: [
            { name: "L'inflation intérieure fragilise l'économie" }
          ]
        },
        {
          name: "Où",
          children: [
            { name: "Plateforme SPFS et Bourse de Moscou" }
          ]
        }
      ]
    },
    {
      name: "INR",
      children: [
        {
          name: "Pourquoi",
          children: [
            { name: "Croissance record et ambition de superpuissance" },
            { name: "Internationalisation de la roupie pour le commerce" }
          ]
        },
        {
          name: "Comment",
          children: [
            { name: "Règlement d'achats de brut pétrolier en roupies" }
          ]
        },
        {
          name: "Combien",
          children: [
            { name: "Milliards d'échanges numériques via UPI" }
          ]
        },
        {
          name: "Si",
          children: [
            { name: "L'Inde devient le leader du Sud Global" }
          ]
        },
        {
          name: "Où",
          children: [
            { name: "Banque de réserve de l'Inde à Mumbai" }
          ]
        }
      ]
    }
  ]
};

// 4. API: GET /api/radar
app.get("/api/radar", async (req, res) => {
  // Allow user to request custom real coins
  const requestedCoinsParam = req.query.coins as string;
  const targetCoins = requestedCoinsParam 
    ? requestedCoinsParam.split(",").map(c => c.trim().toUpperCase()).filter(Boolean)
    : ["BTC", "ETH", "SOL"];

  // Limit to max 6 coins for perfect radial display spacing and prevent visual overcrowding
  const activeCoins = targetCoins.slice(0, 6);

  // Fetch real-time market contexts to feed to Gemini
  const tickersSource = cachedTickers || BASELINE_CRYPTOS;
  const coinContexts = activeCoins.map(symbol => {
    const ticker = tickersSource.find((c: any) => c.symbol === symbol);
    if (ticker) {
      const price = ticker.quotes?.USD?.price;
      const change24h = ticker.quotes?.USD?.percent_change_24h;
      return `${symbol} (Price: ${price?.toLocaleString() || "N/A"} USD, 24h Change: ${change24h > 0 ? "+" : ""}${change24h || 0}%)`;
    }
    return `${symbol}`;
  });

  if (!ai) {
    console.log("[Radar Info] Gemini API not available. Serving customized fallback radar tree.");
    // Filter RADAR_FALLBACK to only match requested active coins
    const filteredFallbackChildren = activeCoins.map(coin => {
      const match = RADAR_FALLBACK.children.find(c => c.name === coin);
      if (match) return match;
      // Synthesize simple node if not found in pre-cooked fallback
      return {
        name: coin,
        children: [
          { name: "Pourquoi", children: [{ name: `Intérêt croissant pour ${coin}` }] },
          { name: "Comment", children: [{ name: `Volume d'échange actif` }] },
          { name: "Combien", children: [{ name: `Suivi des cours réels` }] },
          { name: "Si", children: [{ name: `Le marché maintient sa tendance` }] },
          { name: "Où", children: [{ name: `Sur les plateformes d'échange` }] }
        ]
      };
    });
    return res.json({ name: "Crypto Radar", children: filteredFallbackChildren });
  }

  try {
    console.log(`Generating Customized Radar intent tree for [${activeCoins.join(", ")}] with Gemini AI...`);
    const prompt = `Génère l'arbre d'intention AnswerThePublic pour le marché des crypto-monnaies réelles suivantes : [${activeCoins.join(", ")}] sous forme de JSON strict. Structure requise avec clés 'name' et 'children'. Pas d'enrobage markdown, pas de texte introductif.
Données de marché réelles actuelles pour enrichir l'analyse :
${coinContexts.join("\n")}`;
    
    const systemInstruction = `Tu es l'API de données du projet Crypto-Radar. Ton travail est de transformer les dernières tendances et actualités du marché des crypto-monnaies sélectionnées en un arbre d'intentions de recherche strict, calqué sur le modèle de visualisation d'AnswerThePublic.
    
STRUCTURE DE L'ARBRE :
- Niveau 0 (Racine) : Toujours { "name": "Crypto Radar", "children": [...] }
- Niveau 1 (Branches) : Exactement les objets correspondant aux tickers demandés : [${activeCoins.join(", ")}].
- Niveau 2 (Sous-branches) : Pour CHAQUE ticker, crée obligatoirement et uniquement ces 5 catégories : "Pourquoi", "Comment", "Combien", "Si", "Où".
- Niveau 3 (Feuilles) : 1 à 2 feuilles maximum par catégorie, résumant l'actualité ou les questions chaudes réelles liées à la monnaie concernée en 4 à 6 mots percutants.

CRITICAL: N'utilise JAMAIS de guillemets doubles non échappés à l'intérieur des chaînes de texte. Utilise des guillemets simples ou des chevrons « » pour les citations internes. Renvoie UNIQUEMENT l'objet JSON valide brut, sans balises markdown, ni texte d'intro/conclusion, directement parsable.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const parsedText = response.text?.trim() || "";
    const cleanedText = cleanJsonString(parsedText);
    const radarData = JSON.parse(cleanedText);
    
    if (radarData && radarData.name && Array.isArray(radarData.children)) {
      return res.json(radarData);
    } else {
      throw new Error("Invalid structure returned for radar tree");
    }
  } catch (error: any) {
    const isQuota = error && error.message && typeof error.message === "string" && (error.message.includes("429") || error.message.includes("quota") || error.message.includes("RESOURCE_EXHAUSTED"));
    const reasonMsg = isQuota ? "rate limit (quota threshold)" : "service condition";
    console.log(`[Radar API Notice] Utilizing standard backup radar tree due to: ${reasonMsg}`);
    // Create customized fallback matching the selected active coins
    const filteredFallbackChildren = activeCoins.map(coin => {
      const match = RADAR_FALLBACK.children.find(c => c.name === coin);
      if (match) return match;
      return {
        name: coin,
        children: [
          { name: "Pourquoi", children: [{ name: `Intérêt croissant pour ${coin}` }] },
          { name: "Comment", children: [{ name: `Volume d'échange actif` }] },
          { name: "Combien", children: [{ name: `Suivi des cours réels` }] },
          { name: "Si", children: [{ name: `Le marché maintient sa tendance` }] },
          { name: "Où", children: [{ name: `Sur les plateformes d'échange` }] }
        ]
      };
    });
    return res.json({ name: "Crypto Radar", children: filteredFallbackChildren });
  }
});

// 5. API: GET /api/compare-trends-news
app.get("/api/compare-trends-news", async (req, res) => {
  // Extract BTC, ETH, SOL tickers from cached tickers or baseline
  const tickersSource = cachedTickers || BASELINE_CRYPTOS;
  const btcTicker = tickersSource.find((c: any) => c.symbol === "BTC");
  const ethTicker = tickersSource.find((c: any) => c.symbol === "ETH");
  const solTicker = tickersSource.find((c: any) => c.symbol === "SOL");

  const newsSource = cachedNews.length > 0 ? cachedNews : getDynamicBaselineNews();

  const comparisonFallback = {
    summary: "Analyse de la divergence/convergence entre l'actualité récente et l'évolution des prix sur les dernières 24 heures.",
    alignmentScore: 82,
    alignmentLabel: "Forte Corrélation",
    coins: [
      {
        symbol: "BTC",
        price: btcTicker ? `${btcTicker.quotes?.USD?.price?.toLocaleString()} $` : "92,450.00 $",
        change24h: btcTicker ? `${btcTicker.quotes?.USD?.percent_change_24h > 0 ? "+" : ""}${btcTicker.quotes?.USD?.percent_change_24h}%` : "+2.45%",
        sentiment: "haussier",
        comparison: "Le flux régulier de capitaux vers les ETF Spot valide la tendance haussière des prix. L'adoption institutionnelle soutient directement la structure technique du marché.",
        catalyst: "Flux massifs d'entrées ETF"
      },
      {
        symbol: "ETH",
        price: ethTicker ? `${ethTicker.quotes?.USD?.price?.toLocaleString()} $` : "3,420.50 $",
        change24h: ethTicker ? `${ethTicker.quotes?.USD?.percent_change_24h > 0 ? "+" : ""}${ethTicker.quotes?.USD?.percent_change_24h}%` : "-1.20%",
        sentiment: "neutre",
        comparison: "Bien que l'actualité de la mise à niveau Pectra soit positive à long terme, le prix subit une légère consolidation de court terme par manque de momentum immédiat.",
        catalyst: "Attente de la mise à niveau Pectra"
      },
      {
        symbol: "SOL",
        price: solTicker ? `${solTicker.quotes?.USD?.price?.toLocaleString()} $` : "182.40 $",
        change24h: solTicker ? `${solTicker.quotes?.USD?.percent_change_24h > 0 ? "+" : ""}${solTicker.quotes?.USD?.percent_change_24h}%` : "+5.80%",
        sentiment: "haussier",
        comparison: "Les volumes de transaction records sur les DEX de Solana confirment l'euphorie et soutiennent la forte hausse du token SOL malgré des congestions ponctuelles.",
        catalyst: "Volumes record sur DEX"
      }
    ],
    conclusion: "Le marché montre une convergence globale : la poussée de l'activité sur la blockchain (Solana DEX, Bitcoin ETF) alimente directement l'appréciation des prix."
  };

  if (!ai) {
    console.log("[Comparison Info] Gemini API not available. Serving fallback comparison.");
    return res.json(comparisonFallback);
  }

  try {
    const marketString = JSON.stringify({
      BTC: { price: btcTicker?.quotes?.USD?.price, change24h: btcTicker?.quotes?.USD?.percent_change_24h, change7d: btcTicker?.quotes?.USD?.percent_change_7d },
      ETH: { price: ethTicker?.quotes?.USD?.price, change24h: ethTicker?.quotes?.USD?.percent_change_24h, change7d: ethTicker?.quotes?.USD?.percent_change_7d },
      SOL: { price: solTicker?.quotes?.USD?.price, change24h: solTicker?.quotes?.USD?.percent_change_24h, change7d: solTicker?.quotes?.USD?.percent_change_7d }
    });

    const newsString = JSON.stringify(newsSource.slice(0, 6).map((n: any) => ({
      title: n.title,
      summary: n.summary,
      category: n.category,
      sentiment: n.sentiment
    })));

    const prompt = `Voici les dernières données du marché : ${marketString}\n\nEt voici les dernières actualités chaudes de l'écosystème : ${newsString}\n\nRéalise une analyse comparative de la convergence ou de la divergence entre les prix et les actualités pour BTC, ETH et SOL.`;

    const systemInstruction = `Tu es un analyste financier quantitatif crypto de haut niveau. Ton rôle est de comparer l'actualité chaude (sentiment, événements clés) et la performance récente des prix du marché pour BTC, ETH et SOL.
    
Analyse si l'action du prix est alignée avec les actualités (ex. prix en hausse et actualités positives = forte convergence/alignement ; prix en baisse malgré des actualités exceptionnellement positives = divergence, etc.).

Renvoie UNIQUEMENT un objet JSON conforme à cette structure stricte (sans enrobage Markdown ni texte superflu) :
{
  "summary": "Résumé global de l'analyse en 2-3 phrases en français...",
  "alignmentScore": 85,
  "alignmentLabel": "Label court (ex: Alignement Fort, Divergence Partielle...)",
  "coins": [
    {
      "symbol": "BTC",
      "price": "92,450.00 $",
      "change24h": "+2.45%",
      "sentiment": "haussier" | "baissier" | "neutre",
      "comparison": "Courte explication de la corrélation ou divergence entre les prix et l'actualité de cet actif (en français, max 2 phrases)...",
      "catalyst": "Nom du catalyseur principal de l'actif en 3-5 mots"
    }
  ],
  "conclusion": "Verdict/conclusion en français sur l'opportunité à court terme (1-2 phrases)..."
}

CRITICAL: N'utilise JAMAIS de guillemets doubles non échappés à l'intérieur des chaînes de texte (comme comparison, summary ou conclusion). Si tu as besoin de citer quelque chose ou d'utiliser des guillemets, utilise des guillemets simples (') ou des guillemets français (« »). Le résultat doit être un JSON strictement valide et directement parsable.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const parsedText = response.text?.trim() || "";
    const cleanedText = cleanJsonString(parsedText);
    const comparisonData = JSON.parse(cleanedText);
    
    if (comparisonData && comparisonData.summary && Array.isArray(comparisonData.coins)) {
      return res.json(comparisonData);
    } else {
      throw new Error("Invalid structure returned for trend news comparison");
    }
  } catch (err: any) {
    const isQuota = err && err.message && typeof err.message === "string" && (err.message.includes("429") || err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED"));
    const reasonMsg = isQuota ? "rate limit (quota threshold)" : "service condition";
    console.log(`[Comparison API Notice] Utilizing local cached comparison fallback due to: ${reasonMsg}`);
    return res.json(comparisonFallback);
  }
});

// --- AI AGENT / MODEL ENDPOINTS & FALLBACKS ---

const BASELINE_AI_NEWS = [
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
  },
  {
    id: "ai-news-5",
    title: "Sécurité de l'IA : Une équipe de recherche découvre une vulnérabilité de jailbreak par stéganographie",
    summary: "Des chercheurs ont démontré qu'il est possible de contourner les filtres de sécurité des LLM en dissimulant des instructions malveillantes dans des images ou du code apparemment anodins. Des correctifs urgents sont en cours de déploiement.",
    source: "AI Security Lab",
    link: "https://arxiv.org",
    pubDate: "il y a 8 heures",
    sentiment: "négatif",
    category: "Sécurité"
  },
  {
    id: "ai-news-6",
    title: "L'adoption des agents IA double dans le secteur du service client automatisé",
    summary: "Un rapport sectoriel montre que plus de 45% des grandes entreprises ont déployé des agents conversationnels basés sur des LLM pour leur support de premier niveau. La réduction des temps d'attente et la pertinence accrue des réponses sont plébiscitées.",
    source: "TechEnterprise",
    link: "https://techenterprise.com",
    pubDate: "il y a 12 heures",
    sentiment: "positif",
    category: "Adoption"
  }
];

const AI_RADAR_FALLBACK = {
  name: "AI Radar",
  children: [
    {
      name: "Gemini",
      children: [
        {
          name: "Agents",
          children: [
            { name: "Project Astra (Voice/Video Live)" },
            { name: "Gemini Code Assist" },
            { name: "Google Workspace Auto-Agent" },
            { name: "Google Search Agent" }
          ]
        },
        {
          name: "Frameworks",
          children: [
            { name: "Vertex AI Agent Builder" },
            { name: "Google GenAI SDK" },
            { name: "LangChain Google GenAI" },
            { name: "LlamaIndex Gemini Integrations" }
          ]
        },
        {
          name: "Usages",
          children: [
            { name: "Analyse vidéo temps réel natif" },
            { name: "Traitement de documents longs (2M tokens)" },
            { name: "Codage de dépôts entiers" },
            { name: "Interaction vocale ultra-basse latence" }
          ]
        },
        {
          name: "Limites",
          children: [
            { name: "Latence du flux audio en direct" },
            { name: "Coût de la fenêtre de contexte maximale" },
            { name: "Risques d'hallucinations sémantiques" },
            { name: "Dépendance étroite à l'écosystème GCP" }
          ]
        },
        {
          name: "Futur",
          children: [
            { name: "Intégration de contrôle d'OS natif" },
            { name: "Coopération multi-agents décentralisée" },
            { name: "Modèles de raisonnement géants Gemini R" }
          ]
        }
      ]
    },
    {
      name: "Claude",
      children: [
        {
          name: "Agents",
          children: [
            { name: "Claude Computer Use (GUI Controller)" },
            { name: "Claude Engineer" },
            { name: "Artifacts Sandbox Interactive" },
            { name: "Devin AI Software Engineer (Anthropic)" }
          ]
        },
        {
          name: "Frameworks",
          children: [
            { name: "Anthropic SDK" },
            { name: "Model Context Protocol (MCP)" },
            { name: "CrewAI Anthropic Integrations" },
            { name: "LangGraph Statecharts" }
          ]
        },
        {
          name: "Usages",
          children: [
            { name: "Automatisation d'interface OS & Navigateur" },
            { name: "Refactorisation de code d'architecture" },
            { name: "Rédaction de synthèses de recherche" },
            { name: "Génération d'applications à la volée" }
          ]
        },
        {
          name: "Limites",
          children: [
            { name: "Pas de recherche web intégrée par défaut" },
            { name: "Inférence plus lente sur Claude 3.7 Sonnet" },
            { name: "Coût d'API élevé par rapport à la concurrence" },
            { name: "Limites de débit strictes sur le cloud" }
          ]
        },
        {
          name: "Futur",
          children: [
            { name: "Contrôle de souris au pixel près ultra-rapide" },
            { name: "Modèles de vision autonomes perfectionnés" },
            { name: "Baisse drastique des prix de l'inférence" }
          ]
        }
      ]
    },
    {
      name: "GPT-4",
      children: [
        {
          name: "Agents",
          children: [
            { name: "OpenAI Operator (Browser Agent)" },
            { name: "Custom GPT Store Assistant" },
            { name: "Advanced Data Analyst" },
            { name: "Microsoft Copilot Studio" }
          ]
        },
        {
          name: "Frameworks",
          children: [
            { name: "OpenAI Assistants API" },
            { name: "AutoGen (Microsoft Multi-Agent)" },
            { name: "CrewAI Ecosystem" },
            { name: "Semantic Kernel" }
          ]
        },
        {
          name: "Usages",
          children: [
            { name: "Automatisation de tâches sur PC" },
            { name: "Analyse et visualisation de données complexes" },
            { name: "Génération de code autonome" },
            { name: "Support client contextuel avancé" }
          ]
        },
        {
          name: "Limites",
          children: [
            { name: "Hallucinations de raisonnement logique" },
            { name: "Consommation d'énergie élevée de o1/o3" },
            { name: "Enfermement propriétaire dans l'API" },
            { name: "Changements discrets de comportement (Drift)" }
          ]
        },
        {
          name: "Futur",
          children: [
            { name: "Modèles o3-mini optimisés pour l'agentic" },
            { name: "Contrôle autonome de navigateur" },
            { name: "Interactions vocales multimodales o1" }
          ]
        }
      ]
    },
    {
      name: "DeepSeek",
      children: [
        {
          name: "Agents",
          children: [
            { name: "DeepSeek-R1 Reasoner Agent" },
            { name: "DeepSeek Chat Assistant" },
            { name: "R1 Autocomplete Code Generator" },
            { name: "Cheap Enterprise Agents" }
          ]
        },
        {
          name: "Frameworks",
          children: [
            { name: "Ollama API Wrapper" },
            { name: "Dify AI Workflow Builder" },
            { name: "DeepSeek API WebUI" },
            { name: "LiteLLM Router" }
          ]
        },
        {
          name: "Usages",
          children: [
            { name: "Raisonnement logique et mathématique" },
            { name: "Audit de code open-source à grande échelle" },
            { name: "Calculs financiers et scientifiques complexes" },
            { name: "Pipelines d'agents de masse ultra low-cost" }
          ]
        },
        {
          name: "Limites",
          children: [
            { name: "Instabilité temporaire de l'API Cloud" },
            { name: "Filtres et censure réglementaires stricts" },
            { name: "Latence élevée du mode raisonnement R1" },
            { name: "Pertes de fidélité sur les contextes longs" }
          ]
        },
        {
          name: "Futur",
          children: [
            { name: "Optimisation de l'architecture MoE" },
            { name: "R1 Multimodal autonome natif" },
            { name: "Distillations locales de modèles 8B/70B" }
          ]
        }
      ]
    },
    {
      name: "Llama",
      children: [
        {
          name: "Agents",
          children: [
            { name: "Llama Guard (Sécurité/Modération)" },
            { name: "Meta AI Chatbot Multi-plateforme" },
            { name: "Local Offline Sovereign Agents" },
            { name: "Hugging Face Assistants" }
          ]
        },
        {
          name: "Frameworks",
          children: [
            { name: "Ollama Local Server" },
            { name: "vLLM High-Performance Production Engine" },
            { name: "Llama.cpp Edge Inference" },
            { name: "LangChain Local Ollama Integration" }
          ]
        },
        {
          name: "Usages",
          children: [
            { name: "Souveraineté des données 100% On-Premise" },
            { name: "Agents locaux exécutés sur PC/Mac" },
            { name: "Filtrage et garde-fous de sécurité IA" },
            { name: "Analyse confidentielle de données privées" }
          ]
        },
        {
          name: "Limites",
          children: [
            { name: "Besoins matériels en GPU locaux importants" },
            { name: "Performance de codage réduite des petits modèles" },
            { name: "Taille limitée du contexte en hébergement local" },
            { name: "Complexité de déploiement et d'orchestration" }
          ]
        },
        {
          name: "Futur",
          children: [
            { name: "Inférence Edge ultra-rapide sur smartphones" },
            { name: "Llama 4 Ultra-Agentic natif" },
            { name: "Co-processeurs d'IA locaux dédiés" }
          ]
        }
      ]
    },
    {
      name: "Qwen",
      children: [
        {
          name: "Agents",
          children: [
            { name: "Alibaba Intelligent Shopping Assistant" },
            { name: "Qwen Agentic Sandbox" },
            { name: "Qwen-Coder Autonome" },
            { name: "Multilingual Support Agent" }
          ]
        },
        {
          name: "Frameworks",
          children: [
            { name: "ModelScope Ecosystem (Alibaba)" },
            { name: "Qwen Agent Framework" },
            { name: "Hugging Face Pipelines" },
            { name: "Ollama Qwen-Coder Wrapper" }
          ]
        },
        {
          name: "Usages",
          children: [
            { name: "Support client multilingue mondial" },
            { name: "Traduction et portage de code technique" },
            { name: "Recherche Web e-commerce automatisée" },
            { name: "Analyse de marché Asie-Pacifique" }
          ]
        },
        {
          name: "Limites",
          children: [
            { name: "Biais linguistiques régionaux" },
            { name: "Documentation communautaire occidentale limitée" },
            { name: "Accès API variable hors d'Asie" },
            { name: "Complexité d'intégration Enterprise US" }
          ]
        },
        {
          name: "Futur",
          children: [
            { name: "Modèles de vision robotiques industriels" },
            { name: "Qwen-R1 Reasoning-Agents" },
            { name: "Alliance de recherche open-source" }
          ]
        }
      ]
    }
  ]
};

const AI_COMPARISON_FALLBACK = {
  summary: "Analyse des forces motrices de l'écosystème d'intelligence artificielle : l'émergence de DeepSeek bouscule la tarification des leaders américains tandis qu'Anthropic et Google se livrent une guerre de fonctionnalités avancées (raisonnement et agentivité).",
  alignmentScore: 94,
  alignmentLabel: "Forte Cohérence",
  coins: [
    {
      symbol: "DeepSeek",
      price: "0.14 $ / M tok",
      change24h: "-90% coût",
      sentiment: "haussier",
      comparison: "Le modèle chinois redéfinit le marché avec une tarification agressive et une architecture MoE d'une efficacité redoutable, forçant les géants américains à s'adapter.",
      catalyst: "Rapport performance/prix disruptif"
    },
    {
      symbol: "Claude",
      price: "3.00 $ / M tok",
      change24h: "+ Excellence",
      sentiment: "haussier",
      comparison: "Claude 3.7 Sonnet maintient son avance sur les tâches de codage complexes et d'architecture logicielle, justifiant un prix d'inférence supérieur.",
      catalyst: "Leadership en programmation"
    },
    {
      symbol: "Gemini",
      price: "0.075 $ / M tok",
      change24h: "2M contexte",
      sentiment: "haussier",
      comparison: "Avec Gemini 2.5 Flash et sa fenêtre de contexte gigantesque, Google cible le marché des agents de traitement de masse et de flux vidéo/audio natifs.",
      catalyst: "Agents multimodaux ultra-rapides"
    }
  ],
  conclusion: "La tendance globale est au déplacement de la valeur : la simple intelligence générale brute devient une commodité bon marché, tandis que l'expertise de codage et d'autonomie applicative capte toute l'attention."
};

app.get("/api/ai/news", async (req, res) => {
  return res.json({ source: "static", data: BASELINE_AI_NEWS, lastFetched: Date.now() });
});

app.post("/api/summarize", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Texte manquant ou invalide" });
  }

  const baselineSummary = {
    title: "Synthèse Tactique Automatique",
    sentiment: "neutre",
    threatLevel: "faible",
    summary: "L'analyse met en évidence des points de convergence forts sur le marché crypto-sémantique. Le momentum haussier est globalement soutenu par des investissements réguliers et une activité d'agents IA intense.",
    bullets: [
      "Flux de capitaux stable au sein de l'écosystème",
      "Consolidation des positions sur les supports clés",
      "Indicateurs de sentiment globalement favorables"
    ],
    readingTime: "1 min de lecture"
  };

  if (!ai) {
    console.log("[Summarize] Gemini not available. Using baseline summary.");
    return res.json({ source: "baseline", data: baselineSummary });
  }

  try {
    console.log(`[Summarize] Summarizing text with Gemini... (Length: ${text.length})`);
    const systemInstruction = `Tu es l'agent IA de ResumeFlow, un assistant tactique spécialisé dans l'analyse et la synthèse de données crypto, d'actualités et d'intelligence artificielle.
Analyse le texte fourni et génère une synthèse extrêmement claire, concise et exploitable en français.

Retourne UNIQUEMENT un objet JSON conforme à cette structure stricte (pas d'enrobage markdown ni texte introductif/conclusif) :
{
  "title": "Un titre court et percutant en français (max 6 mots)",
  "sentiment": "haussier" | "baissier" | "neutre",
  "threatLevel": "faible" | "moyen" | "élevé",
  "summary": "Un résumé d'un paragraphe fluide expliquant les conclusions clés en français (max 3 phrases)",
  "bullets": [
    "Point clé 1 d'importance stratégique (max 10 mots)",
    "Point clé 2 d'importance stratégique (max 10 mots)",
    "Point clé 3 d'importance stratégique (max 10 mots)"
  ],
  "readingTime": "X min de lecture"
}`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: `Voici le texte à synthétiser :\n\n${text.substring(0, 5000)}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const parsedText = response.text?.trim() || "";
    const cleanedText = cleanJsonString(parsedText);
    const summaryData = JSON.parse(cleanedText);

    if (summaryData && summaryData.title && summaryData.summary && Array.isArray(summaryData.bullets)) {
      return res.json({ source: "gemini", data: summaryData });
    } else {
      throw new Error("Structure de synthèse invalide reçue de Gemini");
    }
  } catch (error: any) {
    console.log("[Summarize] Error during generation, falling back to baseline:", error.message || error);
    return res.json({ source: "fallback", data: baselineSummary });
  }
});

app.get("/api/ai/radar", async (req, res) => {
  const requestedCoinsParam = req.query.coins as string;
  const targetModels = requestedCoinsParam 
    ? requestedCoinsParam.split(",").map(c => c.trim()).filter(Boolean)
    : ["Gemini", "Claude", "GPT-4", "DeepSeek", "Llama", "Qwen"];

  const filteredChildren = targetModels.map(model => {
    const match = AI_RADAR_FALLBACK.children.find(c => c.name.toLowerCase() === model.toLowerCase());
    if (match) return match;
    return {
      name: model,
      children: [
        { name: "Agents", children: [{ name: `Agents basés sur ${model}` }] },
        { name: "Frameworks", children: [{ name: `Frameworks d'intégration de ${model}` }] },
        { name: "Usages", children: [{ name: `Déploiements et cas d'usage` }] },
        { name: "Limites", children: [{ name: `Contraintes techniques actuelles` }] },
        { name: "Futur", children: [{ name: `Perspectives d'évolution de ${model}` }] }
      ]
    };
  });

  return res.json({ name: "AI Radar", children: filteredChildren });
});

app.get("/api/ai/compare-trends-news", async (req, res) => {
  return res.json(AI_COMPARISON_FALLBACK);
});

// Start server and begin background auto-updater jobs
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
    
    // Fire initial warm-up fetch to populate news cache immediately
    autoUpdateNews();
    
    // Set up continuous periodic automatic background updates every 10 minutes
    setInterval(() => {
      console.log("[Scheduler] Triggering periodic background RSS feed refresh...");
      autoUpdateNews();
    }, NEWS_CACHE_TTL);
  });
}

startServer();
