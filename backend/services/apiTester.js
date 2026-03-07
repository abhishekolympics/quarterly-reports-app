const axios = require('axios');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

class APITester {
  static async testFinnhub() {
    try {
      console.log('\n=== TESTING FINNHUB ===');
      const response = await axios.get('https://finnhub.io/api/v1/quote', {
        params: {
          symbol: 'AAPL',
          token: FINNHUB_API_KEY
        },
        timeout: 5000
      });
      
      if (response.data && response.data.c) {
        console.log('✅ FINNHUB WORKING');
        console.log('Response:', response.data);
        return true;
      } else {
        console.log('❌ FINNHUB - No data returned');
        return false;
      }
    } catch (error) {
      console.log('❌ FINNHUB ERROR:', error.message);
      return false;
    }
  }

  static async testAlphaVantage() {
    try {
      console.log('\n=== TESTING ALPHA VANTAGE ===');
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: 'AAPL',
          apikey: ALPHA_VANTAGE_API_KEY
        },
        timeout: 10000
      });
      
      console.log('Response:', response.data);
      
      if (response.data && response.data['Global Quote']) {
        console.log('✅ ALPHA VANTAGE WORKING');
        return true;
      } else {
        console.log('❌ ALPHA VANTAGE - No quote data');
        return false;
      }
    } catch (error) {
      console.log('❌ ALPHA VANTAGE ERROR:', error.message);
      return false;
    }
  }

  static async testPolygon() {
    try {
      console.log('\n=== TESTING POLYGON.IO ===');
      const response = await axios.get('https://api.polygon.io/v1/open-close/AAPL/2025-03-31', {
        params: {
          apikey: POLYGON_API_KEY
        },
        timeout: 5000
      });
      
      console.log('Response:', response.data);
      
      if (response.data && response.data.close) {
        console.log('✅ POLYGON.IO WORKING');
        return true;
      } else {
        console.log('❌ POLYGON.IO - No data');
        return false;
      }
    } catch (error) {
      console.log('❌ POLYGON.IO ERROR:', error.message);
      return false;
    }
  }

  static async testYahooFinance() {
    try {
      console.log('\n=== TESTING YAHOO FINANCE ===');
      const response = await axios.get(
        'https://query1.finance.yahoo.com/v10/finance/quoteSummary/AAPL',
        {
          params: {
            modules: 'price'
          },
          timeout: 5000
        }
      );
      
      if (response.data && response.data.quoteSummary) {
        console.log('✅ YAHOO FINANCE WORKING');
        console.log('Response:', response.data);
        return true;
      } else {
        console.log('❌ YAHOO FINANCE - No data');
        return false;
      }
    } catch (error) {
      console.log('❌ YAHOO FINANCE ERROR:', error.message);
      return false;
    }
  }

  static async testTwelveData() {
    try {
      console.log('\n=== TESTING TWELVE DATA ===');
      const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
      
      const response = await axios.get('https://api.twelvedata.com/quote', {
        params: {
          symbol: 'AAPL',
          apikey: TWELVE_DATA_API_KEY
        },
        timeout: 5000
      });
      
      console.log('Response:', response.data);
      
      if (response.data && response.data.close) {
        console.log('✅ TWELVE DATA WORKING');
        return true;
      } else {
        console.log('❌ TWELVE DATA - No data');
        return false;
      }
    } catch (error) {
      console.log('❌ TWELVE DATA ERROR:', error.message);
      return false;
    }
  }

  static async runAllTests() {
    console.log('\n\n🔍 RUNNING ALL API TESTS...\n');
    
    const results = {
      finnhub: await this.testFinnhub(),
      alphaVantage: await this.testAlphaVantage(),
      polygon: await this.testPolygon(),
      yahooFinance: await this.testYahooFinance(),
      twelveData: await this.testTwelveData()
    };

    console.log('\n\n📊 TEST RESULTS SUMMARY:');
    console.log('=========================');
    Object.entries(results).forEach(([api, working]) => {
      const status = working ? '✅ WORKING' : '❌ NOT WORKING';
      console.log(`${api.toUpperCase()}: ${status}`);
    });

    const workingAPIs = Object.entries(results)
      .filter(([_, working]) => working)
      .map(([api, _]) => api);

    if (workingAPIs.length === 0) {
      console.log('\n⚠️  NO APIS ARE WORKING! Check your API keys.');
    } else {
      console.log(`\n✅ Working APIs: ${workingAPIs.join(', ')}`);
    }

    return results;
  }
}

module.exports = APITester;