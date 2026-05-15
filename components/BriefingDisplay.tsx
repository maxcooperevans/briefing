'use client';

import { Briefing, Competitor, Risk } from '@/types/briefing';

interface Props {
  briefing: Briefing;
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
    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-blue-400/70 mb-3">
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

export default function BriefingDisplay({ briefing }: Props) {
  const handleExportPDF = () => {
    window.print();
  };

  const competitors = (briefing.marketMap || []).map(getCompetitor);
  const risks = (briefing.keyRisks || []).map(getRisk);

  return (
    <div className="mt-12 print:mt-0" id="briefing-output">
      {/* Export button — hidden during print */}
      <div className="flex justify-end mb-6 no-print">
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 border border-white/15 hover:border-white/30 rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export as PDF
        </button>
      </div>

      {/* Hero */}
      <div className="briefing-card rounded-xl border border-white/[0.07] bg-gradient-to-br from-blue-950/40 to-slate-900/40 p-8 mb-4">
        <SectionLabel>Company Briefing</SectionLabel>
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
          {briefing.company}
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          {briefing.oneLiner}
        </p>
      </div>

      {/* Row 1: Business Model + Market Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <SectionLabel>Business Model</SectionLabel>
          <p className="text-slate-300 text-sm leading-relaxed">{briefing.businessModel}</p>
        </Card>

        <Card>
          <SectionLabel>Competitor Landscape</SectionLabel>
          <ul className="space-y-3">
            {competitors.map((c, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-mono text-blue-400">
                  {i + 1}
                </span>
                <div>
                  <span className="text-white text-sm font-medium">{c.name}</span>
                  {c.description && (
                    <span className="text-slate-400 text-sm"> — {c.description}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Row 2: Key Risks + Investor Angle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <SectionLabel>Key Risks</SectionLabel>
          <ul className="space-y-4">
            {risks.map((r, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-mono text-amber-400">
                  !
                </span>
                <div>
                  <p className="text-white text-sm font-medium">{r.title}</p>
                  {r.explanation && (
                    <p className="text-slate-400 text-sm mt-0.5">{r.explanation}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionLabel>Investor Angle</SectionLabel>
          <p className="text-slate-300 text-sm leading-relaxed">{briefing.investorAngle}</p>
        </Card>
      </div>

      {/* SWOT 2×2 */}
      <div className="briefing-card rounded-xl border border-white/[0.07] bg-white/[0.03] p-6">
        <SectionLabel>SWOT Analysis</SectionLabel>
        <div className="grid grid-cols-2 gap-px bg-white/[0.06] rounded-lg overflow-hidden">
          {/* Strengths */}
          <div className="bg-[#030f1e] p-5">
            <p className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 mb-3">
              ▲ Strengths
            </p>
            <ul className="space-y-2">
              {(briefing.swot?.strengths || []).map((s, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0">›</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-[#030f1e] p-5">
            <p className="text-[10px] font-mono tracking-widest uppercase text-red-400 mb-3">
              ▼ Weaknesses
            </p>
            <ul className="space-y-2">
              {(briefing.swot?.weaknesses || []).map((w, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">›</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="bg-[#030f1e] p-5 border-t border-white/[0.06]">
            <p className="text-[10px] font-mono tracking-widest uppercase text-blue-400 mb-3">
              ◆ Opportunities
            </p>
            <ul className="space-y-2">
              {(briefing.swot?.opportunities || []).map((o, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">›</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="bg-[#030f1e] p-5 border-t border-white/[0.06]">
            <p className="text-[10px] font-mono tracking-widest uppercase text-amber-400 mb-3">
              ⚠ Threats
            </p>
            <ul className="space-y-2">
              {(briefing.swot?.threats || []).map((t, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">›</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
