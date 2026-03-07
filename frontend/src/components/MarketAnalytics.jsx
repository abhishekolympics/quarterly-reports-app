const extractNumberFromText = (text, keyword) => {
  if (!text) return null;
  
  // Look for "S&P 500 declined 5.09%" or similar patterns
  const regex = new RegExp(`${keyword}[^0-9]*([+-]?\\d+\\.?\\d*)%`, 'i');
  const match = text.match(regex);
  return match ? parseFloat(match[1]) : null;
};

// Extract actual stocks mentioned in narrative with percentages
const extractStockMoves = (narrative) => {
  if (!narrative) return [];
  
  const matches = [];
  
  // Pattern: Look for "CompanyName +X%" or "CompanyName fell/rose X%"
  const stockPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:fell|rose|declined|surged|gained|posted|experienced|registered).*?([+-]?\d+\.?\d*)%/gi;
  
  let match;
  const seen = new Set();
  
  while ((match = stockPattern.exec(narrative)) !== null) {
    let stockName = match[1].trim();
    const return_pct = parseFloat(match[2]);
    
    // Clean up: Remove articles and conjunctions
    stockName = stockName
      .replace(/^(the|and|a|an)\s+/i, '')  // Remove leading articles/conjunctions
      .trim();
    
    // Filter out index names and generic terms
    const excluded = ['Market', 'Index', 'Following', 'During', 'While', 'Conversely', 'However', 'Equity', 'Equity Markets'];
    
    if (!excluded.includes(stockName) && !seen.has(stockName) && stockName.length > 2) {
      matches.push({ 
        symbol: stockName, 
        fullName: stockName, 
        return: return_pct 
      });
      seen.add(stockName);
    }
  }
  
  return matches.slice(0, 5);
};

const calculateConcentration = (sp500, nasdaq) => {
  const spread = Math.abs(nasdaq - sp500);
  
  if (spread > 8) {
    return { 
      level: 'High Concentration', 
      description: 'Gains concentrated in few stocks. Limited market breadth.',
      riskLevel: 'HIGH' 
    };
  }
  if (spread > 4) {
    return { 
      level: 'Moderate Concentration', 
      description: 'Mixed participation with some sector concentration.',
      riskLevel: 'MEDIUM' 
    };
  }
  return { 
    level: 'Broad-based', 
    description: 'Healthy participation across sectors and stocks.',
    riskLevel: 'LOW' 
  };
};

const extractSectorPerformance = (narrative) => {
  if (!narrative) return { leaders: [], laggards: [] };
  
  const leaders = [];
  const laggards = [];
  
  // Look for sector mentions with performance context
  const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial'];
  
  for (const sector of sectors) {
    if (narrative.toLowerCase().includes(sector.toLowerCase())) {
      const sectorContext = narrative.substring(
        Math.max(0, narrative.toLowerCase().indexOf(sector.toLowerCase()) - 50),
        narrative.toLowerCase().indexOf(sector.toLowerCase()) + 150
      );
      
      if (sectorContext.toLowerCase().includes('strength') || sectorContext.toLowerCase().includes('outperform') || sectorContext.toLowerCase().includes('gain')) {
        if (!leaders.includes(sector)) leaders.push(sector);
      } else if (sectorContext.toLowerCase().includes('weakness') || sectorContext.toLowerCase().includes('decline') || sectorContext.toLowerCase().includes('pressure')) {
        if (!laggards.includes(sector)) laggards.push(sector);
      }
    }
  }
  
  return { leaders: leaders.slice(0, 3), laggards: laggards.slice(0, 3) };
};

