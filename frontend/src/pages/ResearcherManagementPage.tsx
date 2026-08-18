import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Award,
  BookOpen,
  Building,
  ArrowRight,
  Plus,
  Share2
} from 'lucide-react';
import { INITIAL_RESEARCHERS, DOMAINS } from '../data/mockData';
import { ResearcherNode } from '../types';

interface ResearcherManagementPageProps {
  onSelectResearcher: (researcher: ResearcherNode) => void;
  onNavigateToProfile: (researcherId: string) => void;
  onNavigateToGraph: (researcherId: string) => void;
}

export default function ResearcherManagementPage({
  onSelectResearcher,
  onNavigateToProfile,
  onNavigateToGraph,
}: ResearcherManagementPageProps) {
  const [researchers] = useState<ResearcherNode[]>(INITIAL_RESEARCHERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [sortBy, setSortBy] = useState<'hIndex' | 'citations' | 'publicationsCount'>('hIndex');

  const filtered = researchers
    .filter((r) => {
      const matchesDomain = selectedDomain === 'All Domains' || r.domain === selectedDomain;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.institution.toLowerCase().includes(query) ||
        r.domain.toLowerCase().includes(query);
      return matchesDomain && matchesSearch;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Researcher Roster & Directory</span>
          </h1>
          <p className="text-xs text-zinc-400">Discover faculty members, academic affiliations, and h-index metrics</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search researchers by name, institution or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200"
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200"
          >
            <option value="hIndex">Sort by h-Index</option>
            <option value="citations">Sort by Citations</option>
            <option value="publicationsCount">Sort by Publications</option>
          </select>
        </div>
      </div>

      {/* Researcher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 transition-all space-y-4 group flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
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

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {r.role}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 font-bold block">RESEARCH DOMAIN</span>
                <span className="text-xs text-indigo-300 font-semibold">{r.domain}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block">h-INDEX</span>
                  <span className="text-indigo-400 font-bold">{r.hIndex}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block">CITATIONS</span>
                  <span className="text-emerald-400 font-bold">{r.citations.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block">PAPERS</span>
                  <span className="text-amber-400 font-bold">{r.publicationsCount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => onNavigateToProfile(r.id)}
                className="flex-1 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold text-xs transition-colors"
              >
                View Profile
              </button>

              <button
                onClick={() => onNavigateToGraph(r.id)}
                className="p-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
                title="View in Canvas Graph"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
