import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService } from '../services/api';
import '../styles/pages.css';

function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReport(id);
      setReport(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setError(null);
      const result = await reportService.generateReport(id);
      setReport(result.report);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadHTML = () => {
    if (report?.reportHTML) {
      const element = document.createElement('a');
      const file = new Blob([report.reportHTML], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = `${report.quarter}-${report.year}-report.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${id}/pdf`);
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.quarter}-${report.year}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container">
        <div className="alert alert-error">Report not found</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>{report.quarter} {report.year} Report</h1>
          <p className="subtitle">Quarterly Equity Market Report</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            ← Back
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Report Status</h2>
            <span className={`badge badge-${report.status}`}>
              {report.status.toUpperCase()}
            </span>
          </div>
        </div>

        {report.status === 'draft' && (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ marginBottom: '1rem', fontSize: '1.1em', color: '#555' }}>
                Ready to generate your report with real financial data?
              </p>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.95em', color: '#666' }}>
                We'll automatically fetch historical data from Finnhub, Alpha Vantage, Polygon APIs, and financial news from NewsAPI.
              </p>
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="btn btn-success btn-lg"
              >
                {generating ? (
                  <>
                    <span className="spinner-sm"></span> Generating Report...
                  </>
                ) : (
                  '✨ Generate Report with Real Data'
                )}
              </button>
            </div>
          </div>
        )}

        {report.status === 'generating' && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner"></div>
            <p>Generating your report with real market data...</p>
          </div>
        )}

        {report.status === 'completed' && (
          <>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#1e40af', marginBottom: '0.5rem' }}>Executive Summary</h3>
                <p>{report.summary}</p>
              </div>

              {report.generationMetadata && (
                <div className="metadata">
                  <p><strong>Generated:</strong> {new Date(report.generationMetadata.generatedAt).toLocaleString()}</p>
                  <p><strong>Generation Time:</strong> {(report.generationMetadata.generationTime / 1000).toFixed(2)}s</p>
                </div>
              )}
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ color: '#1e40af', marginBottom: '1rem' }}>Full Report</h3>
              <div className="report-preview">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn btn-primary"
                  style={{ marginBottom: '1rem' }}
                >
                  {showPreview ? '▼ Hide Preview' : '▶ Show Preview'}
                </button>

                {showPreview && (
                  <div
                    className="html-preview"
                    dangerouslySetInnerHTML={{ __html: report.reportHTML }}
                  />
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    onClick={handleDownloadHTML}
                    className="btn btn-secondary"
                  >
                    ⬇ Download as HTML
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="btn btn-secondary"
                  >
                    📄 Download as PDF
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {report.status === 'failed' && (
          <div className="alert alert-error" style={{ margin: '1.5rem' }}>
            {report.errorMessage || 'Failed to generate report. Please try again.'}
          </div>
        )}
      </div>

      {report.status === 'completed' && report.data?.indices && (
        <div className="card">
          <div className="card-header">
            <h2>Key Market Metrics</h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div className="data-section">
              <h3>Market Indices Performance</h3>
              <p>S&P 500 Return: <strong>{report.data.indices.SP500 !== undefined ? report.data.indices.SP500 : 'N/A'}%</strong></p>
              <p>NASDAQ Return: <strong>{report.data.indices.NASDAQ !== undefined ? report.data.indices.NASDAQ : 'N/A'}%</strong></p>
              <p>MSCI ACWI Return: <strong>{report.data.indices.ACWI !== undefined ? report.data.indices.ACWI : 'N/A'}%</strong></p>
              <p>Record Highs: <strong>{report.data.indices.SP500RecordHighs || 'N/A'}</strong></p>
            </div>

            {report.data.majorNews && report.data.majorNews.length > 0 && (
              <div className="data-section">
                <h3>Major Market News</h3>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  {report.data.majorNews.map((news, i) => (
                    <li key={i}>{news}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="data-section" style={{ marginTop: '1rem', padding: '1rem', background: '#f0f4ff', borderRadius: '6px' }}>
              <h3>Data Source</h3>
              <p style={{ fontSize: '0.95em', color: '#666' }}>
                {report.data.fetchedFrom || 'Finnhub + AlphaVantage + Polygon + NewsAPI'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportDetail;