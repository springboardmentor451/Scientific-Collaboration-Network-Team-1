import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CollaborationService } from '../../services/collaborationService';
import { ResearcherService } from '../../services/researcherService';
import { PublicationService } from '../../services/publicationService';
import { AdminService } from '../../services/adminService';
import type {
  Collaboration,
  Researcher,
  Publication,
  Institution,
} from '../../types';
import {
  Search,
  List,
  Grid,
  Plus,
  X,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Landmark,
  Users,
  Activity,
  Network,
  Building2,
  UserRound,
  CheckCircle2,
  ArrowUpRight,
  Trash2,
  Sparkles,
  Filter,
  ExternalLink,
} from 'lucide-react';

export const Collaborations: React.FC = () => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const [nameQuery, setNameQuery] = useState('');
  const [instFilter, setInstFilter] = useState('');
  const [interestFilter, setInterestFilter] = useState('');
  const [collabTypeFilter, setCollabTypeFilter] = useState('');

  const [selectedResId, setSelectedResId] = useState<number | null>(null);
  const [selectedInstId, setSelectedInstId] = useState<number | null>(null);

  const [selectedPubs, setSelectedPubs] = useState<Publication[]>([]);
  const [selectedLoading, setSelectedLoading] = useState(false);

  const [edgeDialogOpen, setEdgeDialogOpen] = useState(false);
  const [partnerId1, setPartnerId1] = useState<number | undefined>(undefined);
  const [partnerId2, setPartnerId2] = useState<number | undefined>(undefined);
  const [collabType, setCollabType] = useState('Joint Publication');
  const [edgeError, setEdgeError] = useState('');

  const loadData = async () => {
    setLoading(true);

    try {
      const [colls, resList, instsList] = await Promise.all([
        CollaborationService.getAll(),
        ResearcherService.getAll(),
        AdminService.getAllInstitutions().catch(() => []),
      ]);

      setCollaborations(colls);
      setResearchers(resList);
      setInstitutions(instsList);
    } catch (err) {
      console.error('Failed to load collaborations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedResId) {
      setSelectedPubs([]);
      return;
    }

    setSelectedLoading(true);

    PublicationService.getByResearcher(selectedResId)
      .then((pubs) => {
        setSelectedPubs(pubs);
      })
      .catch(() => {
        setSelectedPubs([]);
      })
      .finally(() => {
        setSelectedLoading(false);
      });
  }, [selectedResId]);

  const handleAddEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    setEdgeError('');

    if (!partnerId1 || !partnerId2) return;

    if (partnerId1 === partnerId2) {
      setEdgeError('A researcher cannot collaborate with themselves.');
      return;
    }

    try {
      await CollaborationService.create({
        researcher_ids: [partnerId1, partnerId2],
        collaboration_type: collabType,
      });

      setEdgeDialogOpen(false);
      setPartnerId1(undefined);
      setPartnerId2(undefined);
      setCollabType('Joint Publication');

      await loadData();
    } catch (err: any) {
      setEdgeError(
        err.message || 'Failed to establish connection.'
      );
    }
  };

  const allInterests = useMemo(() => {
    const set = new Set<string>();

    researchers.forEach((researcher) => {
      if (researcher.research_interests) {
        researcher.research_interests.forEach((interest: string) =>
          set.add(interest)
        );
      }

      if (researcher.skills) {
        researcher.skills.forEach((skill) => set.add(skill));
      }
    });

    return Array.from(set).sort();
  }, [researchers]);

  const handleMouseDown = (
    e: React.MouseEvent<SVGSVGElement>
  ) => {
    const target = e.target as SVGElement;

    if (
      target.tagName === 'svg' ||
      target.tagName === 'line' ||
      target.getAttribute('data-bg') === 'true'
    ) {
      setIsPanning(true);

      setStartPan({
        x: e.clientX - panX,
        y: e.clientY - panY,
      });
    }
  };

  const handleMouseMove = (
    e: React.MouseEvent<SVGSVGElement>
  ) => {
    if (isPanning) {
      setPanX(e.clientX - startPan.x);
      setPanY(e.clientY - startPan.y);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom((previous) => Math.min(previous + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((previous) => Math.max(previous - 0.1, 0.4));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setSelectedResId(null);
    setSelectedInstId(null);
  };

  const clearFilters = () => {
    setNameQuery('');
    setInstFilter('');
    setInterestFilter('');
    setCollabTypeFilter('');
  };

  const hasFilters =
    Boolean(nameQuery) ||
    Boolean(instFilter) ||
    Boolean(interestFilter) ||
    Boolean(collabTypeFilter);

  /*
   * ==============================================================
   * GRAPH GENERATION
   * ==============================================================
   */

  const graphData = useMemo(() => {
    const filteredResearchers = researchers.filter((researcher) => {
      const normalizedName = nameQuery.toLowerCase();

      const matchName =
        !nameQuery ||
        researcher.name.toLowerCase().includes(normalizedName) ||
        Boolean(
          researcher.department
            ?.toLowerCase()
            .includes(normalizedName)
        );

      const matchInstitution =
        !instFilter ||
        String(researcher.institution_id) === instFilter;

      const matchInterest =
        !interestFilter ||
        Boolean(
          researcher.research_interests?.includes(
            interestFilter
          )
        ) ||
        Boolean(
          researcher.skills?.includes(interestFilter)
        );

      return (
        matchName &&
        matchInstitution &&
        matchInterest
      );
    });

    const activeResearcherIds = filteredResearchers.map(
      (researcher) => researcher.researcher_id
    );

    const filteredCollabs = collaborations.filter((collaboration) => {
      // const inNodes = collaboration.researcher_ids.every(
      //   (id) => activeResearcherIds.includes(id)
      // );
      const inNodes = (collaboration.researcher_ids ?? []).every((id) => activeResearcherIds.includes(id));

      const matchType =
        !collabTypeFilter ||
        collaboration.collaboration_type === collabTypeFilter;

      return inNodes && matchType;
    });

    const nodes: any[] = [];
    const edges: any[] = [];

    filteredResearchers.forEach((researcher) => {
      nodes.push({
        id: `res_${researcher.researcher_id}`,
        dbId: researcher.researcher_id,
        label: researcher.name,
        type: 'researcher',
        subtext: researcher.department || 'Researcher',
        color: '#123B63',
      });
    });

    const usedInstitutionIds = new Set<number>();

    filteredResearchers.forEach((researcher) => {
      if (researcher.institution_id) {
        usedInstitutionIds.add(researcher.institution_id);
      }
    });

    usedInstitutionIds.forEach((institutionId) => {
      const institution = institutions.find(
        (item) => item.institution_id === institutionId
      );

      const institutionName = institution
        ? institution.name
        : `Institution #${institutionId}`;

      nodes.push({
        id: `inst_${institutionId}`,
        dbId: institutionId,
        label: institutionName,
        type: 'institution',
        subtext: institution
          ? `${institution.city}, ${institution.country}`
          : 'Research Center',
        color: '#167D9A',
      });
    });

    filteredCollabs.forEach((collaboration) => {
      edges.push({
        id: `col_${collaboration.collaboration_id}`,
        source: `res_${collaboration.researcher_ids[0]}`,
        target: `res_${collaboration.researcher_ids[1]}`,
        type: 'collaboration',
        weight: collaboration.collaboration_count,
        label:
          collaboration.collaboration_type ||
          'Co-author',
      });
    });

    filteredResearchers.forEach((researcher) => {
      if (researcher.institution_id) {
        edges.push({
          id: `aff_${researcher.researcher_id}_${researcher.institution_id}`,
          source: `res_${researcher.researcher_id}`,
          target: `inst_${researcher.institution_id}`,
          type: 'affiliation',
          weight: 1,
          label: 'Affiliation',
        });
      }
    });

    const width = 600;
    const height = 450;
    const centerX = width / 2;
    const centerY = height / 2;

    const layoutNodes = nodes.map((node, index) => {
      const angle =
        nodes.length > 0
          ? (index * 2 * Math.PI) / nodes.length
          : 0;

      return {
        ...node,
        x:
          centerX +
          160 * Math.cos(angle) +
          (Math.random() - 0.5) * 8,
        y:
          centerY +
          160 * Math.sin(angle) +
          (Math.random() - 0.5) * 8,
        vx: 0,
        vy: 0,
      };
    });

    const repulsion = 9000;
    const attraction = 0.08;
    const damping = 0.8;

    for (let tick = 0; tick < 120; tick++) {
      for (
        let i = 0;
        i < layoutNodes.length;
        i++
      ) {
        for (
          let j = i + 1;
          j < layoutNodes.length;
          j++
        ) {
          const dx =
            layoutNodes[j].x -
            layoutNodes[i].x;

          const dy =
            layoutNodes[j].y -
            layoutNodes[i].y;

          const distanceSquared =
            dx * dx + dy * dy + 0.1;

          const distance =
            Math.sqrt(distanceSquared);

          if (distance < 220) {
            const force =
              repulsion / distanceSquared;

            const forceX =
              (dx / distance) * force;

            const forceY =
              (dy / distance) * force;

            layoutNodes[i].vx -= forceX;
            layoutNodes[i].vy -= forceY;

            layoutNodes[j].vx += forceX;
            layoutNodes[j].vy += forceY;
          }
        }
      }

      edges.forEach((edge) => {
        const sourceNode = layoutNodes.find(
          (node) => node.id === edge.source
        );

        const targetNode = layoutNodes.find(
          (node) => node.id === edge.target
        );

        if (!sourceNode || !targetNode) return;

        const dx =
          targetNode.x - sourceNode.x;

        const dy =
          targetNode.y - sourceNode.y;

        const distance =
          Math.sqrt(dx * dx + dy * dy) || 0.1;

        const force = attraction * distance;

        const forceX =
          (dx / distance) * force;

        const forceY =
          (dy / distance) * force;

        sourceNode.vx += forceX;
        sourceNode.vy += forceY;

        targetNode.vx -= forceX;
        targetNode.vy -= forceY;
      });

      layoutNodes.forEach((node) => {
        const dx = centerX - node.x;
        const dy = centerY - node.y;

        node.vx += dx * 0.012;
        node.vy += dy * 0.012;

        node.x += node.vx;
        node.y += node.vy;

        node.vx *= damping;
        node.vy *= damping;
      });
    }

    return {
      nodes: layoutNodes,
      edges,
    };
  }, [
    researchers,
    collaborations,
    institutions,
    nameQuery,
    instFilter,
    interestFilter,
    collabTypeFilter,
  ]);

  /*
   * ==============================================================
   * NETWORK METRICS
   * ==============================================================
   */

  const networkMetrics = useMemo(() => {
    const researcherNodes =
      graphData.nodes.filter(
        (node) => node.type === 'researcher'
      );

    const collaborationEdges =
      graphData.edges.filter(
        (edge) => edge.type === 'collaboration'
      );

    const nodeCount = researcherNodes.length;
    const edgeCount = collaborationEdges.length;

    const density =
      nodeCount > 1
        ? (2 * edgeCount) /
        (nodeCount * (nodeCount - 1))
        : 0;

    const totalWeight =
      collaborationEdges.reduce(
        (sum, edge) => sum + edge.weight,
        0
      );

    const averageStrength =
      edgeCount > 0
        ? totalWeight / edgeCount
        : 0;

    const institutionCount =
      graphData.nodes.filter(
        (node) => node.type === 'institution'
      ).length;

    return {
      nodeCount,
      edgeCount,
      density,
      avgStrength: averageStrength,
      institutionCount,
    };
  }, [graphData]);

  /*
   * ==============================================================
   * CENTRALITY
   * ==============================================================
   */

  const activeCentralities = useMemo(() => {
    if (!selectedResId) {
      return {
        degree: 0,
        closeness: 0,
      };
    }

    const startId = `res_${selectedResId}`;

    const degreeEdges =
      graphData.edges.filter(
        (edge) =>
          edge.type === 'collaboration' &&
          (edge.source === startId ||
            edge.target === startId)
      );

    const degree = degreeEdges.length;

    const researcherNodes =
      graphData.nodes.filter(
        (node) => node.type === 'researcher'
      );

    const adjacency: Record<string, string[]> = {};

    researcherNodes.forEach((node) => {
      adjacency[node.id] = [];
    });

    graphData.edges.forEach((edge) => {
      if (edge.type === 'collaboration') {
        adjacency[edge.source]?.push(edge.target);
        adjacency[edge.target]?.push(edge.source);
      }
    });

    const distances: Record<string, number> = {};

    researcherNodes.forEach((node) => {
      distances[node.id] = Infinity;
    });

    distances[startId] = 0;

    const queue: string[] = [startId];

    let reachableCount = 0;
    let distanceSum = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;

      reachableCount++;

      const neighbors =
        adjacency[current] || [];

      neighbors.forEach((neighbor) => {
        if (distances[neighbor] === Infinity) {
          distances[neighbor] =
            distances[current] + 1;

          distanceSum +=
            distances[neighbor];

          queue.push(neighbor);
        }
      });
    }

    const closeness =
      reachableCount > 1 &&
        distanceSum > 0
        ? (reachableCount - 1) /
        distanceSum
        : 0;

    return {
      degree,
      closeness,
    };
  }, [selectedResId, graphData]);

  /*
   * ==============================================================
   * NETWORK INSIGHTS
   * ==============================================================
   */

  const networkInsights = useMemo(() => {
    const degrees: Record<string, number> = {};

    graphData.edges.forEach((edge) => {
      if (edge.type !== 'collaboration') return;

      degrees[edge.source] =
        (degrees[edge.source] || 0) + 1;

      degrees[edge.target] =
        (degrees[edge.target] || 0) + 1;
    });

    let topHubNodeId = '';
    let maxDegree = 0;

    Object.keys(degrees).forEach((id) => {
      if (degrees[id] > maxDegree) {
        maxDegree = degrees[id];
        topHubNodeId = id;
      }
    });

    let topHubName = 'N/A';

    if (topHubNodeId) {
      const node = graphData.nodes.find(
        (item) => item.id === topHubNodeId
      );

      if (node) {
        topHubName = node.label;
      }
    }

    const interestCounts: Record<string, number> = {};

    researchers.forEach((researcher) => {
      const combined = [
        ...(researcher.research_interests || []),
        ...(researcher.skills || []),
      ];

      combined.forEach((interest) => {
        interestCounts[interest] =
          (interestCounts[interest] || 0) + 1;
      });
    });

    let topField = 'N/A';
    let maxCount = 0;

    Object.keys(interestCounts).forEach((field) => {
      if (interestCounts[field] > maxCount) {
        maxCount = interestCounts[field];
        topField = field;
      }
    });

    return {
      topHubName,
      maxDegree,
      topField,
    };
  }, [graphData, researchers]);

  /*
   * ==============================================================
   * SELECTED RESEARCHER
   * ==============================================================
   */

  const selectedResearcher = selectedResId
    ? researchers.find(
      (researcher) =>
        researcher.researcher_id ===
        selectedResId
    )
    : null;

  const selectedInstitution = selectedInstId
    ? institutions.find(
      (institution) =>
        institution.institution_id ===
        selectedInstId
    )
    : null;

  /*
   * ==============================================================
   * RENDER
   * ==============================================================
   */

  return (
    <div className="space-y-7 pb-8">

      {/* ========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-indigo-950 px-6 py-8 sm:px-8 text-white shadow-xl">

        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">

          <div className="max-w-2xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Scientific Network
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
              Collaboration Network
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
              Explore relationships between researchers,
              institutions, and scientific collaboration
              activity across the network.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <button
                onClick={() => setEdgeDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-navy-800 shadow-lg hover:bg-slate-100 transition"
              >
                <Plus className="h-4 w-4" />
                Add Connection
              </button>

              <button
                onClick={() =>
                  setViewMode(
                    viewMode === 'graph'
                      ? 'list'
                      : 'graph'
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/15 transition"
              >
                {viewMode === 'graph' ? (
                  <>
                    <List className="h-4 w-4" />
                    List View
                  </>
                ) : (
                  <>
                    <Grid className="h-4 w-4" />
                    Graph View
                  </>
                )}
              </button>

            </div>
          </div>

          {/* HERO METRICS */}

          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-2.5">

            <div className="min-w-[100px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <UserRound className="h-4 w-4 text-white/50" />

              <p className="mt-2 text-xl font-bold">
                {networkMetrics.nodeCount}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-wider text-white/45">
                Researchers
              </p>
            </div>

            <div className="min-w-[100px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <Network className="h-4 w-4 text-white/50" />

              <p className="mt-2 text-xl font-bold">
                {networkMetrics.edgeCount}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-wider text-white/45">
                Connections
              </p>
            </div>

            <div className="min-w-[100px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <Building2 className="h-4 w-4 text-white/50" />

              <p className="mt-2 text-xl font-bold">
                {networkMetrics.institutionCount}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-wider text-white/45">
                Institutions
              </p>
            </div>

            <div className="min-w-[100px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <Activity className="h-4 w-4 text-white/50" />

              <p className="mt-2 text-xl font-bold">
                {(networkMetrics.density * 100).toFixed(1)}%
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-wider text-white/45">
                Density
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          LOADING
      ========================================================= */}

      {loading ? (

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse">
            <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-6 space-y-4">
              <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse">
            <div className="aspect-[4/3] rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse">
            <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-6 space-y-3">
              <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>

        </div>

      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* ======================================================
              LEFT — FILTERS
          ======================================================= */}

          <aside className="lg:col-span-3 space-y-5">

            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Network Explorer
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Refine the network view
                  </p>
                </div>

                <Filter className="h-4 w-4 text-navy-500" />

              </div>

              <div className="mt-5 space-y-4">

                {/* Researcher */}

                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Researcher
                  </label>

                  <div className="relative">

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />

                    <input
                      type="text"
                      value={nameQuery}
                      onChange={(e) =>
                        setNameQuery(e.target.value)
                      }
                      placeholder="Name or department"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
                    />

                  </div>
                </div>

                {/* Institution */}

                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Institution
                  </label>

                  <select
                    value={instFilter}
                    onChange={(e) =>
                      setInstFilter(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:border-navy-500 focus:outline-none"
                  >
                    <option value="">
                      All Institutions
                    </option>

                    {institutions.map((institution) => (
                      <option
                        key={institution.institution_id}
                        value={institution.institution_id}
                      >
                        {institution.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Research area */}

                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Research Area
                  </label>

                  <select
                    value={interestFilter}
                    onChange={(e) =>
                      setInterestFilter(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:border-navy-500 focus:outline-none"
                  >
                    <option value="">
                      All Research Areas
                    </option>

                    {allInterests.map((interest) => (
                      <option
                        key={interest}
                        value={interest}
                      >
                        {interest}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Collaboration type */}

                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Collaboration Type
                  </label>

                  <select
                    value={collabTypeFilter}
                    onChange={(e) =>
                      setCollabTypeFilter(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:border-navy-500 focus:outline-none"
                  >
                    <option value="">
                      All Collaboration Types
                    </option>

                    <option value="Joint Publication">
                      Joint Publication
                    </option>

                    <option value="Joint Project">
                      Joint Project
                    </option>

                    <option value="Co-author">
                      Co-author
                    </option>

                    <option value="Peer Review">
                      Peer Review
                    </option>
                  </select>
                </div>

              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear Filters
                </button>
              )}

            </div>

            {/* Network metrics */}

            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">

              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 dark:bg-navy-950/40">
                  <Activity className="h-4 w-4 text-navy-600 dark:text-navy-400" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Network Metrics
                  </h3>

                  <p className="text-[10px] text-slate-400">
                    Current filtered network
                  </p>
                </div>

              </div>

              <div className="mt-4 space-y-3">

                <MetricRow
                  label="Network size"
                  value={`${networkMetrics.nodeCount} scholars`}
                />

                <MetricRow
                  label="Connections"
                  value={`${networkMetrics.edgeCount} edges`}
                />

                <MetricRow
                  label="Network density"
                  value={`${(
                    networkMetrics.density * 100
                  ).toFixed(1)}%`}
                />

                <MetricRow
                  label="Average edge weight"
                  value={networkMetrics.avgStrength.toFixed(2)}
                />

              </div>

            </div>

          </aside>

          {/* ======================================================
              CENTER — GRAPH / LIST
          ======================================================= */}

          <main className="lg:col-span-6 space-y-5">

            {viewMode === 'graph' ? (

              <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">

                {/* Graph header */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">

                  <div>
                    <div className="flex items-center gap-2">

                      <Network className="h-4 w-4 text-navy-600 dark:text-navy-400" />

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Interactive Network
                      </h3>

                    </div>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Click nodes to inspect relationships
                    </p>
                  </div>

                  <div className="flex items-center gap-2">

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">

                      <span className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-navy-600" />
                        Researcher
                      </span>

                      <span className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-navy-500" />
                        Institution
                      </span>

                    </div>

                  </div>

                </div>

                {/* Graph */}

                <div className="relative p-4">

                  {/* Controls */}

                  <div className="absolute right-7 top-7 z-10 flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 p-1.5 shadow-lg backdrop-blur">

                    <button
                      onClick={handleZoomOut}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Zoom out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>

                    <span className="min-w-[42px] text-center text-[9px] font-bold text-slate-400">
                      {Math.round(zoom * 100)}%
                    </span>

                    <button
                      onClick={handleZoomIn}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Zoom in"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>

                    <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-800" />

                    <button
                      onClick={handleResetZoom}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Reset view"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>

                  </div>

                  <svg
                    className="w-full aspect-[4/3] rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 cursor-grab active:cursor-grabbing"
                    viewBox="0 0 600 450"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >

                    <defs>

                      <pattern
                        id="network-grid"
                        width="30"
                        height="30"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 30 0 L 0 0 0 30"
                          fill="none"
                          stroke="#cbd5e1"
                          strokeWidth="0.5"
                          opacity="0.25"
                        />
                      </pattern>

                    </defs>

                    <rect
                      width="600"
                      height="450"
                      fill="url(#network-grid)"
                      data-bg="true"
                    />

                    <g
                      transform={`translate(${panX}, ${panY}) scale(${zoom})`}
                    >

                      {/* Edges */}

                      {graphData.edges.map((edge: any) => {

                        const sourceNode =
                          graphData.nodes.find(
                            (node) =>
                              node.id === edge.source
                          );

                        const targetNode =
                          graphData.nodes.find(
                            (node) =>
                              node.id === edge.target
                          );

                        if (
                          !sourceNode ||
                          !targetNode
                        ) {
                          return null;
                        }

                        const isSourceSelected =
                          selectedResId &&
                          sourceNode.id ===
                          `res_${selectedResId}`;

                        const isTargetSelected =
                          selectedResId &&
                          targetNode.id ===
                          `res_${selectedResId}`;

                        const isInstitutionSelected =
                          selectedInstId &&
                          (
                            sourceNode.id ===
                            `inst_${selectedInstId}` ||
                            targetNode.id ===
                            `inst_${selectedInstId}`
                          );

                        const isSelected =
                          Boolean(
                            isSourceSelected ||
                            isTargetSelected ||
                            isInstitutionSelected
                          );

                        const hasSelection =
                          selectedResId !== null ||
                          selectedInstId !== null;

                        const stroke =
                          isSelected
                            ? '#36B7C9'
                            : edge.type ===
                              'affiliation'
                              ? '#cbd5e1'
                              : '#94a3b8';

                        const opacity =
                          hasSelection
                            ? isSelected
                              ? 1
                              : 0.12
                            : edge.type ===
                              'affiliation'
                              ? 0.45
                              : 0.65;

                        return (
                          <line
                            key={edge.id}
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke={stroke}
                            strokeWidth={
                              isSelected
                                ? 2.5
                                : edge.type ===
                                  'affiliation'
                                  ? 1
                                  : Math.min(
                                    edge.weight + 0.8,
                                    5
                                  )
                            }
                            opacity={opacity}
                            strokeDasharray={
                              edge.type ===
                                'affiliation'
                                ? '4 4'
                                : undefined
                            }
                          />
                        );
                      })}

                      {/* Nodes */}

                      {graphData.nodes.map((node: any) => {

                        const isSelected =
                          (
                            node.type ===
                            'researcher' &&
                            selectedResId ===
                            node.dbId
                          ) ||
                          (
                            node.type ===
                            'institution' &&
                            selectedInstId ===
                            node.dbId
                          );

                        let connected =
                          false;

                        if (selectedResId) {

                          const selectedId =
                            `res_${selectedResId}`;

                          connected =
                            node.id === selectedId ||
                            graphData.edges.some(
                              (edge) =>
                                (
                                  edge.source ===
                                  selectedId &&
                                  edge.target ===
                                  node.id
                                ) ||
                                (
                                  edge.target ===
                                  selectedId &&
                                  edge.source ===
                                  node.id
                                )
                            );

                        } else if (selectedInstId) {

                          const selectedId =
                            `inst_${selectedInstId}`;

                          connected =
                            node.id === selectedId ||
                            graphData.edges.some(
                              (edge) =>
                                (
                                  edge.source ===
                                  selectedId &&
                                  edge.target ===
                                  node.id
                                ) ||
                                (
                                  edge.target ===
                                  selectedId &&
                                  edge.source ===
                                  node.id
                                )
                            );
                        }

                        const hasSelection =
                          selectedResId !== null ||
                          selectedInstId !== null;

                        const opacity =
                          hasSelection
                            ? connected
                              ? 1
                              : 0.18
                            : 1;

                        const radius =
                          node.type ===
                            'institution'
                            ? 20
                            : 16;

                        const fill =
                          isSelected
                            ? '#36B7C9'
                            : node.type ===
                              'institution'
                              ? '#167D9A'
                              : '#123B63';

                        return (
                          <g
                            key={node.id}
                            onClick={() => {

                              if (
                                node.type ===
                                'researcher'
                              ) {
                                setSelectedResId(
                                  node.dbId
                                );
                                setSelectedInstId(null);
                              } else {
                                setSelectedInstId(
                                  node.dbId
                                );
                                setSelectedResId(null);
                              }

                            }}
                            className="cursor-pointer"
                            opacity={opacity}
                          >

                            {isSelected && (
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r={radius + 6}
                                fill="none"
                                stroke="#36B7C9"
                                strokeWidth="2"
                                opacity="0.35"
                              />
                            )}

                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={radius}
                              fill={fill}
                              stroke="white"
                              strokeWidth="2.5"
                            />

                            <text
                              x={node.x}
                              y={node.y + 4}
                              textAnchor="middle"
                              fill="white"
                              className="text-[9px] font-bold pointer-events-none select-none"
                            >
                              {node.label
                                .charAt(0)
                                .toUpperCase()}
                            </text>

                            <text
                              x={node.x}
                              y={
                                node.y +
                                radius +
                                14
                              }
                              textAnchor="middle"
                              fill="#475569"
                              className="text-[8px] font-semibold dark:fill-slate-400 pointer-events-none select-none"
                            >
                              {node.label
                                .split(' ')
                                .slice(-1)[0]
                                .slice(0, 14)}
                            </text>

                          </g>
                        );
                      })}

                    </g>

                  </svg>

                  <div className="mt-3 flex items-center justify-between gap-4">

                    <p className="text-[10px] text-slate-400">
                      Drag to pan · Click nodes to inspect
                      relationships
                    </p>

                    <span className="text-[10px] font-semibold text-slate-400">
                      {graphData.nodes.length} nodes ·{' '}
                      {graphData.edges.length} links
                    </span>

                  </div>

                </div>

              </div>

            ) : (

              /* ==================================================
                 LIST VIEW
              ================================================== */

              <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Collaboration Links
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Researcher-to-researcher relationships
                    </p>
                  </div>

                  <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[9px] font-bold text-slate-500">
                    {collaborations.length} links
                  </span>

                </div>

                {collaborations.length === 0 ? (

                  <div className="px-6 py-16 text-center">

                    <Network className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      No collaboration links
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Establish a connection to start
                      building the network.
                    </p>

                  </div>

                ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full text-left">

                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">

                          <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Researcher A
                          </th>

                          <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Researcher B
                          </th>

                          <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Type
                          </th>

                          <th className="px-5 py-3 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Strength
                          </th>

                          <th className="px-5 py-3 text-right text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Action
                          </th>

                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                        {collaborations.map(
                          (collaboration) => {

                            const researcherA =
                              researchers.find(
                                (researcher) =>
                                  researcher.researcher_id ===
                                  collaboration
                                    .researcher_ids[0]
                              );

                            const researcherB =
                              researchers.find(
                                (researcher) =>
                                  researcher.researcher_id ===
                                  collaboration
                                    .researcher_ids[1]
                              );

                            return (
                              <tr
                                key={
                                  collaboration.collaboration_id
                                }
                                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition"
                              >

                                <td className="px-5 py-4">

                                  {researcherA ? (
                                    <Link
                                      to={`/researchers/${researcherA.researcher_id}`}
                                      className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-navy-600 dark:hover:text-navy-400"
                                    >
                                      {researcherA.name}
                                    </Link>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      ID{' '}
                                      {
                                        collaboration
                                          .researcher_ids[0]
                                      }
                                    </span>
                                  )}

                                </td>

                                <td className="px-5 py-4">

                                  {researcherB ? (
                                    <Link
                                      to={`/researchers/${researcherB.researcher_id}`}
                                      className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-navy-600 dark:hover:text-navy-400"
                                    >
                                      {researcherB.name}
                                    </Link>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      ID{' '}
                                      {
                                        collaboration
                                          .researcher_ids[1]
                                      }
                                    </span>
                                  )}

                                </td>

                                <td className="px-5 py-4">

                                  <span className="inline-flex rounded-lg border border-navy-100 bg-navy-50 px-2.5 py-1 text-[9px] font-bold text-navy-650 dark:border-navy-900/40 dark:bg-navy-950/30 dark:text-navy-400">
                                    {collaboration.collaboration_type ||
                                      'Co-author'}
                                  </span>

                                </td>

                                <td className="px-5 py-4 text-center">

                                  <span className="text-xs font-bold text-navy-600 dark:text-navy-400">
                                    {collaboration.collaboration_count}
                                  </span>

                                </td>

                                <td className="px-5 py-4 text-right">

                                  <button
                                    onClick={async () => {

                                      if (
                                        window.confirm(
                                          'Remove this collaboration link?'
                                        )
                                      ) {
                                        try {
                                          await CollaborationService.delete(
                                            collaboration.collaboration_id
                                          );

                                          await loadData();
                                        } catch (
                                        error
                                        ) {
                                          console.error(
                                            error
                                          );
                                        }
                                      }

                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-semibold text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remove
                                  </button>

                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            )}

            {/* ==================================================
                INSIGHTS
            =================================================== */}

            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Network Insights
                  </h3>

                  <p className="text-[10px] text-slate-400">
                    Highlights from the current network
                  </p>
                </div>

              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">

                <InsightCard
                  title="Top Network Hub"
                  value={networkInsights.topHubName}
                  description={`Connected to ${networkInsights.maxDegree} partners`}
                  icon={<Users className="h-4 w-4" />}
                />

                <InsightCard
                  title="Primary Research Domain"
                  value={networkInsights.topField}
                  description="Highest skill frequency across researchers"
                  icon={<Activity className="h-4 w-4" />}
                />

              </div>

            </div>

          </main>

          {/* ======================================================
              RIGHT — SELECTED NODE
          ======================================================= */}

          <aside className="lg:col-span-3">

            <div className="min-h-[520px] rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">

              {selectedResearcher ? (

                <div className="flex h-full flex-col">

                  {/* Researcher header */}

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-600 text-sm font-bold text-white">
                        {selectedResearcher.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {selectedResearcher.name}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                          Researcher profile
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        setSelectedResId(null)
                      }
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </button>

                  </div>

                  {/* Details */}

                  <div className="mt-5 space-y-2.5">

                    <DetailRow
                      icon={<Landmark className="h-3.5 w-3.5" />}
                      label={
                        institutions.find(
                          (institution) =>
                            institution.institution_id ===
                            selectedResearcher.institution_id
                        )?.name ||
                        'Unknown Institution'
                      }
                    />

                    <DetailRow
                      icon={<Users className="h-3.5 w-3.5" />}
                      label={
                        selectedResearcher.department ||
                        'Academic Department'
                      }
                    />

                    <DetailRow
                      icon={<Info className="h-3.5 w-3.5" />}
                      label={`ORCID: ${selectedResearcher.orcid || 'N/A'
                        }`}
                      mono
                    />

                  </div>

                  {/* Centrality */}

                  <div className="mt-5 rounded-xl border border-navy-100 dark:border-navy-900/40 bg-navy-50/50 dark:bg-navy-950/20 p-4">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-navy-600 dark:text-navy-400">
                          Centrality
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Position in collaboration network
                        </p>
                      </div>

                      <Activity className="h-4 w-4 text-navy-500" />

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-lg bg-white dark:bg-slate-900 p-3">
                        <p className="text-[9px] text-slate-400">
                          Degree
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          {activeCentralities.degree}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white dark:bg-slate-900 p-3">
                        <p className="text-[9px] text-slate-400">
                          Closeness
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          {activeCentralities.closeness.toFixed(
                            3
                          )}
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Publications */}

                  <div className="mt-5">

                    <div className="flex items-center justify-between">

                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Scholarly Output
                      </p>

                      <span className="text-[9px] font-semibold text-slate-400">
                        {selectedPubs.length}
                      </span>

                    </div>

                    <div className="mt-3">

                      {selectedLoading ? (

                        <div className="space-y-2">
                          <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                          <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                        </div>

                      ) : selectedPubs.length === 0 ? (

                        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-6 text-center">

                          <p className="text-[10px] text-slate-400">
                            No publications logged.
                          </p>

                        </div>

                      ) : (

                        <div className="space-y-2">

                          {selectedPubs
                            .slice(0, 3)
                            .map((publication) => (
                              <Link
                                key={
                                  publication.publication_id
                                }
                                to={`/publications/${publication.publication_id}`}
                                className="group flex items-start gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3 hover:border-navy-200 dark:hover:border-navy-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                              >

                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-500" />

                                <span className="line-clamp-2 text-[10px] font-semibold leading-4 text-slate-600 dark:text-slate-300 group-hover:text-navy-600 dark:group-hover:text-navy-400">
                                  {publication.title}
                                </span>

                              </Link>
                            ))}

                          {selectedPubs.length > 3 && (
                            <p className="pt-1 text-[10px] font-semibold text-navy-600 dark:text-navy-400">
                              + {selectedPubs.length - 3}{' '}
                              more publications
                            </p>
                          )}

                        </div>

                      )}

                    </div>

                  </div>

                  <div className="mt-auto pt-5">

                    <Link
                      to={`/researchers/${selectedResearcher.researcher_id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-600 py-2.5 text-xs font-bold text-white hover:bg-navy-700 transition"
                    >
                      View Full Profile
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>

                  </div>

                </div>

              ) : selectedInstitution ? (

                <div className="flex h-full flex-col">

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-500 text-white">
                        <Building2 className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {selectedInstitution.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Institution
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        setSelectedInstId(null)
                      }
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </button>

                  </div>

                  <div className="mt-5 space-y-3">

                    <DetailRow
                      icon={<Landmark className="h-3.5 w-3.5" />}
                      label={`Type: ${selectedInstitution.type.replace(
                        '_',
                        ' '
                      )}`}
                    />

                    <DetailRow
                      icon={<Info className="h-3.5 w-3.5" />}
                      label={`Location: ${selectedInstitution.city}, ${selectedInstitution.country}`}
                    />

                    {selectedInstitution.website && (
                      <a
                        href={selectedInstitution.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 px-3 py-2.5 text-[10px] text-navy-600 dark:text-navy-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />

                        <span className="truncate">
                          Visit institution website
                        </span>
                      </a>
                    )}

                  </div>

                  <div className="mt-6">

                    <div className="flex items-center justify-between">

                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Affiliated Scholars
                      </p>

                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[9px] font-bold text-slate-500">
                        {
                          researchers.filter(
                            (researcher) =>
                              researcher.institution_id ===
                              selectedInstitution.institution_id
                          ).length
                        }
                      </span>

                    </div>

                    <div className="mt-3 space-y-2">

                      {researchers
                        .filter(
                          (researcher) =>
                            researcher.institution_id ===
                            selectedInstitution.institution_id
                        )
                        .slice(0, 6)
                        .map((researcher) => (
                          <Link
                            key={researcher.researcher_id}
                            to={`/researchers/${researcher.researcher_id}`}
                            className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                          >

                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-600 text-[9px] font-bold text-white">
                              {researcher.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                                {researcher.name}
                              </p>

                              <p className="truncate text-[9px] text-slate-400">
                                {researcher.department ||
                                  'Research'}
                              </p>

                            </div>

                          </Link>
                        ))}

                    </div>

                  </div>

                </div>

              ) : (

                /* ==================================================
                   DEFAULT STATE
                ================================================== */

                <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">

                    <Network className="h-7 w-7 text-slate-400" />

                  </div>

                  <h3 className="mt-5 text-sm font-bold text-slate-700 dark:text-slate-200">
                    Explore the network
                  </h3>

                  <p className="mt-2 max-w-[220px] text-[10px] leading-5 text-slate-400">
                    Select a researcher or institution node
                    from the graph to inspect its relationships,
                    centrality, and scholarly output.
                  </p>

                  <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2 text-[9px] font-semibold text-slate-400">
                    <Info className="h-3.5 w-3.5" />
                    Click any node to begin
                  </div>

                </div>

              )}

            </div>

          </aside>

        </div>
      )}

      {/* ========================================================
          ADD CONNECTION MODAL
      ========================================================= */}

      {edgeDialogOpen && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEdgeDialogOpen(false);
              setEdgeError('');
            }
          }}
        >

          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">

            {/* Modal header */}

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-600 text-white">
                  <Plus className="h-4 w-4" />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Add Collaboration
                  </h3>

                  <p className="text-[10px] text-slate-400">
                    Establish a researcher connection
                  </p>

                </div>

              </div>

              <button
                onClick={() => {
                  setEdgeDialogOpen(false);
                  setEdgeError('');
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleAddEdge}
              className="space-y-5 p-5"
            >

              {edgeError && (

                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-[10px] text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">

                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>{edgeError}</span>

                </div>

              )}

              {/* Collaborator A */}

              <div>

                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  First Collaborator
                </label>

                <select
                  value={partnerId1 ?? ''}
                  onChange={(e) =>
                    setPartnerId1(
                      e.target.value
                        ? Number(e.target.value)
                        : undefined
                    )
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-3 text-xs text-slate-700 dark:text-slate-200 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
                >
                  <option value="">
                    Choose researcher
                  </option>

                  {researchers.map((researcher) => (
                    <option
                      key={researcher.researcher_id}
                      value={researcher.researcher_id}
                    >
                      {researcher.name} —{' '}
                      {researcher.department ||
                        'Research'}
                    </option>
                  ))}

                </select>

              </div>

              {/* Connector */}

              <div className="flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-50 dark:bg-navy-950/40">
                  <Network className="h-3.5 w-3.5 text-navy-500" />
                </div>

                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

              </div>

              {/* Collaborator B */}

              <div>

                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Second Collaborator
                </label>

                <select
                  value={partnerId2 ?? ''}
                  onChange={(e) =>
                    setPartnerId2(
                      e.target.value
                        ? Number(e.target.value)
                        : undefined
                    )
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-3 text-xs text-slate-700 dark:text-slate-200 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
                >
                  <option value="">
                    Choose researcher
                  </option>

                  {researchers.map((researcher) => (
                    <option
                      key={researcher.researcher_id}
                      value={researcher.researcher_id}
                    >
                      {researcher.name} —{' '}
                      {researcher.department ||
                        'Research'}
                    </option>
                  ))}

                </select>

              </div>

              {/* Type */}

              <div>

                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Collaboration Type
                </label>

                <select
                  value={collabType}
                  onChange={(e) =>
                    setCollabType(e.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-3 text-xs text-slate-700 dark:text-slate-200 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/10"
                >
                  <option value="Joint Publication">
                    Joint Publication
                  </option>

                  <option value="Joint Project">
                    Joint Project
                  </option>

                  <option value="Co-author">
                    Co-author
                  </option>

                  <option value="Peer Review">
                    Peer Review
                  </option>
                </select>

              </div>

              {/* Submit */}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-600 py-3 text-xs font-bold text-white shadow-lg shadow-navy-600/10 hover:bg-navy-700 transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                Establish Connection
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

/* ================================================================
   SMALL REUSABLE UI COMPONENTS
================================================================ */

const MetricRow: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-3">

      <span className="text-[10px] font-medium text-slate-400">
        {label}
      </span>

      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
        {value}
      </span>

    </div>
  );
};

const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  mono?: boolean;
}> = ({ icon, label, mono = false }) => {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2.5">

      <span className="shrink-0 text-slate-400">
        {icon}
      </span>

      <span
        className={`truncate text-[10px] text-slate-500 dark:text-slate-400 ${mono ? 'font-mono' : ''
          }`}
      >
        {label}
      </span>

    </div>
  );
};

const InsightCard: React.FC<{
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}> = ({
  title,
  value,
  description,
  icon,
}) => {
    return (
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4">

        <div className="flex items-center gap-2">

          <span className="text-navy-500">
            {icon}
          </span>

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {title}
          </p>

        </div>

        <p className="mt-3 truncate text-sm font-bold text-slate-800 dark:text-slate-200">
          {value}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-slate-400">
          {description}
        </p>

      </div>
    );
  };