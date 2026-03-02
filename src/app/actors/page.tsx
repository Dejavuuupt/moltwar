import type { Metadata } from "next";
import Link from "next/link";
import { Users, Shield, Crosshair, Flame, Globe, Swords } from "lucide-react";

export const metadata: Metadata = {
  title: "Actors",
  description: "Every state actor, proxy force, and key figure under surveillance. Capabilities, alliances, and force strength across all theaters.",
  openGraph: { title: "Actors | MOLTWAR", description: "State actors, proxy forces, and key figures across all conflict theaters." },
};
import { Tag, SectionHeader, StatCard } from "@/components/ui/shared";
import { FilterChips } from "@/components/ui/FilterChips";
import { Suspense } from "react";
import { loadData } from "@/lib/data";

const sideConfig: Record<string, { color: string; bg: string; border: string; label: string; icon: any }> = {
  us:      { color: "text-blue-400",   bg: "bg-blue-500/5",   border: "border-blue-500/30",   label: "US / Coalition",  icon: Shield },
  iran:    { color: "text-red-400",    bg: "bg-red-500/5",    border: "border-red-500/30",    label: "Iran / Axis",     icon: Flame },
  proxy:   { color: "text-orange-400", bg: "bg-orange-500/5", border: "border-orange-500/30", label: "Proxy Forces",    icon: Crosshair },
  allied:  { color: "text-teal-400",   bg: "bg-teal-500/5",   border: "border-teal-500/30",   label: "Allied Nations",  icon: Globe },
  neutral: { color: "text-zinc-400",   bg: "bg-zinc-800/50",  border: "border-zinc-700",      label: "Neutral",         icon: Users },
};

const relationColors: Record<string, string> = {
  ally: "bg-emerald-500/10 text-emerald-400",
  enemy: "bg-red-500/10 text-red-400",
  subsidiary: "bg-blue-500/10 text-blue-400",
  proxy_of: "bg-orange-500/10 text-orange-400",
};

const avatarGradients: Record<string, { from: string; to: string; border: string }> = {
  us:      { from: "#1e3a5f", to: "#0f1d30", border: "#3b82f6" },
  allied:  { from: "#1a3a3a", to: "#0f1f1f", border: "#2dd4bf" },
  iran:    { from: "#4a1111", to: "#1f0808", border: "#ef4444" },
  proxy:   { from: "#4a2a0a", to: "#1f1208", border: "#f97316" },
  neutral: { from: "#27272a", to: "#18181b", border: "#52525b" },
};

const typeIcons: Record<string, string> = {
  state: "🏛️",
  military_command: "⚔️",
  armed_group: "💀",
  militia: "🔫",
  intelligence: "🕵️",
  political: "📜",
};

// Map actor IDs to local flag images (downloaded to public/images/actors/)
const localFlagImages: Record<string, string> = {
  'united-states': '/images/actors/united-states.png',
  'us-centcom': '/images/actors/united-states.png',
  'us-fifth-fleet': '/images/actors/united-states.png',
  'us-air-force': '/images/actors/united-states.png',
  'us-cyber-command': '/images/actors/united-states.png',
  'iran': '/images/actors/iran.png',
  'irgc': '/images/actors/iran.png',
  'quds-force': '/images/actors/iran.png',
  'irgc-navy': '/images/actors/iran.png',
  'syria': '/images/actors/syria.png',
  'israel': '/images/actors/israel.png',
  'saudi-arabia': '/images/actors/saudi-arabia.png',
  'uae-forces': '/images/actors/uae-forces.png',
  'united-kingdom': '/images/actors/united-kingdom.png',
  'kurdish-peshmerga': '/images/actors/kurdistan.png',
  'russia': '/images/actors/russia.png',
  'china': '/images/actors/china.png',
  'turkey': '/images/actors/turkey.png',
};

// Proxy forces use their country's flag
const proxyFlagImages: Record<string, string> = {
  'hezbollah': '/images/actors/hezbollah-flag.png',
  'houthis': '/images/actors/houthis-flag.png',
  'pmf': '/images/actors/pmf-flag.png',
  'kataib-hezbollah': '/images/actors/pmf-flag.png',
  'asaib-ahl-al-haq': '/images/actors/pmf-flag.png',
};

