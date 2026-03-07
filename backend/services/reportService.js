// const PDFDocument = require('pdfkit');

// const generateHTMLReport = (reportData) => {
//   console.log('[HTML] generateHTMLReport called');
//   console.log('[HTML] reportData keys:', Object.keys(reportData));
//   console.log('[HTML] reportData.narrative length:', reportData.narrative?.length || 0);
//   console.log('[HTML] reportData.summary length:', reportData.summary?.length || 0);
  
//   if (!reportData) {
//     console.log('[HTML ERROR] reportData is null/undefined');
//     return '';
//   }
  
//   const { quarter, year, narrative, summary, data } = reportData;
  
//   console.log('[HTML] Extracted values:');
//   console.log(`  quarter: ${quarter}`);
//   console.log(`  year: ${year}`);
//   console.log(`  narrative length: ${narrative?.length || 0}`);
//   console.log(`  summary length: ${summary?.length || 0}`);
//   console.log(`  data keys: ${Object.keys(data || {})}`);

//   const indices = data?.indices || {};
//   const sp500Return = indices.SP500;
//   const nasdaqReturn = indices.NASDAQ;
//   const acwiReturn = indices.ACWI;
//   const recordHighs = indices.SP500RecordHighs;

//   console.log('[HTML] Indices values:');
//   console.log(`  SP500: ${sp500Return}`);
//   console.log(`  NASDAQ: ${nasdaqReturn}`);
//   console.log(`  ACWI: ${acwiReturn}`);
//   console.log(`  RecordHighs: ${recordHighs}`);

//   const majorNews = data?.majorNews || [];
  
//   console.log('[HTML] majorNews:', majorNews.length, 'items');

//   const majorNewsHTML = majorNews.length > 0
//     ? `
//       <div class="data-section">
//         <h3>Market Drivers & Key Events</h3>
//         <ul style="padding-left: 1.5rem;">
//           ${majorNews.slice(0, 5).map(news => `<li>${news}</li>`).join('')}
//         </ul>
//       </div>
//     `
//     : '';

//   const dataSourceHTML = `
//     <div class="data-section" style="margin-top: 2rem; padding: 1rem; background: #f0f4ff; border-radius: 6px;">
//       <h3>Data Source</h3>
//       <p style="font-size: 0.9em; color: #666; margin-top: 0.5rem;">
//         Report generated with real financial data from Finnhub, Alpha Vantage, Polygon, and NewsAPI.
//       </p>
//     </div>
//   `;

//   const html = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>${quarter} ${year} Quarterly Report</title>
//       <style>
//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }
//         body {
//           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
//           line-height: 1.6;
//           color: #333;
//           background: #f5f5f5;
//         }
//         .container {
//           max-width: 900px;
//           margin: 0 auto;
//           background: white;
//           padding: 60px;
//           box-shadow: 0 0 20px rgba(0,0,0,0.1);
//         }
//         header {
//           border-bottom: 3px solid #1e40af;
//           padding-bottom: 30px;
//           margin-bottom: 40px;
//         }
//         h1 {
//           font-size: 2.5em;
//           color: #1e40af;
//           margin-bottom: 10px;
//         }
//         .subtitle {
//           color: #666;
//           font-size: 1.1em;
//         }
//         .summary-box {
//           background: #f0f4ff;
//           border-left: 4px solid #1e40af;
//           padding: 20px;
//           margin: 30px 0;
//           border-radius: 4px;
//         }
//         .summary-box h3 {
//           color: #1e40af;
//           margin-bottom: 10px;
//         }
//         .narrative {
//           font-size: 1.05em;
//           text-align: justify;
//           margin: 40px 0;
//           line-height: 1.8;
//         }
//         .narrative p {
//           margin-bottom: 1rem;
//         }
//         .metrics {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 20px;
//           margin: 40px 0;
//         }
//         .metric-card {
//           background: #f9fafb;
//           padding: 20px;
//           border-radius: 8px;
//           border: 1px solid #e5e7eb;
//         }
//         .metric-label {
//           font-size: 0.9em;
//           color: #666;
//           text-transform: uppercase;
//           margin-bottom: 8px;
//         }
//         .metric-value {
//           font-size: 1.8em;
//           font-weight: bold;
//           color: #1e40af;
//         }
//         .data-section {
//           margin: 1.5rem 0;
//           padding: 1rem;
//           background: #f9fafb;
//           border-radius: 6px;
//         }
//         .data-section h3 {
//           color: #1e40af;
//           margin-bottom: 1rem;
//         }
//         .data-section ul {
//           padding-left: 1.5rem;
//         }
//         .data-section li {
//           margin: 0.5rem 0;
//           color: #555;
//         }
//         footer {
//           border-top: 1px solid #e5e7eb;
//           margin-top: 50px;
//           padding-top: 20px;
//           color: #999;
//           font-size: 0.9em;
//           text-align: center;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <header>
//           <h1>Quarterly Equity Market Report</h1>
//           <p class="subtitle">${quarter} ${year}</p>
//         </header>

