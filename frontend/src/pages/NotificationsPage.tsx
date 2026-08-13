import React from 'react';
import { Bell, CheckCircle2, Award, Briefcase, Users } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <span>Real-Time Notifications & Collaboration Alerts</span>
          </h1>
          <p className="text-xs text-zinc-400">Updates on paper citations, co-authorship requests, and grant approvals</p>
        </div>
      </div>

      <div className="space-y-3">
        {MOCK_NOTIFICATIONS.map((n) => (
          <div key={n.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-100">{n.title}</h3>
                <p className="text-xs text-zinc-300 mt-1">{n.message}</p>
                <span className="text-[10px] font-mono text-zinc-500 mt-2 block">{n.timestamp}</span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-950 text-zinc-400 border border-zinc-800 shrink-0">
              {n.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
