import React, { useRef, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  Check,
  ShieldCheck,
  Share2,
  User,
  Award,
  Sparkles,
  Calendar,
  Filter
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResearcherNode, CollaborationLink } from '../types';

export interface ActiveGlobalFilter {
  type: 'researcher' | 'institution' | 'project';
  label: string;
  details?: string;
  targetResearcherId?: string;
  investigators?: string[];
}

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredNodes: ResearcherNode[];
  allLinks: CollaborationLink[];
  activeDomain: string;
  searchQuery: string;
  activeGlobalFilter?: ActiveGlobalFilter | null;
}

export default function ExportReportModal({
  isOpen,
  onClose,
  filteredNodes,
  allLinks,
  activeDomain,
  searchQuery,
  activeGlobalFilter,
}: ExportReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [reportTitle] = useState('SciConnect Co-Authorship & Network Analysis Summary');
  const [authorName] = useState('Dr. Alena Vass (Lead Investigator)');
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [includeResearcherTable, setIncludeResearcherTable] = useState(true);
  const [includeCoAuthorshipMatrix, setIncludeCoAuthorshipMatrix] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredLinks = allLinks.filter(
    (l) => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target)
  );

  const totalCitations = filteredNodes.reduce((acc, curr) => acc + curr.citations, 0);
  const avgHIndex =
    filteredNodes.length > 0
      ? (filteredNodes.reduce((acc, curr) => acc + curr.hIndex, 0) / filteredNodes.length).toFixed(1)
      : '0.0';

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const reportId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#09090b', // Zinc 950
        onclone: (clonedDoc) => {
          // Offscreen canvas context for color parsing
          const cCanvas = clonedDoc.createElement('canvas');
          cCanvas.width = 1;
          cCanvas.height = 1;
          const ctx = cCanvas.getContext('2d');

          const parseToRgb = (colorStr: string): string => {
            if (!colorStr || !colorStr.includes('oklch')) return colorStr;
            if (!ctx) return '#18181b';
            try {
              ctx.fillStyle = '#000000';
              ctx.fillStyle = colorStr;
              return ctx.fillStyle;
            } catch {
              return '#18181b';
            }
          };

          const parseText = (text: string): string => {
            if (!text || !text.includes('oklch')) return text;
            return text.replace(/oklch\([^)]+\)/g, (m) => parseToRgb(m));
          };

          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach((styleEl) => {
            if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
              styleEl.textContent = parseText(styleEl.textContent);
            }
          });

          const clonedReportRoot = (clonedDoc.querySelector('[data-report-root]') as HTMLElement) || clonedDoc.body;
          const origElements = Array.from(element.querySelectorAll('*'));
          const clonedElements = Array.from(clonedReportRoot.querySelectorAll('*'));

          const rootCs = window.getComputedStyle(element);
          ['color', 'backgroundColor', 'borderColor'].forEach((prop) => {
            const val = rootCs.getPropertyValue(prop);
            if (val && val.includes('oklch')) {
              clonedReportRoot.style.setProperty(prop, parseToRgb(val), 'important');
            }
          });

          origElements.forEach((origEl, idx) => {
            const clonedEl = clonedElements[idx] as HTMLElement;
            if (!clonedEl) return;
            const cs = window.getComputedStyle(origEl as Element);
            ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'].forEach((prop) => {
              const val = cs.getPropertyValue(prop);
              if (val && val.includes('oklch')) {
                clonedEl.style.setProperty(prop, parseToRgb(val), 'important');
              }
            });
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`SciConnect_Network_Report_${reportId}.pdf`);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Export SciConnect Summary PDF</h2>
              <p className="text-xs text-zinc-400">Generate publication-grade PDF report with network metrics</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Report Settings Bar */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center space-x-1.5 text-zinc-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeExecutiveSummary}
                onChange={(e) => setIncludeExecutiveSummary(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Executive Summary</span>
            </label>

            <label className="flex items-center space-x-1.5 text-zinc-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeResearcherTable}
                onChange={(e) => setIncludeResearcherTable(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Faculty Roster</span>
            </label>

            <label className="flex items-center space-x-1.5 text-zinc-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeCoAuthorshipMatrix}
                onChange={(e) => setIncludeCoAuthorshipMatrix(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Co-Authorship Edges</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold transition-colors flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 disabled:opacity-50"
            >
              {exportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Downloaded PDF!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating PDF...' : 'Download PDF Report'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PDF Document Preview Canvas Area */}
        <div className="p-6 overflow-y-auto bg-zinc-950 flex-1">
          <div
            ref={reportRef}
            data-report-root="true"
            className="bg-zinc-950 text-zinc-100 p-8 rounded-xl border border-zinc-800 space-y-6 max-w-3xl mx-auto shadow-2xl font-sans"
          >
            {/* Header Document Branding */}
            <div className="border-b border-zinc-800 pb-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                  <Share2 className="w-4 h-4" />
                  <span>SciConnect Analytics Platform</span>
                </div>
                <h1 className="text-xl font-bold text-zinc-100">{reportTitle}</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Prepared by <strong className="text-zinc-200">{authorName}</strong>
                </p>
              </div>

              <div className="text-right font-mono text-[11px] text-zinc-400 space-y-1 shrink-0">
                <div className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 font-bold text-indigo-300">
                  {reportId}
                </div>
                <div className="flex items-center justify-end space-x-1 text-zinc-500">
                  <Calendar className="w-3 h-3" />
                  <span>{reportDate}</span>
                </div>
              </div>
            </div>

            {/* Scope & Applied Filters Banner */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-zinc-300">
                <span className="flex items-center space-x-1 text-indigo-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Report Scope & Applied Filters</span>
                </span>
                <span className="font-mono text-zinc-500 text-[10px]">Domain: {activeDomain}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-zinc-500">Active Search Query:</span>{' '}
                  <span className="text-zinc-200">{searchQuery || 'None (Full Graph)'}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Global Filter:</span>{' '}
                  <span className="text-amber-400">
                    {activeGlobalFilter ? `${activeGlobalFilter.type}: ${activeGlobalFilter.label}` : 'All Entities'}
                  </span>
                </div>
              </div>
            </div>

            {/* Network Statistics Key Metrics Cards */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Faculty Nodes</span>
                <span className="text-lg font-extrabold text-indigo-400">{filteredNodes.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Co-Authorships</span>
                <span className="text-lg font-extrabold text-emerald-400">{filteredLinks.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Total Citations</span>
                <span className="text-lg font-extrabold text-amber-400">{totalCitations.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Mean h-Index</span>
                <span className="text-lg font-extrabold text-purple-400">{avgHIndex}</span>
              </div>
            </div>

            {/* Executive Summary */}
            {includeExecutiveSummary && (
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Executive Analytical Summary</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  This report summarizes the current scientific co-authorship topology for{' '}
                  <strong>{filteredNodes.length} key researchers</strong> across identified institutional clusters.
                  Network density metrics indicate high inter-faculty collaboration in quantum computing and genomics.
                  The primary central node exhibits <strong>{totalCitations} aggregate citations</strong> with an
                  average h-index of {avgHIndex}.
                </p>
              </div>
            )}

            {/* Researcher Faculty Roster Table */}
            {includeResearcherTable && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Faculty & Researcher Roster</span>
                </h3>

                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/90">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-[10px]">
                      <tr>
                        <th className="p-2.5">Researcher</th>
                        <th className="p-2.5">Institution</th>
                        <th className="p-2.5">Domain</th>
                        <th className="p-2.5">h-Index</th>
                        <th className="p-2.5">Citations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300 text-[11px]">
                      {filteredNodes.map((r) => (
                        <tr key={r.id}>
                          <td className="p-2.5 font-bold text-zinc-100">{r.name}</td>
                          <td className="p-2.5 text-zinc-400 font-sans">{r.institution}</td>
                          <td className="p-2.5 text-indigo-300 font-sans">{r.domain}</td>
                          <td className="p-2.5 text-emerald-400 font-bold">{r.hIndex}</td>
                          <td className="p-2.5 text-amber-400 font-bold">{r.citations.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Co-Authorship Links Matrix */}
            {includeCoAuthorshipMatrix && filteredLinks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Co-Authorship Connections ({filteredLinks.length} Edges)</span>
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {filteredLinks.map((link, idx) => {
                    const sourceNode = filteredNodes.find((n) => n.id === link.source);
                    const targetNode = filteredNodes.find((n) => n.id === link.target);
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-between"
                      >
                        <div className="truncate">
                          <span className="font-bold text-zinc-100">{sourceNode?.name || link.source}</span>
                          <span className="text-zinc-500 mx-1 border-b border-dashed border-zinc-600 px-1">↔</span>
                          <span className="font-bold text-zinc-100">{targetNode?.name || link.target}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold text-[10px] shrink-0 border border-emerald-500/20">
                          {link.weight} joint papers
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Report Footer Notice */}
            <div className="pt-4 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Generated by SciConnect • Verified Auth Session</span>
              </span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
