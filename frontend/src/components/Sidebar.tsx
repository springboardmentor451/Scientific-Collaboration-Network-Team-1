import React from 'react';
import {
  Home,
  LayoutDashboard,
  Building,
  Shield,
  Share2,
  Users,
  BookOpen,
  Briefcase,
  Calendar,
  Award,
  FileText,
  Bell,
  User,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export default function Sidebar({ activeTab, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'landing', label: 'Home Landing', icon: Home, category: 'Main' },
    { id: 'dashboard-researcher', label: 'Researcher Portal', icon: LayoutDashboard, category: 'Dashboards' },
    { id: 'dashboard-institution', label: 'Institution Portal', icon: Building, category: 'Dashboards' },
    { id: 'dashboard-admin', label: 'Admin Portal', icon: Shield, category: 'Dashboards' },
    
    { id: 'collaboration', label: 'Network Visualizer', icon: Share2, category: 'Modules' },
    { id: 'researchers', label: 'Faculty Roster', icon: Users, category: 'Modules' },
    { id: 'publications', label: 'Publications', icon: BookOpen, category: 'Modules' },
    { id: 'projects', label: 'Grants & Projects', icon: Briefcase, category: 'Modules' },
    { id: 'conferences', label: 'Conferences', icon: Calendar, category: 'Modules' },
    { id: 'citations', label: 'Citation Analytics', icon: Award, category: 'Modules' },
    { id: 'reports', label: 'Export Reports', icon: FileText, category: 'Modules' },

    { id: 'notifications', label: 'Notifications', icon: Bell, category: 'Account' },
    { id: 'profile', label: 'Researcher Profile', icon: User, category: 'Account' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'Account' },
  ];

  return (
    <nav className="bg-zinc-900/60 border-b border-zinc-800/80 px-4 py-2 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center space-x-1.5 text-xs font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
