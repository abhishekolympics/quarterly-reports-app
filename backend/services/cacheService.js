const MarketDataCache = require('../models/MarketDataCache');

class CacheService {
  /**
   * Generate cache key from quarter and year
   * Format: "Q1_2025"
   */
  static generateCacheKey(quarter, year) {
    return `${quarter}_${year}`;
  }

  /**
   * Get data from cache if it exists and is not expired
   * @param {string} cacheKey - e.g., "Q1_2025"
   * @returns {object|null} - Cached data or null if not found/expired
   */
  static async getFromCache(cacheKey) {
    try {
      const cache = await MarketDataCache.findOne({ cacheKey });
      
      if (!cache) {
        console.log(`[Cache] MISS: ${cacheKey} not found`);
        return null;
      }

      // Check if expired
      if (new Date() > cache.expiresAt) {
        console.log(`[Cache] EXPIRED: ${cacheKey}`);
        // Delete expired cache
        await MarketDataCache.deleteOne({ _id: cache._id });
        return null;
      }

      console.log(`[Cache] HIT: ${cacheKey}`);
      return cache.data;
    } catch (error) {
      console.error(`[Cache] Error retrieving ${cacheKey}:`, error.message);
      return null;
    }
  }

  /**
   * Save data to cache with 24-hour expiry
   * @param {string} cacheKey - e.g., "Q1_2025"
   * @param {object} data - Market data to cache
   * @param {string} quarter - Quarter (Q1, Q2, Q3, Q4)
   * @param {number} year - Year (2025, etc.)
   * @param {array} sources - Sources used (["finnhub", "newsapi"])
   * @returns {object} - Saved cache document
   */
  static async saveToCache(cacheKey, data, quarter, year, sources = []) {
    try {
      // Delete old cache for this quarter if exists
      await MarketDataCache.deleteOne({ cacheKey });

      // Calculate expiry: 24 hours from now
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const cache = new MarketDataCache({
        cacheKey,
        quarter,
        year,
        data,
        metadata: {
          fetchedAt: new Date(),
          sources,
          status: 'success',
          errors: []
        },
        expiresAt
      });

      await cache.save();
      console.log(`[Cache] SAVED: ${cacheKey} (expires at ${expiresAt})`);
      return cache;
    } catch (error) {
      console.error(`[Cache] Error saving ${cacheKey}:`, error.message);
      throw error;
    }
  }

  /**
   * Save cache with partial data (if some APIs failed)
   * @param {string} cacheKey - e.g., "Q1_2025"
   * @param {object} data - Partial market data
   * @param {string} quarter - Quarter
   * @param {number} year - Year
   * @param {array} sources - Sources that succeeded
   * @param {array} errors - Error messages from failed APIs
   */
  static async savePartialCache(cacheKey, data, quarter, year, sources = [], errors = []) {
    try {
      await MarketDataCache.deleteOne({ cacheKey });

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const cache = new MarketDataCache({
        cacheKey,
        quarter,
        year,
        data,
        metadata: {
          fetchedAt: new Date(),
          sources,
          status: 'partial',
          errors
        },
        expiresAt
      });

      await cache.save();
      console.log(`[Cache] SAVED (partial): ${cacheKey}`);
      return cache;
    } catch (error) {
      console.error(`[Cache] Error saving partial ${cacheKey}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if cache exists and is valid
   * @param {string} cacheKey
   * @returns {boolean}
   */
  static async isCacheValid(cacheKey) {
    try {
      const cache = await MarketDataCache.findOne({ cacheKey });
      if (!cache) return false;
      return new Date() <= cache.expiresAt;
    } catch (error) {
      console.error(`[Cache] Error checking validity:`, error.message);
      return false;
    }
  }

  /**
   * Clear specific cache
   * @param {string} cacheKey
   */
  static async clearCache(cacheKey) {
    try {
      await MarketDataCache.deleteOne({ cacheKey });
      console.log(`[Cache] CLEARED: ${cacheKey}`);
    } catch (error) {
      console.error(`[Cache] Error clearing ${cacheKey}:`, error.message);
    }
  }

  /**
   * Clear all expired caches
   */
  static async clearExpiredCaches() {
    try {
      const result = await MarketDataCache.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      console.log(`[Cache] Cleared ${result.deletedCount} expired documents`);
      return result.deletedCount;
    } catch (error) {
      console.error(`[Cache] Error clearing expired caches:`, error.message);
    }
  }
}

module.exports = CacheService;
