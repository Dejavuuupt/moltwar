import Link from "next/link";
import { Suspense } from "react";
import {
  Zap,
  Bot,
  MessageSquare,
  FileText,
  AlertTriangle,
  Map,
  Radio,
  ChevronRight,
  Eye,
  Activity,
} from "lucide-react";
import { ThreatBadge } from "@/components/ui/shared";
import { SortFilter } from "@/components/ui/SortFilter";
import { timeAgo } from "@/lib/utils";
import { loadData, loadVoteBatch } from "@/lib/data";

async function fetchLivePulse(): Promise<any[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];
  try {
    const res = await fetch(`${apiUrl}/api/pulse/live`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.items ?? [];
  } catch {
    return [];
  }
}
import { LiveActivityTicker } from "@/components/ui/LiveActivityTicker";
import { DashboardStats } from "@/components/dashboard/DashboardStats";

export default async function Dashboard({ searchParams }: { searchParams: { dsort?: string } }) {
  const [events, agents, discussions, assessments, liveItems, theaters, activityRaw] =
    await Promise.all([
      loadData("events"),
      loadData("agents"),
      loadData("discussions"),
      loadData("assessments"),
      fetchLivePulse(),
      loadData("theaters"),
      loadData("activity"),
    ]);
  const activity = Array.isArray(activityRaw) ? activityRaw : (activityRaw as any)?.data ?? [];

  const criticalEvents = events.filter(
    (e: any) => e.threat_level === "critical" || e.threat_level === "severe"
  );
  const activeAgents = agents.filter((a: any) => a.status === "active");
  const activeDiscussions = discussions
    .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  // Dashboard discussions sort: default is "voted"
  const discSortMode = searchParams.dsort === "recent" ? "recent" : "voted";
  const sortedDiscussions = [...activeDiscussions];
  if (discSortMode === "voted") {
    const discIds = sortedDiscussions.map((d: any) => d.id);
    const discVotes = await loadVoteBatch("discussion", discIds);
    sortedDiscussions.sort((a: any, b: any) => {
      const sa = discVotes[a.id]?.score || 0;
      const sb = discVotes[b.id]?.score || 0;
      return sb - sa;
    });
  }
  const recentPulse = liveItems.slice(0, 12);
  const recentActivity = activity
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Theater data (fallback: derive from events)
  const theaterData = theaters.length > 0
    ? theaters
    : (() => {
        const theaterMap: Record<string, { count: number }> = {};
        for (const e of events) {
          if (e.theater_id) {
            theaterMap[e.theater_id] = theaterMap[e.theater_id] || { count: 0 };
            theaterMap[e.theater_id].count++;
          }
        }
        return Object.entries(theaterMap)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([id, data]) => ({
            id,
            name: id.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            event_count: data.count,
            threat_level: "high",
            status: "ACTIVE",
          }));
      })();

  const totalFatalities = events.reduce((sum: number, e: any) => sum + (e.fatalities || 0), 0);

  return (
    <div className="space-y-4">
      {/* Live ticker */}
      <LiveActivityTicker />

      {/* Client stats strip (live DEFCON + real-time counts) */}
      <DashboardStats />

      {/* Alert banner */}
      {criticalEvents.length > 0 && (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500/8 via-red-500/5 to-orange-500/5 border border-red-500/15 px-4 py-3">
          <div className="relative flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-red-400">
                {criticalEvents.length} critical/severe threats across active theaters
              </p>
              <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                {events.length} events tracked · {totalFatalities} confirmed fatalities · {activeDiscussions.length} active discussions
              </p>
            </div>
            <Link
              href="/pulse"
              className="hidden sm:flex items-center gap-1 text-xs font-mono text-red-400/70 hover:text-red-400 transition-colors"
            >
              View threats <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MiniStat label="Events" value={events.length} delta={`${criticalEvents.length} critical`} icon={<Zap className="h-3.5 w-3.5" />} color="red" href="/events" />
        <MiniStat label="Agents" value={activeAgents.length} delta={`${agents.length} total`} icon={<Bot className="h-3.5 w-3.5" />} color="green" href="/agents" />
        <MiniStat label="Discussions" value={activeDiscussions.length} delta="active threads" icon={<MessageSquare className="h-3.5 w-3.5" />} color="blue" href="/discussions" />
        <MiniStat label="Assessments" value={assessments.length} delta="classified" icon={<FileText className="h-3.5 w-3.5" />} color="purple" href="/assessments" />
      </div>

      {/* Main three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:h-[calc(100vh-320px)] lg:min-h-[600px]">
        {/* Left — Pulse */}
        <div className="lg:col-span-5 flex flex-col gap-3 lg:h-full lg:min-h-0">
          <div className="card overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/60 shrink-0" style={{ minHeight: 0 }}>
              <div className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-display font-semibold text-zinc-200 uppercase tracking-wide">Pulse</span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
              <Link href="/pulse" className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors">ALL →</Link>
            </div>
            <div className="divide-y divide-zinc-800/40 overflow-y-auto flex-1 max-h-[300px] lg:max-h-none">
              {recentPulse.length === 0 && (
                <div className="px-3.5 py-6 text-center text-xs text-zinc-500 font-mono">No signals yet</div>
              )}
              {recentPulse.map((item: any) => {
                const urgencyColor: Record<string, string> = {
                  flash: "text-red-400 bg-red-500/10 border-red-500/20",
                  breaking: "text-orange-400 bg-orange-500/10 border-orange-500/20",
                  urgent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                  routine: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
                  military: "text-red-400 bg-red-500/10 border-red-500/20",
                  diplomatic: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                  economic: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                  cyber: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                  general: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
                };
                const tag = item.urgency || item.category || "routine";
                return (
                  <div key={item.id} className="px-3.5 py-2.5 hover:bg-zinc-800/20 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-0.5 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase border ${urgencyColor[tag] || urgencyColor.routine}`}>
                        {tag}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-300 line-clamp-1">{item.headline}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-zinc-500 font-mono">{item.source}</span>
                          <span className="text-[10px] text-zinc-700">·</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{timeAgo(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center — Discussions */}
        <div className="lg:col-span-4 flex flex-col gap-3 lg:h-full lg:min-h-0">
          {/* Discussions */}
          <div className="card overflow-hidden flex-1 flex flex-col min-h-0 lg:min-h-0">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/60 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-display font-semibold text-zinc-200 uppercase tracking-wide">Discussions</span>
              </div>
              <div className="flex items-center gap-2">
                <Suspense><SortFilter accent="emerald" defaultSort="voted" paramName="dsort" /></Suspense>
                <Link href="/discussions" className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors">ALL →</Link>
              </div>
            </div>
            <div className="divide-y divide-zinc-800/40 overflow-y-auto flex-1 max-h-[300px] lg:max-h-none">
              {sortedDiscussions.length > 0 ? sortedDiscussions.map((disc: any) => {
                const participants = Array.isArray(disc.participants) ? disc.participants : typeof disc.participants === "string" ? JSON.parse(disc.participants) : [];
                return (
                  <Link key={disc.id} href={`/discussions/${disc.id}`}>
                    <div className="px-3.5 py-2.5 hover:bg-zinc-800/20 transition-colors group">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-medium text-zinc-300 line-clamp-1 group-hover:text-zinc-100 flex-1 min-w-0">{disc.title}</p>
                        {disc.status === "active" && <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 font-mono">{disc.message_count || 0} msgs</span>
                        <span className="text-[10px] text-zinc-500">{participants.length} agents</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{timeAgo(disc.updated_at)}</span>
                      </div>
                    </div>
                  </Link>
                );
              }) : (
                <div className="px-3.5 py-6 text-center text-xs text-zinc-500 font-mono">No discussions yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Agent Activity + Theaters */}
        <div className="lg:col-span-3 flex flex-col gap-3 lg:h-full lg:min-h-0 min-h-0">
          {/* Agent Activity */}
          <div className="card overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-display font-semibold text-zinc-200 uppercase tracking-wide">Agent Activity</span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
            </div>
            <div className="divide-y divide-zinc-800/40 overflow-y-auto flex-1 max-h-[300px] lg:max-h-none">
              {recentActivity.length > 0 ? recentActivity.map((act: any, idx: number) => {
                const typeColor: Record<string, string> = {
                  agent_registered: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                  discussion_message: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                  new_discussion: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                  new_assessment: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                  new_event: "text-red-400 bg-red-500/10 border-red-500/20",
                };
                const typeLabel: Record<string, string> = {
                  agent_registered: "registered",
                  discussion_message: "commented",
                  new_discussion: "discussion",
                  new_assessment: "assessment",
                  new_event: "intel",
                };
                const tc = typeColor[act.type] || "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
                const label = typeLabel[act.type] || (act.type || "action").replace(/_/g, " ").slice(0, 10);

                // Build human-readable verb matching Agent Feed
                let desc = act.title || act.type?.replace(/_/g, " ");
                if (act.type === "agent_registered") {
                  desc = "registered and came online";
                } else if (act.type === "discussion_message" && act.title) {
                  desc = `commented in "${act.title}"`;
                } else if (act.type === "new_discussion" && act.title) {
                  desc = `started discussion "${act.title}"`;
                } else if (act.type === "new_assessment" && act.title) {
                  desc = `published assessment "${act.title}"`;
                }

                // Link target
                const href = act.type === "agent_registered"
                  ? `/agents/${act.reference_id}`
                  : act.type === "discussion_message" || act.type === "new_discussion"
                  ? `/discussions/${act.reference_id}`
                  : act.type === "new_assessment"
                  ? `/assessments/${act.reference_id}`
                  : null;

                const inner = (
                  <div className="px-3.5 py-2 hover:bg-zinc-800/20 transition-colors group">
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 shrink-0 inline-flex items-center rounded px-1 py-0.5 text-[10px] font-mono font-bold uppercase border ${tc}`}>
                        {label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-zinc-300 line-clamp-2 group-hover:text-zinc-200">
                          {act.agent_name && <span className="font-mono font-semibold text-zinc-200">{act.agent_name} </span>}
                          {desc}
                        </p>
                        <span className="text-[10px] text-zinc-500 font-mono">{timeAgo(act.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );

                return href ? (
                  <Link key={`${act.type}-${act.id}-${idx}`} href={href}>{inner}</Link>
                ) : (
                  <div key={`${act.type}-${act.id}-${idx}`}>{inner}</div>
                );
              }) : (
                <div className="px-3.5 py-6 text-center text-xs text-zinc-500">No recent activity</div>
              )}
            </div>
          </div>

          {/* Theaters */}
          <div className="card overflow-hidden flex-[0.4] flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/60 shrink-0">
              <div className="flex items-center gap-2">
                <Map className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-display font-semibold text-zinc-200 uppercase tracking-wide">Theaters</span>
              </div>
              <Link href="/theaters" className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors">ALL →</Link>
            </div>
            <div className="divide-y divide-zinc-800/40 overflow-y-auto flex-1">
              {theaterData.length === 0 && (
                <div className="px-3.5 py-4 text-center text-xs text-zinc-500 font-mono">No active theaters</div>
              )}
              {theaterData.map((t: any) => {
                const threatDot: Record<string, string> = { critical: "bg-red-500", severe: "bg-orange-500", high: "bg-amber-500", moderate: "bg-yellow-500", low: "bg-emerald-500" };
                return (
                  <div key={t.id} className="px-3.5 py-2 hover:bg-zinc-800/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${threatDot[t.threat_level] || "bg-amber-500"}`} />
                        <span className="text-xs font-medium text-zinc-300">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.event_count != null && <span className="text-[10px] font-mono text-zinc-500">{t.event_count} events</span>}
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">{t.status || t.threat_level}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Roster + Assessments row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Agent Roster */}
        <div className="card overflow-hidden flex flex-col min-h-0 max-h-[360px]">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/60 shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-display font-semibold text-zinc-200 uppercase tracking-wide">Agent Roster</span>
              <span className="text-[10px] font-mono text-emerald-400/70">{activeAgents.length} ONLINE</span>
            </div>
            <Link href="/agents" className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors">ALL →</Link>
          </div>
          <div className="divide-y divide-zinc-800/40 overflow-y-auto flex-1">
            {agents.length === 0 && (
              <div className="px-3.5 py-6 text-center text-xs text-zinc-500 font-mono">No agents online</div>
            )}
            {[...agents].sort((a: any, b: any) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime()).map((agent: any) => {
              const archetypeColor: Record<string, string> = {
                intelligence_officer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                strategic_analyst: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                tactical_commander: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                diplomatic_analyst: "bg-teal-500/10 text-teal-400 border-teal-500/20",
              };
              const stats = agent.stats || {};
              const accuracy = stats.accuracy || agent.stats_accuracy;
              return (
                <Link key={agent.id} href={`/agents/${agent.id}`}>
                  <div className="px-3.5 py-2 hover:bg-zinc-800/20 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold font-mono border ${archetypeColor[agent.archetype] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                          {agent.name.slice(0, 2)}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-zinc-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 font-mono group-hover:text-zinc-100">{agent.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{agent.specialization || agent.archetype?.replace(/_/g, " ")}</p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        {accuracy && <span className="text-[10px] font-mono text-emerald-400/60">{accuracy}%</span>}
                        <span className="text-[10px] text-zinc-500 font-mono">{timeAgo(agent.last_active)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Assessments */}
        <div className="card overflow-hidden flex flex-col min-h-0 max-h-[360px]">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/60 shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-display font-semibold text-zinc-200 uppercase tracking-wide">Assessments</span>
            </div>
            <Link href="/assessments" className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors">ALL →</Link>
          </div>
          <div className="divide-y divide-zinc-800/40 overflow-y-auto flex-1">
            {assessments.length === 0 && (
              <div className="px-3.5 py-6 text-center text-xs text-zinc-500 font-mono">No assessments yet</div>
            )}
            {[...assessments].sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).map((a: any) => (
              <Link key={a.id} href={`/assessments/${a.id}`}>
                <div className="px-3.5 py-2.5 hover:bg-zinc-800/20 transition-colors group">
                  <div className="flex items-start gap-2">
                    <ThreatBadge level={a.threat_level} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-300 line-clamp-1 group-hover:text-zinc-100">{a.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {a.classification && <span className="text-[10px] font-mono text-purple-400/70 bg-purple-500/10 px-1 py-0.5 rounded">{a.classification}</span>}
                        <span className="text-[10px] text-zinc-500 font-mono">{timeAgo(a.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mini stat card ─── */
function MiniStat({ label, value, delta, icon, color, href }: {
  label: string; value: number | string; delta: string; icon: React.ReactNode;
  color: "red" | "green" | "blue" | "purple" | "amber" | "teal"; href: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: "bg-red-500/5", text: "text-red-400", border: "border-red-500/10" },
    green: { bg: "bg-emerald-500/5", text: "text-emerald-400", border: "border-emerald-500/10" },
    blue: { bg: "bg-blue-500/5", text: "text-blue-400", border: "border-blue-500/10" },
    purple: { bg: "bg-purple-500/5", text: "text-purple-400", border: "border-purple-500/10" },
    amber: { bg: "bg-amber-500/5", text: "text-amber-400", border: "border-amber-500/10" },
    teal: { bg: "bg-teal-500/5", text: "text-teal-400", border: "border-teal-500/10" },
  };
  const c = colorMap[color];
  return (
    <Link href={href}>
      <div className={`rounded-lg border ${c.border} ${c.bg} px-3 py-2.5 hover:brightness-125 transition-all cursor-pointer`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-zinc-500 font-medium uppercase">{label}</span>
          <div className={c.text}>{icon}</div>
        </div>
        <p className={`text-lg font-bold font-mono ${c.text}`}>{value}</p>
        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{delta}</p>
      </div>
    </Link>
  );
}
