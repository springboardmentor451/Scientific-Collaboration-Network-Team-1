import React, { useState } from 'react';
import { User, Mail, Building, Globe, Award, BookOpen, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Dr. Alena Vass');
  const [email, setEmail] = useState(user?.email || 'a.vass@stanford.edu');
  const [institution, setInstitution] = useState(user?.institution || 'Stanford University');
  const [orcid, setOrcid] = useState(user?.orcid || '0000-0002-1823-9912');
  const [bio, setBio] = useState('Lead Researcher in Quantum Topological Qubits and Superconducting Circuits.');
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
            <User className="w-5 h-5 text-indigo-400" />
            <span>Academic Profile Settings</span>
          </h1>
          <p className="text-xs text-zinc-400">Manage ORCID identity, affiliation details, and bio</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-sm text-xs">
        <div>
          <label className="font-semibold text-zinc-300 block mb-1">Full Name & Academic Title</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-zinc-300 block mb-1">Academic Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
            />
          </div>
          <div>
            <label className="font-semibold text-zinc-300 block mb-1">Institution Affiliation</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-zinc-300 block mb-1">ORCID ID Identifier</label>
          <input
            type="text"
            value={orcid}
            onChange={(e) => setOrcid(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 font-mono font-bold"
          />
        </div>

        <div>
          <label className="font-semibold text-zinc-300 block mb-1">Research Biography</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 leading-relaxed"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Profile Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
