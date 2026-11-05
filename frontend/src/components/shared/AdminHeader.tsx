'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { LogOut, User } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

export const AdminHeader: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
          Admin Console
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <ThemeToggle />

        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <div className="font-semibold text-slate-900 dark:text-white">{user?.fullName || 'Administrator'}</div>
            <div className="text-[10px] text-slate-500">{user?.email || 'admin@everythinganything.com'}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          title="Sign out of admin"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
