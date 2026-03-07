const PDFDocument = require('pdfkit');

const generateAnnualReportHTML = (reportData) => {
  if (!reportData) return '';

  const { year, data } = reportData;
  const q1Data = data?.q1 || {};
  const q2Data = data?.q2 || {};
  const q3Data = data?.q3 || {};
  const q4Data = data?.q4 || {};

  console.log('[AnnualHTML] Generating HTML for year', year);
  console.log('[AnnualHTML] Q1 narrative:', q1Data.narrative ? 'YES' : 'NO');
  console.log('[AnnualHTML] Q2 narrative:', q2Data.narrative ? 'YES' : 'NO');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quarterly Equity Market Reports ${year}</title>
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
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 3px solid #1e40af;
        }
        h1 {
          font-size: 2.2em;
          color: #1e40af;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          font-size: 1.1em;
        }
        .quarter-section {
          margin: 40px 0;
          padding: 20px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .quarter-section:last-child {
          border-bottom: none;
        }
        .quarter-title {
          font-size: 1.3em;
          color: #1e40af;
          font-weight: bold;
          margin-bottom: 15px;
          margin-top: 20px;
        }
        .quarter-narrative {
          font-size: 1.05em;
          line-height: 1.8;
          text-align: justify;
          margin-bottom: 15px;
          color: #333;
        }
        .quarter-bullet {
          margin-left: 20px;
          font-size: 1em;
          line-height: 1.6;
          color: #555;
          margin-bottom: 20px;
        }
        .quarter-bullet:before {
          content: "• ";
          font-weight: bold;
          margin-right: 10px;
          color: #1e40af;
        }
        .quarter-metrics {
          background: #f9fafb;
          padding: 12px;
          margin: 15px 0;
          border-left: 3px solid #1e40af;
          border-radius: 4px;
          font-size: 0.95em;
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
          <h1>Quarterly Equity Market Reports</h1>
          <p class="subtitle">${year}</p>
        </header>

        <div class="quarter-section">
          <h2 class="quarter-title">Q1 ${year}</h2>
          ${q1Data.narrative ? `<p class="quarter-narrative">${q1Data.narrative}</p>` : '<p class="quarter-narrative">Narrative not yet generated</p>'}
          ${q1Data.bulletPoint ? `<div class="quarter-bullet">${q1Data.bulletPoint}</div>` : '<div class="quarter-bullet">Bullet point not yet generated</div>'}
          ${q1Data.returns ? `<div class="quarter-metrics">
            S&P 500: ${q1Data.returns.sp500}% | Nasdaq: ${q1Data.returns.nasdaq}% | MSCI ACWI: ${q1Data.returns.acwi}%
          </div>` : ''}
        </div>

        <div class="quarter-section">
          <h2 class="quarter-title">Q2 ${year}</h2>
          ${q2Data.narrative ? `<p class="quarter-narrative">${q2Data.narrative}</p>` : '<p class="quarter-narrative">Narrative not yet generated</p>'}
          ${q2Data.bulletPoint ? `<div class="quarter-bullet">${q2Data.bulletPoint}</div>` : '<div class="quarter-bullet">Bullet point not yet generated</div>'}
          ${q2Data.returns ? `<div class="quarter-metrics">
            S&P 500: ${q2Data.returns.sp500}% | Nasdaq: ${q2Data.returns.nasdaq}% | MSCI ACWI: ${q2Data.returns.acwi}%
          </div>` : ''}
        </div>

        <div class="quarter-section">
          <h2 class="quarter-title">Q3 ${year}</h2>
          ${q3Data.narrative ? `<p class="quarter-narrative">${q3Data.narrative}</p>` : '<p class="quarter-narrative">Narrative not yet generated</p>'}
          ${q3Data.bulletPoint ? `<div class="quarter-bullet">${q3Data.bulletPoint}</div>` : '<div class="quarter-bullet">Bullet point not yet generated</div>'}
          ${q3Data.returns ? `<div class="quarter-metrics">
            S&P 500: ${q3Data.returns.sp500}% | Nasdaq: ${q3Data.returns.nasdaq}% | MSCI ACWI: ${q3Data.returns.acwi}%
          </div>` : ''}
        </div>

        <div class="quarter-section">
          <h2 class="quarter-title">Q4 ${year}</h2>
          ${q4Data.narrative ? `<p class="quarter-narrative">${q4Data.narrative}</p>` : '<p class="quarter-narrative">Narrative not yet generated</p>'}
          ${q4Data.bulletPoint ? `<div class="quarter-bullet">${q4Data.bulletPoint}</div>` : '<div class="quarter-bullet">Bullet point not yet generated</div>'}
          ${q4Data.returns ? `<div class="quarter-metrics">
            S&P 500: ${q4Data.returns.sp500}% | Nasdaq: ${q4Data.returns.nasdaq}% | MSCI ACWI: ${q4Data.returns.acwi}%
          </div>` : ''}
        </div>

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

const generateAnnualReportPDF = async (report, res) => {
  try {
    console.log('[AnnualPDF] Generating PDF for year', report.year);

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    const filename = `Annual-Report-${report.year}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Title
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#1e40af');
    doc.text('Quarterly Equity Market Reports', { align: 'center' });
    
    doc.fontSize(20).fillColor('#666');
    doc.text(report.year.toString(), { align: 'center' });
    doc.moveDown(1);

    // Add a line
    doc.lineWidth(2).strokeColor('#1e40af');
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(1);

    // Generate quarters
    const quarters = ['q1', 'q2', 'q3', 'q4'];
    const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];

    quarters.forEach((quarter, index) => {
      const qData = report.data[quarter];
      const qLabel = quarterLabels[index];

      if (!qData) {
        console.log(`[AnnualPDF] Warning: No data for ${qLabel}`);
        return;
      }

      // Quarter heading
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e40af');
      doc.text(`${qLabel} ${report.year}`);
      doc.moveDown(0.5);

      // Narrative
      if (qData.narrative) {
        doc.fontSize(11).font('Helvetica').fillColor('#333');
        doc.text(qData.narrative, {
          align: 'justify',
          width: 500,
          lineGap: 5
        });
        doc.moveDown(0.5);
      }

      // Bullet point
      if (qData.bulletPoint) {
        doc.fontSize(10).font('Helvetica').fillColor('#555');
        doc.text(`• ${qData.bulletPoint}`, {
          width: 500,
          indent: 10
        });
        doc.moveDown(0.5);
      }

      // Returns metrics
      if (qData.returns) {
        doc.fontSize(9).fillColor('#999');
        doc.text(
          `Market Returns: S&P 500 ${qData.returns.sp500}% | Nasdaq ${qData.returns.nasdaq}% | MSCI ACWI ${qData.returns.acwi}%`,
          { indent: 10 }
        );
        doc.moveDown(0.5);
      }

      // Add some space between quarters
      doc.moveDown(0.5);
    });

    // Footer
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#999');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.text('This report is for informational purposes only and should not be considered investment advice.', 
      { align: 'center', width: 500 }
    );

    console.log('[AnnualPDF] ✅ PDF generation complete');
    doc.end();
  } catch (error) {
    console.error('[AnnualPDF] ❌ Error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateAnnualReportHTML,
  generateAnnualReportPDF
};