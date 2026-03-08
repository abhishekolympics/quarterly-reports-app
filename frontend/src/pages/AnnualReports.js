import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/api';
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
      const data = await reportService.getAllAnnualReports();
      setReports(Array.isArray(data) ? data : []);
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
      const createResponse = await reportService.createAnnualReport({ year: selectedYear });
      const reportId = createResponse._id;

      const generateResponse = await reportService.generateAnnualReport(reportId);

      if (generateResponse) {
        setSuccess(`Annual report for ${selectedYear} generated successfully!`);
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

  const handleViewHTML = async (id) => {
    try {
      setError('');
      const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://quarterly-reports-app.onrender.com/api';
      const response = await fetch(`${API_URL}/annual-reports/${id}/html`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch HTML`);
      }
      
      const htmlContent = await response.text();
      
      if (!htmlContent || htmlContent.length === 0) {
        throw new Error('HTML content is empty');
      }
      
      const newWindow = window.open('', '_blank');
      if (!newWindow) {
        throw new Error('Could not open new window. Pop-ups may be blocked.');
      }
      
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    } catch (err) {
      console.error('Error viewing HTML:', err);
      setError(`Failed to load HTML report: ${err.message}`);
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      setError('');
      const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://quarterly-reports-app.onrender.com/api';
      const response = await fetch(`${API_URL}/annual-reports/${id}/pdf`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch PDF`);
      }
      
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('PDF is empty');
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `annual-report-${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError(`Failed to download PDF: ${err.message}`);
    }
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this annual report?')) {
      try {
        await reportService.deleteAnnualReport(id);
        setSuccess('Report deleted successfully');
        fetchReports();
      } catch (err) {
        console.error('Error deleting report:', err);
        setError('Failed to delete report');
      }
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
                    <Link 
                      to={`/annual-reports/${report._id}/analytics`} 
                      className="btn-analytics"
                    >
                      View Analytics
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => handleDeleteReport(report._id)}
                  className="btn-delete"
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Delete
                </button>

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