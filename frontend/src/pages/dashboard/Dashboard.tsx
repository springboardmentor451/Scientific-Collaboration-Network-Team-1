import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/Auth';
import { DashboardService } from '../../services/dashboardService';
import { PublicationService } from '../../services/publicationService';
import { ProjectService } from '../../services/projectService';
import { type ResearcherDashboard, type Publication, type Project, UserRole } from '../../types';
import { AdminDashboard } from '../admin/AdminDashboard';

import {
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Info,
  ArrowUpRight,
  BookOpen,
  Users,
  FolderKanban,
  Quote,
  Sparkles,
  ExternalLink,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, researcher } = useAuth();

  const [dashboardData, setDashboardData] =
    useState<ResearcherDashboard | null>(null);

  const [recentPubs, setRecentPubs] = useState<Publication[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!researcher) {
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      DashboardService.getMyDashboard(),
      PublicationService.getMine(),
      ProjectService.getMine(),
    ])
      .then(([dash, pubs, projs]) => {
        setDashboardData(dash);
        setRecentPubs(pubs.slice(0, 5));
        setActiveProjects(
          projs.filter((p) => p.status === 'active').slice(0, 4)
        );
      })
      .catch((err) => {
        console.error('Error loading dashboard data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, researcher]);

  if (user?.role === UserRole.SYSTEM_ADMIN) {
    return <AdminDashboard />;
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-navy-50 dark:bg-navy-900/40 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-navy-600 dark:text-navy-450" />
            </div>

            <div className="absolute -inset-1 rounded-2xl border-2 border-navy-200 dark:border-navy-700 border-t-navy-600 animate-spin" />
          </div>

          <div className="text-center">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Preparing your research workspace
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Loading academic insights...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!researcher) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 md:p-10 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-navy-50 dark:bg-navy-950/50" />

            <div className="relative w-full h-full rounded-2xl flex items-center justify-center text-navy-600 dark:text-navy-450">
              <AlertCircle className="w-9 h-9" />
            </div>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full bg-navy-50 dark:bg-navy-950/40 text-navy-600 dark:text-navy-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            Researcher profile
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Complete your research profile
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-6 mt-3 max-w-md mx-auto">
            Set up your academic profile to start managing publications,
            projects, collaborations and research impact.
          </p>

          <Link
            to="/profile/create"
            className="mt-7 inline-flex items-center gap-2 px-5 py-3 bg-navy-600 hover:bg-navy-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-navy-600/10 transition-all hover:-translate-y-0.5"
          >
            Set Up Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const pubTypeData = dashboardData?.publication_stats?.by_type
    ? Object.keys(dashboardData.publication_stats.by_type).map((key) => ({
      name: key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      count: dashboardData.publication_stats.by_type[key],
    }))
    : [];

  /*
   * We intentionally avoid inventing historical growth percentages here.
   * The chart uses the information currently available to the dashboard.
   */
  const currentYear = new Date().getFullYear();

  const publicationActivityData = [
    {
      year: String(currentYear),
      publications: dashboardData?.publication_stats?.total || 0,
      citations: dashboardData?.citation_count || 0,
    },
  ];

  const firstName = researcher.name;

  const totalPublications =
    dashboardData?.publication_stats?.total || recentPubs.length || 0;

  const totalCitations = dashboardData?.citation_count || 0;

  const totalCollaborators = dashboardData?.collaboration_count || 0;

  const activeProjectCount = dashboardData?.project_stats?.active || 0;

  const completedProjects = dashboardData?.project_stats?.completed || 0;

  return (
    <div className="space-y-7 pb-10">

      {/* =========================================================
          HERO HEADER
      ========================================================= */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-600 p-7 md:p-9 text-white shadow-xl">
        {/* Decorative background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-navy-450/10 blur-3xl" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7">
          <div className="max-w-2xl">

            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-semibold uppercase tracking-widest text-white/80">
                <Sparkles className="w-3.5 h-3.5" />
                Research Intelligence
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {firstName}
            </h1>

            <p className="mt-3 text-sm md:text-base text-white/65 leading-6 max-w-xl">
              Track your scholarly output, research impact, projects and
              collaboration network from one workspace.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                to="/publications/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-navy-800 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Publication
              </Link>

              <Link
                to="/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl text-xs font-semibold transition-all"
              >
                <FolderKanban className="w-4 h-4" />
                Create Project
              </Link>
            </div>
          </div>

          {/* Profile summary */}
          <div className="w-full xl:w-auto">
            <div className="min-w-[260px] bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-5">
              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/10 flex items-center justify-center text-lg font-bold">
                  {firstName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {researcher.name || firstName}
                  </p>

                  <p className="text-xs text-white/55 mt-0.5">
                    Researcher
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/45">
                    Publications
                  </p>
                  <p className="text-lg font-bold mt-1">
                    {totalPublications}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/45">
                    Citations
                  </p>
                  <p className="text-lg font-bold mt-1">
                    {totalCitations}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          KPI CARDS
      ========================================================= */}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Publications */}
        <div className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Publications
              </p>

              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
                {totalPublications}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-navy-50 dark:bg-navy-950/40 text-navy-600 dark:text-navy-450 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>Academic output</span>
          </div>

          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-navy-50 dark:bg-navy-950/20 group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* Citations */}
        <div className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Citations
              </p>

              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
                {totalCitations}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-navy-500 flex items-center justify-center">
              <Quote className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-navy-500" />
            <span>Research impact</span>
          </div>

          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-navy-50 dark:bg-navy-950/20 group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* Collaborators */}
        <div className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Collaborators
              </p>

              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
                {totalCollaborators}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
            <span>Network connections</span>
          </div>

          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-cyan-50 dark:bg-cyan-950/20 group-hover:scale-150 transition-transform duration-500" />
        </div>

        {/* Projects */}
        <div className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Active Projects
              </p>

              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
                {activeProjectCount}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-emerald-500" />
            <span>{completedProjects} completed</span>
          </div>

          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/20 group-hover:scale-150 transition-transform duration-500" />
        </div>

      </section>

      {/* =========================================================
          QUICK INSIGHT
      ========================================================= */}

      <section className="relative overflow-hidden bg-navy-50/70 dark:bg-navy-950/20 border border-navy-100 dark:border-navy-900/50 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">

          <div className="w-11 h-11 shrink-0 rounded-xl bg-white dark:bg-slate-900 border border-navy-100 dark:border-navy-900 flex items-center justify-center text-navy-600 dark:text-navy-450">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Research workspace overview
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-5">
              You currently have{' '}
              <span className="font-semibold text-navy-600 dark:text-navy-450">
                {totalPublications} publications
              </span>
              ,{' '}
              <span className="font-semibold text-navy-600 dark:text-navy-450">
                {totalCitations} citations
              </span>
              , and{' '}
              <span className="font-semibold text-navy-600 dark:text-navy-450">
                {totalCollaborators} collaborators
              </span>{' '}
              tracked in your research workspace.
            </p>
          </div>

          <Link
            to="/reports"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-navy-300 dark:hover:border-navy-700 transition-colors"
          >
            View Reports
            <ChevronRight className="w-4 h-4" />
          </Link>

        </div>
      </section>

      {/* =========================================================
          ANALYTICS
      ========================================================= */}

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* Main chart */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy-600 dark:text-navy-450">
                Analytics
              </p>

              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Research impact overview
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Current publication and citation metrics
              </p>
            </div>

            <Link
              to="/citations"
              className="inline-flex items-center gap-1 text-xs font-semibold text-navy-600 dark:text-navy-450 hover:gap-2 transition-all"
            >
              Explore citations
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

          </div>

          <div className="h-72 p-5">

            {publicationActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={publicationActivityData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="year"
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    }}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="publications"
                    stroke="#123B63"
                    strokeWidth={3}
                    name="Publications"
                    dot={{
                      r: 5,
                      fill: '#123B63',
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="citations"
                    stroke="#167D9A"
                    strokeWidth={3}
                    name="Citations"
                    dot={{
                      r: 5,
                      fill: '#167D9A',
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No analytics available yet.
              </div>
            )}

          </div>
        </div>

        {/* Publication distribution */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-navy-600 dark:text-navy-450">
              Portfolio
            </p>

            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Publication types
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Distribution of your research output
            </p>
          </div>

          <div className="h-72 p-5">

            {pubTypeData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">

                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                </div>

                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No publication data
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Add publications to see the distribution.
                </p>

              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pubTypeData}
                  margin={{
                    top: 10,
                    right: 5,
                    left: -20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />

                  <Bar
                    dataKey="count"
                    fill="#167D9A"
                    radius={[7, 7, 0, 0]}
                    name="Publications"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

          </div>
        </div>
      </section>

      {/* =========================================================
          RECENT PUBLICATIONS + PROJECTS
      ========================================================= */}

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* Publications */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy-600 dark:text-navy-450">
                Research Output
              </p>

              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Recent publications
              </h2>
            </div>

            <Link
              to="/publications"
              className="inline-flex items-center gap-1 text-xs font-semibold text-navy-600 dark:text-navy-450 hover:gap-2 transition-all"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

          </div>

          <div className="overflow-x-auto">

            {recentPubs.length === 0 ? (
              <div className="py-16 px-6 text-center">

                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 mx-auto flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-slate-400" />
                </div>

                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-4">
                  No publications yet
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Start building your academic portfolio.
                </p>

                <Link
                  to="/publications/new"
                  className="inline-flex items-center gap-1.5 mt-5 text-xs font-bold text-navy-600 dark:text-navy-450 hover:underline"
                >
                  Add your first publication
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

              </div>
            ) : (
              <table className="w-full text-left">

                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400">

                    <th className="px-6 py-3 font-bold">
                      Publication
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Type
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Date
                    </th>

                    <th className="px-6 py-3 font-bold text-right">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {recentPubs.map((publication) => (
                    <tr
                      key={publication.publication_id}
                      className="group border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >

                      <td className="px-6 py-4 max-w-[360px]">

                        <Link
                          to={`/publications/${publication.publication_id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-9 h-9 shrink-0 rounded-lg bg-navy-50 dark:bg-navy-950/40 flex items-center justify-center text-navy-600 dark:text-navy-450">
                            <BookOpen className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-navy-600 dark:group-hover:text-navy-450 transition-colors">
                              {publication.title}
                            </p>

                            <p className="text-[10px] text-slate-400 mt-1">
                              Scientific publication
                            </p>
                          </div>
                        </Link>

                      </td>

                      <td className="px-4 py-4">

                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 capitalize">
                          {publication.publication_type?.replace(
                            /_/g,
                            ' '
                          ) || 'Publication'}
                        </span>

                      </td>

                      <td className="px-4 py-4">

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {publication.publication_date || 'N/A'}
                        </div>

                      </td>

                      <td className="px-6 py-4 text-right">

                        <Link
                          to={`/publications/${publication.publication_id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-navy-600 dark:text-navy-450 hover:gap-2 transition-all"
                        >
                          Details
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>
        </div>

        {/* Projects */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy-600 dark:text-navy-450">
                Research Work
              </p>

              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Active projects
              </h2>
            </div>

            <Link
              to="/projects"
              className="text-xs font-semibold text-navy-600 dark:text-navy-450"
            >
              View all
            </Link>

          </div>

          <div className="p-5 space-y-3">

            {activeProjects.length === 0 ? (
              <div className="py-10 text-center">

                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 mx-auto flex items-center justify-center">
                  <FolderKanban className="w-6 h-6 text-slate-400" />
                </div>

                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 mt-4">
                  No active projects
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Start a new research initiative.
                </p>

                <Link
                  to="/projects/new"
                  className="inline-flex items-center gap-1.5 mt-5 text-xs font-bold text-navy-600 dark:text-navy-450"
                >
                  Create project
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

              </div>
            ) : (
              activeProjects.map((project) => (
                <Link
                  key={project.project_id}
                  to={`/projects/${project.project_id}`}
                  className="group block p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-navy-200 dark:hover:border-navy-700 hover:shadow-sm bg-slate-50/40 dark:bg-slate-950/20 hover:bg-white dark:hover:bg-slate-900 transition-all"
                >
                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 shrink-0 rounded-lg bg-navy-50 dark:bg-navy-950/40 flex items-center justify-center text-navy-600 dark:text-navy-450">
                      <FolderKanban className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">

                        <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-navy-600 dark:group-hover:text-navy-450 transition-colors">
                          {project.name}
                        </h3>

                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                          Active
                        </span>

                      </div>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-5 mt-1.5">
                        {project.description ||
                          'No project description available.'}
                      </p>

                      <div className="flex items-center gap-1 mt-3 text-[10px] font-semibold text-navy-600 dark:text-navy-450 opacity-0 group-hover:opacity-100 transition-opacity">
                        Open project
                        <ArrowRight className="w-3 h-3" />
                      </div>

                    </div>
                  </div>
                </Link>
              ))
            )}

          </div>
        </div>

      </section>

    </div>
  );
};