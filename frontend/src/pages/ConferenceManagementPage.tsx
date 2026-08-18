import React, { useState } from 'react';
import { Calendar, MapPin, Globe, Users, Clock, ExternalLink, Search } from 'lucide-react';
import { MOCK_CONFERENCES, DOMAINS } from '../data/mockData';
import { AcademicConference } from '../types';

export default function ConferenceManagementPage() {
  const [conferences] = useState<AcademicConference[]>(MOCK_CONFERENCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');

  const filtered = conferences.filter((c) => {
    const matchesDomain = selectedDomain === 'All Domains' || c.domain === selectedDomain;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.acronym.toLowerCase().includes(query) ||
      c.location.toLowerCase().includes(query);
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>Academic Conferences & Symposiums</span>
          </h1>
          <p className="text-xs text-zinc-400">Track paper submission deadlines, attending faculty, and venue locations</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search conferences..."
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

      {/* Conference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((conf) => (
          <div key={conf.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold font-mono text-xs">
                  {conf.acronym}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">{conf.domain}</span>
              </div>

              <h3 className="text-sm font-bold text-zinc-100">{conf.name}</h3>

              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{conf.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{conf.dates}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Deadline: <strong className="text-amber-300">{conf.deadline}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 font-mono">
                {conf.attendingResearchersCount} Faculty Attending
              </span>
              <a
                href={conf.website}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center space-x-1 text-xs font-semibold"
              >
                <span>Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
