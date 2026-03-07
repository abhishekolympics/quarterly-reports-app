const mongoose = require('mongoose');

const marketDataCacheSchema = new mongoose.Schema(
  {
    cacheKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // Format: "Q1_2025" for quarters
      // Format: "DAY_2025-03-05" for daily data
    },
    quarter: String,
    year: Number,
    data: {
      indices: {
        ACWI: Number,          // MSCI All-Country World Index return %
        SP500: Number,         // S&P 500 return %
        NASDAQ: Number,        // NASDAQ return %
        ACWIRecordHighs: Number,
        SP500RecordHighs: Number,
        marketValueAdded: String
      },
      topPerformers: [
        {
          ticker: String,
          company: String,
          return: String,      // e.g., "+46%"
          price: Number,
          change: Number
        }
      ],
      majorNews: [String],    // Array of major news/events
      economicEvents: [
        {
          event: String,
          date: String,
          impact: String,     // actual vs forecast
          country: String
        }
      ]
    },
    metadata: {
      fetchedAt: Date,
      sources: [String],      // e.g., ["finnhub", "newsapi"]
      status: {
        type: String,
        enum: ['success', 'partial', 'failed'],
        default: 'success'
      },
      errors: [String]        // Any errors during fetching
    },
    expiresAt: {
      type: Date,
      index: { expires: 0 }   // TTL index: auto-delete after expiry
    }
  },
  { timestamps: true }
);

// Compound index for faster queries
marketDataCacheSchema.index({ quarter: 1, year: 1 });

// TTL index will automatically delete expired documents
// Documents will be deleted 'expiresAt' time

module.exports = mongoose.model('MarketDataCache', marketDataCacheSchema);
