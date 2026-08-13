import React, { useState } from 'react';
import {
  Share2,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  Building,
  Sparkles,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import GlobalSearchBar from './GlobalSearchBar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole, ResearcherNode, ResearchProject } from '../types';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onSelectResearcher: (researcher: ResearcherNode) => void;
  onSelectInstitution: (institutionName: string) => void;
  onSelectProject: (project: ResearchProject) => void;
  onGlobalSearchSubmit: (query: string) => void;
}

export default function Navbar({
  activeTab,
  onNavigate,
  onSelectResearcher,
  onSelectInstitution,
  onSelectProject,
  onGlobalSearchSubmit,
}: NavbarProps) {
  const { user, role, setRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const rolesList: UserRole[] = ['Researcher', 'Institution Admin', 'System Admin'];

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center space-x-3 shrink-0 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/30">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-tight text-zinc-100">
                SciConnect
              </h1>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>v2.4 Live</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Connecting Science, People & Ideas.</p>
          </div>
        </div>

        {/* Center Global Search Component */}
        <div className="flex-1 flex justify-center max-w-lg mx-auto w-full">
          <GlobalSearchBar
            onSelectResearcher={onSelectResearcher}
            onSelectInstitution={onSelectInstitution}
            onSelectProject={onSelectProject}
            onSearchQuerySubmit={onGlobalSearchSubmit}
          />
        </div>

        {/* Right User & Role Controls */}
        <div className="flex items-center justify-end space-x-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-zinc-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3 space-y-2 z-50">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-zinc-200">Platform Notifications</span>
                  <button
                    onClick={() => onNavigate('notifications')}
                    className="text-[10px] font-mono text-indigo-400 hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto text-xs">
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-[11px] text-zinc-200">
                        <span>{n.title}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/40 text-xs font-semibold text-zinc-300 transition-all flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Role: <strong className="text-indigo-300">{role}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-zinc-500">Switch Active Role</div>
                {rolesList.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setShowRoleDropdown(false);
                      if (r === 'Researcher') onNavigate('dashboard-researcher');
                      else if (r === 'Institution Admin') onNavigate('dashboard-institution');
                      else if (r === 'System Admin') onNavigate('dashboard-admin');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      role === r
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{r}</span>
                    {role === r && <Sparkles className="w-3 h-3 text-amber-300" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account Menu Button */}
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-200 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {user.name[0]}
                </div>
                <span className="font-semibold hidden sm:inline">{user.name.split(' ')[0]}</span>
              </button>

              <button
                onClick={logout}
                className="p-1.5 rounded-xl bg-zinc-950 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/40 text-zinc-400 hover:text-red-300 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
