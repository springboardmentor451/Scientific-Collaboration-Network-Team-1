import React, { useState } from 'react';
import { Share2, Lock, Mail, User, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Researcher');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || 'researcher@university.edu', role);
    onNavigate('dashboard-researcher');
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/30">
          <Share2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Create Academic Profile</h1>
        <p className="text-xs text-zinc-400">Join SciConnect • Connecting Science, People & Ideas.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Full Name & Title</label>
          <div className="relative">
            <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Alena Vass"
              required
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Academic Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="a.vass@stanford.edu"
              required
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Affiliated Institution</label>
          <div className="relative">
            <Building className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Stanford University"
              required
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2"
        >
          <span>Complete Registration</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-2 text-center text-xs text-zinc-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-indigo-400 font-bold hover:underline"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
