import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitFork, BookOpen, Network, Award, ChevronRight, Compass } from 'lucide-react';
import { ResearcherService } from '../services/researcherService';
import { DashboardService } from '../services/dashboardService';
import type { Researcher, SystemStats } from '../types';

export const LandingPage: React.FC = () => {
  const [featured, setFeatured] = useState<Researcher[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    ResearcherService.getAll().then(res => setFeatured(res.slice(0, 3)));
    DashboardService.getSystemStats().then(s => setStats(s));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">

      {/* Landing Topbar */}
      <header className="h-16 px-6 lg:px-12 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-40 select-none">
        <Link to="/" className="flex items-center gap-2 font-bold text-navy-600 dark:text-navy-400 text-lg">
          <GitFork className="w-5 h-5 text-navy-500 animate-pulse" />
          <span className="tracking-tight text-slate-800 dark:text-slate-200">SCN Platform</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/researchers" className="text-sm font-semibold hover:text-navy-600 dark:hover:text-navy-400 transition-colors">Explore</Link>
          {/* Sign In is invisible in light mode}
          {/* <Link to="/login" className="px-4 py-2 bg-navy-600 hover:bg-navy-400 text-white rounded-lg text-sm font-semibold shadow-md shadow-navy-500/10 transition-all">Sign In</Link> */}
          <Link to="/login" className="px-4 py-2 
             bg-navy-600 hover:bg-navy-400 
             text-navy-600 dark:text-white 
             rounded-lg text-sm font-semibold 
             shadow-md shadow-navy-500/10 
             transition-all">Sign In</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 px-6 lg:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-navy-50 dark:bg-navy-950/40 text-navy-600 dark:text-navy-400 px-3 py-1.5 rounded-full text-xs font-semibold select-none border border-navy-100 dark:border-navy-900/50">
            <Compass className="w-3.5 h-3.5" />
            Empowering Institutional Science
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Connect Research.<br />
            {/* Word "Discover" is almost mixing in background */}
            {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy-500 via-navy-600 to-indigo-500 dark:from-navy-400 dark:to-indigo-400">Discover Knowledge.</span><br/> */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-navy-600 to-indigo-500 opacity-80">Discover Knowledge.</span><br />
            Build the Future.
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl text-base sm:text-lg leading-relaxed mx-auto lg:mx-0">
            A professional platform for researchers to discover expertise, manage academic portfolios, track publications, analyze citations, and coordinate cross-institution collaborations.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            {/* Get Started is invisible in light mode */}
            {/* <Link to="/login" className="px-6 py-3 bg-navy-600 hover:bg-navy-500 text-white rounded-xl font-bold shadow-lg shadow-navy-500/20 hover:scale-[1.02] flex items-center gap-2 transition-all group"> */}
            <Link to="/login" className="px-6 py-3 
             bg-blue-600 hover:bg-blue-500 
             dark:bg-blue-400 dark:hover:bg-blue-300 
             text-white rounded-xl font-bold 
             shadow-lg shadow-blue-500/20 
             hover:scale-[1.02] flex items-center gap-2 
             transition-all group">
              Get Started
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/researchers" className="px-6 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
              Explore Researchers
            </Link>
          </div>
        </div>

        {/* Custom Visual Science Graph SVG/CSS */}
        <div className="lg:col-span-5 flex justify-center items-center relative select-none">
          <div className="absolute inset-0 bg-navy-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full" />
          <svg className="w-80 h-80 relative z-10 filter drop-shadow-lg" viewBox="0 0 400 400">
            {/* Edges */}
            <line x1="200" y1="200" x2="100" y2="100" stroke="#cbd5e1" strokeWidth="2.5" className="dark:stroke-slate-800" />
            <line x1="200" y1="200" x2="300" y2="120" stroke="#cbd5e1" strokeWidth="2.5" className="dark:stroke-slate-800" />
            <line x1="200" y1="200" x2="250" y2="300" stroke="#cbd5e1" strokeWidth="2.5" className="dark:stroke-slate-800" />
            <line x1="200" y1="200" x2="90" y2="280" stroke="#cbd5e1" strokeWidth="2.5" className="dark:stroke-slate-800" />
            <line x1="100" y1="100" x2="300" y2="120" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-800" strokeDasharray="4 4" />
            <line x1="250" y1="300" x2="90" y2="280" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-800" />

            {/* Nodes */}
            <circle cx="200" cy="200" r="28" className="fill-navy-600 dark:fill-navy-500 stroke-white dark:stroke-slate-950 stroke-4" />
            <circle cx="100" cy="100" r="20" className="fill-indigo-500 stroke-white dark:stroke-slate-950 stroke-4" />
            <circle cx="300" cy="120" r="18" className="fill-slate-400 dark:fill-slate-600 stroke-white dark:stroke-slate-950 stroke-4" />
            <circle cx="250" cy="300" r="22" className="fill-emerald-500 stroke-white dark:stroke-slate-950 stroke-4" />
            <circle cx="90" cy="280" r="16" className="fill-amber-500 stroke-white dark:stroke-slate-950 stroke-4" />

            {/* Icons Inside Nodes */}
            <text x="200" y="204" textAnchor="middle" fill="white" className="text-[12px] font-bold font-sans">AI</text>
            <text x="100" y="104" textAnchor="middle" fill="white" className="text-[9px] font-sans">DB</text>
            <text x="300" y="124" textAnchor="middle" fill="white" className="text-[9px] font-sans">BIO</text>
            <text x="250" y="304" textAnchor="middle" fill="white" className="text-[9px] font-sans">NET</text>
            <text x="90" y="284" textAnchor="middle" fill="white" className="text-[9px] font-sans">HCI</text>
          </svg>
        </div>
      </section>

      {/* Aggregate Stats Cards */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold text-navy-600 dark:text-navy-400">{stats?.total_researchers || 0}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Researchers</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold text-navy-600 dark:text-navy-400">{stats?.total_publications || 0}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Publications Logged</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold text-navy-600 dark:text-navy-400">{stats?.total_collaborations || 0}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Collaboration Edges</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold text-navy-600 dark:text-navy-400">{stats?.total_citations || 0}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tracked Citations</p>
          </div>
        </div>
      </section>

      {/* Feature Spotlights */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Platform Core Capabilities</h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm">Designed specifically to meet strict scholastic records, peer connectivity mapping, and publication sharing rules.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-navy-100 dark:bg-navy-950 flex items-center justify-center text-navy-600 dark:text-navy-400">
              <Network className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-lg">Collaboration Graph</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore dynamic network relationships. Drill down on nodes to view connected departments and verify inter-organizational output maps.
            </p>
          </div>

          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-navy-100 dark:bg-navy-950 flex items-center justify-center text-navy-600 dark:text-navy-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-lg">Publications Records</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Register papers, upload PDFs, assign external and internal co-authors, and keep tracks on journal/conference statuses.
            </p>
          </div>

          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-navy-100 dark:bg-navy-950 flex items-center justify-center text-navy-600 dark:text-navy-400">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-lg">Citation Analytics</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Observe citation growths, log bibliography connections, and export reports for presentation slides or research grants.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Academic Profiles */}
      <section className="bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-800/50 py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Featured Scholar Profiles</h2>
            <Link to="/researchers" className="text-sm font-semibold text-navy-600 dark:text-navy-400 hover:underline">View Full Directory &rarr;</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map(r => (
              <div key={r.researcher_id} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-navy-600 text-white text-base font-bold flex items-center justify-center rounded-full">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{r.name}</h4>
                      <p className="text-[11px] text-slate-400">{r.department || 'Academic Department'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{r.bio || 'No biography details provided.'}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 font-medium">Orcid ID: {r.orcid || 'N/A'}</span>
                  <Link to={`/researchers/${r.researcher_id}`} className="text-xs font-semibold text-navy-600 dark:text-navy-400 hover:underline">View Profile</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 py-8 px-6 text-center text-xs text-slate-400">
        <p>&copy; 2026 Scientific Collaboration Network (SCN). All rights reserved.</p>
        <p className="mt-1 text-[10px] text-slate-500">FastAPI backend integrated framework with React-Vite visualizers.</p>
      </footer>

    </div>
  );
};
