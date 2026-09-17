import React, { useEffect, useMemo, useState } from 'react';
import { ConferenceService } from '../../services/conferenceService';
import { PublicationService } from '../../services/publicationService';
import { ResearcherService } from '../../services/researcherService';
import type { Conference } from '../../types';
import {
  Search,
  MapPin,
  Calendar,
  Globe,
  BookOpen,
  Users,
  Sparkles,
  ArrowUpRight,
  Building2,
  X,
} from 'lucide-react';

export const Conferences: React.FC = () => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [relatedPubsCount, setRelatedPubsCount] = useState<Record<number, number>>({});
  const [relatedResCount, setRelatedResCount] = useState<Record<number, number>>({});
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConferences = async () => {
      setLoading(true);

      try {
        const confs = await ConferenceService.getAll();
        setConferences(confs);

        const pubs = await PublicationService.getAll();

        await ResearcherService.getAll();

        const pubsCount: Record<number, number> = {};
        const resCount: Record<number, number> = {};

        confs.forEach((conference) => {
          const matchedPubs = pubs.filter(
            (publication) =>
              publication.conference_id === conference.conference_id
          );

          pubsCount[conference.conference_id] = matchedPubs.length;

          const researcherIds = new Set<number>();

          matchedPubs.forEach((publication) => {
            publication.researcher_ids?.forEach((id) =>
              researcherIds.add(id)
            );
          });

          resCount[conference.conference_id] = researcherIds.size;
        });

        setRelatedPubsCount(pubsCount);
        setRelatedResCount(resCount);
      } catch (err) {
        console.error('Failed to load conferences:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConferences();
  }, []);

  const filteredConferences = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return conferences;

    return conferences.filter((conference) => {
      return (
        conference.name.toLowerCase().includes(search) ||
        conference.description?.toLowerCase().includes(search) ||
        conference.location?.toLowerCase().includes(search)
      );
    });
  }, [conferences, query]);

  const totalPapers = useMemo(
    () =>
      Object.values(relatedPubsCount).reduce(
        (total, count) => total + count,
        0
      ),
    [relatedPubsCount]
  );

  const totalScholars = useMemo(
    () =>
      Object.values(relatedResCount).reduce(
        (total, count) => total + count,
        0
      ),
    [relatedResCount]
  );

  const clearSearch = () => setQuery('');

  return (
    <div className="space-y-8 pb-10">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 px-7 py-8 md:px-10 md:py-10 text-white shadow-xl">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-navy-450/15 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Research Events
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Academic Conferences
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Discover conferences, symposiums, and scientific events connected
              to the research community.
            </p>
          </div>

          <div className="hidden lg:flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/10 backdrop-blur">
            <Building2 className="h-10 w-10 text-cyan-200" />
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Conferences
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? '—' : conferences.length}
              </p>
            </div>

            <div className="rounded-xl bg-navy-50 p-3 dark:bg-navy-900/40">
              <Calendar className="h-5 w-5 text-navy-500" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Research events available in the network
          </p>
        </div>

        <div className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Papers
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? '—' : totalPapers}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Publications associated with conferences
          </p>
        </div>

        <div className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Scholars
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? '—' : totalScholars}
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-900/20">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Researchers represented through publications
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conferences, locations, or topics..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm text-slate-800 outline-none transition focus:border-navy-500 focus:bg-white focus:ring-4 focus:ring-navy-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
            />

            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950">
            {loading
              ? 'Loading...'
              : `${filteredConferences.length} ${
                  filteredConferences.length === 1
                    ? 'conference'
                    : 'conferences'
                }`}
          </div>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-6 space-y-2">
                <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-4/6 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="mt-8 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredConferences.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Search className="h-6 w-6 text-slate-400" />
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
            No conferences found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            We couldn't find any conference matching your search. Try another
            name, location, or keyword.
          </p>

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="mt-5 rounded-xl bg-navy-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-navy-700"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Conference cards */}
      {!loading && filteredConferences.length > 0 && (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredConferences.map((conference) => {
            const publicationCount =
              relatedPubsCount[conference.conference_id] || 0;

            const researcherCount =
              relatedResCount[conference.conference_id] || 0;

            return (
              <article
                key={conference.conference_id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                {/* Decorative accent */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-navy-600 via-navy-450 to-cyan-400 opacity-80" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-50 dark:bg-navy-900/40">
                      <Calendar className="h-5 w-5 text-navy-500" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-base font-bold leading-6 text-slate-900 dark:text-white">
                        {conference.name}
                      </h2>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {conference.location || 'Virtual'}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {conference.start_date || 'N/A'}
                          {' — '}
                          {conference.end_date || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="hidden shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950 sm:inline-flex">
                    Conference
                  </span>
                </div>

                {/* Description */}
                <p className="mt-6 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {conference.description ||
                    'No conference description has been provided yet.'}
                </p>

                {/* Metrics */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-navy-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Papers
                      </span>
                    </div>

                    <p className="mt-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                      {publicationCount}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Scholars
                      </span>
                    </div>

                    <p className="mt-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                      {researcherCount}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                    <Globe className="h-3.5 w-3.5" />
                    {conference.website
                      ? 'Official website available'
                      : 'Website unavailable'}
                  </div>

                  {conference.website ? (
                    <a
                      href={String(conference.website)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-navy-600 shadow-sm transition-all hover:border-navy-200 hover:bg-navy-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-navy-400 dark:hover:bg-slate-800"
                    >
                      Visit website
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400 dark:bg-slate-800">
                      No link
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Bottom insight */}
      {!loading && conferences.length > 0 && (
        <div className="rounded-2xl border border-navy-100 bg-navy-50/70 p-5 dark:border-navy-900/60 dark:bg-navy-900/20">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-white p-2 shadow-sm dark:bg-slate-900">
              <Sparkles className="h-4 w-4 text-navy-500" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Explore the research ecosystem
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Conference activity connects publications and researchers
                across the scientific collaboration network.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};