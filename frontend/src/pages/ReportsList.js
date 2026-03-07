import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/api';
import '../styles/pages.css';

function ReportsList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getAllReports();
      setReports(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportService.deleteReport(id);
        setReports(reports.filter(r => r._id !== id));
      } catch (err) {
        console.error('Error deleting report:', err);
        setError('Failed to delete report');
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
        <Link to="/create" className="btn btn-primary">
          + Create New Report
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {reports.length === 0 ? (
        <div className="card">
          <p className="text-center">No reports yet. <Link to="/create">Create one now!</Link></p>
        </div>
      ) : (
        <div className="grid">
          {reports.map(report => (
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
                  <button 
                    onClick={() => handleDelete(report._id)} 
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
  );
}

export default ReportsList;
