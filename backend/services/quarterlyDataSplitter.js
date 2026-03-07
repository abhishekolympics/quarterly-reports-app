// This service splits yearly data into quarterly data properly

const splitYearlyDataIntoQuarters = (yearlyData) => {
  const { indices, news, year } = yearlyData;

  console.log('[quarterlyDataSplitter] Starting to split yearly data into quarters');
  console.log(`[quarterlyDataSplitter] Year: ${year}`);
  console.log(`[quarterlyDataSplitter] Available symbols: ${Object.keys(indices).join(', ')}`);

  // Helper: Extract quarterly data from yearly Polygon data
  const getQuarterlyDataFromPolygon = (symbol, quarter) => {
    try {
      const symbolData = indices[symbol];
      
      if (!symbolData || !symbolData.polygon) {
        console.log(`[quarterlyDataSplitter] No polygon data for ${symbol}`);
        return null;
      }

      const polygonData = symbolData.polygon;
      
      // Check if we have daily data array
      if (!polygonData.data || !Array.isArray(polygonData.data)) {
        console.log(`[quarterlyDataSplitter] No daily data array for ${symbol}`);
        return null;
      }

      const dailyData = polygonData.data;
      
      // Quarter month ranges
      const quarterMonths = {
        'Q1': [1, 2, 3],
        'Q2': [4, 5, 6],
        'Q3': [7, 8, 9],
        'Q4': [10, 11, 12]
      };

      const targetMonths = quarterMonths[quarter];

      // Filter daily data for this quarter
      const quarterlyDays = dailyData.filter(day => {
        if (!day.t) return false; // Skip if no timestamp
        
        const date = new Date(day.t);
        const dayYear = date.getFullYear();
        const dayMonth = date.getMonth() + 1;

        return dayYear === year && targetMonths.includes(dayMonth);
      });

      if (quarterlyDays.length === 0) {
        console.log(`[quarterlyDataSplitter] No trading days found for ${symbol} ${quarter} ${year}`);
        return null;
      }

      // Calculate quarterly return
      const startPrice = quarterlyDays[0].o;
      const endPrice = quarterlyDays[quarterlyDays.length - 1].c;
      const quarterlyReturn = ((endPrice - startPrice) / startPrice) * 100;

      const result = {
        source: 'Polygon',
        symbol: symbol,
        open: startPrice,
        close: endPrice,
        high: Math.max(...quarterlyDays.map(d => d.h || 0)),
        low: Math.min(...quarterlyDays.map(d => d.l || Infinity)),
        return: parseFloat(quarterlyReturn.toFixed(2)),
        daysInQuarter: quarterlyDays.length,
        volume: quarterlyDays.reduce((sum, d) => sum + (d.v || 0), 0)
      };

      console.log(`[quarterlyDataSplitter] ${symbol} ${quarter}: return=${result.return}%, days=${result.daysInQuarter}`);
      
      return result;
    } catch (error) {
      console.error(`[quarterlyDataSplitter] Error processing ${symbol} ${quarter}:`, error.message);
      return null;
    }
  };

  // Helper: Extract quarterly data from Finnhub (fallback)
  const getQuarterlyDataFromFinnhub = (symbol, quarter) => {
    try {
      const symbolData = indices[symbol];
      
      if (!symbolData || !symbolData.finnhub) {
        return null;
      }

      const finnhubData = symbolData.finnhub;
      
      // Finnhub doesn't have daily breakdown in our case, so we approximate
      // This is a fallback - Polygon is preferred
      return {
        source: 'Finnhub (Estimated)',
        symbol: symbol,
        return: finnhubData.return ? parseFloat((finnhubData.return / 4).toFixed(2)) : 0,
        daysInQuarter: finnhubData.daysInYear ? Math.ceil(finnhubData.daysInYear / 4) : 0
      };
    } catch (error) {
      console.error(`[quarterlyDataSplitter] Error with Finnhub ${symbol}:`, error.message);
      return null;
    }
  };

  // Build complete quarterly data structure
  const buildQuarterStructure = (quarter) => {
    console.log(`\n[quarterlyDataSplitter] Building ${quarter} structure...`);

    const quarterData = {
      indices: {
        SPY: {
          finnhub: null,
          alphaVantage: null,
          polygon: getQuarterlyDataFromPolygon('SPY', quarter) || getQuarterlyDataFromFinnhub('SPY', quarter)
        },
        QQQ: {
          finnhub: null,
          alphaVantage: null,
          polygon: getQuarterlyDataFromPolygon('QQQ', quarter) || getQuarterlyDataFromFinnhub('QQQ', quarter)
        },
        ACWX: {
          finnhub: null,
          alphaVantage: null,
          polygon: getQuarterlyDataFromPolygon('ACWX', quarter) || getQuarterlyDataFromFinnhub('ACWX', quarter)
        }
      },
      news: news && news.length > 0 ? news.slice(0, 5) : [],
      quarter: quarter,
      year: year
    };

    console.log(`[quarterlyDataSplitter] ${quarter} structure complete`);
    console.log(`  SPY: ${quarterData.indices.SPY.polygon?.return || 'N/A'}%`);
    console.log(`  QQQ: ${quarterData.indices.QQQ.polygon?.return || 'N/A'}%`);
    console.log(`  ACWX: ${quarterData.indices.ACWX.polygon?.return || 'N/A'}%`);

    return quarterData;
  };

  const result = {
    q1: buildQuarterStructure('Q1'),
    q2: buildQuarterStructure('Q2'),
    q3: buildQuarterStructure('Q3'),
    q4: buildQuarterStructure('Q4'),
    year: year,
    dataType: 'quarterly'
  };

  console.log('\n[quarterlyDataSplitter] ✅ Yearly data split into quarters complete\n');

  return result;
};

module.exports = {
  splitYearlyDataIntoQuarters
};