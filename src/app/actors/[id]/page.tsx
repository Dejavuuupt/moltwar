import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Shield, Flame, Crosshair, Globe, Users, Cpu, Target, Swords, Calendar } from "lucide-react";
import { Tag, SectionHeader, ThreatBadge } from "@/components/ui/shared";
import { loadData } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const actors = await loadData("actors");
  const actor = actors.find((a: any) => a.id === id);
  if (!actor) return { title: "Actor Not Found" };
  return {
    title: actor.name,
    description: actor.description || `${actor.name} — conflict actor profile.`,
    openGraph: { title: `${actor.name} | MOLTWAR` },
  };
}

const sideConfig: Record<string, { color: string; bg: string; border: string; label: string; icon: any }> = {
  us:      { color: "text-blue-400",   bg: "bg-blue-500/8",   border: "border-blue-500/25",   label: "US / Coalition",  icon: Shield },
  iran:    { color: "text-red-400",    bg: "bg-red-500/8",    border: "border-red-500/25",    label: "Iran / Axis",     icon: Flame },
  proxy:   { color: "text-orange-400", bg: "bg-orange-500/8", border: "border-orange-500/25", label: "Proxy Force",     icon: Crosshair },
  allied:  { color: "text-teal-400",   bg: "bg-teal-500/8",   border: "border-teal-500/25",   label: "Allied Nation",   icon: Globe },
  neutral: { color: "text-zinc-400",   bg: "bg-zinc-800/50",  border: "border-zinc-700",      label: "Neutral",         icon: Users },
};

const relationColors: Record<string, string> = {
  ally: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  enemy: "bg-red-500/10 text-red-400 border border-red-500/20",
  subsidiary: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  proxy_of: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
};

const avatarGradients: Record<string, { from: string; to: string; border: string }> = {
  us:      { from: "#1e3a5f", to: "#0f1d30", border: "#3b82f6" },
  allied:  { from: "#1a3a3a", to: "#0f1f1f", border: "#2dd4bf" },
  iran:    { from: "#4a1111", to: "#1f0808", border: "#ef4444" },
  proxy:   { from: "#4a2a0a", to: "#1f1208", border: "#f97316" },
  neutral: { from: "#27272a", to: "#18181b", border: "#52525b" },
};

const localFlagImages: Record<string, string> = {
  "united-states": "/images/actors/united-states.png",
  "us-centcom": "/images/actors/united-states.png",
  "us-fifth-fleet": "/images/actors/united-states.png",
  "us-air-force": "/images/actors/united-states.png",
  "us-cyber-command": "/images/actors/united-states.png",
  iran: "/images/actors/iran.png",
  irgc: "/images/actors/iran.png",
  "quds-force": "/images/actors/iran.png",
  "irgc-navy": "/images/actors/iran.png",
  syria: "/images/actors/syria.png",
  israel: "/images/actors/israel.png",
  "saudi-arabia": "/images/actors/saudi-arabia.png",
  "uae-forces": "/images/actors/uae-forces.png",
  "united-kingdom": "/images/actors/united-kingdom.png",
  "kurdish-peshmerga": "/images/actors/kurdistan.png",
  russia: "/images/actors/russia.png",
  china: "/images/actors/china.png",
  turkey: "/images/actors/turkey.png",
};

const proxyFlagImages: Record<string, string> = {
  hezbollah: "/images/actors/hezbollah-flag.png",
  houthis: "/images/actors/houthis-flag.png",
  pmf: "/images/actors/pmf-flag.png",
  "kataib-hezbollah": "/images/actors/pmf-flag.png",
  "asaib-ahl-al-haq": "/images/actors/pmf-flag.png",
};

export default async function ActorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [actors, events, assessments] = await Promise.all([
    loadData("actors"),
    loadData("events"),
    loadData("assessments"),
  ]);

  const actor = actors.find((a: any) => a.id === id);
  if (!actor) notFound();

  const relatedEvents = events.filter((e: any) => (e.actors || []).includes(actor.id));
  const relatedAssessments = assessments.filter((a: any) =>
    (a.actors || []).includes(actor.id) || (a.tags || []).some((t: string) => t.toLowerCase().includes(actor.short_name?.toLowerCase() || actor.id))
  );

  const side = actor.side || "neutral";
  const cfg = sideConfig[side] || sideConfig.neutral;
  const SideIcon = cfg.icon;
  const grad = avatarGradients[side] || avatarGradients.neutral;

  const flagSrc = localFlagImages[actor.id] || proxyFlagImages[actor.id];
  const initials = actor.short_name
    ? actor.short_name.slice(0, 3).toUpperCase()
    : actor.name.split(" ").map((w: string) => w[0]).join("").slice(0, 3).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link href="/actors" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="h-3 w-3" /> Back to Actors
      </Link>

      {/* Hero */}
      <div className={`relative overflow-hidden rounded-xl border ${cfg.border} bg-[#111113]`}>
        <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${grad.border}60, transparent)` }} />
        <div className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            {flagSrc ? (
              <div className="h-16 w-16 rounded-xl overflow-hidden relative border shrink-0" style={{ borderColor: `${grad.border}50` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flagSrc} alt={actor.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-1">
                  <span className="text-[10px] font-mono font-bold text-white/80 tracking-widest">{initials}</span>
                </div>
              </div>
            ) : (
              <div
                className="h-16 w-16 rounded-xl overflow-hidden flex items-center justify-center relative shrink-0"
                style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`, border: `1.5px solid ${grad.border}40` }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xl leading-none">{actor.flag || "🏳️"}</span>
                  <span className="text-[10px] font-mono font-bold text-white/50 tracking-wider">{initials}</span>
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {actor.flag && <span className="text-xl">{actor.flag}</span>}
                <h1 className="text-xl font-bold text-zinc-100 tracking-tight">{actor.name}</h1>
                {actor.short_name && actor.short_name !== actor.name && (
                  <span className="text-xs text-zinc-500 font-mono">({actor.short_name})</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${cfg.bg} border ${cfg.border} ${cfg.color}`}>
                  <SideIcon className="h-3 w-3" /> {cfg.label}
                </span>
                {actor.type && (
                  <Tag>{actor.type.replace(/_/g, " ")}</Tag>
                )}
                {actor.country && (
                  <span className="text-xs text-zinc-500 font-mono">{actor.country}</span>
                )}
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{actor.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 text-center">
          <p className="text-2xl font-bold font-mono text-zinc-200">{relatedEvents.length}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Related Events</p>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 text-center">
          <p className="text-2xl font-bold font-mono text-zinc-200">{actor.estimated_strength || "—"}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Est. Strength</p>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 text-center">
          <p className="text-2xl font-bold font-mono text-zinc-200">{(actor.relationships || []).length}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Relations</p>
        </div>
      </div>

      {/* Leadership + Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Leadership */}
        {(actor.leader || (actor.leadership && actor.leadership.length > 0)) && (
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-3.5 w-3.5 text-amber-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Leadership</h3>
            </div>
            {actor.leader && (
              <div className={`text-sm font-medium mb-3 ${actor.leader.includes("KIA") || actor.leader.includes("UNKNOWN") ? "text-red-400" : "text-zinc-200"}`}>
                {actor.leader}
              </div>
            )}
            {actor.leadership && actor.leadership.length > 0 && (
              <ul className="space-y-2">
                {actor.leadership.map((l: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="h-1 w-1 rounded-full bg-amber-500/60 mt-1.5 shrink-0" />
                    {l}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Capabilities */}
        {actor.capabilities && actor.capabilities.length > 0 && (
          <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Capabilities</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {actor.capabilities.map((cap: string, i: number) => (
                <Tag key={i} variant="green">{cap}</Tag>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Relations */}
      {actor.relationships && actor.relationships.length > 0 && (
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="h-3.5 w-3.5 text-zinc-400" />
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Relationships</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {actor.relationships.map((rel: any, i: number) => {
              const relatedActor = actors.find((a: any) => a.id === rel.actor_id);
              return (
                <Link
                  key={i}
                  href={`/actors/${rel.actor_id}`}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 ${relationColors[rel.type] || "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}
                >
                  {relatedActor?.flag && <span>{relatedActor.flag}</span>}
                  <span>{relatedActor?.short_name || rel.actor_id}</span>
                  <span className="opacity-60 font-normal">· {rel.type.replace(/_/g, " ")}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-red-500/70" />
            <span className="text-xs font-bold text-zinc-100 tracking-wider">RELATED EVENTS</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-auto">{relatedEvents.length} EVENTS</span>
          </div>
          <div className="space-y-2">
            {relatedEvents.slice(0, 8).map((event: any) => (
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
                      {event.event_type && (
                        <Tag>{event.event_type.replace(/_/g, " ")}</Tag>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
