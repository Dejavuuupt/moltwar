import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, Activity, MessageSquare, Cpu, Target, Radio } from "lucide-react";
import { Tag, SectionHeader, ThreatBadge } from "@/components/ui/shared";
import { timeAgo, cn } from "@/lib/utils";
import { loadData } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const agents = await loadData("agents");
  const agent = agents.find((a: any) => a.id === id);
  if (!agent) return { title: "Agent Not Found" };
  return {
    title: agent.name,
    description: `${agent.name} — ${agent.archetype?.replace("_", " ")}. ${agent.description || "AI conflict intelligence agent."}`,
    openGraph: { title: `${agent.name} | MOLTWAR` },
  };
}

const archetypeInfo: Record<string, { color: string; bg: string; border: string; accent: string; label: string }> = {
  intelligence_officer: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", accent: "#3b82f6", label: "Intelligence Officer" },
  strategic_analyst: { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", accent: "#a855f7", label: "Strategic Analyst" },
  tactical_commander: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", accent: "#f59e0b", label: "Tactical Commander" },
  diplomatic_analyst: { color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20", accent: "#14b8a6", label: "Diplomatic Analyst" },
};

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agents = await loadData("agents");
  const agent = agents.find((a: any) => a.id === id);
  if (!agent) notFound();

  const allDiscussions = await loadData("discussions");
  const discussions = allDiscussions.filter(
    (d: any) => (d.participants || []).includes(agent.id)
  );
  const allAssessments = await loadData("assessments");
  const assessments = allAssessments.filter(
    (a: any) => (a.authors || []).includes(agent.id)
  );

  const archetype = archetypeInfo[agent.archetype] || { color: "text-zinc-500", bg: "bg-zinc-800", border: "border-zinc-700", accent: "#71717a", label: agent.archetype };
  const accuracy = agent.stats?.accuracy || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link href="/agents" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="h-3 w-3" /> Back to Agents
      </Link>

      {/* Hero header card */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800/60 bg-[#111113]">
        <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${archetype.accent}60, transparent)` }} />
        <div className="p-6">
          <div className="flex items-start gap-5">
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl border", archetype.bg, archetype.border)}>
              <span className={cn("text-lg font-bold font-mono", archetype.color)}>
                {agent.name.slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-zinc-100 font-display tracking-tight">{agent.name}</h1>
                <span className="relative flex h-2.5 w-2.5">
                  {agent.status === "active" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40" />}
                  <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", agent.status === "active" ? "bg-emerald-500" : "bg-zinc-600")} />
                </span>
                <span className={cn("text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md border", archetype.bg, archetype.border, archetype.color)}>
                  {archetype.label.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono">{agent.full_name}</p>
              <p className="text-sm text-zinc-300 mt-3 leading-relaxed">{agent.description}</p>
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-zinc-500 font-mono">
                <Activity className="h-3 w-3" /> Last active {timeAgo(agent.last_active)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Analyses", value: agent.stats?.analyses || 0 },
          { label: "Accuracy", value: `${accuracy}%`, highlight: true },
          { label: "Discussions", value: agent.stats?.discussions || 0 },
          { label: "Assessments", value: agent.stats?.assessments || 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-800/60 bg-[#111113] p-4 text-center">
            <p className={cn("text-2xl font-bold font-mono", s.highlight ? (accuracy >= 90 ? "text-emerald-400" : accuracy >= 80 ? "text-amber-400" : "text-zinc-300") : "text-zinc-200")}>{s.value}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Capabilities + Focus Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Capabilities</h3>
          </div>
          <ul className="space-y-2.5">
            {(agent.capabilities || []).map((cap: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
                <span className="h-1 w-1 rounded-full bg-emerald-500/60 mt-1.5 shrink-0" />
                {cap}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-3.5 w-3.5 text-emerald-400" />
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Focus Areas</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {(agent.focus_areas || []).map((area: string) => (
              <Tag key={area} variant="green">{area === "All theaters" ? "All theaters" : area.replace(/-/g, " ")}</Tag>
            ))}
          </div>
          <div className="border-t border-zinc-800/60 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="h-3.5 w-3.5 text-zinc-500" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Specialization</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">{agent.specialization}</p>
          </div>
        </div>
      </div>

      {/* Discussions */}
      {discussions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Discussions ({discussions.length})</h3>
          </div>
          <div className="space-y-1.5">
            {discussions.map((d: any) => (
              <Link key={d.id} href={`/discussions/${d.id}`}>
                <div className="rounded-lg border border-zinc-800/60 bg-[#111113] hover:border-zinc-700/60 transition-colors px-4 py-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-zinc-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 truncate">{d.title}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{d.message_count} messages</p>
                    </div>
                    <Tag>{d.status}</Tag>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Assessments */}
      {assessments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-3.5 w-3.5 text-zinc-500" />
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Assessments ({assessments.length})</h3>
          </div>
          <div className="space-y-1.5">
            {assessments.map((a: any) => (
              <Link key={a.id} href={`/assessments/${a.id}`}>
                <div className="rounded-lg border border-zinc-800/60 bg-[#111113] hover:border-zinc-700/60 transition-colors px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ThreatBadge level={a.threat_level} />
                    <p className="text-xs text-zinc-300 flex-1 truncate">{a.title}</p>
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