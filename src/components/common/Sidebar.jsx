import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, FolderKanban, Network, 
  Presentation, Building2, Quote, BarChart3, FileText, 
  ShieldAlert, Settings, LogOut 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Researchers', path: '/researchers', icon: Users },
  { name: 'Publications', path: '/publications', icon: BookOpen },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Collaborations', path: '/collaborations', icon: Network },
  { name: 'Conferences', path: '/conferences', icon: Presentation },
  { name: 'Institutions', path: '/institutions', icon: Building2 },
  { name: 'Citations', path: '/citations', icon: Quote },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      <div className="p-5 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
          SC
        </div>
        <div>
          <h1 className="font-bold text-sm text-white">SciCollab</h1>
          <p className="text-[10px] text-slate-400">Network Analyzer</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <NavLink 
          to="/"
          className="flex items-center space-x-3 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-400 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}
