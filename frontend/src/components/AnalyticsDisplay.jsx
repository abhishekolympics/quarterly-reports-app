import React from 'react';
import SectorPerformance from './SectorPerformance';
import '../styles/analyticsPage.css';


const AnalyticsDisplay = ({ analysis }) => {
  if (!analysis) return <div>Loading...</div>;

  const { quarters, metrics } = analysis;

  return (
    <div className="analytics-display">
      <h2>📊 Market Analytics</h2>

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <label>Average S&P 500</label>
          <div className={`value ${metrics.avgSP500 > 0 ? 'positive' : 'negative'}`}>
            {metrics.avgSP500 > 0 ? '+' : ''}{metrics.avgSP500}%
          </div>
        </div>
        <div className="metric-card">
          <label>Average NASDAQ</label>
          <div className={`value ${metrics.avgNASDAQ > 0 ? 'positive' : 'negative'}`}>
            {metrics.avgNASDAQ > 0 ? '+' : ''}{metrics.avgNASDAQ}%
          </div>
        </div>
        <div className="metric-card">
          <label>Year Total S&P 500</label>
          <div className={`value ${metrics.yearTotal.sp500 > 0 ? 'positive' : 'negative'}`}>
            {metrics.yearTotal.sp500 > 0 ? '+' : ''}{metrics.yearTotal.sp500}%
          </div>
        </div>
        <div className="metric-card">
          <label>Performance Spread</label>
          <div className="value">{metrics.sp500Spread}%</div>
        </div>
      </div>

      <SectorPerformance analysis={analysis} />

      {/* Best & Worst Quarter */}
      <div className="quarters-comparison">
        <div className="quarter-box best">
          <h3>✅ Best Quarter: {metrics.bestQuarter.quarter}</h3>
          <p>S&P 500: <strong className="positive">+{metrics.bestQuarter.sp500}%</strong></p>
          <p>NASDAQ: <strong className="positive">+{metrics.bestQuarter.nasdaq}%</strong></p>
        </div>
        <div className="quarter-box worst">
          <h3>⚠️ Worst Quarter: {metrics.worstQuarter.quarter}</h3>
          <p>S&P 500: <strong className={metrics.worstQuarter.sp500 > 0 ? 'positive' : 'negative'}>
            {metrics.worstQuarter.sp500 > 0 ? '+' : ''}{metrics.worstQuarter.sp500}%
          </strong></p>
          <p>NASDAQ: <strong className={metrics.worstQuarter.nasdaq > 0 ? 'positive' : 'negative'}>
            {metrics.worstQuarter.nasdaq > 0 ? '+' : ''}{metrics.worstQuarter.nasdaq}%
          </strong></p>
        </div>
      </div>

      {/* Quarterly Breakdown */}
      <div className="quarterly-table">
        <h3>📈 Quarterly Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Quarter</th>
              <th>S&P 500</th>
              <th>NASDAQ</th>
              <th>MSCI ACWI</th>
            </tr>
          </thead>
          <tbody>
            {quarters.map((q, idx) => (
              <tr key={idx}>
                <td><strong>{q.quarter}</strong></td>
                <td className={q.sp500 > 0 ? 'positive' : 'negative'}>
                  {q.sp500 > 0 ? '+' : ''}{q.sp500}%
                </td>
                <td className={q.nasdaq > 0 ? 'positive' : 'negative'}>
                  {q.nasdaq > 0 ? '+' : ''}{q.nasdaq}%
                </td>
                <td className={q.acwi > 0 ? 'positive' : 'negative'}>
                  {q.acwi > 0 ? '+' : ''}{q.acwi}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Insights */}
      <div className="insights">
        <h3>💡 Key Insights</h3>
        <ul>
          <li><strong>NASDAQ Outperformance:</strong> NASDAQ averaged {metrics.nasdaqVsSP500}% more than S&P 500</li>
          <li><strong>Year Range:</strong> Performance spread of {metrics.sp500Spread}% between best and worst quarter</li>
          <li><strong>Trend:</strong> {metrics.yearTotal.sp500 > 0 ? 'Positive year' : 'Negative year'} with {metrics.yearTotal.sp500}% total return</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsDisplay;