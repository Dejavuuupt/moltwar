import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, MapPin, Target, AlertTriangle, Flame,
  Shield, Zap, Anchor, Waves, Crosshair, Users,
  Plane, Rocket, Activity, Calendar,
} from "lucide-react";
import { Tag, ThreatBadge } from "@/components/ui/shared";
import { loadData } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const theaters = await loadData("theaters");
  const theater = theaters.find((t: any) => t.id === id);
  if (!theater) return { title: "Theater Not Found" };
  return {
    title: theater.name,
    description: theater.description?.slice(0, 160) || `${theater.name} — active combat theater.`,
    openGraph: { title: `${theater.name} | MOLTWAR` },
  };
}

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
  "ACTIVE COMBAT ZONE": "bg-red-500/10 text-red-400 border border-red-500/20",
  "ACTIVE NAVAL COMBAT": "bg-red-500/10 text-red-400 border border-red-500/20",
  "STRAIT CLOSED — MINED": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  "GROUND COMBAT ACTIVE": "bg-red-500/10 text-red-400 border border-red-500/20",
  "SHIPPING HALTED": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  "GROUND INVASION UNDERWAY": "bg-red-500/10 text-red-400 border border-red-500/20",
  "ACTIVE CYBER OPS": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  "DIPLOMACY FAILED": "bg-zinc-800 text-zinc-400 border border-zinc-700",
};

const theaterGradients: Record<string, string> = {
  "iranian-mainland": "from-red-950 via-red-900/20 to-zinc-950",
  "persian-gulf": "from-blue-950 via-cyan-900/20 to-zinc-950",
  "strait-of-hormuz": "from-amber-950 via-amber-900/20 to-zinc-950",
  "iraq-theater": "from-orange-950 via-orange-900/20 to-zinc-950",
  "red-sea": "from-rose-950 via-rose-900/20 to-zinc-950",
  "lebanon-border": "from-red-950 via-red-900/20 to-zinc-950",
  "cyber-domain": "from-purple-950 via-purple-900/20 to-zinc-950",
  "diplomatic-front": "from-zinc-900 via-zinc-800/20 to-zinc-950",
};

export default async function TheaterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [theaters, events] = await Promise.all([
    loadData("theaters"),
    loadData("events"),
  ]);

  const theater = theaters.find((t: any) => t.id === id);
  if (!theater) notFound();

  const relatedEvents = events.filter((e: any) =>
    (e.theater || "") === theater.id ||
    (e.description || "").toLowerCase().includes(theater.region?.toLowerCase() || theater.name?.toLowerCase())
  ).slice(0, 10);

  const otherTheaters = theaters.filter((t: any) => t.id !== theater.id).slice(0, 4);

  const StatusIcon = statusIcon[theater.status] || MapPin;
  const gradient = theaterGradients[theater.id] || "from-zinc-900 to-zinc-950";
  const statusCls = statusColor[theater.status] || "bg-zinc-800 text-zinc-400 border border-zinc-700";

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link href="/theaters" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="h-3 w-3" /> Back to Theaters
      </Link>

      {/* Hero image / gradient banner */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800/60">
        <div className={`relative h-48 sm:h-60 w-full bg-gradient-to-br ${gradient}`}>
          {/* Subtle overlay patterns */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(239,68,68,0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(239,68,68,0.1) 0%, transparent 50%)`,
          }} />
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="tgrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tgrid)" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          {/* Big background icon */}
          <div className="absolute top-4 right-6 opacity-8">
            <StatusIcon className="h-28 w-28 text-white" />
          </div>
          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex flex-wrap items-end gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center shrink-0">
                <StatusIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-zinc-100 tracking-tight leading-tight">{theater.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${statusCls}`}>
                    <StatusIcon className="h-3 w-3" /> {theater.status}
                  </span>
                  <ThreatBadge level={theater.threat_level} />
                  <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {theater.region}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Sorties Flown", value: theater.sorties_flown?.toLocaleString() || "0", icon: Plane, color: "text-blue-400" },
          { label: "Missiles Launched", value: theater.missiles_launched?.toLocaleString() || "0", icon: Rocket, color: "text-red-400" },
          { label: "Events", value: theater.event_count || relatedEvents.length, icon: Activity, color: "text-amber-400" },
          { label: "Active Forces", value: (theater.active_forces || []).length, icon: Users, color: "text-emerald-400" },
        ].map((s) => {
          const SIcon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4">
              <div className="flex items-center gap-2 mb-1">
                <SIcon className={`h-3.5 w-3.5 ${s.color}`} />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Description + Strategic Significance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Crosshair className="h-3.5 w-3.5 text-red-400" />
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Situation Report</h3>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{theater.description}</p>
        </div>

        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-3.5 w-3.5 text-amber-400" />
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Strategic Significance</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">{theater.strategic_significance}</p>
          {theater.civilian_impact && (
            <>
              <div className="border-t border-zinc-800/40 mt-4 pt-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Civilian Impact</span>
                <p className="text-xs text-zinc-400 leading-relaxed">{theater.civilian_impact}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Forces + Key Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Active Forces */}
        {theater.active_forces && theater.active_forces.length > 0 && (
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Active Forces</h3>
              <span className="text-[10px] text-zinc-500 font-mono ml-auto">{theater.active_forces.length}</span>
            </div>
            <ul className="space-y-2">
              {theater.active_forces.map((force: string, i: number) => (
                <li key={i} className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70 shrink-0" />
                  {force}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Targets */}
        {theater.key_targets && theater.key_targets.length > 0 && (
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-3.5 w-3.5 text-red-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Key Targets / Objectives</h3>
            </div>
            <ul className="space-y-2">
              {theater.key_targets.map((target: string, i: number) => (
                <li key={i} className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500/70 shrink-0" />
                  {target}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-red-500/70" />
            <span className="text-xs font-bold text-zinc-100 tracking-wider">RECENT ACTIVITY</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-auto">{relatedEvents.length} EVENTS</span>
          </div>
          <div className="space-y-2">
            {relatedEvents.map((event: any) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block rounded-xl border border-zinc-800/60 bg-[#111113] p-4 hover:border-zinc-700 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 leading-snug group-hover:text-zinc-100 transition-colors">{event.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-zinc-500 font-mono">{event.date}</span>
                      {event.event_type && <Tag>{event.event_type.replace(/_/g, " ")}</Tag>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Other theaters */}
      {otherTheaters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-zinc-600" />
            <span className="text-xs font-bold text-zinc-100 tracking-wider">OTHER THEATERS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {otherTheaters.map((t: any) => {
              const TIcon = statusIcon[t.status] || MapPin;
              const tCls = statusColor[t.status] || "bg-zinc-800 text-zinc-400 border border-zinc-700";
              return (
                <Link
                  key={t.id}
                  href={`/theaters/${t.id}`}
                  className="block rounded-xl border border-zinc-800/60 bg-[#111113] p-4 hover:border-zinc-700 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0">
                      <TIcon className="h-3.5 w-3.5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors">{t.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block ${tCls}`}>
                        {t.status}
                      </span>
                    </div>
                    <ThreatBadge level={t.threat_level} />
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
