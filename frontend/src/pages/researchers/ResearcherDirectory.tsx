import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Landmark,
  Grid,
  List,
  GraduationCap,
  Users,
  BookOpen,
  FolderKanban,
  ArrowUpRight,
  Sparkles,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { ResearcherService } from '../../services/researcherService';
import { AdminService } from '../../services/adminService';
import { PublicationService } from '../../services/publicationService';
import { ProjectService } from '../../services/projectService';
import { CollaborationService } from '../../services/collaborationService';
import type { Researcher, Institution } from '../../types';

export const ResearcherDirectory: React.FC = () => {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [stats, setStats] = useState<
    Record<number, { pubs: number; projs: number; collabs: number }>
  >({});

  const [query, setQuery] = useState('');
  const [instFilter, setInstFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDirectory = async () => {
      setLoading(true);

      try {
        const resList = await ResearcherService.getAll();
        setResearchers(resList);

        const instList = await AdminService.getAllInstitutions();
        setInstitutions(instList);

        const calculatedStats: Record<
          number,
          { pubs: number; projs: number; collabs: number }
        > = {};

        for (const researcher of resList) {
          // const pubs = await PublicationService.getByResearcher(
          //   researcher.researcher_id
          // );
          const pubs = await PublicationService.getByResearcher(researcher.researcher_id);

          // const projs = await ProjectService.getByResearcher(
          //   researcher.researcher_id
          // );
          const projs = await ProjectService.getByResearcher(researcher.researcher_id);

          // const colls = await CollaborationService.getByResearcher(
          //   researcher.researcher_id
          // );
          const colls = await CollaborationService.getByResearcher(researcher.researcher_id);

          calculatedStats[researcher.researcher_id] = {
            pubs: pubs.length,
            projs: projs.length,
            collabs: colls.length,
          };
        }

        setStats(calculatedStats);
      } catch (err) {
        console.error('Failed to load researcher directory:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDirectory();
  }, []);

  const filteredResearchers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return researchers.filter((researcher) => {
      const matchesQuery =
        !normalizedQuery ||
        researcher.name.toLowerCase().includes(normalizedQuery) ||
        Boolean(
          researcher.department?.toLowerCase().includes(normalizedQuery)
        ) ||
        researcher.skills.some((skill) =>
          skill.toLowerCase().includes(normalizedQuery)
        ) ||
        researcher.research_interests.some((interest) =>
          interest.toLowerCase().includes(normalizedQuery)
        );

      const matchesInstitution =
        instFilter === 'all' ||
        researcher.institution_id === Number(instFilter);

      return matchesQuery && matchesInstitution;
    });
  }, [researchers, query, instFilter]);

  const totalPublications = useMemo(
    () =>
      Object.values(stats).reduce(
        (total, researcherStats) => total + researcherStats.pubs,
        0
      ),
    [stats]
  );

  const totalProjects = useMemo(
    () =>
      Object.values(stats).reduce(
        (total, researcherStats) => total + researcherStats.projs,
        0
      ),
    [stats]
  );

  const totalCollaborations = useMemo(
    () =>
      Object.values(stats).reduce(
        (total, researcherStats) => total + researcherStats.collabs,
        0
      ),
    [stats]
  );

  const hasFilters = query.trim() !== '' || instFilter !== 'all';

  const clearFilters = () => {
    setQuery('');
    setInstFilter('all');
  };

  const getInstitutionName = (institutionId?: number | null) => {
    return (
      institutions.find(
        (institution) => institution.institution_id === institutionId
      )?.name || 'Independent Researcher'
    );
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const renderStats = (
    researcherId: number,
    compact = false
  ) => {
    const researcherStats = stats[researcherId] || {
      pubs: 0,
      projs: 0,
      collabs: 0,
    };

    return (
      <div
        className={
          compact
            ? 'flex items-center gap-5'
            : 'grid grid-cols-3 gap-2'
        }
      >
        <div
          className={
            compact
              ? 'flex items-center gap-2'
              : 'rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 p-3'
          }
        >
          <BookOpen
            className={
              compact
                ? 'w-4 h-4 text-navy-500'
                : 'w-4 h-4 text-navy-500 mb-2'
            }
          />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {researcherStats.pubs}
            </p>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
              Pubs
            </p>
          </div>
        </div>

        <div
          className={
            compact
              ? 'flex items-center gap-2'
              : 'rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 p-3'
          }
        >
          <FolderKanban
            className={
              compact
                ? 'w-4 h-4 text-indigo-500'
                : 'w-4 h-4 text-indigo-500 mb-2'
            }
          />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {researcherStats.projs}
            </p>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
              Projects
            </p>
          </div>
        </div>

        <div
          className={
            compact
              ? 'flex items-center gap-2'
              : 'rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 p-3'
          }
        >
          <Users
            className={
              compact
                ? 'w-4 h-4 text-cyan-500'
                : 'w-4 h-4 text-cyan-500 mb-2'
            }
          />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {researcherStats.collabs}
            </p>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
              Links
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-7 pb-8">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-indigo-950 px-6 py-7 sm:px-8 sm:py-9 text-white shadow-xl">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Research Network
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
                Discover Researchers
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
                Explore researchers, academic expertise, institutions and
                collaboration opportunities across your scientific network.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="min-w-[90px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xl font-bold">{researchers.length}</p>
                <p className="mt-1 text-[9px] uppercase tracking-wider text-white/50">
                  Researchers
                </p>
              </div>

              <div className="min-w-[90px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xl font-bold">{institutions.length}</p>
                <p className="mt-1 text-[9px] uppercase tracking-wider text-white/50">
                  Institutions
                </p>
              </div>

              <div className="min-w-[90px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xl font-bold">{totalCollaborations}</p>
                <p className="mt-1 text-[9px] uppercase tracking-wider text-white/50">
                  Connections
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-950/40">
              <BookOpen className="h-5 w-5 text-navy-600 dark:text-navy-400" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Network
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            {totalPublications}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Publications represented
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
              <FolderKanban className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Active
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            {totalProjects}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Research projects represented
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950/30">
              <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Connected
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            {totalCollaborations}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Collaboration links
          </p>
        </div>
      </section>

      {/* Search & Controls */}
      <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search researchers, expertise, skills or departments..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10 transition"
            />

            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative lg:w-64">
            <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

            <select
              value={instFilter}
              onChange={(event) => setInstFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-10 pr-9 text-sm text-slate-700 dark:text-slate-200 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
            >
              <option value="all">All Institutions</option>

              {institutions.map((institution) => (
                <option
                  key={institution.institution_id}
                  value={institution.institution_id}
                >
                  {institution.name}
                </option>
              ))}
            </select>

            <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="flex items-center justify-between lg:justify-start gap-3">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}

            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2 transition ${viewMode === 'grid'
                  ? 'bg-navy-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                title="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2 transition ${viewMode === 'list'
                  ? 'bg-navy-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5" />
            <span>
              Showing{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {filteredResearchers.length}
              </strong>{' '}
              of {researchers.length} researchers
            </span>
          </div>

          {hasFilters && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-600 dark:text-navy-400">
              <Sparkles className="h-3 w-3" />
              Filters active
            </span>
          )}
        </div>
      </section>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1">
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="mt-2 h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>

              <div className="mt-5 h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-2 h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-800" />

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((stat) => (
                  <div
                    key={stat}
                    className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredResearchers.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Search className="h-7 w-7 text-slate-400" />
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
            No researchers found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            We couldn't find any researchers matching your current search or
            institution filter.
          </p>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-navy-700 transition"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredResearchers.map((researcher) => {
            const institutionName = getInstitutionName(
              researcher.institution_id
            );

            return (
              <article
                key={researcher.researcher_id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:-translate-y-1 hover:border-navy-200 dark:hover:border-navy-800 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-20 bg-gradient-to-br from-navy-800 via-navy-700 to-indigo-900">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute right-5 top-4 h-20 w-20 rounded-full border border-white/20" />
                    <div className="absolute right-10 top-9 h-10 w-10 rounded-full border border-white/10" />
                  </div>
                </div>

                <div className="relative px-5 pb-5">
                  <div className="-mt-8 flex items-end justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white dark:border-slate-900 bg-navy-600 text-lg font-bold text-white shadow-lg">
                      {getInitials(researcher.name)}
                    </div>

                    <Link
                      to={`/researchers/${researcher.researcher_id}`}
                      className="mb-1 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200 opacity-90 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      Profile
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-navy-600 dark:group-hover:text-navy-400 transition-colors">
                      {researcher.name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <GraduationCap className="h-3.5 w-3.5 text-navy-500" />
                      <span className="truncate">
                        {researcher.department || 'Researcher'}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Landmark className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{institutionName}</span>
                    </div>
                  </div>

                  <p className="mt-4 min-h-[54px] text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {researcher.bio ||
                      'This researcher has not added a biography yet.'}
                  </p>

                  <div className="mt-4">
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Research expertise
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {researcher.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-navy-100 bg-navy-50 px-2 py-1 text-[9px] font-semibold text-navy-650 dark:border-navy-900/40 dark:bg-navy-950/40 dark:text-navy-400"
                        >
                          {skill}
                        </span>
                      ))}

                      {researcher.skills.length > 3 && (
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          +{researcher.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                    {renderStats(researcher.researcher_id)}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="hidden md:grid grid-cols-[minmax(250px,1.4fr)_minmax(180px,1fr)_auto_auto] gap-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-5 py-3">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Researcher
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Expertise
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Activity
            </span>
            <span />
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredResearchers.map((researcher) => {
              const institutionName = getInstitutionName(
                researcher.institution_id
              );

              return (
                <div
                  key={researcher.researcher_id}
                  className="group grid grid-cols-1 md:grid-cols-[minmax(250px,1.4fr)_minmax(180px,1fr)_auto_auto] items-center gap-5 px-5 py-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-700 to-indigo-800 text-sm font-bold text-white shadow-sm">
                      {getInitials(researcher.name)}
                    </div>

                    <div className="min-w-0">
                      <Link
                        to={`/researchers/${researcher.researcher_id}`}
                        className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-navy-600 dark:group-hover:text-navy-400 transition-colors"
                      >
                        {researcher.name}
                      </Link>

                      <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 truncate">
                        <GraduationCap className="h-3 w-3 shrink-0" />
                        {researcher.department || 'Researcher'}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                        <Landmark className="h-3 w-3 shrink-0" />
                        {institutionName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {researcher.research_interests
                      .slice(0, 3)
                      .map((interest) => (
                        <span
                          key={interest}
                          className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[9px] font-semibold text-slate-600 dark:text-slate-400"
                        >
                          {interest}
                        </span>
                      ))}

                    {researcher.research_interests.length > 3 && (
                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[9px] font-semibold text-slate-400">
                        +{researcher.research_interests.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="text-slate-500">
                    {renderStats(researcher.researcher_id, true)}
                  </div>

                  <Link
                    to={`/researchers/${researcher.researcher_id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-400 hover:bg-navy-600 hover:text-white hover:border-navy-600 transition"
                    title="Open researcher profile"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};