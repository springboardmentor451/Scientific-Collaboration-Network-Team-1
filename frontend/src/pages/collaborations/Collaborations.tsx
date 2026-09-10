import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CollaborationService } from '../../services/collaborationService';
import { ResearcherService } from '../../services/researcherService';
import { PublicationService } from '../../services/publicationService';
import type { Collaboration, Researcher } from '../../types';
import { Search, List, Grid, Plus, X, AlertCircle } from 'lucide-react';

export const Collaborations: React.FC = () => {
  const navigate = useNavigate();

  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout and view state
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  
  // Search query to highlight nodes
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog State
  const [edgeDialogOpen, setEdgeDialogOpen] = useState(false);
  const [partnerId1, setPartnerId1] = useState<number | undefined>(undefined);
  const [partnerId2, setPartnerId2] = useState<number | undefined>(undefined);
  const [collabType, setCollabType] = useState('Joint Publication');
  const [edgeError, setEdgeError] = useState('');

  // Graph Tooltip State
  const [hoveredNode, setHoveredNode] = useState<(Researcher & { x: number; y: number }) | null>(null);
  const [hoveredStats, setHoveredStats] = useState<{ pubs: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const loadData = async () => {
    setLoading(true);
    try {
      const colls = await CollaborationService.getAll();
      setCollaborations(colls);

      const resList = await ResearcherService.getAll();
      setResearchers(resList);
    } catch (err) {
      console.error("Failed to load collaborations data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    setEdgeError('');
    if (!partnerId1 || !partnerId2) return;

    if (partnerId1 === partnerId2) {
      setEdgeError("A researcher cannot collaborate with themselves.");
      return;
    }

    try {
      await CollaborationService.create({
        researcher_ids: [partnerId1, partnerId2],
        collaboration_type: collabType
      });
      setEdgeDialogOpen(false);
      setPartnerId1(undefined);
      setPartnerId2(undefined);
      loadData();
    } catch (err: any) {
      setEdgeError(err.message || "Failed to establish connection.");
    }
  };

  // Compute node coordinates dynamically for the visual SVG graph
  const getGraphNodesAndEdges = () => {
    const width = 500;
    const height = 400;
    const cx = width / 2;
    const cy = height / 2;
    const radius = 130;

    // Position nodes circularly
    const nodes = researchers.map((r, index) => {
      const angle = (index * 2 * Math.PI) / researchers.length;
      return {
        ...r,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    });

    // Map edges based on collaborations
    const edges = collaborations.map(col => {
      const sourceNode = nodes.find(n => n.researcher_id === col.researcher_ids[0]);
      const targetNode = nodes.find(n => n.researcher_id === col.researcher_ids[1]);
      return {
        ...col,
        source: sourceNode,
        target: targetNode
      };
    }).filter(e => e.source && e.target);

    return { nodes, edges };
  };

  const { nodes, edges } = getGraphNodesAndEdges();

  const handleNodeHover = async (r: (Researcher & { x: number; y: number }) | null, _e: React.MouseEvent) => {
    if (!r) {
      setHoveredNode(null);
      setHoveredStats(null);
      return;
    }
    setHoveredNode(r);
    // Offset slightly above node
    setTooltipPos({ x: r.x, y: r.y - 30 });

    try {
      const pubs = await PublicationService.getByResearcher(r.researcher_id);
      setHoveredStats({ pubs: pubs.length });
    } catch {
      setHoveredStats({ pubs: 0 });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collaboration Network</h1>
          <p className="text-slate-500 text-sm">Visualize research connection weights and co-authored publication networks.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Add Connection */}
          <button 
            onClick={() => setEdgeDialogOpen(true)}
            className="px-3.5 py-2 bg-navy-600 hover:bg-navy-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Connection
          </button>
          
          {/* Layout switches */}
          <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('graph')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'graph' ? 'bg-navy-500 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title="Graph View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-navy-500 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-505 text-sm font-semibold">Computing network density...</span>
        </div>
      ) : (
        <>
          {/* 1. VISUAL GRAPH VIEW */}
          {viewMode === 'graph' ? (
            <div className="relative border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col p-6 items-center">
              
              {/* Highlight search bar */}
              <div className="w-full max-w-xs relative self-start mb-4 z-10">
                <input 
                  type="text" 
                  placeholder="Highlight researcher node..."
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Main SVG Container */}
              <div className="w-full max-w-2xl relative">
                <svg className="w-full h-auto aspect-[5/4] border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/20" viewBox="0 0 500 400">
                  
                  {/* Edges Drawing */}
                  {edges.map((e: any, idx) => {
                    const highlight = searchQuery.trim() !== '' && 
                      (e.source.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       e.target.name.toLowerCase().includes(searchQuery.toLowerCase()));
                    
                    return (
                      <line 
                        key={idx}
                        x1={e.source.x}
                        y1={e.source.y}
                        x2={e.target.x}
                        y2={e.target.y}
                        stroke={highlight ? '#3b82f6' : '#94a3b8'}
                        strokeWidth={Math.min(e.collaboration_count + 1, 5)}
                        strokeOpacity={highlight ? 1 : 0.4}
                        className="transition-all duration-300"
                      />
                    );
                  })}

                  {/* Nodes Drawing */}
                  {nodes.map(n => {
                    const match = searchQuery.trim() !== '' && n.name.toLowerCase().includes(searchQuery.toLowerCase());
                    const size = match ? 22 : 18;
                    return (
                      <g 
                        key={n.researcher_id}
                        onClick={() => navigate(`/researchers/${n.researcher_id}`)}
                        onMouseEnter={e => handleNodeHover(n, e)}
                        onMouseLeave={() => handleNodeHover(null, null as any)}
                        className="cursor-pointer group"
                      >
                        <circle 
                          cx={n.x}
                          cy={n.y}
                          r={size}
                          className={`stroke-white dark:stroke-slate-950 stroke-2 transition-all duration-300 ${
                            match 
                              ? 'fill-blue-500 shadow-lg scale-110' 
                              : 'fill-navy-600 dark:fill-navy-500 group-hover:fill-navy-500'
                          }`}
                        />
                        <text
                          x={n.x}
                          y={n.y + 4}
                          textAnchor="middle"
                          fill="white"
                          className="text-[10px] font-bold font-sans pointer-events-none select-none"
                        >
                          {n.name.charAt(0)}
                        </text>
                        {/* Text Label below node */}
                        <text
                          x={n.x}
                          y={n.y + 24}
                          textAnchor="middle"
                          fill="#475569"
                          className="text-[8px] font-bold fill-slate-500 dark:fill-slate-400 select-none pointer-events-none"
                        >
                          {n.name.split(' ').pop()}
                        </text>
                      </g>
                    );
                  })}

                  {/* Tooltip Popup inside SVG */}
                  {hoveredNode && (
                    <g pointerEvents="none">
                      <rect
                        x={tooltipPos.x - 70}
                        y={tooltipPos.y - 45}
                        width={140}
                        height={40}
                        rx={6}
                        fill="#0f172a"
                        opacity={0.9}
                      />
                      <text
                        x={tooltipPos.x}
                        y={tooltipPos.y - 30}
                        textAnchor="middle"
                        fill="white"
                        className="text-[9px] font-bold font-sans"
                      >
                        {hoveredNode.name}
                      </text>
                      <text
                        x={tooltipPos.x}
                        y={tooltipPos.y - 18}
                        textAnchor="middle"
                        fill="#94a3b8"
                        className="text-[7.5px] font-sans"
                      >
                        {hoveredNode.department} • Pubs: {hoveredStats?.pubs || 0}
                      </text>
                    </g>
                  )}

                </svg>
              </div>

              <div className="w-full text-center mt-3 text-[10px] text-slate-400">
                * Drag/Pan simulation: Click node to view academic profiles. Stroke weights reflect collaboration counts.
              </div>

            </div>
          ) : (
            
            // 2. LIST VIEW (Alternative for Mobile)
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-150 dark:divide-slate-800">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 font-semibold">
                      <th className="px-6 py-3">Researcher A</th>
                      <th className="px-6 py-3">Researcher B</th>
                      <th className="px-6 py-3">Collaboration Type</th>
                      <th className="px-6 py-3 text-center">Publications Count</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {collaborations.map(col => {
                      const res1 = researchers.find(r => r.researcher_id === col.researcher_ids[0]);
                      const res2 = researchers.find(r => r.researcher_id === col.researcher_ids[1]);
                      return (
                        <tr key={col.collaboration_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                          <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                            {res1 ? <Link to={`/researchers/${res1.researcher_id}`} className="hover:underline">{res1.name}</Link> : `ID ${col.researcher_ids[0]}`}
                          </td>
                          <td className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                            {res2 ? <Link to={`/researchers/${res2.researcher_id}`} className="hover:underline">{res2.name}</Link> : `ID ${col.researcher_ids[1]}`}
                          </td>
                          <td className="px-6 py-3.5 text-slate-500 capitalize">{col.collaboration_type || 'Co-author'}</td>
                          <td className="px-6 py-3.5 text-center font-bold text-navy-600 dark:text-navy-400">{col.collaboration_count}</td>
                          <td className="px-6 py-3.5 text-right">
                            <button 
                              onClick={async () => {
                                if (window.confirm("Remove this collaboration link?")) {
                                  await CollaborationService.delete(col.collaboration_id);
                                  loadData();
                                }
                              }}
                              className="text-red-600 hover:underline font-semibold"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ADD EDGE CONNECTION DIALOG */}
      {edgeDialogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-sm">Add Collaboration Link</h3>
              <button onClick={() => setEdgeDialogOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddEdge} className="p-6 space-y-4">
              {edgeError && (
                <div className="p-2.5 bg-red-50 text-red-655 rounded-xl text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{edgeError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">First Collaborator</label>
                <select 
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none"
                  value={partnerId1}
                  onChange={e => setPartnerId1(Number(e.target.value))}
                  required
                >
                  <option value="">-- Choose Researcher --</option>
                  {researchers.map(r => (
                    <option key={r.researcher_id} value={r.researcher_id}>
                      {r.name} ({r.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Second Collaborator</label>
                <select 
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none"
                  value={partnerId2}
                  onChange={e => setPartnerId2(Number(e.target.value))}
                  required
                >
                  <option value="">-- Choose Researcher --</option>
                  {researchers.map(r => (
                    <option key={r.researcher_id} value={r.researcher_id}>
                      {r.name} ({r.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Connection Type</label>
                <input 
                  type="text" 
                  placeholder="e.g. Co-authored Publication, Joint Project, Grant Review"
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none"
                  value={collabType}
                  onChange={e => setCollabType(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setEdgeDialogOpen(false)}
                  className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!partnerId1 || !partnerId2}
                  className="px-4 py-2 bg-navy-600 hover:bg-navy-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
                >
                  Link Researchers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
