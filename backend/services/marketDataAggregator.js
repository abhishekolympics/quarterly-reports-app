const axios = require('axios');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

class MarketDataAggregator {
  
  // Get quarter date range
  static getQuarterDateRange(quarter, year) {
    const ranges = {
      'Q1': { start: `${year}-01-01`, end: `${year}-03-31` },
      'Q2': { start: `${year}-04-01`, end: `${year}-06-30` },
      'Q3': { start: `${year}-07-01`, end: `${year}-09-30` },
      'Q4': { start: `${year}-10-01`, end: `${year}-12-31` }
    };
    return ranges[quarter];
  }

  // FINNHUB: Get historical data
  static async getFinnhubHistoricalData(symbol, startDate, endDate) {
    try {
      console.log(`[Finnhub] Fetching historical data for ${symbol} (${startDate} to ${endDate})...`);
      
      const response = await axios.get('https://finnhub.io/api/v1/stock/candle', {
        params: {
          symbol: symbol,
          resolution: 'D',
          from: Math.floor(new Date(startDate).getTime() / 1000),
          to: Math.floor(new Date(endDate).getTime() / 1000),
          token: FINNHUB_API_KEY
        },
        timeout: 10000
      });

      if (response.data && response.data.c && response.data.c.length > 0) {
        console.log(`[Finnhub] ✅ Got ${response.data.c.length} candles for ${symbol}`);
        const openPrice = response.data.o[0];
        const closePrice = response.data.c[response.data.c.length - 1];
        const highPrice = Math.max(...response.data.h);
        const lowPrice = Math.min(...response.data.l);
        const returnPercent = ((closePrice - openPrice) / openPrice) * 100;
        
        return {
          source: 'Finnhub',
          symbol: symbol,
          open: openPrice,
          close: closePrice,
          high: highPrice,
          low: lowPrice,
          return: parseFloat(returnPercent.toFixed(2)),
          candles: response.data.c.length,
          data: response.data
        };
      }
      
      console.log(`[Finnhub] ⚠️  No candles for ${symbol}`);
      return null;
    } catch (error) {
      console.log(`[Finnhub] ❌ Error for ${symbol}:`, error.message);
      return null;
    }
  }

