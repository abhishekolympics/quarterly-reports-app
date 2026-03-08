import React, { useEffect, useState, useCallback } from 'react';

const ExecutiveSummary = ({ analysis }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  const generateSummary = useCallback(async () => {
    try {
      setLoading(true);

      // Check if it's a quarterly or annual report
      const isQuarterly = analysis.quarter && !analysis.metrics?.yearTotal;
      
      let prompt = '';

      if (isQuarterly) {
        // Quarterly report summary
        prompt = `Write a concise 2-sentence executive summary for a quarterly market report with these metrics:
        
        - Quarter: ${analysis.quarter} ${analysis.year}
        - S&P 500 return: ${analysis.metrics.sp500}%
        - Nasdaq return: ${analysis.metrics.nasdaq}%
        - MSCI ACWI return: ${analysis.metrics.acwi}%
        - Performance spread: ${analysis.metrics.spread}%
        
        Write it as a professional financial analyst would. Focus on the quarterly trend and key takeaway. Keep it 2 sentences maximum. Do NOT include the word "summary".`;
      } else {
        // Annual report summary
        prompt = `Write a concise 2-sentence executive summary for a 2025 equity market annual report with these key metrics:
        
        - S&P 500 annual return: ${analysis.metrics.yearTotal?.sp500 || 0}%
        - Nasdaq annual return: ${analysis.metrics.yearTotal?.nasdaq || 0}%
        - MSCI ACWI return: ${analysis.metrics.yearTotal?.acwi || 0}%
        - Best quarter: ${analysis.metrics.bestQuarter?.quarter} (${analysis.metrics.bestQuarter?.sp500}%)
        - Worst quarter: ${analysis.metrics.worstQuarter?.quarter} (${analysis.metrics.worstQuarter?.sp500}%)
        - Nasdaq outperformance vs S&P 500: ${analysis.metrics.nasdaqVsSP500}%
        
        Write it as a professional financial analyst would. Focus on the overall market trend and key takeaway. Keep it 2 sentences maximum. Do NOT include the word "summary".`;
      }

      const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://quarterly-reports-app.onrender.com/api';
      const response = await fetch(`${API_URL}/gemini/generate`, {
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
  }, [analysis]);

  useEffect(() => {
    if (analysis) {
      generateSummary();
    }
  }, [analysis, generateSummary]);

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