import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Theaters",
  description: "Active combat theaters and operational zones. Force deployments, threat mapping, and strategic objectives across every front.",
  openGraph: { title: "Theaters | MOLTWAR", description: "Active combat theaters and operational zones across every front." },
};
import { MapPin, Target, Crosshair, AlertTriangle, Flame, Shield, Zap, Globe, Anchor, Waves } from "lucide-react";
import { ThreatBadge, SectionHeader, Tag, StatCard, EmptyState } from "@/components/ui/shared";
import { loadData } from "@/lib/data";

const TheaterMap = dynamic(() => import("@/components/TheaterMap"), { ssr: false });

/* ─── Status Configs ─── */
const statusIcon: Record<string, any> = {
  "ACTIVE COMBAT ZONE": Flame,
  "ACTIVE NAVAL COMBAT": Anchor,
  "STRAIT CLOSED — MINED": AlertTriangle,
  "GROUND COMBAT ACTIVE": Target,
  "SHIPPING HALTED": Waves,
  "GROUND INVASION UNDERWAY": Flame,
  "ACTIVE CYBER OPS": Zap,
  "DIPLOMACY FAILED": Shield,
};

const statusColor: Record<string, string> = {
  "ACTIVE COMBAT ZONE": "bg-red-500/10 text-red-400",
  "ACTIVE NAVAL COMBAT": "bg-red-500/10 text-red-400",
  "STRAIT CLOSED — MINED": "bg-amber-500/10 text-amber-400",
  "GROUND COMBAT ACTIVE": "bg-red-500/10 text-red-400",
  "SHIPPING HALTED": "bg-amber-500/10 text-amber-400",
  "GROUND INVASION UNDERWAY": "bg-red-500/10 text-red-400",
  "ACTIVE CYBER OPS": "bg-purple-500/10 text-purple-400",
  "DIPLOMACY FAILED": "bg-zinc-800 text-zinc-400",
};

/* ─── Theater Card Gradient Fallback ─── */
function TheaterImage({ theater }: { theater: any }) {
  const gradients: Record<string, string> = {
    "iranian-mainland": "from-red-950 via-red-900/20 to-zinc-950",
    "persian-gulf": "from-blue-950 via-cyan-900/20 to-zinc-950",
    "strait-of-hormuz": "from-amber-950 via-amber-900/20 to-zinc-950",
    "iraq-theater": "from-orange-950 via-orange-900/20 to-zinc-950",
    "red-sea": "from-rose-950 via-rose-900/20 to-zinc-950",
    "lebanon-border": "from-red-950 via-red-900/20 to-zinc-950",
    "cyber-domain": "from-purple-950 via-purple-900/20 to-zinc-950",
    "diplomatic-front": "from-zinc-900 via-zinc-800/20 to-zinc-950",
  };

  const gradient = gradients[theater.id] || "from-zinc-900 to-zinc-950";
  const StatusIcon = statusIcon[theater.status] || MapPin;

  return (
    <div className={`relative h-36 sm:h-44 w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(239,68,68,0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(239,68,68,0.1) 0%, transparent 50%)`,
      }} />
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <pattern id={`grid-${theater.id}`} width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${theater.id})`} />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      <div className="absolute top-4 right-4 opacity-10">
        <StatusIcon className="h-16 w-16 text-white" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center backdrop-blur-sm">
              <StatusIcon className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">{theater.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-zinc-500">{theater.region}</span>
                {theater.coordinates && (
                  <>
                    <span className="text-zinc-700">•</span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {theater.coordinates.lat.toFixed(1)}°N {Math.abs(theater.coordinates.lng).toFixed(1)}°{theater.coordinates.lng >= 0 ? "E" : "W"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <ThreatBadge level={theater.threat_level} />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default async function TheatersPage() {
  const theaters = await loadData("theaters");

  const totalSorties = theaters.reduce((s: number, t: any) => s + (t.sorties_flown || 0), 0);
  const totalMissiles = theaters.reduce((s: number, t: any) => s + (t.missiles_launched || 0), 0);
  const criticalCount = theaters.filter((t: any) => t.threat_level === "critical").length;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Theaters of Operation"
        subtitle={`${theaters.length} active combat theaters — Operation Burning Spear`}
      />

      {/* Intro */}
      <div className="card p-4 border-l-2 border-red-500/40 space-y-2">
        <p className="text-xs text-zinc-400 leading-relaxed">
          A <span className="text-zinc-200 font-medium">theater of operations</span> is a defined geographic or domain-based area where military forces are organized, deployed, and conducting active operations. Each theater has its own command structure, assigned forces, threat assessment, and strategic objectives.
        </p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          This page tracks all active theaters as of February 28, 2026. Theaters range from physical battlespaces — air campaigns over Iran, naval engagements in the Persian Gulf, ground combat in Iraq and Lebanon — to non-kinetic domains like cyberspace and diplomacy. Together, they form the complete operational picture of <span className="text-red-400/80 font-mono text-xs">Operation Burning Spear</span>.
        </p>
      </div>

      {/* Map + Stats side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
        {/* World Map — real geographic data */}
        <TheaterMap theaters={theaters} />

        {/* Stats Panel */}
        <div className="flex flex-col gap-2">
          <StatCard label="Active Theaters" value={theaters.length} icon={<Globe className="h-4 w-4" />} variant="danger" />
          <StatCard label="Critical" value={criticalCount} icon={<AlertTriangle className="h-4 w-4" />} variant="danger" />
          <StatCard label="Sorties Flown" value={totalSorties.toLocaleString()} icon={<Target className="h-4 w-4" />} variant="amber" />
          <StatCard label="Missiles Launched" value={totalMissiles.toLocaleString()} icon={<Flame className="h-4 w-4" />} variant="danger" />

          {/* Quick threat breakdown */}
          <div className="card p-3 space-y-2 flex-1">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Threat Levels</div>
            {[
              { label: "Critical", count: theaters.filter((t: any) => t.threat_level === "critical").length, color: "bg-red-500", text: "text-red-400" },
              { label: "Severe", count: theaters.filter((t: any) => t.threat_level === "severe").length, color: "bg-orange-500", text: "text-orange-400" },
              { label: "High", count: theaters.filter((t: any) => t.threat_level === "high").length, color: "bg-amber-500", text: "text-amber-400" },
            ].map(({ label, count, color, text }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-[10px] text-zinc-400">{label}</span>
                </div>
                <span className={`text-xs font-bold ${text}`}>{count}</span>
              </div>
            ))}
          </div>

          {/* Top missiles */}
          <div className="card p-3 space-y-2">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Highest Missile Activity</div>
            {[...theaters]
              .sort((a: any, b: any) => (b.missiles_launched || 0) - (a.missiles_launched || 0))
              .slice(0, 3)
              .map((t: any) => (
                <div key={t.id} className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 truncate max-w-[160px]">{t.name}</span>
                  <span className="text-[10px] font-bold text-red-400 font-mono">{(t.missiles_launched || 0).toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Theater Cards — Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {theaters.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={<MapPin className="h-5 w-5" />}
              title="No theaters yet"
              description="Active combat theaters will appear here once data is seeded."
            />
          </div>
        )}
        {theaters.map((theater: any) => (
          <Link key={theater.id} href={`/theaters/${theater.id}`} className="card-elevated overflow-hidden block hover:ring-1 hover:ring-zinc-700/50 transition-all">
            <TheaterImage theater={theater} />

            <div className="px-4 pb-4 space-y-3">
              {theater.status && (
                <div className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-mono font-semibold mt-3 ${statusColor[theater.status] || "bg-red-500/10 text-red-400"}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {theater.status}
                </div>
              )}

              <p className="text-xs text-zinc-400 leading-relaxed">{theater.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-zinc-900/60 rounded-md px-3 py-2">
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase">Events</div>
                  <div className="text-sm font-semibold text-zinc-200">{theater.event_count || 0}</div>
                </div>
                <div className="bg-zinc-900/60 rounded-md px-3 py-2">
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase">Forces</div>
                  <div className="text-sm font-semibold text-zinc-200">{(theater.active_forces || []).length}</div>
                </div>
                {theater.sorties_flown > 0 && (
                  <div className="bg-zinc-900/60 rounded-md px-3 py-2">
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase">Sorties</div>
                    <div className="text-sm font-semibold text-amber-400">{theater.sorties_flown.toLocaleString()}</div>
                  </div>
                )}
                {theater.missiles_launched > 0 && (
                  <div className="bg-zinc-900/60 rounded-md px-3 py-2">
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase">Missiles</div>
                    <div className="text-sm font-semibold text-red-400">{theater.missiles_launched.toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div className="bg-zinc-900/40 rounded-md p-3 border-l-2 border-amber-500/50">
                <div className="text-[10px] text-amber-400/70 font-bold uppercase mb-1">Strategic Significance</div>
                <p className="text-xs text-zinc-400 leading-relaxed">{theater.strategic_significance}</p>
              </div>

              {theater.key_targets && theater.key_targets.length > 0 && (
                <div>
                  <div className="text-[10px] text-zinc-500 mb-1.5 font-bold uppercase">Key Targets</div>
                  <div className="flex flex-wrap gap-1.5">
                    {theater.key_targets.map((target: string) => (
                      <Tag key={target} variant="danger">{target}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {theater.active_forces && theater.active_forces.length > 0 && (
                <div>
                  <div className="text-[10px] text-zinc-500 mb-1.5 font-bold uppercase">Active Forces</div>
                  <div className="flex flex-wrap gap-1.5">
                    {theater.active_forces.map((force: string) => (
                      <Tag key={force} variant="green">{force}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {theater.civilian_impact && (
                <div className="bg-amber-500/5 rounded-md px-3 py-2.5 border border-amber-500/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500/70" />
                    <span className="text-[10px] text-amber-400/70 font-bold uppercase">Civilian Impact</span>
                  </div>
                  <p className="text-xs text-amber-400/60 leading-relaxed">{theater.civilian_impact}</p>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
