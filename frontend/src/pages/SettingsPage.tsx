import React, { useState } from 'react';
import { Settings, Server, Database, Shield, Bell, Check } from 'lucide-react';

export default function SettingsPage() {
  const [useLiveBackend, setUseLiveBackend] = useState(false);
  const [apiUrl, setApiUrl] = useState('/api/v1');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>Platform Integration & System Settings</span>
          </h1>
          <p className="text-xs text-zinc-400">Configure FastAPI endpoint, mock/live data modes & preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6 text-xs shadow-sm">
        {/* Backend Endpoint Settings */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>FastAPI Server & Service Connection</span>
          </h3>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-zinc-200">Data Source Mode</span>
                <p className="text-[11px] text-zinc-400">Toggle between Axios Mock JSON & Live FastAPI endpoints</p>
              </div>
              <button
                type="button"
                onClick={() => setUseLiveBackend(!useLiveBackend)}
                className={`px-3 py-1 rounded-lg font-mono font-bold text-[11px] transition-all ${
                  useLiveBackend
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {useLiveBackend ? 'Live FastAPI Mode' : 'Mock JSON Mode'}
              </button>
            </div>

            <div>
              <label className="font-mono text-zinc-400 block mb-1">Axios API Base URL Path</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-400 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Notification Preferences</span>
          </h3>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-zinc-300">Email Alerts for Citations & Grants</span>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <span>Save System Settings</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
