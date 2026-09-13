import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import { PublicationService } from '../../services/publicationService';
import { ResearcherService } from '../../services/researcherService';
import { CitationService } from '../../services/citationService';
import { ConferenceService } from '../../services/conferenceService';
import type {
  Publication,
  Researcher,
  Conference,
  Citation,
} from '../../types';
import {
  ArrowLeft,
  Calendar,
  Landmark,
  FileText,
  Download,
  UploadCloud,
  CheckCircle,
  Edit,
  Trash2,
  Link as LinkIcon,
  Plus,
  AlertCircle,
  Bookmark,
  X,
  Users,
  Quote,
  ExternalLink,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

export const PublicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { researcher: currentResearcher } = useAuth();

  const [publication, setPublication] = useState<Publication | null>(null);
  const [authors, setAuthors] = useState<Researcher[]>([]);
  const [conference, setConference] = useState<Conference | null>(null);

  const [citationsReceived, setCitationsReceived] = useState<
    (Citation & {
      citingTitle: string;
      citingId: number;
    })[]
  >([]);

  const [citationsMade, setCitationsMade] = useState<
    (Citation & {
      citedTitle: string;
      citedId: number;
    })[]
  >([]);

  const [allPublications, setAllPublications] = useState<Publication[]>([]);

  const [loading, setLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [citeDialogOpen, setCiteDialogOpen] = useState(false);
  const [selectedCiteId, setSelectedCiteId] = useState<number | undefined>(
    undefined
  );
  const [citeError, setCiteError] = useState('');

  const loadDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);

    try {
      const pub = await PublicationService.getById(Number(id));
      setPublication(pub);

      const authorPermission =
        !!currentResearcher &&
        !!pub.researcher_ids?.includes(currentResearcher.researcher_id);

      setIsAuthor(authorPermission);

      const allRes = await ResearcherService.getAll();

      const linkedAuthors = allRes.filter((researcher) =>
        pub.researcher_ids?.includes(researcher.researcher_id)
      );

      setAuthors(linkedAuthors);

      if (pub.conference_id) {
        const conf = await ConferenceService.getById(pub.conference_id);
        setConference(conf);
      } else {
        setConference(null);
      }

      const received = await CitationService.getCitedBy(
        pub.publication_id
      );

      const allPubs = await PublicationService.getAll();
      setAllPublications(allPubs);

      const mappedReceived = received.map((citation) => {
        const citingPub = allPubs.find(
          (paper) =>
            paper.publication_id === citation.citing_publication_id
        );

        return {
          ...citation,
          citingTitle:
            citingPub?.title ||
            `Publication ID ${citation.citing_publication_id}`,
          citingId: citation.citing_publication_id,
        };
      });

      setCitationsReceived(mappedReceived);

      const made = await CitationService.getByPublication(
        pub.publication_id
      );

      const mappedMade = made.map((citation) => {
        const citedPub = allPubs.find(
          (paper) =>
            paper.publication_id === citation.cited_publication_id
        );

        return {
          ...citation,
          citedTitle:
            citedPub?.title ||
            `Publication ID ${citation.cited_publication_id}`,
          citedId: citation.cited_publication_id,
        };
      });

      setCitationsMade(mappedMade);
    } catch (err) {
      console.error('Failed to load publication details:', err);
    } finally {
      setLoading(false);
    }
  }, [id, currentResearcher]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this publication record?'
      )
    ) {
      return;
    }

    if (!publication) return;

    try {
      await PublicationService.delete(publication.publication_id);
      navigate('/publications');
    } catch (err) {
      console.error('Failed to delete publication:', err);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !publication) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError('');

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        return prev + 10;
      });
    }, 150);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1600));

      await PublicationService.uploadFile(
        publication.publication_id,
        file
      );

      setUploadSuccess(true);
      await loadDetails();
    } catch (err: any) {
      setUploadError(err?.message || 'File upload failed.');
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  };

  const handleAddCitation = async (e: React.FormEvent) => {
    e.preventDefault();

    setCiteError('');

    if (!selectedCiteId || !publication) return;

    try {
      await CitationService.create({
        citing_publication_id: publication.publication_id,
        cited_publication_ids: [selectedCiteId],
      });

      setCiteDialogOpen(false);
      setSelectedCiteId(undefined);

      await loadDetails();
    } catch (err: any) {
      setCiteError(
        err?.message || 'Failed to create citation link.'
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  const existingCitedIds = citationsMade.map(
    (citation) => citation.citedId
  );

  const eligibleCitePapers = allPublications.filter(
    (paper) =>
      paper.publication_id !== publication?.publication_id &&
      !existingCitedIds.includes(paper.publication_id)
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />

        <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 animate-pulse" />

          <div className="p-8 space-y-5">
            <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="max-w-lg mx-auto py-16">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
            <BookOpen className="w-6 h-6 text-slate-400" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Publication not found
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-6">
            The requested publication record does not exist or may
            have been archived.
          </p>

          <Link
            to="/publications"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-xl bg-navy-700 text-white text-sm font-semibold hover:bg-navy-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to publications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Top navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/publications"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-navy-600 dark:hover:text-navy-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to publications
        </Link>

        {isAuthor && (
          <div className="flex items-center gap-2">
            <Link
              to={`/publications/${publication.publication_id}/edit`}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Link>

            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Publication hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-600 text-white shadow-xl">
        <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-24 -bottom-36 w-96 h-96 rounded-full bg-navy-400/10 blur-3xl" />

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              {publication.publication_type}
            </span>

            <span className="px-3 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-300/10 text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              {publication.status}
            </span>
          </div>

          <h1 className="max-w-4xl text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            {publication.title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm sm:text-base text-white/70 leading-7">
            Research publication record within the Scientific
            Collaboration Network.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/60">
            <span className="inline-flex items-center gap-2">
              <Users className="w-4 h-4" />
              {authors.length + (publication.external_authors?.length || 0)} authors
            </span>

            <span className="inline-flex items-center gap-2">
              <Quote className="w-4 h-4" />
              {citationsReceived.length} citations received
            </span>

            {publication.publication_date && (
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {publication.publication_date}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main publication information */}
      <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* Authors */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-navy-50 dark:bg-navy-950/40 flex items-center justify-center">
                <Users className="w-4 h-4 text-navy-600 dark:text-navy-400" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Research team
                </p>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Authors
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {authors.map((author) => (
                <Link
                  key={author.researcher_id}
                  to={`/researchers/${author.researcher_id}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-navy-300 dark:hover:border-navy-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-navy-100 dark:bg-navy-900/60 flex items-center justify-center text-[10px] font-bold text-navy-700 dark:text-navy-300">
                    {getInitials(author.name)}
                  </div>

                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {author.name}
                  </span>
                </Link>
              ))}

              {publication.external_authors?.map((author) => (
                <span
                  key={author}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    EX
                  </div>

                  <span className="text-xs font-medium italic text-slate-500 dark:text-slate-400">
                    {author}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7 pt-7 border-t border-slate-100 dark:border-slate-800">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Publication date
                </span>
              </div>

              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {publication.publication_date || 'Not specified'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <LinkIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  DOI
                </span>
              </div>

              {publication.doi ? (
                <a
                  href={`https://doi.org/${publication.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-600 dark:text-navy-400 hover:underline break-all"
                >
                  {publication.doi}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <p className="text-sm font-bold text-slate-500">
                  Not specified
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Landmark className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Conference
                </span>
              </div>

              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {conference?.name || 'Independent publication'}
              </p>
            </div>
          </div>

          {/* Abstract */}
          <div className="mt-7 pt-7 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-navy-50 dark:bg-navy-950/40 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-navy-600 dark:text-navy-400" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Research overview
                </p>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Abstract
                </h2>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 p-5">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-7 whitespace-pre-line">
                {publication.abstract ||
                  'No abstract text has been provided for this publication.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lower content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Full text */}
        <div className="lg:col-span-4">
          <section className="h-full rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-950/40 flex items-center justify-center">
                <FileText className="w-5 h-5 text-navy-600 dark:text-navy-400" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Document
                </p>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Full-text manuscript
                </h2>
              </div>
            </div>

            {publication.file_path ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-navy-100 dark:border-navy-900/50 bg-navy-50/50 dark:bg-navy-950/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                      <FileText className="w-5 h-5 text-navy-600 dark:text-navy-400" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Manuscript
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        PDF / DOCX document
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    alert(
                      `[DEMO SYSTEM] Simulating download for manuscript: ${publication.file_path}`
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-navy-700 hover:bg-navy-600 text-white text-sm font-bold shadow-lg shadow-navy-700/15 transition-all hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  Download full text
                </button>
              </div>
            ) : (
              <div>
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6 text-slate-400" />
                  </div>

                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No manuscript uploaded
                  </p>

                  <p className="text-xs text-slate-400 mt-1 leading-5">
                    Add the publication's full-text document.
                  </p>
                </div>

                {isAuthor ? (
                  <div className="mt-4 space-y-3">
                    <label className="relative flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-navy-700 hover:bg-navy-600 text-white text-sm font-bold cursor-pointer transition-colors">
                      <UploadCloud className="w-4 h-4" />
                      Select document

                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>

                    <p className="text-center text-[11px] text-slate-400">
                      PDF or DOCX · Maximum 10MB
                    </p>

                    {uploading && (
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          <span>Uploading document</span>
                          <span>{uploadProgress}%</span>
                        </div>

                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-navy-500 transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {uploadSuccess && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>
                          Manuscript uploaded successfully.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>
                      Manuscript uploads are available to publication
                      authors.
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Citation network */}
        <div className="lg:col-span-8 space-y-6">
          {/* References */}
          <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-950/40 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-navy-600 dark:text-navy-400" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Citation network
                  </p>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Bibliography references
                  </h2>
                </div>
              </div>

              {isAuthor && eligibleCitePapers.length > 0 && (
                <button
                  onClick={() => {
                    setCiteError('');
                    setSelectedCiteId(undefined);
                    setCiteDialogOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy-50 dark:bg-navy-950/40 text-navy-700 dark:text-navy-300 text-xs font-bold hover:bg-navy-100 dark:hover:bg-navy-900/50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add reference
                </button>
              )}
            </div>

            {citationsMade.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                <LinkIcon className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  No references recorded
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Bibliography links will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {citationsMade.map((reference, index) => (
                  <Link
                    key={reference.citation_id}
                    to={`/publications/${reference.citedId}`}
                    className="group flex items-start gap-3 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-mono font-bold text-slate-500 shrink-0">
                      {index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-6 group-hover:text-navy-600 dark:group-hover:text-navy-400 transition-colors">
                        {reference.citedTitle}
                      </p>
                    </div>

                    <ArrowLeft className="w-4 h-4 rotate-180 text-slate-300 group-hover:text-navy-500 mt-1 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Cited by */}
          <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Citation impact
                </p>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Cited by
                </h2>
              </div>

              <span className="ml-auto px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                {citationsReceived.length}
              </span>
            </div>

            {citationsReceived.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                <Bookmark className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  No citations yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Other publications citing this work will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {citationsReceived.map((citation) => (
                  <Link
                    key={citation.citation_id}
                    to={`/publications/${citation.citingId}`}
                    className="group flex items-start gap-3 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                      <Quote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-6 group-hover:text-navy-600 dark:group-hover:text-navy-400 transition-colors">
                        {citation.citingTitle}
                      </p>
                    </div>

                    <ArrowLeft className="w-4 h-4 rotate-180 text-slate-300 group-hover:text-navy-500 mt-1 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Citation modal */}
      {citeDialogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-navy-600 dark:text-navy-400">
                  Citation network
                </p>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Add bibliography reference
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setCiteDialogOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddCitation}
              className="p-6 space-y-5"
            >
              {citeError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{citeError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="cited-paper"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  Select publication
                </label>

                <select
                  id="cited-paper"
                  value={selectedCiteId ?? ''}
                  onChange={(e) =>
                    setSelectedCiteId(
                      e.target.value
                        ? Number(e.target.value)
                        : undefined
                    )
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-navy-500 focus:ring-4 focus:ring-navy-500/10 focus:outline-none transition-all"
                >
                  <option value="">
                    -- Choose a publication --
                  </option>

                  {eligibleCitePapers.map((paper) => (
                    <option
                      key={paper.publication_id}
                      value={paper.publication_id}
                    >
                      {paper.title}
                    </option>
                  ))}
                </select>

                {eligibleCitePapers.length === 0 && (
                  <p className="text-xs text-slate-400 mt-2">
                    There are no eligible publications available to
                    reference.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCiteDialogOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!selectedCiteId}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-700 hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  Add citation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};