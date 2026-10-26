# AI Blogger Pro — JavaScript Version

AI Blogger Pro is a multi-agent blog generation application that helps users create SEO-friendly blog posts through an automated workflow. This version uses JavaScript for both the frontend and backend, based on the original Python project.

## Project Structure

```text
web-js/
├── frontend/             # Next.js frontend
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   └── package.json
│
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── agents/
│   │   │   ├── research.agent.js
│   │   │   ├── planner.agent.js
│   │   │   ├── writer.agent.js
│   │   │   └── seo.agent.js
│   │   ├── services/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── utils/
│   │   ├── config.js
│   │   └── main.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Technologies Used

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Node.js and NestJS
- **Language:** JavaScript
- **AI:** OpenRouter API
- **Web Search:** Tavily Search API
- **Database:** PostgreSQL, with local file storage as a fallback
- **Communication:** REST API

## Main Features

### 1. Multi-Agent Blog Generation

The application uses four agents to generate a blog:

- **Research Agent:** Collects relevant information and research sources.
- **Planner Agent:** Creates an outline based on the topic and target keyword.
- **Writer Agent:** Generates the blog content using the outline.
- **SEO Agent:** Improves the content structure and prepares SEO metadata.

### 2. Blog Generation Dashboard

Users can enter a topic, specify a target keyword, select a writing style, and generate a complete blog through the web interface.

The dashboard displays the progress of the agents as they work through the pipeline.

### 3. SEO Analysis

The application evaluates generated content using metrics such as:

- SEO score
- Word count and estimated reading time
- Keyword density
- Heading structure
- Meta description length

It also provides an audit checklist to help identify areas for improvement.

### 4. Blog Preview and Export

Generated content can be viewed in different formats:

- Rendered blog
- Raw Markdown
- Planner outline
- Research sources

Users can also copy the Markdown content or download it as a `.md` file.

### 5. Blog History

Previously generated blogs can be saved and accessed later. The application supports PostgreSQL storage when configured and local file storage as a fallback.

## Getting Started

### Prerequisites

- Node.js
- npm
- An OpenRouter API key
- A Tavily API key (optional, for web research)
- PostgreSQL (optional, when using database persistence)

### 1. Configure the Backend

Open a terminal in the backend directory:

```bash
cd web-js/backend
npm install
```

Create a `.env` file using `.env.example` as a template, then configure the required environment variables:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
MODEL=openai/gpt-4.1-mini
TAVILY_API_KEY=your_tavily_api_key
PORT=3001
```

If you want to use PostgreSQL, configure `DATABASE_URL` with your database connection string.

### 2. Configure the Frontend

Open another terminal:

```bash
cd web-js/frontend
npm install
```

Create `.env.local` from the frontend's `.env.example` file and set:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start the Application

Start the backend:

```bash
cd web-js/backend
npm start
```

Then, in a separate terminal, start the frontend:

```bash
cd web-js/frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

If the root `package.json` provides the corresponding scripts, the backend and frontend can also be started from the project root.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend status |
| POST | `/api/blog/g
