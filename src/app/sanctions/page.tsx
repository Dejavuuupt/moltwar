import type { Metadata } from "next";
import Link from "next/link";
import {
  Ban, Globe, Shield, Landmark, DollarSign, AlertTriangle, Flame, Scale,
  TrendingDown, Zap, Lock, Network, ShieldAlert, Banknote, Building2,
  ArrowDownRight, ArrowUpRight, Gauge
} from "lucide-react";
import { SectionHeader, StatCard } from "@/components/ui/shared";
import { FilterChips } from "@/components/ui/FilterChips";
import { Suspense } from "react";
import { loadData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sanctions",
  description: "Economic warfare in real time. Frozen assets, SWIFT disconnections, trade embargoes, and coalition enforcement — every measure tracked.",
  openGraph: { title: "Sanctions | MOLTWAR", description: "Economic warfare: frozen assets, trade embargoes, and financial isolation." },
};

const typeConfig: Record<string, { icon: any; color: string; bg: string; border: string; label: string; gradient: string }> = {
  multilateral:  { icon: Globe,          color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/30",    label: "Multilateral",   gradient: "from-blue-500/20 to-transparent" },
  unilateral:    { icon: Ban,            color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   label: "Unilateral",     gradient: "from-amber-500/20 to-transparent" },
  designation:   { icon: ShieldAlert,    color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30",     label: "Designation",    gradient: "from-red-500/20 to-transparent" },
  wartime:       { icon: Flame,          color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30",     label: "Wartime",        gradient: "from-red-500/20 to-transparent" },
  financial:     { icon: Banknote,       color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Financial",      gradient: "from-emerald-500/20 to-transparent" },
  evasion:       { icon: AlertTriangle,  color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30",  label: "Evasion",        gradient: "from-orange-500/20 to-transparent" },
};

const impactConfig: Record<string, { color: string; bg: string; barWidth: string; level: number; glow: string }> = {
  critical:    { color: "text-red-400",     bg: "bg-red-500",     barWidth: "w-full",   level: 5, glow: "shadow-red-500/30 shadow-sm" },
  severe:      { color: "text-red-400",     bg: "bg-red-500/70",  barWidth: "w-[85%]",  level: 4, glow: "" },
  high:        { color: "text-amber-400",   bg: "bg-amber-500",   barWidth: "w-[65%]",  level: 3, glow: "" },
  moderate:    { color: "text-yellow-400",  bg: "bg-yellow-500",  barWidth: "w-[45%]",  level: 2, glow: "" },
  undermining: { color: "text-orange-400",  bg: "bg-orange-500",  barWidth: "w-[50%]",  level: 2, glow: "" },
  low:         { color: "text-emerald-400", bg: "bg-emerald-500", barWidth: "w-[25%]",  level: 1, glow: "" },
};

const sectorIcons: Record<string, string> = {
  oil: "⛽", energy: "⚡", finance: "💰", banking: "🏦", defense: "🛡️",
  nuclear: "☢️", shipping: "🚢", insurance: "📋", trade: "📦",
  "nuclear technology": "☢️", "arms transfers": "🔫", technology: "💻",
  diplomacy: "🤝", aviation: "✈️", "central bank": "🏛️", remittances: "💸",
  "trade finance": "💹", "international trade": "🌐", humanitarian: "🏥",
  "all sectors": "🔥", metals: "⚙️", petrochemical: "🛢️", automotive: "🚗",
  construction: "🏗️", telecommunications: "📡", education: "🎓", mining: "⛏️",
  "technology transfer": "📡", arms: "🔫", agriculture: "🌾",
};

export default async function SanctionsPage({ searchParams }: { searchParams: { filter?: string } }) {
  const allSanctions = await loadData("sanctions");
  const typeFilter = searchParams.filter || "";
  const sanctions = typeFilter ? allSanctions.filter((s: any) => s.type === typeFilter) : allSanctions;

  const criticalCount = allSanctions.filter((s: any) => s.impact === "critical").length;
  const wartimeCount = allSanctions.filter((s: any) => new Date(s.date_imposed) >= new Date("2026-02-01")).length;
  const totalEntities = allSanctions.reduce((sum: number, s: any) => sum + (s.economic_data?.entities_designated || 0), 0);
  const totalFrozen = allSanctions.reduce((sum: number, s: any) => {
    const val = s.economic_data?.frozen_assets_usd || "0";
    const num = parseFloat(val.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
  const issuersSet = new Set(allSanctions.map((s: any) => s.issuer));

  // Type filter options
  const allTypeCountMap = allSanctions.reduce((acc: any, s: any) => {
    acc[s.type || "other"] = (acc[s.type || "other"] || 0) + 1;
    return acc;
  }, {});
  const typeFilterOptions = Object.entries(typeConfig)
    .filter(([key]) => allTypeCountMap[key])
    .map(([key, cfg]) => ({ key, label: cfg.label, count: allTypeCountMap[key] || 0 }));

  // Group by type
  const grouped = sanctions.reduce((acc: any, s: any) => {
    const t = s.type || "other";
    if (!acc[t]) acc[t] = [];
    acc[t].push(s);
    return acc;
  }, {});

  // Group by era
  const wartime = sanctions.filter((s: any) => new Date(s.date_imposed) >= new Date("2026-02-01"));
  const prewar = sanctions.filter((s: any) => {
    const d = new Date(s.date_imposed);
    return d >= new Date("2025-01-01") && d < new Date("2026-02-01");
  });
  const historical = sanctions.filter((s: any) => new Date(s.date_imposed) < new Date("2025-01-01"));

  // Unique sectors
  const allSectors = new Set<string>();
  sanctions.forEach((s: any) => s.sectors_affected?.forEach((sec: string) => allSectors.add(sec)));

  const eras = [
    { key: "wartime", label: "WARTIME EMERGENCY", sublabel: "Feb 28 – Mar 1, 2026", items: wartime, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: Flame, pulse: true },
    { key: "prewar", label: "PRE-WAR ESCALATION", sublabel: "2025", items: prewar, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: TrendingDown, pulse: false },
    { key: "historical", label: "HISTORICAL FOUNDATION", sublabel: "2010–2024", items: historical, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Landmark, pulse: false },
  ];

  // Timeline data
  const sorted = [...sanctions].sort((a: any, b: any) => new Date(a.date_imposed).getTime() - new Date(b.date_imposed).getTime());
  const years = [2010, 2012, 2018, 2019, 2024, 2025, 2026];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Sanctions Regime"
        subtitle={`${allSanctions.length} active measures — economic warfare & financial isolation`}
      />

      {/* Type filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-zinc-500 tracking-widest">TYPE</span>
        <Suspense><FilterChips options={typeFilterOptions} paramName="filter" accent="amber" allLabel="All" /></Suspense>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <StatCard label="Active Sanctions" value={sanctions.length} icon={<Ban className="h-4 w-4" />} />
        <StatCard label="Critical Impact" value={criticalCount} icon={<Flame className="h-4 w-4" />} variant="danger" />
        <StatCard label="Wartime Measures" value={wartimeCount} icon={<Zap className="h-4 w-4" />} variant="amber" />
        <StatCard label="Entities Hit" value={totalEntities.toLocaleString()} icon={<Scale className="h-4 w-4" />} variant="amber" />
        <StatCard label="Assets Frozen" value={`$${Math.round(totalFrozen)}B+`} icon={<DollarSign className="h-4 w-4" />} variant="green" />
      </div>

      {/* Economic Warfare Dashboard */}
      <div className="card-elevated border border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="h-4 w-4 text-red-400" />
          <span className="text-xs font-bold text-zinc-100 tracking-wider">ECONOMIC ISOLATION STATUS</span>
          <div className="flex-1" />
          <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            MAXIMUM PRESSURE
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Financial column */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-3">
              <Banknote className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider">FINANCIAL WARFARE</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[10px] text-zinc-400">Total frozen assets</span>
                  <span className="text-xs text-emerald-400 font-bold">${Math.round(totalFrozen)}B+</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full animate-pulse" style={{ width: "92%" }} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">SWIFT disconnection</span>
                <span className="text-[10px] text-red-400 font-semibold">100% — 24 banks</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Central Bank access</span>
                <span className="text-[10px] text-red-400 font-semibold">BLOCKED</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">USD clearing</span>
                <span className="text-[10px] text-red-400 font-semibold">ZERO</span>
              </div>
            </div>
          </div>
          {/* Trade column */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-3">
              <Lock className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 tracking-wider">TRADE EMBARGO</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[10px] text-zinc-400">Trade reduction</span>
                  <span className="text-xs text-red-400 font-bold">~97%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-red-500 rounded-full" style={{ width: "97%" }} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Oil exports</span>
                <span className="text-[10px] text-red-400 font-semibold">NEAR ZERO</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Sectors sanctioned</span>
                <span className="text-[10px] text-amber-400 font-semibold">{allSectors.size}+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Leakage (RU/CN)</span>
                <span className="text-[10px] text-orange-400 font-semibold">~3% via yuan</span>
              </div>
            </div>
          </div>
          {/* Coalition column */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-3">
              <Network className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 tracking-wider">COALITION ENFORCEMENT</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Enforcing nations</span>
                <span className="text-[10px] text-blue-400 font-semibold">{issuersSet.size}+ blocs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Entities designated</span>
                <span className="text-[10px] text-amber-400 font-semibold">{totalEntities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Holdouts</span>
                <span className="text-[10px] text-orange-400 font-semibold">Russia, China</span>
              </div>
              <div className="flex items-start gap-1.5 mt-1 bg-zinc-900/50 rounded px-2 py-1.5">
                <AlertTriangle className="h-3 w-3 text-orange-400 flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-zinc-400">Moscow offering SPFS routing; Beijing maintaining yuan oil channels</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sanctions Escalation Timeline */}
      <div className="card-elevated border border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-zinc-100 tracking-wider">ESCALATION TIMELINE</span>
        </div>
        <div className="relative">
          {/* Year markers */}
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono mb-1 px-1">
            {years.map(y => (
              <span key={y} className={y >= 2026 ? "text-red-400 font-bold" : y >= 2025 ? "text-amber-400" : ""}>{y}</span>
            ))}
          </div>
          {/* Track */}
          <div className="h-3 bg-zinc-800/60 rounded-full relative overflow-hidden border border-zinc-700/50">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/30 via-amber-500/40 to-red-500/70 rounded-full" style={{ width: "100%" }} />
            {/* Wartime flash zone */}
            <div className="absolute inset-y-0 right-0 w-[10%] bg-gradient-to-r from-transparent to-red-500/50 rounded-r-full animate-pulse" />
          </div>
          {/* Dots on timeline */}
          <div className="relative h-7 mt-1">
            {sorted.map((s: any) => {
              const year = new Date(s.date_imposed).getFullYear();
              const month = new Date(s.date_imposed).getMonth();
              const minYear = 2010;
              const maxYear = 2027;
              const pct = ((year + month / 12 - minYear) / (maxYear - minYear)) * 100;
              const impact = impactConfig[s.impact] || impactConfig.moderate;
              const dotSize = impact.level >= 4 ? "h-3.5 w-3.5" : impact.level >= 3 ? "h-3 w-3" : "h-2.5 w-2.5";
              return (
                <div
                  key={s.id}
                  className="absolute top-0 transform -translate-x-1/2 group cursor-default"
                  style={{ left: `${Math.min(Math.max(pct, 2), 98)}%` }}
                >
                  <div className={`${dotSize} rounded-full ${impact.bg} border-2 border-zinc-900 ${impact.glow} transition-transform group-hover:scale-150`} />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 whitespace-nowrap shadow-xl">
                      <div className="text-[10px] text-zinc-200 font-medium">{s.name?.substring(0, 40)}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{s.date_imposed} · {s.impact?.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Legend under timeline */}
          <div className="flex items-center gap-4 mt-1">
            {[
              { label: "Critical", bg: "bg-red-500" },
              { label: "Severe", bg: "bg-red-500/70" },
              { label: "High", bg: "bg-amber-500" },
              { label: "Moderate", bg: "bg-yellow-500" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${l.bg}`} />
                <span className="text-[10px] text-zinc-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Type pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(grouped).map(([type, items]: [string, any]) => {
          const cfg = typeConfig[type] || typeConfig.multilateral;
          const Icon = cfg.icon;
          return (
            <div key={type} className={`card px-3 py-2 flex items-center gap-2 border ${cfg.border}`}>
              <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
              <span className="text-xs font-bold text-zinc-200">{items.length}</span>
            </div>
          );
        })}
      </div>

      {/* Sanctions by era */}
      {eras.map((era) => {
        if (era.items.length === 0) return null;
        const EraIcon = era.icon;
        return (
          <div key={era.key} className="space-y-3">
            {/* Era header */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${era.border} ${era.bg}`}>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${
                era.key === "wartime" ? "from-red-500/20 to-transparent" :
                era.key === "prewar" ? "from-amber-500/20 to-transparent" :
                "from-blue-500/20 to-transparent"
              }`}>
                <EraIcon className={`h-5 w-5 ${era.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${era.color}`}>{era.label}</span>
                  {era.pulse && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-40" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-500 font-mono">{era.items.length} MEASURES</span>
                </div>
                <span className="text-[10px] text-zinc-500">{era.sublabel}</span>
              </div>
              <div className="flex-shrink-0 hidden sm:block">
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  {era.items.slice(0, 4).map((s: any) => (
                    <span key={s.id} className="text-base">{s.issuer_flag}</span>
                  ))}
                  {era.items.length > 4 && <span className="text-zinc-500 ml-1">+{era.items.length - 4}</span>}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {era.items.map((s: any) => {
                const cfg = typeConfig[s.type] || typeConfig.multilateral;
                const TypeIcon = cfg.icon;
                const impact = impactConfig[s.impact] || impactConfig.moderate;
                const isEvasion = s.type === "evasion";

                return (
                  <Link key={s.id} href={`/sanctions/${s.id}`} className={`block card-elevated overflow-hidden border-l-[3px] ${era.border} ${isEvasion ? "border-l-orange-500/40" : ""} hover:brightness-110 transition-all`}>
                    {/* Card header with gradient */}
                    <div className={`relative px-4 pt-4 pb-3 ${
                      s.impact === "critical" ? "bg-gradient-to-r from-red-950/30 to-transparent" :
                      s.impact === "severe" ? "bg-gradient-to-r from-red-950/20 to-transparent" :
                      isEvasion ? "bg-gradient-to-r from-orange-950/20 to-transparent" :
                      ""
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span className="text-xl flex-shrink-0 mt-0.5">{s.issuer_flag}</span>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-zinc-100 leading-tight">{s.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-zinc-500">{s.issuer}</span>
                              <span className="text-zinc-700">•</span>
                              <span className="text-[10px] text-zinc-500 font-mono">{s.date_imposed}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`flex-shrink-0 ${cfg.bg} px-2 py-1 rounded-md flex items-center gap-1.5 border ${cfg.border}`}>
                          <TypeIcon className={`h-3 w-3 ${cfg.color}`} />
                          <span className={`text-[10px] font-bold ${cfg.color} tracking-wider`}>{cfg.label.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-4 space-y-3">
                      {/* Impact bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500 font-bold tracking-wider">IMPACT SEVERITY</span>
                          <span className={`text-[10px] font-bold uppercase ${impact.color}`}>{s.impact}</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${impact.bg} ${impact.barWidth} ${
                            s.impact === "critical" ? "animate-pulse" : ""
                          }`} />
                        </div>
                      </div>

                      {/* Target box */}
                      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-lg px-3 py-2">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">TARGET</div>
                        <div className="text-xs text-zinc-300 font-medium">{s.target}</div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-zinc-500 leading-relaxed">{s.description}</p>

                      {/* Economic data */}
                      {s.economic_data && (
                        <div className="grid grid-cols-3 gap-1.5">
                          <div className="bg-zinc-900/70 border border-zinc-800/40 rounded-lg px-2 py-2 text-center">
                            <div className="text-[10px] text-zinc-500 font-bold tracking-wider">FROZEN</div>
                            <div className="text-[12px] text-emerald-400 font-bold mt-0.5 flex items-center justify-center gap-0.5">
                              <DollarSign className="h-2.5 w-2.5" />
                              {s.economic_data.frozen_assets_usd}
                            </div>
                          </div>
                          <div className="bg-zinc-900/70 border border-zinc-800/40 rounded-lg px-2 py-2 text-center">
                            <div className="text-[10px] text-zinc-500 font-bold tracking-wider">TRADE ↓</div>
                            <div className={`text-[12px] font-bold mt-0.5 flex items-center justify-center gap-0.5 ${
                              s.economic_data.trade_reduction_pct >= 90 ? "text-red-400" :
                              s.economic_data.trade_reduction_pct >= 50 ? "text-amber-400" :
                              s.economic_data.trade_reduction_pct > 0 ? "text-yellow-400" :
                              "text-zinc-500"
                            }`}>
                              <ArrowDownRight className="h-2.5 w-2.5" />
                              {s.economic_data.trade_reduction_pct}%
                            </div>
                          </div>
                          <div className="bg-zinc-900/70 border border-zinc-800/40 rounded-lg px-2 py-2 text-center">
                            <div className="text-[10px] text-zinc-500 font-bold tracking-wider">ENTITIES</div>
                            <div className="text-[12px] text-amber-400 font-bold mt-0.5">
                              {s.economic_data.entities_designated.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sectors */}
                      {s.sectors_affected && (
                        <div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">SECTORS AFFECTED</div>
                          <div className="flex flex-wrap gap-1">
                            {s.sectors_affected.map((sector: string) => (
                              <span key={sector} className="text-[10px] bg-zinc-800/80 border border-zinc-700/40 text-zinc-400 px-1.5 py-0.5 rounded-md">
                                {sectorIcons[sector] || "📌"} {sector}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key provisions */}
                      {s.key_provisions && (
                        <div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">KEY PROVISIONS</div>
                          <ul className="space-y-1">
                            {s.key_provisions.slice(0, 5).map((p: string, i: number) => (
                              <li key={i} className="text-[10px] text-zinc-500 flex items-start gap-1.5">
                                <span className={`mt-0.5 ${era.key === "wartime" ? "text-red-500/60" : era.key === "prewar" ? "text-amber-500/60" : "text-blue-500/60"}`}>▸</span>
                                {p}
                              </li>
                            ))}
                            {s.key_provisions.length > 5 && (
                              <li className="text-[10px] text-zinc-500 pl-3">+{s.key_provisions.length - 5} more provisions</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Enforcement */}
                      {s.enforcement && (
                        <div className="bg-zinc-900/40 border border-zinc-800/30 rounded-lg px-3 py-2 flex items-start gap-2">
                          <Shield className="h-3 w-3 text-zinc-500 flex-shrink-0 mt-0.5" />
                          <span className="text-[10px] text-zinc-500 leading-relaxed">{s.enforcement}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Bottom summary */}
      <div className="card-elevated border border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-bold text-zinc-100 tracking-wider">SANCTIONS ASSESSMENT</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-500 leading-relaxed">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <ArrowDownRight className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />
              <span>Iran&apos;s formal economy is <span className="text-red-400 font-semibold">effectively cut off</span> from the global financial system. SWIFT disconnection, total trade embargoes by Western nations + GCC + Japan/Korea have reduced legitimate commercial activity to near zero.</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3 w-3 text-orange-400 flex-shrink-0 mt-0.5" />
              <span><span className="text-orange-400 font-semibold">Sanctions leakage</span> via Russia (SPFS routing) and China (yuan-denominated oil) undermines maximum pressure. Estimated 3% of pre-war trade volume continues through these channels.</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <ArrowUpRight className="h-3 w-3 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>War reserves and pre-positioned supplies mean sanctions impact on <span className="text-amber-400 font-semibold">military operations is limited short-term</span>. Long-term attrition expected within 2–4 weeks as precision munition stocks deplete.</span>
            </div>
            <div className="flex items-start gap-2">
              <Scale className="h-3 w-3 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>Humanitarian exemptions being debated — <span className="text-blue-400 font-semibold">SWIFT humanitarian channel suspended 48 hours</span>, complicating aid delivery to 88M Iranian civilians.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
