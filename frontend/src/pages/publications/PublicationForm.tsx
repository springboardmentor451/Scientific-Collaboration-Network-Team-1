import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PublicationService } from '../../services/publicationService';
import { ResearcherService } from '../../services/researcherService';
import { ConferenceService } from '../../services/conferenceService';
import { useAuth } from '../../contexts/Auth';
import type { Researcher, Conference } from '../../types';
import { PublicationType, PublicationStatus } from '../../types';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Users,
  AlertCircle,
  FileText,
  Search,
  Calendar,
  Link as LinkIcon,
  Landmark,
  UserPlus,
  CheckCircle2,
  X,
  BookOpen,
  UploadCloud,
  Pencil,
  Send,
} from 'lucide-react';

export const PublicationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { researcher: currentResearcher } = useAuth();

  const isEditMode = !!id;

  // Form states
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [pubType, setPubType] = useState<PublicationType>(
    PublicationType.JOURNAL
  );
  const [status, setStatus] = useState<PublicationStatus>(
    PublicationStatus.DRAFT
  );
  const [pubDate, setPubDate] = useState('');
  const [doi, setDoi] = useState('');
  const [conferenceId, setConferenceId] = useState<number | undefined>(
    undefined
  );
  const [selectedResearcherIds, setSelectedResearcherIds] = useState<
    number[]
  >([]);
  const [externalAuthors, setExternalAuthors] = useState<string[]>([]);
  const [newExtAuthor, setNewExtAuthor] = useState('');

  // Collections
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);

  // UI states
  const [researcherSearch, setResearcherSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCollectionsAndForm = async () => {
      setLoading(true);
      setError('');

      try {
        const [resList, confList] = await Promise.all([
          ResearcherService.getAll(),
          ConferenceService.getAll(),
        ]);

        setResearchers(resList);
        setConferences(confList);

        if (isEditMode) {
          const pub = await PublicationService.getById(Number(id));

          // Verify editing permission.
          if (
            currentResearcher &&
            !pub.researcher_ids?.includes(
              currentResearcher.researcher_id
            )
          ) {
            navigate('/publications', { replace: true });
            return;
          }

          setTitle(pub.title);
          setAbstract(pub.abstract || '');
          setPubType(pub.publication_type);
          setStatus(pub.status);
          setPubDate(pub.publication_date || '');
          setDoi(pub.doi || '');
          setConferenceId(pub.conference_id || undefined);
          setSelectedResearcherIds(pub.researcher_ids || []);
          setExternalAuthors(pub.external_authors || []);
        } else {
          if (currentResearcher) {
            setSelectedResearcherIds([
              currentResearcher.researcher_id,
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load form details:', err);
        setError(
          'Unable to load the publication editor. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadCollectionsAndForm();
  }, [id, isEditMode, currentResearcher, navigate]);

  const filteredResearchers = useMemo(() => {
    const query = researcherSearch.trim().toLowerCase();

    if (!query) return researchers;

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

  const handleAddExternalAuthor = () => {
    const cleanName = newExtAuthor.trim();

    if (
      cleanName &&
      !externalAuthors.some(
        (author) => author.toLowerCase() === cleanName.toLowerCase()
      )
    ) {
      setExternalAuthors((prev) => [...prev, cleanName]);
      setNewExtAuthor('');
    }
  };

  const handleRemoveExternalAuthor = (name: string) => {
    setExternalAuthors((prev) =>
      prev.filter((author) => author !== name)
    );
  };

  const handleExternalAuthorKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddExternalAuthor();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanTitle = title.trim();

    if (cleanTitle.length < 5) {
      setError(
        'Publication title must be at least 5 characters long.'
      );
      return;
    }

    if (selectedResearcherIds.length === 0) {
      setError('Please select at least one internal author.');
      return;
    }

    if (pubType === PublicationType.CONFERENCE && !conferenceId) {
      setError(
        'Please select the associated conference for a conference publication.'
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: cleanTitle,
        abstract: abstract.trim() || null,
        doi: doi.trim() || null,
        publication_type: pubType,
        status,
        publication_date: pubDate || null,
        conference_id: conferenceId || null,
        researcher_ids: selectedResearcherIds,
        external_authors: externalAuthors,
      };

      if (isEditMode) {
        await PublicationService.update(Number(id), payload);
        navigate(`/publications/${id}`);
      } else {
        await PublicationService.create(payload);
        navigate('/publications');
      }
    } catch (err: any) {
      console.error('Failed to save publication:', err);
      setError(
        err?.message ||
        'Failed to save publication. Please try again.'
      );
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'R'
    );
  };

  const getStatusDescription = (value: PublicationStatus) => {
    switch (value) {
      case PublicationStatus.DRAFT:
        return 'Work in progress and not yet submitted.';
      case PublicationStatus.SUBMITTED:
        return 'Submitted for review or publication.';
      case PublicationStatus.PUBLISHED:
        return 'Officially published and publicly available.';
      case PublicationStatus.ARCHIVED:
        return 'Retained for historical or reference purposes.';
      default:
        return 'Select the current publication status.';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />

        <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="h-44 bg-slate-100 dark:bg-slate-800 animate-pulse" />

          <div className="p-6 sm:p-8 space-y-6">
            <div className="h-8 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />

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
      {/* Back */}
      <div className="mb-5">
        <Link
          to={
            isEditMode
              ? `/publications/${id}`
              : '/publications'
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-navy-600 dark:hover:text-navy-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {isEditMode ? 'publication' : 'publications'}
        </Link>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-600 text-white shadow-xl mb-6">
        <div className="absolute -right-24 -top-28 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-24 -bottom-32 w-96 h-96 rounded-full bg-navy-400/10 blur-3xl" />

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold mb-4">
                {isEditMode ? (
                  <Pencil className="w-3.5 h-3.5" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5" />
                )}

                {isEditMode
                  ? 'Publication Configuration'
                  : 'New Publication'}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {isEditMode
                  ? 'Update publication details'
                  : 'Register a new publication'}
              </h1>

              <p className="mt-3 text-sm sm:text-base text-white/70 leading-7 max-w-2xl">
                {isEditMode
                  ? 'Keep your publication metadata, authorship, conference information, and research record up to date.'
                  : 'Create a structured publication record that connects your research, collaborators, conferences, and citation network.'}
              </p>
            </div>

            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 border border-white/10 items-center justify-center shrink-0">
              <FileText className="w-7 h-7 text-white/80" />
            </div>
          </div>
        </div>
      </section>

      {/* Main form */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="px-6 py-5 sm:px-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-950/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-navy-600 dark:text-navy-400" />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Publication information
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Add the core metadata for this research work.
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

                <div>
                  <p className="text-sm font-bold text-red-800 dark:text-red-300">
                    Unable to save publication
                  </p>

                  <p className="text-xs text-red-700/80 dark:text-red-400 mt-1 leading-5">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Section 01 */}
            <section>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-600 dark:text-navy-400">
                  01 · Research work
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  Describe the publication
                </h3>
              </div>

              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label
                    htmlFor="publication-title"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    Publication title{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="publication-title"
                    type="text"
                    required
                    minLength={5}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Analyzing Scientific Collaborations via Graph Architectures"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                  />

                  <div className="flex justify-between gap-4 mt-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Use the official title of the research work.
                    </p>

                    <span className="text-[11px] text-slate-400 shrink-0">
                      {title.length} characters
                    </span>
                  </div>
                </div>

                {/* Abstract */}
                <div>
                  <label
                    htmlFor="publication-abstract"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    Abstract
                  </label>

                  <textarea
                    id="publication-abstract"
                    rows={7}
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="Summarize the research problem, methodology, major findings, and significance..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-y focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                  />

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    A clear abstract makes the publication easier to
                    understand and discover.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 02 */}
            <section className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-600 dark:text-navy-400">
                  02 · Publication metadata
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  Classify the research
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type */}
                <div>
                  <label
                    htmlFor="publication-type"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    Publication type{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="publication-type"
                    value={pubType}
                    onChange={(e) =>
                      setPubType(e.target.value as PublicationType)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                  >
                    <option value={PublicationType.JOURNAL}>
                      Journal Article
                    </option>
                    <option value={PublicationType.CONFERENCE}>
                      Conference Proceeding
                    </option>
                    <option value={PublicationType.BOOK}>
                      Book Chapter
                    </option>
                    <option value={PublicationType.PATENT}>
                      Patent
                    </option>
                    <option value={PublicationType.REPORT}>
                      Technical Report
                    </option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="publication-status"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    Status <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="publication-status"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as PublicationStatus)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                  >
                    <option value={PublicationStatus.DRAFT}>
                      Draft
                    </option>
                    <option value={PublicationStatus.SUBMITTED}>
                      Submitted
                    </option>
                    <option value={PublicationStatus.PUBLISHED}>
                      Published
                    </option>
                    <option value={PublicationStatus.ARCHIVED}>
                      Archived
                    </option>
                  </select>

                  <p className="text-[11px] text-slate-400 mt-2 leading-5">
                    {getStatusDescription(status)}
                  </p>
                </div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="publication-date"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    Publication date
                  </label>

                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                    <input
                      id="publication-date"
                      type="date"
                      value={pubDate}
                      onChange={(e) => setPubDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 03 */}
            <section className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-600 dark:text-navy-400">
                  03 · Identifiers & venue
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  Connect the publication
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* DOI */}
                <div>
                  <label
                    htmlFor="publication-doi"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    DOI identifier
                  </label>

                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      id="publication-doi"
                      type="text"
                      value={doi}
                      onChange={(e) => setDoi(e.target.value)}
                      placeholder="10.1145/3318464.3389700"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                    />
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    Add the DOI without the https://doi.org/ prefix.
                  </p>
                </div>

                {/* Conference */}
                <div>
                  <label
                    htmlFor="publication-conference"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    Associated conference
                  </label>

                  <div className="relative">
                    <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                    <select
                      id="publication-conference"
                      value={conferenceId || ''}
                      onChange={(e) =>
                        setConferenceId(
                          e.target.value
                            ? Number(e.target.value)
                            : undefined
                        )
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                    >
                      <option value="">
                        -- Select conference --
                      </option>

                      {conferences.map((conference) => (
                        <option
                          key={conference.conference_id}
                          value={conference.conference_id}
                        >
                          {conference.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    Required when registering a conference proceeding.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 04 - Internal authors */}
            <section className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-600 dark:text-navy-400">
                    04 · Research team
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    Add internal authors
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Select researchers who have a profile on SCN.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Users className="w-3.5 h-3.5" />
                  {selectedResearcherIds.length} selected
                </div>
              </div>

              {/* Selected authors */}
              {selectedResearchers.length > 0 && (
                <div className="mb-5 p-4 rounded-2xl border border-navy-100 dark:border-navy-900/60 bg-navy-50/50 dark:bg-navy-950/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-navy-600 dark:text-navy-400" />

                    <span className="text-xs font-bold text-navy-700 dark:text-navy-300">
                      Publication authors
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
                            {getInitials(researcher.name)}
                          </div>

                          <div className="max-w-[180px]">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {researcher.name}
                            </p>

                            {isSelf && (
                              <p className="text-[10px] font-medium text-navy-600 dark:text-navy-400">
                                You
                              </p>
                            )}
                          </div>

                          {!(isSelf && !isEditMode) && (
                            <button
                              type="button"
                              onClick={() =>
                                removeResearcher(
                                  researcher.researcher_id
                                )
                              }
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Remove author"
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

              {/* Author search */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      type="text"
                      value={researcherSearch}
                      onChange={(e) =>
                        setResearcherSearch(e.target.value)
                      }
                      placeholder="Search researchers by name, email, institution..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto p-2 bg-white dark:bg-slate-900">
                  {filteredResearchers.length === 0 ? (
                    <div className="py-10 text-center">
                      <Search className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-2" />

                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        No researchers found
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Try another search term.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredResearchers.map((researcher) => {
                        const isSelected =
                          selectedResearcherIds.includes(
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
                              {getInitials(researcher.name)}
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
                    Select one or more researchers who contributed to
                    the publication.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 05 - External authors */}
            <section className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-600 dark:text-navy-400">
                  05 · External contributors
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  Add external co-authors
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Record contributors who do not have an SCN researcher
                  profile.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 p-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      type="text"
                      value={newExtAuthor}
                      onChange={(e) =>
                        setNewExtAuthor(e.target.value)
                      }
                      onKeyDown={handleExternalAuthorKeyDown}
                      placeholder="e.g. Dr. Sarah Connor"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddExternalAuthor}
                    disabled={!newExtAuthor.trim()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add author
                  </button>
                </div>

                {externalAuthors.length > 0 ? (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      External authors · {externalAuthors.length}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {externalAuthors.map((author) => (
                        <div
                          key={author}
                          className="inline-flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                        >
                          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-500">
                            EX
                          </div>

                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {author}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveExternalAuthor(author)
                            }
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Remove external author"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                    No external contributors added yet.
                  </p>
                )}
              </div>
            </section>

            {/* Summary */}
            <section className="border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="rounded-2xl bg-navy-50/60 dark:bg-navy-950/20 border border-navy-100 dark:border-navy-900/50 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-navy-600 dark:text-navy-400" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-navy-800 dark:text-navy-300">
                      Publication record summary
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-5">
                      {selectedResearcherIds.length} internal author
                      {selectedResearcherIds.length !== 1
                        ? 's'
                        : ''}{' '}
                      · {externalAuthors.length} external contributor
                      {externalAuthors.length !== 1 ? 's' : ''} ·{' '}
                      {pubType.toLowerCase()} ·{' '}
                      {status.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 sm:px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <CheckCircle2 className="w-4 h-4" />

                <span>
                  {isEditMode
                    ? 'Changes will update this publication.'
                    : 'Your publication will be added to the research network.'}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    navigate(
                      isEditMode
                        ? `/publications/${id}`
                        : '/publications'
                    )
                  }
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-navy-700 hover:bg-navy-600 text-white text-sm font-bold shadow-lg shadow-navy-700/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 min-w-[170px]"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <Save className="w-4 h-4" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}

                      {isEditMode
                        ? 'Save changes'
                        : 'Register publication'}
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