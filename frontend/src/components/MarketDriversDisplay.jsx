import React from 'react';

const MarketDriversDisplay = ({ analysis }) => {
  if (!analysis) return <div>Loading...</div>;

  const { quarters, drivers } = analysis;

  const getRiskColor = (risk) => {
    if (risk === 'HIGH') return '#ef4444';
    if (risk === 'MEDIUM') return '#f59e0b';
    return '#16a34a';
  };

  const getRiskBgColor = (risk) => {
    if (risk === 'HIGH') return '#fef2f2';
    if (risk === 'MEDIUM') return '#fffbeb';
    return '#f0fdf4';
  };

  return (
    <div className="market-drivers-display">
      <h2>🚀 Market Drivers & Risk Analysis</h2>

      {/* Overall Concentration Risk */}
      <div className="risk-overview">
        <h3>Market Concentration Risk</h3>
        <div 
          className="risk-card"
          style={{ 
            borderLeft: `4px solid ${getRiskColor(drivers.overallConcentrationRisk)}`,
            background: getRiskBgColor(drivers.overallConcentrationRisk)
          }}
        >
          <div className="risk-level">
            <span className="label">Overall Risk Level:</span>
            <span 
              className="badge"
              style={{ 
                background: getRiskColor(drivers.overallConcentrationRisk),
                color: 'white'
              }}
            >
              {drivers.overallConcentrationRisk}
            </span>
          </div>
          <p className="risk-description">
            {drivers.overallConcentrationRisk === 'HIGH' && 
              'Gains concentrated in few stocks. Limited market breadth. Higher volatility risk.'}
            {drivers.overallConcentrationRisk === 'MEDIUM' && 
              'Mixed participation. Some concentration in mega-cap stocks.'}
            {drivers.overallConcentrationRisk === 'LOW' && 
              'Broad-based participation across sectors. Healthy market breadth.'}
          </p>
        </div>
      </div>

      {/* Top Movers Across Year */}
      {drivers.topMoversAcrossYear.length > 0 && (
        <div className="top-movers">
          <h3>📈 Top Stock Movers</h3>
          <div className="movers-grid">
            {drivers.topMoversAcrossYear.map((mover, idx) => (
              <div key={idx} className="mover-card">
                <div className="symbol" title={mover.fullName || mover.symbol}>
                  {mover.fullName || mover.symbol}
                </div>
                <div className={`return ${mover.return > 0 ? 'positive' : 'negative'}`}>
                  {mover.return > 0 ? '+' : ''}{mover.return}%
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend/Key */}
          <div className="movers-legend">
            <h4>Stock Symbols:</h4>
            <div className="legend-grid">
              {drivers.topMoversAcrossYear.map((mover, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-symbol">{mover.fullName || mover.symbol}</span>
                  <span className="legend-name">{mover.fullName || mover.symbol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sector Performance - Only show if there are leaders or laggards */}
      {(drivers.topSectors.leaders.length > 0 || drivers.topSectors.laggards.length > 0) && (
        <div className="sector-analysis">
          <h3>🏭 Sector Performance</h3>
          <div className="sector-grid">
            {drivers.topSectors.leaders.length > 0 && (
              <div className="sector-box">
                <h4>📈 Leaders</h4>
                <ul>
                  {drivers.topSectors.leaders.map((sector, idx) => (
                    <li key={idx} className="leader">{sector}</li>
                  ))}
                </ul>
              </div>
            )}
            {drivers.topSectors.laggards.length > 0 && (
              <div className="sector-box">
                <h4>📉 Laggards</h4>
                <ul>
                  {drivers.topSectors.laggards.map((sector, idx) => (
                    <li key={idx} className="laggard">{sector}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quarterly Drivers Breakdown */}
      <div className="quarterly-drivers">
        <h3>🎯 Quarterly Drivers</h3>
        <div className="drivers-cards">
          {quarters.map((quarter, idx) => (
            <div key={idx} className="driver-card">
              <div className="quarter-header">
                <h4>{quarter.quarter} 2025</h4>
                <span 
                  className="concentration-badge"
                  style={{ 
                    background: getRiskColor(quarter.concentration.riskLevel),
                    color: 'white'
                  }}
                >
                  {quarter.concentration.level}
                </span>
              </div>

              <div className="performance">
                <div className="perf-item">
                  <span>S&P 500:</span>
                  <strong className={quarter.sp500 > 0 ? 'positive' : 'negative'}>
                    {quarter.sp500 > 0 ? '+' : ''}{quarter.sp500}%
                  </strong>
                </div>
                <div className="perf-item">
                  <span>NASDAQ:</span>
                  <strong className={quarter.nasdaq > 0 ? 'positive' : 'negative'}>
                    {quarter.nasdaq > 0 ? '+' : ''}{quarter.nasdaq}%
                  </strong>
                </div>
              </div>

              {quarter.topMovers.length > 0 && (
                <div className="movers-section">
                  <strong className="label">Top Stocks:</strong>
                  <div className="movers-list">
                    {quarter.topMovers.map((mover, midx) => (
                      <span key={midx} className={`mover ${mover.return > 0 ? 'positive' : 'negative'}`}>
                        {mover.symbol} {mover.return > 0 ? '+' : ''}{mover.return}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="concentration-detail">
                <p className="desc">{quarter.concentration.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="driver-insights">
        <h3>💡 Key Driver Insights</h3>
        <div className="insights-list">
          <div className="insight-item">
            <span className="icon">📊</span>
            <div>
              <strong>Market Concentration:</strong>
              <p>
                {drivers.overallConcentrationRisk === 'HIGH' 
                  ? 'Year was heavily concentrated in mega-cap stocks. Limited sector diversification.'
                  : drivers.overallConcentrationRisk === 'MEDIUM'
                  ? 'Mixed market participation with some concentration in select stocks.'
                  : 'Broad-based gains across multiple sectors and stocks.'}
              </p>
            </div>
          </div>

          {drivers.topSectors.leaders.length > 0 && (
            <div className="insight-item">
              <span className="icon">🚀</span>
              <div>
                <strong>Leading Sectors:</strong>
                <p>{drivers.topSectors.leaders.join(', ')} led market performance.</p>
              </div>
            </div>
          )}

          {drivers.topMoversAcrossYear.length > 0 && (
            <div className="insight-item">
              <span className="icon">📈</span>
              <div>
                <strong>Top Performers:</strong>
                <p>
                  {drivers.topMoversAcrossYear.map(m => m.symbol).join(', ')} were the strongest performers mentioned.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketDriversDisplay;