import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AnalyticsDisplay from '../components/AnalyticsDisplay';
import ChartsDisplay from '../components/ChartsDisplay';
import MarketDriversDisplay from '../components/MarketDriversDisplay';
import ExecutiveSummary from '../components/ExecutiveSummary';
import DataSourcesCard from '../components/DataSourcesCard';
import ResearchCopilot from '../components/ResearchCopilot';
import { analyzeAnnualReport } from '../components/MarketAnalytics';
import '../styles/analyticsPage.css';

const AnnualReportAnalytics = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/annual-reports/${id}`);
        setReport(response.data);
        
        const analyzedData = analyzeAnnualReport(response.data);
        setAnalysis(analyzedData);
      } catch (err) {
        setError('Failed to load report');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) return <div className="analytics-page"><div className="loading">Loading...</div></div>;
  if (error) return <div className="analytics-page"><div className="error">{error}</div></div>;
  if (!report) return <div className="analytics-page"><div className="error">Report not found</div></div>;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>📊 Annual Report Analytics</h1>
        <p className="subtitle">Year {report.year}</p>
      </div>
      
      <ExecutiveSummary analysis={analysis} />

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'drivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('drivers')}
        >
          🚀 Market Drivers
        </button>
        <button 
          className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          📊 Charts
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'analytics' && <AnalyticsDisplay analysis={analysis} />}
        {activeTab === 'drivers' && <MarketDriversDisplay analysis={analysis} />}
        {activeTab === 'charts' && <ChartsDisplay analysis={analysis} />}
      </div>

      <DataSourcesCard report={report} />
      
      <ResearchCopilot analysis={analysis} report={report} />
    </div>
  );
};

export default AnnualReportAnalytics;