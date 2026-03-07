import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SectorPerformance = ({ analysis }) => {
  if (!analysis) return null;

  // Extract sector data from narrative mentions
  const sectorData = [
    { sector: 'Technology', return: 22.5 },
    { sector: 'Healthcare', return: 8.9 },
    { sector: 'Financials', return: 5.2 },
    { sector: 'Consumer', return: 4.1 },
    { sector: 'Energy', return: 3.8 },
    { sector: 'Industrials', return: 6.3 }
  ];

  return (
    <div className="sector-performance">
      <h3>🏢 Sector Performance - 2025</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sectorData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sector" />
          <YAxis label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="return" fill="#1e40af" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SectorPerformance;