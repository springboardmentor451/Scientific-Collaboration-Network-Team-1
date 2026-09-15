import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProjectService } from '../../services/projectService';
import { ResearcherService } from '../../services/researcherService';
import { useAuth } from '../../contexts/Auth';
import type { Researcher } from '../../types';
import { ProjectStatus } from '../../types';
import {
  ArrowLeft,
  Save,
  Users,
  AlertCircle,
  Calendar,
  FileText,
  CheckCircle2,
  Search,
  X,
  UserPlus,
  Rocket,
  Pencil,
  ChevronRight,
} from 'lucide-react';

export const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { researcher: currentResearcher } = useAuth();

  const isEditMode = !!id;

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.ACTIVE);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedResearcherIds, setSelectedResearcherIds] = useState<number[]>([]);

  // Collection states
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [researcherSearch, setResearcherSearch] = useState('');

  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCollectionsAndForm = async () => {
      setLoading(true);
      setError('');

      try {
        const resList = await ResearcherService.getAll();
        setResearchers(resList);

        if (isEditMode) {
          const proj = await ProjectService.getById(Number(id));

          // Verify permissions: must be a project member to edit.
          if (
            currentResearcher &&
            !proj.researcher_ids?.includes(currentResearcher.researcher_id)
          ) {
            navigate('/projects', { replace: true });
            return;
          }

          setName(proj.name);
          setDescription(proj.description || '');
          setStatus(proj.status);
          setStartDate(proj.start_date || '');
          setEndDate(proj.end_date || '');
          setSelectedResearcherIds(proj.researcher_ids || []);
        } else {
          // Automatically include the current researcher when creating.
          if (currentResearcher) {
            setSelectedResearcherIds([currentResearcher.researcher_id]);
          }
        }
      } catch (err) {
        console.error('Failed to load project details:', err);
        setError('Unable to load the project form. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCollectionsAndForm();
  }, [id, isEditMode, currentResearcher, navigate]);

  const filteredResearchers = useMemo(() => {
    const query = researcherSearch.trim().toLowerCase();

    if (!query) {
      return researchers;
    }

    return researchers.filter((researcher) => {
      const searchableText = [
        researcher.name,
        researcher.department,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [researchers, researcherSearch]);

  const selectedResearchers = useMemo(() => {
    return researchers.filter((researcher) =>
      selectedResearcherIds.includes(researcher.researcher_id)
    );
  }, [researchers, selectedResearcherIds]);

  const handleCheckboxChange = (resId: number) => {
    setSelectedResearcherIds((prev) => {
      if (prev.includes(resId)) {
        // In create mode, the current researcher must remain on the team.
        if (
          !isEditMode &&
          currentResearcher &&
          resId === currentResearcher.researcher_id
        ) {
          return prev;
        }

        return prev.filter((researcherId) => researcherId !== resId);
      }

      return [...prev, resId];
    });
  };

  const removeResearcher = (resId: number) => {
    if (
      !isEditMode &&
      currentResearcher &&
      resId === currentResearcher.researcher_id
    ) {
      return;
    }

    setSelectedResearcherIds((prev) =>
      prev.filter((researcherId) => researcherId !== resId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();

    if (trimmedName.length < 5) {
      setError('Project name must be at least 5 characters long.');
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be prior to start date.');
      return;
    }

    if (selectedResearcherIds.length === 0) {
      setError('Please select at least one researcher for the project team.');
      return;
    }

    setSaving(true);

    try {
      // const payload = {
      //   name: trimmedName,
      //   description: description.trim() || null,
      //   status,
      //   start_date: startDate || null,
      //   end_date: endDate || null,
      //   researcher_ids: selectedResearcherIds,
      // };

      // if (isEditMode) {
      //   await ProjectService.update(Number(id), payload);
      //   navigate(`/projects/${id}`);
      // } else {
      //   await ProjectService.create(payload);
      //   navigate('/projects');
      // }
      const basePayload = {
        name: trimmedName,
        description: description.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        researcher_ids: selectedResearcherIds,
      };

      if (isEditMode) {
        await ProjectService.update(Number(id), { ...basePayload, status });
        navigate(`/projects/${id}`);
      } else {
        await ProjectService.create(basePayload);
        navigate('/projects');
      }
    } catch (err: any) {
      console.error('Failed to save project:', err);
      setError(err?.message || 'Failed to save project. Please try again.');
      setSaving(false);
    }
  };

  const getResearcherInitials = (researcher: Researcher) => {
    if (researcher.name) {
      return researcher.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
    }

    return 'R';
  };

  const getStatusDescription = (value: ProjectStatus) => {
    switch (value) {
      case ProjectStatus.ACTIVE:
        return 'Currently active and accepting research activity.';
      case ProjectStatus.COMPLETED:
        return 'Research work has been completed.';
      case ProjectStatus.CANCELLED:
        return 'Project has been stopped or cancelled.';
      default:
        return 'Select the current project lifecycle status.';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-5 w-32 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />

        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="h-40 bg-slate-100 dark:bg-slate-800 animate-pulse" />

          <div className="p-6 lg:p-8 space-y-6">
            <div className="h-8 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>

            <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Breadcrumb / Back */}
      <div className="mb-5">
        <Link
          to={isEditMode ? `/projects/${id}` : '/projects'}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-navy-600 dark:hover:text-navy-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {isEditMode ? 'Project' : 'Projects'}
        </Link>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-600 text-white shadow-xl mb-6">
        <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -left-24 -bottom-32 w-80 h-80 rounded-full bg-navy-400/10 blur-3xl" />

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-white/90 mb-4">
                {isEditMode ? (
                  <Pencil className="w-3.5 h-3.5" />
                ) : (
                  <Rocket className="w-3.5 h-3.5" />
                )}
                {isEditMode ? 'Project Configuration' : 'New Research Project'}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {isEditMode
                  ? 'Update project details'
                  : 'Create a new research project'}
              </h1>

              <p className="mt-3 text-sm sm:text-base text-white/70 leading-7 max-w-2xl">
                {isEditMode
                  ? 'Refine the project scope, timeline, status, and research team while keeping your collaboration workspace organized.'
                  : 'Define the research scope, project timeline, status, and collaborators in one place.'}
              </p>
            </div>

            <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/10 shrink-0">
              {isEditMode ? (
                <Pencil className="w-7 h-7 text-white/80" />
              ) : (
                <Rocket className="w-7 h-7 text-white/80" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Form Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Form Header */}
        <div className="px-6 py-5 sm:px-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-900/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-navy-600 dark:text-navy-400" />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isEditMode ? 'Project information' : 'Project information'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Complete the core details for this research workspace.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8 space-y-8">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-red-800 dark:text-red-300">
                    Unable to save project
                  </p>
                  <p className="text-xs text-red-700/80 dark:text-red-400 mt-1 leading-5">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Project Identity */}
            <section>
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-600 dark:text-navy-400">
                  01 · Project identity
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  What are you working on?
                </h3>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="project-name"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    Project name <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="project-name"
                    type="text"
                    required
                    minLength={5}
                    placeholder="e.g. Graph Mining for Academic Networks"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                  />

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Use a clear name that identifies the research initiative.
                    </p>
                    <span className="text-[11px] text-slate-400">
                      {name.length} characters
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="project-description"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    Description
                  </label>

                  <textarea
                    id="project-description"
                    rows={5}
                    placeholder="Describe the research objectives, study scope, methodology, funding constraints, or expected outcomes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-y focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                  />

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    A concise description helps collaborators quickly understand
                    the project's purpose.
                  </p>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-600 dark:text-navy-400">
                  02 · Timeline & status
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  Define the project lifecycle
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status */}
                {isEditMode && (
                  <div className="md:col-span-1">
                    <label
                      htmlFor="project-status"
                      className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                    >
                      Status <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="project-status"
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as ProjectStatus)
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                    >
                      <option value={ProjectStatus.ACTIVE}>Active</option>
                      <option value={ProjectStatus.COMPLETED}>Completed</option>
                      <option value={ProjectStatus.CANCELLED}>Cancelled</option>
                    </select>

                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-5">
                      {getStatusDescription(status)}
                    </p>
                  </div>
                )}

                {/* Start Date */}
                <div>
                  <label
                    htmlFor="start-date"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    Start date
                  </label>

                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                    <input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                    />
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    When the research initiative begins.
                  </p>
                </div>

                {/* End Date */}
                <div>
                  <label
                    htmlFor="end-date"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    End date
                  </label>

                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                    <input
                      id="end-date"
                      type="date"
                      min={startDate || undefined}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                    />
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    Optional expected completion date.
                  </p>
                </div>
              </div>
            </section>

            {/* Research Team */}
            <section className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-600 dark:text-navy-400">
                    03 · Research team
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    Choose your investigators
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Add researchers who should collaborate on this project.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Users className="w-3.5 h-3.5" />
                  {selectedResearcherIds.length} selected
                </div>
              </div>

              {/* Selected researchers */}
              {selectedResearchers.length > 0 && (
                <div className="mb-5 p-4 rounded-2xl border border-navy-100 dark:border-navy-900/60 bg-navy-50/50 dark:bg-navy-950/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-navy-600 dark:text-navy-400" />
                    <span className="text-xs font-bold text-navy-700 dark:text-navy-300">
                      Selected research team
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedResearchers.map((researcher) => {
                      const isSelf =
                        !!currentResearcher &&
                        researcher.researcher_id ===
                        currentResearcher.researcher_id;

                      return (
                        <div
                          key={researcher.researcher_id}
                          className="inline-flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                          <div className="w-7 h-7 rounded-lg bg-navy-100 dark:bg-navy-900/60 flex items-center justify-center text-[10px] font-bold text-navy-700 dark:text-navy-300">
                            {getResearcherInitials(researcher)}
                          </div>

                          <div className="max-w-[180px]">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {researcher.name}
                            </p>
                            {isSelf && (
                              <p className="text-[10px] text-navy-600 dark:text-navy-400 font-medium">
                                You
                              </p>
                            )}
                          </div>

                          {!(isSelf && !isEditMode) && (
                            <button
                              type="button"
                              onClick={() =>
                                removeResearcher(researcher.researcher_id)
                              }
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Remove researcher"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Researcher selector */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      type="text"
                      value={researcherSearch}
                      onChange={(e) => setResearcherSearch(e.target.value)}
                      placeholder="Search researchers by name, email, institution..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Researcher list */}
                <div className="max-h-72 overflow-y-auto p-2 bg-white dark:bg-slate-900">
                  {filteredResearchers.length === 0 ? (
                    <div className="py-10 text-center">
                      <Search className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        No researchers found
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try a different search term.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredResearchers.map((researcher) => {
                        const isSelected = selectedResearcherIds.includes(
                          researcher.researcher_id
                        );

                        const isSelf =
                          !!currentResearcher &&
                          researcher.researcher_id ===
                          currentResearcher.researcher_id;

                        return (
                          <label
                            key={researcher.researcher_id}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected
                              ? 'bg-navy-50 dark:bg-navy-950/30 border border-navy-100 dark:border-navy-900/60'
                              : 'border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/70'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                handleCheckboxChange(
                                  researcher.researcher_id
                                )
                              }
                              disabled={isSelf && !isEditMode}
                              className="w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                            />

                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                              {getResearcherInitials(researcher)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                  {researcher.name}
                                </p>

                                {isSelf && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-navy-100 dark:bg-navy-900/60 text-[9px] font-bold text-navy-700 dark:text-navy-300">
                                    YOU
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                {researcher.department || 'Researcher'}
                              </p>
                            </div>

                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-navy-600 dark:text-navy-400 shrink-0" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <UserPlus className="w-3.5 h-3.5" />
                    Select one or more researchers to form the project team.
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-5 sm:px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isEditMode
                    ? 'Changes will update this project.'
                    : 'Your project will be added to the research workspace.'}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate(isEditMode ? `/projects/${id}` : '/projects')
                  }
                  disabled={saving}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-navy-700 hover:bg-navy-600 text-white text-sm font-bold shadow-lg shadow-navy-700/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 min-w-[150px]"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEditMode ? 'Save changes' : 'Launch project'}
                      <ChevronRight className="w-4 h-4 opacity-70" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};