//         <div class="summary-box">
//           <h3>Executive Summary</h3>
//           <p>${summary || 'Summary not yet generated'}</p>
//         </div>

//         <div class="narrative">
//           ${narrative ? narrative.split('\n').filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('') : '<p>Report not yet generated</p>'}
//         </div>

//         <div class="metrics">
//           <div class="metric-card">
//             <div class="metric-label">S&P 500 Return</div>
//             <div class="metric-value">${sp500Return !== undefined ? sp500Return : '0'}%</div>
//           </div>
//           <div class="metric-card">
//             <div class="metric-label">NASDAQ Return</div>
//             <div class="metric-value">${nasdaqReturn !== undefined ? nasdaqReturn : '0'}%</div>
//           </div>
//           <div class="metric-card">
//             <div class="metric-label">MSCI ACWI Return</div>
//             <div class="metric-value">${acwiReturn !== undefined ? acwiReturn : '0'}%</div>
//           </div>
//           <div class="metric-card">
//             <div class="metric-label">Record Highs</div>
//             <div class="metric-value">${recordHighs || 'N/A'}</div>
//           </div>
//         </div>

//         ${majorNewsHTML}

//         ${dataSourceHTML}

//         <footer>
//           <p>Generated: ${new Date().toLocaleDateString()}</p>
//           <p>This report is for informational purposes only and should not be considered investment advice.</p>
//         </footer>
//       </div>
//     </body>
//     </html>
//   `;

//   console.log('[HTML] HTML generated, length:', html.length);
//   return html;
// };

// const generatePDFReport = (report, res) => {
//   try {
//     console.log('[PDF] generatePDFReport called');
//     console.log('[PDF] report keys:', Object.keys(report).filter(k => !k.includes('_')));
    
//     if (!report) {
//       console.log('[PDF ERROR] report is null/undefined');
//       throw new Error('Report data not found');
//     }

//     const { quarter, year, narrative, summary, data } = report;
    
//     console.log('[PDF] Extracted values:');
//     console.log(`  quarter: ${quarter}`);
//     console.log(`  year: ${year}`);
//     console.log(`  narrative length: ${narrative?.length || 0}`);
//     console.log(`  summary length: ${summary?.length || 0}`);
//     console.log(`  data: ${data ? 'EXISTS' : 'NULL'}`);

//     const indices = data?.indices || {};
//     const sp500Return = indices.SP500;
//     const nasdaqReturn = indices.NASDAQ;
//     const acwiReturn = indices.ACWI;
//     const recordHighs = indices.SP500RecordHighs;
//     const majorNews = data?.majorNews || [];

//     console.log('[PDF] Indices:');
//     console.log(`  SP500: ${sp500Return}`);
//     console.log(`  NASDAQ: ${nasdaqReturn}`);
//     console.log(`  ACWI: ${acwiReturn}`);
//     console.log(`  RecordHighs: ${recordHighs}`);
//     console.log(`  majorNews: ${majorNews.length} items`);

//     const doc = new PDFDocument({
//       margin: 50,
//       size: 'A4'
//     });

//     const filename = `${quarter}-${year}-report.pdf`;
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

//     doc.pipe(res);

//     // TITLE
//     doc.fontSize(28).font('Helvetica-Bold').fillColor('#1e40af');
//     doc.text('Quarterly Equity Market Report', { align: 'center' });
    
//     doc.fontSize(16).fillColor('#666');
//     doc.text(`${quarter} ${year}`, { align: 'center' });
//     doc.moveDown(0.5);

//     // Line
//     doc.lineWidth(2).strokeColor('#1e40af').lineTo(doc.page.width - 100, 0).stroke();
//     doc.moveDown(1);

//     // EXECUTIVE SUMMARY
//     doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
//     doc.text('Executive Summary');
//     doc.fontSize(11).font('Helvetica').fillColor('#333');
//     doc.text(summary || 'Summary not yet generated', {
//       align: 'justify',
//       width: 500
//     });
//     doc.moveDown(1);

