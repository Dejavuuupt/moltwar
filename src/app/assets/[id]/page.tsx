import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, Plane, Ship, Crosshair, Shield, Radio, Rocket,
  AlertTriangle, Target, Activity, ExternalLink,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/shared";
import { loadData } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const assets = await loadData("assets");
  const a = assets.find((x: any) => x.id === id);
  if (!a) return { title: "Asset Not Found" };
  return {
    title: a.name,
    description: a.description,
    openGraph: { title: `${a.name} | MOLTWAR Assets` },
  };
}

const categoryConfig: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
  aircraft:    { icon: Plane,     color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/30",    label: "Combat Aircraft" },
  naval:       { icon: Ship,      color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/30",    label: "Naval Systems"   },
  missile:     { icon: Rocket,    color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30",     label: "Missiles"        },
  drone:       { icon: Radio,     color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/30",  label: "Drones / UAS"    },
  air_defense: { icon: Shield,    color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   label: "Air Defense"     },
  ground:      { icon: Crosshair, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Ground Systems"  },
};

const statusConfig: Record<string, { color: string; label: string; pulse: boolean }> = {
  combat_active: { color: "bg-red-500/15 text-red-400 border-red-500/30",             label: "COMBAT ACTIVE", pulse: true  },
  deployed:      { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", label: "DEPLOYED",      pulse: false },
  degraded:      { color: "bg-amber-500/15 text-amber-400 border-amber-500/30",       label: "DEGRADED",      pulse: true  },
  destroyed:     { color: "bg-zinc-800/80 text-zinc-500 border-zinc-700",             label: "DESTROYED",     pulse: false },
};

const threatConfig: Record<string, { color: string; bg: string; icon: string }> = {
  extreme:  { color: "text-red-400",     bg: "bg-red-500/10",     icon: "🔴" },
  high:     { color: "text-amber-400",   bg: "bg-amber-500/10",   icon: "🟠" },
  moderate: { color: "text-yellow-400",  bg: "bg-yellow-500/10",  icon: "🟡" },
  low:      { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "🟢" },
};

const sideConfig: Record<string, { color: string; label: string; gradient: string; borderTop: string }> = {
  us:      { color: "text-blue-400",  label: "US / Coalition", gradient: "from-blue-950/60 to-zinc-950",  borderTop: "border-blue-500/30" },
  iran:    { color: "text-red-400",   label: "Iran / Proxies", gradient: "from-red-950/60 to-zinc-950",   borderTop: "border-red-500/30"  },
  neutral: { color: "text-zinc-400",  label: "Non-Aligned",    gradient: "from-zinc-900 to-zinc-950",     borderTop: "border-zinc-700/30" },
};

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assets = await loadData("assets");
  const asset = assets.find((x: any) => x.id === id);

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center mx-auto">
            <Target className="h-6 w-6 text-zinc-500" />
          </div>
          <p className="text-zinc-500 text-sm">Asset not found</p>
          <Link href="/assets" className="text-emerald-400 text-xs hover:underline inline-block">
            Back to Assets
          </Link>
        </div>
      </div>
    );
  }

  const catCfg = categoryConfig[asset.category] || categoryConfig.ground;
  const CatIcon = catCfg.icon;
  const status = statusConfig[asset.status] || statusConfig.deployed;
  const threat = threatConfig[asset.threat_assessment] || threatConfig.moderate;
  const side = sideConfig[asset.side] || sideConfig.neutral;

  const isDamaged = (asset.quantity || "").toLowerCase().includes("lost") ||
    (asset.quantity || "").toLowerCase().includes("destroyed") ||
    (asset.quantity || "").toLowerCase().includes("damaged");

  // Related assets: same category, different id
  const related = assets
    .filter((a: any) => a.id !== asset.id && a.category === asset.category)
    .slice(0, 6);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/assets"
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Assets
      </Link>

      {/* Hero */}
      <div className={`relative overflow-hidden rounded-xl border ${catCfg.border} bg-[#111113]`}>
        {/* Image or gradient header */}
        {asset.image_url ? (
          <div className="relative h-56 w-full overflow-hidden bg-zinc-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.image_url}
              alt={asset.name}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
          </div>
        ) : (
          <div className={`relative h-32 w-full overflow-hidden bg-gradient-to-br ${side.gradient}`}>
            <div className="absolute inset-0 flex items-center justify-center opacity-8">
              <CatIcon className="h-24 w-24 text-white" />
            </div>
          </div>
        )}

        {/* Badges overlaid on image */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <span className="text-2xl">{asset.operator_flag}</span>
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${status.color} backdrop-blur-sm flex items-center gap-1.5`}>
            {status.pulse && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: asset.status === "combat_active" ? "#ef4444" : "#f59e0b" }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: asset.status === "combat_active" ? "#ef4444" : "#f59e0b" }} />
              </span>
            )}
            {status.label}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-1 rounded backdrop-blur-sm ${threat.bg} ${threat.color} border border-current/20`}>
            {threat.icon} {(asset.threat_assessment || "").toUpperCase()}
          </span>
        </div>

        {/* Info section */}
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">{asset.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs font-bold ${side.color}`}>{side.label}</span>
                <span className="text-zinc-700">·</span>
                <span className="text-xs text-zinc-500">{asset.operator}</span>
                <span className="text-zinc-700">·</span>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${catCfg.bg} ${catCfg.border}`}>
                  <CatIcon className={`h-3 w-3 ${catCfg.color}`} />
                  <span className={`text-[10px] font-bold ${catCfg.color}`}>{catCfg.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment quantity */}
      {asset.quantity && (
        <div className={`card p-4 flex items-center gap-3 border ${isDamaged ? "border-amber-500/20 bg-amber-500/5" : "border-zinc-800/60"}`}>
          <Activity className={`h-4 w-4 shrink-0 ${isDamaged ? "text-amber-400" : "text-emerald-400"}`} />
          <div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Deployment Status</div>
            <div className={`text-sm font-semibold mt-0.5 ${isDamaged ? "text-amber-400" : "text-zinc-200"}`}>{asset.quantity}</div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="card p-4">
        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">System Overview</div>
        <p className="text-sm text-zinc-400 leading-relaxed">{asset.description}</p>
      </div>

      {/* Specs grid */}
      {asset.specs && Object.keys(asset.specs).length > 0 && (
        <div className="card p-4">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" /> Technical Specifications
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(asset.specs).map(([key, val]: [string, any]) => (
              <div key={key} className="bg-zinc-900/70 border border-zinc-800/50 rounded-lg px-3 py-2.5">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{key}</div>
                <div className="text-xs text-zinc-200 font-medium mt-0.5 leading-tight">{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related assets */}
      {related.length > 0 && (
        <div>
          <SectionHeader title={`Other ${catCfg.label}`} subtitle={`More systems in this category`} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {related.map((a: any) => {
              const rs = statusConfig[a.status] || statusConfig.deployed;
              const rt = threatConfig[a.threat_assessment] || threatConfig.moderate;
              const rside = sideConfig[a.side] || sideConfig.neutral;
              return (
                <Link key={a.id} href={`/assets/${a.id}`}>
                  <div className={`card-interactive p-3 border-l-[3px] ${a.side === "us" ? "border-l-blue-500/50" : a.side === "iran" ? "border-l-red-500/50" : "border-l-zinc-700/50"}`}>
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg shrink-0">{a.operator_flag}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-200 line-clamp-1">{a.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${rs.color}`}>{rs.label}</span>
                          <span className={`text-[10px] font-medium ${rt.color}`}>{rt.icon}</span>
                          <span className={`text-[10px] ${rside.color}`}>{rside.label}</span>
                        </div>
                      </div>
                      <ExternalLink className="h-3 w-3 text-zinc-600 shrink-0 mt-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
