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

  // YEARLY DATA AGGREGATION - NEW METHOD
  static async aggregateYearlyData(year) {
    console.log(`\n[MarketDataAggregator] ========== FETCHING YEARLY DATA FOR ${year} ==========\n`);

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    console.log(`[MarketDataAggregator] Date Range: ${startDate} to ${endDate}\n`);

    const symbols = ['SPY', 'QQQ', 'ACWX'];
    const indices = {};
    const news = [];

    // Fetch data for each symbol sequentially with delay
    for (const symbol of symbols) {
      indices[symbol] = {
        finnhub: null,
        alphaVantage: null,
        polygon: null
      };

      // Finnhub
      try {
        console.log(`[Finnhub] Fetching yearly data for ${symbol} (${startDate} to ${endDate})...`);
        const finnhubResponse = await axios.get('https://finnhub.io/api/v1/stock/candle', {
          params: {
            symbol: symbol,
            resolution: 'D',
            from: Math.floor(new Date(startDate).getTime() / 1000),
            to: Math.floor(new Date(endDate).getTime() / 1000),
            token: FINNHUB_API_KEY
          }
        });

        if (finnhubResponse.data.o && finnhubResponse.data.o.length > 0) {
          const opens = finnhubResponse.data.o;
          const closes = finnhubResponse.data.c;
          const highs = finnhubResponse.data.h;
          const lows = finnhubResponse.data.l;

          const startPrice = opens[0];
          const endPrice = closes[closes.length - 1];
          const yearReturn = ((endPrice - startPrice) / startPrice) * 100;
          const maxHigh = Math.max(...highs);
          const minLow = Math.min(...lows);

          indices[symbol].finnhub = {
            source: 'Finnhub',
            symbol: symbol,
            open: startPrice,
            close: endPrice,
            high: maxHigh,
            low: minLow,
            return: parseFloat(yearReturn.toFixed(2)),
            daysInYear: finnhubResponse.data.o.length,
            volume: finnhubResponse.data.v ? finnhubResponse.data.v.reduce((a, b) => a + b, 0) : 0
          };

          console.log(`[Finnhub] ✅ Got ${finnhubResponse.data.o.length} days for ${symbol}`);
        }
      } catch (error) {
        console.log(`[Finnhub] ❌ Error for ${symbol}: ${error.response?.status || error.message}`);
      }

      // Alpha Vantage
      try {
        console.log(`[Alpha Vantage] Fetching yearly data for ${symbol}...`);
        const avResponse = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'TIME_SERIES_DAILY',
            symbol: symbol,
            apikey: ALPHA_VANTAGE_API_KEY,
            outputsize: 'full'
          }
        });

        if (avResponse.data['Time Series (Daily)']) {
          const timeSeries = avResponse.data['Time Series (Daily)'];
          const dates = Object.keys(timeSeries).sort();
          const relevantDates = dates.filter(date => {
            const d = new Date(date);
            return d.getFullYear() === year;
          });

          if (relevantDates.length > 0) {
            const firstDate = relevantDates[0];
            const lastDate = relevantDates[relevantDates.length - 1];
            const startPrice = parseFloat(timeSeries[firstDate]['1. open']);
            const endPrice = parseFloat(timeSeries[lastDate]['4. close']);
            const yearReturn = ((endPrice - startPrice) / startPrice) * 100;

            let maxHigh = 0;
            let minLow = Infinity;
            relevantDates.forEach(date => {
              const high = parseFloat(timeSeries[date]['2. high']);
              const low = parseFloat(timeSeries[date]['3. low']);
              maxHigh = Math.max(maxHigh, high);
              minLow = Math.min(minLow, low);
            });

            indices[symbol].alphaVantage = {
              source: 'Alpha Vantage',
              symbol: symbol,
              open: startPrice,
              close: endPrice,
              high: maxHigh,
              low: minLow,
              return: parseFloat(yearReturn.toFixed(2)),
              daysInYear: relevantDates.length
            };

            console.log(`[Alpha Vantage] ✅ Got ${relevantDates.length} days for ${symbol}`);
          }
        }
      } catch (error) {
        console.log(`[Alpha Vantage] ⚠️  Error for ${symbol}: ${error.message}`);
      }

      // Polygon
      try {
        console.log(`[Polygon] Fetching yearly data for ${symbol}...`);
        const polygonResponse = await axios.get(
          `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startDate}/${endDate}`,
          {
            params: {
              apiKey: POLYGON_API_KEY,
              sort: 'asc',
              limit: 250
            }
          }
        );

        if (polygonResponse.data.results && polygonResponse.data.results.length > 0) {
          const results = polygonResponse.data.results;
          const startPrice = results[0].o;
          const endPrice = results[results.length - 1].c;
          const yearReturn = ((endPrice - startPrice) / startPrice) * 100;

          let maxHigh = 0;
          let minLow = Infinity;
          let totalVolume = 0;

          results.forEach(day => {
            maxHigh = Math.max(maxHigh, day.h || 0);
            minLow = Math.min(minLow, day.l || Infinity);
            totalVolume += day.v || 0;
          });

          indices[symbol].polygon = {
            source: 'Polygon',
            symbol: symbol,
            open: startPrice,
            close: endPrice,
            high: maxHigh,
            low: minLow,
            return: parseFloat(yearReturn.toFixed(2)),
            daysInYear: results.length,
            volume: totalVolume,
            data: results
          };

          console.log(`[Polygon] ✅ Got ${results.length} days for ${symbol}`);
        }
      } catch (error) {
        console.log(`[Polygon] ❌ Error for ${symbol}: ${error.response?.status || error.message}`);
      }

      // Small delay between symbols to avoid rate limiting
      if (symbol !== 'ACWX') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Fetch yearly news
    try {
      console.log(`\n[NewsAPI] Fetching market news for ${year}...`);
      const newsResponse = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'stock market equity S&P 500 Nasdaq',
          from: startDate,
          to: endDate,
          sortBy: 'relevancy',
          language: 'en',
          pageSize: 30,
          apiKey: NEWSAPI_KEY
        },
        timeout: 10000
      });

      if (newsResponse.data.articles && newsResponse.data.articles.length > 0) {
        newsResponse.data.articles.forEach(article => {
          news.push(article.title);
        });
        console.log(`[NewsAPI] ✅ Got ${newsResponse.data.articles.length} articles\n`);
      }
    } catch (error) {
      console.log(`[NewsAPI] ⚠️  Error: ${error.message}\n`);
    }

    console.log(`[MarketDataAggregator] ========== YEARLY DATA AGGREGATION COMPLETE ==========\n`);
    console.log(`[MarketDataAggregator] Summary:\n`);
    Object.keys(indices).forEach(symbol => {
      console.log(`  ${symbol}:`, JSON.stringify(indices[symbol]));
    });
    console.log(`  News articles: ${news.length}\n`);

    return {
      indices,
      news,
      year,
      dataType: 'yearly'
    };
  }
}

module.exports = MarketDataAggregator;