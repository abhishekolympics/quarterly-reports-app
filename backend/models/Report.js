const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'Quarterly Equity Market Report'
    },
    quarter: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true
    },
    quarterNumber: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true
    },
    // ✅ COMPLETELY FLEXIBLE SCHEMA
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    // Generated Content
    narrative: String,
    summary: String,
    reportHTML: String,
    errorMessage: String,
    status: {
      type: String,
      enum: ['draft', 'generating', 'completed', 'failed'],
      default: 'draft'
    },
    generationMetadata: {
      generatedAt: Date,
      generationTime: Number,
      dataSource: String,
      dataFetchTime: Date,
      promptTokens: Number,
      outputTokens: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', reportSchema);