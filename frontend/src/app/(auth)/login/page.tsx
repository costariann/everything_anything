'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../../../features/auth/authService';
import { useAuthStore } from '../../../stores/authStore';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ThemeToggle } from '../../../components/ui/ThemeToggle';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      if (data) {
        setAuth(data.user, data.tokens.accessToken);
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push(redirectUrl);
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setEmail('dacostaobiriyeboah@gmail.com');
      setPassword('something_secret@!!');
    } else {
      setEmail('customer@example.com');
      setPassword('Customer123!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors duration-200">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center"
      >
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 border border-slate-200/80 dark:border-slate-800 group-hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="everythinganything Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
            everything<span className="text-indigo-600 dark:text-indigo-400">anything</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sign in to your account or access the administration dashboard.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-xl space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full shadow-lg shadow-indigo-600/25 mt-2 active:scale-[0.98]"
            >
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-center">
              Quick Fill Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300 text-[11px] font-semibold transition-colors"
              >
                Store Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('customer')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300 text-[11px] font-semibold transition-colors"
              >
                Sample Customer
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
