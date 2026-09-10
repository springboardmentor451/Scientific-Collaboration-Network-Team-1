import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import { DashboardService } from '../../services/dashboardService';
import { PublicationService } from '../../services/publicationService';
import { ProjectService } from '../../services/projectService';
import type { ResearcherDashboard, Publication, Project } from '../../types';
import { 
  FileText, FolderGit2, GitFork, Award, Plus, ArrowRight,
  TrendingUp, Calendar, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, researcher } = useAuth();

  const [dashboardData, setDashboardData] = useState<ResearcherDashboard | null>(null);
  const [recentPubs, setRecentPubs] = useState<Publication[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!researcher) {
      setLoading(false);
      return; // Awaiting profile creation
    }

    setLoading(true);
    Promise.all([
      DashboardService.getResearcherDashboard(user!.user_id),
      PublicationService.getByResearcher(researcher.researcher_id),
      ProjectService.getByResearcher(researcher.researcher_id)
    ]).then(([dash, pubs, projs]) => {
      setDashboardData(dash);
      setRecentPubs(pubs.slice(0, 3));
      setActiveProjects(projs.filter(p => p.status === 'active').slice(0, 3));
    }).catch(err => {
      console.error("Error loading dashboard data:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, [user, researcher]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-500 text-sm font-medium">Assembling your analytics dashboard...</span>
      </div>
    );
  }

  // Redirect prompt if profile does not exist
  if (!researcher) {
    return (
      <div className="p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-center max-w-xl mx-auto space-y-6 mt-10">
        <div className="w-16 h-16 rounded-full bg-navy-50 dark:bg-navy-950 flex items-center justify-center mx-auto text-navy-600 dark:text-navy-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Create Researcher Profile</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Welcome to the Scientific Collaboration Network! You must set up your academic profile details (name, department, skills, and ORCID) before you can log publications, create projects, or analyze collaboration edges.
          </p>
        </div>
        <Link 
          to="/profile/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-navy-600 hover:bg-navy-500 text-white font-bold rounded-xl shadow-lg shadow-navy-500/10 transition-all hover:scale-[1.02]"
        >
          Setup Profile Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Analytics Chart Data formatting
  const pubTypeData = dashboardData?.publication_stats.by_type 
    ? Object.keys(dashboardData.publication_stats.by_type).map(key => ({
        name: key.toUpperCase(),
        value: dashboardData.publication_stats.by_type[key]
      }))
    : [];



  // Hardcoded timeline simulation for trend visual
  const publicationActivityData = [
    { year: '2023', publications: 0, citations: 2 },
    { year: '2024', publications: 1, citations: 5 },
    { year: '2025', publications: 2, citations: 12 },
    { year: '2026', publications: recentPubs.length, citations: dashboardData?.citation_count || 18 }
  ];

  const PIE_COLORS = ['#2156a1', '#6488bd', '#a7bad9', '#cbd5e1', '#e2e8f0'];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Greetings header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good morning, {researcher.name}</h1>
          <p className="text-slate-500 text-sm">Here's a visual summary of your academic footprint and co-authors.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/publications/new" className="px-4 py-2 bg-navy-600 hover:bg-navy-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-navy-500/10 transition-all hover:scale-[1.02]">
            <Plus className="w-4 h-4" /> Log Publication
          </Link>
          <Link to="/projects/new" className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Stat Card: Publications */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-navy-50 dark:bg-navy-950/40 rounded-xl flex items-center justify-center text-navy-600 dark:text-navy-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">{dashboardData?.publication_stats.total || 0}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Publications</p>
          </div>
        </div>

        {/* Stat Card: Active Projects */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-navy-50 dark:bg-navy-950/40 rounded-xl flex items-center justify-center text-navy-600 dark:text-navy-400">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">{dashboardData?.project_stats.active || 0}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Projects</p>
          </div>
        </div>

        {/* Stat Card: Collaborations */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-navy-50 dark:bg-navy-950/40 rounded-xl flex items-center justify-center text-navy-600 dark:text-navy-400">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">{dashboardData?.collaboration_count || 0}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collaborators</p>
          </div>
        </div>

        {/* Stat Card: Citations */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-navy-50 dark:bg-navy-950/40 rounded-xl flex items-center justify-center text-navy-600 dark:text-navy-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">{dashboardData?.citation_count || 0}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Citations</p>
          </div>
        </div>

      </div>

      {/* Recharts Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Publication Activity & Citations Growth */}
        <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-navy-600" />
              Publications & Citations Growth
            </h3>
            <Link to="/citations" className="text-xs text-navy-500 hover:underline">Full Analytics</Link>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={publicationActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="publications" stroke="#2156a1" strokeWidth={2.5} name="Publications" />
                <Line type="monotone" dataKey="citations" stroke="#10b981" strokeWidth={2.5} name="Citations" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Publication Status/Types */}
        <div className="lg:col-span-4 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="font-bold text-sm">Portfolio Distribution</h3>
          </div>
          <div className="h-64 w-full text-xs flex flex-col items-center justify-center">
            {pubTypeData.length === 0 ? (
              <div className="text-center text-slate-400 py-10">No publications added yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={pubTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pubTypeData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2 text-[10px]">
              {pubTypeData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="font-medium text-slate-600 dark:text-slate-400 capitalize">{item.name.toLowerCase()} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Recent Publications & Active Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Recent Publications Table Card */}
        <div className="md:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">Recent Publications</h3>
            <Link to="/publications" className="text-xs text-navy-500 hover:underline">View All</Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentPubs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-3">
                <p>No publications registered.</p>
                <Link to="/publications/new" className="inline-flex items-center text-navy-500 hover:underline">Log your first publication &rarr;</Link>
              </div>
            ) : (
              <table className="w-full text-left text-xs divide-y divide-slate-150 dark:divide-slate-800">
                <thead>
                  <tr className="text-slate-450 font-semibold pb-2">
                    <th className="py-2">Title</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Date</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {recentPubs.map(p => (
                    <tr key={p.publication_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="py-3 font-semibold max-w-[200px] truncate pr-3">
                        <Link to={`/publications/${p.publication_id}`} className="hover:text-navy-600 dark:hover:text-navy-400">{p.title}</Link>
                      </td>
                      <td className="py-3 capitalize text-slate-500">{p.publication_type}</td>
                      <td className="py-3 text-slate-550">{p.publication_date || 'N/A'}</td>
                      <td className="py-3 text-right">
                        <Link to={`/publications/${p.publication_id}`} className="text-navy-600 dark:text-navy-400 hover:underline">Details</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Active Projects Widget Card */}
        <div className="md:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">Active Projects</h3>
            <Link to="/projects" className="text-xs text-navy-500 hover:underline">View All</Link>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {activeProjects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <p>No active projects.</p>
                <Link to="/projects/new" className="text-navy-500 hover:underline">Create a project &rarr;</Link>
              </div>
            ) : (
              activeProjects.map(proj => (
                <div key={proj.project_id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-slate-200 dark:hover:border-slate-750 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{proj.name}</h5>
                    <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-1.5 py-0.5 rounded capitalize font-semibold">Active</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{proj.description}</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-50 dark:border-slate-850 flex justify-between items-center text-[9px] text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Ends: {proj.end_date || 'Ongoing'}</span>
                    <Link to={`/projects/${proj.project_id}`} className="text-navy-550 font-semibold hover:underline">Timeline</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
