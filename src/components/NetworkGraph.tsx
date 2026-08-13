import React, { useState, useEffect } from 'react';
import { ResearcherNode, CollaborationLink } from '../types';
import { INITIAL_RESEARCHERS, INITIAL_LINKS, DOMAINS } from '../data/networkData';
import ExportReportModal from './ExportReportModal';
import {
  Share2,
  Search,
  Award,
  BookOpen,
  Building,
  UserCheck,
  Zap,
  Network,
  Maximize2,
  TrendingUp,
  Plus,
  GitCommit,
  Check,
  X,
  Filter,
  Briefcase,
  FileText,
  Download
} from 'lucide-react';

export interface ActiveGlobalFilter {
  type: 'researcher' | 'institution' | 'project';
  label: string;
  details?: string;
  targetResearcherId?: string;
  investigators?: string[];
}

interface NetworkGraphProps {
  externalSearchQuery?: string;
  externalSelectedNodeId?: string | null;
  activeGlobalFilter?: ActiveGlobalFilter | null;
  onClearGlobalFilter?: () => void;
}

export default function NetworkGraph({
  externalSearchQuery,
  externalSelectedNodeId,
  activeGlobalFilter,
  onClearGlobalFilter,
}: NetworkGraphProps) {
  const [nodes, setNodes] = useState<ResearcherNode[]>(INITIAL_RESEARCHERS);
  const [links, setLinks] = useState<CollaborationLink[]>(INITIAL_LINKS);
  const [selectedNode, setSelectedNode] = useState<ResearcherNode | null>(INITIAL_RESEARCHERS[0]);
  const [selectedDomain, setSelectedDomain] = useState<string>('All Domains');
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Path finder state
  const [sourcePathId, setSourcePathId] = useState<string>('r1');
  const [targetPathId, setTargetPathId] = useState<string>('r5');
  const [calculatedPath, setCalculatedPath] = useState<string[] | null>(['r1', 'r2', 'r5']);

  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  useEffect(() => {
    if (externalSelectedNodeId) {
      const match = nodes.find((n) => n.id === externalSelectedNodeId);
      if (match) {
        setSelectedNode(match);
      }
    }
  }, [externalSelectedNodeId, nodes]);

  const filteredNodes = nodes.filter((n) => {
    // Domain match
    const matchesDomain = selectedDomain === 'All Domains' || n.domain === selectedDomain;

    // Search query match
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      n.name.toLowerCase().includes(query) ||
      n.institution.toLowerCase().includes(query) ||
      n.domain.toLowerCase().includes(query) ||
      n.role.toLowerCase().includes(query);

    // Global Filter match (Institution, Project, Researcher)
    let matchesGlobalFilter = true;
    if (activeGlobalFilter) {
      if (activeGlobalFilter.type === 'institution') {
        matchesGlobalFilter = n.institution.toLowerCase() === activeGlobalFilter.label.toLowerCase();
      } else if (activeGlobalFilter.type === 'project' && activeGlobalFilter.investigators) {
        matchesGlobalFilter = activeGlobalFilter.investigators.some(
          (piName) => piName.toLowerCase() === n.name.toLowerCase()
        );
      } else if (activeGlobalFilter.type === 'researcher' && activeGlobalFilter.targetResearcherId) {
        // Highlight researcher and direct collaborators
        const partnerIds = links
          .filter((l) => l.source === activeGlobalFilter.targetResearcherId || l.target === activeGlobalFilter.targetResearcherId)
          .map((l) => (l.source === activeGlobalFilter.targetResearcherId ? l.target : l.source));
        matchesGlobalFilter = n.id === activeGlobalFilter.targetResearcherId || partnerIds.includes(n.id);
      }
    }

    return matchesDomain && matchesSearch && matchesGlobalFilter;
  });


  const getDirectCollaborators = (nodeId: string) => {
    const connectedLinks = links.filter((l) => l.source === nodeId || l.target === nodeId);
    const partnerIds = connectedLinks.map((l) => (l.source === nodeId ? l.target : l.source));
    return nodes.filter((n) => partnerIds.includes(n.id));
  };

  const handleNodeClick = (node: ResearcherNode) => {
    setSelectedNode(node);
  };

  const handleFindShortestPath = () => {
    if (sourcePathId === targetPathId) {
      setCalculatedPath([sourcePathId]);
      return;
    }
    // Simple BFS for shortest path in unweighted graph representation
    const queue: string[][] = [[sourcePathId]];
    const visited = new Set<string>([sourcePathId]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const lastNode = path[path.length - 1];

      if (lastNode === targetPathId) {
        setCalculatedPath(path);
        return;
      }

      const connectedLinks = links.filter((l) => l.source === lastNode || l.target === lastNode);
      for (const link of connectedLinks) {
        const neighbor = link.source === lastNode ? link.target : link.source;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    setCalculatedPath(null); // No path
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Total Researchers</p>
            <p className="text-xl font-bold font-mono text-zinc-100">{nodes.length}</p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Co-Authorship Links</p>
            <p className="text-xl font-bold font-mono text-zinc-100">{links.length}</p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Avg h-Index</p>
            <p className="text-xl font-bold font-mono text-zinc-100">
              {Math.round(nodes.reduce((acc, n) => acc + n.hIndex, 0) / nodes.length)}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Network Density</p>
            <p className="text-xl font-bold font-mono text-zinc-100">0.53</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Interactive Canvas & Controls */}
        <div className="lg:col-span-8 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
          {/* Controls Bar */}
          <div className="space-y-2 border-b border-zinc-800 pb-4">
            {activeGlobalFilter && (
              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-zinc-300">Active Global Filter:</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-600 text-white capitalize">
                    {activeGlobalFilter.type}: {activeGlobalFilter.label}
                  </span>
                  {activeGlobalFilter.details && (
                    <span className="text-zinc-400 hidden sm:inline">({activeGlobalFilter.details})</span>
                  )}
                </div>
                {onClearGlobalFilter && (
                  <button
                    onClick={onClearGlobalFilter}
                    className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-[11px]"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear Filter</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter nodes in canvas by researcher, domain or institution..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 shrink-0"
                  title="Export PDF Report for scientific reporting"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export PDF Report</span>
                </button>
              </div>
            </div>
          </div>


          {/* Interactive Network Graph SVG Container */}
          <div className="relative w-full h-[440px] bg-zinc-950 rounded-xl border border-zinc-800/80 overflow-hidden flex items-center justify-center p-2">
            <svg className="w-full h-full" viewBox="0 0 800 500">
              <defs>
                <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background grid dots */}
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#27272a" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Render Collaboration Links */}
              {links.map((link, idx) => {
                const sourceNode = nodes.find((n) => n.id === link.source);
                const targetNode = nodes.find((n) => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const isPathLink =
                  calculatedPath &&
                  calculatedPath.includes(link.source) &&
                  calculatedPath.includes(link.target) &&
                  Math.abs(calculatedPath.indexOf(link.source) - calculatedPath.indexOf(link.target)) === 1;

                return (
                  <g key={idx}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isPathLink ? '#10b981' : '#3f3f46'}
                      strokeWidth={isPathLink ? 3.5 : Math.max(1, link.weight / 3)}
                      strokeDasharray={isPathLink ? 'none' : '4 2'}
                      opacity={isPathLink ? 0.9 : 0.5}
                    />
                    {/* Link weight label pill */}
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 4}
                      fill={isPathLink ? '#a7f3d0' : '#71717a'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {link.weight} papers
                    </text>
                  </g>
                );
              })}

              {/* Render Researcher Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isInPath = calculatedPath?.includes(node.id);

                return (
                  <g
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className="cursor-pointer transition-all duration-200 hover:scale-110"
                    transform={`translate(${node.x}, ${node.y})`}
                  >
                    {/* Selection / Path Glow */}
                    {(isSelected || isInPath) && (
                      <circle
                        r="32"
                        fill={isInPath ? '#10b981' : node.color}
                        opacity="0.25"
                        className="animate-pulse"
                      />
                    )}

                    {/* Base Node Circle */}
                    <circle
                      r={20 + node.hIndex / 5}
                      fill="#18181b"
                      stroke={isInPath ? '#10b981' : isSelected ? '#ffffff' : node.color}
                      strokeWidth={isSelected ? 3 : 2}
                    />

                    {/* Node Initials */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#f4f4f5"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {node.name.split(' ').map((n) => n[0]).join('')}
                    </text>

                    {/* Name Tag below node */}
                    <text
                      textAnchor="middle"
                      dy="36"
                      fill={isSelected ? '#ffffff' : '#a1a1aa'}
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-zinc-900/90 backdrop-blur-xs border border-zinc-800 p-2.5 rounded-lg text-[10px] space-y-1.5 text-zinc-400">
              <div className="font-semibold text-zinc-200">Domain Palette</div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                <span>Quantum Computing</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>AI & Neural Networks</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
                <span>Genomics & CRISPR</span>
              </div>
            </div>
          </div>

          {/* Shortest Collaboration Path Finder Tool */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-200 flex items-center space-x-1.5">
                <GitCommit className="w-4 h-4 text-emerald-400" />
                <span>Shortest Co-Authorship Path Solver (Graph Theory)</span>
              </span>
              <button
                onClick={handleFindShortestPath}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center space-x-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Compute Path</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-zinc-400 text-[11px] block mb-1">Source Author</label>
                <select
                  value={sourcePathId}
                  onChange={(e) => setSourcePathId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.institution})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 text-[11px] block mb-1">Target Author</label>
                <select
                  value={targetPathId}
                  onChange={(e) => setTargetPathId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.institution})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {calculatedPath && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center space-x-2 overflow-x-auto font-mono">
                <span className="font-bold shrink-0">Optimal Path ({calculatedPath.length - 1} degrees):</span>
                {calculatedPath.map((id, idx) => {
                  const node = nodes.find((n) => n.id === id);
                  return (
                    <React.Fragment key={id}>
                      <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 font-bold">
                        {node?.name}
                      </span>
                      {idx < calculatedPath.length - 1 && <span>→</span>}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Inspector Side Panel */}
        <div className="lg:col-span-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-sm text-zinc-100 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Researcher Profile Inspector</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              DB ID #{selectedNode?.dbId}
            </span>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              {/* Profile Card Header */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-100">{selectedNode.name}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                </div>

                <div className="space-y-1 text-zinc-400 text-[11px]">
                  <p className="flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{selectedNode.institution}</span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Domain: {selectedNode.domain}</span>
                  </p>
                </div>
              </div>

              {/* Bibliometric Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">h-Index</p>
                  <p className="text-lg font-bold font-mono text-indigo-400">{selectedNode.hIndex}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Citations</p>
                  <p className="text-lg font-bold font-mono text-emerald-400">{selectedNode.citations}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Papers</p>
                  <p className="text-lg font-bold font-mono text-amber-400">{selectedNode.publicationsCount}</p>
                </div>
              </div>

              {/* Direct Co-Authors */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Direct Co-Authors ({getDirectCollaborators(selectedNode.id).length})
                </label>

                <div className="space-y-1.5">
                  {getDirectCollaborators(selectedNode.id).map((partner) => {
                    const link = links.find(
                      (l) =>
                        (l.source === selectedNode.id && l.target === partner.id) ||
                        (l.target === selectedNode.id && l.source === partner.id)
                    );

                    return (
                      <div
                        key={partner.id}
                        onClick={() => setSelectedNode(partner)}
                        className="p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-zinc-200">{partner.name}</p>
                          <p className="text-[10px] text-zinc-500">{partner.institution}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono text-[10px]">
                          {link?.weight} joint papers
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-zinc-500 text-xs">
              Click any node on the graph to inspect author bibliometrics and co-authorship relationships.
            </div>
          )}
        </div>
      </div>

      {/* Scientific Report PDF Export Modal */}
      <ExportReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        filteredNodes={filteredNodes}
        allLinks={links}
        activeDomain={selectedDomain}
        searchQuery={searchQuery}
        activeGlobalFilter={activeGlobalFilter}
      />
    </div>
  );
}
