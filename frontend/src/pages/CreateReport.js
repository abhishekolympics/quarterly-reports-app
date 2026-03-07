import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/api';
import '../styles/pages.css';

function CreateReport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    quarter: 'Q1',
    year: 2025,
    quarterNumber: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuarterChange = (e) => {
    const quarter = e.target.value;
    const quarterNumber = parseInt(quarter.replace('Q', ''));
    setFormData(prev => ({
      ...prev,
      quarter,
      quarterNumber
    }));
  };

  const handleYearChange = (e) => {
    setFormData(prev => ({
      ...prev,
      year: parseInt(e.target.value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const createdReport = await reportService.createReport({
        quarter: formData.quarter,
        year: formData.year,
        quarterNumber: formData.quarterNumber,
        data: {}
      });
      
      navigate(`/report/${createdReport._id}`);
    } catch (err) {
      console.error('Error creating report:', err);
      setError(err.response?.data?.error || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Create New Report</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>
          Select a quarter and year. Data will be automatically fetched from real financial APIs.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="report-form">
        <div className="card">
          <div className="card-header">
            <h2>Report Period</h2>
          </div>

          <div className="form-row" style={{ maxWidth: '600px' }}>
            <div className="form-group">
              <label htmlFor="quarter">Quarter</label>
              <select 
                id="quarter"
                name="quarter"
                value={formData.quarter}
                onChange={handleQuarterChange}
                style={{ fontSize: '16px', padding: '12px' }}
              >
                <option value="Q1">Q1 (January - March)</option>
                <option value="Q2">Q2 (April - June)</option>
                <option value="Q3">Q3 (July - September)</option>
                <option value="Q4">Q4 (October - December)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                id="year"
                type="number"
                name="year"
                value={formData.year}
                onChange={handleYearChange}
                min="2020"
                max="2026"
                style={{ fontSize: '16px', padding: '12px' }}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ background: '#f0f4ff', border: '2px solid #1e40af' }}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>✨ Automated Report Generation</h3>
            <p style={{ color: '#555', marginBottom: '15px', lineHeight: '1.6' }}>
              When you click "Create Report", we'll automatically fetch real market data from:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
                <strong style={{ color: '#1e40af' }}>Finnhub API</strong>
                <p style={{ fontSize: '0.9em', color: '#666', margin: '8px 0 0 0' }}>Real market indices & top performers</p>
              </div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
                <strong style={{ color: '#1e40af' }}>NewsAPI</strong>
                <p style={{ fontSize: '0.9em', color: '#666', margin: '8px 0 0 0' }}>Real market news & events</p>
              </div>
            </div>
            <p style={{ color: '#666', marginTop: '15px', fontSize: '0.95em' }}>
              No manual data entry needed. Just select the quarter and year!
            </p>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '30px' }}>
          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary btn-lg"
            style={{ padding: '15px 40px', fontSize: '16px' }}
          >
            {loading ? 'Creating Report...' : '✨ Create Report'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateReport;