import React from 'react';
import {
  User,
  Building,
  Award,
  BookOpen,
  Share2,
  Mail,
  Globe,
  FileText,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { INITIAL_RESEARCHERS, MOCK_PUBLICATIONS, INITIAL_PROJECTS } from '../data/mockData';
import { ResearcherNode } from '../types';

interface ResearcherProfilePageProps {
  researcherId?: string;
  onNavigateToGraph: (researcherId: string) => void;
  onNavigateToReports: () => void;
}

export default function ResearcherProfilePage({
  researcherId = 'r1',
  onNavigateToGraph,
  onNavigateToReports,
}: ResearcherProfilePageProps) {
  const researcher = INITIAL_RESEARCHERS.find((r) => r.id === researcherId) || INITIAL_RESEARCHERS[0];

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg"
              style={{ backgroundColor: researcher.color }}
            >
              {researcher.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-zinc-100">{researcher.name}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                  {researcher.role}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {researcher.institution} • <span className="text-indigo-300 font-semibold">{researcher.domain}</span>
              </p>
              {researcher.orcid && (
                <p className="text-[11px] font-mono text-zinc-500 mt-1">
                  ORCID: <span className="text-emerald-400 font-bold">{researcher.orcid}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigateToGraph(researcher.id)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Inspect in Graph Canvas</span>
            </button>
            <button
              onClick={onNavigateToReports}
              className="px-3 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-800 flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        {researcher.bio && (
          <p className="text-xs text-zinc-300 leading-relaxed p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            {researcher.bio}
          </p>
        )}
      </div>

      {/* Metric Quick Bar */}
      <div className="grid grid-cols-3 gap-4 text-center font-mono">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 uppercase font-bold block">h-INDEX</span>
          <span className="text-2xl font-extrabold text-indigo-400">{researcher.hIndex}</span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 uppercase font-bold block">TOTAL CITATIONS</span>
          <span className="text-2xl font-extrabold text-emerald-400">{researcher.citations.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 uppercase font-bold block">INDEXED PAPERS</span>
          <span className="text-2xl font-extrabold text-amber-400">{researcher.publicationsCount}</span>
        </div>
      </div>

      {/* Publications Section */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Authored & Co-Authored Publications</span>
        </h3>

        <div className="space-y-3">
          {MOCK_PUBLICATIONS.map((pub) => (
            <div key={pub.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="text-xs font-bold text-zinc-100">{pub.title}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold shrink-0">
                  {pub.citations} Citations
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">{pub.abstract}</p>
              <div className="flex items-center space-x-3 text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-900">
                <span>{pub.journal} ({pub.year})</span>
                <span>DOI: {pub.doi}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
