import React, { useEffect, useMemo, useState } from 'react';
import { ReportService } from '../../services/reportService';
import { ResearcherService } from '../../services/researcherService';
import { AdminService } from '../../services/adminService';
import { PublicationService } from '../../services/publicationService';
import { CollaborationService } from '../../services/collaborationService';
import type {
  Researcher,
  Institution,
  Publication,
  Collaboration,
} from '../../types';
import {
  FileSpreadsheet,
  FileJson,
  Play,
  Filter,
  BookOpen,
  GitFork,
  BarChart3,
  Download,
  Calendar,
  Users,
  Building2,
  FileText,
  CheckCircle2,
  RotateCcw,
  Search,
  ChevronRight,
} from 'lucide-react';

export const Reports: React.FC = () => {
  // ============================================================
  // FILTER STATE
  // ============================================================

  const [reportType, setReportType] = useState<'pubs' | 'collabs'>('pubs');
  const [researcherId, setResearcherId] = useState<number | undefined>(
    undefined
  );
  const [institutionId, setInstitutionId] = useState<number | undefined>(
    undefined
  );
  const [pubType, setPubType] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ============================================================
  // COLLECTIONS
  // ============================================================

  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  // ============================================================
  // PREVIEW STATE
  // ============================================================

  const [previewPubs, setPreviewPubs] = useState<Publication[]>([]);
  const [previewCollabs, setPreviewCollabs] = useState<
    (Collaboration & {
      r1Name: string;
      r2Name: string;
    })[]
  >([]);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [hasPreviewed, setHasPreviewed] = useState(false);

  // ============================================================
  // LOAD FILTER DATA
  // ============================================================

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [researcherResults, institutionResults] = await Promise.all([
          ResearcherService.getAll(),
          AdminService.getAllInstitutions(),
        ]);

        setResearchers(researcherResults);
        setInstitutions(institutionResults);
      } catch (error) {
        console.error('Failed to load report filters:', error);
      }
    };

    loadFilterData();
  }, []);

  // ============================================================
  // FILTER SUMMARY
  // ============================================================

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (researcherId) count++;
    if (institutionId) count++;
    if (fromDate) count++;
    if (toDate) count++;

    if (reportType === 'pubs') {
      if (pubType !== 'all') count++;
      if (status !== 'all') count++;
    }

    return count;
  }, [
    researcherId,
    institutionId,
    fromDate,
    toDate,
    reportType,
    pubType,
    status,
  ]);

  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {
    setResearcherId(undefined);
    setInstitutionId(undefined);
    setPubType('all');
    setStatus('all');
    setFromDate('');
    setToDate('');
    setHasPreviewed(false);
    setPreviewPubs([]);
    setPreviewCollabs([]);
  };

  // ============================================================
  // PREVIEW
  // ============================================================

  const handlePreview = async () => {
    setPreviewLoading(true);
    setHasPreviewed(true);

    try {
      if (reportType === 'pubs') {
        const pubs = await PublicationService.getAll();

        const filtered = pubs.filter((publication) => {
          if (
            researcherId &&
            !publication.researcher_ids?.includes(researcherId)
          ) {
            return false;
          }

          if (institutionId) {
            const authorProfiles = researchers.filter((researcher) =>
              publication.researcher_ids?.includes(researcher.researcher_id)
            );

            const matchesInstitution = authorProfiles.some(
              (researcher) => researcher.institution_id === institutionId
            );

            if (!matchesInstitution) {
              return false;
            }
          }

          if (
            pubType !== 'all' &&
            publication.publication_type !== pubType
          ) {
            return false;
          }

          if (status !== 'all' && publication.status !== status) {
            return false;
          }

          if (
            fromDate &&
            publication.publication_date &&
            new Date(publication.publication_date) < new Date(fromDate)
          ) {
            return false;
          }

          if (
            toDate &&
            publication.publication_date &&
            new Date(publication.publication_date) > new Date(toDate)
          ) {
            return false;
          }

          return true;
        });

        setPreviewPubs(filtered.slice(0, 5));
        setPreviewCollabs([]);
      } else {
        const collaborations = await CollaborationService.getAll();

        const filtered = collaborations.filter((collaboration) => {
          if (
            researcherId &&
            !collaboration.researcher_ids.includes(researcherId)
          ) {
            return false;
          }

          if (institutionId) {
            const researcherProfiles = researchers.filter((researcher) =>
              collaboration.researcher_ids.includes(
                researcher.researcher_id
              )
            );

            const matchesInstitution = researcherProfiles.some(
              (researcher) => researcher.institution_id === institutionId
            );

            if (!matchesInstitution) {
              return false;
            }
          }

          if (
            fromDate &&
            new Date(collaboration.created_at) < new Date(fromDate)
          ) {
            return false;
          }

          if (
            toDate &&
            new Date(collaboration.created_at) > new Date(toDate)
          ) {
            return false;
          }

          return true;
        });

        const mapped = filtered.slice(0, 5).map((collaboration) => {
          const researcherOne =
            researchers.find(
              (researcher) =>
                researcher.researcher_id ===
                collaboration.researcher_ids[0]
            )?.name || `ID ${collaboration.researcher_ids[0]}`;

          const researcherTwo =
            researchers.find(
              (researcher) =>
                researcher.researcher_id ===
                collaboration.researcher_ids[1]
            )?.name || `ID ${collaboration.researcher_ids[1]}`;

          return {
            ...collaboration,
            r1Name: researcherOne,
            r2Name: researcherTwo,
          };
        });

        setPreviewCollabs(mapped);
        setPreviewPubs([]);
      }
    } catch (error) {
      console.error('Preview failed:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const handleExportCSV = async () => {
    try {
      if (reportType === 'pubs') {
        await ReportService.publicationReportCsv({
          researcher_id: researcherId,
          institution_id: institutionId,
          publication_type:
            pubType !== 'all' ? (pubType as any) : undefined,
          status: status !== 'all' ? (status as any) : undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        });
      } else {
        await ReportService.collaborationReportCsv({
          researcher_id: researcherId,
          institution_id: institutionId,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        });
      }
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export CSV report.');
    }
  };

  // ============================================================
  // EXPORT JSON
  // ============================================================

  const handleExportJSON = async () => {
    if (reportType !== 'pubs') return;

    try {
      await ReportService.publicationReportJson({
        researcher_id: researcherId,
        institution_id: institutionId,
        publication_type:
          pubType !== 'all' ? (pubType as any) : undefined,
        status: status !== 'all' ? (status as any) : undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });
    } catch (error) {
      console.error('JSON export failed:', error);
      alert('Failed to export JSON report.');
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6 pb-8">

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white shadow-xl">

        <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative px-6 py-8 lg:px-8 lg:py-10">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-cyan-100 mb-4">
                <BarChart3 className="w-3.5 h-3.5" />
                Research Intelligence
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Research Reports
              </h1>

              <p className="mt-3 text-sm sm:text-base leading-7 text-slate-300 max-w-2xl">
                Build focused research datasets using publication and
                collaboration filters, preview the results, and export
                structured reports for further analysis.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">

              <div className="min-w-[120px] rounded-2xl bg-white/10 border border-white/10 px-4 py-4 backdrop-blur-sm">

                <div className="flex items-center gap-2">

                  <FileText className="w-4 h-4 text-cyan-200" />

                  <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">
                    Focus
                  </span>

                </div>

                <p className="mt-2 text-sm font-bold">
                  {reportType === 'pubs'
                    ? 'Publications'
                    : 'Collaborations'}
                </p>

              </div>

              <div className="min-w-[120px] rounded-2xl bg-white/10 border border-white/10 px-4 py-4 backdrop-blur-sm">

                <div className="flex items-center gap-2">

                  <Filter className="w-4 h-4 text-cyan-200" />

                  <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">
                    Filters
                  </span>

                </div>

                <p className="mt-2 text-sm font-bold">
                  {activeFilterCount} active
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================
          WORKSPACE
      ======================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ======================================================
            FILTER PANEL
        ====================================================== */}

        <section className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center">
                  <Filter className="w-4 h-4 text-navy-600 dark:text-navy-400" />
                </div>

                <div>

                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                    Report Builder
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure the dataset you want to analyze
                  </p>

                </div>

              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset filters
                </button>
              )}

            </div>

          </div>

          <div className="p-6 space-y-6">

            {/* Report focus */}

            <div>

              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Report Focus
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">

                <button
                  type="button"
                  onClick={() => {
                    setReportType('pubs');
                    setHasPreviewed(false);
                  }}
                  className={`relative p-4 rounded-2xl border text-left transition-all ${
                    reportType === 'pubs'
                      ? 'border-navy-500 bg-navy-50 dark:bg-navy-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        reportType === 'pubs'
                          ? 'bg-navy-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <BookOpen className="w-5 h-5" />
                    </div>

                    <div>

                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Publications
                      </p>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Papers, status and timelines
                      </p>

                    </div>

                  </div>

                  {reportType === 'pubs' && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-navy-600" />
                  )}

                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReportType('collabs');
                    setHasPreviewed(false);
                  }}
                  className={`relative p-4 rounded-2xl border text-left transition-all ${
                    reportType === 'collabs'
                      ? 'border-navy-500 bg-navy-50 dark:bg-navy-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        reportType === 'collabs'
                          ? 'bg-navy-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <GitFork className="w-5 h-5" />
                    </div>

                    <div>

                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Collaborations
                      </p>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Researcher connections and networks
                      </p>

                    </div>

                  </div>

                  {reportType === 'collabs' && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-navy-600" />
                  )}

                </button>

              </div>

            </div>

            {/* Main filters */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Researcher */}

              <div className="space-y-2">

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Target Researcher
                </label>

                <select
                  value={researcherId || ''}
                  onChange={(event) => {
                    setResearcherId(
                      event.target.value
                        ? Number(event.target.value)
                        : undefined
                    );
                    setHasPreviewed(false);
                  }}
                  className="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                >
                  <option value="">All Researchers</option>

                  {researchers.map((researcher) => (
                    <option
                      key={researcher.researcher_id}
                      value={researcher.researcher_id}
                    >
                      {researcher.name}
                    </option>
                  ))}

                </select>

              </div>

              {/* Institution */}

              <div className="space-y-2">

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Institutional Filter
                </label>

                <select
                  value={institutionId || ''}
                  onChange={(event) => {
                    setInstitutionId(
                      event.target.value
                        ? Number(event.target.value)
                        : undefined
                    );
                    setHasPreviewed(false);
                  }}
                  className="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                >
                  <option value="">All Institutions</option>

                  {institutions.map((institution) => (
                    <option
                      key={institution.institution_id}
                      value={institution.institution_id}
                    >
                      {institution.name}
                    </option>
                  ))}

                </select>

              </div>

              {/* From */}

              <div className="space-y-2">

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  From Date
                </label>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => {
                    setFromDate(event.target.value);
                    setHasPreviewed(false);
                  }}
                  className="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                />

              </div>

              {/* To */}

              <div className="space-y-2">

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  To Date
                </label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => {
                    setToDate(event.target.value);
                    setHasPreviewed(false);
                  }}
                  className="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                />

              </div>

            </div>

            {/* Publication filters */}

            {reportType === 'pubs' && (
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800">

                <div className="flex items-center gap-2 mb-4">

                  <FileText className="w-4 h-4 text-navy-600 dark:text-navy-400" />

                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Publication Filters
                  </h3>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div className="space-y-2">

                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Publication Type
                    </label>

                    <select
                      value={pubType}
                      onChange={(event) => {
                        setPubType(event.target.value);
                        setHasPreviewed(false);
                      }}
                      className="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    >
                      <option value="all">All Types</option>
                      <option value="journal">Journal Articles</option>
                      <option value="conference">Conferences</option>
                      <option value="book">Books</option>
                      <option value="patent">Patents</option>
                      <option value="report">Reports</option>
                    </select>

                  </div>

                  <div className="space-y-2">

                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Publication Status
                    </label>

                    <select
                      value={status}
                      onChange={(event) => {
                        setStatus(event.target.value);
                        setHasPreviewed(false);
                      }}
                      className="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>

                  </div>

                </div>

              </div>
            )}

          </div>

        </section>

        {/* ======================================================
            EXPORT PANEL
        ====================================================== */}

        <section className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <Download className="w-4 h-4 text-emerald-600" />
              </div>

              <div>

                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Export Center
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                  Preview or download your report
                </p>

              </div>

            </div>

          </div>

          <div className="p-6 flex flex-col justify-between h-[calc(100%-85px)]">

            <div className="space-y-3">

              {/* Preview */}

              <button
                type="button"
                onClick={handlePreview}
                disabled={previewLoading}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >

                <Play className="w-4 h-4" />

                {previewLoading ? 'Generating Preview...' : 'Preview Data'}

              </button>

              {/* CSV */}

              <button
                type="button"
                onClick={handleExportCSV}
                className="w-full py-3 px-4 bg-navy-600 hover:bg-navy-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-navy-600/10 transition-all hover:-translate-y-0.5"
              >

                <FileSpreadsheet className="w-4 h-4" />

                Export CSV

              </button>

              {/* JSON */}

              {reportType === 'pubs' && (
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-full py-3 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                >

                  <FileJson className="w-4 h-4 text-navy-600 dark:text-navy-400" />

                  Export JSON

                </button>
              )}

            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">

              <div className="flex items-start gap-2.5">

                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />

                <p className="text-[11px] leading-5 text-slate-400">
                  Generated files follow the available SCN report schemas
                  and downloads are triggered directly by the report service.
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>

      {/* ========================================================
          PREVIEW
      ======================================================== */}

      {hasPreviewed && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-navy-50 dark:bg-navy-900/30 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-navy-600 dark:text-navy-400" />
                </div>

                <div>

                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                    Report Preview
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Showing the first 5 matching records
                  </p>

                </div>

              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-300">

                {reportType === 'pubs'
                  ? `${previewPubs.length} publications`
                  : `${previewCollabs.length} collaborations`}

              </span>

            </div>

          </div>

          <div className="p-6">

            {previewLoading ? (

              <div className="py-12 text-center">

                <div className="w-9 h-9 mx-auto border-4 border-navy-200 dark:border-navy-900 border-t-navy-600 rounded-full animate-spin" />

                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Preparing preview...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Applying your selected report criteria
                </p>

              </div>

            ) : reportType === 'pubs' ? (

              previewPubs.length === 0 ? (

                <div className="py-12 text-center">

                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">

                    <Search className="w-6 h-6 text-slate-400" />

                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                    No publications matched
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Try removing one or more filters and preview again.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full text-left text-xs">

                    <thead>

                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">

                        <th className="py-3 px-3 font-semibold">
                          Publication ID
                        </th>

                        <th className="py-3 px-3 font-semibold">
                          Title
                        </th>

                        <th className="py-3 px-3 font-semibold">
                          Type
                        </th>

                        <th className="py-3 px-3 font-semibold">
                          Status
                        </th>

                        <th className="py-3 px-3 font-semibold">
                          Date
                        </th>

                        <th className="py-3 px-3" />

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                      {previewPubs.map((publication) => (

                        <tr
                          key={publication.publication_id}
                          className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                        >

                          <td className="py-4 px-3">

                            <span className="font-mono text-[10px] text-slate-400">
                              SCN-PUB-{publication.publication_id}
                            </span>

                          </td>

                          <td className="py-4 px-3 max-w-[320px]">

                            <div className="flex items-center gap-2.5">

                              <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">

                                <FileText className="w-3.5 h-3.5 text-slate-500" />

                              </div>

                              <span className="font-semibold text-slate-700 dark:text-slate-200 line-clamp-2">
                                {publication.title}
                              </span>

                            </div>

                          </td>

                          <td className="py-4 px-3">

                            <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                              {publication.publication_type}
                            </span>

                          </td>

                          <td className="py-4 px-3">

                            <span className="inline-flex px-2.5 py-1 rounded-lg bg-navy-50 dark:bg-navy-950/30 text-navy-600 dark:text-navy-400 capitalize">
                              {publication.status}
                            </span>

                          </td>

                          <td className="py-4 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">

                            {publication.publication_date || 'N/A'}

                          </td>

                          <td className="py-4 px-3 text-right">

                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-navy-500 transition-colors" />

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )

            ) : (

              previewCollabs.length === 0 ? (

                <div className="py-12 text-center">

                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">

                    <GitFork className="w-6 h-6 text-slate-400" />

                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                    No collaborations matched
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Try adjusting your researcher, institution, or date filters.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full text-left text-xs">

                    <thead>

                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">

                        <th className="py-3 px-3 font-semibold">
                          Collaboration ID
                        </th>

                        <th className="py-3 px-3 font-semibold">
                          Researcher A
                        </th>

                        <th className="py-3 px-3 font-semibold">
                          Researcher B
                        </th>

                        <th className="py-3 px-3 font-semibold">
                          Connection
                        </th>

                        <th className="py-3 px-3 text-center font-semibold">
                          Weight
                        </th>

                        <th className="py-3 px-3" />

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                      {previewCollabs.map((collaboration) => (

                        <tr
                          key={collaboration.collaboration_id}
                          className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                        >

                          <td className="py-4 px-3">

                            <span className="font-mono text-[10px] text-slate-400">
                              SCN-EDGE-{collaboration.collaboration_id}
                            </span>

                          </td>

                          <td className="py-4 px-3">

                            <div className="flex items-center gap-2">

                              <div className="w-7 h-7 rounded-full bg-navy-50 dark:bg-navy-950/30 flex items-center justify-center">
                                <Users className="w-3.5 h-3.5 text-navy-600 dark:text-navy-400" />
                              </div>

                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {collaboration.r1Name}
                              </span>

                            </div>

                          </td>

                          <td className="py-4 px-3">

                            <div className="flex items-center gap-2">

                              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Users className="w-3.5 h-3.5 text-slate-500" />
                              </div>

                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {collaboration.r2Name}
                              </span>

                            </div>

                          </td>

                          <td className="py-4 px-3">

                            <span className="capitalize text-slate-500 dark:text-slate-400">
                              {collaboration.collaboration_type}
                            </span>

                          </td>

                          <td className="py-4 px-3 text-center">

                            <span className="inline-flex min-w-10 justify-center px-2.5 py-1 rounded-lg bg-navy-50 dark:bg-navy-950/30 text-navy-600 dark:text-navy-400 font-bold">
                              {collaboration.collaboration_count}
                            </span>

                          </td>

                          <td className="py-4 px-3 text-right">

                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-navy-500 transition-colors" />

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )

            )}

          </div>

        </section>
      )}

    </div>
  );
};