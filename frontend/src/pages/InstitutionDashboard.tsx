import React from 'react';
import {
  Building,
  Users,
  Briefcase,
  Award,
  Globe,
  Share2,
  FileText,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { INITIAL_INSTITUTIONS, INITIAL_RESEARCHERS, INITIAL_PROJECTS } from '../data/mockData';

interface InstitutionDashboardProps {
  onNavigate: (tab: string) => void;
  onSelectInstitution: (institutionName: string) => void;
}

export default function InstitutionDashboard({ onNavigate, onSelectInstitution }: InstitutionDashboardProps) {
  const currentInst = INITIAL_INSTITUTIONS[0]; // Stanford University

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-zinc-100">{currentInst.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                Institution Portal
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {currentInst.country} • Primary Focus: <span className="text-amber-300 font-semibold">{currentInst.domainFocus}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Institutional Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">Affiliated Faculty</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">142</div>
          <p className="text-[10px] text-zinc-500">Active tenure-track professors</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Total Grant Funding</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{currentInst.totalGrants}</div>
          <p className="text-[10px] text-zinc-500">Across 18 active labs</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Publications Output</span>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">{currentInst.publicationsTotal}</div>
          <p className="text-[10px] text-zinc-500">Indexed in Nature & IEEE</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Global Partner Network</span>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">24 Universities</div>
          <p className="text-[10px] text-zinc-500">MIT, Oxford, CERN, UTokyo</p>
        </div>
      </div>

      {/* Institutional Partner Networks & Faculty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) - Institutional Partners Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Inter-Institutional Co-Authorship Partners</span>
              </h3>
              <button
                onClick={() => onNavigate('collaboration')}
                className="text-xs font-semibold text-indigo-400 hover:underline"
              >
                Inspect Graph Topology →
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[10px]">
                  <tr>
                    <th className="p-3">Partner Institution</th>
                    <th className="p-3">Country</th>
                    <th className="p-3">Domain Focus</th>
                    <th className="p-3">Faculty Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300 text-[11px]">
                  {INITIAL_INSTITUTIONS.map((inst) => (
                    <tr
                      key={inst.id}
                      onClick={() => onSelectInstitution(inst.name)}
                      className="hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      <td className="p-3 font-bold text-zinc-100">{inst.name}</td>
                      <td className="p-3 text-zinc-400 font-sans">{inst.country}</td>
                      <td className="p-3 text-amber-300 font-sans">{inst.domainFocus}</td>
                      <td className="p-3 font-bold text-indigo-400">{inst.researcherCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) - Departmental Research Grants */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Active Departmental Grants</span>
            </h3>

            <div className="space-y-2">
              {INITIAL_PROJECTS.map((proj) => (
                <div key={proj.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-200">{proj.domain}</span>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">{proj.fundingAmount}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">{proj.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
