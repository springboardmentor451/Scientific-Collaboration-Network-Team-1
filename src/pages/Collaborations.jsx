import React, { useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  Search,
  Plus,
  Network,
  Users,
  Building2,
  MessageSquare,
  CheckCircle2,
  Clock3,
  X,
  Check,
  ArrowRight,
} from "lucide-react";

const initialCollaborations = [
  {
    id: 1,
    title: "Genomics Data Consortium",
    partner: "Indian Institute of Science",
    lead: "Dr. Ananya Krishnan",
    members: 14,
    type: "Research Partnership",
    status: "Active",
    progress: 78,
    started: "Jan 2026",
  },
  {
    id: 2,
    title: "Quantum Research Initiative",
    partner: "Stanford University",
    lead: "Dr. Marcus Vance",
    members: 9,
    type: "Joint Research",
    status: "Active",
    progress: 61,
    started: "Mar 2026",
  },
  {
    id: 3,
    title: "Scientific Knowledge Network",
    partner: "University of Cambridge",
    lead: "Prof. Elena Rostova",
    members: 17,
    type: "International",
    status: "Active",
    progress: 54,
    started: "Feb 2026",
  },
  {
    id: 4,
    title: "Climate Research Exchange",
    partner: "National University of Singapore",
    lead: "Dr. David Chen",
    members: 7,
    type: "Data Collaboration",
    status: "Pending",
    progress: 22,
    started: "Jul 2026",
  },
];

export default function Collaborations() {
  const [collaborations, setCollaborations] = useState(
    initialCollaborations
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    partner: "",
    lead: "",
    type: "Research Partnership",
  });

  const filtered = useMemo(() => {
    return collaborations.filter((item) => {
      const text =
        `${item.title} ${item.partner} ${item.lead} ${item.type}`.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (filter === "All" ||
          item.status === filter ||
          (filter === "Accepted" && item.status === "Active"))
      );
    });
  }, [collaborations, search, filter]);

  const addCollaboration = (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    setCollaborations((items) => [
      ...items,
      {
        id: Date.now(),
        ...form,
        members: 1,
        status: "Pending",
        progress: 0,
        started: "Aug 2026",
      },
    ]);

    setShowModal(false);

    setForm({
      title: "",
      partner: "",
      lead: "",
      type: "Research Partnership",
    });
  };

  const active = collaborations.filter(
    (item) => item.status === "Active"
  ).length;

  const pending = collaborations.filter(
    (item) => item.status === "Pending"
  ).length;

  const members = collaborations.reduce(
    (total, item) => total + item.members,
    0
  );

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
              Research Network
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Collaborations
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Discover, manage and track scientific collaboration networks.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200"
          >
            <Plus className="h-4 w-4" />
            New Collaboration
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CollabStat
            icon={<Network />}
            title="Total Collaborations"
            value={collaborations.length}
          />

          <CollabStat
            icon={<CheckCircle2 />}
            title="Active"
            value={active}
          />

          <CollabStat
            icon={<Clock3 />}
            title="Pending"
            value={pending}
          />

          <CollabStat
            icon={<Users />}
            title="Researchers"
            value={members}
          />
        </div>

        {/* ========================================================= */}
        {/* NEW: COLLABORATION NETWORK */}
        {/* ========================================================= */}

        <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-sm backdrop-blur-xl">

          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-500">
                  Network Visualization
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Collaboration Network
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Connected institutions and research partners
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  Research Hub
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Institution
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                  Partner
                </span>
              </div>

            </div>
          </div>

          <div className="relative h-[330px] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/60">

            {/* Connection Lines */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 1000 330"
              preserveAspectRatio="none"
            >
              <line
                x1="500"
                y1="150"
                x2="250"
                y2="70"
                stroke="#93c5fd"
                strokeWidth="3"
              />

              <line
                x1="500"
                y1="150"
                x2="750"
                y2="70"
                stroke="#93c5fd"
                strokeWidth="3"
              />

              <line
                x1="500"
                y1="150"
                x2="190"
                y2="240"
                stroke="#93c5fd"
                strokeWidth="3"
              />

              <line
                x1="500"
                y1="150"
                x2="810"
                y2="240"
                stroke="#93c5fd"
                strokeWidth="3"
              />

              <line
                x1="250"
                y1="70"
                x2="190"
                y2="240"
                stroke="#bfdbfe"
                strokeWidth="2"
              />

              <line
                x1="750"
                y1="70"
                x2="810"
                y2="240"
                stroke="#bfdbfe"
                strokeWidth="2"
              />

              <line
                x1="250"
                y1="70"
                x2="750"
                y2="70"
                stroke="#dbeafe"
                strokeWidth="2"
              />

              <line
                x1="190"
                y1="240"
                x2="810"
                y2="240"
                stroke="#dbeafe"
                strokeWidth="2"
              />
            </svg>

            {/* Main Hub */}
            <NetworkNode
              className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2"
              label="IISc"
              color="blue"
              size="large"
            />

            {/* Top Left */}
            <NetworkNode
              className="absolute left-[25%] top-[21%] -translate-x-1/2 -translate-y-1/2"
              label="ETH"
              color="purple"
            />

            {/* Top Right */}
            <NetworkNode
              className="absolute left-[75%] top-[21%] -translate-x-1/2 -translate-y-1/2"
              label="MPI"
              color="cyan"
            />

            {/* Bottom Left */}
            <NetworkNode
              className="absolute left-[19%] top-[73%] -translate-x-1/2 -translate-y-1/2"
              label="USP"
              color="orange"
            />

            {/* Bottom Center */}
            <NetworkNode
              className="absolute left-1/2 top-[86%] -translate-x-1/2 -translate-y-1/2"
              label="UCT"
              color="pink"
            />

            {/* Bottom Right */}
            <NetworkNode
              className="absolute left-[81%] top-[67%] -translate-x-1/2 -translate-y-1/2"
              label="Tsinghua"
              color="green"
            />

          </div>
        </div>

        {/* ========================================================= */}
        {/* NEW: ACCEPTED / PENDING / REJECTED TABS */}
        {/* ========================================================= */}

        <div className="flex w-fit items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur-xl">

          {["All", "Accepted", "Pending", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === "Accepted") {
                  setFilter("Accepted");
                } else if (tab === "Pending") {
                  setFilter("Pending");
                } else if (tab === "Rejected") {
                  setFilter("Rejected");
                } else {
                  setFilter("All");
                }
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === tab ||
                (filter === "Active" && tab === "Accepted")
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}

        </div>

        {/* Search */}
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collaborations, institutions or researchers..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
              />

            </div>

            <select
              value={
                filter === "Accepted" || filter === "Rejected"
                  ? "All"
                  : filter
              }
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-pink-300"
            >
              <option>All</option>
              <option>Active</option>
              <option>Pending</option>
            </select>

          </div>

        </div>

        {/* Collaboration Cards */}
        <div className="grid gap-5 xl:grid-cols-2">

          {filtered.map((item) => (

            <div
              key={item.id}
              className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100"
            >

              <div className="flex gap-4">

                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-md shadow-pink-200">
                  <Network className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <span className="rounded-md bg-purple-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-purple-600">
                        {item.type}
                      </span>

                      <h2 className="mt-2 font-bold text-slate-900">
                        {item.title}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                        item.status === "Active"
                          ? "bg-pink-50 text-pink-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {item.status === "Active"
                        ? "Accepted"
                        : item.status}
                    </span>

                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <Building2 className="h-4 w-4 text-pink-400" />
                    {item.partner}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Users className="h-4 w-4 text-purple-400" />
                    Led by {item.lead}
                  </div>

                </div>
              </div>

              {/* Progress */}
              <div className="mt-6">

                <div className="mb-2 flex justify-between">

                  <span className="text-xs font-semibold text-slate-500">
                    Collaboration Progress
                  </span>

                  <span className="text-xs font-bold text-pink-500">
                    {item.progress}%
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                  <div
                    style={{
                      width: `${item.progress}%`,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400"
                  />

                </div>

              </div>

              {/* Bottom */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">

                <div className="flex items-center gap-4 text-xs text-slate-500">

                  <span>
                    {item.members} researchers
                  </span>

                  <span>
                    Started {item.started}
                  </span>

                </div>

                <button className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-pink-600">
                  View
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

              </div>

            </div>

          ))}

        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 py-16 text-center">

            <Network className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 font-semibold text-slate-700">
              No collaborations found
            </p>

          </div>
        )}

      </div> 

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">

          <form
            onSubmit={addCollaboration}
            className="w-full max-w-lg rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl"
          >

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                  Collaboration
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Create Collaboration
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="mt-6 space-y-4">

              <Input
                label="Collaboration Name"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />

              <Input
                label="Partner Institution"
                value={form.partner}
                onChange={(e) =>
                  setForm({
                    ...form,
                    partner: e.target.value,
                  })
                }
              />

              <Input
                label="Project Lead"
                value={form.lead}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lead: e.target.value,
                  })
                }
              />

              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Collaboration Type
                </span>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-300"
                >
                  <option>Research Partnership</option>
                  <option>Joint Research</option>
                  <option>International</option>
                  <option>Data Collaboration</option>
                </select>
              </label>

            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 py-3 font-bold text-white"
            >
              <Check className="h-4 w-4" />
              Create Collaboration
            </button>

          </form>

        </div>
      )}
    </MainLayout>
  );
}

/* ========================================================= */
/* NEW: NETWORK NODE COMPONENT */
/* ========================================================= */

function NetworkNode({
  label,
  color,
  className = "",
  size = "normal",
}) {
  const colorClasses = {
    blue: "bg-blue-600 ring-blue-100",
    purple: "bg-purple-500 ring-purple-100",
    cyan: "bg-cyan-500 ring-cyan-100",
    orange: "bg-orange-400 ring-orange-100",
    pink: "bg-pink-500 ring-pink-100",
    green: "bg-emerald-500 ring-emerald-100",
  };

  const sizeClasses =
    size === "large"
      ? "h-16 w-16 text-base"
      : "h-11 w-11 text-xs";

  return (
    <div className={`group ${className}`}>

      <div
        className={`${sizeClasses} ${colorClasses[color]} grid place-items-center rounded-full font-bold text-white shadow-lg ring-8 transition duration-300 group-hover:scale-110`}
      >
        {label}
      </div>

      <div className="mt-2 whitespace-nowrap text-center text-[11px] font-semibold text-slate-500">
        {label}
      </div>

    </div>
  );
}

function CollabStat({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl">

      <div className="grid h-11 w-11 place-items-center rounded-xl bg-pink-50 text-pink-500">
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

function Input({ label, ...props }) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>

      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
      />

    </label>
  );
}