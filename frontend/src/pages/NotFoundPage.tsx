import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (tab: string) => void;
}

export default function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-4">
      <div className="text-6xl font-extrabold text-indigo-400 font-mono">404</div>
      <h1 className="text-xl font-bold text-zinc-100">Page Not Found</h1>
      <p className="text-xs text-zinc-400">
        The requested academic route or dataset does not exist or has been moved.
      </p>

      <button
        onClick={() => onNavigate('landing')}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md inline-flex items-center space-x-2"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home Landing</span>
      </button>
    </div>
  );
}
