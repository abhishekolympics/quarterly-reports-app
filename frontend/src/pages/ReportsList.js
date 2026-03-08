import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/api';
import '../styles/pages.css';

function ReportsList() {
  const [quarterlyReports, setQuarterlyReports] = useState([]);
  const [annualReports, setAnnualReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      
      // Fetch quarterly reports
      const quarterlyData = await reportService.getAllReports();
      setQuarterlyReports(Array.isArray(quarterlyData) ? quarterlyData : []);

      // Fetch annual reports
      const annualData = await reportService.getAllAnnualReports();
      setAnnualReports(Array.isArray(annualData) ? annualData : []);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuarterly = async (id) => {
    if (window.confirm('Are you sure you want to delete this quarterly report?')) {
      try {
        await reportService.deleteReport(id);
        setQuarterlyReports(quarterlyReports.filter(r => r._id !== id));
      } catch (err) {
        console.error('Error deleting report:', err);
        setError('Failed to delete quarterly report');
      }
    }
  };

  const handleDeleteAnnual = async (id) => {
    if (window.confirm('Are you sure you want to delete this annual report?')) {
      try {
        await reportService.deleteAnnualReport(id);
        setAnnualReports(annualReports.filter(r => r._id !== id));
      } catch (err) {
        console.error('Error deleting annual report:', err);
        setError('Failed to delete annual report');
      }
    }
  };

  const handleDownloadAnnualPDF = async (id, year) => {
    try {
      const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://quarterly-reports-app.onrender.com/api';
      const response = await fetch(`${API_URL}/annual-reports/${id}/pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `annual-report-${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
    }
  };

  const handleViewAnnualHTML = async (id) => {
    try {
      const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://quarterly-reports-app.onrender.com/api';
      const response = await fetch(`${API_URL}/annual-reports/${id}/html`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch HTML');
      }
      
      const htmlContent = await response.text();
      
      const newWindow = window.open('', '_blank');
      if (!newWindow) {
        throw new Error('Could not open new window. Pop-ups may be blocked.');
      }
      
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    } catch (err) {
      console.error('Error viewing HTML:', err);
      alert('Failed to load report');
    }
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status}`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Reports Dashboard</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ANNUAL REPORTS SECTION */}
      <div className="reports-section">
        <div className="section-header">
          <h2>📊 Annual Reports</h2>
          <Link to="/annual-reports" className="btn btn-primary">
            + Create New Annual Report
          </Link>
        </div>

        {annualReports.length === 0 ? (
          <div className="card">
            <p className="text-center">No annual reports yet. <Link to="/annual-reports">Create one now!</Link></p>
          </div>
        ) : (
          <div className="grid">
            {annualReports.map(report => (
              <div key={report._id} className="card report-card">
                <div className="card-header">
                  <h3>{report.year}</h3>
                </div>
                <div className="report-card-body">
                  <div className="report-status">
                    <span className={getStatusBadgeClass(report.status)}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                  {report.createdAt && (
                    <div className="report-metadata">
                      <small>
                        Generated: {new Date(report.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  )}
                  <div className="report-actions">
                    <button 
                      onClick={() => handleViewAnnualHTML(report._id)}
                      className="btn btn-sm btn-primary"
                      title="View full report"
                    >
                      View Report
                    </button>
                    <Link 
                      to={`/annual-reports/${report._id}/analytics`} 
                      className="btn btn-sm btn-secondary"
                      title="View analytics dashboard"
                    >
                      Analytics
                    </Link>
                    <button 
                      onClick={() => handleDownloadAnnualPDF(report._id, report.year)}
                      className="btn btn-sm btn-secondary"
                      title="Download PDF"
                    >
                      Download
                    </button>
                    <button 
                      onClick={() => handleDeleteAnnual(report._id)} 
                      className="btn btn-sm btn-danger"
                      title="Delete report"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUARTERLY REPORTS SECTION */}
      <div className="reports-section">
        <div className="section-header">
          <h2>📈 Quarterly Reports</h2>
          <Link to="/create" className="btn btn-primary">
            + Create New Quarterly Report
          </Link>
        </div>

        {quarterlyReports.length === 0 ? (
          <div className="card">
            <p className="text-center">No quarterly reports yet. <Link to="/create">Create one now!</Link></p>
          </div>
        ) : (
          <div className="grid">
            {quarterlyReports.map(report => (
              <div key={report._id} className="card report-card">
                <div className="card-header">
                  <h3>{report.quarter} {report.year}</h3>
                </div>
                <div className="report-card-body">
                  <p className="report-title">{report.title}</p>
                  <div className="report-status">
                    <span className={getStatusBadgeClass(report.status)}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                  {report.generationMetadata && (
                    <div className="report-metadata">
                      <small>
                        Generated: {new Date(report.generationMetadata.generatedAt).toLocaleDateString()}
                      </small>
                    </div>
                  )}
                  <div className="report-actions">
                    <Link 
                      to={`/report/${report._id}`} 
                      className="btn btn-sm btn-primary"
                      title="View full report"
                    >
                      View Report
                    </Link>
                    <Link 
                      to={`/report/${report._id}/analytics`} 
                      className="btn btn-sm btn-secondary"
                      title="View analytics dashboard"
                    >
                      Analytics
                    </Link>
                    <a 
                      href={`${process.env.REACT_APP_API_BASE_URL || 'https://quarterly-reports-app.onrender.com/api'}/reports/${report._id}/pdf`}
                      className="btn btn-sm btn-secondary"
                      title="Download PDF"
                      download
                    >
                      Download
                    </a>
                    <button 
                      onClick={() => handleDeleteQuarterly(report._id)} 
                      className="btn btn-sm btn-danger"
                      title="Delete report"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsList;