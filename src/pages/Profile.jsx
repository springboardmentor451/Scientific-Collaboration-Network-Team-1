import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { useData } from "../context/DataContext";
import {
  User,
  Mail,
  Building2,
  ShieldCheck,
  Pencil,
  Save,
  X,
  Activity,
  BookOpen,
  Quote,
  Users,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Microscope,
  Settings,
  LogOut,
} from "lucide-react";

export default function Profile() {
  const { currentUser, updateProfile, publications } = useData();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const section = searchParams.get("section") || "profile";

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    department: currentUser?.department || "",
    role: currentUser?.role || "",
    orcId: currentUser?.orcId || "",
    bio: currentUser?.bio || "",
  });

  const userResearches = useMemo(() => {
    if (!currentUser?.name) return [];

    return publications.filter((publication) =>
      publication.authors?.some(
        (author) =>
          author.toLowerCase() ===
          currentUser.name.toLowerCase()
      )
    );
  }, [publications, currentUser]);

  const saveProfile = (e) => {
    e.preventDefault();

    updateProfile(form);
    setEditing(false);
  };

  const roleDescription = getRoleDescription(
    currentUser?.role
  );

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* HEADER */}

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your profile, research activity and account information.
          </p>
        </div>

        {/* PROFILE HERO */}

        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-sm backdrop-blur-xl">

          <div className="h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400" />

          <div className="px-6 pb-6">

            <div className="-mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div className="flex items-end gap-4">

                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-pink-500 to-orange-400 text-2xl font-bold text-white shadow-xl">
                  {getInitials(currentUser?.name)}
                </div>

                <div className="pb-1">

                  <h2 className="text-2xl font-bold text-slate-900">
                    {currentUser?.name}
                  </h2>

                  <p className="text-sm font-semibold text-pink-500">
                    {currentUser?.role}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {currentUser?.department}
                  </p>

                </div>

              </div>

              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>

            </div>

          </div>

        </div>

        {/* QUICK PROFILE NAVIGATION */}

        <div className="grid gap-3 sm:grid-cols-4">

          <ProfileTab
            icon={<User />}
            label="Profile"
            active={section === "profile"}
            onClick={() => navigate("/profile")}
          />

          <ProfileTab
            icon={<Activity />}
            label="My Activity"
            active={section === "activity"}
            onClick={() =>
              navigate("/profile?section=activity")
            }
          />

          <ProfileTab
            icon={<Microscope />}
            label="My Researches"
            active={section === "research"}
            onClick={() =>
              navigate("/profile?section=research")
            }
          />

          <ProfileTab
            icon={<Settings />}
            label="Settings"
            active={section === "settings"}
            onClick={() =>
              navigate("/settings")
            }
          />

        </div>

        {/* PROFILE */}

        {section === "profile" && (
          <ProfileInformation
            currentUser={currentUser}
            roleDescription={roleDescription}
          />
        )}

        {/* ACTIVITY */}

        {section === "activity" && (
          <ActivitySection
            currentUser={currentUser}
          />
        )}

        {/* RESEARCH */}

        {section === "research" && (
          <ResearchSection
            researches={userResearches}
          />
        )}

        {/* EDIT MODAL */}

        {editing && (
          <div className="fixed inset-0 z-[200] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">

            <form
              onSubmit={saveProfile}
              className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
            >

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                    Account
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Edit Profile
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl p-2 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

                <Input
                  label="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />

                <Input
                  label="Department"
                  value={form.department}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      department: e.target.value,
                    })
                  }
                />

                <Input
                  label="Role"
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value,
                    })
                  }
                />

                <Input
                  label="ORCID"
                  value={form.orcId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      orcId: e.target.value,
                    })
                  }
                />

              </div>

              <label className="mt-4 block">

                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Bio
                </span>

                <textarea
                  value={form.bio}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bio: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                />

              </label>

              <button
                type="submit"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 py-3 font-bold text-white"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>

            </form>

          </div>
        )}

      </div>
    </MainLayout>
  );
}

/* =====================================================
   PROFILE INFORMATION
===================================================== */

