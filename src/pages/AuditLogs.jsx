import React, { useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  Search,
  ShieldCheck,
  User,
  BookOpen,
  FolderKanban,
  Settings,
  LogIn,
  Clock3,
  Filter,
} from "lucide-react";

const auditData = [
  {
    id: 1,
    user: "Dr. Ananya Krishnan",
    action: "Added a new publication",
    target: "Cross-Institutional Proteomic Data Mapping",
    type: "Publication",
    time: "Today, 10:42 AM",
  },
  {
    id: 2,
    user: "Prof. Elena Rostova",
    action: "Updated researcher profile",
    target: "Elena Rostova",
    type: "User",
    time: "Today, 09:18 AM",
  },
  {
    id: 3,
    user: "Dr. Marcus Vance",
    action: "Created a collaboration",
    target: "Quantum Research Network",
    type: "Project",
    time: "Yesterday, 04:31 PM",
  },
  {
    id: 4,
    user: "Dr. Ananya Krishnan",
    action: "Changed notification settings",
    target: "Workspace Settings",
    type: "Settings",
    time: "Yesterday, 02:15 PM",
  },
  {
    id: 5,
    user: "Prof. Elena Rostova",
    action: "Signed into the platform",
    target: "Web Application",
    type: "Security",
    time: "Yesterday, 09:07 AM",
  },
  {
    id: 6,
    user: "Dr. Marcus Vance",
    action: "Updated project information",
    target: "Quantum Computing Project",
    type: "Project",
    time: "Aug 20, 2026",
  },
];

export default function Audit() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    return auditData.filter((item) => {
      const text =
        `${item.user} ${item.action} ${item.target}`.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (filter === "All" || item.type === filter)
      );
    });
  }, [search, filter]);

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
              Security & Monitoring
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Activity & Audit
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor user activity, publication history and security events.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">

          <AuditStat
            icon={<ShieldCheck />}
            title="Security Events"
            value="18"
          />

          <AuditStat
            icon={<User />}
            title="User Activities"
            value="146"
          />

          <AuditStat
            icon={<Clock3 />}
            title="Events Today"
            value="24"
          />

        </div>

        {/* Search & Filter */}
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* Search */}
            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activity, users or targets..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
              />

            </div>

            {/* Filter */}
            <div className="relative">

              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-8 text-sm font-medium outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
              >
                <option>All</option>
                <option>Publication</option>
                <option>User</option>
                <option>Project</option>
                <option>Settings</option>
                <option>Security</option>
              </select>

            </div>

          </div>

        </div>

        {/* Activity Section */}
        <div className="rounded-2xl border border-white/80 bg-white/80 shadow-sm backdrop-blur-xl">

          {/* Section Header */}
          <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 text-white shadow-md shadow-pink-200">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                  Workspace Security
                </p>

                <h2 className="mt-1 font-bold text-slate-900">
                  Recent Activity
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Complete history of recent workspace events.
                </p>
              </div>

            </div>

          </div>

          {/* Activity List */}
          <div className="divide-y divide-slate-100">

            {filtered.map((item) => (

              <div
                key={item.id}
                className="flex gap-4 px-6 py-5 transition hover:bg-pink-50/30"
              >

                {/* Activity Icon */}
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pink-50 to-orange-50 text-pink-500">
                  <ActivityIcon type={item.type} />
                </div>

                {/* Activity Content */}
                <div className="min-w-0 flex-1">

                  <div className="flex flex-col justify-between gap-1 md:flex-row">

                    <p className="text-sm text-slate-700">

                      <span className="font-bold text-slate-900">
                        {item.user}
                      </span>{" "}

                      {item.action}

                    </p>

                    <span className="shrink-0 text-xs font-medium text-slate-400">
                      {item.time}
                    </span>

                  </div>

                  {/* Target + Type */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">

                    <span className="rounded-lg bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                      {item.target}
                    </span>

                    <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-pink-600">
                      {item.type}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

          {/* Empty State */}
          {filtered.length === 0 && (

            <div className="rounded-b-2xl border-t border-dashed border-slate-200 bg-white/50 py-16 text-center">

              <ShieldCheck className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-3 font-semibold text-slate-600">
                No activity found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or filter.
              </p>

            </div>

          )}

        </div>

      </div>
    </MainLayout>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function AuditStat({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100">

      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-pink-50 to-orange-50 text-pink-500">

        {React.cloneElement(icon, {
          className: "h-5 w-5",
        })}

      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   ACTIVITY ICON
========================================================= */

function ActivityIcon({ type }) {
  const props = {
    className: "h-5 w-5",
  };

  if (type === "Publication") {
    return <BookOpen {...props} />;
  }

  if (type === "Project") {
    return <FolderKanban {...props} />;
  }

  if (type === "Settings") {
    return <Settings {...props} />;
  }

  if (type === "Security") {
    return <LogIn {...props} />;
  }

  return <User {...props} />;
}