'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { ApiResponse, HealthCheckData } from '@/types';

export default function Home() {
  const [healthData, setHealthData] = useState<HealthCheckData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiResponse<HealthCheckData>>('/health');
      if (response.data && response.data.data) {
        setHealthData(response.data.data);
      } else {
        throw new Error('Unexpected response format from backend');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend';
      setError(msg);
      setHealthData(null);
    } finally {
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="border-b border-slate-800 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                Environment Ready
              </span>
              <h1 className="text-3xl font-extrabold text-white mt-3 tracking-tight">
                everythinganything
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Full-Stack Architecture: Next.js App Router • Express • TypeScript • PostgreSQL • Docker
              </p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              {loading ? 'Checking...' : 'Re-check Connectivity'}
            </button>
          </div>
        </header>

        {/* Integration Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Frontend Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Frontend</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-xl font-bold text-white">Next.js 15</div>
            <p className="text-xs text-slate-400 mt-1">App Router • React 19 • Tailwind CSS</p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-emerald-400 font-medium">
              ✓ Running on Port 3000
            </div>
          </div>

          {/* Backend Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Backend API</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  loading ? 'bg-amber-400' : error ? 'bg-rose-400' : 'bg-emerald-400'
                }`}
              ></span>
            </div>
            <div className="text-xl font-bold text-white">Express.js API</div>
            <p className="text-xs text-slate-400 mt-1">
              {loading
                ? 'Pinging API...'
                : error
                ? 'Backend unreachable'
                : `Status: ${healthData?.status.toUpperCase()}`}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-300 truncate">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Database</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  healthData?.database.connected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              ></span>
            </div>
            <div className="text-xl font-bold text-white">PostgreSQL</div>
            <p className="text-xs text-slate-400 mt-1">
              {healthData?.database.connected
                ? 'Connected & Verified'
                : healthData
                ? healthData.database.message
                : 'Waiting for verification'}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              {healthData?.database.connected ? '✓ Pool ready' : 'Configure / Start Docker'}
            </div>
          </div>
        </div>

        {/* Live Health Check Card */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Live Axios Health Check Payload</h2>
            {lastChecked && (
              <span className="text-xs text-slate-500">Last checked at {lastChecked}</span>
            )}
          </div>

          {loading && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Contacting backend health check endpoint...
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 text-sm">
              <div className="font-semibold mb-1">Axios Request Notice:</div>
              <div>{error}</div>
              <p className="text-xs text-rose-400/80 mt-2">
                Make sure the backend is running at <code className="bg-rose-900/40 px-1 py-0.5 rounded">http://localhost:4000</code> or via <code className="bg-rose-900/40 px-1 py-0.5 rounded">docker compose -f docker-compose.dev.yml up</code>.
              </p>
            </div>
          )}

          {healthData && (
            <pre className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          )}
        </section>

        {/* Architectural Overview */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-3">Project Foundation Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Feature-based backend architecture established
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Centralized Axios client & TypeScript types
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Dual Docker Compose (Dev & Production)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Centralized error handling & security middleware
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-slate-800/80 text-xs text-slate-500 text-center">
        everythinganything environment initialized • Ready for feature development
      </footer>
    </main>
  );
}

