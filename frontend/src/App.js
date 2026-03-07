import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReportsList from './pages/ReportsList';
import CreateReport from './pages/CreateReport';
import ReportDetail from './pages/ReportDetail';
import './App.css';

function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="logo">📊 Quarterly Reports Generator</h1>
            <ul className="nav-links">
              <li><a href="/">All Reports</a></li>
              <li><a href="/create">Create Report</a></li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<ReportsList />} />
          <Route path="/create" element={<CreateReport />} />
          <Route path="/report/:id" element={<ReportDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
