import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { reportService } from '../services/api';
import ExecutiveSummary from '../components/ExecutiveSummary';
import DataSourcesCard from '../components/DataSourcesCard';
import ResearchCopilot from '../components/ResearchCopilot';
import '../styles/analyticsPage.css';

const ReportAnalytics = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await reportService.getReport(id);
        setReport(data);
        
        // Analyze the quarterly report
        const analyzedData = analyzeQuarterlyReport(data);
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

  const analyzeQuarterlyReport = (reportData) => {
    if (!reportData || !reportData.data) return null;

    const { data } = reportData;
    const indices = data.indices || {};

    return {
      quarter: reportData.quarter,
      year: reportData.year,
      metrics: {
        sp500: indices.SP500 || 0,
        nasdaq: indices.NASDAQ || 0,
        acwi: indices.ACWI || 0,
        recordHighs: indices.SP500RecordHighs || 0,
        spread: Math.abs((indices.NASDAQ || 0) - (indices.SP500 || 0))
      },
      narrative: reportData.narrative || '',
      summary: reportData.summary || '',
      majorNews: data.majorNews || [],
      fetchedFrom: data.fetchedFrom || '',
      // Add drivers for copilot compatibility
      drivers: {
        overallConcentrationRisk: 'MEDIUM',
        topMoversAcrossYear: [],
        topSectors: {
          leaders: [],
          laggards: []
        }
      }
    };
  };

  if (loading) return <div className="analytics-page"><div className="loading">Loading...</div></div>;
  if (error) return <div className="analytics-page"><div className="error">{error}</div></div>;
  if (!report) return <div className="analytics-page"><div className="error">Report not found</div></div>;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>📈 Quarterly Report Analytics</h1>
        <p className="subtitle">{report.quarter} {report.year}</p>
      </div>

      <ExecutiveSummary analysis={analysis} />

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'narrative' ? 'active' : ''}`}
          onClick={() => setActiveTab('narrative')}
        >
          📝 Narrative
        </button>
        <button 
          className={`tab ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          📰 News
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab analysis={analysis} />}
        {activeTab === 'narrative' && <NarrativeTab analysis={analysis} />}
        {activeTab === 'news' && <NewsTab analysis={analysis} />}
      </div>

      <DataSourcesCard report={report} />
      <ResearchCopilot analysis={analysis} report={report} />
    </div>
  );
};

// Overview Tab Component - EXPANDED
const OverviewTab = ({ analysis }) => {
  if (!analysis) return <div>Loading...</div>;

  return (
    <div className="analytics-display">
      <h2>📊 Market Performance</h2>

      {/* Performance Metrics - LARGER CARDS */}
      <div className="metrics-grid">
        <div className="metric-card">
          <label>S&P 500</label>
          <div className={`value ${analysis.metrics.sp500 > 0 ? 'positive' : 'negative'}`}>
            {analysis.metrics.sp500 > 0 ? '+' : ''}{analysis.metrics.sp500}%
          </div>
          <p className="metric-detail">Large-cap performance</p>
        </div>
        <div className="metric-card">
          <label>NASDAQ</label>
          <div className={`value ${analysis.metrics.nasdaq > 0 ? 'positive' : 'negative'}`}>
            {analysis.metrics.nasdaq > 0 ? '+' : ''}{analysis.metrics.nasdaq}%
          </div>
          <p className="metric-detail">Tech-heavy index</p>
        </div>
        <div className="metric-card">
          <label>MSCI ACWI</label>
          <div className={`value ${analysis.metrics.acwi > 0 ? 'positive' : 'negative'}`}>
            {analysis.metrics.acwi > 0 ? '+' : ''}{analysis.metrics.acwi}%
          </div>
          <p className="metric-detail">Global performance</p>
        </div>
        <div className="metric-card">
          <label>Performance Spread</label>
          <div className="value">{analysis.metrics.spread.toFixed(2)}%</div>
          <p className="metric-detail">NASDAQ vs S&P 500</p>
        </div>
      </div>

      {/* Performance Comparison Cards */}
      <div className="quarters-comparison">
        <div className="quarter-box">
          <h3>📈 {analysis.quarter} {analysis.year} Summary</h3>
          <p>S&P 500: <strong className={analysis.metrics.sp500 > 0 ? 'positive' : 'negative'}>
            {analysis.metrics.sp500 > 0 ? '+' : ''}{analysis.metrics.sp500}%
          </strong></p>
          <p>NASDAQ: <strong className={analysis.metrics.nasdaq > 0 ? 'positive' : 'negative'}>
            {analysis.metrics.nasdaq > 0 ? '+' : ''}{analysis.metrics.nasdaq}%
          </strong></p>
          <p>MSCI ACWI: <strong className={analysis.metrics.acwi > 0 ? 'positive' : 'negative'}>
            {analysis.metrics.acwi > 0 ? '+' : ''}{analysis.metrics.acwi}%
          </strong></p>
        </div>
      </div>

      {/* Key Insights */}
      <div className="insights">
        <h3>💡 Key Insights</h3>
        <ul>
          <li><strong>S&P 500:</strong> {analysis.metrics.sp500 > 0 ? 'Positive' : 'Negative'} quarter with {Math.abs(analysis.metrics.sp500)}% return</li>
          <li><strong>NASDAQ Performance:</strong> {analysis.metrics.nasdaq > 0 ? 'Outperformed' : 'Underperformed'} with {Math.abs(analysis.metrics.nasdaq)}% return</li>
          <li><strong>Spread:</strong> {analysis.metrics.spread.toFixed(2)}% difference between NASDAQ and S&P 500</li>
          <li><strong>Record Highs:</strong> S&P 500 reached {analysis.metrics.recordHighs} new highs this quarter</li>
          <li><strong>International Performance:</strong> MSCI ACWI returned {Math.abs(analysis.metrics.acwi)}%, indicating {'global market participation' || 'divergence from domestic markets'}</li>
        </ul>
      </div>
    </div>
  );
};

// Narrative Tab Component - LARGER
const NarrativeTab = ({ analysis }) => {
  if (!analysis) return <div>Loading...</div>;

  return (
    <div className="narrative-display">
      <h2>📝 Market Narrative</h2>
      
      <div className="narrative-box">
        <h3>Executive Summary</h3>
        <p>{analysis.summary || 'No summary available'}</p>
      </div>

      <div className="narrative-box">
        <h3>Detailed Analysis</h3>
        <p>{analysis.narrative || 'No narrative available'}</p>
      </div>
    </div>
  );
};

// News Tab Component - LARGER
const NewsTab = ({ analysis }) => {
  if (!analysis) return <div>Loading...</div>;

  return (
    <div className="news-display">
      <h2>📰 Market Context & News</h2>

      {analysis.majorNews && analysis.majorNews.length > 0 ? (
        <div className="news-list">
          {analysis.majorNews.map((news, idx) => (
            <div key={idx} className="news-item">
              <div className="news-number">{idx + 1}</div>
              <div className="news-content">
                <p>{news}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <p className="text-center">No major news events recorded for this period.</p>
        </div>
      )}

      <div className="data-sources-card" style={{ marginTop: '24px' }}>
        <h3>📊 Data Source</h3>
        <p>{analysis.fetchedFrom || 'Finnhub, Alpha Vantage, Polygon, and NewsAPI'}</p>
      </div>
    </div>
  );
};

export default ReportAnalytics;