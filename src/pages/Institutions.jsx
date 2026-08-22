import React, { useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  Search,
  Plus,
  Building2,
  MapPin,
  Users,
  BookOpen,
  Pencil,
  Trash2,
  X,
  Check,
  FlaskConical,
  ArrowRight,
} from "lucide-react";

const initialInstitutions = [
  {
    id: 1,
    name: "Indian Institute of Science",
    short: "IISc",
    location: "Bengaluru, India",
    researchers: 128,
    publications: 342,
    projects: 28,
    status: "Active",
    description:
      "A premier research institution focused on advanced scientific discovery, engineering innovation, and interdisciplinary research across emerging technologies.",
    researchFocus:
      "Artificial Intelligence, Data Science, Biotechnology, Materials Science, Robotics",
  },
  {
    id: 2,
    name: "Massachusetts Institute of Technology",
    short: "MIT",
    location: "Cambridge, USA",
    researchers: 96,
    publications: 281,
    projects: 21,
    status: "Active",
    description:
      "A globally recognized research university known for innovation in science, engineering, computing, artificial intelligence, and technology-driven solutions.",
    researchFocus:
      "Artificial Intelligence, Computer Science, Robotics, Quantum Computing, Engineering",
  },
  {
    id: 3,
    name: "University of Cambridge",
    short: "CAM",
    location: "Cambridge, UK",
    researchers: 74,
    publications: 219,
    projects: 17,
    status: "Active",
    description:
      "A historic research institution supporting high-impact academic research across science, technology, medicine, humanities, and interdisciplinary fields.",
    researchFocus:
      "Machine Learning, Healthcare, Physics, Engineering, Computational Biology",
  },
  {
    id: 4,
    name: "Stanford University",
    short: "SU",
    location: "California, USA",
    researchers: 61,
    publications: 188,
    projects: 14,
    status: "Active",
    description:
      "A leading research university with a strong focus on technology, entrepreneurship, scientific innovation, and collaboration between academia and industry.",
    researchFocus:
      "AI & ML, Computer Vision, Healthcare Technology, Cybersecurity, Data Science",
  },
  {
    id: 5,
    name: "National University of Singapore",
    short: "NUS",
    location: "Singapore",
    researchers: 52,
    publications: 146,
    projects: 11,
    status: "Pending",
    description:
      "A comprehensive research university with strong international collaborations and research programs spanning computing, engineering, medicine, and sustainability.",
    researchFocus:
      "Data Science, Smart Cities, Biomedical Research, AI, Sustainable Technology",
  },
];

