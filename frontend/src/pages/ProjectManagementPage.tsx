import React, { useState } from 'react';
import { Briefcase, Search, Plus, Building, Users, Calendar, DollarSign, Filter } from 'lucide-react';
import { INITIAL_PROJECTS, DOMAINS } from '../data/mockData';
import { ResearchProject } from '../types';

export default function ProjectManagementPage() {
  const [projects] = useState<ResearchProject[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');

  const filtered = projects.filter((p) => {
    const matchesDomain = selectedDomain === 'All Domains' || p.domain === selectedDomain;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.grantNumber.toLowerCase().includes(query) ||
      p.leadInstitution.toLowerCase().includes(query) ||
      p.principalInvestigators.some((pi) => pi.toLowerCase().includes(query));
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <span>Research Grants & Inter-Institutional Projects</span>
          </h1>
          <p className="text-xs text-zinc-400">Track principal investigators, funding amounts, and timelines</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects by title, grant number, or PI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

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
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((proj) => (
          <div key={proj.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {proj.grantNumber}
                </span>
                <h3 className="text-sm font-bold text-zinc-100 mt-2">{proj.title}</h3>
              </div>
              <span className="text-base font-extrabold text-emerald-400 font-mono shrink-0">
                {proj.fundingAmount}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400">Lead Institution:</span>
                <span className="font-bold text-zinc-200">{proj.leadInstitution}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400">Principal Investigators:</span>
                <span className="font-semibold text-indigo-300">{proj.principalInvestigators.join(', ')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/80">
              <span>Domain: {proj.domain}</span>
              <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 font-bold">
                {proj.status} ({proj.startDate} – {proj.endDate})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