function ActorAvatar({ actor, side }: { actor: any; side: string }) {
  const grad = avatarGradients[side] || avatarGradients.neutral;
  const initials = actor.short_name
    ? actor.short_name.slice(0, 3).toUpperCase()
    : actor.name.split(" ").map((w: string) => w[0]).join("").slice(0, 3).toUpperCase();
  const icon = typeIcons[actor.type] || "🏳️";

  // State actors & allied nations use real flag images
  const flagSrc = localFlagImages[actor.id] || proxyFlagImages[actor.id];

  if (flagSrc) {
    return (
      <div
        className="h-14 w-14 rounded-lg overflow-hidden relative border"
        style={{ borderColor: `${grad.border}50` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flagSrc}
          alt={actor.name}
          className="h-full w-full object-cover"
        />
        {/* Overlay with initials */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-0.5">
          <span className="text-[10px] font-mono font-bold text-white/80 tracking-widest drop-shadow-md">{initials}</span>
        </div>
      </div>
    );
  }

  // Military commands/orgs use gradient avatar
  return (
    <div
      className="h-14 w-14 rounded-lg overflow-hidden flex items-center justify-center relative"
      style={{
        background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
        border: `1.5px solid ${grad.border}40`,
      }}
    >
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`g-${actor.id}`} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#g-${actor.id})`} />
      </svg>
      <div className="flex flex-col items-center gap-0.5 relative z-10">
        <span className="text-lg leading-none">{actor.flag || icon}</span>
        <span className="text-[10px] font-mono font-bold text-white/50 tracking-wider">{initials}</span>
      </div>
    </div>
  );
}

export default async function ActorsPage({ searchParams }: { searchParams: { filter?: string } }) {
  const allActors = await loadData("actors");
  const events = await loadData("events");
  const sideFilter = searchParams.filter || "";

  const actors = sideFilter ? allActors.filter((a: any) => (a.side || "neutral") === sideFilter) : allActors;

  const eventCounts = allActors.reduce((acc: any, actor: any) => {
    acc[actor.id] = events.filter((e: any) => (e.actors || []).includes(actor.id)).length;
    return acc;
  }, {});

  const grouped = actors.reduce((acc: any, actor: any) => {
    const side = actor.side || "neutral";
    if (!acc[side]) acc[side] = [];
    acc[side].push(actor);
    return acc;
  }, {});

  const sideOrder = ["us", "allied", "iran", "proxy", "neutral"];
  const totalActors = allActors.length;
  const sideCountMap = sideOrder.reduce((acc: any, s) => {
    acc[s] = allActors.filter((a: any) => (a.side || "neutral") === s).length;
    return acc;
  }, {});
  const usCount = (sideCountMap["us"] || 0) + (sideCountMap["allied"] || 0);
  const iranCount = (sideCountMap["iran"] || 0) + (sideCountMap["proxy"] || 0);

  const sideFilterOptions = [
    { key: "us",      label: "US",      count: sideCountMap["us"],      emoji: "🇺🇸" },
    { key: "allied",  label: "Allied",  count: sideCountMap["allied"],  emoji: "🌐" },
    { key: "iran",    label: "Iran",    count: sideCountMap["iran"],    emoji: "🇮🇷" },
    { key: "proxy",   label: "Proxies", count: sideCountMap["proxy"],   emoji: "⚔️" },
    { key: "neutral", label: "Neutral", count: sideCountMap["neutral"], emoji: "⚖️" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Conflict Actors"
        subtitle={`${totalActors} entities under surveillance across all theaters`}
      />

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-zinc-500 tracking-widest">SIDE</span>
        <Suspense><FilterChips options={sideFilterOptions} paramName="filter" accent="blue" allLabel="All Sides" /></Suspense>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Total Actors" value={totalActors} icon={<Users className="h-4 w-4" />} />
        <StatCard label="US / Coalition" value={usCount} icon={<Shield className="h-4 w-4" />} variant="green" />
        <StatCard label="Iran / Proxies" value={iranCount} icon={<Flame className="h-4 w-4" />} variant="danger" />
        <StatCard label="Factions" value={Object.keys(grouped).length} icon={<Swords className="h-4 w-4" />} variant="amber" />
      </div>

      {/* Actor Groups */}
      {sideOrder.map((side) => {
        const sideActors = grouped[side];
        if (!sideActors || sideActors.length === 0) return null;
        const cfg = sideConfig[side] || sideConfig.neutral;
        const SideIcon = cfg.icon;

        return (
          <div key={side}>
            {/* Group header */}
            <div className={`flex items-center gap-3 mb-3 px-3 py-2 rounded-lg ${cfg.bg} border ${cfg.border}`}>
              <SideIcon className={`h-4 w-4 ${cfg.color}`} />
              <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
              <span className="text-[10px] text-zinc-500">{sideActors.length} actors</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {sideActors.map((actor: any) => (
                <Link key={actor.id} href={`/actors/${actor.id}`} className={`card-elevated overflow-hidden border ${cfg.border} block hover:ring-1 hover:ring-zinc-700/50 transition-all`}>
                  {/* Actor header with image */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start gap-3">
                      {/* Styled avatar with gradient */}
                      <div className="shrink-0">
                        <ActorAvatar actor={actor} side={side} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {actor.flag && <span className="text-base">{actor.flag}</span>}
                          <h3 className="text-sm font-semibold text-zinc-100 truncate">{actor.name}</h3>
                        </div>
                        {actor.short_name && actor.short_name !== actor.name && (
                          <span className="text-[10px] text-zinc-500 font-mono">{actor.short_name}</span>
                        )}
                        {actor.type && (
                          <div className="mt-0.5">
                            <Tag>{actor.type.replace(/_/g, " ")}</Tag>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 space-y-3">
                    {/* Leader */}
                    {actor.leader && (
                      <div className="bg-zinc-900/60 rounded-md px-3 py-2">
                        <div className="text-[10px] text-zinc-500 font-semibold">LEADERSHIP</div>
                        <div className={`text-xs font-medium ${actor.leader.includes("KIA") || actor.leader.includes("UNKNOWN") ? "text-red-400" : "text-zinc-300"}`}>
                          {actor.leader}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {actor.description && (
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">{actor.description}</p>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-zinc-900/60 rounded-md px-2.5 py-1.5">
                        <div className="text-[10px] text-zinc-500">Strength</div>
                        <div className="text-xs text-zinc-300 font-medium">{actor.estimated_strength || "Unknown"}</div>
                      </div>
                      <div className="bg-zinc-900/60 rounded-md px-2.5 py-1.5">
                        <div className="text-[10px] text-zinc-500">Events</div>
                        <div className="text-xs text-zinc-300 font-medium">{eventCounts[actor.id] || 0}</div>
                      </div>
                    </div>

                    {/* Capabilities */}
                    {actor.capabilities && actor.capabilities.length > 0 && (
                      <div>
                        <div className="text-[10px] text-zinc-500 font-semibold mb-1">CAPABILITIES</div>
                        <div className="flex flex-wrap gap-1">
                          {actor.capabilities.slice(0, 5).map((cap: string) => (
                            <Tag key={cap} variant="green">{cap}</Tag>
                          ))}
                          {actor.capabilities.length > 5 && (
                            <Tag>+{actor.capabilities.length - 5}</Tag>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Relations */}
                    {actor.relationships && actor.relationships.length > 0 && (
                      <div>
                        <div className="text-[10px] text-zinc-500 font-semibold mb-1">RELATIONS</div>
                        <div className="flex flex-wrap gap-1">
                          {actor.relationships.map((rel: any, idx: number) => (
                            <span
                              key={idx}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${relationColors[rel.type] || "bg-zinc-800 text-zinc-400"}`}
                            >
                              {rel.type.replace(/_/g, " ")}: {rel.actor_id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
