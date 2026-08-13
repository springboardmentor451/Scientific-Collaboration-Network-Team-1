import React from 'react';
import { Share2, Server, Database, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-900/50 py-5 px-6 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-mono">
        <div className="flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-zinc-300">SciConnect</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-zinc-400">
          <span className="flex items-center space-x-1">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>FastAPI Server Status: Healthy</span>
          </span>
          <span className="flex items-center space-x-1">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>PostgreSQL Engine Connected</span>
          </span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>OAuth2 / JWT Auth</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
