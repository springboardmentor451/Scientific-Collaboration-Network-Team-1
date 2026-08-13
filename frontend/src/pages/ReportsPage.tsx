import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Check, Share2, Sparkles } from 'lucide-react';
import ExportReportModal from '../components/ExportReportModal';
import { INITIAL_RESEARCHERS, INITIAL_LINKS } from '../data/mockData';

export default function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>SciConnect Reports & PDF Export Center</span>
          </h1>
          <p className="text-xs text-zinc-400">Generate publication-grade summary reports of network metrics and co-authorships</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Launch PDF Exporter Tool</span>
        </button>
      </div>

      {/* Report Types Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setIsModalOpen(true)}
          className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 transition-all cursor-pointer space-y-3 shadow-sm group"
        >
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-max">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-100 group-hover:text-indigo-300">Co-Authorship Network Audit</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Executive PDF summary of network nodes, degree centrality metrics, and active institutional edges.
          </p>
          <span className="text-xs font-bold text-indigo-400 block pt-2">Generate PDF →</span>
        </div>

        <div
          onClick={() => setIsModalOpen(true)}
          className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer space-y-3 shadow-sm group"
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-max">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-300">Faculty Publication Roster</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tabular breakdown of faculty members, h-index rankings, total citations, and indexed DOIs.
          </p>
          <span className="text-xs font-bold text-emerald-400 block pt-2">Generate PDF →</span>
        </div>

        <div
          onClick={() => setIsModalOpen(true)}
          className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer space-y-3 shadow-sm group"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-max">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-100 group-hover:text-amber-300">Grant & Project Summary</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Analytical summary of active grant funding, lead university institutions, and principal investigators.
          </p>
          <span className="text-xs font-bold text-amber-400 block pt-2">Generate PDF →</span>
        </div>
      </div>

      <ExportReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filteredNodes={INITIAL_RESEARCHERS}
        allLinks={INITIAL_LINKS}
        activeDomain="All Domains"
        searchQuery=""
      />
    </div>
  );
}
