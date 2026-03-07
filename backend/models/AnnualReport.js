const mongoose = require('mongoose');

const annualReportSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['draft', 'generating', 'completed', 'failed'],
    default: 'draft'
  },
  data: {
    q1: {
      narrative: String,
      bulletPoint: String,
      marketData: mongoose.Schema.Types.Mixed
    },
    q2: {
      narrative: String,
      bulletPoint: String,
      marketData: mongoose.Schema.Types.Mixed
    },
    q3: {
      narrative: String,
      bulletPoint: String,
      marketData: mongoose.Schema.Types.Mixed
    },
    q4: {
      narrative: String,
      bulletPoint: String,
      marketData: mongoose.Schema.Types.Mixed
    }
  },
  reportHTML: String,
  errorMessage: String,
  generationMetadata: {
    promptTokens: Number,
    outputTokens: Number,
    generatedAt: Date,
    generationTime: Number,
    dataSource: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AnnualReport', annualReportSchema);