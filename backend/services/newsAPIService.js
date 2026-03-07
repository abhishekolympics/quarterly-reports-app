const axios = require('axios');

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';
const API_KEY = process.env.NEWSAPI_KEY;

class NewsAPIService {
  /**
   * Fetch financial news and market events for a quarter
   * @param {string} quarter - e.g., "Q1"
   * @param {number} year - e.g., 2025
   * @returns {array} - Array of major news events/headlines
   */
  static async fetchMarketNews(quarter, year) {
    try {
      console.log(`[NewsAPI] Fetching market news for ${quarter} ${year}...`);

      // Build search query based on quarter
      const quarterName = {
        'Q1': 'January February March',
        'Q2': 'April May June',
        'Q3': 'July August September',
        'Q4': 'October November December'
      }[quarter] || 'market';

      const searchQuery = `stock market ${year} ${quarterName} earnings`;

      const response = await axios.get(`${NEWSAPI_BASE_URL}/everything`, {
        params: {
          q: searchQuery,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 50,
          apiKey: API_KEY
        },
        timeout: 5000
      });

      // Extract and organize news
      const articles = response.data.articles || [];

      // Parse articles to identify major themes/news
      const majorNews = this.extractMajorNews(articles);

      console.log('[NewsAPI] Major news extracted:', majorNews.length);
      return majorNews;
    } catch (error) {
      console.error('[NewsAPI] Error fetching market news:', error.message);
      return [];
    }
  }

  /**
   * Extract major news themes/events from articles
   * Identifies key market narratives like:
   * - Fed policy changes
   * - Earnings reports
   * - Geopolitical events
   * - Economic data releases
   */
  static extractMajorNews(articles) {
    try {
      const themes = new Map();
      const keywords = {
        'Fed': ['Fed', 'Federal Reserve', 'interest rate', 'rate hike', 'rate cut', 'FOMC'],
        'Earnings': ['earnings', 'earnings season', 'Q1 results', 'Q2 results', 'guidance'],
        'Inflation': ['inflation', 'CPI', 'PCE', 'price pressures', 'deflation'],
        'Tech': ['tech stocks', 'AI', 'artificial intelligence', 'tech earnings', 'semiconductor'],
        'Market Correction': ['correction', 'sell-off', 'crash', 'declined', 'losses'],
        'Geopolitical': ['tariff', 'trade war', 'Ukraine', 'China', 'sanctions'],
        'Economic Growth': ['GDP', 'economic growth', 'recovery', 'expansion', 'stimulus']
      };

      // Scan articles for major themes
      articles.slice(0, 30).forEach(article => {
        const title = (article.title || '').toLowerCase();
        const description = (article.description || '').toLowerCase();
        const content = title + ' ' + description;

        Object.keys(keywords).forEach(theme => {
          keywords[theme].forEach(keyword => {
            if (content.includes(keyword.toLowerCase())) {
              if (!themes.has(theme)) {
                themes.set(theme, article.title);
              }
            }
          });
        });
      });

      // Convert to array and return top 6 themes
      const majorNews = Array.from(themes.entries())
        .slice(0, 6)
        .map(([theme, title]) => theme || title);

      return majorNews;
    } catch (error) {
      console.error('[NewsAPI] Error extracting news:', error.message);
      return [];
    }
  }

  /**
   * Get specific company news
   * @param {string} symbol - Stock ticker (e.g., "AAPL")
   * @returns {array} - News articles about the company
   */
  static async fetchCompanyNews(symbol) {
    try {
      const response = await axios.get(`${NEWSAPI_BASE_URL}/everything`, {
        params: {
          q: symbol,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 10,
          apiKey: API_KEY
        },
        timeout: 5000
      });

      return response.data.articles || [];
    } catch (error) {
      console.error(`[NewsAPI] Error fetching news for ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * Get breaking financial news
   */
  static async fetchBreakingNews() {
    try {
      console.log('[NewsAPI] Fetching breaking financial news...');

      const response = await axios.get(`${NEWSAPI_BASE_URL}/top-headlines`, {
        params: {
          category: 'business',
          language: 'en',
          pageSize: 20,
          apiKey: API_KEY
        },
        timeout: 5000
      });

      const headlines = (response.data.articles || [])
        .slice(0, 5)
        .map(article => article.title);

      console.log('[NewsAPI] Breaking news fetched:', headlines.length);
      return headlines;
    } catch (error) {
      console.error('[NewsAPI] Error fetching breaking news:', error.message);
      return [];
    }
  }
}

module.exports = NewsAPIService;
