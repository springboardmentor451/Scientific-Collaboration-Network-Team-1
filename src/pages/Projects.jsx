import React, { useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  Search,
  Plus,
  FolderKanban,
  Users,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";

const initialProjects = [
  {
    id: 1,
    code: "PR-501",
    title: "Cross-Institutional Genomics Study",
    description:
      "Collaborative research project focused on large-scale genomic data analysis.",
    lead: "Dr. Ananya Krishnan",
    institution: "Indian Institute of Science",
    funder: "Department of Science & Technology",
    budget: "$4.2M",
    members: 12,
    progress: 82,
    status: "Active",
    startDate: "2024-04-01",
    deadline: "2027-03-31",
    category: "Bioinformatics",
  },
  {
    id: 2,
    code: "PR-502",
    title: "Quantum Computing Research Network",
    description:
      "Exploring scalable quantum algorithms and fault-tolerant computing systems.",
    lead: "Dr. Marcus Vance",
    institution: "Stanford University",
    funder: "European Research Council",
    budget: "€2.8M",
    members: 8,
    progress: 64,
    status: "Active",
    startDate: "2025-01-15",
    deadline: "2028-01-14",
    category: "Quantum Computing",
  },
  {
    id: 3,
    code: "PR-503",
    title: "Scientific Knowledge Graph",
    description:
      "Building a cross-disciplinary knowledge graph for scientific publications.",
    lead: "Prof. Elena Rostova",
    institution: "University of Cambridge",
    funder: "Wellcome Trust",
    budget: "£3.1M",
    members: 15,
    progress: 47,
    status: "Active",
    startDate: "2021-06-01",
    deadline: "2025-05-31",
    category: "Computer Science",
  },
  {
    id: 4,
    code: "PR-504",
    title: "Climate Data Collaboration",
    description:
      "Multi-institution research initiative for climate and environmental datasets.",
    lead: "Dr. David Chen",
    institution: "National University of Singapore",
    funder: "UNESCO Science Fund",
    budget: "$960K",
    members: 10,
    progress: 29,
    status: "Planning",
    startDate: "2026-02-01",
    deadline: "2029-01-31",
    category: "Environmental Science",
  },
];

export default function Projects() {
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("Portfolio");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    lead: "",
    institution: "",
    funder: "",
    budget: "",
    category: "Computer Science",
    startDate: "",
    deadline: "",
  });

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const text =
        `${project.title} ${project.description} ${project.lead} ${project.institution} ${project.funder} ${project.category}`
          .toLowerCase();

      const searchMatch = text.includes(search.toLowerCase());

      const filterMatch =
        filter === "All" || project.status === filter;

      return searchMatch && filterMatch;
    });
  }, [projects, search, filter]);

  const openAdd = () => {
    setEditing(null);

    setForm({
      title: "",
      description: "",
      lead: "",
      institution: "",
      funder: "",
      budget: "",
      category: "Computer Science",
      startDate: "",
      deadline: "",
    });

    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditing(project);

    setForm({
      title: project.title || "",
      description: project.description || "",
      lead: project.lead || "",
      institution: project.institution || "",
      funder: project.funder || "",
      budget: project.budget || "",
      category: project.category || "Computer Science",
      startDate: project.startDate || "",
      deadline: project.deadline || "",
    });

    setShowModal(true);
  };

  const saveProject = (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    if (editing) {
      setProjects((items) =>
        items.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                ...form,
              }
            : item
        )
      );
    } else {
      const nextNumber = projects.length + 501;

      setProjects((items) => [
        ...items,
        {
          id: Date.now(),
          code: `PR-${nextNumber}`,
          ...form,
          members: 1,
          progress: 0,
          status: "Planning",
        },
      ]);
    }

    setShowModal(false);
  };

  const deleteProject = (id) => {
    if (window.confirm("Delete this project?")) {
      setProjects((items) =>
        items.filter((item) => item.id !== id)
      );
    }
  };

  const activeProjects = projects.filter(
    (item) => item.status === "Active"
  ).length;

  const completedProjects = projects.filter(
    (item) => item.progress === 100
  ).length;

  const totalMembers = projects.reduce(
    (total, item) => total + Number(item.members || 0),
    0
  );

  return (
    <MainLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Projects
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage research projects, grants, budgets, milestones and delivery status across the research portfolio.
            </p>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex w-fit items-center rounded-full bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 p-1">
          {["Portfolio", "Kanban", "Timeline"].map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                view === item
                  ? "bg-white text-purple-700 shadow-sm border border-pink-100"
                  : "text-slate-500 hover:text-pink-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <ProjectStat
            icon={<FolderKanban />}
            title="Total Projects"
            value={projects.length}
            theme="pink"
          />

          <ProjectStat
            icon={<Clock3 />}
            title="Active Projects"
            value={activeProjects}
            theme="purple"
          />

          <ProjectStat
            icon={<Users />}
            title="Project Members"
            value={totalMembers}
            theme="blue"
          />

          <ProjectStat
            icon={<CheckCircle2 />}
            title="Completed"
            value={completedProjects}
            theme="orange"
          />

        </div>

        {/* Search & Filter */}
        <div className="rounded-2xl border border-pink-100 bg-white/90 backdrop-blur-xl p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-xl border border-pink-100 bg-pink-50/30 px-4 py-3 pl-11 text-sm outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-purple-100 bg-purple-50/20 px-4 py-3 text-sm font-medium outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
            >
              <option>All</option>
              <option>Active</option>
              <option>Planning</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Portfolio View */}
        {view === "Portfolio" && (
          <>
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={openEdit}
                  onDelete={deleteProject}
                />
              ))}
            </div>
          </>
        )}

        {/* Kanban View */}
        {view === "Kanban" && (
          <div className="grid gap-5 lg:grid-cols-3">
            {["Planning", "Active", "Completed"].map((status) => {
              const statusProjects = filteredProjects.filter(
                (project) => project.status === status
              );

              return (
                <div
                  key={status}
                  className="min-h-[350px] rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50/40 via-purple-50/30 to-blue-50/30 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800">
                      {status}
                    </h2>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-purple-600 shadow-sm border border-purple-100">
                      {statusProjects.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {statusProjects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-xl border border-pink-100 bg-white/95 p-4 shadow-sm"
                      >
                        <span className="text-[10px] font-bold text-pink-600">
                          {project.code}
                        </span>

                        <h3 className="mt-1 text-sm font-bold text-slate-900">
                          {project.title}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {project.lead}
                        </p>

                        <div className="mt-4">
                          <div className="mb-1 flex justify-between text-[10px] font-semibold text-slate-400">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-purple-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                              style={{
                                width: `${project.progress}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline View */}
        {view === "Timeline" && (
          <div className="rounded-2xl border border-pink-100 bg-white/90 backdrop-blur-xl p-5 shadow-sm">
            <div className="space-y-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="relative border-l-2 border-pink-100 pl-6"
                >
                  <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-pink-500" />

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-600">
                        {project.code}
                      </span>

                      <h3 className="mt-1 text-sm font-bold text-slate-900">
                        {project.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {project.startDate || "Start date unavailable"} →{" "}
                        {project.deadline || "End date unavailable"}
                      </p>
                    </div>

                    <div className="w-full md:w-48">
                      <div className="mb-1 flex justify-between text-[10px] font-semibold text-slate-400">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-pink-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500"
                          style={{
                            width: `${project.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="rounded-2xl border border-dashed border-pink-200 bg-white/90 py-16 text-center">
            <FolderKanban className="mx-auto h-10 w-10 text-pink-200" />

            <p className="mt-3 font-semibold text-slate-700">
              No projects found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filter.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveProject}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-pink-100 bg-white/95 backdrop-blur-xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-600">
                  Project
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {editing ? "Edit Project" : "Create Project"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl p-2 hover:bg-pink-50 text-slate-500 hover:text-pink-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <Input
                label="Project Name"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />

              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Description
                </span>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-pink-100 px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
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

                <Input
                  label="Institution"
                  value={form.institution}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      institution: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Funding Organization"
                  value={form.funder}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      funder: e.target.value,
                    })
                  }
                />

                <Input
                  label="Budget"
                  value={form.budget}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      budget: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Category
                  </span>

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
                  >
                    <option>Computer Science</option>
                    <option>Bioinformatics</option>
                    <option>Quantum Computing</option>
                    <option>Data Science</option>
                    <option>Environmental Science</option>
                  </select>
                </label>

                <Input
                  label="Start Date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>

              <Input
                label="End Date"
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deadline: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 py-3 font-bold text-white shadow-lg shadow-pink-100"
            >
              <Check className="h-4 w-4" />
              Save Project
            </button>
          </form>
        </div>
      )}
    </MainLayout>
  );
}

function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white/90 backdrop-blur-xl p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md">

      {/* Top */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold text-pink-600">
            {project.code}
          </p>

          <h2 className="mt-2 text-lg font-bold text-slate-900">
            {project.title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {project.funder || project.institution}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">

          <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold ${
              project.status === "Active"
                ? "bg-emerald-50 text-emerald-600"
                : project.status === "Completed"
                ? "bg-blue-50 text-blue-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            <span className="mr-1">●</span>
            {project.status}
          </span>

          <button
            onClick={() => onEdit(project)}
            className="rounded-lg p-2 text-slate-400 hover:bg-purple-50 hover:text-purple-600"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete(project.id)}
            className="rounded-lg p-2 text-slate-400 hover:bg-orange-50 hover:text-orange-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>

        </div>
      </div>

      {/* Project Details */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div>
          <p className="text-xs text-slate-400">Budget</p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {project.budget || "Not specified"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Lead</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {project.lead}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Members</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {project.members}
          </p>
        </div>

      </div>

      {/* Dates */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-slate-400">

          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-purple-400" />
            {project.startDate || "Start date"} →{" "}
            {project.deadline || "End date"}
          </span>

          <span className="font-semibold text-purple-600">
            {project.progress}%
          </span>

        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-pink-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 transition-all"
            style={{
              width: `${project.progress}%`,
            }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="mt-5 border-t border-pink-100 pt-4">
        <p className="text-xs leading-5 text-slate-500">
          {project.description}
        </p>
      </div>

      {/* Category */}
      <div className="mt-4">
        <span className="rounded-md bg-pink-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-pink-600 border border-pink-100">
          {project.category}
        </span>
      </div>
    </div>
  );
}

function ProjectStat({ icon, title, value, theme }) {
  const themes = {
    pink: "bg-pink-50 text-pink-600 border-pink-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <div className="rounded-2xl border border-pink-100 bg-white/90 backdrop-blur-xl p-5 shadow-sm">

      <div
        className={`grid h-11 w-11 place-items-center rounded-xl border ${themes[theme]}`}
      >
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
        className="w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
      />
    </label>
  );
}