const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// Create a new report
router.post('/reports', async (req, res) => {
  try {
    const { quarter, year, quarterNumber, data } = req.body;
    if (!quarter || !year || !quarterNumber || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const report = new Report({
      quarter,
      year,
      quarterNumber,
      data,
      status: 'draft'
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find()
      .select('quarter year quarterNumber title status createdAt generationMetadata')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single report by ID
router.get('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate report (AI) with real financial data
router.post('/reports/:id/generate', async (req, res) => {
  try {
    console.log('\n\n========== REPORT GENERATION START ==========');
    const report = await Report.findById(req.params.id);
    if (!report) {
      console.log('[ERROR] Report not found');
      return res.status(404).json({ error: 'Report not found' });
    }

    console.log(`[1] Report loaded: ${report.quarter} ${report.year}`);

    if (report.status === 'generating') {
      console.log('[ERROR] Report already generating');
      return res.status(400).json({ error: 'Report is already being generated' });
    }

    report.status = 'generating';
    await report.save();
    console.log('[2] Report status set to generating');

    // Fetch real financial data
    const MarketDataAggregator = require('../services/marketDataAggregator');
    console.log('[3] Fetching market data from all APIs...');
    
    let marketData;
    try {
      marketData = await MarketDataAggregator.aggregateAllData(
        report.quarter,
        report.year
      );
      console.log('[4] ✅ Market data fetched');
      console.log('[4] marketData keys:', Object.keys(marketData));
      console.log('[4] marketData.indices keys:', Object.keys(marketData.indices));
    } catch (error) {
      console.error('[ERROR] Failed to fetch market data:', error.message);
      report.status = 'failed';
      report.errorMessage = `Data unavailable: ${error.message}`;
      await report.save();
      return res.status(500).json({ 
        error: 'Data Unavailable',
        details: `Could not fetch historical market data for ${report.quarter} ${report.year}`
      });
    }

    // Check if we have valid data
    const spyData = marketData.indices.SPY.finnhub || marketData.indices.SPY.alphaVantage || marketData.indices.SPY.polygon;
    const qqqData = marketData.indices.QQQ.finnhub || marketData.indices.QQQ.alphaVantage || marketData.indices.QQQ.polygon;
    const acwxData = marketData.indices.ACWX.finnhub || marketData.indices.ACWX.polygon;

    console.log('[5] Data validation:');
    console.log(`  SPY Return: ${spyData?.return}%`);
    console.log(`  QQQ Return: ${qqqData?.return}%`);
    console.log(`  ACWX Return: ${acwxData?.return}%`);

    if (!spyData || !qqqData) {
      console.error('[ERROR] Insufficient market data');
      report.status = 'failed';
      report.errorMessage = 'Insufficient market data from APIs';
      await report.save();
      return res.status(500).json({ 
        error: 'Data Unavailable',
        details: `Not enough market data available for ${report.quarter} ${report.year}`
      });
    }

    // Generate narrative with market data
    const { generateReportNarrative, generateSummary } = require('../services/geminiService');
    console.log('[6] Calling generateReportNarrative...');
    
    const narrativeResult = await generateReportNarrative(report, marketData);
    
    console.log('[7] narrativeResult received:');
    console.log(`  success: ${narrativeResult.success}`);
    console.log(`  narrative length: ${narrativeResult.narrative?.length || 0}`);
    console.log(`  narrative first 100 chars: ${narrativeResult.narrative?.substring(0, 100) || 'NULL'}`);

    if (!narrativeResult.success) {
      console.error('[ERROR] Narrative generation failed:', narrativeResult.error);
      report.status = 'failed';
      report.errorMessage = narrativeResult.error;
      await report.save();
      return res.status(500).json({ 
        error: 'Failed to generate report',
        details: narrativeResult.error
      });
    }

    report.narrative = narrativeResult.narrative;
    console.log('[8] report.narrative assigned');
    console.log(`  report.narrative length: ${report.narrative?.length || 0}`);

    console.log('[9] Calling generateSummary...');
    const summary = await generateSummary(report.narrative, report);
    report.summary = summary;
    console.log('[10] summary assigned');
    console.log(`  summary length: ${summary?.length || 0}`);
    console.log(`  summary first 100 chars: ${summary?.substring(0, 100) || 'NULL'}`);

    // ✅ Create reportData with FULL structure
    console.log('[11] Creating reportData object...');
    const reportData = {
      quarter: report.quarter,
      year: report.year,
      narrative: report.narrative,
      summary: summary,
      data: {
        indices: {
          SP500: parseFloat(spyData.return.toFixed(2)),
          NASDAQ: parseFloat(qqqData.return.toFixed(2)),
          ACWI: acwxData ? parseFloat(acwxData.return.toFixed(2)) : 0,
          SP500RecordHighs: marketData.recordHighs.SPY || 'N/A'
        },
        topPerformers: [],
        majorNews: marketData.news.slice(0, 5).map(article => article.title),
        fetchedFrom: 'Finnhub + AlphaVantage + Polygon + NewsAPI'
      }
    };

    console.log('[12] reportData created:');
    console.log(`  reportData.narrative length: ${reportData.narrative?.length || 0}`);
    console.log(`  reportData.narrative first 100 chars: ${reportData.narrative?.substring(0, 100) || 'NULL'}`);
    console.log(`  reportData.summary length: ${reportData.summary?.length || 0}`);
    console.log(`  reportData.data.indices:`, JSON.stringify(reportData.data.indices));

    // Generate HTML report with correct data
    console.log('[13] Calling generateHTMLReport...');
    const { generateHTMLReport } = require('../services/reportService');
    const reportHTML = generateHTMLReport(reportData);
    
    console.log('[14] reportHTML generated:');
    console.log(`  reportHTML length: ${reportHTML?.length || 0}`);
    console.log(`  reportHTML includes "metric-value": ${reportHTML?.includes('metric-value') ? 'YES' : 'NO'}`);
    console.log(`  reportHTML includes narrative: ${reportHTML?.includes(reportData.narrative?.substring(0, 50)) ? 'YES' : 'NO'}`);

    report.reportHTML = reportHTML;

    // ✅ CRITICAL: Save the SAME data structure to database
    console.log('[15] Saving data to report...');
    report.data = reportData.data;
    
    console.log('[16] report.data after assignment:');
    console.log(`  report.data.indices:`, JSON.stringify(report.data.indices));

    report.status = 'completed';
    report.generationMetadata = {
      promptTokens: narrativeResult.tokenUsage?.promptTokens || 0,
      outputTokens: narrativeResult.tokenUsage?.outputTokens || 0,
      generatedAt: new Date(),
      generationTime: narrativeResult.generationTime || 0,
      dataSource: 'Finnhub + AlphaVantage + Polygon + NewsAPI',
      dataFetchTime: new Date()
    };

    console.log('[17] Saving report to database...');
    await report.save();

    console.log('[18] Report saved successfully');
    console.log(`  report._id: ${report._id}`);
    console.log(`  report.data.indices: ${JSON.stringify(report.data.indices)}`);
    console.log('========== REPORT GENERATION END ==========\n');

    res.json({
      message: 'Report generated successfully',
      report
    });
  } catch (error) {
    console.error('[CRITICAL ERROR]:', error.message);
    console.error(error.stack);
    
    try {
      const report = await Report.findById(req.params.id);
      if (report) {
        report.status = 'failed';
        await report.save();
      }
    } catch (e) {
      console.error('Error updating report status:', e);
    }

    res.status(500).json({ error: error.message });
  }
});

// Update report data (and reset status)
router.put('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const { data, quarter, year, quarterNumber } = req.body;

    if (data) report.data = data;
    if (quarter) report.quarter = quarter;
    if (year) report.year = year;
    if (quarterNumber) report.quarterNumber = quarterNumber;

    report.status = 'draft';
    report.narrative = null;
    report.summary = null;
    report.reportHTML = null;

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete report
router.delete('/reports/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get report as HTML
router.get('/reports/:id/html', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report || !report.reportHTML) {
      return res.status(404).json({ error: 'Report HTML not found' });
    }
    res.contentType('text/html');
    res.send(report.reportHTML);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get report as PDF
router.get('/reports/:id/pdf', async (req, res) => {
  try {
    console.log('[PDF] Starting PDF generation for report:', req.params.id);
    const report = await Report.findById(req.params.id);
    if (!report) {
      console.log('[PDF ERROR] Report not found');
      return res.status(404).json({ error: 'Report not found' });
    }

    console.log('[PDF] Report found:', report.quarter, report.year);
    console.log('[PDF] report.narrative length:', report.narrative?.length || 0);
    console.log('[PDF] report.summary length:', report.summary?.length || 0);
    console.log('[PDF] report.data.indices:', JSON.stringify(report.data?.indices || {}));

    const { generatePDFReport } = require('../services/reportService');
    await generatePDFReport(report, res);
  } catch (error) {
    console.error('[PDF ERROR]:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;