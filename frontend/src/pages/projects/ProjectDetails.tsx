import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import { ProjectService } from '../../services/projectService';
import { ResearcherService } from '../../services/researcherService';
import { PublicationService } from '../../services/publicationService';
import type { Project, Researcher, Publication } from '../../types';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  BookOpen,
  Activity,
  Users,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { researcher: currentResearcher } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Researcher[]>([]);
  const [relatedPubs, setRelatedPubs] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const loadProjectDetails = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const proj = await ProjectService.getById(Number(id));
        setProject(proj);

        if (
          currentResearcher &&
          proj.researcher_ids?.includes(currentResearcher.researcher_id)
        ) {
          setIsMember(true);
        } else {
          setIsMember(false);
        }

        const allRes = await ResearcherService.getAll();

        const linkedMembers = allRes.filter((researcher) =>
          proj.researcher_ids?.includes(researcher.researcher_id)
        );

        setMembers(linkedMembers);

        const memberIds = linkedMembers.map(
          (member) => member.researcher_id
        );

        const allPubs = await PublicationService.getAll();

        const linkedPubs = allPubs.filter((publication) =>
          publication.researcher_ids?.some((researcherId) =>
            memberIds.includes(researcherId)
          )
        );

        setRelatedPubs(linkedPubs);
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetails();
  }, [id, currentResearcher]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this project? This is irreversible.'
      )
    ) {
      return;
    }

    if (project) {
      try {
        await ProjectService.delete(project.project_id);
        navigate('/projects');
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('Failed to delete project.');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-8">

        <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

        <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="h-2 bg-slate-200 dark:bg-slate-800" />

          <div className="p-7">
            <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-5 h-8 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-2 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="lg:col-span-5">
            <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 text-navy-600 dark:bg-navy-950/30 dark:text-navy-400">
            <FolderKanban className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-800 dark:text-white">
            Project Not Found
          </h2>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            The requested research project does not exist or is no longer
            available in the network.
          </p>

          <Link
            to="/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-navy-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Projects
          </Link>

        </div>
      </div>
    );
  }

  /*
   * Existing milestone presentation is retained for the current frontend.
   * These are visual project phases and are not persisted backend milestones.
   */
  const timelines = [
    {
      title: 'Project Initiated',
      desc: 'Core parameters mapped and researchers linked to the project.',
      date: project.start_date || 'Initial Phase',
      status: 'completed',
    },
    {
      title: 'Bibliography Integration',
      desc: 'Literature review and citation mappings integrated into the workspace.',
      date: 'Phase 2',
      status:
        project.status === 'completed'
          ? 'completed'
          : 'active',
    },
    {
      title: 'Final Report Drafting',
      desc: 'Research outputs and academic summaries prepared for final review.',
      date: project.end_date || 'End Phase',
      status:
        project.status === 'completed'
          ? 'completed'
          : 'pending',
    },
  ];

  const isActive = project.status === 'active';
  const isCompleted = project.status === 'completed';

  const statusLabel = project.status || 'Unknown';

  return (
    <div className="space-y-7 pb-8">

      {/* =========================================================
          TOP NAVIGATION
      ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-navy-600 dark:hover:text-navy-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {isMember && (
          <div className="flex items-center gap-2">

            <Link
              to={`/projects/${project.project_id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>

            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-red-100 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>

          </div>
        )}

      </div>

      {/* =========================================================
          HERO / PROJECT HEADER
      ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 text-white shadow-xl">

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-navy-450/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative p-6 sm:p-8 lg:p-9">

          <div className="flex flex-wrap items-center gap-2">

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] ${
                isActive
                  ? 'bg-emerald-400/15 text-emerald-200'
                  : isCompleted
                  ? 'bg-white/10 text-white/80'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {isActive ? (
                <Activity className="h-3 w-3" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Clock3 className="h-3 w-3" />
              )}

              {statusLabel}
            </span>

            <span className="text-[9px] font-mono font-semibold tracking-wider text-white/40">
              SCN-PROJ-{project.project_id}
            </span>

          </div>

          <div className="mt-6 max-w-4xl">

            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
              <Sparkles className="h-3.5 w-3.5" />
              Research Initiative
            </div>

            <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              {project.name}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/65">
              {project.description ||
                'No project description has been provided yet.'}
            </p>

          </div>

          {/* Project metadata */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/40">
                <Calendar className="h-4 w-4" />
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  Start Date
                </span>
              </div>

              <p className="mt-2 text-sm font-bold text-white/90">
                {project.start_date || 'Not specified'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/40">
                <Clock3 className="h-4 w-4" />
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  End Date
                </span>
              </div>

              <p className="mt-2 text-sm font-bold text-white/90">
                {project.end_date || 'Ongoing'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/40">
                <Users className="h-4 w-4" />
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  Research Team
                </span>
              </div>

              <p className="mt-2 text-sm font-bold text-white/90">
                {members.length}{' '}
                {members.length === 1 ? 'Researcher' : 'Researchers'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          QUICK STATS
      ========================================================= */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">

        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600 dark:bg-navy-950/30 dark:text-navy-400">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Researchers
              </p>
              <p className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
                {members.length}
              </p>
            </div>

          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Related Outputs
              </p>
              <p className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
                {relatedPubs.length}
              </p>
            </div>

          </div>
        </div>

        <div className="col-span-2 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Activity className="h-5 w-5" />
              )}
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Current State
              </p>
              <p className="mt-1 text-sm font-bold capitalize text-slate-800 dark:text-white">
                {statusLabel}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* =======================================================
            LEFT COLUMN
        ======================================================= */}
        <div className="space-y-6 lg:col-span-7">

          {/* Research Team */}
          <section className="rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">

              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                  Research Team
                </h2>

                <p className="mt-1 text-[10px] text-slate-400">
                  Researchers connected to this project
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 dark:bg-slate-950">
                <Users className="h-4 w-4" />
              </div>

            </div>

            <div className="p-6">

              {members.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
                  <Users className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-700" />

                  <p className="mt-3 text-xs font-semibold text-slate-400">
                    No researchers linked
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {members.map((member) => (
                    <div
                      key={member.researcher_id}
                      className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-navy-200 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-600 text-sm font-bold text-white shadow-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">

                          <Link
                            to={`/researchers/${member.researcher_id}`}
                            className="block truncate text-xs font-bold text-slate-700 transition-colors hover:text-navy-600 dark:text-slate-200 dark:hover:text-navy-400"
                          >
                            {member.name}
                          </Link>

                          <p className="mt-1 truncate text-[10px] text-slate-400">
                            {member.department || 'Academic Department'}
                          </p>

                        </div>

                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-navy-500" />

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>
          </section>

          {/* Related Publications */}
          <section className="rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">

              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                  Related Research Outputs
                </h2>

                <p className="mt-1 text-[10px] text-slate-400">
                  Publications associated with the project team
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                <BookOpen className="h-4 w-4" />
              </div>

            </div>

            <div className="p-6">

              {relatedPubs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-9 text-center dark:border-slate-800">

                  <BookOpen className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-700" />

                  <p className="mt-3 text-xs font-semibold text-slate-400">
                    No related publications found
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Research outputs will appear here when available.
                  </p>

                </div>
              ) : (
                <div className="space-y-3">

                  {relatedPubs.map((publication) => (
                    <Link
                      key={publication.publication_id}
                      to={`/publications/${publication.publication_id}`}
                      className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-navy-200 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900"
                    >

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600 dark:bg-navy-950/30 dark:text-navy-400">
                        <BookOpen className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="line-clamp-2 text-xs font-bold leading-5 text-slate-700 transition-colors group-hover:text-navy-600 dark:text-slate-200 dark:group-hover:text-navy-400">
                            {publication.title}
                          </h3>

                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {publication.publication_type}
                          </span>

                        </div>

                        <p className="mt-2 text-[10px] text-slate-400">
                          View publication details
                        </p>

                      </div>

                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-navy-500" />

                    </Link>
                  ))}

                </div>
              )}

            </div>
          </section>

        </div>

        {/* =======================================================
            RIGHT COLUMN — TIMELINE
        ======================================================= */}
        <div className="lg:col-span-5">

          <section className="sticky top-6 rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600 dark:bg-navy-950/30 dark:text-navy-400">
                  <Activity className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                    Project Milestones
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Current research progression
                  </p>
                </div>

              </div>

            </div>

            <div className="p-6">

              <div className="relative">

                {timelines.map((node, index) => {
                  const isLast = index === timelines.length - 1;

                  return (
                    <div
                      key={index}
                      className={`relative flex gap-4 ${
                        !isLast ? 'pb-8' : ''
                      }`}
                    >

                      {/* Connector */}
                      {!isLast && (
                        <div
                          className={`absolute left-[15px] top-8 h-full w-px ${
                            node.status === 'completed'
                              ? 'bg-emerald-200 dark:bg-emerald-900/50'
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      )}

                      {/* Node */}
                      <div className="relative z-10 shrink-0">

                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-4 border-white dark:border-slate-900 ${
                            node.status === 'completed'
                              ? 'bg-emerald-500 text-white'
                              : node.status === 'active'
                              ? 'bg-navy-600 text-white shadow-md shadow-navy-500/20'
                              : 'bg-slate-200 text-slate-400 dark:bg-slate-800'
                          }`}
                        >
                          {node.status === 'completed' ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : node.status === 'active' ? (
                            <Activity className="h-3.5 w-3.5" />
                          ) : (
                            <Clock3 className="h-3.5 w-3.5" />
                          )}
                        </div>

                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 pt-0.5">

                        <div className="flex flex-wrap items-center justify-between gap-2">

                          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {node.title}
                          </h3>

                          <span
                            className={`rounded-md px-2 py-1 text-[8px] font-bold uppercase tracking-wider ${
                              node.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : node.status === 'active'
                                ? 'bg-navy-50 text-navy-600 dark:bg-navy-950/30 dark:text-navy-400'
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                            }`}
                          >
                            {node.status}
                          </span>

                        </div>

                        <p className="mt-2 text-[10px] leading-5 text-slate-400">
                          {node.desc}
                        </p>

                        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {node.date}
                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
};