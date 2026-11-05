'use client';

import React from 'react';
import { Sun, Moon, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { themeMode, setThemeMode } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Use 'auto' as stable initial mode during SSR and pre-hydration
  const currentMode = mounted ? themeMode : 'auto';

  return (
    <div className={`flex items-center bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-full p-1 ${className}`}>
      <button
        onClick={() => setThemeMode('light')}
        className={`p-1.5 rounded-full transition-all ${
          currentMode === 'light'
            ? 'bg-white text-amber-500 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Force Light Mode"
        type="button"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setThemeMode('auto')}
        className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${
          currentMode === 'auto'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Auto Day/Night (Light by day, Dark by night)"
        type="button"
      >
        <Clock className="w-3 h-3" />
        <span>Auto</span>
      </button>

      <button
        onClick={() => setThemeMode('dark')}
        className={`p-1.5 rounded-full transition-all ${
          currentMode === 'dark'
            ? 'bg-slate-800 text-indigo-400 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Force Dark Mode"
        type="button"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

