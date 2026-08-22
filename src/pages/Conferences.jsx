import React, { useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  Search,
  Plus,
  CalendarDays,
  MapPin,
  Users,
  Clock3,
  ExternalLink,
  X,
  Check,
  Star,
  Upload,
  FileText,
  BookOpen,
  Award,
  Send,
  CheckCircle2,
} from "lucide-react";

const initialConferences = [
  {
    id: 1,
    title: "International Conference on Machine Learning",
    short: "ICML 2026",
    date: "Jul 12 – Jul 18, 2026",
    location: "Vienna, Austria",
    type: "International",
    attendees: "8,000+",
    status: "Upcoming",
    featured: true,
    description:
      "A leading international conference bringing together researchers, scientists and practitioners working in machine learning and artificial intelligence.",
    registrationLink: "#",
  },
  {
    id: 2,
    title: "International Conference on Computer Vision",
    short: "ICCV 2026",
    date: "Oct 18 – Oct 24, 2026",
    location: "Paris, France",
    type: "International",
    attendees: "6,500+",
    status: "Upcoming",
    featured: true,
    description:
      "An international forum for researchers and professionals working in computer vision, image processing and visual intelligence.",
    registrationLink: "#",
  },
  {
    id: 3,
    title: "Bioinformatics Research Summit",
    short: "BRS 2026",
    date: "Sep 05 – Sep 07, 2026",
    location: "Singapore",
    type: "Research Summit",
    attendees: "2,400+",
    status: "Upcoming",
    featured: false,
    description:
      "A research-focused summit covering bioinformatics, computational biology, genomics and AI-driven healthcare research.",
    registrationLink: "#",
  },
  {
    id: 4,
    title: "Quantum Computing Symposium",
    short: "QCS 2026",
    date: "Nov 02 – Nov 04, 2026",
    location: "Boston, USA",
    type: "Symposium",
    attendees: "1,800+",
    status: "Upcoming",
    featured: false,
    description:
      "A scientific symposium focused on quantum computing, quantum algorithms, quantum information and emerging technologies.",
    registrationLink: "#",
  },
];

