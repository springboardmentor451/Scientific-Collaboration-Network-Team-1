import React from 'react';
import {
  Share2,
  Users,
  Award,
  BookOpen,
  Building,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Sparkles
} from 'lucide-react';
import { INITIAL_RESEARCHERS, INITIAL_INSTITUTIONS, MOCK_PUBLICATIONS } from '../data/mockData';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SciConnect Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight max-w-4xl mx-auto">
          SciConnect <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
            Connecting Science, People & Ideas.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Discover hidden co-authorship topological clusters, track citation velocity, manage inter-institutional grant projects, and export publication-ready PDF analytics.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('collaboration')}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Explore Interactive Network Visualizer</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="px-6 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold text-sm transition-all flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Export PDF Reports</span>
          </button>
        </div>

        {/* Platform Hero Stat Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-zinc-800/80">
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-2xl font-extrabold text-indigo-400 block font-mono">1,420+</span>
            <span className="text-xs text-zinc-400">Faculty Researchers</span>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-2xl font-extrabold text-emerald-400 block font-mono">85+</span>
            <span className="text-xs text-zinc-400">Research Institutions</span>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-2xl font-extrabold text-amber-400 block font-mono">6,800+</span>
            <span className="text-xs text-zinc-400">Indexed Publications</span>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-2xl font-extrabold text-purple-400 block font-mono">$45M+</span>
            <span className="text-xs text-zinc-400">Tracked Grant Funding</span>
          </div>
        </div>
      </section>

      {/* Featured Faculty Network Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Leading Faculty Investigators</span>
            </h2>
            <p className="text-xs text-zinc-400">Top-cited researchers across quantum, AI, and genomics domains</p>
          </div>

          <button
            onClick={() => onNavigate('researchers')}
            className="text-xs font-semibold text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>View Full Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {INITIAL_RESEARCHERS.slice(0, 3).map((r) => (
            <div
              key={r.id}
              onClick={() => onNavigate('researchers')}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 transition-all cursor-pointer space-y-3 group shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md"
                    style={{ backgroundColor: r.color }}
                  >
                    {r.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-100 group-hover:text-indigo-300 transition-colors">
                      {r.name}
                    </h3>
                    <p className="text-xs text-zinc-400">{r.institution}</p>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex justify-between font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px]">h-INDEX</span>
                  <span className="text-indigo-400 font-bold">{r.hIndex}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">CITATIONS</span>
                  <span className="text-emerald-400 font-bold">{r.citations.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">PAPERS</span>
                  <span className="text-amber-400 font-bold">{r.publicationsCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Capabilities Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Enterprise Academic Capabilities</h2>
          <p className="text-xs text-zinc-400">Built for research universities, grant committees, and lead investigators</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-max">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">Co-Authorship Network Topology</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              2D canvas graphing degree distribution, shortest path co-authorship routes, and topological centrality algorithms.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-max">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">Citation Velocity & Analytics</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Real-time citation tracking, BibTeX export, journal impact metrics, and author h-index trajectory visualizations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-max">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">Publication-Grade PDF Reporting</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generate PDF summaries with executive insights, co-authorship edge matrices, and faculty rosters in seconds.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
