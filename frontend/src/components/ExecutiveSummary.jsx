import React, { useEffect, useState } from 'react';

const ExecutiveSummary = ({ analysis }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (analysis?.metrics) {
      generateSummary();
    }
  }, [analysis]);

  const generateSummary = async () => {
    try {
      setLoading(true);
      const { yearTotal, metrics } = analysis;
      
      const prompt = `Write a concise 2-sentence executive summary for a 2025 equity market annual report with these key metrics:
      
      - S&P 500 annual return: ${yearTotal?.sp500 || 0}%
      - Nasdaq annual return: ${yearTotal?.nasdaq || 0}%
      - MSCI ACWI return: ${yearTotal?.acwi || 0}%
      - Best quarter: ${metrics.bestQuarter.quarter} (${metrics.bestQuarter.sp500}%)
      - Worst quarter: ${metrics.worstQuarter.quarter} (${metrics.worstQuarter.sp500}%)
      - Nasdaq outperformance vs S&P 500: ${metrics.nasdaqVsSP500}%
      
      Write it as a professional financial analyst would. Focus on the overall market trend and key takeaway. Keep it 2 sentences maximum. Do NOT include the word "summary".`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.content || 'Unable to generate summary');
    } catch (err) {
      console.error('Error generating summary:', err);
      setSummary('Summary generation temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="executive-summary">
      <h2>📋 Executive Summary</h2>
      {loading ? (
        <p className="summary-text loading">Generating AI summary...</p>
      ) : (
        <p className="summary-text">{summary}</p>
      )}
    </div>
  );
};

export default ExecutiveSummary;