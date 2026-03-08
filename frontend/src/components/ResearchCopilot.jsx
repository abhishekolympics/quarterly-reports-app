import React, { useState, useRef, useEffect } from 'react';

const ResearchCopilot = ({ analysis, report }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi! I\'m your research copilot. Ask me anything about this market report. For example: "Why did Nasdaq outperform?", "What was the best quarter?", or "Which sectors led the market?"'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAnswer = async (question) => {
    try {
      setLoading(true);

      // Check if it's quarterly or annual report
      const isQuarterly = analysis.quarter && !analysis.metrics?.yearTotal;
      
      let context = '';

      if (isQuarterly) {
        // Quarterly report context
        context = `
          You are a financial research analyst. Answer the user's question about this quarterly market report:

          **Quarter:** ${analysis.quarter} ${analysis.year}

          **Key Metrics:**
          - S&P 500 Return: ${analysis.metrics.sp500}%
          - Nasdaq Return: ${analysis.metrics.nasdaq}%
          - MSCI ACWI Return: ${analysis.metrics.acwi}%
          - Performance Spread: ${analysis.metrics.spread.toFixed(2)}%
          - Record Highs: S&P 500 reached ${analysis.metrics.recordHighs} new highs

          **Narrative:**
          ${analysis.narrative}

          **Summary:**
          ${analysis.summary}

          **Major News Events:**
          ${analysis.majorNews && analysis.majorNews.length > 0 ? analysis.majorNews.join(', ') : 'No major news recorded'}

          User Question: "${question}"

          Provide a concise, insightful answer (2-3 sentences) based on the quarterly data above.
                `;
              } else {
                // Annual report context
                context = `
          You are a financial research analyst. Answer the user's question about this annual market report:

          **Year:** ${analysis.metrics.yearTotal ? '2025' : 'Current Year'}

          **Annual Metrics:**
          - S&P 500 Annual Return: ${analysis.metrics.yearTotal?.sp500 || 0}%
          - Nasdaq Annual Return: ${analysis.metrics.yearTotal?.nasdaq || 0}%
          - MSCI ACWI Return: ${analysis.metrics.yearTotal?.acwi || 0}%
          - Nasdaq Outperformance: ${analysis.metrics.nasdaqVsSP500}%
          - Best Quarter: ${analysis.metrics.bestQuarter?.quarter} (${analysis.metrics.bestQuarter?.sp500}%)
          - Worst Quarter: ${analysis.metrics.worstQuarter?.quarter} (${analysis.metrics.worstQuarter?.sp500}%)

          **Quarterly Breakdown:**
          ${analysis.quarters?.map(q => `${q.quarter}: S&P ${q.sp500}%, Nasdaq ${q.nasdaq}%, MSCI ACWI ${q.acwi}%`).join('\n') || 'No quarterly data'}

          **Market Drivers:**
          - Overall Concentration Risk: ${analysis.drivers.overallConcentrationRisk}
          - Top Performers: ${analysis.drivers.topMoversAcrossYear.map(m => `${m.fullName} (+${m.return}%)`).join(', ') || 'Market indices'}
          - Leading Sectors: ${analysis.drivers.topSectors.leaders.join(', ') || 'Technology-led'}

          User Question: "${question}"

          Provide a concise, insightful answer (2-3 sentences) based on the annual data above.
                `;
      }

      const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://quarterly-reports-app.onrender.com/api';
      const response = await fetch(`${API_URL}/gemini/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: context })
      });

      if (!response.ok) {
        throw new Error('Failed to generate answer');
      }

      const data = await response.json();
      return data.content || 'Unable to generate answer. Please try again.';
    } catch (err) {
      console.error('Copilot error:', err);
      return 'Sorry, I encountered an error. Please try again.';
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    // Generate bot response
    const botResponse = await generateAnswer(input);

    const botMessage = {
      id: messages.length + 2,
      type: 'bot',
      text: botResponse
    };

    setMessages(prev => [...prev, botMessage]);
  };

  return (
    <div className={`research-copilot ${isOpen ? 'open' : 'closed'}`}>
      {/* Chat Widget Button */}
      <button 
        className="copilot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Research Copilot"
      >
        <span className="copilot-icon">💬</span>
        <span className="copilot-label">Ask Report</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="copilot-window">
          <div className="copilot-header">
            <h3>📊 Research Copilot</h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="copilot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.type}`}>
                <div className="message-content">
                  {msg.type === 'bot' && <span className="avatar">🤖</span>}
                  <p>{msg.text}</p>
                  {msg.type === 'user' && <span className="avatar">👤</span>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="message-content">
                  <span className="avatar">🤖</span>
                  <p className="typing">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="copilot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the report..."
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="send-btn"
            >
              Send
            </button>
          </form>

          <div className="copilot-suggestions">
            <p className="suggestions-label">Quick questions:</p>
            <div className="suggestion-buttons">
              <button 
                onClick={() => setInput("Why did Nasdaq outperform S&P 500?")}
                className="suggestion-btn"
              >
                Nasdaq outperformance?
              </button>
              <button 
                onClick={() => setInput("What was the best performing sector?")}
                className="suggestion-btn"
              >
                Best sector?
              </button>
              <button 
                onClick={() => setInput("How did the market evolve quarter by quarter?")}
                className="suggestion-btn"
              >
                Quarterly trend?
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchCopilot;