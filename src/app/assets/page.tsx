import type { Metadata } from "next";
import Link from "next/link";
import {
  Plane, Ship, Crosshair, Shield, Radio, Rocket, AlertTriangle,
  Target, Skull, Activity, Flame
} from "lucide-react";
import { SectionHeader, StatCard, EmptyState } from "@/components/ui/shared";
import { FilterChips } from "@/components/ui/FilterChips";
import { Suspense } from "react";
import { loadData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Assets",
  description: "Every weapons system on the battlefield — tracked and assessed. Combat aircraft, naval fleets, missile stocks, drones, and air defense networks.",
  openGraph: { title: "Assets | MOLTWAR", description: "Weapons systems tracked and assessed across all active theaters." },
};

const categoryConfig: Record<string, { icon: any; color: string; bg: string; border: string; label: string; gradient: string }> = {
  aircraft:    { icon: Plane,     color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/30",    label: "Combat Aircraft",  gradient: "from-blue-500/20 to-transparent" },
  naval:       { icon: Ship,      color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/30",    label: "Naval Systems",    gradient: "from-cyan-500/20 to-transparent" },
  missile:     { icon: Rocket,    color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30",     label: "Missiles",         gradient: "from-red-500/20 to-transparent" },
  drone:       { icon: Radio,     color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/30",  label: "Drones / UAS",     gradient: "from-purple-500/20 to-transparent" },
  air_defense: { icon: Shield,    color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   label: "Air Defense",      gradient: "from-amber-500/20 to-transparent" },
  ground:      { icon: Crosshair, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Ground Systems",   gradient: "from-emerald-500/20 to-transparent" },
};

const threatConfig: Record<string, { color: string; bg: string; icon: string }> = {
  extreme:  { color: "text-red-400",     bg: "bg-red-500/10",     icon: "🔴" },
  high:     { color: "text-amber-400",   bg: "bg-amber-500/10",   icon: "🟠" },
  moderate: { color: "text-yellow-400",  bg: "bg-yellow-500/10",  icon: "🟡" },
  low:      { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "🟢" },
};

const statusConfig: Record<string, { color: string; label: string; pulse: boolean }> = {
  combat_active: { color: "bg-red-500/15 text-red-400 border-red-500/30",              label: "COMBAT ACTIVE", pulse: true },
  deployed:      { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",  label: "DEPLOYED",      pulse: false },
  degraded:      { color: "bg-amber-500/15 text-amber-400 border-amber-500/30",        label: "DEGRADED",      pulse: true },
  destroyed:     { color: "bg-zinc-800/80 text-zinc-500 border-zinc-700",              label: "DESTROYED",     pulse: false },
};

const sideConfig: Record<string, { color: string; label: string; border: string }> = {
  us:      { color: "text-blue-400",  label: "US / Coalition", border: "border-l-blue-500" },
  iran:    { color: "text-red-400",   label: "Iran / Proxies", border: "border-l-red-500" },
  neutral: { color: "text-zinc-400",  label: "Non-Aligned",    border: "border-l-zinc-600" },
};

export default async function AssetsPage({ searchParams }: { searchParams: { filter?: string } }) {
  const allAssets = await loadData("assets");
  const categoryFilter = searchParams.filter || "";
  const assets = categoryFilter ? allAssets.filter((a: any) => (a.category || "other") === categoryFilter) : allAssets;

  const grouped = assets.reduce((acc: any, asset: any) => {
    const cat = asset.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(asset);
    return acc;
  }, {});

  const usAssets = allAssets.filter((a: any) => a.side === "us").length;
  const iranAssets = allAssets.filter((a: any) => a.side === "iran").length;
  const activeCount = allAssets.filter((a: any) => a.status === "combat_active").length;
  const extremeCount = allAssets.filter((a: any) => a.threat_assessment === "extreme").length;

  const categoryOrder = ["aircraft", "missile", "naval", "air_defense", "drone", "ground"];
  const orderedCategories = categoryOrder.filter(c => grouped[c]);
  const allGrouped = allAssets.reduce((acc: any, asset: any) => {
    const cat = asset.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(asset);
    return acc;
  }, {});

  const categoryFilterOptions = categoryOrder
    .filter(c => allGrouped[c])
    .map(c => ({
      key: c,
      label: (categoryConfig[c] || categoryConfig.ground).label.replace(" Systems", "").replace(" Aircraft", "").replace("s / UAS", ""),
      count: (allGrouped[c] || []).length,
    }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Military Assets"
        subtitle={`${allAssets.length} weapons systems deployed and tracked across all theaters`}
      />

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-zinc-500 tracking-widest">CATEGORY</span>
        <Suspense><FilterChips options={categoryFilterOptions} paramName="filter" accent="blue" allLabel="All" /></Suspense>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <StatCard label="Total Systems" value={assets.length} icon={<Target className="h-4 w-4" />} />
        <StatCard label="US / Coalition" value={usAssets} icon={<Shield className="h-4 w-4" />} variant="green" />
        <StatCard label="Iran / Proxies" value={iranAssets} icon={<Flame className="h-4 w-4" />} variant="danger" />
        <StatCard label="Combat Active" value={activeCount} icon={<Activity className="h-4 w-4" />} variant="amber" />
        <StatCard label="Extreme Threat" value={extremeCount} icon={<AlertTriangle className="h-4 w-4" />} variant="danger" />
      </div>

      {/* Combat Status Overview */}
      <div className="card-elevated border border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Skull className="h-4 w-4 text-red-400" />
          <span className="text-xs font-bold text-zinc-100 tracking-wider">COMBAT READINESS OVERVIEW</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <div className="text-[10px] font-bold text-blue-400 mb-2">US / COALITION</div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Tomahawk inventory</span>
                <span className="text-[10px] text-amber-400 font-semibold">DEPLETING</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full" style={{ width: "55%" }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Aircraft losses</span>
                <span className="text-[10px] text-red-400 font-semibold">5 destroyed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Naval damage</span>
                <span className="text-[10px] text-amber-400 font-semibold">1 DDG hit (12 KIA)</span>
              </div>
            </div>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
            <div className="text-[10px] font-bold text-red-400 mb-2">IRAN / AXIS</div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Air defense</span>
                <span className="text-[10px] text-red-400 font-semibold">48% DESTROYED</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 to-red-800 rounded-full" style={{ width: "48%" }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">Fast boats</span>
                <span className="text-[10px] text-red-400 font-semibold">300+ destroyed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400">BM stocks expended</span>
                <span className="text-[10px] text-amber-400 font-semibold">100+ fired</span>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-3">
            <div className="text-[10px] font-bold text-zinc-300 mb-2">COMBAT FIRSTS</div>
            <div className="space-y-1.5">
              <div className="flex items-start gap-1.5">
                <span className="text-amber-400 text-[10px] mt-0.5">▸</span>
                <span className="text-[10px] text-zinc-400">First hypersonic combat kill (Fattah-2 vs THAAD)</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-400 text-[10px] mt-0.5">▸</span>
                <span className="text-[10px] text-zinc-400">First US warship struck since USS Cole (2000)</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-400 text-[10px] mt-0.5">▸</span>
                <span className="text-[10px] text-zinc-400">Iron Dome overwhelmed — rate drops to 75%</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-400 text-[10px] mt-0.5">▸</span>
                <span className="text-[10px] text-zinc-400">Largest offensive cyber op in history</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {orderedCategories.map((cat) => {
          const items = grouped[cat];
          const cfg = categoryConfig[cat] || categoryConfig.ground;
          const Icon = cfg.icon;
          return (
            <div key={cat} className={`card px-3 py-2 flex items-center gap-2 border ${cfg.border}`}>
              <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
              <span className="text-xs font-bold text-zinc-200">{items.length}</span>
            </div>
          );
        })}
      </div>

      {/* Assets by category */}
      {allAssets.length === 0 && (
        <EmptyState
          icon={<Shield className="h-5 w-5" />}
          title="No assets tracked yet"
          description="Military assets will appear here once data is seeded."
        />
      )}
      {orderedCategories.map((cat) => {
        const items = grouped[cat];
        const cfg = categoryConfig[cat] || categoryConfig.ground;
        const Icon = cfg.icon;

        const bySide: Record<string, any[]> = {};
        items.forEach((a: any) => {
          const s = a.side || "neutral";
          if (!bySide[s]) bySide[s] = [];
          bySide[s].push(a);
        });
        const sideOrder = ["us", "iran", "neutral"];

        return (
          <div key={cat}>
            <div className={`flex items-center gap-3 mb-4 px-4 py-3 rounded-lg border ${cfg.border} ${cfg.bg}`}>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${cfg.gradient}`}>
                <Icon className={`h-5 w-5 ${cfg.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{items.length} SYSTEMS</span>
                </div>
                <div className="flex gap-3 mt-0.5">
                  {sideOrder.map(s => {
                    const count = (bySide[s] || []).length;
                    if (count === 0) return null;
                    const sc = sideConfig[s];
                    return (
                      <span key={s} className={`text-[10px] ${sc.color} font-medium`}>
                        {sc.label}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {sideOrder.map(side => {
              const sideItems = bySide[side];
              if (!sideItems || sideItems.length === 0) return null;
              const sc = sideConfig[side] || sideConfig.neutral;

              return (
                <div key={side} className="mb-5">
                  <div className="flex items-center gap-2 mb-3 pl-1">
                    <div className={`h-3 w-1 rounded-full ${side === 'us' ? 'bg-blue-500' : side === 'iran' ? 'bg-red-500' : 'bg-zinc-600'}`} />
                    <span className={`text-[10px] font-bold tracking-widest ${sc.color}`}>{sc.label.toUpperCase()}</span>
                    <div className="flex-1 h-px bg-zinc-800/60" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sideItems.map((asset: any) => {
                      const status = statusConfig[asset.status] || statusConfig.deployed;
                      const threat = threatConfig[asset.threat_assessment] || threatConfig.moderate;
                      const sc = sideConfig[asset.side] || sideConfig.neutral;

                      return (
                        <Link key={asset.id} href={`/assets/${asset.id}`} className={`block card-elevated overflow-hidden border border-zinc-800/60 ${sc.border} border-l-[3px] hover:brightness-110 transition-all`}>
                          {/* Image header */}
                          {asset.image_url ? (
                            <div className="relative h-36 w-full overflow-hidden bg-zinc-950">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={asset.image_url}
                                alt={asset.name}
                                className="w-full h-full object-cover opacity-70"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                              <div className="absolute top-2 right-2 text-lg drop-shadow-md">{asset.operator_flag}</div>
                              <div className="absolute bottom-2 left-3 flex items-center gap-2">
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${status.color} backdrop-blur-sm flex items-center gap-1`}>
                                  {status.pulse && (
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: asset.status === 'combat_active' ? '#ef4444' : '#f59e0b' }} />
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: asset.status === 'combat_active' ? '#ef4444' : '#f59e0b' }} />
                                    </span>
                                  )}
                                  {status.label}
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm ${threat.bg} ${threat.color}`}>
                                  {threat.icon} {asset.threat_assessment?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className={`relative h-24 w-full overflow-hidden bg-gradient-to-br ${asset.side === 'us' ? 'from-blue-950/60 to-zinc-950' : asset.side === 'iran' ? 'from-red-950/60 to-zinc-950' : 'from-zinc-900 to-zinc-950'}`}>
                              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <Icon className="h-16 w-16 text-white" />
                              </div>
                              <div className="absolute top-2 right-2 text-lg">{asset.operator_flag}</div>
                              <div className="absolute bottom-2 left-3 flex items-center gap-2">
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${status.color} flex items-center gap-1`}>
                                  {status.pulse && (
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: asset.status === 'combat_active' ? '#ef4444' : '#f59e0b' }} />
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: asset.status === 'combat_active' ? '#ef4444' : '#f59e0b' }} />
                                    </span>
                                  )}
                                  {status.label}
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${threat.bg} ${threat.color}`}>
                                  {threat.icon} {asset.threat_assessment?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="px-4 pt-3 pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-bold text-zinc-100 leading-tight">{asset.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-zinc-500 truncate">{asset.operator}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="px-4 pb-2">
                            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">{asset.description}</p>
                          </div>

                          {asset.specs && (
                            <div className="px-4 pb-2">
                              <div className="grid grid-cols-3 gap-1">
                                {Object.entries(asset.specs).map(([key, val]: [string, any]) => (
                                  <div key={key} className="bg-zinc-900/70 rounded px-2 py-1.5">
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{key}</div>
                                    <div className="text-[10px] text-zinc-300 font-medium truncate leading-tight mt-0.5">{val}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {asset.quantity && (
                            <div className="px-4 pb-3">
                              <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800/60 rounded px-3 py-1.5">
                                <span className="text-[10px] text-zinc-500 font-bold tracking-wider">DEPLOYED</span>
                                <span className={`text-xs font-semibold ${
                                  (asset.quantity || "").toLowerCase().includes("lost") || (asset.quantity || "").toLowerCase().includes("destroyed") || (asset.quantity || "").toLowerCase().includes("damaged")
                                    ? "text-amber-400" : "text-zinc-300"
                                }`}>{asset.quantity}</span>
                              </div>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
