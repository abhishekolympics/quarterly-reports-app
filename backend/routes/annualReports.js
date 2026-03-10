const express = require('express');
const router = express.Router();
const AnnualReport = require('../models/AnnualReport');
const MarketDataAggregator = require('../services/marketDataAggregator');
const { generateAnnualNarratives } = require('../services/geminiService');
const { generateAnnualReportHTML, generateAnnualReportPDF } = require('../services/annualReportService');

// Create or get annual report
router.post('/annual-reports', async (req, res) => {
  try {
    const { year } = req.body;

    if (!year) {
      return res.status(400).json({ error: 'Year is required' });
    }

    // Check if report already exists
    let report = await AnnualReport.findOne({ year });

    if (!report) {
      report = new AnnualReport({
        year,
        status: 'draft'
      });
      await report.save();
      console.log(`[AnnualReports] Created new annual report for ${year}`);
    }

    res.json(report);
  } catch (error) {
    console.error('Error creating annual report:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/annual-reports/:id/generate', async (req, res) => {
  try {
    const report = await AnnualReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.status === 'generating') {
      return res.status(400).json({ error: 'Report is already being generated' });
    }

    report.status = 'generating';
    await report.save();

    console.log(`\n[AnnualReports] ========== START GENERATION FOR ${report.year} ==========\n`);

    try {
      // STEP 1: Fetch yearly data (single call to APIs)
      console.log(`[AnnualReports] STEP 1: Fetching yearly data for ${report.year}...`);
      const yearlyData = await MarketDataAggregator.aggregateYearlyData(report.year);

      if (!yearlyData || !yearlyData.indices) {
        throw new Error('Failed to fetch yearly market data');
      }

      console.log('[AnnualReports] ✅ Yearly data fetched');
      console.log('[AnnualReports] Available indices:', Object.keys(yearlyData.indices));

      // STEP 2: Split yearly data into quarterly data
      console.log(`[AnnualReports] STEP 2: Splitting yearly data into quarters...`);
      const { splitYearlyDataIntoQuarters } = require('../services/quarterlyDataSplitter');
      const quarterlyData = splitYearlyDataIntoQuarters(yearlyData);

      if (!quarterlyData) {
        throw new Error('Failed to split yearly data into quarters');
      }

      console.log('[AnnualReports] ✅ Data split into quarters');
      console.log('[AnnualReports] Q1 SPY return:', quarterlyData.q1.indices.SPY.polygon?.return || 'N/A');
      console.log('[AnnualReports] Q2 SPY return:', quarterlyData.q2.indices.SPY.polygon?.return || 'N/A');
      console.log('[AnnualReports] Q3 SPY return:', quarterlyData.q3.indices.SPY.polygon?.return || 'N/A');
      console.log('[AnnualReports] Q4 SPY return:', quarterlyData.q4.indices.SPY.polygon?.return || 'N/A');

      // STEP 3: Generate narratives using Gemini
      console.log(`[AnnualReports] STEP 3: Generating narratives with Gemini...`);
      const narrativeResult = await generateAnnualNarratives(report.year, quarterlyData);

      if (!narrativeResult.success) {
        report.status = 'failed';
        report.errorMessage = narrativeResult.error;
        await report.save();
        return res.status(500).json({
          error: 'Failed to generate report',
          details: narrativeResult.error
        });
      }

      console.log('[AnnualReports] ✅ Narratives generated');

      // STEP 4: Extract quarterly returns for storage
      console.log(`[AnnualReports] STEP 4: Extracting quarterly returns...`);
      
      const getQuarterlyReturns = (quarterData) => {
        if (!quarterData || !quarterData.indices) {
          return { sp500: 0, nasdaq: 0, acwi: 0 };
        }

        const getReturn = (indexData) => {
          if (!indexData) return 0;
          if (indexData.polygon && indexData.polygon.return !== undefined) {
            return indexData.polygon.return;
          }
          if (indexData.finnhub && indexData.finnhub.return !== undefined) {
            return indexData.finnhub.return;
          }
          return 0;
        };

        return {
          sp500: getReturn(quarterData.indices.SPY),
          nasdaq: getReturn(quarterData.indices.QQQ),
          acwi: getReturn(quarterData.indices.ACWX)
        };
      };

      const q1Returns = getQuarterlyReturns(quarterlyData.q1);
      const q2Returns = getQuarterlyReturns(quarterlyData.q2);
      const q3Returns = getQuarterlyReturns(quarterlyData.q3);
      const q4Returns = getQuarterlyReturns(quarterlyData.q4);

      // STEP 5: Store data in report
      console.log(`[AnnualReports] STEP 5: Storing report data...`);
      
      report.data = {
        q1: {
          narrative: narrativeResult.q1.narrative || 'Report generated',
          bulletPoint: narrativeResult.q1.bulletPoint || 'Market data for Q1',
          returns: q1Returns
        },
        q2: {
          narrative: narrativeResult.q2.narrative || 'Report generated',
          bulletPoint: narrativeResult.q2.bulletPoint || 'Market data for Q2',
          returns: q2Returns
        },
        q3: {
          narrative: narrativeResult.q3.narrative || 'Report generated',
          bulletPoint: narrativeResult.q3.bulletPoint || 'Market data for Q3',
          returns: q3Returns
        },
        q4: {
          narrative: narrativeResult.q4.narrative || 'Report generated',
          bulletPoint: narrativeResult.q4.bulletPoint || 'Market data for Q4',
          returns: q4Returns
        }
      };

      console.log('[AnnualReports] ✅ Data stored');
      console.log('[AnnualReports] Q1 narrative length:', report.data.q1.narrative.length);
      console.log('[AnnualReports] Q1 returns:', report.data.q1.returns);

      // STEP 6: Generate HTML
      console.log(`[AnnualReports] STEP 6: Generating HTML...`);
      const reportHTML = generateAnnualReportHTML({
        year: report.year,
        data: report.data
      });

      if (!reportHTML) {
        throw new Error('Failed to generate HTML');
      }

      report.reportHTML = reportHTML;
      console.log('[AnnualReports] ✅ HTML generated, length:', reportHTML.length);

      // STEP 7: Mark as completed and save
      console.log(`[AnnualReports] STEP 7: Finalizing report...`);
      report.status = 'completed';
      report.generationMetadata = {
        promptTokens: narrativeResult.tokenUsage?.promptTokens || 0,
        outputTokens: narrativeResult.tokenUsage?.outputTokens || 0,
        generatedAt: new Date(),
        generationTime: narrativeResult.generationTime || 0,
        dataSource: 'Finnhub + AlphaVantage + Polygon + NewsAPI (Yearly Fetch)'
      };

      await report.save();

      console.log('[AnnualReports] ✅ Report saved successfully');
      console.log(`\n[AnnualReports] ========== GENERATION COMPLETE FOR ${report.year} ==========\n`);

      res.json({
        message: 'Annual report generated successfully',
        report
      });

    } catch (error) {
      console.error('[AnnualReports] ❌ Error during generation:', error.message);
      console.error(error.stack);
      
      report.status = 'failed';
      report.errorMessage = error.message;
      await report.save();
      
      res.status(500).json({
        error: 'Data Unavailable or Generation Failed',
        details: error.message
      });
    }
  } catch (error) {
    console.error('[AnnualReports] ❌ Critical error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all annual reports
router.get('/annual-reports', async (req, res) => {
  try {
    const reports = await AnnualReport.find()
      .select('year status createdAt generationMetadata')
      .sort({ year: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single annual report
router.get('/annual-reports/:id', async (req, res) => {
  try {
    const report = await AnnualReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get annual report as HTML
router.get('/annual-reports/:id/html', async (req, res) => {
  try {
    const report = await AnnualReport.findById(req.params.id);
    if (!report || !report.reportHTML) {
      return res.status(404).json({ error: 'Report HTML not found' });
    }

    // Set proper headers for HTML display
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send the HTML directly
    res.send(report.reportHTML);
  } catch (error) {
    console.error('Error retrieving HTML:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get annual report as PDF
router.get('/annual-reports/:id/pdf', async (req, res) => {
  try {
    const report = await AnnualReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const { generateAnnualReportPDF } = require('../services/annualReportService');
    await generateAnnualReportPDF(report, res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE annual report
router.delete('/annual-reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('[AnnualReports DELETE] Deleting report:', id);
    
    const result = await AnnualReport.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ message: 'Report deleted successfully', deletedId: id });
  } catch (error) {
    console.error('[AnnualReports DELETE] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;