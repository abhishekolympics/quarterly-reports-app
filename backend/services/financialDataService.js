const CacheService = require('./cacheService');
const FinnhubService = require('./finnhubService');
const NewsAPIService = require('./newsAPIService');

class FinancialDataService {
  /**
   * Main method: Aggregate quarterly market data
   * 
   * Flow:
   * 1. Check MongoDB cache
   * 2. If hit: Return cached data (fast)
   * 3. If miss: Fetch from all APIs in parallel
   * 4. Save to cache
   * 5. Return structured data for report generation
   */
  static async aggregateQuarterlyData(quarter, year) {
    try {
      console.log(`\n[FinancialDataService] Starting data aggregation for ${quarter} ${year}\n`);

      const cacheKey = CacheService.generateCacheKey(quarter, year);

      // STEP 1: Check cache
      console.log(`[FinancialDataService] Step 1: Checking cache...`);
      const cachedData = await CacheService.getFromCache(cacheKey);

      if (cachedData) {
        console.log(`[FinancialDataService] ✅ Cache hit! Using cached data\n`);
        return cachedData;
      }

      console.log(`[FinancialDataService] ❌ Cache miss. Fetching fresh data...\n`);

      // STEP 2: Fetch data from all sources in parallel
      console.log(`[FinancialDataService] Step 2: Fetching from APIs (parallel)...`);
      
      const startTime = Date.now();
      const results = await Promise.allSettled([
        FinnhubService.aggregateFinancialData(quarter, year),
        NewsAPIService.fetchMarketNews(quarter, year),
        NewsAPIService.fetchBreakingNews()
      ]);

      const fetchTime = Date.now() - startTime;
      console.log(`[FinancialDataService] API calls completed in ${fetchTime}ms\n`);

      // STEP 3: Structure the data
      console.log(`[FinancialDataService] Step 3: Structuring data...`);

      const finnhubData = results[0].status === 'fulfilled' ? results[0].value : { indices: {}, topPerformers: [], economicEvents: [] };
      const marketNews = results[1].status === 'fulfilled' ? results[1].value : [];
      const breakingNews = results[2].status === 'fulfilled' ? results[2].value : [];

      // Combine news sources
      const majorNews = [...marketNews, ...breakingNews].slice(0, 10);

      const structuredData = {
        indices: {
          ACWI: finnhubData.indices.ACWI || 0,
          SP500: finnhubData.indices.SP500 || 0,
          NASDAQ: finnhubData.indices.NASDAQ || 0,
          ACWIRecordHighs: 0,  // Would need additional API
          SP500RecordHighs: 0,
          marketValueAdded: 'N/A'
        },
        topPerformers: finnhubData.topPerformers || [],
        majorNews: majorNews || [],
        economicEvents: finnhubData.economicEvents || []
      };

      console.log(`[FinancialDataService] Data structured:`);
      console.log(`  - Indices: ${Object.keys(structuredData.indices).length} fields`);
      console.log(`  - Top Performers: ${structuredData.topPerformers.length} stocks`);
      console.log(`  - Major News: ${structuredData.majorNews.length} items`);
      console.log(`  - Economic Events: ${structuredData.economicEvents.length} events\n`);

      // STEP 4: Save to cache
      console.log(`[FinancialDataService] Step 4: Saving to cache...`);
      const sources = ['finnhub', 'newsapi'];
      
      await CacheService.saveToCache(
        cacheKey,
        structuredData,
        quarter,
        year,
        sources
      );

      console.log(`[FinancialDataService] ✅ Data aggregation complete!\n`);

      return structuredData;
    } catch (error) {
      console.error('[FinancialDataService] Fatal error:', error.message);
      console.error(error.stack);
      throw new Error(`Failed to aggregate financial data: ${error.message}`);
    }
  }

  /**
   * Get data with fallback to cached data if fresh fetch fails
   */
  static async aggregateQuarterlyDataWithFallback(quarter, year) {
    try {
      return await this.aggregateQuarterlyData(quarter, year);
    } catch (error) {
      console.error('[FinancialDataService] Fresh fetch failed, trying cache...');
      const cacheKey = CacheService.generateCacheKey(quarter, year);
      
      // Even if expired, try to use it as fallback
      const MarketDataCache = require('../models/MarketDataCache');
      const cache = await MarketDataCache.findOne({ cacheKey });
      
      if (cache) {
        console.log('[FinancialDataService] ✅ Using fallback cache');
        return cache.data;
      }

      // No cache available, throw error
      throw new Error('Unable to fetch data and no cache available');
    }
  }

  /**
   * Preload cache for specific quarters
   * Useful for admin/backend job
   */
  static async preloadCache(quarters) {
    console.log(`[FinancialDataService] Preloading cache for ${quarters.length} quarters...`);

    for (const { quarter, year } of quarters) {
      try {
        await this.aggregateQuarterlyData(quarter, year);
        console.log(`✅ Preloaded ${quarter} ${year}`);
      } catch (error) {
        console.error(`❌ Failed to preload ${quarter} ${year}:`, error.message);
      }
    }
  }

  /**
   * Clear cache for a specific quarter
   */
  static async clearQuarterCache(quarter, year) {
    const cacheKey = CacheService.generateCacheKey(quarter, year);
    await CacheService.clearCache(cacheKey);
    console.log(`[FinancialDataService] Cleared cache for ${quarter} ${year}`);
  }
}

module.exports = FinancialDataService;
