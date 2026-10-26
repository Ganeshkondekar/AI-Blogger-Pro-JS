# AI Blogger Pro — Full-Stack JavaScript Migration

Autonomous Multi-Agent SEO Blog Generation Engine migrated from Python to a pure JavaScript full-stack web application.

---

## 🏗 Architecture Overview

```
web-js/
├── frontend/               # Next.js 14 (App Router, React 18, Tailwind CSS, Lucide icons)
│   ├── app/
│   │   ├── globals.css     # Dark glassmorphism theme & Markdown typography
│   │   ├── layout.js       # App metadata & root HTML layout (JavaScript)
│   │   └── page.js         # Interactive dashboard, pipeline visualizer & SEO analytics
│   ├── .env.example
│   └── package.json
│
├── backend/                # NestJS 12 in Pure JavaScript (Babel legacy decorators, Express)
│   ├── src/
│   │   ├── agents/         # Multi-Agent Workflow
│   │   │   ├── research.agent.js   # Agent 1: Live Tavily Web Search & synthesis
│   │   │   ├── planner.agent.js    # Agent 2: SEO Outline & intent structure
│   │   │   ├── writer.agent.js     # Agent 3: Complete Markdown blog drafting
│   │   │   └── seo.agent.js        # Agent 4: Title, headings & meta optimization
│   │   ├── services/
│   │   │   ├── blog.service.js         # 4-stage agent orchestrator
│   │   │   └── seo-analyzer.service.js # Quantitative SEO scoring (0-100) & audit
│   │   ├── controllers/
│   │   │   └── blog.controller.js      # REST API endpoints (@Bind JavaScript decorators)
│   │   ├── database/
│   │   │   └── database.service.js     # PostgreSQL client with seamless fallback storage
│   │   ├── utils/
│   │   │   ├── api.js      # OpenRouter API client (native fetch)
│   │   │   └── search.js   # Tavily Search API client
│   │   ├── config.js       # Environment configuration
│   │   ├── app.module.js
│   │   └── main.js         # NestJS bootstrap with CORS & port binding
│   ├── .babelrc            # Babel 8 legacy decorators configuration for JS
│   ├── .env.example
│   └── package.json
│
├── .env.example            # Root environment template
├── .gitignore
├── package.json            # Monorepo task runner
└── README.md
```

---

## ⚡ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS (Pure JavaScript, `.js` / `.jsx`)
- **Backend**: NestJS 12, Node.js (Pure JavaScript with Babel 8)
- **AI Integration**: OpenRouter API (`openai/gpt-4.1-mini`)
- **Web Search**: Tavily Search API (with resilient web synthesis fallback)
- **Database**: PostgreSQL support via `pg.Pool` (with automatic fallback to persistent JSON storage)
- **Protocol**: REST APIs with CORS

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v26)
- **npm** v9+

### 2. Configure Environment Variables
Inside `web-js/backend/`:
```bash
cp .env.example .env
```
Ensure your `.env` contains your OpenRouter key:
```ini
OPENROUTER_API_KEY=your_openrouter_api_key_here
MODEL=openai/gpt-4.1-mini
TAVILY_API_KEY=your_tavily_api_key_here # (Optional)
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_blogger_pro # (Optional)
```

Inside `web-js/frontend/`:
```bash
cp .env.example .env.local
```
```ini
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🏃 Running the Application

### Option A: From root of `web-js`
Run backend:
```bash
npm run start:backend
```
In another terminal, run frontend:
```bash
npm run start:frontend
```

### Option B: Running individually
#### Start Backend (Port 3001):
```bash
cd backend
npm start
```
*Backend will be running on `http://localhost:3001`*

#### Start Frontend (Port 3000):
```bash
cd frontend
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck, model info & storage engine status |
| `POST` | `/api/blog/generate` | Runs the 4-agent pipeline to generate an SEO blog |
| `GET` | `/api/blog/history` | Fetches previously generated blogs & metadata |
| `GET` | `/api/blog/:id` | Retrieves a specific blog by ID with full logs |

### Sample Generation Request
```bash
curl -X POST http://localhost:3001/api/blog/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "The Future of Autonomous AI Agents",
    "keyword": "AI agents",
    "tone": "Professional & Informative"
  }'
```

---

## 🔍 Features Implemented

1. **Autonomous 4-Agent Pipeline**:
   - **Research Agent**: Scrapes or synthesizes live facts and sources.
   - **Planner Agent**: Generates structured SEO outlines (Title, intro, H2s, H3s, conclusion).
   - **Writer Agent**: Produces complete, in-depth Markdown blog posts.
   - **SEO Agent**: Optimizes CTR, headings, readability, and extracts meta descriptions.
2. **Real-time Pipeline Dashboard**:
   - Live visual status badges (`Waiting`, `Working...`, `Completed ✓`) for each agent.
   - Dynamic progress bar tracking stages.
3. **SEO Quality Analyzer**:
   - Scores blog from 0–100.
   - Computes word count, reading time, keyword density, and heading hierarchy.
   - Actionable audit checklist.
4. **Tabbed Inspection**:
   - Rendered Blog view
   - Raw Markdown source
   - Planner Outline
   - Research Data & sources
5. **History & Persistence**:
   - PostgreSQL persistence when configured.
   - Resilient file storage fallback to ensure zero downtime.
   - History slide-over drawer to browse and reload past articles.
6. **Utility Actions**:
   - One-click copy Markdown to clipboard.
   - Download as `.md` file.