export default function Conferences() {
  const [conferences, setConferences] = useState(initialConferences);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [selectedConference, setSelectedConference] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const [registered, setRegistered] = useState([]);

  const [submission, setSubmission] = useState({
    type: "Research Paper",
    title: "",
    file: null,
  });

  const [form, setForm] = useState({
    title: "",
    short: "",
    date: "",
    location: "",
    type: "International",
  });

  const filtered = useMemo(() => {
    return conferences.filter((conference) => {
      const text =
        `${conference.title} ${conference.short} ${conference.location} ${conference.type}`.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (type === "All" || conference.type === type)
      );
    });
  }, [conferences, search, type]);

  const addConference = (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    setConferences((items) => [
      ...items,
      {
        id: Date.now(),
        ...form,
        attendees: "New",
        status: "Upcoming",
        featured: false,
        description:
          "New conference added to the research and academic events network.",
        registrationLink: "#",
      },
    ]);

    setForm({
      title: "",
      short: "",
      date: "",
      location: "",
      type: "International",
    });

    setShowModal(false);
  };

  const openDetails = (conference) => {
    setSelectedConference(conference);
    setShowDetails(true);
  };

  const openRegister = (conference) => {
    setSelectedConference(conference);
    setShowRegister(true);
  };

  const openUpload = (conference) => {
    setSelectedConference(conference);
    setSubmission({
      type: "Research Paper",
      title: "",
      file: null,
    });
    setShowUpload(true);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!selectedConference) return;

    setRegistered((items) => {
      if (items.includes(selectedConference.id)) {
        return items;
      }

      return [...items, selectedConference.id];
    });

    setShowRegister(false);
  };

  const handleSubmission = (e) => {
    e.preventDefault();

    if (!submission.title.trim() || !submission.file) return;

    setShowUpload(false);

    alert(
      `${submission.type} "${submission.title}" has been uploaded successfully for ${selectedConference?.short}.`
    );

    setSubmission({
      type: "Research Paper",
      title: "",
      file: null,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
              Events & Networking
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Conferences
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Discover conferences, research summits and scientific events.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200"
          >
            <Plus className="h-4 w-4" />
            Add Conference
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <ConferenceStat
            icon={<CalendarDays />}
            title="Upcoming Events"
            value={conferences.length}
          />

          <ConferenceStat
            icon={<Star />}
            title="Featured"
            value={conferences.filter((item) => item.featured).length}
          />

          <ConferenceStat
            icon={<Users />}
            title="Expected Attendees"
            value="18K+"
          />
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conferences, locations or categories..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
              />
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-pink-300"
            >
              <option>All</option>
              <option>International</option>
              <option>Research Summit</option>
              <option>Symposium</option>
            </select>
          </div>
        </div>

        {/* Featured */}
        <div className="rounded-2xl border border-white/80 bg-gradient-to-r from-pink-50 via-purple-50 to-orange-50 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-pink-500 shadow-sm">
              <Star className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                Featured Events
              </p>

              <h2 className="font-bold text-slate-900">
                Recommended conferences for your network
              </h2>
            </div>
          </div>
        </div>

        {/* Conference cards */}
        <div className="grid gap-5 xl:grid-cols-2">
          {filtered.map((conference) => {
            const isRegistered = registered.includes(conference.id);

            return (
              <div
                key={conference.id}
                className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 text-white shadow-md shadow-pink-200">
                    <CalendarDays className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-pink-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-pink-600">
                        {conference.type}
                      </span>

                      {conference.featured && (
                        <span className="flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-600">
                          <Star className="h-3 w-3" />
                          Featured
                        </span>
                      )}

                      {isRegistered && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Registered
                        </span>
                      )}
                    </div>

                    <h2 className="mt-2 font-bold text-slate-900">
                      {conference.title}
                    </h2>

                    <p className="mt-1 text-sm font-semibold text-purple-500">
                      {conference.short}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <CalendarDays className="h-4 w-4 text-pink-500" />

                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Date
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-slate-700">
                        {conference.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <MapPin className="h-4 w-4 text-purple-500" />

                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Location
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-slate-700">
                        {conference.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {conference.attendees}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {conference.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Details */}
                      <button
                        onClick={() => openDetails(conference)}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
                      >
                        Details
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>

                      {/* Register */}
                      <button
                        onClick={() => openRegister(conference)}
                        disabled={isRegistered}
                        className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold ${
                          isRegistered
                            ? "cursor-default bg-emerald-50 text-emerald-600"
                            : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                        }`}
                      >
                        {isRegistered ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Registered
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            Register
                          </>
                        )}
                      </button>

                      {/* Upload */}
                      <button
                        onClick={() => openUpload(conference)}
                        className="inline-flex items-center gap-1 rounded-xl bg-pink-50 px-3 py-2 text-xs font-bold text-pink-600 hover:bg-pink-100"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 py-16 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 font-semibold text-slate-700">
              No conferences found
            </p>
          </div>
        )}
      </div>

      {/* Add Conference Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <form
            onSubmit={addConference}
            className="w-full max-w-lg rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                  Conference
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Add Conference
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
                label="Conference Name"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
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

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
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
              </div>

              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Type
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
                  <option>International</option>
                  <option>Research Summit</option>
                  <option>Symposium</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 py-3 font-bold text-white"
            >
              <Check className="h-4 w-4" />
              Add Conference
            </button>
          </form>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedConference && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                  Conference Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedConference.title}
                </h2>

                <p className="mt-1 text-sm font-semibold text-purple-500">
                  {selectedConference.short}
                </p>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoBox
                icon={<CalendarDays />}
                label="Date"
                value={selectedConference.date}
              />

              <InfoBox
                icon={<MapPin />}
                label="Location"
                value={selectedConference.location}
              />

              <InfoBox
                icon={<Users />}
                label="Expected Attendees"
                value={selectedConference.attendees}
              />

              <InfoBox
                icon={<Award />}
                label="Category"
                value={selectedConference.type}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                About this Conference
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedConference.description}
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setShowDetails(false);
                  openRegister(selectedConference);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 py-3 text-sm font-bold text-white"
              >
                <Send className="h-4 w-4" />
                Register
              </button>

              <button
                onClick={() => {
                  setShowDetails(false);
                  openUpload(selectedConference);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-50 py-3 text-sm font-bold text-pink-600 hover:bg-pink-100"
              >
                <Upload className="h-4 w-4" />
                Submit Work
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && selectedConference && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleRegister}
            className="w-full max-w-md rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-500">
                  Registration
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Register for Conference
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-purple-50 p-4">
              <p className="font-bold text-slate-900">
                {selectedConference.title}
              </p>

              <p className="mt-1 text-sm text-purple-600">
                {selectedConference.short}
              </p>

              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-purple-500" />
                  {selectedConference.date}
                </p>

                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  {selectedConference.location}
                </p>
              </div>
            </div>

            <Input label="Full Name" placeholder="Enter your full name" />

            <div className="mt-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 py-3 font-bold text-white"
            >
              <Check className="h-4 w-4" />
              Confirm Registration
            </button>
          </form>
        </div>
      )}

      {/* Upload / Submission Modal */}
      {showUpload && selectedConference && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmission}
            className="w-full max-w-lg rounded-3xl border border-white/80 bg-white/95 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                  Research Submission
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Submit Your Work
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-pink-50 p-4">
              <p className="text-xs font-semibold uppercase text-pink-500">
                Submitting to
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {selectedConference.title}
              </p>

              <p className="mt-1 text-sm text-purple-500">
                {selectedConference.short}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Submission Type
                </span>

                <select
                  value={submission.type}
                  onChange={(e) =>
                    setSubmission({
                      ...submission,
                      type: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                >
                  <option>Research Paper</option>
                  <option>Patent</option>
                  <option>Book</option>
                  <option>Book Chapter</option>
                  <option>Research Proposal</option>
                  <option>Poster</option>
                  <option>Case Study</option>
                  <option>Other</option>
                </select>
              </label>

              <Input
                label="Title of Submission"
                placeholder={`Enter ${submission.type.toLowerCase()} title`}
                value={submission.title}
                onChange={(e) =>
                  setSubmission({
                    ...submission,
                    title: e.target.value,
                  })
                }
              />

              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Upload File
                </span>

                <div className="rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/50 p-6 text-center transition hover:border-pink-400">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white text-pink-500 shadow-sm">
                    <FileText className="h-6 w-6" />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {submission.file
                      ? submission.file.name
                      : "Choose your research document"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    PDF, DOC, DOCX or PPT accepted
                  </p>

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) =>
                      setSubmission({
                        ...submission,
                        file: e.target.files?.[0] || null,
                      })
                    }
                    className="mt-4 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-pink-500 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-pink-600"
                  />
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={!submission.title.trim() || !submission.file}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white ${
                !submission.title.trim() || !submission.file
                  ? "cursor-not-allowed bg-slate-300"
                  : "bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400"
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload & Submit
            </button>
          </form>
        </div>
      )}
    </MainLayout>
  );
}

function ConferenceStat({ icon, title, value }) {
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

      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
      {React.cloneElement(icon, {
        className: "h-4 w-4 text-pink-500",
      })}

      <div>
        <p className="text-[10px] font-semibold uppercase text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 text-xs font-semibold text-slate-700">
          {value}
        </p>
      </div>
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