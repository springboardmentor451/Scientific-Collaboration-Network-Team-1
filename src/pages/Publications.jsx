import React, { useMemo, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useData } from '../context/DataContext';
import {
  Search,
  Download,
  Share2,
  ChevronRight,
} from 'lucide-react';

export default function Publications() {
  const {
    publications = [],
    openDetailModal,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const publicationTypes = [
    'All',
    'Journal Paper',
    'Conference Paper',
    'Book',
    'Book Chapter',
    'Patent',
  ];

  const getPublicationType = (paper) => {
    return (
      paper.type ||
      paper.publicationType ||
      paper.category ||
      'Journal Paper'
    );
  };

  const getVenue = (paper) => {
    return paper.venue || paper.journal || 'Research Journal';
  };

  const getStatus = (paper) => {
    return paper.status || 'Published';
  };

  const filteredPublications = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return publications.filter((paper) => {
      const title = String(
        paper.title || ''
      ).toLowerCase();

      const venue = String(
        getVenue(paper)
      ).toLowerCase();

      const type = getPublicationType(paper);

      const matchesSearch =
        !query ||
        title.includes(query) ||
        venue.includes(query);

      const matchesType =
        selectedType === 'All' ||
        type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [
    publications,
    searchQuery,
    selectedType,
  ]);

  const handleDownload = (paper, event) => {
    event.stopPropagation();

    if (paper.pdfUrl) {
      window.open(paper.pdfUrl, '_blank');
      return;
    }

    if (paper.url) {
      window.open(paper.url, '_blank');
      return;
    }

    if (paper.doi) {
      const doiUrl = paper.doi.startsWith('http')
        ? paper.doi
        : `https://doi.org/${paper.doi}`;

      window.open(doiUrl, '_blank');
      return;
    }

    alert('Publication document is not available.');
  };

  const handleShare = async (paper, event) => {
    event.stopPropagation();

    const shareUrl =
      paper.url ||
      paper.pdfUrl ||
      (paper.doi
        ? paper.doi.startsWith('http')
          ? paper.doi
          : `https://doi.org/${paper.doi}`
        : window.location.href);

    const shareData = {
      title: paper.title || 'Research Publication',
      text: `Research publication: ${paper.title || ''}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Publication link copied to clipboard.');
      } else {
        window.prompt(
          'Copy publication link:',
          shareUrl
        );
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  };

  return (
    <MainLayout title="Publications">
      <div className="space-y-4">

        {/* Search + Publication Type Tabs */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-pink-100 shadow-sm p-4">

          <div className="flex flex-col xl:flex-row items-center gap-3">

            {/* Search */}
            <div className="relative flex-1 w-full">

              <Search className="w-5 h-5 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                placeholder="Search titles and venues..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full pl-12 pr-4 py-3 text-sm bg-pink-50/30 border border-pink-100 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 text-slate-800 placeholder-slate-500"
              />

            </div>

            {/* Type Tabs */}
            <div className="w-full xl:w-auto overflow-x-auto">
              <div className="flex items-center gap-1 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-full p-1 min-w-max">

                {publicationTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setSelectedType(type)
                    }
                    className={`px-4 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                      selectedType === type
                        ? 'bg-white text-pink-600 shadow-sm border border-pink-100'
                        : 'text-slate-600 hover:text-purple-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}

              </div>
            </div>

          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between px-2">

          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-bold text-slate-800">
              {filteredPublications.length}
            </span>{' '}
            of{' '}
            <span className="font-bold text-slate-800">
              {publications.length}
            </span>{' '}
            publications
          </p>

          {(searchQuery ||
            selectedType !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
              }}
              className="text-xs font-semibold text-pink-600 hover:text-purple-700"
            >
              Clear filters
            </button>
          )}

        </div>

        {/* Publication Table */}
        {filteredPublications.length > 0 ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-pink-100 shadow-sm overflow-hidden">

            {/* Desktop Header */}
            <div className="hidden lg:grid grid-cols-[minmax(300px,2.5fr)_170px_minmax(150px,1.4fr)_70px_125px_75px_90px] gap-4 px-5 py-4 border-b border-pink-100 text-xs font-semibold text-slate-500">

              <div>Title</div>
              <div>Type</div>
              <div>Venue</div>
              <div>Year</div>
              <div>Status</div>
              <div className="text-center">Citations</div>
              <div className="text-center">Actions</div>

            </div>

            {/* Rows */}
            <div>
              {filteredPublications.map((paper) => {

                const authors = Array.isArray(
                  paper.authors
                )
                  ? paper.authors.join(', ')
                  : paper.authors ||
                    'Authors not available';

                const type =
                  getPublicationType(paper);

                const venue = getVenue(paper);

                const status =
                  getStatus(paper);

                const citations = Number(
                  paper.citations || 0
                );

                const year =
                  paper.year ||
                  paper.publicationYear ||
                  '—';

                return (
                  <div
                    key={paper.id}
                    onClick={() =>
                      openDetailModal(
                        'paper',
                        paper
                      )
                    }
                    className="group border-b border-pink-100 last:border-b-0 hover:bg-pink-50/30 transition-colors cursor-pointer"
                  >

                    {/* Desktop Row */}
                    <div className="hidden lg:grid grid-cols-[minmax(300px,2.5fr)_170px_minmax(150px,1.4fr)_70px_125px_75px_90px] gap-4 items-center px-5 py-4">

                      {/* Title */}
                      <div className="min-w-0">

                        <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-pink-600 transition-colors">
                          {paper.title ||
                            'Untitled Publication'}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {authors}
                          {paper.doi && (
                            <>
                              {' '}
                              · DOI{' '}
                              {paper.doi}
                            </>
                          )}
                        </p>

                        {/* Research Tags */}
                        {(paper.field ||
                          paper.expertise ||
                          paper.tags) && (
                          <div className="flex flex-wrap gap-1.5 mt-2">

                            {[
                              ...(paper.field
                                ? [paper.field]
                                : []),
                              ...(Array.isArray(
                                paper.expertise
                              )
                                ? paper.expertise
                                : paper.expertise
                                ? [
                                    paper.expertise,
                                  ]
                                : []),
                              ...(Array.isArray(
                                paper.tags
                              )
                                ? paper.tags
                                : []),
                            ]
                              .filter(
                                (item, index, arr) =>
                                  item &&
                                  arr.indexOf(
                                    item
                                  ) === index
                              )
                              .slice(0, 3)
                              .map(
                                (
                                  tag,
                                  index
                                ) => (
                                  <span
                                    key={index}
                                    className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-medium rounded-full"
                                  >
                                    {tag}
                                  </span>
                                )
                              )}

                          </div>
                        )}

                      </div>

                      {/* Type */}
                      <div className="text-xs text-purple-600 font-medium">
                        {type}
                      </div>

                      {/* Venue */}
                      <div className="text-xs text-slate-500 truncate">
                        {venue}
                      </div>

                      {/* Year */}
                      <div className="text-xs text-slate-800 font-medium">
                        {year}
                      </div>

                      {/* Status */}
                      <div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold ${
                            status
                              .toLowerCase()
                              .includes(
                                'published'
                              )
                              ? 'bg-emerald-50 text-emerald-600'
                              : status
                                  .toLowerCase()
                                  .includes(
                                    'submitted'
                                  )
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-orange-50 text-orange-600'
                          }`}
                        >

                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              status
                                .toLowerCase()
                                .includes(
                                  'published'
                                )
                                ? 'bg-emerald-500'
                                : status
                                    .toLowerCase()
                                    .includes(
                                      'submitted'
                                    )
                                ? 'bg-blue-500'
                                : 'bg-orange-500'
                            }`}
                          />

                          {status}

                        </span>

                      </div>

                      {/* Citations */}
                      <div className="text-center">

                        <span className="text-sm font-semibold text-purple-600">
                          {citations.toLocaleString()}
                        </span>

                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-center gap-3">

                        <button
                          type="button"
                          title="Download publication"
                          onClick={(event) =>
                            handleDownload(
                              paper,
                              event
                            )
                          }
                          className="p-1.5 text-slate-600 hover:text-pink-600 hover:bg-pink-50 rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          title="Share publication"
                          onClick={(event) =>
                            handleShare(
                              paper,
                              event
                            )
                          }
                          className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                      </div>

                    </div>

                    {/* Mobile / Tablet Card */}
                    <div className="lg:hidden p-5">

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex-1 min-w-0">

                          <div className="flex flex-wrap items-center gap-2 mb-2">

                            <span className="px-2.5 py-1 bg-pink-50 text-pink-600 border border-pink-100 text-[10px] font-semibold rounded-full">
                              {type}
                            </span>

                            <span className="text-[10px] text-slate-500">
                              {year}
                            </span>

                          </div>

                          <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                            {paper.title ||
                              'Untitled Publication'}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1">
                            {authors}
                          </p>

                          <p className="text-xs text-slate-500 mt-2">
                            {venue}
                          </p>

                        </div>

                        <div className="flex items-center gap-1 shrink-0">

                          <button
                            type="button"
                            title="Download publication"
                            onClick={(event) =>
                              handleDownload(
                                paper,
                                event
                              )
                            }
                            className="p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            title="Share publication"
                            onClick={(event) =>
                              handleShare(
                                paper,
                                event
                              )
                            }
                            className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <ChevronRight className="w-4 h-4 text-pink-300 ml-1" />

                        </div>

                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-pink-100">

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold ${
                            status
                              .toLowerCase()
                              .includes(
                                'published'
                              )
                              ? 'bg-emerald-50 text-emerald-600'
                              : status
                                  .toLowerCase()
                                  .includes(
                                    'submitted'
                                  )
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-orange-50 text-orange-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              status
                                .toLowerCase()
                                .includes(
                                  'published'
                                )
                                ? 'bg-emerald-500'
                                : status
                                    .toLowerCase()
                                    .includes(
                                      'submitted'
                                    )
                                ? 'bg-blue-500'
                                : 'bg-orange-500'
                            }`}
                          />
                          {status}
                        </span>

                        <span className="text-xs text-slate-500">
                          <span className="font-semibold text-purple-600">
                            {citations.toLocaleString()}
                          </span>{' '}
                          citations
                        </span>

                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-pink-100 p-12 text-center">

            <Search className="w-9 h-9 text-pink-200 mx-auto" />

            <p className="text-sm font-semibold text-slate-700 mt-3">
              No publications found
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search or publication type.
            </p>

          </div>
        )}

      </div>
    </MainLayout>
  );
}