export default function Institutions() {
  const [institutions, setInstitutions] = useState(initialInstitutions);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return institutions.filter((item) =>
      `${item.name} ${item.short} ${item.location} ${item.description} ${item.researchFocus}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [institutions, search]);

  const [form, setForm] = useState({
    name: "",
    short: "",
    location: "",
    description: "",
    researchFocus: "",
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      short: "",
      location: "",
      description: "",
      researchFocus: "",
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      short: item.short,
      location: item.location,
      description: item.description || "",
      researchFocus: item.researchFocus || "",
    });
    setShowModal(true);
  };

  const openDetails = (institution) => {
    setSelectedInstitution(institution);
    setShowDetails(true);
  };

  const saveInstitution = (e) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    const description =
      form.description.trim() ||
      "A research-focused institution involved in academic collaboration, innovation, and knowledge development.";

    const researchFocus =
      form.researchFocus.trim() ||
      "Interdisciplinary Research, Technology, Innovation";

    if (editing) {
      setInstitutions((items) =>
        items.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                ...form,
                description,
                researchFocus,
              }
            : item
        )
      );
    } else {
      setInstitutions((items) => [
        ...items,
        {
          id: Date.now(),
          ...form,
          description,
          researchFocus,
          researchers: 0,
          publications: 0,
          projects: 0,
          status: "Active",
        },
      ]);
    }

    setShowModal(false);
  };

  const removeInstitution = (id) => {
    if (window.confirm("Delete this institution?")) {
      setInstitutions((items) =>
        items.filter((item) => item.id !== id)
      );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
              SciCollab
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Institutions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage research institutions and their collaboration networks.
            </p>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add Institution
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={<Building2 />}
            title="Total Institutions"
            value={institutions.length}
            color="pink"
          />

          <SummaryCard
            icon={<Users />}
            title="Researchers"
            value={institutions.reduce(
              (a, b) => a + b.researchers,
              0
            )}
            color="purple"
          />

          <SummaryCard
            icon={<BookOpen />}
            title="Publications"
            value={institutions.reduce(
              (a, b) => a + b.publications,
              0
            )}
            color="orange"
          />
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search institutions, research areas or locations..."
              className="w-full rounded-xl border border-slate-200 bg-white/80 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            />
          </div>
        </div>

        {/* Institution cards */}
        <div className="grid gap-5 xl:grid-cols-2">
          {filtered.map((institution) => (
            <div
              key={institution.id}
              className="group rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100"
            >
              {/* Institution Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-md shadow-pink-200">
                    <Building2 className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-900">
                      {institution.name}
                    </h2>

                    <p className="text-sm font-medium text-pink-500">
                      {institution.short}
                    </p>

                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {institution.location}
                    </div>
                  </div>
                </div>

                {/* Edit/Delete */}
                <div className="relative flex gap-1">
                  <button
                    onClick={() => openEdit(institution)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-pink-50 hover:text-pink-500"
                    title="Edit institution"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => removeInstitution(institution.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    title="Delete institution"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-5">
                <p className="text-sm leading-6 text-slate-600">
                  {institution.description}
                </p>
              </div>

              {/* Research Focus */}
              <div className="mt-4 rounded-xl bg-gradient-to-r from-pink-50 via-purple-50 to-orange-50 p-3">
                <div className="flex items-start gap-2">
                  <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-purple-500">
                      Research Focus
                    </p>

                    <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                      {institution.researchFocus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniStat
                  value={institution.researchers}
                  label="Researchers"
                />

                <MiniStat
                  value={institution.publications}
                  label="Publications"
                />

                <MiniStat
                  value={institution.projects}
                  label="Projects"
                />
              </div>

              {/* Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    institution.status === "Active"
                      ? "bg-pink-50 text-pink-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {institution.status}
                </span>

                <button
                  onClick={() => openDetails(institution)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 transition hover:text-pink-600"
                >
                  View institution
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 py-16 text-center">
            <Building2 className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 font-semibold text-slate-700">
              No institutions found
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveInstitution}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                  Institution
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {editing ? "Edit Institution" : "Add Institution"}
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
                label="Institution Name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              <Input
                label="Short Name"
                value={form.short}
                onChange={(e) =>
                  setForm({
                    ...form,
                    short: e.target.value,
                  })
                }
              />

              <Input
                label="Location"
                value={form.location}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location: e.target.value,
                  })
                }
              />

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Institution Description
                </span>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Describe the institution, its research activities and academic strengths..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Research Focus
                </span>

                <textarea
                  value={form.researchFocus}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      researchFocus: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Example: Artificial Intelligence, Robotics, Data Science, Healthcare..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-semibold text-white"
            >
              <Check className="h-4 w-4" />
              Save Institution
            </button>
          </form>
        </div>
      )}

      {/* Institution Details Modal */}
      {showDetails && selectedInstitution && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200">
                  <Building2 className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                    Institution Profile
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {selectedInstitution.name}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-purple-500">
                    {selectedInstitution.short}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Location */}
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-600">
              <MapPin className="h-4 w-4 text-pink-500" />
              {selectedInstitution.location}
            </div>

            {/* Description */}
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                About the Institution
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {selectedInstitution.description}
              </p>
            </div>

            {/* Research Focus */}
            <div className="mt-5 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-orange-50 p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-purple-500 shadow-sm">
                  <FlaskConical className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-500">
                    Research Focus
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedInstitution.researchFocus}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniStat
                value={selectedInstitution.researchers}
                label="Researchers"
              />

              <MiniStat
                value={selectedInstitution.publications}
                label="Publications"
              />

              <MiniStat
                value={selectedInstitution.projects}
                label="Projects"
              />
            </div>

            {/* Status */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Institution Status
              </span>

              <span
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  selectedInstitution.status === "Active"
                    ? "bg-pink-50 text-pink-600"
                    : "bg-orange-50 text-orange-600"
                }`}
              >
                {selectedInstitution.status}
              </span>
            </div>

            {/* Close */}
            <button
              onClick={() => setShowDetails(false)}
              className="mt-6 w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

function SummaryCard({ icon, title, value, color }) {
  const colors = {
    pink: "bg-pink-50 text-pink-500",
    purple: "bg-purple-50 text-purple-500",
    orange: "bg-orange-50 text-orange-500",
  };

  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
      <div
        className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${colors[color]}`}
      >
        {React.cloneElement(icon, {
          className: "h-5 w-5",
        })}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-lg font-bold text-slate-900">
        {value}
      </p>

      <p className="text-[11px] text-slate-500">
        {label}
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