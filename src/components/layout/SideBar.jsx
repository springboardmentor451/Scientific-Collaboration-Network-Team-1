import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';

import {
  LayoutDashboard,
  Users,
  BookOpen,
  GitFork,
  FolderGit2,
  BarChart3,
  Calendar,
  Building2,
  Quote,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  LogOut,
  FlaskConical,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/researchers', label: 'Researchers', icon: Users },
  { path: '/publications', label: 'Publications', icon: BookOpen },
  { path: '/collaborations', label: 'Collaborations', icon: GitFork },
  { path: '/projects', label: 'Projects', icon: FolderGit2 },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/conferences', label: 'Conferences', icon: Calendar },
  { path: '/institutions', label: 'Institutions', icon: Building2 },
  { path: '/citations', label: 'Citations', icon: Quote },
  { path: '/reports', label: 'Reports', icon: FileSpreadsheet },
  { path: '/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { currentUser } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <aside className="w-64 h-screen shrink-0 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#fff8f6] via-[#fff5f4] to-[#fff3ee] border-r border-pink-100/80 shadow-xl shadow-pink-100/20">

      {/* Decorative glow */}

      <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute bottom-20 -right-24 w-48 h-48 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* ================= BRAND ================= */}

      <div className="relative h-20 flex items-center px-5 border-b border-pink-100/80">

        <div className="flex items-center space-x-3">

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 text-white flex items-center justify-center shadow-lg shadow-pink-200/50">

            <FlaskConical className="w-5 h-5" />

          </div>

          <div>

            <span className="font-bold text-slate-900 text-base tracking-wide">
              Sci<span className="text-pink-500">Collab</span>
            </span>

            <p className="text-[9px] text-slate-400 font-medium">
              Research Network
            </p>

          </div>

        </div>

      </div>

      {/* ================= NAVIGATION ================= */}

      <nav className="relative flex-1 overflow-y-auto px-3 py-5 space-y-1">

        <p className="px-3 mb-3 text-[9px] font-bold tracking-[0.15em] text-slate-400">
          WORKSPACE
        </p>

        {navItems.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-md shadow-pink-200/60'
                    : 'text-slate-600 hover:text-pink-600 hover:bg-white/70 hover:shadow-sm'
                }`
              }
            >

              {({ isActive }) => (

                <>
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-pink-500'
                    }`}
                  />

                  <span>{item.label}</span>

                  {isActive && (
                    <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/90" />
                  )}

                </>

              )}

            </NavLink>

          );

        })}

      </nav>

      {/* ================= USER AREA ================= */}

      <div className="relative p-4 border-t border-pink-100/80 bg-white/30 backdrop-blur-xl">

        <div className="flex items-center space-x-3 mb-3">

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-pink-200/50">

            {currentUser?.name?.charAt(0) || 'U'}

          </div>

          <div className="flex-1 min-w-0">

            <p className="text-xs font-semibold text-slate-800 truncate">
              {currentUser?.name || 'Researcher'}
            </p>

            <p className="text-[10px] text-slate-400 truncate">
              {currentUser?.role || 'Researcher'}
            </p>

          </div>

        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-white/60 hover:bg-pink-50 hover:text-pink-600 text-slate-500 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border border-pink-100"
        >

          <LogOut className="w-3.5 h-3.5" />

          <span>Sign Out</span>

        </button>

      </div>

    </aside>
  );
}