import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export interface ThemeToggleProps {
  variant?: 'header' | 'floating' | 'pill' | 'button';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'header',
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // if (variant === 'floating') {
  //   return (
  //     <div className={`fixed bottom-5 right-5 z-50 ${className}`}>
  //       <button
  //         type="button"
  //         onClick={toggleTheme}
  //         aria-label={isDark ? 'Switch to Light Mode (Alt+T)' : 'Switch to Dark Mode (Alt+T)'}
  //         title={isDark ? 'Switch to Light Mode (Alt+T)' : 'Switch to Dark Mode (Alt+T)'}
  //         className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 shadow-lg hover:shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-navy-500/30"
  //       >
  //         <div className="relative w-5 h-5 flex items-center justify-center">
  //           <Sun
  //             className={`w-4 h-4 text-amber-500 transition-all duration-300 absolute ${
  //               isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
  //             }`}
  //           />
  //           <Moon
  //             className={`w-4 h-4 text-navy-600 dark:text-cyan-400 transition-all duration-300 absolute ${
  //               isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
  //             }`}
  //           />
  //         </div>
  //         <span className="text-xs font-bold tracking-tight select-none">
  //           {isDark ? 'Light' : 'Dark'}
  //         </span>
  //         <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
  //           Alt+T
  //         </span>
  //       </button>
  //     </div>
  //   );
  // }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-850 transition-all ${className}`}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          <Sun
            className={`w-3.5 h-3.5 text-amber-500 transition-all duration-300 absolute ${
              isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
            }`}
          />
          <Moon
            className={`w-3.5 h-3.5 text-navy-600 dark:text-cyan-400 transition-all duration-300 absolute ${
              isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
            }`}
          />
        </div>
        <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
      </button>
    );
  }

  // Header / default icon button
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode (Alt+T)' : 'Switch to Dark Mode (Alt+T)'}
      title={isDark ? 'Switch to Light Mode (Alt+T)' : 'Switch to Dark Mode (Alt+T)'}
      className={`relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-navy-500/20 ${className}`}
    >
      <div className="w-5 h-5 flex items-center justify-center relative">
        <Sun
          className={`w-4 h-4 text-amber-500 transition-all duration-300 absolute ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
        <Moon
          className={`w-4 h-4 text-navy-600 dark:text-cyan-400 transition-all duration-300 absolute ${
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </div>
      {showLabel && (
        <span className="ml-2 text-xs font-semibold">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
