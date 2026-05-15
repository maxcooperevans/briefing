'use client';

import { Briefing, Competitor, Risk, Force } from '@/types/briefing';

interface Props {
  briefing: Partial<Briefing>;
}

function getCompetitor(item: Competitor | string): Competitor {
  if (typeof item === 'string') {
    const colonIdx = item.indexOf(':');
    if (colonIdx > -1) {
      return { name: item.slice(0, colonIdx).trim(), description: item.slice(colonIdx + 1).trim() };
    }
    return { name: item, description: '' };
  }
  return item;
}

function getRisk(item: Risk | string): Risk {
  if (typeof item === 'string') {
    const colonIdx = item.indexOf(':');
    if (colonIdx > -1) {
      return { title: item.slice(0, colonIdx).trim(), explanation: item.slice(colonIdx + 1).trim() };
    }
    return { title: item, explanation: '' };
  }
  return item;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="section-label text-[10px] font-mono tracking-[0.2em] uppercase text-blue-400/70 mb-3">
      {children}
    </p>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`briefing-card rounded-xl border border-white/[0.07] bg-white/[0.03] p-6 ${className}`}>
      {children}
    </div>
  );
}

function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-white/[0.06]" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}

function FadeIn({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div
      className="transition-all duration-500"
      style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(6px)' }}
    >
      {children}
    </div>
  );
}

