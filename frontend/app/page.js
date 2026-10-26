'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Search,
  FileText,
  PenTool,
  Rocket,
  CheckCircle2,
  Clock,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  BarChart3,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  History,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const TONES = [
  'Professional & Informative',
  'Conversational & Engaging',
  'Thought Leadership & Authoritative',
  'Technical Deep-Dive',
  'Persuasive & Growth-Oriented',
];

export default function Dashboard() {
  // Input state
  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [tone, setTone] = useState(TONES[0]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  // Execution state
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [error, setError] = useState(null);

  // Result state
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [activeTab, setActiveTab] = useState('rendered'); // 'rendered' | 'raw' | 'outline' | 'research'
  const [copied, setCopied] = useState(false);

  // History & System status
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);

  // Fetch initial system status and history
  useEffect(() => {
    fetchHealth();
    fetchHistory();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch {
      setSystemStatus({ status: 'offline' });
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blog/history?limit=15`);
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore
    }
  };

  const loadFromHistory = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/blog/${id}`);
      if (!res.ok) throw new Error('Failed to load blog from history');
      const data = await res.json();

      setGeneratedBlog({
        id: data.id,
        topic: data.topic,
        keyword: data.keyword,
        tone: data.tone,
        content: data.content,
        outline: data.outline,
        research: data.research,
        seo: data.metadata?.seoMetrics || {
          score: data.seo_score || 80,
          wordCount: data.content ? data.content.split(/\s+/).length : 0,
          readingTimeMinutes: Math.max(1, Math.ceil((data.content?.split(/\s+/).length || 0) / 200)),
          headings: { h1: 1, h2: 6, h3: 4 },
          recommendations: ['Loaded from archive'],
        },
        stages: data.metadata?.stages || [
          { id: 'research', name: 'Research Agent', status: 'completed', durationMs: 2500 },
          { id: 'planner', name: 'Planning Agent', status: 'completed', durationMs: 4000 },
          { id: 'writer', name: 'Writing Agent', status: 'completed', durationMs: 8000 },
          { id: 'seo', name: 'SEO Optimization Agent', status: 'completed', durationMs: 6000 },
        ],
        model: data.metadata?.model || 'openai/gpt-4.1-mini',
        createdAt: data.created_at,
      });

      setTopic(data.topic);
      if (data.keyword) setKeyword(data.keyword);
      if (data.tone) setTone(data.tone);
      setShowHistory(false);
      setProgress(100);
      setCurrentStageIndex(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a blog topic before generating.');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(5);
    setCurrentStageIndex(0);

    // Simulate animated step transitions while backend processes
    const stageTimers = [
      setTimeout(() => { setCurrentStageIndex(0); setProgress(20); }, 800),
      setTimeout(() => { setCurrentStageIndex(1); setProgress(45); }, 4500),
      setTimeout(() => { setCurrentStageIndex(2); setProgress(70); }, 11000),
      setTimeout(() => { setCurrentStageIndex(3); setProgress(90); }, 22000),
    ];

    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          keyword: keyword.trim(),
          tone: tone,
          customInstructions: customInstructions.trim(),
        }),
      });

      stageTimers.forEach(clearTimeout);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `Server returned error (${response.status})`);
      }

      const data = await response.json();
      setProgress(100);
      setCurrentStageIndex(4);
      setGeneratedBlog(data);
      fetchHistory(); // Refresh history list
    } catch (err) {
      stageTimers.forEach(clearTimeout);
      setError(err.message || 'An unexpected error occurred during generation.');
      setProgress(0);
      setCurrentStageIndex(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedBlog?.content) return;
    navigator.clipboard.writeText(generatedBlog.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedBlog?.content) return;
    const blob = new Blob([generatedBlog.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${(generatedBlog.topic || 'blog').toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Pipeline definitions
  const pipelineAgents = [
    {
      id: 'research',
      icon: <Search className="w-6 h-6 text-cyan-400" />,
      name: 'Research Agent',
      desc: 'Gathering live facts & references',
    },
    {
      id: 'planner',
      icon: <FileText className="w-6 h-6 text-indigo-400" />,
      name: 'Planner Agent',
      desc: 'Structuring SEO outline & intent',
    },
    {
      id: 'writer',
      icon: <PenTool className="w-6 h-6 text-pink-400" />,
      name: 'Writer Agent',
      desc: 'Crafting comprehensive draft',
    },
    {
      id: 'seo',
      icon: <Rocket className="w-6 h-6 text-emerald-400" />,
      name: 'SEO Optimizer',
      desc: 'Polishing headings & meta tags',
    },
  ];

  const getAgentStatus = (idx) => {
    if (currentStageIndex === -1) return { state: 'idle', label: 'Waiting' };
    if (currentStageIndex === idx) return { state: 'active', label: 'Working...' };
    if (currentStageIndex > idx) return { state: 'done', label: 'Completed ✓' };
    return { state: 'idle', label: 'Waiting' };
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">AI Blogger</span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text font-black text-lg">PRO</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">JS Full-Stack</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Health Status Pill */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
              <span className={`w-2 h-2 rounded-full ${systemStatus?.status === 'operational' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300">
                {systemStatus?.status === 'operational'
                  ? `Backend Active (${systemStatus.database?.storageType || 'Ready'})`
                  : 'Backend Connecting...'}
              </span>
            </div>

            {/* History Toggle Button */}
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <History className="w-4 h-4 text-purple-400" />
              <span>History</span>
              {history.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto pt-2 pb-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Multi-Agent AI Pipeline in JavaScript</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
            AI Blogger <span className="gradient-text">Pro</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Research → Plan → Write → Optimize — fully autonomous SEO blogs generated in seconds via OpenRouter & NestJS.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="max-w-4xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-red-300">Generation Error</p>
              <p className="mt-0.5 text-red-200/90">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Card Form */}
        <section className="max-w-4xl mx-auto glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label htmlFor="topic" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Blog Topic <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Artificial Intelligence in Healthcare: Revolutionizing Diagnostics"
                  disabled={loading}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="keyword" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Target SEO Keyword <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  id="keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. AI in healthcare"
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label htmlFor="tone" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Content Tone & Style
                </label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Options Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium focus:outline-none"
              >
                <span>Advanced Prompt Instructions</span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="mt-3">
                  <textarea
                    rows={2}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Specific focus areas, industry nuances, target audience or specific statistics to highlight..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Autonomous Pipeline Running...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  <span>Generate Complete SEO Blog</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Progress Bar & Agent Pipeline Display */}
        <section className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
            <span>Agent Pipeline Execution</span>
            <span>{loading ? `${progress}% Running` : generatedBlog ? '100% Completed' : 'Ready'}</span>
          </div>

          {/* Progress bar line */}
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 4 Agent Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-1">
            {pipelineAgents.map((agent, idx) => {
              const { state, label } = getAgentStatus(idx);
              const isActive = state === 'active';
              const isDone = state === 'done';

              return (
                <div
                  key={agent.id}
                  className={`relative glass-panel rounded-xl p-4 text-center transition-all duration-300 ${
                    isActive
                      ? 'border-indigo-500/80 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                      : isDone
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : 'border-white/10 opacity-75'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-500/20 animate-pulse' : 'bg-white/5'}`}>
                      {agent.icon}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{agent.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-3">{agent.desc}</p>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse'
                        : isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Results Section */}
        {generatedBlog && (
          <section className="max-w-5xl mx-auto space-y-6 pt-2">
            {/* SEO Metrics Bar */}
            {generatedBlog.seo && (
              <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-xl shadow-lg ${
                        generatedBlog.seo.score >= 80
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
                          : generatedBlog.seo.score >= 60
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      <span>{generatedBlog.seo.score}</span>
                      <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase -mt-1">SEO</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <span>Autonomous SEO Score</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </h3>
                      <p className="text-xs text-slate-400">
                        Evaluated across article depth, keyword intent, metadata, and headings.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center space-x-1.5 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .md</span>
                    </button>
                  </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xs text-slate-400 mb-1">Word Count</div>
                    <div className="text-lg font-bold text-white">{generatedBlog.seo.wordCount}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xs text-slate-400 mb-1">Reading Time</div>
                    <div className="text-lg font-bold text-white">{generatedBlog.seo.readingTimeMinutes} min</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xs text-slate-400 mb-1">Headings</div>
                    <div className="text-lg font-bold text-white">
                      H1:{generatedBlog.seo.headings?.h1 || 1} · H2:{generatedBlog.seo.headings?.h2 || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xs text-slate-400 mb-1">Keyword Density</div>
                    <div className="text-lg font-bold text-white">
                      {generatedBlog.seo.keywordMetrics?.densityPercent || 0}% ({generatedBlog.seo.keywordMetrics?.count || 0}x)
                    </div>
                  </div>
                </div>

                {/* Recommendations list */}
                {generatedBlog.seo.recommendations && generatedBlog.seo.recommendations.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      SEO Optimization Audit
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {generatedBlog.seo.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-center space-x-2 text-slate-300">
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tabbed Inspection Box */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Tab headers */}
              <div className="flex border-b border-white/10 bg-slate-950/60 px-4 pt-3 space-x-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('rendered')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 ${
                    activeTab === 'rendered'
                      ? 'bg-slate-900 text-white border-t-2 border-indigo-500 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Rendered Blog</span>
                </button>
                <button
                  onClick={() => setActiveTab('raw')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 ${
                    activeTab === 'raw'
                      ? 'bg-slate-900 text-white border-t-2 border-indigo-500 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Raw Markdown</span>
                </button>
                {generatedBlog.outline && (
                  <button
                    onClick={() => setActiveTab('outline')}
                    className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 ${
                      activeTab === 'outline'
                        ? 'bg-slate-900 text-white border-t-2 border-indigo-500 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Planner Outline</span>
                  </button>
                )}
                {generatedBlog.research && (
                  <button
                    onClick={() => setActiveTab('research')}
                    className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center space-x-1.5 ${
                      activeTab === 'research'
                        ? 'bg-slate-900 text-white border-t-2 border-indigo-500 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Research Sources</span>
                  </button>
                )}
              </div>

              {/* Tab content bodies */}
              <div className="p-6 sm:p-8 bg-slate-900/60 min-h-[400px]">
                {activeTab === 'rendered' && (
                  <article className="prose-blog max-w-none">
                    <ReactMarkdown>{generatedBlog.content}</ReactMarkdown>
                  </article>
                )}

                {activeTab === 'raw' && (
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {generatedBlog.content}
                  </pre>
                )}

                {activeTab === 'outline' && (
                  <div className="prose-blog max-w-none">
                    <ReactMarkdown>{generatedBlog.outline}</ReactMarkdown>
                  </div>
                )}

                {activeTab === 'research' && (
                  <div className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {generatedBlog.research}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* History Slide-Over Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-950 border-l border-white/10 h-full flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Blog Archive & History</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-12">No previous blogs generated yet.</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item.id)}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white line-clamp-1">{item.topic}</h4>
                      {item.seo_score && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex-shrink-0">
                          {item.seo_score} SEO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.preview || 'No preview available'}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>{item.tone || 'Professional'}</span>
                      <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500 mt-12">
        <p>Tech Ahir AI Full-Stack Developer Internship — AI Blogger Pro (JavaScript Full-Stack Migration)</p>
      </footer>
    </div>
  );
}
