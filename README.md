# MarketMind AI — Equity Intelligence

An AI-powered quarterly and annual equity market report generation platform. Pulls real financial data from multiple market APIs, generates professional narratives using Google Gemini, and renders interactive reports with charts and PDF exports.

---

## Features

- **Quarterly & Annual Reports** — Generate structured market reports for any quarter/year with real index performance data (S&P 500, NASDAQ, MSCI ACWI), record highs, and market concentration analysis
- **AI Narratives** — Google Gemini generates professional executive summaries and market commentary for each report section
- **Multi-source Data** — Aggregates financial data from Finnhub, Alpha Vantage, Polygon, and news from NewsAPI with a caching layer
- **Report Exports** — View reports as interactive HTML or download as PDF (PDFKit)
- **ResearchCopilot** — In-app AI chat assistant for equity research queries
- **Analytics Dashboard** — Charts, sector performance, year-over-year comparisons, and market concentration analysis

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| AI | Google Gemini API (`@google/generative-ai`) |
| Market Data | Finnhub, Alpha Vantage, Polygon, NewsAPI |
| PDF | PDFKit |

---

## Project Structure

```
quarterly-reports-app-option2/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # Mongoose schemas
│   │   ├── Report.js             # Quarterly report
│   │   ├── AnnualReport.js       # Annual report
│   │   └── MarketDataCache.js    # Cached market data
│   ├── routes/
│   │   ├── reports.js            # Quarterly report endpoints
│   │   ├── annualReports.js      # Annual report endpoints
│   │   └── gemini.js             # Gemini AI endpoints
│   ├── services/
│   │   ├── geminiService.js      # Gemini narrative generation
│   │   ├── marketDataAggregator.js
│   │   ├── reportService.js      # HTML/PDF generation
│   │   ├── annualReportService.js
│   │   ├── finnhubService.js
│   │   ├── newsAPIService.js
│   │   ├── analyticsEngine.js
│   │   └── cacheService.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── ReportsList.js
    │   │   ├── CreateReport.js
    │   │   ├── ReportDetail.js
    │   │   ├── ReportAnalytics.js
    │   │   ├── AnnualReports.js
    │   │   └── AnnualReportAnalytics.js
    │   ├── components/
    │   │   ├── ChartsDisplay.jsx
    │   │   ├── ExecutiveSummary.jsx
    │   │   ├── SectorPerformance.jsx
    │   │   ├── YearComparison.jsx
    │   │   ├── ResearchCopilot.jsx
    │   │   └── ...
    │   ├── services/             # API client
    │   └── styles/               # CSS modules
    └── public/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- API keys for: Google Gemini, Finnhub, NewsAPI

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/quarterly-reports
GEMINI_API_KEY=your-gemini-api-key
FINNHUB_API_KEY=your-finnhub-api-key
NEWSAPI_KEY=your-newsapi-key
PORT=5000
NODE_ENV=development
```

```bash
npm run dev      # development (nodemon)
npm start        # production
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

```bash
npm start        # development server (port 3000)
npm run build    # production build
```

---

## API Endpoints

### Quarterly Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | List all reports |
| POST | `/api/reports` | Create a new report |
| GET | `/api/reports/:id` | Get report details |
| POST | `/api/reports/:id/generate` | Generate AI report |
| GET | `/api/reports/:id/html` | Export as HTML |
| GET | `/api/reports/:id/pdf` | Export as PDF |
| DELETE | `/api/reports/:id` | Delete report |

### Annual Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/annual-reports` | List all annual reports |
| POST | `/api/annual-reports` | Create a new annual report |
| GET | `/api/annual-reports/:id` | Get annual report details |
| POST | `/api/annual-reports/:id/generate` | Generate AI annual report |
| GET | `/api/annual-reports/:id/html` | Export as HTML |
| GET | `/api/annual-reports/:id/pdf` | Export as PDF |
| DELETE | `/api/annual-reports/:id` | Delete annual report |

---

## Deployment

**Frontend** — Vercel or Netlify (includes `vercel.json` and `public/_redirects` for SPA routing). Set `REACT_APP_API_BASE_URL` to your deployed backend URL.

**Backend** — Render, Railway, or any Node host. Set all environment variables in the platform dashboard.

**Database** — MongoDB Atlas recommended for production.
