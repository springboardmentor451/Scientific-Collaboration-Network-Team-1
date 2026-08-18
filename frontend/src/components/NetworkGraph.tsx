import React, { useState, useEffect } from 'react';
import { ResearcherNode, CollaborationLink } from '../types';
import { INITIAL_RESEARCHERS, INITIAL_LINKS, DOMAINS } from '../data/mockData';
import ExportReportModal, { ActiveGlobalFilter } from './ExportReportModal';
import {
  Share2,
  Search,
  Filter,
  Zap,
  TrendingUp,
  Plus,
  GitCommit,
  Check,
  X,
  FileText,
  Award,
  Building,
  BookOpen
} from 'lucide-react';

interface NetworkGraphProps {
  externalSearchQuery?: string;
  externalSelectedNodeId?: string | null;
  activeGlobalFilter?: ActiveGlobalFilter | null;
  onClearGlobalFilter?: () => void;
  onNavigateToProfile?: (researcherId: string) => void;
}

export default function NetworkGraph({
  externalSearchQuery,
  externalSelectedNodeId,
  activeGlobalFilter,
  onClearGlobalFilter,
  onNavigateToProfile,
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

  // Add Researcher Form State
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newDomain, setNewDomain] = useState('Quantum Computing');

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
    const matchesDomain = selectedDomain === 'All Domains' || n.domain === selectedDomain;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      n.name.toLowerCase().includes(query) ||
      n.institution.toLowerCase().includes(query) ||
      n.domain.toLowerCase().includes(query) ||
      n.role.toLowerCase().includes(query);

    let matchesGlobalFilter = true;
    if (activeGlobalFilter) {
      if (activeGlobalFilter.type === 'institution') {
        matchesGlobalFilter = n.institution.toLowerCase() === activeGlobalFilter.label.toLowerCase();
      } else if (activeGlobalFilter.type === 'project' && activeGlobalFilter.investigators) {
        matchesGlobalFilter = activeGlobalFilter.investigators.some(
          (piName) => piName.toLowerCase() === n.name.toLowerCase()
        );
      } else if (activeGlobalFilter.type === 'researcher' && activeGlobalFilter.targetResearcherId) {
        const partnerIds = links
          .filter(
            (l) =>
              l.source === activeGlobalFilter.targetResearcherId ||
              l.target === activeGlobalFilter.targetResearcherId
          )
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

  const handleCalculatePath = () => {
    if (sourcePathId === targetPathId) {
      setCalculatedPath([sourcePathId]);
      return;
    }
    const queue: string[][] = [[sourcePathId]];
    const visited = new Set<string>([sourcePathId]);

    while (queue.length > 0) {
      const currentPath = queue.shift()!;
      const lastNode = currentPath[currentPath.length - 1];

      if (lastNode === targetPathId) {
        setCalculatedPath(currentPath);
        return;
      }

      const neighborLinks = links.filter((l) => l.source === lastNode || l.target === lastNode);
      for (const l of neighborLinks) {
        const neighborId = l.source === lastNode ? l.target : l.source;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([...currentPath, neighborId]);
        }
      }
    }
    setCalculatedPath(null);
  };

  const handleAddResearcherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newInstitution.trim()) return;

    const newId = `r${nodes.length + 1}`;
    const colors = ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newNode: ResearcherNode = {
      id: newId,
      dbId: 100 + nodes.length + 1,
      name: newName,
      role: 'Researcher',
      institution: newInstitution,
      domain: newDomain,
      hIndex: Math.floor(Math.random() * 20) + 15,
      citations: Math.floor(Math.random() * 1500) + 300,
      publicationsCount: Math.floor(Math.random() * 30) + 10,
      x: Math.floor(Math.random() * 400) + 150,
      y: Math.floor(Math.random() * 250) + 100,
      color: randomColor,
    };

    setNodes([...nodes, newNode]);
    const targetLinkNode = selectedNode ? selectedNode.id : 'r1';
    setLinks([...links, { source: newId, target: targetLinkNode, weight: 1, jointProjects: 1 }]);
    setSelectedNode(newNode);
    setNewName('');
    setNewInstitution('');
    setIsAddingNode(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <span>Co-Authorship & Collaboration Network Topology</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Interactive graph visualizer mapping academic connections, institutional clusters, and path metrics
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsAddingNode(!isAddingNode)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-700"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>{isAddingNode ? 'Cancel' : 'Add Node'}</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Add Researcher Form Modal/Card */}
      {isAddingNode && (
        <form
          onSubmit={handleAddResearcherSubmit}
          className="p-4 bg-zinc-900 border border-indigo-500/30 rounded-2xl space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Add New Researcher Node to Canvas
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingNode(false)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Researcher Name</label>
              <input
                type="text"
                placeholder="Dr. Elena Rostova"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Institution</label>
              <input
                type="text"
                placeholder="Stanford University"
                value={newInstitution}
                onChange={(e) => setNewInstitution(e.target.value)}
                required
                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Domain</label>
              <select
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {DOMAINS.filter((d) => d !== 'All Domains').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm"
            >
              Confirm Node Addition
            </button>
          </div>
        </form>
      )}

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Canvas Column (8 cols) */}
        <div className="lg:col-span-8 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          {/* Active Global Filter Banner & Canvas Controls */}
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
                  placeholder="Filter canvas nodes by researcher, institution or domain..."
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
              </div>
            </div>
          </div>

          {/* SVG Canvas Container */}
          <div className="relative w-full h-[460px] bg-zinc-950 rounded-xl border border-zinc-800/80 overflow-hidden flex items-center justify-center p-2">
            <svg className="w-full h-full">
              {/* Grid Background Pattern */}
              <defs>
                <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" className="stroke-zinc-800" strokeWidth="0.5" strokeDasharray="2,2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridPattern)" opacity="0.6" />

              {/* Collaboration Edges */}
              {links.map((link, idx) => {
                const sourceNode = nodes.find((n) => n.id === link.source);
                const targetNode = nodes.find((n) => n.id === link.target);

                if (!sourceNode || !targetNode) return null;

                const isPathLink =
                  calculatedPath &&
                  calculatedPath.includes(link.source) &&
                  calculatedPath.includes(link.target) &&
                  Math.abs(calculatedPath.indexOf(link.source) - calculatedPath.indexOf(link.target)) === 1;

                const isSelectedConnected =
                  selectedNode && (selectedNode.id === link.source || selectedNode.id === link.target);

                return (
                  <g key={idx}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isPathLink ? '#10b981' : isSelectedConnected ? '#6366f1' : undefined}
                      className={!isPathLink && !isSelectedConnected ? 'stroke-zinc-700' : ''}
                      strokeWidth={isPathLink ? 3 : isSelectedConnected ? 2 : Math.max(1, link.weight / 4)}
                      strokeDasharray={isPathLink ? 'none' : isSelectedConnected ? 'none' : '4,2'}
                      opacity={isPathLink ? 1 : isSelectedConnected ? 0.9 : 0.4}
                    />
                  </g>
                );
              })}

              {/* Researcher Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isInPath = calculatedPath?.includes(node.id);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    {/* Glow Halo */}
                    {(isSelected || isInPath) && (
                      <circle
                        r={isSelected ? 26 : 22}
                        fill={isSelected ? '#6366f1' : '#10b981'}
                        opacity="0.25"
                        className="animate-pulse"
                      />
                    )}

                    {/* Circle Node */}
                    <circle
                      r={18}
                      fill={node.color}
                      stroke={isSelected ? '#ffffff' : isInPath ? '#10b981' : undefined}
                      strokeWidth={isSelected ? 3 : 2}
                      className={`transition-transform duration-200 group-hover:scale-110 ${!isSelected && !isInPath ? 'stroke-zinc-950' : ''}`}
                    />

                    {/* Initials Label inside Node */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      className="pointer-events-none select-none font-sans"
                    >
                      {node.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </text>

                    {/* Tooltip Label underneath Node */}
                    <text
                      textAnchor="middle"
                      dy="34"
                      fontSize="10"
                      fontWeight="600"
                      className="pointer-events-none select-none drop-shadow-md font-sans fill-zinc-100"
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Canvas Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-zinc-400 space-y-1 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Selected Node</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Shortest Path</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-0.5 bg-zinc-500" />
                <span>Co-Authorships</span>
              </div>
            </div>
          </div>

          {/* Shortest Path Finder Bar */}
          <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center space-x-1 text-emerald-400">
                <GitCommit className="w-4 h-4" />
                <span>Co-Authorship Shortest Path Finder</span>
              </span>
              {calculatedPath && (
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {calculatedPath.length - 1} Degrees of Separation
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={sourcePathId}
                onChange={(e) => setSourcePathId(e.target.value)}
                className="w-full sm:w-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    From: {n.name}
                  </option>
                ))}
              </select>

              <span className="text-zinc-500 font-mono text-xs hidden sm:inline">→</span>

              <select
                value={targetPathId}
                onChange={(e) => setTargetPathId(e.target.value)}
                className="w-full sm:w-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    To: {n.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleCalculatePath}
                className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shrink-0"
              >
                Find Path
              </button>
            </div>
          </div>
        </div>

        {/* Right Details Inspector Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
              {/* Header Badge */}
              <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md"
                    style={{ backgroundColor: selectedNode.color }}
                  >
                    {selectedNode.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{selectedNode.name}</h3>
                    <p className="text-xs text-zinc-400">{selectedNode.institution}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {selectedNode.role}
                </span>
              </div>

              {/* Metric Quick Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">h-Index</span>
                  <span className="text-base font-extrabold text-indigo-400">{selectedNode.hIndex}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Citations</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {selectedNode.citations.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Papers</span>
                  <span className="text-base font-extrabold text-amber-400">{selectedNode.publicationsCount}</span>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">Domain Focus</span>
                  <span className="text-indigo-300 font-semibold">{selectedNode.domain}</span>
                </div>

                {selectedNode.bio && (
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-[11px] leading-relaxed">
                    {selectedNode.bio}
                  </div>
                )}
              </div>

              {/* Direct Co-Authors List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1">
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Direct Co-Authors ({getDirectCollaborators(selectedNode.id).length})</span>
                </h4>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {getDirectCollaborators(selectedNode.id).map((partner) => (
                    <div
                      key={partner.id}
                      onClick={() => setSelectedNode(partner)}
                      className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 transition-colors cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white"
                          style={{ backgroundColor: partner.color }}
                        >
                          {partner.name[0]}
                        </div>
                        <span className="font-medium text-zinc-200">{partner.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">{partner.institution}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Link Button */}
              {onNavigateToProfile && (
                <button
                  onClick={() => onNavigateToProfile(selectedNode.id)}
                  className="w-full py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>View Full Researcher Profile Page</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 text-xs space-y-2">
              <Share2 className="w-8 h-8 text-zinc-700 mx-auto" />
              <p>Select any node in the graph canvas to inspect researcher metrics, co-authors, and papers.</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Summary PDF Modal */}
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
