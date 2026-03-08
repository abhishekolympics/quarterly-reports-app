import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/api';
import axios from 'axios';
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
      
      // 1. Fetch data from your service
      const data = await reportService.getAllReports();

      // 2. Check the "shape" of the data before setting state
      // If the backend returns { quarterly: [...], annual: [...] }
      if (data && data.quarterly) {
        setQuarterlyReports(data.quarterly);
      } else if (Array.isArray(data)) {
        // Fallback if it's already an array
        setQuarterlyReports(data);
      }

      // 3. Fetch annual reports using the full URL to be safe
      const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://quarterly-reports-app.onrender.com';
      const annualResponse = await axios.get(`${API_URL}/annual-reports`);
      
      // Ensure we only set state if the response is an array
      setAnnualReports(Array.isArray(annualResponse.data) ? annualResponse.data : []);
      
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
        await axios.delete(`/api/annual-reports/${id}`);
        setAnnualReports(annualReports.filter(r => r._id !== id));
      } catch (err) {
        console.error('Error deleting annual report:', err);
        setError('Failed to delete annual report');
      }
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
                    <Link to={`/annual-reports/${report._id}/analytics`} className="btn btn-sm btn-primary">
                      View
                    </Link>
                    <a href={`/api/annual-reports/${report._id}/pdf`} className="btn btn-sm btn-secondary">
                      Download
                    </a>
                    <button 
                      onClick={() => handleDeleteAnnual(report._id)} 
                      className="btn btn-sm btn-danger"
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
                    <Link to={`/report/${report._id}`} className="btn btn-sm btn-primary">
                      View
                    </Link>
                    <Link to={`/report/${report._id}/analytics`} className="btn btn-sm btn-secondary">
                      Analytics
                    </Link>
                    <button 
                      onClick={() => handleDeleteQuarterly(report._id)} 
                      className="btn btn-sm btn-danger"
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