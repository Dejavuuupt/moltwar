import type { Metadata } from "next";
import {
  AlertTriangle, Clock, Flame, Shield, Zap, Globe, Atom, Users, TrendingUp,
  CalendarDays, Target, Crosshair, ChevronRight, RadioTower, Bomb
} from "lucide-react";
import { Tag, SectionHeader, StatCard } from "@/components/ui/shared";
import { formatDate } from "@/lib/utils";
import { loadData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Timeline",
  description: "47 years of escalation mapped to war. Key events, military strikes, diplomatic failures, and turning points — from 1979 to now.",
  openGraph: { title: "Timeline | MOLTWAR", description: "47 years of escalation mapped to war — from 1979 to now." },
};

const categoryConfig: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
  military:     { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30",    icon: Flame,      label: "Military" },
  diplomatic:   { color: "text-teal-400",   bg: "bg-teal-500/10",   border: "border-teal-500/30",   icon: Globe,      label: "Diplomatic" },
  nuclear:      { color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/30",  icon: Atom,       label: "Nuclear" },
  political:    { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: Users,      label: "Political" },
  economic:     { color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30",   icon: TrendingUp, label: "Economic" },
  proxy:        { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: Shield,     label: "Proxy" },
  cyber:        { color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/30",   icon: Zap,        label: "Cyber" },
  intelligence: { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", icon: Crosshair,  label: "Intelligence" },
};

const dotColors: Record<string, string> = {
  foundational: "bg-red-500 shadow-red-500/50",
  major: "bg-amber-500 shadow-amber-500/50",
  moderate: "bg-zinc-500 shadow-zinc-500/30",
};

function daysAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "TODAY";
  if (diff === 1) return "YESTERDAY";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${diff} days ago`;
  if (diff < 365) return `${Math.floor(diff / 30)} months ago`;
  return `${Math.floor(diff / 365)} years ago`;
}

export default async function TimelinePage() {
  // Sort MOST RECENT FIRST
  const timeline = (await loadData("timeline")).sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group by era — ordered most recent first
  const eraRanges = [
    { label: "Operation Burning Spear", range: "Feb 2026", emoji: "🔥", start: 2026, end: 2027, accent: "red" },
    { label: "Road to War", range: "2025 — Feb 2026", emoji: "⚠️", start: 2025, end: 2026, accent: "amber" },
    { label: "Multi-Front Escalation", range: "2023 — 2024", emoji: "💥", start: 2023, end: 2025, accent: "orange" },
    { label: "Maximum Pressure Era", range: "2018 — 2022", emoji: "🔒", start: 2016, end: 2023, accent: "blue" },
    { label: "Post-Iraq & Proxy Wars", range: "2003 — 2015", emoji: "🗺️", start: 2003, end: 2016, accent: "teal" },
    { label: "Origins", range: "1979 — 2002", emoji: "📜", start: 1970, end: 2003, accent: "zinc" },
  ];

  const eras: { label: string; range: string; emoji: string; entries: any[]; accent: string }[] = [];
  eraRanges.forEach(({ label, range, emoji, start, end, accent }) => {
    const entries = timeline.filter((e: any) => {
      const y = new Date(e.date).getFullYear();
      return y >= start && y < end;
    });
    if (entries.length > 0) eras.push({ label, range, emoji, entries, accent });
  });

  const catCounts = timeline.reduce((acc: any, e: any) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});

  const foundational = timeline.filter((e: any) => e.significance === "foundational").length;
  const majorCount = timeline.filter((e: any) => e.significance === "major").length;
  const latestEvent = timeline[0];

  const accentBorder: Record<string, string> = {
    red: "border-red-500/40",
    amber: "border-amber-500/40",
    orange: "border-orange-500/40",
    blue: "border-blue-500/40",
    teal: "border-teal-500/40",
    zinc: "border-zinc-700",
  };
  const accentDot: Record<string, string> = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    teal: "bg-teal-500",
    zinc: "bg-zinc-600",
  };
  const accentLine: Record<string, string> = {
    red: "bg-red-500/30",
    amber: "bg-amber-500/20",
    orange: "bg-orange-500/20",
    blue: "bg-blue-500/15",
    teal: "bg-teal-500/15",
    zinc: "bg-zinc-800",
  };
  const accentText: Record<string, string> = {
    red: "text-red-400",
    amber: "text-amber-400",
    orange: "text-orange-400",
    blue: "text-blue-400",
    teal: "text-teal-400",
    zinc: "text-zinc-500",
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Escalation Timeline"
        subtitle={`${timeline.length} critical events — 47 years of escalation leading to war`}
      />

      {/* CURRENT STATUS Banner */}
      <div className="card-elevated p-0 overflow-hidden border border-red-500/40 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 pointer-events-none" />
        <div className="bg-red-500/10 px-4 py-2 flex items-center gap-3 border-b border-red-500/20">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-red-400 font-mono tracking-wide">ACTIVE CONFLICT — OPERATION BURNING SPEAR</span>
          <span className="text-[10px] font-mono text-red-400/50 ml-auto">LAST UPDATED 01 MAR 2026</span>
        </div>
        <div className="p-4 grid sm:grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <h2 className="text-sm font-bold text-zinc-100 mb-1">Multi-Front War Escalates — IRGC Command Decapitated</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              B-2 stealth bombers destroy IRGC command network. Hezbollah fires 450+ rockets at northern Israel.
              Iran launches cyber attacks on US infrastructure. Oil surges past $230/barrel. UN ceasefire vetoed by Russia & China.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-lg font-bold text-red-400 font-mono">450+</div>
              <div className="text-[10px] text-red-400/60 font-mono">ROCKETS</div>
            </div>
            <div className="text-center px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-lg font-bold text-red-400 font-mono">5</div>
              <div className="text-[10px] text-red-400/60 font-mono">FRONTS</div>
            </div>
            <div className="text-center px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-lg font-bold text-amber-400 font-mono">$232</div>
              <div className="text-[10px] text-amber-400/60 font-mono">OIL/BBL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <StatCard label="Total Events" value={timeline.length} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Foundational" value={foundational} icon={<AlertTriangle className="h-4 w-4" />} variant="danger" />
        <StatCard label="Major" value={majorCount} icon={<Target className="h-4 w-4" />} variant="amber" />
        <StatCard label="Categories" value={Object.keys(catCounts).length} icon={<RadioTower className="h-4 w-4" />} />
        <StatCard label="Time Span" value="47 yrs" icon={<CalendarDays className="h-4 w-4" />} variant="green" />
      </div>

      {/* Category filter legend */}
      <div className="card p-3 flex flex-wrap gap-2">
        {Object.entries(categoryConfig).map(([cat, cfg]) => {
          const count = catCounts[cat] || 0;
          if (count === 0) return null;
          const Icon = cfg.icon;
          return (
            <div key={cat} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${cfg.bg} border ${cfg.border}`}>
              <Icon className={`h-3 w-3 ${cfg.color}`} />
              <span className={`text-[10px] ${cfg.color} font-semibold`}>{cfg.label}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Timeline by era — MOST RECENT FIRST */}
      {eras.map((era) => (
        <div key={era.label} className="space-y-0">
          {/* Era header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-px flex-1 ${accentLine[era.accent]}`} />
            <div className={`flex items-center gap-2 px-4 py-2 bg-zinc-900/80 rounded-full border ${accentBorder[era.accent]}`}>
              <span className="text-sm">{era.emoji}</span>
              <span className={`text-xs font-bold ${accentText[era.accent]}`}>{era.label}</span>
              <span className="text-[10px] text-zinc-500 font-mono">{era.range}</span>
              <span className="text-[10px] text-zinc-700 font-mono">({era.entries.length})</span>
            </div>
            <div className={`h-px flex-1 ${accentLine[era.accent]}`} />
          </div>

          {/* Vertical timeline */}
          <div className="relative pl-6 sm:pl-8">
            {/* Vertical connector line */}
            <div className={`absolute left-[11px] sm:left-[15px] top-0 bottom-0 w-px ${accentLine[era.accent]}`} />

            <div className="space-y-3">
              {era.entries.map((entry: any, idx: number) => {
                const cfg = categoryConfig[entry.category] || categoryConfig.military;
                const Icon = cfg.icon;
                const isFoundational = entry.significance === "foundational";
                const isMajor = entry.significance === "major";
                const isLatest = entry.id === latestEvent?.id;

                return (
                  <div key={entry.id || idx} className="relative group">
                    {/* Timeline dot */}
                    <div className={`absolute -left-6 sm:-left-8 top-4 flex items-center justify-center`}>
                      <div className={`h-[9px] w-[9px] rounded-full border-2 border-[#111113] shadow-sm ${
                        isFoundational ? "bg-red-500 shadow-red-500/40" :
                        isMajor ? "bg-amber-500 shadow-amber-500/30" :
                        accentDot[era.accent]
                      }`} />
                    </div>

                    {/* Card */}
                    <div className={`card p-0 overflow-hidden transition-colors ${
                      isLatest ? "border border-red-500/30 bg-red-500/[0.03]" :
                      isFoundational ? "border-l-[3px] border-l-red-500 border-y border-r border-zinc-800/50" :
                      isMajor ? "border-l-[3px] border-l-amber-500 border-y border-r border-zinc-800/50" :
                      "border border-zinc-800/40"
                    }`}>
                      <div className="p-4">
                        {/* Top row: date, relative time, category, badges */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-mono text-zinc-500 tabular-nums">{formatDate(entry.date)}</span>
                          <span className="text-[10px] font-mono text-zinc-700">{daysAgo(entry.date)}</span>
                          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${cfg.bg}`}>
                            <Icon className={`h-2.5 w-2.5 ${cfg.color}`} />
                            <span className={`text-[10px] ${cfg.color} font-semibold`}>{cfg.label}</span>
                          </div>
                          {isFoundational && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold tracking-wide border border-red-500/20">
                              FOUNDATIONAL
                            </span>
                          )}
                          {isMajor && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold tracking-wide border border-amber-500/20">
                              MAJOR
                            </span>
                          )}
                          {isLatest && (
                            <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-bold ml-auto border border-red-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                              NOW
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className={`text-[13px] font-bold mb-1.5 leading-snug ${
                          isLatest ? "text-red-300" :
                          isFoundational ? "text-zinc-50" :
                          "text-zinc-200"
                        }`}>
                          {entry.title}
                        </h3>

                        {/* Description */}
                        {entry.description && (
                          <p className="text-xs text-zinc-500 leading-relaxed mb-3">{entry.description}</p>
                        )}

                        {/* Tags + actors */}
                        <div className="flex flex-wrap gap-1.5">
                          {entry.actors && entry.actors.map((actor: string) => (
                            <Tag key={actor} variant="green">{actor.replace(/-/g, " ")}</Tag>
                          ))}
                          {entry.tags && entry.tags.slice(0, 4).map((tag: string) => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* End marker */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-zinc-800" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
          <span className="text-[10px] text-zinc-500 font-mono">END OF RECORDED TIMELINE</span>
        </div>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>
    </div>
  );
}
