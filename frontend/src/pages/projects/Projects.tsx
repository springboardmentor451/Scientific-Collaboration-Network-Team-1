import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import { ProjectService } from '../../services/projectService';
import { ResearcherService } from '../../services/researcherService';
import type { Project, Researcher } from '../../types';
import { ProjectStatus } from '../../types';
import {
  Search,
  Plus,
  Users,
  ArrowRight,
  Clock,
  FolderKanban,
  CheckCircle2,
  XCircle,
  Activity,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

export const Projects: React.FC = () => {
  const { researcher: currentResearcher } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);

  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);

      try {
        const [projs, res] = await Promise.all([
          ProjectService.getAll(),
          ResearcherService.getAll(),
        ]);

        setProjects(projs);
        setResearchers(res);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [currentResearcher]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      if (activeTab === 'my') {
        if (!currentResearcher) return false;

        if (
          !project.researcher_ids?.includes(
            currentResearcher.researcher_id
          )
        ) {
          return false;
        }
      }

      const matchesQuery =
        !normalizedQuery ||
        project.name.toLowerCase().includes(normalizedQuery) ||
        (project.description || '')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        statusFilter === 'all' || project.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [
    projects,
    activeTab,
    query,
    statusFilter,
    currentResearcher,
  ]);

  const activeProjects = projects.filter(
    (project) => project.status === ProjectStatus.ACTIVE
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === ProjectStatus.COMPLETED
  ).length;

  const totalCollaborators = projects.reduce(
    (total, project) => total + (project.researcher_ids?.length || 0),
    0
  );

  const getStatusStyles = (status: ProjectStatus | string) => {
    if (status === ProjectStatus.ACTIVE) {
      return {
        badge:
          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
        icon: <Activity className="w-3 h-3" />,
      };
    }

    if (status === ProjectStatus.COMPLETED) {
      return {
        badge:
          'bg-navy-50 text-navy-700 dark:bg-navy-950/30 dark:text-navy-400',
        icon: <CheckCircle2 className="w-3 h-3" />,
      };
    }

    return {
      badge:
        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
      icon: <XCircle className="w-3 h-3" />,
    };
  };

  return (
    <div className="space-y-7 pb-8">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 text-white shadow-xl">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-navy-450/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Research Workspace
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Research Projects
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                Discover research initiatives, explore collaborative teams,
                and follow the progress of projects across the scientific
                network.
              </p>
            </div>

            {currentResearcher && (
              <Link
                to="/projects/new"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-navy-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          STATISTICS
      ========================================================= */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Projects
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
                {projects.length}
              </p>
            </div>

            <div className="rounded-xl bg-navy-50 p-2.5 text-navy-600 dark:bg-navy-950/30 dark:text-navy-400">
              <FolderKanban className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
                {activeProjects}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/30">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Completed
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-navy-600 dark:text-navy-400">
                {completedProjects}
              </p>
            </div>

            <div className="rounded-xl bg-navy-50 p-2.5 text-navy-600 dark:bg-navy-950/30 dark:text-navy-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Team Members
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
                {totalCollaborators}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

      </section>

      {/* =========================================================
          TABS
      ========================================================= */}
      {currentResearcher && (
        <div className="rounded-2xl border border-slate-200/70 bg-white px-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex overflow-x-auto">

            <button
              onClick={() => setActiveTab('all')}
              className={`relative flex items-center gap-2 whitespace-nowrap px-5 py-4 text-xs font-bold transition-colors ${
                activeTab === 'all'
                  ? 'text-navy-700 dark:text-navy-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              All Network Projects

              {activeTab === 'all' && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-navy-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('my')}
              className={`relative flex items-center gap-2 whitespace-nowrap px-5 py-4 text-xs font-bold transition-colors ${
                activeTab === 'my'
                  ? 'text-navy-700 dark:text-navy-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Users className="h-4 w-4" />
              My Collaborations

              {activeTab === 'my' && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-navy-600" />
              )}
            </button>

          </div>
        </div>
      )}

      {/* =========================================================
          SEARCH + FILTERS
      ========================================================= */}
      <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Find a project
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">

          <div className="relative lg:col-span-3">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search projects by name or description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-navy-500 focus:bg-white focus:ring-2 focus:ring-navy-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:bg-slate-900"
            />
          </div>

          <div className="relative">
            <Clock className="pointer-events-none absolute right-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-xs font-medium text-slate-600 outline-none transition-all focus:border-navy-500 focus:bg-white focus:ring-2 focus:ring-navy-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:focus:bg-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value={ProjectStatus.ACTIVE}>Active</option>
              <option value={ProjectStatus.COMPLETED}>Completed</option>
              <option value={ProjectStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

        </div>
      </section>

      {/* =========================================================
          RESULTS HEADER
      ========================================================= */}
      {!loading && (
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">
              {activeTab === 'my'
                ? 'My Research Projects'
                : 'Network Projects'}
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          </div>

          {(query || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setQuery('');
                setStatusFilter('all');
              }}
              className="text-[11px] font-semibold text-navy-600 hover:underline dark:text-navy-400"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* =========================================================
          LOADING
      ========================================================= */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex justify-between">
                <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="mt-5 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />

              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="mt-7 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="h-7 w-full rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}

        </div>
      ) : filteredProjects.length === 0 ? (

        /* =======================================================
           EMPTY STATE
        ======================================================= */
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 text-navy-600 dark:bg-navy-950/30 dark:text-navy-400">
            <FolderKanban className="h-7 w-7" />
          </div>

          <h3 className="mt-5 text-base font-bold text-slate-800 dark:text-white">
            No projects found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
            There are no research projects matching your current search
            and filter settings.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">

            {(query || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setQuery('');
                  setStatusFilter('all');
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Clear Filters
              </button>
            )}

            {currentResearcher && (
              <Link
                to="/projects/new"
                className="inline-flex items-center gap-2 rounded-xl bg-navy-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-navy-500"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Project
              </Link>
            )}

          </div>
        </div>

      ) : (

        /* =======================================================
           PROJECT CARDS
        ======================================================= */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {filteredProjects.map((project) => {
            const projectMembers = researchers.filter((researcher) =>
              project.researcher_ids?.includes(researcher.researcher_id)
            );

            const statusStyles = getStatusStyles(project.status);

            return (
              <article
                key={project.project_id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >

                {/* Top accent */}
                <div
                  className={`h-1 w-full ${
                    project.status === ProjectStatus.ACTIVE
                      ? 'bg-emerald-500'
                      : project.status === ProjectStatus.COMPLETED
                      ? 'bg-navy-500'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />

                <div className="flex flex-1 flex-col p-6">

                  {/* Status + ID */}
                  <div className="flex items-center justify-between gap-3">

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${statusStyles.badge}`}
                    >
                      {statusStyles.icon}
                      {project.status}
                    </span>

                    <span className="font-mono text-[9px] font-semibold text-slate-400">
                      PROJECT #{project.project_id}
                    </span>

                  </div>

                  {/* Title */}
                  <Link
                    to={`/projects/${project.project_id}`}
                    className="mt-5 line-clamp-2 text-lg font-bold leading-snug text-slate-800 transition-colors hover:text-navy-600 dark:text-white dark:hover:text-navy-400"
                  >
                    {project.name}
                  </Link>

                  {/* Description */}
                  <p className="mt-3 line-clamp-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                    {project.description ||
                      'No project description has been provided yet.'}
                  </p>

                  {/* Members */}
                  <div className="mt-6 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex -space-x-2">
                        {projectMembers.slice(0, 4).map((member) => (
                          <div
                            key={member.researcher_id}
                            title={member.name}
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-navy-600 text-[10px] font-bold text-white shadow-sm dark:border-slate-900"
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        ))}

                        {projectMembers.length > 4 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-500 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300">
                            +{projectMembers.length - 4}
                          </div>
                        )}

                        {projectMembers.length === 0 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-400 dark:border-slate-900 dark:bg-slate-800">
                            <Users className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {projectMembers.length}{' '}
                          {projectMembers.length === 1
                            ? 'researcher'
                            : 'researchers'}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          Project team
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">

                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      Research timeline
                    </div>

                    <Link
                      to={`/projects/${project.project_id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-[10px] font-bold text-slate-600 transition-all hover:border-navy-200 hover:bg-navy-50 hover:text-navy-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      View Project
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>

                  </div>

                </div>
              </article>
            );
          })}

        </div>
      )}

    </div>
  );
};