'use client';

import { useState } from 'react';
import BriefingDisplay from '@/components/BriefingDisplay';
import { Briefing } from '@/types/briefing';

export default function Home() {
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;

    setLoading(true);
    setError(null);
    setBriefing(null);

    try {
      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: company.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate briefing.');
      }

      setBriefing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030f1e] text-white">
      {/* Nav */}
      <nav className="border-b border-white/[0.06] no-print">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 ring-4 ring-blue-400/20" />
          <span className="font-mono text-xs tracking-[0.25em] uppercase text-blue-400">
            Briefing
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16 print:py-4">
        {/* Hero / Search — hidden during print */}
        <div className="no-print">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Company Intelligence
            </h1>
            <p className="text-slate-400 text-base">
              AI-powered strategic briefings, researched in real time
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-3">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter a company name or website URL…"
              disabled={loading}
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !company.trim()}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Generate Briefing
            </button>
          </form>

          {/* Loading */}
          {loading && (
            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="relative h-10 w-10">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-blue-400 animate-spin" />
              </div>
              <p className="text-slate-400 text-sm font-mono">
                Researching{' '}
                <span className="text-blue-400">{company}</span>
                <span className="animate-pulse">…</span>
              </p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="mt-8 max-w-2xl mx-auto rounded-lg border border-red-500/20 bg-red-500/[0.06] px-5 py-4 text-sm text-red-400">
              <span className="font-semibold">Error — </span>
              {error}
            </div>
          )}
        </div>

        {/* Briefing */}
        {briefing && <BriefingDisplay briefing={briefing} />}
      </div>
    </main>
  );
}
