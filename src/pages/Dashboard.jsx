import React from "react";
import MainLayout from "../components/layout/MainLayout";
import { useData } from "../context/DataContext";
import {
  Users,
  BookOpen,
  Quote,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Calendar,
  WalletCards,
  BarChart3,
  FolderKanban,
  Activity,
  Clock3,
  CheckCircle2,
} from "lucide-react";

export default function Dashboard() {
  const {
    researchers = [],
    publications = [],
    conferences = [],
    projects = [],
    collaborations = [],
    openDetailModal,
  } = useData();

  const totalCitations = publications.reduce(
    (acc, curr) => acc + (curr.citations || 0),
    0
  );

  const totalFunding = projects.reduce(
    (acc, project) =>
      acc +
      Number(
        project.funding ||
          project.amount ||
          project.budget ||
          0
      ),
    0
  );

  const formatFunding = (value) => {
    if (!value) return "₹22.8L";

    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    }

    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }

    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }

    return `₹${value.toLocaleString()}`;
  };

  const monthlyPublicationData = [
    { month: "Jan", value: 4 },
    { month: "Feb", value: 6 },
    { month: "Mar", value: 5 },
    { month: "Apr", value: 8 },
    { month: "May", value: 7 },
    { month: "Jun", value: 10 },
    { month: "Jul", value: 9 },
    { month: "Aug", value: 12 },
    { month: "Sep", value: 10 },
    { month: "Oct", value: 13 },
    { month: "Nov", value: 11 },
    { month: "Dec", value: 14 },
  ];

  const departmentData = [
    { name: "Artificial Intelligence", value: 32 },
    { name: "Data Science", value: 24 },
    { name: "Computer Science", value: 20 },
    { name: "Life Sciences", value: 14 },
    { name: "Engineering", value: 10 },
  ];

  const activityFeed = [
    {
      icon: BookOpen,
      title: "New publication added",
      description:
        "Research publication was added to the network.",
      time: "2 hours ago",
    },
    {
      icon: Users,
      title: "Researcher profile updated",
      description:
        "A researcher completed their profile.",
      time: "5 hours ago",
    },
    {
      icon: FolderKanban,
      title: "Project activity recorded",
      description:
        "A research project received an update.",
      time: "Yesterday",
    },
    {
      icon: Activity,
      title: "Collaboration activity",
      description:
        "New research collaboration was identified.",
      time: "Yesterday",
    },
  ];

  return (
    <MainLayout title="Dashboard Overview">

      {/* =====================================================
          DASHBOARD THEME
      ====================================================== */}

      <style>{`
        .scicollab-glass {
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.85);
          box-shadow:
            0 8px 30px rgba(148, 163, 184, 0.10),
            0 2px 8px rgba(236, 72, 153, 0.04);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .scicollab-glass:hover {
          box-shadow:
            0 12px 35px rgba(148, 163, 184, 0.14),
            0 3px 12px rgba(236, 72, 153, 0.06);
        }

        .scicollab-soft {
          background:
            linear-gradient(
              135deg,
              rgba(252, 231, 243, 0.72),
              rgba(239, 246, 255, 0.72)
            );
          border: 1px solid rgba(255, 255, 255, 0.9);
        }

        .scicollab-gradient {
          background:
            linear-gradient(
              135deg,
              #ec4899 0%,
              #a855f7 48%,
              #3b82f6 100%
            );
        }

        .scicollab-gradient-soft {
          background:
            linear-gradient(
              135deg,
              rgba(236, 72, 153, 0.10),
              rgba(168, 85, 247, 0.09),
              rgba(59, 130, 246, 0.10)
            );
        }
      `}</style>


      {/* =====================================================
          HERO / OVERVIEW
      ====================================================== */}

      <div className="relative overflow-hidden rounded-3xl mb-7 p-7 md:p-8 shadow-xl shadow-pink-100/40 scicollab-gradient">

        {/* Decorative glass circles */}

        <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -left-20 -bottom-28 w-72 h-72 rounded-full bg-blue-300/10 blur-3xl" />

        <div className="absolute right-1/3 bottom-[-100px] w-52 h-52 rounded-full bg-orange-300/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

          <div className="max-w-3xl">

            <div className="flex items-center gap-2 mb-4">

              <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>

              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/80">
                Research Intelligence Workspace
              </span>

            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Research overview at a glance
            </h2>

            <p className="text-sm text-white/75 mt-3 leading-6 max-w-2xl">
              Monitor publications, researchers, projects,
              collaborations, funding and research activity
              from one connected workspace.
            </p>

          </div>


          {/* Platform status */}

          <div className="shrink-0">

            <div className="px-5 py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-lg">

              <div className="flex items-center gap-2">

                <Activity className="w-4 h-4 text-white/80" />

                <span className="text-xs font-semibold text-white">
                  Platform Status
                </span>

              </div>

              <div className="flex items-center gap-2 mt-3">

                <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-sm shadow-emerald-200" />

                <span className="text-[11px] text-white/70">
                  Research network active
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">

        {/* Researchers */}

        <KpiCard
          label="Active Researchers"
          value={researchers.length}
          icon={Users}
          iconStyle="bg-pink-50 text-pink-600"
          progress="78%"
          progressStyle="bg-pink-400"
          statusIcon={TrendingUp}
          status="Fully onboarded"
          statusStyle="text-emerald-500"
        />


        {/* Publications */}

        <KpiCard
          label="Total Publications"
          value={publications.length}
          icon={BookOpen}
          iconStyle="bg-purple-50 text-purple-600"
          progress="72%"
          progressStyle="bg-purple-400"
          statusIcon={CheckCircle2}
          status="Peer reviewed"
          statusStyle="text-purple-500"
        />


        {/* Citations */}

        <KpiCard
          label="Total Citations"
          value={totalCitations.toLocaleString()}
          icon={Quote}
          iconStyle="bg-blue-50 text-blue-600"
          progress="68%"
          progressStyle="bg-blue-400"
          statusIcon={Sparkles}
          status="High research impact"
          statusStyle="text-blue-500"
        />


        {/* Funding */}

        <KpiCard
          label="Research Funding"
          value={formatFunding(totalFunding)}
          icon={WalletCards}
          iconStyle="bg-orange-50 text-orange-600"
          progress="62%"
          progressStyle="bg-orange-400"
          statusIcon={TrendingUp}
          status="Active grants"
          statusStyle="text-orange-500"
        />

      </div>


      {/* =====================================================
          PUBLICATION TREND + FUNDING
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-7">

        {/* Publication Trend */}

        <div className="xl:col-span-2 scicollab-glass rounded-3xl p-6 transition-all">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

            <div>

              <div className="flex items-center gap-2">

                <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>

                <h2 className="text-base font-bold text-slate-800">
                  Publication Trend
                </h2>

              </div>

              <p className="text-xs text-slate-500 mt-2">
                Monthly research publications
              </p>

            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-3 py-1.5 rounded-lg">
              Current Year
            </span>

          </div>


          <div className="h-56 flex items-end gap-2 sm:gap-3 border-b border-slate-100 pb-2">

            {monthlyPublicationData.map((item) => (

              <div
                key={item.month}
                className="flex-1 h-full flex flex-col items-center justify-end gap-2"
              >

                <div className="w-full flex items-end justify-center h-full">

                  <div
                    className="w-full max-w-8 rounded-t-md bg-gradient-to-t from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 transition-all"
                    style={{
                      height: `${(item.value / 14) * 100}%`,
                    }}
                    title={`${item.value} publications`}
                  />

                </div>

                <span className="text-[9px] text-slate-400">
                  {item.month}
                </span>

              </div>

            ))}

          </div>


          <div className="flex items-center justify-between mt-4">

            <div className="flex items-center gap-2">

              <span className="w-2 h-2 rounded-full bg-pink-400" />

              <span className="text-[11px] text-slate-500">
                Publications
              </span>

            </div>

            <span className="text-xs font-semibold text-slate-600">
              Research activity
            </span>

          </div>

        </div>


        {/* Funding Overview */}

        <div className="scicollab-glass rounded-3xl p-6 transition-all">

          <div className="flex items-center gap-2 mb-2">

            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <WalletCards className="w-4 h-4" />
            </div>

            <h2 className="text-base font-bold text-slate-800">
              Funding Overview
            </h2>

          </div>

          <p className="text-xs text-slate-500 mb-6">
            Distribution of research funding
          </p>


          <FundingBar
            label="Government Grants"
            value="42%"
            width="42%"
            style="bg-pink-400"
          />

          <FundingBar
            label="University Funding"
            value="28%"
            width="28%"
            style="bg-purple-400"
          />

          <FundingBar
            label="Industry Grants"
            value="20%"
            width="20%"
            style="bg-blue-400"
          />

          <FundingBar
            label="Other Sources"
            value="10%"
            width="10%"
            style="bg-orange-400"
          />


          <div className="mt-7 pt-5 border-t border-slate-100">

            <div className="flex items-center justify-between">

              <span className="text-xs text-slate-500">
                Total funding
              </span>

              <span className="text-sm font-bold text-slate-800">
                {formatFunding(totalFunding)}
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          DEPARTMENT PUBLICATIONS
      ====================================================== */}

      <div className="scicollab-glass rounded-3xl p-6 transition-all mb-7">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

          <div>

            <div className="flex items-center gap-2">

              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>

              <h2 className="text-base font-bold text-slate-800">
                Department Publications
              </h2>

            </div>

            <p className="text-xs text-slate-500 mt-2">
              Publication distribution across research areas
            </p>

          </div>

          <span className="text-xs text-slate-400">
            Research distribution
          </span>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">

          {departmentData.map((department, index) => (

            <div key={department.name}>

              <div className="flex items-center justify-between mb-2">

                <span className="text-xs font-semibold text-slate-600">
                  {department.name}
                </span>

                <span className="text-xs font-bold text-slate-500">
                  {department.value}%
                </span>

              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className={`h-full rounded-full ${
                    index % 4 === 0
                      ? "bg-pink-400"
                      : index % 4 === 1
                      ? "bg-purple-400"
                      : index % 4 === 2
                      ? "bg-blue-400"
                      : "bg-orange-400"
                  }`}
                  style={{
                    width: `${department.value}%`,
                  }}
                />

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


        {/* Recent Publications */}

        <div className="xl:col-span-2 scicollab-glass rounded-3xl p-6 transition-all">

          <div className="flex items-center justify-between mb-6">

            <div>

              <div className="flex items-center gap-2">

                <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>

                <h2 className="text-base font-bold text-slate-800">
                  Recent Publications
                </h2>

              </div>

              <p className="text-xs text-slate-500 mt-2">
                Click any paper to view abstract and DOI details.
              </p>

            </div>

            <span className="text-xs font-semibold text-pink-500">
              {publications.length} total
            </span>

          </div>


          {publications.length > 0 ? (

            <div className="space-y-3">

              {publications.slice(0, 6).map((paper) => (

                <div
                  key={paper.id}
                  onClick={() =>
                    openDetailModal("paper", paper)
                  }
                  className="p-4 rounded-2xl border border-slate-100 bg-white/50 hover:bg-pink-50/50 hover:border-pink-200 transition-all cursor-pointer flex items-center justify-between group"
                >

                  <div className="pr-4 min-w-0">

                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider bg-pink-50 px-2.5 py-1 rounded-md mb-1.5 inline-block border border-pink-100">
                      {paper.field || "Research"}
                    </span>

                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-pink-600 transition-colors">
                      {paper.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      {paper.journal || "Research Journal"}
                      {" • "}
                      <span className="font-medium text-slate-600">
                        {paper.year || "2026"}
                      </span>
                    </p>

                  </div>


                  <div className="flex items-center space-x-3 shrink-0">

                    <span className="hidden sm:inline-flex text-xs font-semibold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full border border-slate-100">
                      {paper.citations || 0} citations
                    </span>

                    <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-pink-600 group-hover:bg-pink-50 transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <EmptyState
              icon={BookOpen}
              text="No publications available"
              description="Publications will appear here once added."
            />

          )}

        </div>


        {/* Top Researchers */}

        <div className="scicollab-glass rounded-3xl p-6 transition-all">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h2 className="text-base font-bold text-slate-800">
                Top Researchers
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Highest research impact
              </p>

            </div>

            <Users className="w-4 h-4 text-pink-500" />

          </div>


          {researchers.length > 0 ? (

            <div className="space-y-3">

              {researchers
                .slice()
                .sort(
                  (a, b) =>
                    (b.hIndex || 0) -
                    (a.hIndex || 0)
                )
                .slice(0, 5)
                .map((person, index) => (

                  <div
                    key={person.id}
                    onClick={() =>
                      openDetailModal(
                        "researcher",
                        person
                      )
                    }
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50/50 border border-transparent hover:border-pink-100 cursor-pointer transition-all"
                  >

                    <div className="flex items-center gap-3 min-w-0">

                      <span className="text-[10px] font-bold text-slate-400 w-4">
                        #{index + 1}
                      </span>

                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-100"
                      />

                      <div className="min-w-0">

                        <p className="text-xs font-bold text-slate-800 truncate">
                          {person.name}
                        </p>

                        <p className="text-[10px] text-slate-500 truncate">
                          {person.department}
                        </p>

                      </div>

                    </div>

                    <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100 shrink-0">
                      h-{person.hIndex || 0}
                    </span>

                  </div>

                ))}

            </div>

          ) : (

            <EmptyState
              icon={Users}
              text="No researchers available."
            />

          )}

        </div>


        {/* Active Projects */}

        <DashboardCard
          title="Active Projects"
          description="Current research initiatives"
          icon={FolderKanban}
          iconStyle="bg-purple-50 text-purple-500"
        >

          {projects.length > 0 ? (

            <div className="space-y-3">

              {projects.slice(0, 4).map((project) => (

                <div
                  key={project.id}
                  className="p-3 rounded-2xl bg-purple-50/40 border border-purple-100/70"
                >

                  <div className="flex items-center justify-between gap-3">

                    <p className="text-xs font-bold text-slate-800 truncate">
                      {project.title ||
                        project.name ||
                        "Research Project"}
                    </p>

                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      {project.status || "Active"}
                    </span>

                  </div>

                  <div className="mt-3 h-1.5 rounded-full bg-white overflow-hidden">

                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                      style={{
                        width: `${project.progress || 65}%`,
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <EmptyState
              icon={FolderKanban}
              text="No active projects available."
            />

          )}

        </DashboardCard>


        {/* Conferences */}

        <DashboardCard
          title="Conferences"
          description="Upcoming research events"
          icon={Calendar}
          iconStyle="bg-blue-50 text-blue-500"
        >

          {conferences.length > 0 ? (

            <div className="space-y-3">

              {conferences.slice(0, 4).map((conf) => (

                <div
                  key={conf.id}
                  onClick={() =>
                    openDetailModal(
                      "conference",
                      conf
                    )
                  }
                  className="p-3 rounded-2xl border border-blue-100 bg-blue-50/30 hover:bg-blue-50/60 cursor-pointer transition-all"
                >

                  <div className="flex items-center justify-between gap-2">

                    <p className="text-xs font-bold text-slate-800">
                      {conf.acronym}
                    </p>

                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {conf.status || "Upcoming"}
                    </span>

                  </div>

                  <div className="flex items-center gap-1.5 mt-2">

                    <Clock3 className="w-3 h-3 text-slate-400" />

                    <p className="text-[10px] text-slate-500">
                      {conf.date}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <EmptyState
              icon={Calendar}
              text="No upcoming conferences."
            />

          )}

        </DashboardCard>


        {/* Activity */}

        <DashboardCard
          title="Activity Feed"
          description="Recent workspace activity"
          icon={Activity}
          iconStyle="bg-orange-50 text-orange-500"
        >

          <div className="space-y-5">

            {activityFeed.map((activity, index) => {

              const Icon = activity.icon;

              return (

                <div
                  key={index}
                  className="flex gap-3"
                >

                  <div className="relative">

                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {index !== activityFeed.length - 1 && (

                      <div className="absolute left-1/2 top-9 w-px h-7 bg-orange-100" />

                    )}

                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-xs font-semibold text-slate-700">
                      {activity.title}
                    </p>

                    <p className="text-[10px] text-slate-400 mt-1 leading-4">
                      {activity.description}
                    </p>

                    <p className="text-[9px] text-slate-400 mt-1">
                      {activity.time}
                    </p>

                  </div>

                </div>

              );
            })}

          </div>

        </DashboardCard>


        {/* =====================================================
            COLLABORATION SUMMARY
        ====================================================== */}

        <div className="xl:col-span-3 scicollab-glass rounded-3xl p-6 transition-all">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

            <div>

              <div className="flex items-center gap-2">

                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 text-purple-500 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-800">
                    Collaboration Summary
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Overview of the connected research network
                  </p>

                </div>

              </div>

            </div>


            <div className="flex items-center gap-2">

              <div className="w-2 h-2 rounded-full bg-emerald-400" />

              <span className="text-[11px] font-semibold text-slate-500">
                Network active
              </span>

            </div>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <SummaryBox
              label="Collaborations"
              value={collaborations.length || 12}
              description="Active research connections"
              icon={Users}
              iconStyle="text-pink-500"
            />

            <SummaryBox
              label="Projects"
              value={projects.length || 8}
              description="Research initiatives"
              icon={FolderKanban}
              iconStyle="text-purple-500"
            />

            <SummaryBox
              label="Conferences"
              value={conferences.length}
              description="Connected research events"
              icon={Calendar}
              iconStyle="text-blue-500"
            />

          </div>

        </div>

      </div>

    </MainLayout>
  );
}


/* ============================================================
   REUSABLE DASHBOARD COMPONENTS
============================================================ */

function KpiCard({
  label,
  value,
  icon: Icon,
  iconStyle,
  progress,
  progressStyle,
  statusIcon: StatusIcon,
  status,
  statusStyle,
}) {
  return (
    <div className="scicollab-glass rounded-3xl p-5 transition-all duration-200">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">
            {label}
          </p>

          <p className="text-3xl font-bold text-slate-800 mt-2">
            {value}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconStyle}`}
        >
          <Icon className="w-5 h-5" />
        </div>

      </div>


      <div className="flex items-center gap-1.5 mt-4">

        <StatusIcon className={`w-3.5 h-3.5 ${statusStyle}`} />

        <span className="text-[11px] font-semibold text-slate-500">
          {status}
        </span>

      </div>


      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">

        <div
          className={`h-full rounded-full ${progressStyle}`}
          style={{ width: progress }}
        />

      </div>

    </div>
  );
}


function FundingBar({
  label,
  value,
  width,
  style,
}) {
  return (
    <div className="mb-5">

      <div className="flex items-center justify-between mb-2">

        <span className="text-xs font-semibold text-slate-600">
          {label}
        </span>

        <span className="text-xs font-bold text-slate-500">
          {value}
        </span>

      </div>

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

        <div
          className={`h-full rounded-full ${style}`}
          style={{ width }}
        />

      </div>

    </div>
  );
}


function DashboardCard({
  title,
  description,
  icon: Icon,
  iconStyle,
  children,
}) {
  return (
    <div className="scicollab-glass rounded-3xl p-6 transition-all">

      <div className="flex items-center justify-between mb-5">

        <div>

          <div className="flex items-center gap-2">

            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconStyle}`}
            >
              <Icon className="w-4 h-4" />
            </div>

            <h2 className="text-base font-bold text-slate-800">
              {title}
            </h2>

          </div>

          <p className="text-xs text-slate-500 mt-2">
            {description}
          </p>

        </div>

      </div>

      {children}

    </div>
  );
}


function SummaryBox({
  label,
  value,
  description,
  icon: Icon,
  iconStyle,
}) {
  return (
    <div className="p-4 rounded-2xl bg-white/55 border border-white/80 hover:bg-white/75 transition-all">

      <div className="flex items-center justify-between">

        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>

        <Icon className={`w-4 h-4 ${iconStyle}`} />

      </div>

      <p className="text-2xl font-bold text-slate-800 mt-2">
        {value}
      </p>

      <p className="text-[10px] text-slate-400 mt-1">
        {description}
      </p>

    </div>
  );
}


function EmptyState({
  icon: Icon,
  text,
  description,
}) {
  return (
    <div className="py-10 text-center">

      <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-300 flex items-center justify-center mx-auto">

        <Icon className="w-5 h-5" />

      </div>

      <p className="text-sm font-semibold text-slate-500 mt-3">
        {text}
      </p>

      {description && (
        <p className="text-xs text-slate-400 mt-1">
          {description}
        </p>
      )}

    </div>
  );
}