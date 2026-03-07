import React from 'react';

const DataSourcesCard = ({ report }) => {
  const generatedDate = new Date(report?.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="data-sources-card">
      <h3>📊 Data Sources & Transparency</h3>
      <div className="sources-grid">
        <div className="source-item">
          <span className="source-label">Market Data</span>
          <span className="source-value">Finnhub + AlphaVantage</span>
        </div>
        <div className="source-item">
          <span className="source-label">News & Events</span>
          <span className="source-value">NewsAPI</span>
        </div>
        <div className="source-item">
          <span className="source-label">Analysis Layer</span>
          <span className="source-value">Google Gemini AI</span>
        </div>
        <div className="source-item">
          <span className="source-label">Generated</span>
          <span className="source-value">{generatedDate}</span>
        </div>
      </div>
      <p className="data-disclaimer">
        This report combines real market data with AI-generated analysis. Data accuracy depends on source API availability.
      </p>
    </div>
  );
};

export default DataSourcesCard;