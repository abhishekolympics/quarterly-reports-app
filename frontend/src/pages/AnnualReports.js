import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnnualReports.css';

const AnnualReports = () => {
  const [reports, setReports] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/annual-reports');
      setReports(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports');
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create annual report
      const createResponse = await axios.post('/api/annual-reports', { year: selectedYear });
      const reportId = createResponse.data._id;

      // Generate report
      const generateResponse = await axios.post(`/api/annual-reports/${reportId}/generate`);

      if (generateResponse.data) {
        setSuccess(`Annual report for ${selectedYear} generated successfully!`);
        // Refresh list
        fetchReports();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error generating report';
      setError(errorMsg);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Use fetch to bypass React Router
  const handleViewHTML = async (id) => {
    try {
      setError('');
      console.log(`[AnnualReports] Fetching HTML for report ${id}`);
      
      // Fetch HTML as text
      const response = await fetch(`/api/annual-reports/${id}/html`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch HTML`);
      }
      
      const htmlContent = await response.text();
      console.log(`[AnnualReports] Received HTML: ${htmlContent.length} bytes`);
      
      if (!htmlContent || htmlContent.length === 0) {
        throw new Error('HTML content is empty');
      }
      
      // Create a new window and write HTML
      const newWindow = window.open('', '_blank');
      if (!newWindow) {
        throw new Error('Could not open new window. Pop-ups may be blocked.');
      }
      
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      console.log('[AnnualReports] HTML opened in new window');
    } catch (err) {
      console.error('Error viewing HTML:', err);
      setError(`Failed to load HTML report: ${err.message}`);
    }
  };

  // FIXED: Use fetch to bypass React Router
  const handleDownloadPDF = async (id) => {
    try {
      setError('');
      console.log(`[AnnualReports] Downloading PDF for report ${id}`);
      
      // Fetch PDF as blob
      const response = await fetch(`/api/annual-reports/${id}/pdf`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch PDF`);
      }
      
      const blob = await response.blob();
      console.log(`[AnnualReports] Received PDF: ${blob.size} bytes`);
      
      if (blob.size === 0) {
        throw new Error('PDF is empty');
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `annual-report-${new Date().getFullYear()}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log('[AnnualReports] PDF download started');
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError(`Failed to download PDF: ${err.message}`);
    }
  };

  const availableYears = [2024, 2025, 2026];

  return (
    <div className="annual-reports-container">
      <div className="header">
        <h1>Annual Equity Market Reports</h1>
        <p>Generate comprehensive yearly market analysis</p>
      </div>

      <div className="generate-section">
        <div className="form-group">
          <label htmlFor="year">Select Year:</label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            disabled={loading}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="btn-generate"
        >
          {loading ? 'Generating...' : 'Generate Annual Report'}
        </button>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>

      <div className="reports-list">
        <h2>Generated Reports</h2>

        {reports.length === 0 ? (
          <p className="no-reports">No annual reports generated yet.</p>
        ) : (
          <div className="reports-grid">
            {reports.map(report => (
              <div key={report._id} className="report-card">
                <h3>{report.year}</h3>
                <p className={`status status-${report.status}`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </p>

                {report.status === 'completed' && (
                  <div className="actions">
                    <button
                      onClick={() => handleViewHTML(report._id)}
                      className="btn-view"
                    >
                      View HTML
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(report._id)}
                      className="btn-download"
                    >
                      Download PDF
                    </button>
                  </div>
                )}

                <p className="timestamp">
                  Generated: {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnualReports;