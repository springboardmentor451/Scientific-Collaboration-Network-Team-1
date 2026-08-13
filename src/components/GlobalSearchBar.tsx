import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  User,
  Building,
  Briefcase,
  ChevronRight,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  Tag
} from 'lucide-react';
import {
  INITIAL_RESEARCHERS,
  INITIAL_INSTITUTIONS,
  INITIAL_PROJECTS
} from '../data/networkData';
import { ResearcherNode, InstitutionInfo, ResearchProject } from '../types';

interface GlobalSearchBarProps {
  onSelectResearcher: (researcher: ResearcherNode) => void;
  onSelectInstitution: (institutionName: string) => void;
  onSelectProject: (project: ResearchProject) => void;
  onSearchQuerySubmit?: (query: string) => void;
}

type FilterCategory = 'all' | 'researchers' | 'institutions' | 'projects';

export default function GlobalSearchBar({
  onSelectResearcher,
  onSelectInstitution,
  onSelectProject,
  onSearchQuerySubmit,
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Press '/' or 'Ctrl+K' / 'Cmd+K' to focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  // Filter datasets
  const matchedResearchers = INITIAL_RESEARCHERS.filter((r) => {
    if (!cleanQuery) return true;
    return (
      r.name.toLowerCase().includes(cleanQuery) ||
      r.institution.toLowerCase().includes(cleanQuery) ||
      r.domain.toLowerCase().includes(cleanQuery) ||
      r.role.toLowerCase().includes(cleanQuery)
    );
  });

  const matchedInstitutions = INITIAL_INSTITUTIONS.filter((inst) => {
    if (!cleanQuery) return true;
    return (
      inst.name.toLowerCase().includes(cleanQuery) ||
      inst.country.toLowerCase().includes(cleanQuery) ||
      inst.domainFocus.toLowerCase().includes(cleanQuery)
    );
  });

  const matchedProjects = INITIAL_PROJECTS.filter((p) => {
    if (!cleanQuery) return true;
    return (
      p.title.toLowerCase().includes(cleanQuery) ||
      p.grantNumber.toLowerCase().includes(cleanQuery) ||
      p.leadInstitution.toLowerCase().includes(cleanQuery) ||
      p.domain.toLowerCase().includes(cleanQuery) ||
      p.principalInvestigators.some((pi) => pi.toLowerCase().includes(cleanQuery))
    );
  });

  const totalResultsCount =
    (activeCategory === 'all' || activeCategory === 'researchers' ? matchedResearchers.length : 0) +
    (activeCategory === 'all' || activeCategory === 'institutions' ? matchedInstitutions.length : 0) +
    (activeCategory === 'all' || activeCategory === 'projects' ? matchedProjects.length : 0);

  const handleResearcherClick = (r: ResearcherNode) => {
    onSelectResearcher(r);
    setIsOpen(false);
  };

  const handleInstitutionClick = (instName: string) => {
    onSelectInstitution(instName);
    setIsOpen(false);
  };

  const handleProjectClick = (p: ResearchProject) => {
    onSelectProject(p);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearchQuerySubmit) {
      onSearchQuerySubmit('');
    }
    inputRef.current?.focus();
  };

  const handleQuickTagClick = (tagQuery: string) => {
    setQuery(tagQuery);
    setIsOpen(true);
    if (onSearchQuerySubmit) {
      onSearchQuerySubmit(tagQuery);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md md:max-w-lg">
      {/* Search Bar Input */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (onSearchQuerySubmit) {
              onSearchQuerySubmit(e.target.value);
            }
          }}
          placeholder="Global Search researchers, institutions, projects..."
          className="w-full pl-10 pr-20 py-2 bg-zinc-950/90 border border-zinc-800 focus:border-indigo-500/80 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
        />

        <div className="absolute right-2.5 flex items-center space-x-1">
          {query ? (
            <button
              onClick={handleClear}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Floating Search Results Dropdown Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-900/95 border border-zinc-800/90 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden space-y-3 p-3 max-h-[520px] overflow-y-auto">
          {/* Category Filter Pills Bar */}
          <div className="flex items-center space-x-1 border-b border-zinc-800/80 pb-2 text-[11px] font-medium">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              All ({matchedResearchers.length + matchedInstitutions.length + matchedProjects.length})
            </button>
            <button
              onClick={() => setActiveCategory('researchers')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCategory === 'researchers'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              Researchers ({matchedResearchers.length})
            </button>
            <button
              onClick={() => setActiveCategory('institutions')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCategory === 'institutions'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              Institutions ({matchedInstitutions.length})
            </button>
            <button
              onClick={() => setActiveCategory('projects')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCategory === 'projects'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              Projects ({matchedProjects.length})
            </button>
          </div>

          {/* Quick Filter Tag Suggestions when query is empty */}
          {!cleanQuery && (
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Suggested Quick Searches</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Stanford University',
                  'Quantum Computing',
                  'Dr. Alena Vass',
                  'Prof. Marcus Chen',
                  'NSF-AI-4092',
                  'CERN',
                  'CRISPR',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleQuickTagClick(tag)}
                    className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-indigo-950/60 text-zinc-300 hover:text-indigo-300 border border-zinc-800 hover:border-indigo-800/60 text-[11px] font-medium transition-all flex items-center space-x-1"
                  >
                    <Tag className="w-3 h-3 text-zinc-500" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results Fallback */}
          {totalResultsCount === 0 && cleanQuery && (
            <div className="p-6 text-center text-zinc-500 text-xs space-y-1">
              <p className="font-semibold text-zinc-400">No matching entities found</p>
              <p>Try searching for a researcher name, institution, or project grant number.</p>
            </div>
          )}

          {/* RESEARCHERS SECTION */}
          {(activeCategory === 'all' || activeCategory === 'researchers') && matchedResearchers.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>Researchers ({matchedResearchers.length})</span>
                </span>
                <span className="text-zinc-500 font-mono text-[9px]">Click to inspect in Graph</span>
              </div>

              <div className="space-y-1">
                {matchedResearchers.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleResearcherClick(r)}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-indigo-950/40 border border-zinc-800/80 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: r.color }}
                      >
                        {r.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-xs text-zinc-100 group-hover:text-indigo-300 transition-colors">
                            {r.name}
                          </p>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                            {r.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {r.institution} • <span className="text-zinc-300">{r.domain}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="text-right font-mono text-[10px]">
                        <span className="text-indigo-400 font-bold block">h-Index: {r.hIndex}</span>
                        <span className="text-zinc-500 block">{r.citations} citations</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INSTITUTIONS SECTION */}
          {(activeCategory === 'all' || activeCategory === 'institutions') && matchedInstitutions.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Building className="w-3 h-3" />
                  <span>Institutions ({matchedInstitutions.length})</span>
                </span>
                <span className="text-zinc-500 font-mono text-[9px]">Filter Graph by Institution</span>
              </div>

              <div className="space-y-1">
                {matchedInstitutions.map((inst) => (
                  <div
                    key={inst.id}
                    onClick={() => handleInstitutionClick(inst.name)}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-amber-950/40 border border-zinc-800/80 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-zinc-100 group-hover:text-amber-300 transition-colors">
                          {inst.name}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {inst.country} • <span className="text-zinc-300">{inst.domainFocus}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-zinc-900 text-amber-300 border border-zinc-800 font-semibold">
                        {inst.researcherCount} Faculty
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS SECTION */}
          {(activeCategory === 'all' || activeCategory === 'projects') && matchedProjects.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Briefcase className="w-3 h-3" />
                  <span>Projects & Grants ({matchedProjects.length})</span>
                </span>
                <span className="text-zinc-500 font-mono text-[9px]">Filter Graph by Project</span>
              </div>

              <div className="space-y-1">
                {matchedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => handleProjectClick(proj)}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-emerald-950/40 border border-zinc-800/80 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-xs text-zinc-100 group-hover:text-emerald-300 transition-colors">
                            {proj.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Grant: <span className="font-mono text-emerald-400 font-semibold">{proj.grantNumber}</span> • PIs:{' '}
                          {proj.principalInvestigators.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="px-2 py-1 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                        {proj.fundingAmount}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
