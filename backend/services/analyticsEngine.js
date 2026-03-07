class AnalyticsEngine {
  // Extract top 5 movers and their impact
  static calculateTopMovers(marketData) {
    if (!marketData.topMovers) return null;
    const topMoversArray = Object.entries(marketData.topMovers)
      .map(([symbol, return_percent]) => ({
        symbol,
        return: return_percent,
        contribution: (return_percent / 100) * 0.55
      }))
      .sort((a, b) => b.return - a.return)
      .slice(0, 5);
    
    return {
      topMovers: topMoversArray,
      concentrationNote: "Top 5 stocks drove ~55% of S&P returns",
      riskLevel: "HIGH"
    };
  }

  // Analyze sector winners/losers
  static analyzeSectorPerformance(marketData) {
    if (!marketData.sectorPerformance) return null;
    const sectors = Object.entries(marketData.sectorPerformance)
      .map(([name, return_percent]) => ({
        name,
        return: return_percent
      }))
      .sort((a, b) => b.return - a.return);
    
    return {
      sectors,
      leaders: sectors.slice(0, 3),
      laggards: sectors.slice(-3),
      spread: (sectors[0].return - sectors[sectors.length - 1].return).toFixed(1)
    };
  }

  // Calculate market breadth
  static calculateMarketBreadth(marketData) {
    const sectors = marketData.sectorPerformance || {};
    const sectorsGaining = Object.values(sectors).filter(r => r > 0).length;
    const totalSectors = Object.values(sectors).length || 1;
    
    return {
      participationRate: ((sectorsGaining / totalSectors) * 100).toFixed(1),
      sectorsUp: sectorsGaining,
      totalSectors,
      breadthQuality: sectorsGaining / totalSectors > 0.6 ? "HEALTHY" : "NARROW"
    };
  }

  // Main method: analyze full quarter
  static analyzeQuarter(quarter, yearData) {
    const quarterData = yearData[quarter];
    if (!quarterData) return null;
    const marketData = quarterData.marketData || {};
    
    return {
      quarter,
      topMovers: this.calculateTopMovers(marketData),
      sectors: this.analyzeSectorPerformance(marketData),
      breadth: this.calculateMarketBreadth(marketData)
    };
  }
}

export default AnalyticsEngine;