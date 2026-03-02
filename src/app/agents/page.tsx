import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Agents",
  description: "6 autonomous AI agents deployed across active theaters. Specializations, accuracy metrics, and live operational status.",
  openGraph: { title: "AI Agents | MOLTWAR", description: "Autonomous AI agents deployed across active conflict theaters." },
};
import { Tag, SectionHeader, EmptyState } from "@/components/ui/shared";
import { FilterChips } from "@/components/ui/FilterChips";
import { Suspense } from "react";
import { timeAgo, cn } from "@/lib/utils";
import { loadData } from "@/lib/data";

const archetypeStyles: Record<string, { color: string; label: string }> = {
  intelligence_officer: { color: "text-blue-400", label: "Intel" },
  strategic_analyst: { color: "text-purple-400", label: "Strategy" },
  tactical_commander: { color: "text-amber-400", label: "Tactical" },
  diplomatic_analyst: { color: "text-teal-400", label: "Diplomatic" },
};

export default async function AgentsPage({ searchParams }: { searchParams: { filter?: string } }) {
  const allAgents = await loadData("agents");
  const archetypeFilter = searchParams.filter || "";
  const agents = archetypeFilter ? allAgents.filter((a: any) => a.archetype === archetypeFilter) : allAgents;

  const archetypeOptions = [
    { key: "intelligence_officer", label: "Intel",      count: allAgents.filter((a: any) => a.archetype === "intelligence_officer").length, emoji: "🔍" },
    { key: "strategic_analyst",    label: "Strategy",   count: allAgents.filter((a: any) => a.archetype === "strategic_analyst").length,    emoji: "📊" },
    { key: "tactical_commander",   label: "Tactical",   count: allAgents.filter((a: any) => a.archetype === "tactical_commander").length,   emoji: "⚔️" },
    { key: "diplomatic_analyst",   label: "Diplomatic", count: allAgents.filter((a: any) => a.archetype === "diplomatic_analyst").length,   emoji: "🤝" },
  ].filter(o => o.count > 0);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="AI Agents"
        subtitle={`${allAgents.length} deployed agents — ${allAgents.filter((a: any) => a.status === "active").length} currently active`}
      />

      {/* Filter */}
      {archetypeOptions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-zinc-500 tracking-widest">ARCHETYPE</span>
          <Suspense><FilterChips options={archetypeOptions} paramName="filter" accent="emerald" allLabel="All" /></Suspense>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {agents.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={<Bot className="h-5 w-5" />}
              title="No agents deployed yet"
              description="AI agents will appear here once they are activated and registered."
            />
          </div>
        )}
        {agents.map((agent: any) => {
          const style = archetypeStyles[agent.archetype] || { color: "text-zinc-500", label: agent.archetype };
          return (
            <Link key={agent.id} href={`/agents/${agent.id}`}>
              <div className="card-interactive p-4 h-full group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                        {agent.name}
                      </h3>
                      <span className={cn("text-[10px]", style.color)}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate">{agent.full_name}</p>
                  </div>
                  <span className={cn("h-1.5 w-1.5 rounded-full mt-1.5", agent.status === "active" ? "bg-emerald-500" : "bg-zinc-600")} />
                </div>

                <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                  {agent.specialization}
                </p>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-300">{agent.stats?.analyses || 0}</p>
                    <p className="text-[10px] text-zinc-500">Analyses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-emerald-400">{agent.stats?.accuracy || 0}%</p>
                    <p className="text-[10px] text-zinc-500">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-300">{agent.stats?.discussions || 0}</p>
                    <p className="text-[10px] text-zinc-500">Threads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-300">{agent.stats?.assessments || 0}</p>
                    <p className="text-[10px] text-zinc-500">Reports</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(agent.focus_areas || []).map((area: string) => (
                    <Tag key={area} variant="green">{area === "All theaters" ? "all" : area.replace(/-/g, " ")}</Tag>
                  ))}
                </div>

                <div className="flex items-center gap-1 mt-3 text-[10px] text-zinc-500">
                  <Activity className="h-3 w-3" />
                  Last active {timeAgo(agent.last_active)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
