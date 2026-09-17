import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import { PublicationService } from '../../services/publicationService';
import { ResearcherService } from '../../services/researcherService';
import { CitationService } from '../../services/citationService';
import type { Publication, Researcher } from '../../types';
import { PublicationType, PublicationStatus } from '../../types';
import {
  Search,
  BookOpen,
  Plus,
  FileText,
  Calendar,
  Link as LinkIcon,
  Trash2,
  Edit,
  Award,
  Users,
  ArrowUpRight,
  Sparkles,
  X,
  Filter,
  Library,
} from 'lucide-react';

export const Publications: React.FC = () => {
  const { researcher: currentResearcher } = useAuth();

  const [publications, setPublications] = useState<Publication[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [citationCounts, setCitationCounts] = useState<
    Record<number, number>
  >({});

  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPublications = async () => {
      setLoading(true);

      try {
        const pubs = await PublicationService.getAll();
        setPublications(pubs);

        const res = await ResearcherService.getAll();
        setResearchers(res);

        const counts: Record<number, number> = {};

        // for (const publication of pubs) {
        await Promise.all(
          pubs.map(async (publication) => {
            try {
              const citations = await CitationService.getCitedBy(
                publication.publication_id
              );

              counts[publication.publication_id] = citations.length;
            } catch {
              counts[publication.publication_id] = 0;
            }
          })
        );

        setCitationCounts(counts);
      } catch (err) {
        console.error('Failed to load publications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, [currentResearcher]);

  const handleDelete = async (publicationId: number) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this publication? This action is permanent.'
      )
    ) {
      return;
    }

    try {
      await PublicationService.delete(publicationId);

      setPublications((previous) =>
        previous.filter(
          (publication) =>
            publication.publication_id !== publicationId
        )
      );
    } catch (err: any) {
      alert(err.message || 'Failed to delete publication.');
    }
  };

  const filteredPubs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return publications.filter((publication) => {
      if (activeTab === 'my') {
        if (!currentResearcher) return false;

        if (
          !publication.researcher_ids?.includes(
            currentResearcher.researcher_id
          )
        ) {
          return false;
        }
      }

      const matchesQuery =
        !normalizedQuery ||
        publication.title
          .toLowerCase()
          .includes(normalizedQuery) ||
        Boolean(
          publication.abstract
            ?.toLowerCase()
            .includes(normalizedQuery)
        ) ||
        Boolean(
          publication.doi
            ?.toLowerCase()
            .includes(normalizedQuery)
        );

      const matchesType =
        typeFilter === 'all' ||
        publication.publication_type === typeFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        publication.status === statusFilter;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [
    publications,
    activeTab,
    currentResearcher,
    query,
    typeFilter,
    statusFilter,
  ]);

  const totalCitations = useMemo(() => {
    return Object.values(citationCounts).reduce(
      (total, count) => total + count,
      0
    );
  }, [citationCounts]);

  const publishedCount = useMemo(() => {
    return publications.filter(
      (publication) =>
        publication.status === PublicationStatus.PUBLISHED
    ).length;
  }, [publications]);

  const myPublicationCount = useMemo(() => {
    if (!currentResearcher) return 0;

    return publications.filter((publication) =>
      publication.researcher_ids?.includes(
        currentResearcher.researcher_id
      )
    ).length;
  }, [publications, currentResearcher]);

  const hasFilters =
    query.trim() !== '' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all';

  const clearFilters = () => {
    setQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const formatDate = (date?: string | null) => {
    if (!date) return 'Date unavailable';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeLabel = (type?: string | null) => {
    if (!type) return 'Publication';

    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClasses = (status?: string | null) => {
    if (status === PublicationStatus.PUBLISHED) {
      return 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400';
    }

    if (status === PublicationStatus.SUBMITTED) {
      return 'border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400';
    }

    if (status === PublicationStatus.DRAFT) {
      return 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }

    return 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400';
  };

  const getTypeClasses = (type?: string | null) => {
    if (type === PublicationType.JOURNAL) {
      return 'bg-navy-50 text-navy-650 border-navy-100 dark:bg-navy-950/40 dark:text-navy-400 dark:border-navy-900/40';
    }

    if (type === PublicationType.CONFERENCE) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40';
    }

    if (type === PublicationType.BOOK) {
      return 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/40';
    }

    if (type === PublicationType.PATENT) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-900/40';
    }

    return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
  };

  return (
    <div className="space-y-7 pb-8">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-indigo-950 px-6 py-8 sm:px-8 sm:py-9 text-white shadow-xl">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Research Library
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
              Publications
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
              Explore scholarly works, research contributions and
              publication activity across your scientific network.
            </p>

            {currentResearcher && (
              <div className="mt-6">
                <Link
                  to="/publications/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-navy-800 shadow-lg hover:bg-slate-100 transition"
                >
                  <Plus className="h-4 w-4" />
                  Add Publication
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3">
            <div className="min-w-[90px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <BookOpen className="h-4 w-4 text-white/50" />

              <p className="mt-2 text-xl font-bold">
                {publications.length}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-wider text-white/45">
                Papers
              </p>
            </div>

            <div className="min-w-[90px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <Award className="h-4 w-4 text-white/50" />

              <p className="mt-2 text-xl font-bold">
                {totalCitations}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-wider text-white/45">
                Citations
              </p>
            </div>

            <div className="min-w-[90px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <FileText className="h-4 w-4 text-white/50" />

              <p className="mt-2 text-xl font-bold">
                {publishedCount}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-wider text-white/45">
                Published
              </p>
            </div>

            <div className="min-w-[90px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <Users className="h-4 w-4 text-white/50" />

              <p className="mt-2 text-xl font-bold">
                {currentResearcher ? myPublicationCount : '—'}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-wider text-white/45">
                My Works
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TABS
      ========================================================== */}
      {currentResearcher && (
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`relative px-4 py-3 text-xs font-semibold transition ${activeTab === 'all'
                ? 'text-navy-600 dark:text-navy-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              All Scholarly Works

              {activeTab === 'all' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-navy-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('my')}
              className={`relative px-4 py-3 text-xs font-semibold transition ${activeTab === 'my'
                ? 'text-navy-600 dark:text-navy-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              My Publications

              {activeTab === 'my' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-navy-600" />
              )}
            </button>
          </div>

          <span className="hidden sm:block pb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {activeTab === 'my'
              ? `${myPublicationCount} authored works`
              : `${publications.length} total works`}
          </span>
        </section>
      )}

      {/* =========================================================
          SEARCH & FILTERS
      ========================================================== */}
      <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col xl:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, abstracts or DOI..."
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

          <div className="relative xl:w-52">
            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-10 pr-9 text-sm text-slate-700 dark:text-slate-200 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
            >
              <option value="all">All Types</option>
              <option value={PublicationType.JOURNAL}>Journals</option>
              <option value={PublicationType.CONFERENCE}>
                Conferences
              </option>
              <option value={PublicationType.BOOK}>Books</option>
              <option value={PublicationType.PATENT}>Patents</option>
              <option value={PublicationType.REPORT}>Reports</option>
            </select>
          </div>

          <div className="relative xl:w-52">
            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-10 pr-9 text-sm text-slate-700 dark:text-slate-200 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
            >
              <option value="all">All Statuses</option>
              <option value={PublicationStatus.DRAFT}>Draft</option>
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
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />

            <span>
              Showing{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {filteredPubs.length}
              </strong>{' '}
              of {publications.length}
            </span>
          </div>

          {hasFilters && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-600 dark:text-navy-400">
              <Sparkles className="h-3 w-3" />
              Filters active
            </span>
          )}
        </div>
      </section>

      {/* =========================================================
          LOADING
      ========================================================== */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex gap-4">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800" />

                <div className="flex-1">
                  <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="mt-3 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />

                  <div className="mt-3 h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />

                  <div className="mt-2 h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-800" />

                  <div className="mt-5 h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPubs.length === 0 ? (
        /* =======================================================
           EMPTY STATE
        ======================================================== */
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Library className="h-7 w-7 text-slate-400" />
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
            No publications found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {activeTab === 'my'
              ? 'You do not have any publications matching the current filters.'
              : 'No publications match your current search and filter criteria.'}
          </p>

          {hasFilters ? (
            <button
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-navy-700 transition"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          ) : (
            currentResearcher && (
              <Link
                to="/publications/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-navy-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add your first publication
              </Link>
            )
          )}
        </div>
      ) : (
        /* =======================================================
           PUBLICATION CARDS
        ======================================================== */
        <div className="space-y-4">
          {filteredPubs.map((publication) => {
            const internalAuthors = researchers.filter((researcher) =>
              publication.researcher_ids?.includes(
                researcher.researcher_id
              )
            );

            const authorsNames = [
              ...internalAuthors.map((author) => author.name),
              ...(publication.external_authors || []),
            ];

            const isAuthor =
              currentResearcher &&
              publication.researcher_ids?.includes(
                currentResearcher.researcher_id
              );

            const citationCount =
              citationCounts[publication.publication_id] || 0;

            return (
              <article
                key={publication.publication_id}
                className="group overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-navy-200 dark:hover:border-navy-800 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row gap-5">
                    {/* Publication icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-50 to-indigo-50 dark:from-navy-950/50 dark:to-indigo-950/30">
                      <BookOpen className="h-5 w-5 text-navy-600 dark:text-navy-400" />
                    </div>

                    {/* Main content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-lg border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${getTypeClasses(
                            publication.publication_type
                          )}`}
                        >
                          {getTypeLabel(
                            publication.publication_type
                          )}
                        </span>

                        <span
                          className={`rounded-lg border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${getStatusClasses(
                            publication.status
                          )}`}
                        >
                          {getTypeLabel(publication.status)}
                        </span>

                        {isAuthor && (
                          <span className="rounded-lg bg-navy-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                            Your Work
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/publications/${publication.publication_id}`}
                        className="mt-3 block text-base sm:text-lg font-bold leading-7 text-slate-900 dark:text-white group-hover:text-navy-600 dark:group-hover:text-navy-400 transition-colors"
                      >
                        {publication.title}
                      </Link>

                      {publication.abstract && (
                        <p className="mt-3 max-w-4xl text-xs sm:text-sm leading-6 text-slate-500 dark:text-slate-400 line-clamp-2">
                          {publication.abstract}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(publication.publication_date)}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {authorsNames.length || 0} authors
                        </span>

                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                          <Award className="h-3.5 w-3.5" />
                          {citationCount} citations
                        </span>

                        {publication.doi && (
                          <span className="inline-flex max-w-[300px] items-center gap-1.5 truncate">
                            <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {publication.doi}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Authors */}
                      {authorsNames.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {authorsNames.slice(0, 5).map((author, index) => (
                            <span
                              key={`${author}-${index}`}
                              className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[9px] font-semibold text-slate-600 dark:text-slate-400"
                            >
                              {author}
                            </span>
                          ))}

                          {authorsNames.length > 5 && (
                            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[9px] font-semibold text-slate-400">
                              +{authorsNames.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 shrink-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 pt-4 lg:pt-0">
                      <Link
                        to={`/publications/${publication.publication_id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-navy-600 hover:border-navy-600 hover:text-white transition"
                      >
                        View Details
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>

                      {isAuthor && (
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/publications/${publication.publication_id}/edit`}
                            className="rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
                            title="Edit publication"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() =>
                              handleDelete(
                                publication.publication_id
                              )
                            }
                            className="rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition"
                            title="Delete publication"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="h-0.5 w-0 bg-navy-600 group-hover:w-full transition-all duration-500" />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};