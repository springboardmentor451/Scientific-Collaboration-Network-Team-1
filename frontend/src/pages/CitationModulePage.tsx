import React, { useState } from 'react';
import { Award, TrendingUp, Download, Copy, Check, FileText } from 'lucide-react';
import { MOCK_PUBLICATIONS, MOCK_CITATION_METRICS } from '../data/mockData';

export default function CitationModulePage() {
  const [copiedBibtexId, setCopiedBibtexId] = useState<string | null>(null);

  const generateBibTeX = (pubTitle: string, authors: string[], year: number, journal: string, doi: string) => {
    const authorStr = authors.join(' and ');
    const tag = authors[0].split(' ')[1] || 'Author';
    return `@article{${tag}${year},
  author = {${authorStr}},
  title = {${pubTitle}},
  journal = {${journal}},
  year = {${year}},
  doi = {${doi}}
}`;
  };

  const handleCopyBibTeX = (pubId: string, bibText: string) => {
    navigator.clipboard.writeText(bibText);
    setCopiedBibtexId(pubId);
    setTimeout(() => setCopiedBibtexId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Citation Intelligence & BibTeX Export Module</span>
          </h1>
          <p className="text-xs text-zinc-400">Journal impact metrics, citation growth velocity, and reference exporting</p>
        </div>
      </div>

      {/* Citation Trajectory Chart */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Annual Citation Growth Trend (2021–2026)</span>
        </h3>

        <div className="grid grid-cols-6 gap-4 items-end h-44 pt-6">
          {MOCK_CITATION_METRICS.map((m) => {
            const maxCitations = 6000;
            const heightPercent = Math.round((m.citationsCount / maxCitations) * 100);
            return (
              <div key={m.year} className="flex flex-col items-center space-y-2 h-full justify-end group">
                <span className="text-xs font-mono text-zinc-300 font-bold group-hover:text-emerald-400">
                  {m.citationsCount}
                </span>
                <div
                  className="w-full bg-emerald-500/20 group-hover:bg-emerald-500 border border-emerald-500/40 rounded-t-xl transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-xs font-mono text-zinc-400">{m.year}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* BibTeX Reference Exporter Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>BibTeX Citation Exporter</span>
        </h3>

        <div className="space-y-3">
          {MOCK_PUBLICATIONS.map((pub) => {
            const bibText = generateBibTeX(pub.title, pub.authors, pub.year, pub.journal, pub.doi);
            const isCopied = copiedBibtexId === pub.id;
            return (
              <div key={pub.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-100">{pub.title}</h4>
                  <button
                    onClick={() => handleCopyBibTeX(pub.id, bibText)}
                    className="px-3 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors flex items-center space-x-1.5"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy BibTeX</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre">
                  {bibText}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
