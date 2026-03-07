import React from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';

const ChartsDisplay = ({ analysis }) => {
  if (!analysis) return <div>Loading...</div>;

  const { quarters, metrics } = analysis;

  return (
    <div className="charts-display">
      <h2>📈 Charts & Visualizations</h2>

      {/* Chart 1: Quarterly Performance */}
      <div className="chart-card">
        <h3>Index Performance by Quarter</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={quarters}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="quarter" />
            <YAxis label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
            <Legend />
            <Line type="monotone" dataKey="sp500" stroke="#2563eb" strokeWidth={2} name="S&P 500" />
            <Line type="monotone" dataKey="nasdaq" stroke="#7c3aed" strokeWidth={2} name="NASDAQ" />
            <Line type="monotone" dataKey="acwi" stroke="#16a34a" strokeWidth={2} name="MSCI ACWI" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: S&P 500 Quarterly Comparison */}
      <div className="chart-card">
        <h3>S&P 500 Quarterly Returns</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={quarters}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="quarter" />
            <YAxis label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
            <Bar dataKey="sp500" fill="#2563eb" radius={[4, 4, 0, 0]}>
              {quarters.map((q, idx) => (
                <Cell key={idx} fill={q.sp500 > 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: NASDAQ Quarterly Comparison */}
      <div className="chart-card">
        <h3>NASDAQ Quarterly Returns</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={quarters}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="quarter" />
            <YAxis label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
            <Bar dataKey="nasdaq" fill="#7c3aed" radius={[4, 4, 0, 0]}>
              {quarters.map((q, idx) => (
                <Cell key={idx} fill={q.nasdaq > 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 4: Index Comparison */}
      <div className="chart-card">
        <h3>Index Comparison - Year Total</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { index: 'S&P 500', return: parseFloat(metrics.yearTotal.sp500) },
            { index: 'NASDAQ', return: parseFloat(metrics.yearTotal.nasdaq) },
            { index: 'MSCI ACWI', return: parseFloat(metrics.yearTotal.acwi) }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="index" />
            <YAxis label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
            <Bar dataKey="return" fill="#2563eb" radius={[4, 4, 0, 0]}>
              {[0, 1, 2].map((idx) => (
                <Cell 
                  key={idx} 
                  fill={[metrics.yearTotal.sp500, metrics.yearTotal.nasdaq, metrics.yearTotal.acwi][idx] > 0 ? '#10b981' : '#ef4444'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartsDisplay;