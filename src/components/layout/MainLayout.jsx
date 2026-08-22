import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderKanban,
  Network,
  CalendarDays,
  Building2,
  Quote,
  LineChart,
  FileBarChart,
  ShieldCheck,
  Settings,
  LogOut,
  Search,
  Bell,
  Plus,
  ChevronLeft,
  User,
  Activity,
  FlaskConical,
  X,
} from "lucide-react";
import { useData } from "../../context/DataContext";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Researchers", path: "/researchers", icon: Users },
  { name: "Publications", path: "/publications", icon: BookOpen },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Collaborations", path: "/collaborations", icon: Network },
  { name: "Conferences", path: "/conferences", icon: CalendarDays },
  { name: "Institutions", path: "/institutions", icon: Building2 },
  { name: "Citations", path: "/citations", icon: Quote },
  { name: "Analytics", path: "/analytics", icon: LineChart },
  { name: "Reports", path: "/reports", icon: FileBarChart },
  { name: "Audit Logs", path: "/audit-logs", icon: ShieldCheck },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function MainLayout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const goToProfile = () => {
    setShowProfile(false);
    navigate("/profile");
  };

  const goToSettings = () => {
    setShowProfile(false);
    navigate("/settings");
  };

  const logout = () => {
    navigate("/");
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "HS";

  return (
    <>
      <style>{`

        /* =====================================================
           SCINEXUS GLOBAL THEME
        ===================================================== */

        * {
          box-sizing: border-box;
        }

        html {
          background: #f8fafc;
        }

        body {
          margin: 0;
          background: #f8fafc;
          color: #0f172a;
          transition:
            background-color 0.25s ease,
            color 0.25s ease;
        }

        /* =====================================================
           DARK MODE FOUNDATION
        ===================================================== */

        html.dark {
          background: #0b1120;
        }

        html.dark body {
          background:
            radial-gradient(
              circle at top right,
              rgba(147, 51, 234, 0.10),
              transparent 32%
            ),
            radial-gradient(
              circle at bottom left,
              rgba(236, 72, 153, 0.08),
              transparent 30%
            ),
            #0b1120;
          color: #e2e8f0;
        }

        html.dark .scinexus-page {
          background:
            radial-gradient(
              circle at 85% 10%,
              rgba(147, 51, 234, 0.10),
              transparent 25%
            ),
            radial-gradient(
              circle at 10% 90%,
              rgba(236, 72, 153, 0.08),
              transparent 28%
            ),
            #0b1120 !important;
          color: #e2e8f0 !important;
        }

        /* =====================================================
           DARK SIDEBAR
        ===================================================== */

        html.dark .scicollab-sidebar {
          background: rgba(15, 23, 42, 0.97) !important;
          border-color: #1e293b !important;
        }

        html.dark .scicollab-sidebar h1 {
          color: #f8fafc !important;
        }

        html.dark .scicollab-sidebar p {
          color: #94a3b8 !important;
        }

        html.dark .scicollab-nav-item {
          color: #94a3b8 !important;
        }

        html.dark .scicollab-nav-item:hover {
          background: rgba(236, 72, 153, 0.10) !important;
          color: #f9a8d4 !important;
        }

        html.dark .scicollab-sidebar-bottom {
          border-color: #1e293b !important;
        }

        /* =====================================================
           DARK TOP BAR
        ===================================================== */

        html.dark .scicollab-header {
          background: rgba(15, 23, 42, 0.92) !important;
          border-color: #1e293b !important;
        }

        html.dark .scicollab-search {
          background: #111827 !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }

        html.dark .scicollab-search::placeholder {
          color: #64748b !important;
        }

        html.dark .scicollab-icon-button:hover {
          background: #1e293b !important;
        }

        /* =====================================================
           GLOBAL DARK MODE
        ===================================================== */

        html.dark .bg-white,
        html.dark .bg-white\\/80,
        html.dark .bg-white\\/90,
        html.dark .bg-white\\/95 {
          background-color: #111827 !important;
        }

        html.dark .bg-slate-50,
        html.dark .bg-slate-50\\/60,
        html.dark .bg-slate-50\\/70 {
          background-color: #172033 !important;
        }

        html.dark .bg-pink-50 {
          background-color: rgba(236, 72, 153, 0.10) !important;
        }

        html.dark .bg-purple-50 {
          background-color: rgba(139, 92, 246, 0.10) !important;
        }

        html.dark .bg-orange-50 {
          background-color: rgba(249, 115, 22, 0.10) !important;
        }

        html.dark .text-slate-950,
        html.dark .text-slate-900,
        html.dark .text-slate-800,
        html.dark .text-slate-700 {
          color: #f1f5f9 !important;
        }

        html.dark .text-slate-600 {
          color: #cbd5e1 !important;
        }

        html.dark .text-slate-500 {
          color: #94a3b8 !important;
        }

        html.dark .text-slate-400 {
          color: #64748b !important;
        }

        html.dark .border-slate-200,
        html.dark .border-slate-100,
        html.dark .border-white\\/80 {
          border-color: #263449 !important;
        }

        html.dark .border-pink-100 {
          border-color: #1e293b !important;
        }

        html.dark input,
        html.dark textarea,
        html.dark select {
          background-color: #111827 !important;
          color: #e2e8f0 !important;
          border-color: #334155 !important;
        }

        html.dark input::placeholder,
        html.dark textarea::placeholder {
          color: #64748b !important;
        }

        html.dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]) {
          border-color: #263449 !important;
        }

        /* =====================================================
           DROPDOWN
        ===================================================== */

        .scicollab-dropdown {
          animation: scicollabDrop 0.16s ease-out;
        }

        @keyframes scicollabDrop {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        html.dark .scicollab-dropdown {
          background: #111827 !important;
          border-color: #334155 !important;
        }

        html.dark .scicollab-dropdown-item {
          color: #cbd5e1 !important;
        }

        html.dark .scicollab-dropdown-item:hover {
          background: #1e293b !important;
          color: #f8fafc !important;
        }

        /* =====================================================
           SELECTION
        ===================================================== */

        ::selection {
          background: #f9a8d4;
          color: #831843;
        }

        html.dark ::selection {
          background: #9d174d;
          color: white;
        }

        /* =====================================================
           COMPACT SIDEBAR
        ===================================================== */

        .scicollab-sidebar nav {
          scrollbar-width: none;
        }

        .scicollab-sidebar nav::-webkit-scrollbar {
          display: none;
        }

        /* =====================================================
           SCINEXUS LOGO
        ===================================================== */

        .scinexus-logo {
          object-fit: contain;
          display: block;
        }

      `}</style>

      <div className="scinexus-page min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-orange-50 text-slate-900">

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside
          className={`scicollab-sidebar fixed left-0 top-0 bottom-0 ${
            sidebarCollapsed ? "w-[88px]" : "w-[300px]"
          } z-50 flex flex-col border-r border-pink-100 bg-white/95 backdrop-blur-xl transition-all duration-300`}
        >

          {/* =================================================
              LOGO / BRAND
          ================================================= */}

          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-3">

              {/* YOUR LOGO IMAGE FROM PUBLIC FOLDER */}

              <div
                className={`flex ${
                  sidebarCollapsed
                    ? "h-11 w-11"
                    : "h-11 w-11"
                } shrink-0 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-lg shadow-pink-200/40`}
              >
                <img
                  src="/logo.png"
                  alt="SciNexus Logo"
                  className="scinexus-logo h-full w-full object-contain"
                />
              </div>

              {!sidebarCollapsed && (
                <div className="min-w-0">

                  <h1 className="text-xl font-bold leading-tight text-slate-900">
                    SciNexus
                  </h1>

                  <p className="text-[10px] leading-tight text-slate-500">
                    Scientific Collaboration
                  </p>

                  <p className="text-[10px] leading-tight text-slate-500">
                    Network Analyzer
                  </p>

                </div>
              )}

            </div>
          </div>

          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav className="flex-1 overflow-y-auto px-3">

            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-pink-400">
                Main Menu
              </p>
            )}

            <div className="space-y-1">

              {menuItems.map((item) => {
                const Icon = item.icon;

                const active =
                  location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={
                      sidebarCollapsed
                        ? item.name
                        : ""
                    }
                    className={`scicollab-nav-item flex items-center ${
                      sidebarCollapsed
                        ? "justify-center"
                        : "gap-3"
                    } rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg shadow-pink-200"
                        : "text-slate-600 hover:bg-pink-50 hover:text-pink-600"
                    }`}
                  >

                    <Icon className="h-[18px] w-[18px] shrink-0" />

                    {!sidebarCollapsed && (
                      <span>{item.name}</span>
                    )}

                  </Link>
                );
              })}

            </div>
          </nav>

          {/* =================================================
              LOGOUT ONLY
          ================================================= */}

          <div className="scicollab-sidebar-bottom border-t border-pink-100 px-3 py-3">

            <button
              onClick={logout}
              className={`flex w-full items-center ${
                sidebarCollapsed
                  ? "justify-center"
                  : "gap-3"
              } rounded-xl px-4 py-2.5 text-sm text-slate-500 transition hover:bg-orange-50 hover:text-orange-600`}
              title={sidebarCollapsed ? "Logout" : ""}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />

              {!sidebarCollapsed && (
                <span>Logout</span>
              )}
            </button>

          </div>
        </aside>

        {/* =====================================================
            MAIN AREA
        ===================================================== */}

        <div
          className={`min-h-screen transition-all duration-300 ${
            sidebarCollapsed
              ? "ml-[88px]"
              : "ml-[300px]"
          }`}
        >

          {/* =================================================
              TOP BAR
          ================================================= */}

          <header className="scicollab-header sticky top-0 z-40 h-[76px] border-b border-pink-100 bg-white/90 backdrop-blur-xl">

            <div className="flex h-full items-center gap-4 px-6">

              {/* Collapse */}

              <button
                onClick={() =>
                  setSidebarCollapsed(
                    (value) => !value
                  )
                }
                className="scicollab-icon-button flex h-9 w-9 items-center justify-center rounded-full hover:bg-pink-50"
              >
                <ChevronLeft
                  className={`h-5 w-5 text-slate-500 transition-transform ${
                    sidebarCollapsed
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* Search */}

              <div className="max-w-[700px] flex-1">

                <div className="relative">

                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Search researchers, publications, projects..."
                    className="scicollab-search h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-5 text-sm text-slate-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-300"
                  />

                </div>
              </div>

              {/* Right Side */}

              <div className="ml-auto flex items-center gap-2">

                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <div className="relative">

                  <button
                    onClick={() =>
                      setShowNotifications(
                        (value) => !value
                      )
                    }
                    className="scicollab-icon-button relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-pink-50"
                  >
                    <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />

                    <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                      4
                    </span>
                  </button>

                  {showNotifications && (
                    <div className="scicollab-dropdown absolute right-0 top-12 w-[330px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">

                      <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-3">

                        <div>
                          <p className="font-bold text-slate-900">
                            Notifications
                          </p>

                          <p className="text-xs text-slate-500">
                            4 new updates
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setShowNotifications(false)
                          }
                          className="rounded-lg p-1 hover:bg-slate-100"
                        >
                          <X className="h-4 w-4 text-slate-400" />
                        </button>

                      </div>

                      <NotificationItem
                        icon={<BookOpen />}
                        title="New publication"
                        text="A new publication was added to the network."
                      />

                      <NotificationItem
                        icon={<Network />}
                        title="Collaboration request"
                        text="You received a new collaboration request."
                      />

                      <NotificationItem
                        icon={<Quote />}
                        title="Citation update"
                        text="Your research received new citations."
                      />

                      <NotificationItem
                        icon={<CalendarDays />}
                        title="Conference reminder"
                        text="Upcoming conference participation."
                      />

                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate("/settings");
                        }}
                        className="mt-2 w-full rounded-xl bg-pink-50 py-2.5 text-xs font-bold text-pink-600 hover:bg-pink-100"
                      >
                        Notification Settings
                      </button>

                    </div>
                  )}

                </div>

                {/* =================================================
                    QUICK ACTION
                ================================================= */}

                <button
                  onClick={() => navigate("/projects")}
                  className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:scale-[1.02] lg:flex"
                >
                  <Plus className="h-4 w-4" />
                  Quick Action
                </button>

                {/* =================================================
                    PROFILE
                ================================================= */}

                <div className="relative ml-1">

                  <button
                    onClick={() =>
                      setShowProfile(
                        (value) => !value
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-xs font-bold text-white shadow-sm transition hover:scale-105"
                    title="My Profile"
                  >
                    {initials}
                  </button>

                  {showProfile && (
                    <div className="scicollab-dropdown absolute right-0 top-12 w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">

                      {/* User */}

                      <div className="mb-2 rounded-xl bg-gradient-to-r from-pink-50 via-purple-50 to-orange-50 p-3">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-xs font-bold text-white">
                            {initials}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-slate-900">
                              {currentUser?.name}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {currentUser?.role}
                            </p>

                          </div>

                        </div>
                      </div>

                      <DropdownItem
                        icon={<User />}
                        label="My Profile"
                        onClick={goToProfile}
                      />

                      <DropdownItem
                        icon={<Activity />}
                        label="My Activity"
                        onClick={() =>
                          navigate("/audit-logs")
                        }
                      />

                      <DropdownItem
                        icon={<FlaskConical />}
                        label="My Researches"
                        onClick={() =>
                          navigate("/researchers")
                        }
                      />

                      <DropdownItem
                        icon={<Settings />}
                        label="Settings"
                        onClick={goToSettings}
                      />

                      <div className="my-2 border-t border-slate-100" />

                      <DropdownItem
                        icon={<LogOut />}
                        label="Logout"
                        danger
                        onClick={logout}
                      />

                    </div>
                  )}

                </div>

              </div>
            </div>
          </header>

          {/* =================================================
              PAGE CONTENT
          ================================================= */}

          <main className="p-8">

            {title && (
              <div className="mb-7">

                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-pink-500">
                  SciNexus
                </p>

                <h1 className="text-3xl font-bold text-slate-900">
                  {title}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Scientific collaboration network analyzer.
                </p>

              </div>
            )}

            {children}

          </main>

        </div>
      </div>
    </>
  );
}

/* ============================================================
   NOTIFICATION ITEM
============================================================ */

function NotificationItem({ icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-xl p-3 transition hover:bg-slate-50">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-500">

        {React.cloneElement(icon, {
          className: "h-4 w-4",
        })}

      </div>

      <div>

        <p className="text-xs font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
          {text}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   PROFILE DROPDOWN ITEM
============================================================ */

function DropdownItem({
  icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`scicollab-dropdown-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >

      {React.cloneElement(icon, {
        className: "h-4 w-4",
      })}

      {label}

    </button>
  );
}