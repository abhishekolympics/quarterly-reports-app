import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const YearComparison = ({ currentYear = 2025 }) => {
  // Mock historical data - in real scenario, fetch from backend
  const comparisonData = [
    { metric: 'S&P 500', 2023: 24.23, 2024: 21.54, 2025: 26.84 },
    { metric: 'Nasdaq', 2023: 43.04, 2024: 28.25, 2025: 37.57 },
    { metric: 'MSCI ACWI', 2023: 19.84, 2024: 15.32, 2025: 18.48 }
  ];

  const [selectedMetric, setSelectedMetric] = useState('S&P 500');

  const selectedData = comparisonData.find(d => d.metric === selectedMetric);

  const chartData = [
    { year: '2023', value: selectedData['2023'] },
    { year: '2024', value: selectedData['2024'] },
    { year: '2025', value: selectedData['2025'] }
  ];

  return (
    <div className="year-comparison">
      <h3>📈 Year-over-Year Performance</h3>
      
      <div className="metric-selector">
        {comparisonData.map(item => (
          <button
            key={item.metric}
            className={`metric-btn ${selectedMetric === item.metric ? 'active' : ''}`}
            onClick={() => setSelectedMetric(item.metric)}
          >
            {item.metric}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#1e40af" 
            strokeWidth={3}
            dot={{ fill: '#1e40af', r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="comparison-stats">
        <div className="stat">
          <span>2023:</span>
          <strong>{selectedData['2023']}%</strong>
        </div>
        <div className="stat">
          <span>2024:</span>
          <strong>{selectedData['2024']}%</strong>
        </div>
        <div className="stat">
          <span>2025:</span>
          <strong className="highlight">{selectedData['2025']}%</strong>
        </div>
      </div>
    </div>
  );
};

export default YearComparison;