import React, { useState } from 'react';
import { BookOpen, Search, Plus, Filter, Award, ExternalLink, FileText, Check, X } from 'lucide-react';
import { MOCK_PUBLICATIONS, DOMAINS } from '../data/mockData';
import { Publication } from '../types';

export default function PublicationManagementPage() {
  const [publications, setPublications] = useState<Publication[]>(MOCK_PUBLICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAuthors, setNewAuthors] = useState('');
  const [newJournal, setNewJournal] = useState('');
  const [newDoi, setNewDoi] = useState('');
  const [newDomain, setNewDomain] = useState('Quantum Computing');

  const filtered = publications.filter((pub) => {
    const matchesDomain = selectedDomain === 'All Domains' || pub.domain === selectedDomain;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      pub.title.toLowerCase().includes(query) ||
      pub.journal.toLowerCase().includes(query) ||
      pub.doi.toLowerCase().includes(query) ||
      pub.authors.some((a) => a.toLowerCase().includes(query));
    return matchesDomain && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newJournal.trim()) return;

    const newPub: Publication = {
      id: `pub-${Date.now()}`,
      title: newTitle,
      authors: newAuthors.split(',').map((a) => a.trim()),
      journal: newJournal,
      year: 2026,
      citations: 0,
      doi: newDoi || '10.1038/s41534-026-0011-x',
      domain: newDomain,
      abstract: 'Newly published manuscript added to the SciConnect Repository.',
    };

    setPublications([newPub, ...publications]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewAuthors('');
    setNewJournal('');
    setNewDoi('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Indexed Academic Publications & Papers</span>
          </h1>
          <p className="text-xs text-zinc-400">Track citations, journal DOIs, co-authorship attribution & metadata</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Research Paper</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search papers by title, author, journal or DOI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200"
        >
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Publications List */}
      <div className="space-y-3">
        {filtered.map((pub) => (
          <div
            key={pub.id}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 hover:border-indigo-500/30 transition-all shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 hover:text-indigo-300 transition-colors">
                  {pub.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Authors: <span className="text-zinc-200 font-medium">{pub.authors.join(', ')}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                  {pub.citations} Citations
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 text-zinc-400 border border-zinc-800 text-xs font-bold">
                  {pub.year}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              {pub.abstract}
            </p>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/80">
              <span className="text-indigo-400 font-semibold">{pub.journal}</span>
              <span className="flex items-center space-x-1 text-zinc-400">
                <span>DOI: {pub.doi}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Paper Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">Add New Research Paper</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Paper Title</label>
                <input
                  type="text"
                  placeholder="Topological Quantum Coherence in Superconducting Arrays"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Authors (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Dr. Alena Vass, Prof. Marcus Chen"
                  value={newAuthors}
                  onChange={(e) => setNewAuthors(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">Journal / Publication Venue</label>
                <input
                  type="text"
                  placeholder="Nature Quantum Information"
                  value={newJournal}
                  onChange={(e) => setNewJournal(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">DOI Reference</label>
                <input
                  type="text"
                  placeholder="10.1038/s41534-026-00912-x"
                  value={newDoi}
                  onChange={(e) => setNewDoi(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-zinc-950 text-zinc-400 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs"
              >
                Save Paper
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