  // ALPHA VANTAGE: Get time series daily data
  static async getAlphaVantageHistoricalData(symbol, startDate, endDate) {
    try {
      console.log(`[Alpha Vantage] Fetching daily data for ${symbol}...`);
      
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: 'full',
          apikey: ALPHA_VANTAGE_API_KEY
        },
        timeout: 10000
      });

      if (response.data && response.data['Time Series (Daily)']) {
        const timeSeries = response.data['Time Series (Daily)'];
        const dates = Object.keys(timeSeries)
          .filter(date => date >= startDate && date <= endDate)
          .sort();

        if (dates.length > 0) {
          const firstDate = dates[0];
          const lastDate = dates[dates.length - 1];
          const openPrice = parseFloat(timeSeries[firstDate]['1. open']);
          const closePrice = parseFloat(timeSeries[lastDate]['4. close']);
          const returnPercent = ((closePrice - openPrice) / openPrice) * 100;

          console.log(`[Alpha Vantage] ✅ Got ${dates.length} days for ${symbol}`);
          
          return {
            source: 'AlphaVantage',
            symbol: symbol,
            open: openPrice,
            close: closePrice,
            return: parseFloat(returnPercent.toFixed(2)),
            daysInQuarter: dates.length,
            data: timeSeries
          };
        }
      }

      console.log(`[Alpha Vantage] ⚠️  No data for ${symbol}`);
      return null;
    } catch (error) {
      console.log(`[Alpha Vantage] ❌ Error for ${symbol}:`, error.message);
      return null;
    }
  }

  // POLYGON: Get aggregated data
  static async getPolygonAggregatedData(ticker, startDate, endDate) {
    try {
      console.log(`[Polygon] Fetching aggregated data for ${ticker}...`);
      
      const response = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}`,
        {
          params: {
            apikey: POLYGON_API_KEY
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.results && response.data.results.length > 0) {
        const results = response.data.results;
        const firstDay = results[0];
        const lastDay = results[results.length - 1];
        const openPrice = firstDay.o;
        const closePrice = lastDay.c;
        const returnPercent = ((closePrice - openPrice) / openPrice) * 100;

        console.log(`[Polygon] ✅ Got ${results.length} days for ${ticker}`);
        
        return {
          source: 'Polygon',
          symbol: ticker,
          open: openPrice,
          close: closePrice,
          high: Math.max(...results.map(r => r.h)),
          low: Math.min(...results.map(r => r.l)),
          return: parseFloat(returnPercent.toFixed(2)),
          daysInQuarter: results.length,
          volume: results.reduce((sum, r) => sum + r.v, 0),
          data: results
        };
      }

      console.log(`[Polygon] ⚠️  No data for ${ticker}`);
      return null;
    } catch (error) {
      console.log(`[Polygon] ❌ Error for ${ticker}:`, error.message);
      return null;
    }
  }

  // NEWSAPI: Get market news
  static async getMarketNews(quarter, year) {
    try {
      console.log(`[NewsAPI] Fetching market news for ${quarter} ${year}...`);
      
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'stock market S&P 500 NASDAQ',
          sortBy: 'relevancy',
          language: 'en',
          apiKey: NEWSAPI_KEY,
          pageSize: 20
        },
        timeout: 10000
      });

      if (response.data && response.data.articles) {
        console.log(`[NewsAPI] ✅ Got ${response.data.articles.length} articles`);
        return response.data.articles;
      }

      return [];
    } catch (error) {
      console.log(`[NewsAPI] ❌ Error:`, error.message);
      return [];
    }
  }

  // Calculate record highs from historical data
  static calculateRecordHighs(historicalData) {
    try {
      let recordHighs = 0;
      let allTimeHigh = 0;

      if (historicalData && historicalData.data) {
        const data = historicalData.data;
        
        if (data.h && Array.isArray(data.h)) {
          // Finnhub format
          data.h.forEach(high => {
            if (high > allTimeHigh) {
              allTimeHigh = high;
              recordHighs++;
            }
          });
        } else if (Array.isArray(data)) {
          // Polygon format
          data.forEach(day => {
            if (day.h > allTimeHigh) {
              allTimeHigh = day.h;
              recordHighs++;
            }
          });
        }
      }

      return recordHighs > 0 ? recordHighs : 'N/A';
    } catch (error) {
      console.log('[MarketDataAggregator] Error calculating record highs:', error.message);
      return 'N/A';
    }
  }

  // Main aggregator function
  static async aggregateAllData(quarter, year) {
    try {
      console.log(`\n[MarketDataAggregator] ========== FETCHING HISTORICAL DATA FOR ${quarter} ${year} ==========\n`);

      const dateRange = this.getQuarterDateRange(quarter, year);
      console.log(`[MarketDataAggregator] Date Range: ${dateRange.start} to ${dateRange.end}\n`);

      // Fetch from all APIs in parallel
      const [
        finnhubSPY,
        finnhubQQQ,
        finnhubACWX,
        alphavantagespy,
        alphavantageqqq,
        polygonspy,
        polygonqqq,
        polygonacwx,
        news
      ] = await Promise.allSettled([
        this.getFinnhubHistoricalData('SPY', dateRange.start, dateRange.end),
        this.getFinnhubHistoricalData('QQQ', dateRange.start, dateRange.end),
        this.getFinnhubHistoricalData('ACWX', dateRange.start, dateRange.end),
        this.getAlphaVantageHistoricalData('SPY', dateRange.start, dateRange.end),
        this.getAlphaVantageHistoricalData('QQQ', dateRange.start, dateRange.end),
        this.getPolygonAggregatedData('SPY', dateRange.start, dateRange.end),
        this.getPolygonAggregatedData('QQQ', dateRange.start, dateRange.end),
        this.getPolygonAggregatedData('ACWX', dateRange.start, dateRange.end),
        this.getMarketNews(quarter, year)
      ]);

      const aggregatedData = {
        quarter,
        year,
        dateRange,
        indices: {
          SPY: {
            finnhub: finnhubSPY.status === 'fulfilled' ? finnhubSPY.value : null,
            alphaVantage: alphavantagespy.status === 'fulfilled' ? alphavantagespy.value : null,
            polygon: polygonspy.status === 'fulfilled' ? polygonspy.value : null
          },
          QQQ: {
            finnhub: finnhubQQQ.status === 'fulfilled' ? finnhubQQQ.value : null,
            alphaVantage: alphavantageqqq.status === 'fulfilled' ? alphavantageqqq.value : null,
            polygon: polygonqqq.status === 'fulfilled' ? polygonqqq.value : null
          },
          ACWX: {
            finnhub: finnhubACWX.status === 'fulfilled' ? finnhubACWX.value : null,
            polygon: polygonacwx.status === 'fulfilled' ? polygonacwx.value : null
          }
        },
        news: news.status === 'fulfilled' ? news.value : []
      };

      // Calculate record highs
      const spyRecordHighs = this.calculateRecordHighs(
        aggregatedData.indices.SPY.finnhub || aggregatedData.indices.SPY.polygon
      );
      const qqqRecordHighs = this.calculateRecordHighs(
        aggregatedData.indices.QQQ.finnhub || aggregatedData.indices.QQQ.polygon
      );

      aggregatedData.recordHighs = {
        SPY: spyRecordHighs,
        QQQ: qqqRecordHighs
      };

      console.log(`[MarketDataAggregator] ========== DATA AGGREGATION COMPLETE ==========\n`);
      console.log(`[MarketDataAggregator] Summary:`);
      console.log(`  SPY: ${JSON.stringify(aggregatedData.indices.SPY)}`);
      console.log(`  QQQ: ${JSON.stringify(aggregatedData.indices.QQQ)}`);
      console.log(`  News articles: ${aggregatedData.news.length}\n`);

      return aggregatedData;
    } catch (error) {
      console.error('[MarketDataAggregator] ❌ Error:', error.message);
      throw error;
    }
  }
}

module.exports = MarketDataAggregator;