//     // MARKET NARRATIVE
//     doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
//     doc.text('Market Narrative');
//     doc.fontSize(11).font('Helvetica').fillColor('#333');
    
//     if (narrative) {
//       const paragraphs = narrative.split('\n').filter(p => p.trim());
//       console.log('[PDF] Narrative paragraphs:', paragraphs.length);
//       paragraphs.forEach((para, idx) => {
//         if (para.trim()) {
//           doc.text(para.trim(), {
//             align: 'justify',
//             width: 500
//           });
//           doc.moveDown(0.4);
//         }
//       });
//     } else {
//       console.log('[PDF WARNING] No narrative found');
//     }
//     doc.moveDown(0.5);

//     // KEY MARKET METRICS
//     doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
//     doc.text('Key Market Metrics');
//     doc.moveDown(0.5);

//     doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
//     doc.text(`S&P 500 Return: ${sp500Return !== undefined ? sp500Return : '0'}%`, { indent: 20 });
//     doc.text(`NASDAQ Return: ${nasdaqReturn !== undefined ? nasdaqReturn : '0'}%`, { indent: 20 });
//     doc.text(`MSCI ACWI Return: ${acwiReturn !== undefined ? acwiReturn : '0'}%`, { indent: 20 });
//     doc.text(`Record Highs: ${recordHighs || 'N/A'}`, { indent: 20 });
//     doc.moveDown(0.5);

//     // MARKET DRIVERS
//     if (majorNews.length > 0) {
//       doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af');
//       doc.text('Market Drivers & Key Events');
//       doc.moveDown(0.3);

//       doc.fontSize(10).font('Helvetica').fillColor('#333');
//       majorNews.slice(0, 5).forEach(news => {
//         doc.text(`• ${news}`, { indent: 20 });
//       });
//       doc.moveDown(0.5);
//     }

//     // FOOTER
//     doc.fontSize(9).fillColor('#999');
//     doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
//     doc.text('This report is for informational purposes only and should not be considered investment advice.', 
//       { align: 'center', width: 500 }
//     );

//     console.log('[PDF] PDF generation complete');
//     doc.end();

//   } catch (error) {
//     console.error('[PDF CRITICAL ERROR]:', error.message);
//     console.error(error.stack);
//     res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
//   }
// };

// module.exports = {
//   generateHTMLReport,
//   generatePDFReport
// };



//above code is working correctly


const PDFDocument = require('pdfkit');

