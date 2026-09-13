import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  ExternalLink,
  GitFork,
  Globe,
  Globe2,
  Landmark,
  MapPin,
  Network,
  Search,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { ResearcherService } from '../services/researcherService';
import { PublicationService } from '../services/publicationService';
import { CollaborationService } from '../services/collaborationService';
import { ConferenceService } from '../services/conferenceService';
import { DashboardService } from '../services/dashboardService';
import { AdminService } from '../services/adminService';
import { ThemeToggle } from '../components/ThemeToggle';
import type { Researcher, SystemStats, Institution, Publication, Collaboration, Conference } from '../types';

export const LandingPage: React.FC = () => {
  const [featured, setFeatured] = useState<Researcher[]>([]);
  const [allResearchers, setAllResearchers] = useState<Researcher[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [allPublications, setAllPublications] = useState<Publication[]>([]);
  const [allCollaborations, setAllCollaborations] = useState<Collaboration[]>([]);
  const [allConferences, setAllConferences] = useState<Conference[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'researchers' | 'publications' | 'collaborations' | 'conferences'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedProfileModal, setSelectedProfileModal] = useState<Researcher | null>(null);
  const [pubSearchQuery, setPubSearchQuery] = useState('');
  const [selectedPubType, setSelectedPubType] = useState<string>('all');
  const [selectedPublicationModal, setSelectedPublicationModal] = useState<Publication | null>(null);
  const [collabSearchQuery, setCollabSearchQuery] = useState('');
  const [selectedCollabType, setSelectedCollabType] = useState<string>('all');
  const [selectedCollaborationModal, setSelectedCollaborationModal] = useState<Collaboration | null>(null);
  const [confSearchQuery, setConfSearchQuery] = useState('');
  const [selectedConferenceModal, setSelectedConferenceModal] = useState<Conference | null>(null);

  useEffect(() => {
    ResearcherService.getAll()
      .then((res) => {
        setAllResearchers(res);
        setFeatured(res.slice(0, 3));
      })
      .catch((err) => console.error('Failed to load researchers:', err));

    PublicationService.getAll()
      .then((pubs) => setAllPublications(pubs))
      .catch((err) => console.error('Failed to load publications:', err));

    CollaborationService.getAll()
      .then((collabs) => setAllCollaborations(collabs))
      .catch((err) => console.error('Failed to load collaborations:', err));

    ConferenceService.getAll()
      .then((confs) => setAllConferences(confs))
      .catch((err) => console.error('Failed to load conferences:', err));

    AdminService.getAllInstitutions()
      .then((instList) => setInstitutions(instList))
      .catch((err) => console.error('Failed to load institutions:', err));

    DashboardService.getSystemStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load system stats:', err));
  }, []);

  // Helper to extract clean initials (e.g. "Dr. Rishitha Khandesh" -> "RK")
  const getInitials = (name: string): string => {
    if (!name) return 'R';
    const cleaned = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').trim();
    const parts = cleaned.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
  };

  // Real Collaboration Map Nodes & Edges dynamically generated from registered persons in the app
  const { previewNodes, previewEdges } = useMemo(() => {
    const nodes: Array<{
      id: string;
      dbId?: number;
      name: string;
      role: string;
      initials: string;
      x: number;
      y: number;
      type: 'researcher' | 'institution' | 'core';
      researcher?: Researcher;
      institutionName?: string;
      collabPartners: string[];
    }> = [];

    const edges: Array<{
      id: string;
      source: string;
      target: string;
      type: 'collaboration' | 'hub' | 'affiliation';
      label?: string;
      count?: number;
    }> = [];

    // Central Core Hub
    nodes.push({
      id: 'core_hub',
      name: 'SCN Research Network',
      role: 'Collaboration Hub',
      initials: 'SCN',
      x: 350,
      y: 200,
      type: 'core',
      collabPartners: [],
    });

    const researchersToDisplay = allResearchers;
    const count = researchersToDisplay.length;

    // Distribute registered persons in an elliptical orbit
    researchersToDisplay.forEach((res, index) => {
      const angle = count > 0 ? -Math.PI / 2 + (index * 2 * Math.PI) / count : 0;
      const radiusX = count <= 3 ? 195 : 225;
      const radiusY = count <= 3 ? 115 : 130;
      const x = Math.round(350 + radiusX * Math.cos(angle));
      const y = Math.round(200 + radiusY * Math.sin(angle));

      // Find real collaborators for this researcher from allCollaborations and allPublications
      const partnerIds = new Set<number>();
      allCollaborations.forEach((c) => {
        if (c.researcher_ids.includes(res.researcher_id)) {
          c.researcher_ids.forEach((id) => {
            if (id !== res.researcher_id) partnerIds.add(id);
          });
        }
      });
      allPublications.forEach((pub) => {
        if (pub.researcher_ids && pub.researcher_ids.includes(res.researcher_id)) {
          pub.researcher_ids.forEach((id) => {
            if (id !== res.researcher_id) partnerIds.add(id);
          });
        }
      });

      const partnerNames = Array.from(partnerIds)
        .map((pid) => allResearchers.find((r) => r.researcher_id === pid)?.name)
        .filter(Boolean) as string[];

      const instName = institutions.find((inst) => inst.institution_id === res.institution_id)?.name || 'Independent Researcher';

      nodes.push({
        id: `res_${res.researcher_id}`,
        dbId: res.researcher_id,
        name: res.name,
        role: res.department || 'Registered Researcher',
        initials: getInitials(res.name),
        x,
        y,
        type: 'researcher',
        researcher: res,
        institutionName: instName,
        collabPartners: partnerNames,
      });

      // Connect each researcher to the central network hub
      edges.push({
        id: `hub_${res.researcher_id}`,
        source: 'core_hub',
        target: `res_${res.researcher_id}`,
        type: 'hub',
        label: 'Network Member',
      });
    });

    // Real collaboration edges between registered persons
    const addedCollabPairs = new Set<string>();

    allCollaborations.forEach((collab) => {
      if (collab.researcher_ids && collab.researcher_ids.length >= 2) {
        const id1 = collab.researcher_ids[0];
        const id2 = collab.researcher_ids[1];
        const pairKey = [Math.min(id1, id2), Math.max(id1, id2)].join('-');

        const hasR1 = nodes.some((n) => n.id === `res_${id1}`);
        const hasR2 = nodes.some((n) => n.id === `res_${id2}`);

        if (hasR1 && hasR2 && !addedCollabPairs.has(pairKey)) {
          addedCollabPairs.add(pairKey);
          edges.push({
            id: `col_${collab.collaboration_id}`,
            source: `res_${id1}`,
            target: `res_${id2}`,
            type: 'collaboration',
            label: collab.collaboration_type || 'Active Collaboration',
            count: collab.collaboration_count,
          });
        }
      }
    });

    // Also include co-authored publications as collaboration edges
    allPublications.forEach((pub) => {
      const pubRIds = pub.researcher_ids || [];
      for (let i = 0; i < pubRIds.length; i++) {
        for (let j = i + 1; j < pubRIds.length; j++) {
          const id1 = pubRIds[i];
          const id2 = pubRIds[j];
          const pairKey = [Math.min(id1, id2), Math.max(id1, id2)].join('-');
          const hasR1 = nodes.some((n) => n.id === `res_${id1}`);
          const hasR2 = nodes.some((n) => n.id === `res_${id2}`);

          if (hasR1 && hasR2 && !addedCollabPairs.has(pairKey)) {
            addedCollabPairs.add(pairKey);
            edges.push({
              id: `pub_col_${pub.publication_id}_${id1}_${id2}`,
              source: `res_${id1}`,
              target: `res_${id2}`,
              type: 'collaboration',
              label: 'Joint Publication',
              count: 1,
            });
          }
        }
      }
    });

    return { previewNodes: nodes, previewEdges: edges };
  }, [allResearchers, allCollaborations, allPublications, institutions]);

  const activeNode = previewNodes.find(
    (node) => node.id === hoveredNode
  );

  const isConnected = (nodeId: string) => {
    if (hoveredNode === null) return false;
    if (hoveredNode === nodeId) return true;

    return previewEdges.some(
      (edge) =>
        (edge.source === hoveredNode && edge.target === nodeId) ||
        (edge.target === hoveredNode && edge.source === nodeId)
    );
  };

  const statItems = [
    {
      label: 'Researchers',
      value: stats?.total_researchers || 0,
      icon: Users,
    },
    {
      label: 'Publications',
      value: stats?.total_publications || 0,
      icon: BookOpen,
    },
    {
      label: 'Collaborations',
      value: stats?.total_collaborations || 0,
      icon: GitFork,
    },
    {
      label: 'Citations',
      value: stats?.total_citations || 0,
      icon: Award,
    },
  ];

  const getInstitutionName = (institutionId?: number | null) => {
    if (!institutionId) return 'Independent Researcher';
    return (
      institutions.find((inst) => inst.institution_id === institutionId)?.name ||
      'Affiliated Institute'
    );
  };

  const filteredResearchers = allResearchers.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      Boolean(r.department && r.department.toLowerCase().includes(q)) ||
      getInstitutionName(r.institution_id).toLowerCase().includes(q) ||
      r.skills.some((s) => s.toLowerCase().includes(q)) ||
      r.research_interests.some((i) => i.toLowerCase().includes(q));

    const matchesDept =
      selectedDept === 'all' ||
      (r.department && r.department.toLowerCase() === selectedDept.toLowerCase());

    return matchesSearch && matchesDept;
  });

  const availableDepts = Array.from(
    new Set(allResearchers.map((r) => r.department).filter(Boolean))
  ) as string[];

  const getAuthorNames = (pub: Publication) => {
    const internal = (pub.researcher_ids || [])
      .map((id) => allResearchers.find((r) => r.researcher_id === id)?.name)
      .filter(Boolean);
    const external = pub.external_authors || [];
    const all = [...internal, ...external];
    return all.length > 0 ? all.join(', ') : 'Collaborating Researchers';
  };

  const filteredPublications = allPublications.filter((pub) => {
    const q = pubSearchQuery.trim().toLowerCase();
    const authors = getAuthorNames(pub).toLowerCase();
    const matchesSearch =
      !q ||
      pub.title.toLowerCase().includes(q) ||
      Boolean(pub.abstract && pub.abstract.toLowerCase().includes(q)) ||
      Boolean(pub.doi && pub.doi.toLowerCase().includes(q)) ||
      authors.includes(q);

    const matchesType =
      selectedPubType === 'all' ||
      pub.publication_type?.toLowerCase() === selectedPubType.toLowerCase();

    return matchesSearch && matchesType;
  });

  const availablePubTypes = Array.from(
    new Set(allPublications.map((p) => p.publication_type).filter(Boolean))
  ) as string[];

  const getCollaboratorResearchers = (collab: Collaboration): Researcher[] => {
    return (collab.researcher_ids || [])
      .map((id) => allResearchers.find((r) => r.researcher_id === id))
      .filter((r): r is Researcher => Boolean(r));
  };

  const filteredCollaborations = allCollaborations.filter((collab) => {
    const q = collabSearchQuery.trim().toLowerCase();
    const researchers = getCollaboratorResearchers(collab);
    const researcherNames = researchers.map((r) => r.name.toLowerCase()).join(' ');
    const researcherDepts = researchers.map((r) => (r.department || '').toLowerCase()).join(' ');
    const collabType = (collab.collaboration_type || '').toLowerCase();

    const matchesSearch =
      !q ||
      researcherNames.includes(q) ||
      researcherDepts.includes(q) ||
      collabType.includes(q);

    const matchesType =
      selectedCollabType === 'all' ||
      (collab.collaboration_type &&
        collab.collaboration_type.toLowerCase() === selectedCollabType.toLowerCase());

    return matchesSearch && matchesType;
  });

  const availableCollabTypes = Array.from(
    new Set(allCollaborations.map((c) => c.collaboration_type).filter(Boolean))
  ) as string[];

  const getConferencePubs = (conferenceId: number) => {
    return allPublications.filter((p) => p.conference_id === conferenceId);
  };

  const filteredConferences = allConferences.filter((conf) => {
    const q = confSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      conf.name.toLowerCase().includes(q) ||
      Boolean(conf.description && conf.description.toLowerCase().includes(q)) ||
      Boolean(conf.location && conf.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/85">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

          <button
            onClick={() => setActiveView('overview')}
            className="group flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-600 text-white shadow-lg shadow-navy-600/20 transition-transform group-hover:scale-105">
              <Network className="h-5 w-5" />
            </div>

            <div>
              <div className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                SCN
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Research Network
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => setActiveView('overview')}
              className={`text-xs font-semibold transition-colors ${
                activeView === 'overview'
                  ? 'font-bold text-navy-600 dark:text-navy-400'
                  : 'text-slate-500 hover:text-navy-600 dark:text-slate-400 dark:hover:text-navy-400'
              }`}
            >
              Overview
            </button>

            <button
              id="researchers-nav-btn"
              onClick={() => setActiveView('researchers')}
              className={`group relative flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                activeView === 'researchers'
                  ? 'font-bold text-navy-600 dark:text-navy-400'
                  : 'text-slate-500 hover:text-navy-600 dark:text-slate-400 dark:hover:text-navy-400'
              }`}
            >
              Researchers
              <span
                className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeView === 'researchers'
                    ? 'bg-navy-600 text-white dark:bg-navy-500'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-navy-50 group-hover:text-navy-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {allResearchers.length}
              </span>
              {activeView === 'researchers' && (
                <span className="absolute -bottom-[26px] left-0 right-0 h-0.5 bg-navy-600 dark:bg-navy-400" />
              )}
            </button>

            <button
              id="publications-nav-btn"
              onClick={() => setActiveView('publications')}
              className={`group relative flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                activeView === 'publications'
                  ? 'font-bold text-navy-600 dark:text-navy-400'
                  : 'text-slate-500 hover:text-navy-600 dark:text-slate-400 dark:hover:text-navy-400'
              }`}
            >
              Publications
              <span
                className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeView === 'publications'
                    ? 'bg-navy-600 text-white dark:bg-navy-500'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-navy-50 group-hover:text-navy-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {allPublications.length}
              </span>
              {activeView === 'publications' && (
                <span className="absolute -bottom-[26px] left-0 right-0 h-0.5 bg-navy-600 dark:bg-navy-400" />
              )}
            </button>

            <button
              id="collaborations-nav-btn"
              onClick={() => setActiveView('collaborations')}
              className={`group relative flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                activeView === 'collaborations'
                  ? 'font-bold text-navy-600 dark:text-navy-400'
                  : 'text-slate-500 hover:text-navy-600 dark:text-slate-400 dark:hover:text-navy-400'
              }`}
            >
              Collaborations
              <span
                className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeView === 'collaborations'
                    ? 'bg-navy-600 text-white dark:bg-navy-500'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-navy-50 group-hover:text-navy-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {allCollaborations.length}
              </span>
              {activeView === 'collaborations' && (
                <span className="absolute -bottom-[26px] left-0 right-0 h-0.5 bg-navy-600 dark:bg-navy-400" />
              )}
            </button>

            <button
              id="conferences-nav-btn"
              onClick={() => setActiveView('conferences')}
              className={`group relative flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                activeView === 'conferences'
                  ? 'font-bold text-navy-600 dark:text-navy-400'
                  : 'text-slate-500 hover:text-navy-600 dark:text-slate-400 dark:hover:text-navy-400'
              }`}
            >
              Conferences
              <span
                className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeView === 'conferences'
                    ? 'bg-navy-600 text-white dark:bg-navy-500'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-navy-50 group-hover:text-navy-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {allConferences.length}
              </span>
              {activeView === 'conferences' && (
                <span className="absolute -bottom-[26px] left-0 right-0 h-0.5 bg-navy-600 dark:bg-navy-400" />
              )}
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              to="/login"
              className="hidden px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:text-navy-600 dark:text-slate-300 sm:block"
            >
              Sign in
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-navy-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-navy-600/15 transition-all hover:bg-navy-700 hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO / MAIN CONTENT
      ========================================================= */}
      <main>
        {activeView === 'researchers' ? (
          <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            {/* Top Navigation & Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
              <div>
                <button
                  onClick={() => setActiveView('overview')}
                  className="group mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-navy-600 dark:text-slate-400 dark:hover:text-navy-400"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Back to Landing Overview
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                    Signed-in Researchers
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {allResearchers.length} Researchers Signed In
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  Showing all researcher profiles currently active and registered in the Scientific Collaboration Network.
                </p>
              </div>

              <button
                onClick={() => setActiveView('overview')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80"
              >
                Back to Overview
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skill, interest, or department..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 shadow-sm transition-colors focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Department:
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">All Departments ({allResearchers.length})</option>
                  {availableDepts.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Researchers Profile Cards Grid */}
            {filteredResearchers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />
                <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                  No researchers found
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your search query or department filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDept('all');
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-3 py-1.5 text-xs font-bold text-navy-600 dark:bg-navy-950/50 dark:text-navy-400"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredResearchers.map((researcher) => {
                  const instName = getInstitutionName(researcher.institution_id);
                  return (
                    <div
                      key={researcher.researcher_id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-navy-800"
                    >
                      <div>
                        {/* Profile Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-600 to-navy-450 text-base font-extrabold text-white shadow-md shadow-navy-600/20">
                              {researcher.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h2 className="truncate text-base font-bold text-slate-900 transition-colors group-hover:text-navy-600 dark:text-white dark:group-hover:text-navy-400">
                                {researcher.name}
                              </h2>
                              <p className="truncate text-xs font-medium text-navy-600 dark:text-cyan-400">
                                {researcher.department || 'Academic Department'}
                              </p>
                            </div>
                          </div>

                          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Signed In
                          </span>
                        </div>

                        {/* Institution */}
                        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{instName}</span>
                        </div>

                        {/* Bio */}
                        <p className="mt-3.5 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          {researcher.bio ||
                            'Active scholar profile registered with the Scientific Collaboration Network.'}
                        </p>

                        {/* Skills */}
                        {researcher.skills && researcher.skills.length > 0 && (
                          <div className="mt-4">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Key Skills
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {researcher.skills.slice(0, 3).map((skill, i) => (
                                <span
                                  key={i}
                                  className="rounded-lg bg-navy-50 px-2 py-0.5 text-[10px] font-medium text-navy-700 dark:bg-navy-950/60 dark:text-navy-300"
                                >
                                  {skill}
                                </span>
                              ))}
                              {researcher.skills.length > 3 && (
                                <span className="rounded-lg bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                  +{researcher.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Research Interests */}
                        {researcher.research_interests && researcher.research_interests.length > 0 && (
                          <div className="mt-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Research Focus
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {researcher.research_interests.slice(0, 2).map((interest, i) => (
                                <span
                                  key={i}
                                  className="rounded-lg bg-cyan-50 px-2 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300"
                                >
                                  {interest}
                                </span>
                              ))}
                              {researcher.research_interests.length > 2 && (
                                <span className="rounded-lg bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                  +{researcher.research_interests.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                        <span className="font-mono text-[10px] font-medium text-slate-400">
                          {researcher.orcid ? `ORCID: ${researcher.orcid}` : 'Verified Profile'}
                        </span>

                        <button
                          onClick={() => setSelectedProfileModal(researcher)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-3 py-1.5 text-xs font-bold text-navy-600 transition-colors hover:bg-navy-600 hover:text-white dark:bg-navy-950/50 dark:text-navy-400 dark:hover:bg-navy-600 dark:hover:text-white"
                        >
                          View Profile
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeView === 'publications' ? (
          <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            {/* Top Navigation & Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
              <div>
                <button
                  onClick={() => setActiveView('overview')}
                  className="group mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-navy-600 dark:text-slate-400 dark:hover:text-navy-400"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Back to Landing Overview
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                    Scientific Publications
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    {allPublications.length} Publications Logged
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  Showing all scientific publications, conference proceedings, and journals in the Scientific Collaboration Network.
                </p>
              </div>

              <button
                onClick={() => setActiveView('overview')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80"
              >
                Back to Overview
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pubSearchQuery}
                  onChange={(e) => setPubSearchQuery(e.target.value)}
                  placeholder="Search by paper title, author, keyword, or DOI..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 shadow-sm transition-colors focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                {pubSearchQuery && (
                  <button
                    onClick={() => setPubSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Publication Type:
                </label>
                <select
                  value={selectedPubType}
                  onChange={(e) => setSelectedPubType(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">All Types ({allPublications.length})</option>
                  {availablePubTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Publications Grid */}
            {filteredPublications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                <BookOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />
                <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                  No publications found
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your search terms or publication type filter.
                </p>
                <button
                  onClick={() => {
                    setPubSearchQuery('');
                    setSelectedPubType('all');
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-3 py-1.5 text-xs font-bold text-navy-600 dark:bg-navy-950/50 dark:text-navy-400"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPublications.map((pub) => {
                  const authorNames = getAuthorNames(pub);
                  return (
                    <div
                      key={pub.publication_id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-navy-800"
                    >
                      <div>
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-md bg-navy-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy-600 dark:bg-navy-950/60 dark:text-cyan-400">
                            {pub.publication_type || 'Paper'}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              String(pub.status).toLowerCase() === 'published'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}
                          >
                            {pub.status || 'Active'}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="mt-4 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-navy-600 dark:text-white dark:group-hover:text-navy-400">
                          {pub.title}
                        </h2>

                        {/* Authors */}
                        <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-500" />
                          <span className="line-clamp-1 font-medium">{authorNames}</span>
                        </div>

                        {/* Publication Date */}
                        {pub.publication_date && (
                          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                            <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                            <span>Published: {pub.publication_date}</span>
                          </div>
                        )}

                        {/* Abstract Snippet */}
                        <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {pub.abstract || 'Scientific publication indexed within the SCN collaborative repository.'}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {pub.doi && (
                          <div className="mb-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <ExternalLink className="h-3 w-3 shrink-0 text-navy-500" />
                            <span className="truncate">DOI: {pub.doi}</span>
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedPublicationModal(pub)}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy-50 py-2 text-xs font-bold text-navy-600 transition-colors hover:bg-navy-600 hover:text-white dark:bg-navy-950/50 dark:text-navy-400 dark:hover:bg-navy-600 dark:hover:text-white"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          View Publication Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeView === 'collaborations' ? (
          <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            {/* Top Navigation & Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
              <div>
                <button
                  onClick={() => setActiveView('overview')}
                  className="group mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-navy-600 dark:text-slate-400 dark:hover:text-navy-400"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Back to Landing Overview
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                    Scientific Collaborations
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
                    <GitFork className="h-3.5 w-3.5" />
                    {allCollaborations.length} Collaborations Mapped
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  Showing cross-institutional research links and co-authorship networks across researchers.
                </p>
              </div>

              <button
                onClick={() => setActiveView('overview')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80"
              >
                Back to Overview
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={collabSearchQuery}
                  onChange={(e) => setCollabSearchQuery(e.target.value)}
                  placeholder="Search by researcher name, department, or type..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 shadow-sm transition-colors focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                {collabSearchQuery && (
                  <button
                    onClick={() => setCollabSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Collaboration Type:
                </label>
                <select
                  value={selectedCollabType}
                  onChange={(e) => setSelectedCollabType(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">All Types ({allCollaborations.length})</option>
                  {availableCollabTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Collaborations Grid */}
            {filteredCollaborations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                <GitFork className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />
                <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                  No collaborations found
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your search query or collaboration type filter.
                </p>
                <button
                  onClick={() => {
                    setCollabSearchQuery('');
                    setSelectedCollabType('all');
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-3 py-1.5 text-xs font-bold text-navy-600 dark:bg-navy-950/50 dark:text-navy-400"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCollaborations.map((collab) => {
                  const collaborators = getCollaboratorResearchers(collab);
                  return (
                    <div
                      key={collab.collaboration_id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-navy-800"
                    >
                      <div>
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-md bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                            {collab.collaboration_type || 'Collaborative Research'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-navy-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-navy-600 dark:bg-navy-950/50 dark:text-navy-300">
                            <GitFork className="h-3 w-3" />
                            {collab.collaboration_count} Joint {collab.collaboration_count === 1 ? 'Work' : 'Works'}
                          </span>
                        </div>

                        {/* Connected Researchers List */}
                        <div className="mt-5 space-y-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Connected Collaborators
                          </div>

                          {collaborators.map((res) => (
                            <div
                              key={res.researcher_id}
                              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/60"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-600 to-navy-450 text-xs font-bold text-white shadow-sm">
                                {res.name.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                  {res.name}
                                </h4>
                                <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                                  {res.department || 'Academic Department'} • {getInstitutionName(res.institution_id)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <button
                          onClick={() => setSelectedCollaborationModal(collab)}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy-50 py-2 text-xs font-bold text-navy-600 transition-colors hover:bg-navy-600 hover:text-white dark:bg-navy-950/50 dark:text-navy-400 dark:hover:bg-navy-600 dark:hover:text-white"
                        >
                          <Network className="h-3.5 w-3.5" />
                          View Collaboration Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeView === 'conferences' ? (
          <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            {/* Top Navigation & Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
              <div>
                <button
                  onClick={() => setActiveView('overview')}
                  className="group mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-navy-600 dark:text-slate-400 dark:hover:text-navy-400"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Back to Landing Overview
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                    Academic Conferences
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                    <Globe className="h-3.5 w-3.5" />
                    {allConferences.length} Conferences Indexed
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  Explore global research symposiums, summits, and academic conferences in the network.
                </p>
              </div>

              <button
                onClick={() => setActiveView('overview')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80"
              >
                Back to Overview
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={confSearchQuery}
                  onChange={(e) => setConfSearchQuery(e.target.value)}
                  placeholder="Search by conference name, topic, or location..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 shadow-sm transition-colors focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                {confSearchQuery && (
                  <button
                    onClick={() => setConfSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Conferences Grid */}
            {filteredConferences.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                <Globe className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />
                <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                  No conferences found
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your search terms.
                </p>
                <button
                  onClick={() => setConfSearchQuery('')}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-3 py-1.5 text-xs font-bold text-navy-600 dark:bg-navy-950/50 dark:text-navy-400"
                >
                  Reset search
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredConferences.map((conf) => {
                  const papers = getConferencePubs(conf.conference_id);
                  return (
                    <div
                      key={conf.conference_id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-navy-800"
                    >
                      <div>
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-md bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                            Academic Summit
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-navy-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-navy-600 dark:bg-navy-950/50 dark:text-navy-300">
                            <BookOpen className="h-3 w-3" />
                            {papers.length} Papers Presented
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="mt-4 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-navy-600 dark:text-white dark:group-hover:text-navy-400">
                          {conf.name}
                        </h2>

                        {/* Location & Dates */}
                        <div className="mt-3 space-y-1.5">
                          {conf.location && (
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                              <span className="truncate">{conf.location}</span>
                            </div>
                          )}

                          {(conf.start_date || conf.end_date) && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                              <span>
                                {conf.start_date} {conf.end_date ? `to ${conf.end_date}` : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {conf.description ||
                            'Major research forum discussing advanced discoveries, global findings, and scientific networking.'}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {conf.website && (
                          <div className="mb-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <Globe className="h-3 w-3 shrink-0 text-violet-500" />
                            <a
                              href={conf.website.startsWith('http') ? conf.website : `https://${conf.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-navy-600 hover:underline dark:text-cyan-400"
                            >
                              {conf.website}
                            </a>
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedConferenceModal(conf)}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-50 py-2 text-xs font-bold text-violet-700 transition-colors hover:bg-violet-600 hover:text-white dark:bg-violet-950/50 dark:text-violet-400 dark:hover:bg-violet-600 dark:hover:text-white"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          View Conference Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-220px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-navy-500/10 blur-3xl dark:bg-navy-450/10" />
            <div className="absolute right-[-180px] top-[180px] h-[400px] w-[400px] rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute left-[-200px] top-[420px] h-[350px] w-[350px] rounded-full bg-blue-400/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 lg:px-10 lg:pb-24 lg:pt-28">

            <div className="mx-auto max-w-4xl text-center">

              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-navy-100 bg-navy-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-600 dark:border-navy-900 dark:bg-navy-950/50 dark:text-navy-400">
                <Sparkles className="h-3.5 w-3.5" />
                Scientific Collaboration Intelligence
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-7xl dark:text-white">
                Where scientific
                <span className="block bg-gradient-to-r from-navy-600 via-navy-500 to-cyan-500 bg-clip-text text-transparent">
                  collaboration connects.
                </span>
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base dark:text-slate-400">
                SCN brings researchers, publications, institutions, projects,
                and citations together in one intelligent scientific
                collaboration network.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setActiveView('researchers')}
                  className="group inline-flex items-center gap-2 rounded-xl bg-navy-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-navy-600/20 transition-all hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-2xl"
                >
                  Explore Researchers ({allResearchers.length})
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  Start Researching
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-navy-500" />
                  Research discovery
                </span>

                <span className="flex items-center gap-1.5">
                  <Network className="h-3.5 w-3.5 text-navy-500" />
                  Collaboration mapping
                </span>

                <span className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-navy-500" />
                  Research impact
                </span>
              </div>
            </div>

            {/* =====================================================
                NETWORK PREVIEW
            ===================================================== */}
            <div className="relative mx-auto mt-16 max-w-6xl">

              <div className="absolute -inset-4 rounded-[34px] bg-gradient-to-r from-navy-500/10 via-cyan-400/10 to-blue-400/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/20 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

                {/* Browser-like top bar */}
                <div className="flex h-12 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  </div>

                  <div className="hidden items-center gap-2 rounded-lg bg-slate-50 px-4 py-1.5 text-[9px] font-semibold text-slate-400 dark:bg-slate-950 sm:flex">
                    <Search className="h-3 w-3" />
                    scientific-collaboration-network
                  </div>

                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live Network
                  </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_290px]">

                  {/* Graph */}
                  <div className="relative min-h-[390px] overflow-hidden bg-slate-50/80 p-4 dark:bg-slate-950/60 sm:p-7">

                    <div className="absolute left-6 top-5 z-10">
                      <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        <Compass className="h-3.5 w-3.5 text-navy-500" />
                        Collaboration Map
                      </div>
                    </div>

                    <svg
                      className="h-full min-h-[370px] w-full select-none"
                      viewBox="0 0 700 400"
                    >
                      <defs>
                        <radialGradient id="networkGlow">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Central glow */}
                      <circle
                        cx="350"
                        cy="200"
                        r="120"
                        fill="url(#networkGlow)"
                      />

                      {/* Edges */}
                      {previewEdges.map((edge, index) => {
                        const source = previewNodes.find(
                          (node) => node.id === edge.source
                        );
                        const target = previewNodes.find(
                          (node) => node.id === edge.target
                        );

                        if (!source || !target) return null;

                        const isCollab = edge.type === 'collaboration';
                        const highlighted =
                          hoveredNode !== null &&
                          (edge.source === hoveredNode ||
                            edge.target === hoveredNode);

                        const muted =
                          hoveredNode !== null && !highlighted;

                        return (
                          <g key={edge.id || index}>
                            <line
                              x1={source.x}
                              y1={source.y}
                              x2={target.x}
                              y2={target.y}
                              stroke={
                                highlighted
                                  ? '#06b6d4'
                                  : isCollab
                                  ? '#38bdf8'
                                  : '#cbd5e1'
                              }
                              strokeWidth={
                                highlighted
                                  ? isCollab ? 3 : 2
                                  : isCollab ? 2 : 1
                              }
                              strokeDasharray={
                                isCollab
                                  ? highlighted ? '0' : '4 3'
                                  : '4 5'
                              }
                              opacity={
                                highlighted
                                  ? 1
                                  : muted
                                  ? 0.12
                                  : isCollab ? 0.75 : 0.35
                              }
                              className="transition-all duration-200"
                            />
                          </g>
                        );
                      })}

                      {/* Nodes */}
                      {previewNodes.map((node) => {
                        const highlighted = isConnected(node.id);
                        const selected = hoveredNode === node.id;
                        const muted =
                          hoveredNode !== null && !highlighted;

                        const isCore = node.type === 'core';
                        const radius = isCore ? 26 : 22;

                        const fill = isCore
                          ? '#0891b2'
                          : selected
                          ? '#0284c7'
                          : '#0369a1';

                        return (
                          <g
                            key={node.id}
                            onMouseEnter={() =>
                              setHoveredNode(node.id)
                            }
                            onMouseLeave={() =>
                              setHoveredNode(null)
                            }
                            onClick={() => {
                              if (node.researcher) {
                                setSelectedProfileModal(node.researcher);
                              }
                            }}
                            className="cursor-pointer transition-opacity duration-200"
                            opacity={muted ? 0.22 : 1}
                          >
                            {/* Hover Halo */}
                            {selected && (
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r={radius + 8}
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth="2"
                                opacity="0.6"
                                strokeDasharray="3 3"
                              />
                            )}

                            {/* Node Circle */}
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={radius}
                              fill={fill}
                              stroke="white"
                              strokeWidth="2.5"
                              className="drop-shadow-sm"
                            />

                            {/* Active Registered Badge for researchers */}
                            {!isCore && (
                              <circle
                                cx={node.x + 14}
                                cy={node.y - 14}
                                r="4.5"
                                fill="#10b981"
                                stroke="white"
                                strokeWidth="1.5"
                              />
                            )}

                            {/* Initials */}
                            <text
                              x={node.x}
                              y={node.y + 4}
                              textAnchor="middle"
                              fill="white"
                              fontSize={isCore ? '10' : '11'}
                              fontWeight="800"
                              className="pointer-events-none"
                            >
                              {node.initials}
                            </text>

                            {/* Real Person Name Label underneath */}
                            {!isCore && (
                              <g className="pointer-events-none">
                                <text
                                  x={node.x}
                                  y={node.y + radius + 13}
                                  textAnchor="middle"
                                  fill={selected ? '#0284c7' : '#334155'}
                                  fontSize="10"
                                  fontWeight="700"
                                  className="dark:fill-slate-200"
                                >
                                  {node.name}
                                </text>
                                <text
                                  x={node.x}
                                  y={node.y + radius + 24}
                                  textAnchor="middle"
                                  fill="#94a3b8"
                                  fontSize="8"
                                  fontWeight="500"
                                >
                                  {node.role}
                                </text>
                              </g>
                            )}

                            {/* Core Label */}
                            {isCore && (
                              <text
                                x={node.x}
                                y={node.y + radius + 13}
                                textAnchor="middle"
                                fill="#0891b2"
                                fontSize="9"
                                fontWeight="700"
                                className="pointer-events-none"
                              >
                                SCN Live Hub
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Insight panel */}
                  <div className="border-t border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:border-l lg:border-t-0 flex flex-col justify-between">

                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 dark:bg-navy-950/50">
                          <Network className="h-4 w-4 text-navy-500" />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                            Network Intelligence
                          </p>

                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            Relationship Explorer
                          </p>
                        </div>
                      </div>

                      {activeNode ? (
                        <div className="mt-6 rounded-2xl border border-navy-100 bg-navy-50/60 p-4 dark:border-navy-900 dark:bg-navy-950/30">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-600 text-xs font-black text-white shadow-sm">
                              {activeNode.initials}
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                {activeNode.name}
                              </h3>

                              <p className="truncate text-[10px] font-medium text-navy-600 dark:text-cyan-400">
                                {activeNode.role}
                              </p>
                              {activeNode.institutionName && (
                                <p className="truncate text-[9px] text-slate-400">
                                  {activeNode.institutionName}
                                </p>
                              )}
                            </div>
                          </div>

                          {activeNode.researcher && (
                            <>
                              <div className="mt-3 flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Registered Person
                                </span>
                                {activeNode.researcher.orcid && (
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    ORCID
                                  </span>
                                )}
                              </div>

                              {/* Real Collaborations */}
                              <div className="mt-3">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  Real Collaborators ({activeNode.collabPartners.length})
                                </p>
                                {activeNode.collabPartners.length > 0 ? (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {activeNode.collabPartners.map((partner, idx) => (
                                      <span
                                        key={idx}
                                        className="rounded-md bg-cyan-100/70 dark:bg-cyan-950/60 px-2 py-0.5 text-[9px] font-semibold text-cyan-800 dark:text-cyan-300"
                                      >
                                        {partner}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="mt-1 text-[10px] text-slate-500">
                                    Available for research partnerships
                                  </p>
                                )}
                              </div>

                              {/* View Profile Action */}
                              <button
                                type="button"
                                onClick={() => setSelectedProfileModal(activeNode.researcher!)}
                                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-navy-700"
                              >
                                View Profile & Papers
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}

                          {activeNode.type === 'core' && (
                            <p className="mt-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                              Central collaboration engine orchestrating active research partnerships across registered persons.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-6">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Registered SCN Collaboration Map
                          </p>

                          <p className="mt-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                            Explore active registered scientists, their co-authorships, and real collaborative projects across institutions.
                          </p>

                          <div className="mt-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-2.5 text-[10px] text-slate-400">
                            💡 Hover over any node to inspect direct collaborators, or click to open their full profile.
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 space-y-2.5">
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950">
                        <span className="text-[10px] font-semibold text-slate-400">
                          Registered Persons
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {allResearchers.length || stats?.total_researchers || '—'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950">
                        <span className="text-[10px] font-semibold text-slate-400">
                          Active Collaborations
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {allCollaborations.length || stats?.total_collaborations || '—'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950">
                        <span className="text-[10px] font-semibold text-slate-400">
                          Publications Logged
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {allPublications.length || stats?.total_publications || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            STATS
        ========================================================= */}
        <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">

            {statItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-4 px-5 py-7 sm:px-8 ${
                    index !== 0
                      ? 'border-l border-slate-200 dark:border-slate-800'
                      : ''
                  }`}
                >
                  <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-500 dark:bg-navy-950/50 sm:flex">
                    <Icon className="h-4.5 w-4.5" />
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {item.value}
                    </div>

                    <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            PLATFORM SECTION
        ========================================================= */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">

          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-navy-500">
                <span className="h-px w-7 bg-navy-500" />
                One research ecosystem
              </div>

              <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                Turn disconnected research data into meaningful connections.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
              SCN provides a connected view of the scholarly ecosystem so
              researchers can discover, analyze, and build stronger
              scientific relationships.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {[
              {
                icon: Network,
                number: '01',
                title: 'Research Intelligence',
                description:
                  'Understand researchers, research areas, publication activity, and scientific influence.',
              },
              {
                icon: GitFork,
                number: '02',
                title: 'Collaboration Discovery',
                description:
                  'Explore co-authorship patterns and identify meaningful collaboration opportunities.',
              },
              {
                icon: Award,
                number: '03',
                title: 'Research Impact',
                description:
                  'Connect publications with citations and understand how research gains influence.',
              },
              {
                icon: Landmark,
                number: '04',
                title: 'Institutional Network',
                description:
                  'Map researchers and scientific activity across universities and organizations.',
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.number}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-500 transition-transform group-hover:scale-110 dark:bg-navy-950/50">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-[10px] font-bold tracking-widest text-slate-300 dark:text-slate-700">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-sm font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </p>

                  <div className="mt-6 h-px w-8 bg-navy-500 transition-all duration-300 group-hover:w-16" />
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            HOW IT WORKS
        ========================================================= */}
        <section className="border-y border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

            <div className="text-center">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-navy-500">
                Built for discovery
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                From researcher to research network.
              </h2>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">

              {[
                {
                  icon: Search,
                  step: '01',
                  title: 'Discover',
                  description:
                    'Find researchers, publications, projects, conferences, and institutions relevant to your field.',
                },
                {
                  icon: Network,
                  step: '02',
                  title: 'Connect',
                  description:
                    'Visualize the relationships between people, organizations, publications, and scientific areas.',
                },
                {
                  icon: Globe2,
                  step: '03',
                  title: 'Collaborate',
                  description:
                    'Use the connected research landscape to uncover new opportunities for scientific collaboration.',
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.step}
                    className="relative text-center"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-navy-600 shadow-md dark:bg-slate-900 dark:text-navy-400">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="mt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-navy-500">
                      Step {item.step}
                    </div>

                    <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mx-auto mt-3 max-w-xs text-xs leading-6 text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            FEATURED RESEARCHERS
        ========================================================= */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-navy-500">
                Research community
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Meet the research network.
              </h2>

              <p className="mt-3 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                Explore researchers and discover the scientific expertise
                represented across the platform.
              </p>
            </div>

            <button
              onClick={() => setActiveView('researchers')}
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-navy-200 hover:text-navy-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-navy-400"
            >
              View Directory ({allResearchers.length})
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            {featured.length === 0 ? (
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="h-11 w-11 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="mt-5 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="mt-6 h-12 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              ))
            ) : (
              featured.map((researcher) => (
                <div
                  key={researcher.researcher_id}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-600 to-navy-450 text-sm font-bold text-white shadow-md">
                        {researcher.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {researcher.name}
                        </h3>

                        <p className="mt-1 truncate text-[10px] font-medium text-slate-400">
                          {researcher.department || 'Academic Researcher'}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-lg bg-navy-50 px-2 py-1 text-[9px] font-bold text-navy-500 dark:bg-navy-950/50">
                      Scholar
                    </span>
                  </div>

                  <p className="mt-6 line-clamp-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                    {researcher.bio ||
                      'Research profile available through the SCN network.'}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                    <span className="text-[9px] font-mono font-semibold text-slate-400">
                      ORCID: {researcher.orcid || 'N/A'}
                    </span>

                    <button
                      onClick={() => setSelectedProfileModal(researcher)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-navy-600 hover:underline dark:text-navy-400"
                    >
                      Profile
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================= */}
        <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">

          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-gradient-to-br from-navy-900 via-navy-800 to-navy-600 px-7 py-14 text-center text-white shadow-2xl sm:px-12 lg:py-20">

            <div className="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <Network className="h-5 w-5 text-cyan-200" />
              </div>

              <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Your next scientific connection could be closer than you think.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">
                Explore the network, discover researchers, and turn scientific
                connections into meaningful collaboration.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setActiveView('researchers')}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-navy-700 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  Explore Researchers
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur transition-all hover:bg-white/15"
                >
                  Join the Network
                </Link>
              </div>
            </div>
          </div>
        </section>
          </>
        )}
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-600 text-white">
              <Network className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Scientific Collaboration Network
              </p>

              <p className="mt-0.5 text-[9px] text-slate-400">
                Connecting people, ideas, and institutions.
              </p>
            </div>
          </div>

          <div className="text-[9px] font-medium text-slate-400">
            © 2026 SCN Platform. All rights reserved.
          </div>
        </div>
      </footer>

      {/* =========================================================
          RESEARCHER PROFILE MODAL (IN-PAGE VIEW)
      ========================================================= */}
      {selectedProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProfileModal(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-600 to-navy-450 text-xl font-extrabold text-white shadow-lg shadow-navy-600/25">
                {selectedProfileModal.name.charAt(0)}
              </div>

              <div className="min-w-0 pr-8">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Signed In Researcher
                  </span>
                </div>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedProfileModal.name}
                </h3>
                <p className="text-xs font-semibold text-navy-600 dark:text-cyan-400">
                  {selectedProfileModal.department || 'Academic Department'} • {getInstitutionName(selectedProfileModal.institution_id)}
                </p>
              </div>
            </div>

            {/* ORCID */}
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              <span className="font-semibold text-navy-600 dark:text-navy-400">ORCID iD:</span>
              <span>{selectedProfileModal.orcid || '0000-0000-0000-0000 (Pending registration)'}</span>
            </div>

            {/* Bio */}
            <div className="mt-5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Biography
              </h4>
              <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
                {selectedProfileModal.bio || 'No detailed biography provided for this researcher profile yet.'}
              </p>
            </div>

            {/* Skills */}
            {selectedProfileModal.skills && selectedProfileModal.skills.length > 0 && (
              <div className="mt-5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Core Skills & Technologies
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedProfileModal.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700 dark:bg-navy-950/60 dark:text-navy-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Research Interests */}
            {selectedProfileModal.research_interests && selectedProfileModal.research_interests.length > 0 && (
              <div className="mt-5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Research Interests
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedProfileModal.research_interests.map((interest, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                onClick={() => setSelectedProfileModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Close
              </button>
              <Link
                to={`/researchers/${selectedProfileModal.researcher_id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-navy-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-navy-600/20 transition-all hover:bg-navy-700"
              >
                Go to Detailed Profile
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PUBLICATION DETAILS MODAL (IN-PAGE VIEW)
      ========================================================= */}
      {selectedPublicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPublicationModal(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-navy-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-navy-600 dark:bg-navy-950/60 dark:text-cyan-400">
                {selectedPublicationModal.publication_type || 'Paper'}
              </span>
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  String(selectedPublicationModal.status).toLowerCase() === 'published'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                }`}
              >
                {selectedPublicationModal.status || 'Active'}
              </span>
            </div>

            {/* Title */}
            <h3 className="mt-4 text-xl font-extrabold leading-snug text-slate-900 dark:text-white">
              {selectedPublicationModal.title}
            </h3>

            {/* Authors */}
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Authors & Collaborators
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {getAuthorNames(selectedPublicationModal)}
              </p>
            </div>

            {/* Meta Info (Date & DOI) */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Publication Date
                </span>
                <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {selectedPublicationModal.publication_date || 'N/A'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  DOI Identifier
                </span>
                <p className="mt-0.5 truncate text-xs font-mono font-semibold text-navy-600 dark:text-cyan-400">
                  {selectedPublicationModal.doi || 'N/A'}
                </p>
              </div>
            </div>

            {/* Abstract */}
            <div className="mt-5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Abstract
              </h4>
              <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
                {selectedPublicationModal.abstract || 'No abstract available for this publication.'}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                onClick={() => setSelectedPublicationModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Close
              </button>
              {selectedPublicationModal.doi && (
                <a
                  href={`https://doi.org/${selectedPublicationModal.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-navy-600/20 transition-all hover:bg-navy-700"
                >
                  Visit DOI
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          COLLABORATION DETAILS MODAL (IN-PAGE VIEW)
      ========================================================= */}
      {selectedCollaborationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCollaborationModal(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-cyan-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                {selectedCollaborationModal.collaboration_type || 'Collaborative Research'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-navy-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-navy-600 dark:bg-navy-950/50 dark:text-navy-300">
                <GitFork className="h-3.5 w-3.5" />
                {selectedCollaborationModal.collaboration_count} Joint {selectedCollaborationModal.collaboration_count === 1 ? 'Work' : 'Works'}
              </span>
            </div>

            {/* Title */}
            <h3 className="mt-4 text-xl font-extrabold leading-snug text-slate-900 dark:text-white">
              Research Partnership Details
            </h3>

            {/* Connected Researchers */}
            <div className="mt-5 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Collaborating Researchers ({selectedCollaborationModal.researcher_ids?.length || 0})
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {getCollaboratorResearchers(selectedCollaborationModal).map((res) => (
                  <div
                    key={res.researcher_id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-600 to-navy-450 text-sm font-bold text-white shadow-sm">
                        {res.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h5 className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {res.name}
                        </h5>
                        <p className="truncate text-[10px] font-medium text-navy-600 dark:text-cyan-400">
                          {res.department || 'Academic Department'}
                        </p>
                        <p className="truncate text-[10px] text-slate-400">
                          {getInstitutionName(res.institution_id)}
                        </p>
                      </div>
                    </div>

                    {res.research_interests && res.research_interests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {res.research_interests.slice(0, 2).map((interest, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-white px-2 py-0.5 text-[9px] font-medium text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Partnership Metrics */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Joint Works
                </span>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedCollaborationModal.collaboration_count} Co-authored papers & projects
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Established
                </span>
                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedCollaborationModal.created_at
                    ? new Date(selectedCollaborationModal.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Active'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                onClick={() => setSelectedCollaborationModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CONFERENCE DETAILS MODAL (IN-PAGE VIEW)
      ========================================================= */}
      {selectedConferenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setSelectedConferenceModal(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-violet-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                Academic Conference
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-navy-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-navy-600 dark:bg-navy-950/50 dark:text-navy-300">
                <BookOpen className="h-3.5 w-3.5" />
                {getConferencePubs(selectedConferenceModal.conference_id).length} Papers
              </span>
            </div>

            {/* Title */}
            <h3 className="mt-4 text-xl font-extrabold leading-snug text-slate-900 dark:text-white">
              {selectedConferenceModal.name}
            </h3>

            {/* Meta info (Location & Dates) */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {selectedConferenceModal.location && (
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Location
                    </span>
                    <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {selectedConferenceModal.location}
                    </p>
                  </div>
                </div>
              )}

              {(selectedConferenceModal.start_date || selectedConferenceModal.end_date) && (
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Dates
                    </span>
                    <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {selectedConferenceModal.start_date}{' '}
                      {selectedConferenceModal.end_date ? `to ${selectedConferenceModal.end_date}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                About Conference
              </h4>
              <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
                {selectedConferenceModal.description ||
                  'No extended conference description provided.'}
              </p>
            </div>

            {/* Presented Papers */}
            {getConferencePubs(selectedConferenceModal.conference_id).length > 0 && (
              <div className="mt-5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Associated Papers in Network
                </h4>
                <div className="mt-2 space-y-2">
                  {getConferencePubs(selectedConferenceModal.conference_id).map((p) => (
                    <div
                      key={p.publication_id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {p.title}
                      </h5>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {getAuthorNames(p)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                onClick={() => setSelectedConferenceModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Close
              </button>
              {selectedConferenceModal.website && (
                <a
                  href={
                    selectedConferenceModal.website.startsWith('http')
                      ? selectedConferenceModal.website
                      : `https://${selectedConferenceModal.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/20 transition-all hover:bg-violet-700"
                >
                  Visit Conference Site
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};