function ProfileInformation({
  currentUser,
  roleDescription,
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">

      <div className="space-y-5 lg:col-span-2">

        <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

          <div className="flex items-center gap-3">

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-50 text-pink-500">
              <User className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Personal Information
              </h2>

              <p className="text-xs text-slate-500">
                Your account details
              </p>
            </div>

          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <Info
              icon={<User />}
              label="Name"
              value={currentUser?.name}
            />

            <Info
              icon={<Mail />}
              label="Email"
              value={currentUser?.email}
            />

            <Info
              icon={<Building2 />}
              label="Department"
              value={currentUser?.department}
            />

            <Info
              icon={<ShieldCheck />}
              label="Role"
              value={currentUser?.role}
            />

            <Info
              icon={<Quote />}
              label="ORCID"
              value={currentUser?.orcId || "Not added"}
            />

          </div>

        </div>

        <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

          <h2 className="font-bold text-slate-900">
            About You
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {currentUser?.bio ||
              roleDescription}
          </p>

        </div>

      </div>

      <div className="rounded-2xl border border-white/80 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 p-6 shadow-sm">

        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-pink-500 shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-wider text-pink-500">
          Current Role
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          {currentUser?.role}
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {roleDescription}
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   ACTIVITY
===================================================== */

function ActivitySection({ currentUser }) {
  const activities = [
    {
      title: "Updated research profile",
      time: "Today",
      icon: User,
    },
    {
      title: "Published a new research work",
      time: "Yesterday",
      icon: BookOpen,
    },
    {
      title: "Joined a collaboration",
      time: "2 days ago",
      icon: Users,
    },
    {
      title: "Attended a research conference",
      time: "1 week ago",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

      <div className="flex items-center gap-3">

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-500">
          <Activity className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-bold text-slate-900">
            My Activity
          </h2>

          <p className="text-xs text-slate-500">
            Recent activity for {currentUser?.name}
          </p>
        </div>

      </div>

      <div className="mt-6 space-y-3">

        {activities.map((activity, index) => {

          const Icon = activity.icon;

          return (
            <div
              key={index}
              className="flex items-center gap-4 rounded-xl bg-slate-50 p-4"
            >

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-pink-500 shadow-sm">
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1">

                <p className="text-sm font-semibold text-slate-700">
                  {activity.title}
                </p>

                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <Clock3 className="h-3 w-3" />
                  {activity.time}
                </p>

              </div>

              <CheckCircle2 className="h-4 w-4 text-pink-500" />

            </div>
          );
        })}

      </div>

    </div>
  );
}

/* =====================================================
   RESEARCH
===================================================== */

function ResearchSection({ researches }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

      <div className="flex items-center gap-3">

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-50 text-pink-500">
          <Microscope className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-bold text-slate-900">
            My Researches
          </h2>

          <p className="text-xs text-slate-500">
            Research publications connected to your profile
          </p>
        </div>

      </div>

      {researches.length > 0 ? (
        <div className="mt-6 space-y-3">

          {researches.map((research) => (
            <div
              key={research.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >

              <h3 className="font-bold text-slate-800">
                {research.title}
              </h3>

              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">

                <span>
                  {research.journal}
                </span>

                <span>
                  {research.year}
                </span>

                <span className="flex items-center gap-1">
                  <Quote className="h-3 w-3" />
                  {research.citations} citations
                </span>

              </div>

            </div>
          ))}

        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 py-12 text-center">

          <BookOpen className="mx-auto h-8 w-8 text-slate-300" />

          <p className="mt-3 text-sm font-semibold text-slate-600">
            No research publications found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Research connected to your profile will appear here.
          </p>

        </div>
      )}

    </div>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */

function ProfileTab({
  icon,
  label,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        active
          ? "border-pink-200 bg-pink-50 text-pink-600"
          : "border-white/80 bg-white/80 text-slate-500 hover:bg-pink-50 hover:text-pink-600"
      }`}
    >
      {React.cloneElement(icon, {
        className: "h-4 w-4",
      })}

      {label}
    </button>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-2">

        {React.cloneElement(icon, {
          className: "h-4 w-4 text-pink-500",
        })}

        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </span>

      </div>

      <p className="mt-2 text-sm font-semibold text-slate-700">
        {value || "Not provided"}
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

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getRoleDescription(role = "") {

  const normalized = role.toLowerCase();

  if (
    normalized.includes("principal") ||
    normalized.includes("researcher")
  ) {
    return "You are registered as a researcher in SciCollab. Your profile focuses on research publications, citations, collaborations, projects and scientific activity.";
  }

  if (normalized.includes("admin")) {
    return "You have administrative access to the SciCollab research network. Your profile can manage institutions, researchers, projects, reports and platform activity.";
  }

  if (normalized.includes("reviewer")) {
    return "You are registered as a reviewer. Your profile focuses on research evaluation, publication review activity and scientific quality assessment.";
  }

  if (normalized.includes("system")) {
    return "You have system-level administrative access. Your profile focuses on platform management, audit activity, security and system configuration.";
  }

  return "Your SciCollab profile contains your professional information, research activity and collaboration details.";
}