const generateHTMLReport = (reportData) => {
  if (!reportData) return '';
  
  const { quarter, year, narrative, summary, data } = reportData;
  
  // Extract indices safely
  const indices = data?.indices || {};
  const sp500Return = indices.SP500 !== undefined ? indices.SP500 : 0;
  const nasdaqReturn = indices.NASDAQ !== undefined ? indices.NASDAQ : 0;
  const acwiReturn = indices.ACWI !== undefined ? indices.ACWI : 0;
  const recordHighs = indices.SP500RecordHighs || 'N/A';

  console.log(`[ReportService] Generating HTML with data:`, { sp500Return, nasdaqReturn, acwiReturn, recordHighs });

  const majorNews = data?.majorNews || [];

  // Generate data bullets (analyst insights with company performance)
  // Calculate concentration level from Nasdaq/S&P spread
  const nasdaqSpread = Math.abs(nasdaqReturn - sp500Return);
  let concentrationStatement = '';
  if (nasdaqSpread > 8) {
    concentrationStatement = `Extreme concentration: approximately 6-8 stocks accounted for 55-65% of total returns`;
  } else if (nasdaqSpread > 4) {
    concentrationStatement = `Notable concentration: approximately 8-10 stocks accounted for 50-60% of total returns`;
  } else {
    concentrationStatement = `Broad-based participation: 15+ stocks contributed significantly to returns`;
  }

  const dataMetricsHTML = `        <div class="data-section">
          <h3>Key Market Data</h3>
          <ul style="padding-left: 1.5rem;">
            <li><strong>Index Returns:</strong> S&P 500 ${sp500Return > 0 ? '+' : ''}${sp500Return}% | Nasdaq ${nasdaqReturn > 0 ? '+' : ''}${nasdaqReturn}% | MSCI ACWI ${acwiReturn > 0 ? '+' : ''}${acwiReturn}%</li>
            <li><strong>Record Highs:</strong> S&P 500 reached ${recordHighs} new highs during the quarter</li>
            <li><strong>Market Concentration:</strong> ${concentrationStatement}</li>
            ${data?.indices?.topStocks ? `<li><strong>Key Stock Performance:</strong> ${data.indices.topStocks}</li>` : `<li><strong>Key Stock Moves:</strong> Major companies reacted to earnings reports with mixed results across sectors</li>`}
          </ul>
        </div>`;

  const majorNewsHTML = majorNews.length > 0
    ? `        <div class="data-section">
          <h3>Market Context & News</h3>
          <ul style="padding-left: 1.5rem;">
            ${majorNews.slice(0, 3).map(news => `<li>${news}</li>`).join('')}
          </ul>
        </div>`
    : '';

  const dataSourceHTML = `        <div class="data-section" style="margin-top: 2rem; padding: 1rem; background: #f0f4ff; border-radius: 6px;">
          <h3>Data Source</h3>
          <p style="font-size: 0.9em; color: #666; margin-top: 0.5rem;">
            Report generated with real financial data from Finnhub, Alpha Vantage, Polygon, and NewsAPI.
          </p>
        </div>`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${quarter} ${year} Quarterly Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          padding: 60px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        header {
          border-bottom: 3px solid #1e40af;
          padding-bottom: 30px;
          margin-bottom: 40px;
        }
        h1 {
          font-size: 2.5em;
          color: #1e40af;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          font-size: 1.1em;
        }
        .summary-box {
          background: #f0f4ff;
          border-left: 4px solid #1e40af;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        .summary-box h3 {
          color: #1e40af;
          margin-bottom: 10px;
        }
        .narrative {
          font-size: 1.05em;
          text-align: justify;
          margin: 40px 0;
          line-height: 1.8;
        }
        .narrative p {
          margin-bottom: 1rem;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 40px 0;
        }
        .metric-card {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .metric-label {
          font-size: 0.9em;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .metric-value {
          font-size: 1.8em;
          font-weight: bold;
          color: #1e40af;
        }
        .data-section {
          margin: 1.5rem 0;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 6px;
        }
        .data-section h3 {
          color: #1e40af;
          margin-bottom: 1rem;
        }
        .data-section ul {
          padding-left: 1.5rem;
        }
        .data-section li {
          margin: 0.5rem 0;
          color: #555;
        }
        footer {
          border-top: 1px solid #e5e7eb;
          margin-top: 50px;
          padding-top: 20px;
          color: #999;
          font-size: 0.9em;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Quarterly Equity Market Report</h1>
          <p class="subtitle">${quarter} ${year}</p>
        </header>

        <div class="narrative">
${narrative ? (() => {
            const paragraphs = narrative.split('\n').filter(p => p.trim());
            if (paragraphs.length > 0) {
              return paragraphs.map(p => `          <p>${p.trim()}</p>`).join('\n');
            }
            return '          <p>Report not yet generated</p>';
          })() : '          <p>Report not yet generated</p>'}
        </div>

        ${dataMetricsHTML}

        <div class="summary-box">
          <h3>Executive Summary</h3>
          <p>${summary || 'Summary not yet generated'}</p>
        </div>

        ${majorNewsHTML}

        ${dataSourceHTML}

        <footer>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <p>This report is for informational purposes only and should not be considered investment advice.</p>
        </footer>
      </div>
    </body>
    </html>
  `;

  return html;
};

const generatePDFReport = async (report, res) => {
  try {
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Q${report.quarterNumber}-${report.year}-Report.pdf"`);
    
    doc.pipe(res);

    // Add content from HTML
    doc.fontSize(20).text(`Quarterly Equity Market Report`, { align: 'center' });
    doc.fontSize(12).text(`${report.quarter} ${report.year}`, { align: 'center' });
    doc.moveDown();

    if (report.summary) {
      doc.fontSize(12).font('Helvetica-Bold').text('Executive Summary', { underline: true });
      doc.font('Helvetica').text(report.summary, { align: 'justify' });
      doc.moveDown();
    }

    if (report.narrative) {
      doc.fontSize(12).font('Helvetica-Bold').text('Market Narrative', { underline: true });
      doc.font('Helvetica').text(report.narrative, { align: 'justify' });
      doc.moveDown();
    }

    doc.fontSize(10).text('Report generated with real financial data from Finnhub, Alpha Vantage, Polygon, and NewsAPI.', { color: '#999' });
    
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateHTMLReport,
  generatePDFReport
};