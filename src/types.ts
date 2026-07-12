export interface QuoteUSD {
  price: number;
  volume_24h: number;
  market_cap: number;
  percent_change_1h?: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d?: number;
  ath_price?: number;
  percent_from_price_ath?: number;
}

export interface CoinQuotes {
  USD: QuoteUSD;
}

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  circulating_supply?: number;
  max_supply?: number;
  total_supply?: number;
  quotes: CoinQuotes;
}

export interface GlobalStats {
  market_cap_usd: number;
  volume_24h_usd: number;
  bitcoin_dominance_percentage: number;
  cryptocurrencies_number: number;
  market_cap_change_24h: number;
  volume_24h_change_24h: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  link: string;
  pubDate: string;
  sentiment: "positif" | "neutre" | "négatif";
  category: string;
}

export interface ChartDataPoint {
  date: string;
  price: number;
}

export interface PriceAlert {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  targetPrice: number;
  condition: "above" | "below";
  createdAt: string;
  isActive: boolean;
  triggeredAt?: string;
  initialPriceAtCreation: number;
}

