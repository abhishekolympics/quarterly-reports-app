const axios = require('axios');

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

class FinnhubService {
  
  // Use ETF symbols instead of index symbols (they work better)
  static async getQuote(symbol) {
    try {
      console.log(`[Finnhub] Fetching quote for ${symbol}...`);
      
      const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
        params: {
          symbol,
          token: FINNHUB_API_KEY
        },
        timeout: 15000
      });

      if (response.data && response.data.c) {
        console.log(`[Finnhub] ✅ Got quote for ${symbol}: ${response.data.c}`);
        return response.data;
      } else {
        console.log(`[Finnhub] ⚠️  No quote data for ${symbol}`);
        return null;
      }
    } catch (error) {
      console.log(`[Finnhub] ❌ Error fetching ${symbol}:`, error.message);
      return null;
    }
  }

  static async fetchMarketIndices(quarter, year) {
    try {
      console.log(`[Finnhub] Fetching market indices for ${quarter} ${year}...`);

      // Use ETF symbols instead of index symbols
      // SPY = S&P 500, QQQ = NASDAQ, ACWX = MSCI ACWI
      console.log('[Finnhub] Step 1: Fetching from Finnhub using ETF symbols...');
      const [spy, qqq, acwx] = await Promise.allSettled([
        this.getQuote('SPY'),    // S&P 500
        this.getQuote('QQQ'),    // NASDAQ
        this.getQuote('ACWX')    // MSCI ACWI
      ]);

      let indices = {};

      // S&P 500
      if (spy.status === 'fulfilled' && spy.value && spy.value.pc && spy.value.c) {
        const change = ((spy.value.c - spy.value.pc) / spy.value.pc) * 100;
        indices.SP500 = parseFloat(change.toFixed(2));
        console.log(`[Finnhub] ✅ S&P 500 (SPY): ${indices.SP500}%`);
      } else {
        console.log('[Finnhub] ⚠️  SPY failed, using default...');
        indices.SP500 = this.getDefaultReturn(quarter, year, 'SP500');
      }

      // NASDAQ
      if (qqq.status === 'fulfilled' && qqq.value && qqq.value.pc && qqq.value.c) {
        const change = ((qqq.value.c - qqq.value.pc) / qqq.value.pc) * 100;
        indices.NASDAQ = parseFloat(change.toFixed(2));
        console.log(`[Finnhub] ✅ NASDAQ (QQQ): ${indices.NASDAQ}%`);
      } else {
        console.log('[Finnhub] ⚠️  QQQ failed, using default...');
        indices.NASDAQ = this.getDefaultReturn(quarter, year, 'NASDAQ');
      }

      // MSCI ACWI
      if (acwx.status === 'fulfilled' && acwx.value && acwx.value.pc && acwx.value.c) {
        const change = ((acwx.value.c - acwx.value.pc) / acwx.value.pc) * 100;
        indices.ACWI = parseFloat(change.toFixed(2));
        console.log(`[Finnhub] ✅ MSCI ACWI (ACWX): ${indices.ACWI}%`);
      } else {
        console.log('[Finnhub] ⚠️  ACWX failed, using default...');
        indices.ACWI = this.getDefaultReturn(quarter, year, 'ACWI');
      }

      indices.SP500RecordHighs = this.getDefaultRecordHighs(quarter, year);

      console.log('[Finnhub] ✅ Market indices fetched:', indices);
      return indices;
    } catch (error) {
      console.error('[Finnhub] ❌ Error fetching indices:', error.message);
      return { 
        SP500: this.getDefaultReturn(quarter, year, 'SP500'),
        NASDAQ: this.getDefaultReturn(quarter, year, 'NASDAQ'),
        ACWI: this.getDefaultReturn(quarter, year, 'ACWI'),
        SP500RecordHighs: this.getDefaultRecordHighs(quarter, year)
      };
    }
  }

  // Default realistic returns based on case study data
  static getDefaultReturn(quarter, year, index) {
    const defaultData = {
      'Q1_2024': { SP500: 10.6, NASDAQ: 11.2, ACWI: 8.2 },
      'Q2_2024': { SP500: 4.3, NASDAQ: 3.8, ACWI: 2.9 },
      'Q3_2024': { SP500: 5.9, NASDAQ: 6.2, ACWI: 6.6 },
      'Q4_2024': { SP500: 2.4, NASDAQ: 2.1, ACWI: -1.0 },
      'Q1_2025': { SP500: 0.0, NASDAQ: 0.0, ACWI: 0.0 },
      'Q2_2025': { SP500: 10.9, NASDAQ: 12.5, ACWI: 11.5 },
      'Q3_2025': { SP500: 3.2, NASDAQ: 2.8, ACWI: 2.5 },
      'Q4_2025': { SP500: 5.1, NASDAQ: 5.8, ACWI: 4.2 },
    };

    const key = `${quarter}_${year}`;
    if (defaultData[key]) {
      console.log(`[Finnhub] Using default ${index} for ${quarter} ${year}: ${defaultData[key][index]}%`);
      return defaultData[key][index];
    }
    return 0;
  }

  static getDefaultRecordHighs(quarter, year) {
    const recordHighs = {
      'Q1_2024': 21,
      'Q2_2024': 31,
      'Q3_2024': 43,
      'Q4_2024': 57,
      'Q1_2025': 3,
      'Q2_2025': 17,
      'Q3_2025': 8,
      'Q4_2025': 12,
    };

    const key = `${quarter}_${year}`;
    return recordHighs[key] || 'N/A';
  }

  static async fetchTopPerformers(quarter, year) {
    try {
      console.log(`[Finnhub] Fetching top performers for ${quarter} ${year}...`);

      const techStocks = ['NVDA', 'MSFT', 'AAPL', 'TSLA', 'META', 'BROADCOM', 'AMZN'];
      console.log('[Finnhub] Step 1: Fetching real-time performance data...');
      
      const quotes = await Promise.all(
        techStocks.map(async (symbol) => {
          const quote = await this.getQuote(symbol);
          if (quote && quote.pc && quote.c && quote.c !== 0) {
            const change = ((quote.c - quote.pc) / quote.pc) * 100;
            console.log(`[Finnhub] ✅ ${symbol}: ${change.toFixed(2)}%`);
            return {
              ticker: symbol,
              company: this.getCompanyName(symbol),
              return: `${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
              price: quote.c,
              change: parseFloat(change.toFixed(2))
            };
          }
          console.log(`[Finnhub] ⚠️  ${symbol}: No data`);
          return null;
        })
      );

      const topPerformers = quotes.filter(q => q !== null).sort((a, b) => b.change - a.change);

      if (topPerformers.length > 0) {
        console.log(`[Finnhub] ✅ Top performers fetched: ${topPerformers.length} stocks`);
        return topPerformers;
      } else {
        console.log('[Finnhub] ⚠️  No performers from API, using defaults...');
        return this.getDefaultPerformers(quarter, year);
      }
    } catch (error) {
      console.error('[Finnhub] ❌ Error fetching top performers:', error.message);
      return this.getDefaultPerformers(quarter, year);
    }
  }

  static getDefaultPerformers(quarter, year) {
    const performersData = {
      'Q1_2025': [
        { ticker: 'MSFT', company: 'Microsoft', return: '+5.2%', change: 5.2 },
        { ticker: 'NVDA', company: 'NVIDIA', return: '+3.8%', change: 3.8 },
        { ticker: 'META', company: 'Meta', return: '+1.5%', change: 1.5 },
        { ticker: 'AAPL', company: 'Apple', return: '-2.1%', change: -2.1 },
        { ticker: 'TSLA', company: 'Tesla', return: '-8.3%', change: -8.3 }
      ],
      'Q2_2025': [
        { ticker: 'NVDA', company: 'NVIDIA', return: '+46.0%', change: 46.0 },
        { ticker: 'MSFT', company: 'Microsoft', return: '+33.0%', change: 33.0 },
        { ticker: 'BROADCOM', company: 'Broadcom', return: '+65.0%', change: 65.0 },
        { ticker: 'META', company: 'Meta', return: '+28.0%', change: 28.0 },
        { ticker: 'AMZN', company: 'Amazon', return: '+15.0%', change: 15.0 }
      ]
    };

    const key = `${quarter}_${year}`;
    const performers = performersData[key] || [
      { ticker: 'NVDA', company: 'NVIDIA', return: '+2.5%', change: 2.5 },
      { ticker: 'MSFT', company: 'Microsoft', return: '+1.8%', change: 1.8 },
      { ticker: 'AAPL', company: 'Apple', return: '+0.9%', change: 0.9 },
      { ticker: 'TSLA', company: 'Tesla', return: '-1.2%', change: -1.2 },
      { ticker: 'META', company: 'Meta', return: '+3.5%', change: 3.5 }
    ];

    console.log(`[Finnhub] Using default performers for ${quarter} ${year}`);
    return performers;
  }

  static getCompanyName(symbol) {
    const names = {
      'NVDA': 'NVIDIA',
      'MSFT': 'Microsoft',
      'AAPL': 'Apple',
      'TSLA': 'Tesla',
      'META': 'Meta',
      'BROADCOM': 'Broadcom',
      'AMZN': 'Amazon'
    };
    return names[symbol] || symbol;
  }

  static async fetchEconomicCalendar(quarter, year) {
    try {
      console.log(`[Finnhub] Fetching economic calendar for ${quarter} ${year}...`);

      const quarterMonth = parseInt(quarter.replace('Q', '')) * 3 - 2;
      const startDate = `${year}-${String(quarterMonth).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(quarterMonth + 2).padStart(2, '0')}-28`;

      const response = await axios.get(`${FINNHUB_BASE_URL}/economic_calendar`, {
        params: {
          from: startDate,
          to: endDate,
          token: FINNHUB_API_KEY
        },
        timeout: 15000
      });

      const data = Array.isArray(response.data) ? response.data : [];
      
      const events = data
        .slice(0, 10)
        .map(event => ({
          event: event.event || 'Economic Event',
          date: event.date || '',
          impact: event.country || '',
          country: event.country || ''
        }));

      console.log(`[Finnhub] ✅ Economic events fetched: ${events.length}`);
      return events;
    } catch (error) {
      console.error('[Finnhub] ❌ Error fetching economic calendar:', error.message);
      return [];
    }
  }

  static async aggregateFinancialData(quarter, year) {
    try {
      console.log(`\n[Finnhub] ========== AGGREGATING DATA FOR ${quarter} ${year} ==========\n`);

      const startTime = Date.now();

      const [indices, performers, economicEvents] = await Promise.allSettled([
        this.fetchMarketIndices(quarter, year),
        this.fetchTopPerformers(quarter, year),
        this.fetchEconomicCalendar(quarter, year)
      ]);

      const result = {
        indices: indices.status === 'fulfilled' ? indices.value : { SP500: 0, NASDAQ: 0, ACWI: 0 },
        topPerformers: performers.status === 'fulfilled' ? performers.value : this.getDefaultPerformers(quarter, year),
        economicEvents: economicEvents.status === 'fulfilled' ? economicEvents.value : []
      };

      const elapsedTime = Date.now() - startTime;
      console.log(`[Finnhub] ✅ Data aggregation complete! (${elapsedTime}ms)`);
      console.log(`[Finnhub] Indices: SP500=${result.indices.SP500}%, NASDAQ=${result.indices.NASDAQ}%, ACWI=${result.indices.ACWI}%`);
      console.log(`[Finnhub] Top performers: ${result.topPerformers.length} stocks`);
      console.log(`[Finnhub] ========== END DATA AGGREGATION ==========\n`);

      return result;
    } catch (error) {
      console.error('[Finnhub] ❌ Error aggregating data:', error.message);
      return { 
        indices: { SP500: 0, NASDAQ: 0, ACWI: 0 }, 
        topPerformers: this.getDefaultPerformers(quarter, year), 
        economicEvents: [] 
      };
    }
  }
}

module.exports = FinnhubService;