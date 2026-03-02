import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, Ban, Globe, Shield, Landmark, DollarSign, AlertTriangle,
  Flame, Scale, Zap, Lock, ShieldAlert, Banknote, Building2,
  ArrowDownRight, Network, ExternalLink,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/shared";
import { loadData } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sanctions = await loadData("sanctions");
  const s = sanctions.find((x: any) => x.id === id);
  if (!s) return { title: "Sanction Not Found" };
  return {
    title: s.name,
    description: s.description,
    openGraph: { title: `${s.name} | MOLTWAR Sanctions` },
  };
}

const typeConfig: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
  multilateral:  { icon: Globe,       color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/30",    label: "Multilateral"  },
  unilateral:    { icon: Ban,         color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   label: "Unilateral"    },
  designation:   { icon: ShieldAlert, color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30",     label: "Designation"   },
  wartime:       { icon: Flame,       color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30",     label: "Wartime"       },
  financial:     { icon: Banknote,    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Financial"     },
  evasion:       { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", label: "Evasion"       },
};

const impactConfig: Record<string, { color: string; bar: string; barWidth: string }> = {
  critical:    { color: "text-red-400",     bar: "bg-red-500",     barWidth: "w-full"   },
  severe:      { color: "text-red-400",     bar: "bg-red-500/70",  barWidth: "w-[85%]"  },
  high:        { color: "text-amber-400",   bar: "bg-amber-500",   barWidth: "w-[65%]"  },
  moderate:    { color: "text-yellow-400",  bar: "bg-yellow-500",  barWidth: "w-[45%]"  },
  undermining: { color: "text-orange-400",  bar: "bg-orange-500",  barWidth: "w-[50%]"  },
  low:         { color: "text-emerald-400", bar: "bg-emerald-500", barWidth: "w-[25%]"  },
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

export default async function SanctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sanctions = await loadData("sanctions");
  const s = sanctions.find((x: any) => x.id === id);

  if (!s) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center mx-auto">
            <Ban className="h-6 w-6 text-zinc-500" />
          </div>
          <p className="text-zinc-500 text-sm">Sanction not found</p>
          <Link href="/sanctions" className="text-emerald-400 text-xs hover:underline inline-block">
            Back to Sanctions
          </Link>
        </div>
      </div>
    );
  }

  const cfg = typeConfig[s.type] || typeConfig.multilateral;
  const TypeIcon = cfg.icon;
  const impact = impactConfig[s.impact] || impactConfig.moderate;
  const isWartime = new Date(s.date_imposed) >= new Date("2026-02-01");
  const eraLabel = isWartime ? "WARTIME" : new Date(s.date_imposed) >= new Date("2025-01-01") ? "PRE-WAR" : "HISTORICAL";
  const eraColor = isWartime ? "text-red-400 bg-red-500/10 border-red-500/30" : new Date(s.date_imposed) >= new Date("2025-01-01") ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-blue-400 bg-blue-500/10 border-blue-500/30";

  // Related sanctions: same type, excluding current
  const related = sanctions
    .filter((x: any) => x.id !== s.id && (x.type === s.type || x.impact === s.impact))
    .slice(0, 4);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/sanctions"
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sanctions
      </Link>

      {/* Hero card */}
      <div className={`relative overflow-hidden rounded-xl border ${cfg.border} bg-[#111113]`}>
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />

        {/* Top badge row */}
        <div className={`px-6 pt-5 pb-4 bg-gradient-to-r ${s.impact === "critical" ? "from-red-950/40 to-transparent" : s.impact === "severe" ? "from-red-950/20 to-transparent" : "from-zinc-900/60 to-transparent"}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{s.issuer_flag}</span>
              <div>
                <h1 className="text-lg font-bold text-zinc-100 leading-tight">{s.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-zinc-500 font-mono">{s.issuer}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-xs text-zinc-500 font-mono">{s.date_imposed}</span>
                  <span className="text-zinc-700">·</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${eraColor}`}>{eraLabel}</span>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${cfg.bg} ${cfg.border}`}>
              <TypeIcon className={`h-4 w-4 ${cfg.color}`} />
              <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
            </div>
          </div>
        </div>

        {/* Impact bar */}
        <div className="px-6 py-3 border-t border-zinc-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest">IMPACT SEVERITY</span>
            <span className={`text-xs font-bold uppercase ${impact.color}`}>{s.impact}</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${impact.bar} ${impact.barWidth} ${s.impact === "critical" ? "animate-pulse" : ""}`} />
          </div>
        </div>
      </div>

      {/* Economic stats */}
      {s.economic_data && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "FROZEN ASSETS", value: `$${s.economic_data.frozen_assets_usd}`, icon: <DollarSign className="h-4 w-4" />, color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
            { label: "TRADE REDUCTION", value: `${s.economic_data.trade_reduction_pct}%`, icon: <ArrowDownRight className="h-4 w-4" />, color: s.economic_data.trade_reduction_pct >= 80 ? "text-red-400" : "text-amber-400", border: s.economic_data.trade_reduction_pct >= 80 ? "border-red-500/20" : "border-amber-500/20", bg: s.economic_data.trade_reduction_pct >= 80 ? "bg-red-500/5" : "bg-amber-500/5" },
            { label: "ENTITIES HIT", value: (s.economic_data.entities_designated || 0).toLocaleString(), icon: <Scale className="h-4 w-4" />, color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-lg border ${stat.border} ${stat.bg} px-4 py-3 flex flex-col items-center text-center`}>
              <div className={`${stat.color} mb-1`}>{stat.icon}</div>
              <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-zinc-500 font-bold tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Target + Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card p-4 space-y-1">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Building2 className="h-3 w-3" /> Target
          </div>
          <p className="text-sm font-semibold text-zinc-100">{s.target}</p>
        </div>
        <div className="card p-4">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Description</div>
          <p className="text-xs text-zinc-400 leading-relaxed">{s.description}</p>
        </div>
      </div>

      {/* Sectors */}
      {s.sectors_affected && s.sectors_affected.length > 0 && (
        <div className="card p-4">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Network className="h-3 w-3" /> Sectors Affected
          </div>
          <div className="flex flex-wrap gap-2">
            {s.sectors_affected.map((sector: string) => (
              <span
                key={sector}
                className="text-xs bg-zinc-800/80 border border-zinc-700/40 text-zinc-300 px-2.5 py-1.5 rounded-md font-medium"
              >
                {sectorIcons[sector] || "📌"} {sector}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key Provisions */}
      {s.key_provisions && s.key_provisions.length > 0 && (
        <div className="card p-4">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Lock className="h-3 w-3" /> Key Provisions
          </div>
          <ul className="space-y-2">
            {s.key_provisions.map((p: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
                <span className="text-emerald-500/60 font-bold mt-0.5 shrink-0">▸</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Enforcement */}
      {s.enforcement && (
        <div className="card p-4">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Shield className="h-3 w-3" /> Enforcement
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">{s.enforcement}</p>
        </div>
      )}

      {/* Related sanctions */}
      {related.length > 0 && (
        <div>
          <SectionHeader title="Related Sanctions" subtitle="Same type or impact level" />
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {related.map((r: any) => {
              const rc = typeConfig[r.type] || typeConfig.multilateral;
              const RI = rc.icon;
              return (
                <Link key={r.id} href={`/sanctions/${r.id}`}>
                  <div className={`card-interactive p-3 flex items-start gap-3 border-l-[3px] ${rc.border}`}>
                    <span className="text-xl shrink-0">{r.issuer_flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <RI className={`h-3 w-3 ${rc.color} shrink-0`} />
                        <span className={`text-[10px] font-bold ${rc.color}`}>{rc.label}</span>
                      </div>
                      <p className="text-xs font-medium text-zinc-300 line-clamp-1">{r.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-zinc-500 font-mono">{r.date_imposed}</span>
                        <span className={`text-[10px] uppercase font-bold ${impactConfig[r.impact]?.color || "text-zinc-500"}`}>{r.impact}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-zinc-600 shrink-0 mt-0.5" />
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
