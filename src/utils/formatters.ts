export function formatCurrency(value: number, currency: string = "USD", decimals: number = 2): string {
  if (value === undefined || value === null) return "-";
  
  // Choose symbol and conversion rate (simplified for client-side selection)
  let symbol = "$";
  let rate = 1;
  if (currency === "EUR") {
    symbol = "€";
    rate = 0.92; // Approx EUR/USD rate in 2026
  } else if (currency === "BTC") {
    symbol = "₿";
    rate = 1 / 92000; // Approx BTC/USD rate in 2026
  }

  const convertedValue = value * rate;

  if (currency === "BTC") {
    return `${convertedValue.toFixed(6)} ₿`;
  }

  if (convertedValue >= 1.0e12) {
    return `${(convertedValue / 1.0e12).toFixed(2)} T ${symbol}`;
  }
  if (convertedValue >= 1.0e9) {
    return `${(convertedValue / 1.0e9).toFixed(2)} Md ${symbol}`;
  }
  if (convertedValue >= 1.0e6) {
    return `${(convertedValue / 1.0e6).toFixed(2)} M ${symbol}`;
  }

  // Format with standard French locale spacing
  const formatter = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${formatter.format(convertedValue)} ${symbol}`;
}

export function formatLargeNumber(value: number): string {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatPercent(value: number): string {
  if (value === undefined || value === null) return "0.00%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// Sparkline path generator for drawing quick SVG paths
export function generateSparklinePoints(currentPrice: number, percentChange24h: number, percentChange7d: number, width: number, height: number): string {
  const pointsCount = 10;
  const points: number[] = [];
  
  // Reconstruct a path based on percent changes
  let price = currentPrice;
  const changeStep24h = percentChange24h / 100 / 3;
  const changeStep7d = percentChange7d / 100 / 7;
  
  // Generate 10 points
  for (let i = 0; i < pointsCount; i++) {
    const factor = (i / (pointsCount - 1));
    // organic fluctuation
    const rand = Math.sin(factor * Math.PI * 2) * 0.02 + (Math.random() - 0.5) * 0.015;
    const trend = (percentChange7d / 100) * (factor - 0.5) + (percentChange24h / 100) * factor * 0.3;
    points.push(currentPrice * (1 + trend + rand));
  }
  
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  
  const coords = points.map((p, index) => {
    const x = (index / (pointsCount - 1)) * width;
    // Invert Y so high prices are at the top
    const y = height - ((p - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  
  return `M ${coords.join(" L ")}`;
}
