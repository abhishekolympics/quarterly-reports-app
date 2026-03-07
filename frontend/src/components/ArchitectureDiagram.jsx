import React from 'react';

const ArchitectureDiagram = () => {
  return (
    <div className="architecture">
      <h2>🏗️ System Architecture</h2>

      <div className="diagram">
        {/* Layer 1 */}
        <div className="layer">
          <div className="layer-title">DATA SOURCES</div>
          <div className="components">
            <div className="comp">📊 Finnhub API</div>
            <div className="comp">📰 NewsAPI</div>
            <div className="comp">💾 MongoDB</div>
          </div>
        </div>

        <div className="arrow">↓</div>

        {/* Layer 2 */}
        <div className="layer">
          <div className="layer-title">BACKEND SERVICES</div>
          <div className="components">
            <div className="comp">🔄 Data Aggregator</div>
            <div className="comp">💾 Cache Service</div>
            <div className="comp">📈 Report Service</div>
          </div>
        </div>

        <div className="arrow">↓</div>

        {/* Layer 3 */}
        <div className="layer highlight">
          <div className="layer-title">ANALYTICS & AI</div>
          <div className="components">
            <div className="comp">🧮 Narrative Parser</div>
            <div className="comp">🤖 Gemini AI</div>
            <div className="comp">📑 HTML Renderer</div>
          </div>
        </div>

        <div className="arrow">↓</div>

        {/* Layer 4 */}
        <div className="layer">
          <div className="layer-title">FRONTEND</div>
          <div className="components">
            <div className="comp">🎨 Analytics Dashboard</div>
            <div className="comp">📊 Charts</div>
            <div className="comp">📥 Reports</div>
          </div>
        </div>
      </div>

      <div className="explanation">
        <h3>How It Works</h3>
        <div className="step">
          <span className="step-num">1</span>
          <div>
            <h4>Data Collection</h4>
            <p>Finnhub, NewsAPI, and other sources fetch market data quarterly. Cached in MongoDB.</p>
          </div>
        </div>

        <div className="step">
          <span className="step-num">2</span>
          <div>
            <h4>Aggregation</h4>
            <p>Backend aggregates data from multiple sources into normalized format.</p>
          </div>
        </div>

        <div className="step">
          <span className="step-num">3</span>
          <div>
            <h4>AI Processing</h4>
            <p>Gemini AI generates narrative insights. Data flows to report service.</p>
          </div>
        </div>

        <div className="step">
          <span className="step-num">4</span>
          <div>
            <h4>Frontend Analysis</h4>
            <p>React extracts numbers from narratives, calculates metrics, displays charts.</p>
          </div>
        </div>
      </div>

      <div className="key-decisions">
        <h3>Design Decisions</h3>
        <div className="decision">
          <h4>✅ Modular Services</h4>
          <p>Each service has one job. Easy to scale and modify independently.</p>
        </div>
        <div className="decision">
          <h4>✅ Frontend Analytics</h4>
          <p>Extract numbers on frontend. Keeps backend clean, faster response times.</p>
        </div>
        <div className="decision">
          <h4>✅ AI in the Middle</h4>
          <p>Gemini processes data intelligently. Creates human-quality narratives.</p>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;