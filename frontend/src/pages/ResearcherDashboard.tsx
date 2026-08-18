import React from 'react';
import {
  LayoutDashboard,
  Award,
  BookOpen,
  Share2,
  TrendingUp,
  FileText,
  Briefcase,
  Users,
  ArrowRight
} from 'lucide-react';
import { INITIAL_RESEARCHERS, MOCK_PUBLICATIONS, INITIAL_PROJECTS, MOCK_CITATION_METRICS } from '../data/mockData';
import { ResearcherNode } from '../types';

interface ResearcherDashboardProps {
  onNavigate: (tab: string) => void;
  onSelectResearcher: (researcher: ResearcherNode) => void;
}

export default function ResearcherDashboard({ onNavigate, onSelectResearcher }: ResearcherDashboardProps) {
  const currentResearcher = INITIAL_RESEARCHERS[0]; // Dr. Alena Vass

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            AV
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-zinc-100">{currentResearcher.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                Lead Researcher
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {currentResearcher.institution} • <span className="text-indigo-300">{currentResearcher.domain}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('collaboration')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Open Network Graph</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="px-3 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-800 flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>h-INDEX</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">{currentResearcher.hIndex}</div>
          <p className="text-[10px] text-zinc-500">Top 2% in Quantum Computing</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>TOTAL CITATIONS</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {currentResearcher.citations.toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-500">+480 citations this quarter</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>PUBLICATIONS</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {currentResearcher.publicationsCount}
          </div>
          <p className="text-[10px] text-zinc-500">3 papers under peer review</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>ACTIVE GRANTS</span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">$4.2M</div>
          <p className="text-[10px] text-zinc-500">Q-GRANT-8821 Lead PI</p>
        </div>
      </div>

      {/* Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) - Recent Publications & Citation Trend */}
        <div className="lg:col-span-8 space-y-6">
          {/* Citation Trend Bar Visualizer */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>5-Year Citation Velocity Trajectory</span>
                </h3>
                <p className="text-xs text-zinc-400">Annual citation accumulation and h-index growth</p>
              </div>
              <button
                onClick={() => onNavigate('citations')}
                className="text-xs font-semibold text-indigo-400 hover:underline"
              >
                Full Citation Module →
              </button>
            </div>

            <div className="grid grid-cols-6 gap-3 items-end h-40 pt-6">
              {MOCK_CITATION_METRICS.map((m) => {
                const maxCitations = 6000;
                const heightPercent = Math.round((m.citationsCount / maxCitations) * 100);
                return (
                  <div key={m.year} className="flex flex-col items-center space-y-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-zinc-400 font-bold group-hover:text-emerald-400">
                      {m.citationsCount}
                    </span>
                    <div
                      className="w-full bg-emerald-500/20 group-hover:bg-emerald-500 border border-emerald-500/40 rounded-t-lg transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-mono text-zinc-500">{m.year}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Co-Authored Publications */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Recent High-Impact Papers</span>
              </h3>
              <button
                onClick={() => onNavigate('publications')}
                className="text-xs font-semibold text-indigo-400 hover:underline"
              >
                View All Papers →
              </button>
            </div>

            <div className="space-y-3">
              {MOCK_PUBLICATIONS.map((pub) => (
                <div key={pub.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-100 hover:text-indigo-300 transition-colors">
                      {pub.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold shrink-0">
                      {pub.citations} Citations
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Authors: <span className="text-zinc-300 font-medium">{pub.authors.join(', ')}</span>
                  </p>
                  <div className="flex items-center space-x-3 text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-900">
                    <span>{pub.journal} ({pub.year})</span>
                    <span>DOI: {pub.doi}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) - Co-Author Network & Recommended Collaborators */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Co-Authors */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Frequent Co-Authors</span>
            </h3>

            <div className="space-y-2">
              {INITIAL_RESEARCHERS.slice(1, 4).map((coAuthor) => (
                <div
                  key={coAuthor.id}
                  onClick={() => onSelectResearcher(coAuthor)}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: coAuthor.color }}
                    >
                      {coAuthor.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200 group-hover:text-indigo-300">
                        {coAuthor.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">{coAuthor.institution}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-indigo-400 font-bold">
                    h-{coAuthor.hIndex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Research Grants */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Lead Research Grants</span>
            </h3>

            {INITIAL_PROJECTS.slice(0, 2).map((proj) => (
              <div key={proj.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200">{proj.title}</span>
                  <span className="font-mono text-purple-400 font-bold text-[10px]">{proj.fundingAmount}</span>
                </div>
                <p className="text-[10px] font-mono text-zinc-500">Grant #{proj.grantNumber}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
