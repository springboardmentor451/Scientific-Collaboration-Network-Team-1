import React, { useState } from 'react';
import {
  Shield,
  Users,
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  Search,
  Check
} from 'lucide-react';
import { INITIAL_RESEARCHERS } from '../data/mockData';
import { ResearcherNode } from '../types';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [userList, setUserList] = useState<ResearcherNode[]>(INITIAL_RESEARCHERS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-zinc-100">System Administration & Network Governance</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                System Admin
              </span>
            </div>
            <p className="text-xs text-zinc-400">User role management, graph node integrity & security logs</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Export Governance Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Admin Health Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">Total System Users</span>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">1,420</div>
          <p className="text-[10px] text-emerald-400 font-mono">100% Verified Academic ORCID</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Graph Nodes Active</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">6,890</div>
          <p className="text-[10px] text-zinc-500">0 Orphaned Nodes</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">FastAPI Backend Health</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">99.98%</div>
          <p className="text-[10px] text-zinc-500">24ms Latency</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Security Audit Status</span>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">Compliant</div>
          <p className="text-[10px] text-zinc-500">OAuth2 & JWT Enforced</p>
        </div>
      </div>

      {/* User Governance Table */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>User Accounts & RBAC Role Management</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[10px]">
              <tr>
                <th className="p-3">User Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Institution</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300 text-[11px]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="p-3 font-bold text-zinc-100">{user.name}</td>
                  <td className="p-3 text-zinc-400 font-sans">{user.email || `${user.id}@university.edu`}</td>
                  <td className="p-3 text-indigo-300 font-sans">{user.institution}</td>
                  <td className="p-3 font-bold text-amber-400">{user.role}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold text-[10px]">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