const ratingConfig = {
  Low:    { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  Medium: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400' },
  High:   { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-400' },
};

function ForceCard({ label, force }: { label: string; force: Force }) {
  const cfg = ratingConfig[force.rating];
  return (
    <div className="briefing-card rounded-xl border border-white/[0.07] bg-white/[0.03] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-white text-sm font-semibold leading-tight">{label}</p>
        <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-semibold ${cfg.color} ${cfg.bg} ${cfg.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {force.rating}
        </span>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed">{force.explanation}</p>
    </div>
  );
}

const FORCE_LABELS: Record<string, string> = {
  competitiveRivalry:          'Competitive Rivalry',
  threatOfNewEntrants:         'Threat of New Entrants',
  bargainingPowerOfSuppliers:  'Bargaining Power of Suppliers',
  bargainingPowerOfBuyers:     'Bargaining Power of Buyers',
  threatOfSubstitutes:         'Threat of Substitutes',
};

const FORCE_KEYS = Object.keys(FORCE_LABELS) as (keyof typeof FORCE_LABELS)[];

export default function BriefingDisplay({ briefing }: Props) {
  const competitors = (briefing.marketMap || []).map(getCompetitor);
  const risks = (briefing.keyRisks || []).map(getRisk);
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="mt-12 print:mt-0" id="briefing-output">

      {/* Print-only cover header */}
      <div className="hidden print:block print-cover mb-10">
        <div className="print-cover-accent" />
        <div className="print-cover-body">
          <p className="print-cover-label">Company Intelligence Briefing</p>
          <h1 className="print-cover-name">{briefing.company ?? ''}</h1>
          <p className="print-cover-sub">{briefing.oneLiner ?? ''}</p>
          <p className="print-cover-date">Generated {date}</p>
        </div>
      </div>

      {/* Screen export button */}
      <div className="flex justify-end mb-6 no-print">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 border border-white/15 hover:border-white/30 rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export as PDF
        </button>
      </div>

      {/* Hero — screen only (print version is the cover above) */}
      <div className="briefing-card rounded-xl border border-white/[0.07] bg-gradient-to-br from-blue-950/40 to-slate-900/40 p-8 mb-4 no-print">
        <SectionLabel>Company Briefing</SectionLabel>
        <FadeIn show={!!briefing.company}>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">{briefing.company ?? ''}</h2>
        </FadeIn>
        {!briefing.company && <Skeleton lines={1} />}
        <div className="mt-2">
          <FadeIn show={!!briefing.oneLiner}>
            <p className="text-slate-300 text-lg leading-relaxed">{briefing.oneLiner ?? ''}</p>
          </FadeIn>
          {!briefing.oneLiner && <Skeleton lines={2} />}
        </div>
      </div>

      {/* Row 1: Business Model + Market Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 print:grid-cols-2">
        <Card>
          <SectionLabel>Business Model</SectionLabel>
          <FadeIn show={!!briefing.businessModel}>
            <p className="text-slate-300 text-sm leading-relaxed">{briefing.businessModel ?? ''}</p>
          </FadeIn>
          {!briefing.businessModel && <Skeleton lines={4} />}
        </Card>

        <Card>
          <SectionLabel>Competitor Landscape</SectionLabel>
          {competitors.length > 0 ? (
            <FadeIn show={true}>
              <ul className="space-y-3">
                {competitors.map((c, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-mono text-blue-400">
                      {i + 1}
                    </span>
                    <div>
                      <span className="text-white text-sm font-medium">{c.name}</span>
                      {c.description && <span className="text-slate-400 text-sm"> — {c.description}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </FadeIn>
          ) : <Skeleton lines={5} />}
        </Card>
      </div>

      {/* Row 2: Key Risks + Investor Angle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 print:grid-cols-2">
        <Card>
          <SectionLabel>Key Risks</SectionLabel>
          {risks.length > 0 ? (
            <FadeIn show={true}>
              <ul className="space-y-4">
                {risks.map((r, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-mono text-amber-400">!</span>
                    <div>
                      <p className="text-white text-sm font-medium">{r.title}</p>
                      {r.explanation && <p className="text-slate-400 text-sm mt-0.5">{r.explanation}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </FadeIn>
          ) : <Skeleton lines={4} />}
        </Card>

        <Card>
          <SectionLabel>Investor Angle</SectionLabel>
          <FadeIn show={!!briefing.investorAngle}>
            <p className="text-slate-300 text-sm leading-relaxed">{briefing.investorAngle ?? ''}</p>
          </FadeIn>
          {!briefing.investorAngle && <Skeleton lines={4} />}
        </Card>
      </div>

      {/* Porter's Five Forces */}
      <div className="briefing-card rounded-xl border border-white/[0.07] bg-white/[0.03] p-6 mb-4">
        <SectionLabel>Porter&apos;s Five Forces</SectionLabel>
        {briefing.fiveForces ? (
          <FadeIn show={true}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2">
              {FORCE_KEYS.slice(0, 4).map((key) => (
                <ForceCard
                  key={key}
                  label={FORCE_LABELS[key]}
                  force={briefing.fiveForces![key as keyof typeof briefing.fiveForces]}
                />
              ))}
              <div className="sm:col-span-2 print:col-span-2">
                <ForceCard
                  label={FORCE_LABELS[FORCE_KEYS[4]]}
                  force={briefing.fiveForces[FORCE_KEYS[4] as keyof typeof briefing.fiveForces]}
                />
              </div>
            </div>
          </FadeIn>
        ) : <Skeleton lines={6} />}
      </div>

      {/* SWOT */}
      <div className="briefing-card rounded-xl border border-white/[0.07] bg-white/[0.03] p-6">
        <SectionLabel>SWOT Analysis</SectionLabel>
        {briefing.swot ? (
          <FadeIn show={true}>
            <div className="grid grid-cols-2 gap-px bg-white/[0.06] rounded-lg overflow-hidden print:grid-cols-2">
              <div className="swot-cell bg-[#030f1e] p-5">
                <p className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 mb-3">▲ Strengths</p>
                <ul className="space-y-2">
                  {briefing.swot.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">›</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="swot-cell bg-[#030f1e] p-5">
                <p className="text-[10px] font-mono tracking-widest uppercase text-red-400 mb-3">▼ Weaknesses</p>
                <ul className="space-y-2">
                  {briefing.swot.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">›</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="swot-cell bg-[#030f1e] p-5 border-t border-white/[0.06]">
                <p className="text-[10px] font-mono tracking-widest uppercase text-blue-400 mb-3">◆ Opportunities</p>
                <ul className="space-y-2">
                  {briefing.swot.opportunities.map((o, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0">›</span>{o}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="swot-cell bg-[#030f1e] p-5 border-t border-white/[0.06]">
                <p className="text-[10px] font-mono tracking-widest uppercase text-amber-400 mb-3">⚠ Threats</p>
                <ul className="space-y-2">
                  {briefing.swot.threats.map((t, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">›</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        ) : <Skeleton lines={6} />}
      </div>
    </div>
  );
}