export const analyzeAnnualReport = (reportData) => {
  if (!reportData || !reportData.data) return null;

  const { q1, q2, q3, q4 } = reportData.data;
  
  const quarters = [
    {
      quarter: 'Q1',
      sp500: extractNumberFromText(q1?.narrative, 'S&P 500') || 0,
      nasdaq: extractNumberFromText(q1?.narrative, 'Nasdaq') || 0,
      acwi: extractNumberFromText(q1?.narrative, 'MSCI|ACWI') || 0,
      narrative: q1?.narrative || '',
      topMovers: extractStockMoves(q1?.narrative),
      concentration: calculateConcentration(
        extractNumberFromText(q1?.narrative, 'S&P 500') || 0,
        extractNumberFromText(q1?.narrative, 'Nasdaq') || 0
      ),
      sectorPerformance: extractSectorPerformance(q1?.narrative)
    },
    {
      quarter: 'Q2',
      sp500: extractNumberFromText(q2?.narrative, 'S&P 500') || 0,
      nasdaq: extractNumberFromText(q2?.narrative, 'Nasdaq') || 0,
      acwi: extractNumberFromText(q2?.narrative, 'MSCI|ACWI') || 0,
      narrative: q2?.narrative || '',
      topMovers: extractStockMoves(q2?.narrative),
      concentration: calculateConcentration(
        extractNumberFromText(q2?.narrative, 'S&P 500') || 0,
        extractNumberFromText(q2?.narrative, 'Nasdaq') || 0
      ),
      sectorPerformance: extractSectorPerformance(q2?.narrative)
    },
    {
      quarter: 'Q3',
      sp500: extractNumberFromText(q3?.narrative, 'S&P 500') || 0,
      nasdaq: extractNumberFromText(q3?.narrative, 'Nasdaq') || 0,
      acwi: extractNumberFromText(q3?.narrative, 'MSCI|ACWI') || 0,
      narrative: q3?.narrative || '',
      topMovers: extractStockMoves(q3?.narrative),
      concentration: calculateConcentration(
        extractNumberFromText(q3?.narrative, 'S&P 500') || 0,
        extractNumberFromText(q3?.narrative, 'Nasdaq') || 0
      ),
      sectorPerformance: extractSectorPerformance(q3?.narrative)
    },
    {
      quarter: 'Q4',
      sp500: extractNumberFromText(q4?.narrative, 'S&P 500') || 0,
      nasdaq: extractNumberFromText(q4?.narrative, 'Nasdaq') || 0,
      acwi: extractNumberFromText(q4?.narrative, 'MSCI|ACWI') || 0,
      narrative: q4?.narrative || '',
      topMovers: extractStockMoves(q4?.narrative),
      concentration: calculateConcentration(
        extractNumberFromText(q4?.narrative, 'S&P 500') || 0,
        extractNumberFromText(q4?.narrative, 'Nasdaq') || 0
      ),
      sectorPerformance: extractSectorPerformance(q4?.narrative)
    }
  ];

  const bestQuarter = quarters.reduce((a, b) => a.sp500 > b.sp500 ? a : b);
  const worstQuarter = quarters.reduce((a, b) => a.sp500 < b.sp500 ? a : b);
  
  const avgSP500 = (quarters.reduce((sum, q) => sum + q.sp500, 0) / 4).toFixed(2);
  const avgNASDAQ = (quarters.reduce((sum, q) => sum + q.nasdaq, 0) / 4).toFixed(2);
  
  const sp500Spread = (bestQuarter.sp500 - worstQuarter.sp500).toFixed(2);
  const nasdaqVsSP500 = (avgNASDAQ - avgSP500).toFixed(2);

  const highConcentrationQuarters = quarters.filter(q => q.concentration.riskLevel === 'HIGH').length;
  const overallConcentrationRisk = highConcentrationQuarters >= 2 ? 'HIGH' : highConcentrationQuarters === 1 ? 'MEDIUM' : 'LOW';

  return {
    quarters,
    metrics: {
      bestQuarter,
      worstQuarter,
      avgSP500,
      avgNASDAQ,
      sp500Spread,
      nasdaqVsSP500,
      yearTotal: {
        sp500: quarters.reduce((sum, q) => sum + q.sp500, 0).toFixed(2),
        nasdaq: quarters.reduce((sum, q) => sum + q.nasdaq, 0).toFixed(2),
        acwi: quarters.reduce((sum, q) => sum + q.acwi, 0).toFixed(2)
      }
    },
    drivers: {
      overallConcentrationRisk,
      topMoversAcrossYear: extractStockMoves(
        quarters.map(q => q.narrative).join(' ')
      ),
      topSectors: {
        leaders: [...new Set(quarters.flatMap(q => q.sectorPerformance.leaders))].slice(0, 3),
        laggards: [...new Set(quarters.flatMap(q => q.sectorPerformance.laggards))].slice(0, 3)
      }
    }
  };
};

export default analyzeAnnualReport;