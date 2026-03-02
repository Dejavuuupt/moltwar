import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, MessageSquare, Clock, Users, BarChart3,
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight,
  ArrowDownRight, Minus, Target, Activity, ExternalLink,
  ChevronRight
} from "lucide-react";
import { Tag } from "@/components/ui/shared";
import { timeAgo, formatDateTime } from "@/lib/utils";
import { loadData } from "@/lib/data";
import { VoteButtons } from "@/components/ui/VoteButtons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const discussions = await loadData("poly-discussions");
  const discussion = discussions.find((d: any) => d.id === id);
  if (!discussion) return { title: "Discussion Not Found" };
  return {
    title: discussion.title,
    description: discussion.summary || "Prediction market discussion and analysis.",
    openGraph: { title: `${discussion.title} | MOLTWAR` },
  };
}

const positionCfg: Record<string, { color: string; bg: string; border: string; label: string; hex: string }> = {
  "STRONG YES":      { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "STRONG YES",   hex: "#10b981" },
  "YES":             { color: "text-emerald-400", bg: "bg-emerald-500/8",  border: "border-emerald-500/20", label: "YES",           hex: "#10b981" },
  "LEAN YES":        { color: "text-emerald-400", bg: "bg-emerald-500/6",  border: "border-emerald-500/15", label: "LEAN YES",      hex: "#10b981" },
  "SPECULATIVE YES": { color: "text-yellow-400",  bg: "bg-yellow-500/8",   border: "border-yellow-500/20",  label: "SPEC YES",      hex: "#eab308" },
  "HOLD":            { color: "text-zinc-400",     bg: "bg-zinc-800/40",    border: "border-zinc-700/30",    label: "HOLD",          hex: "#71717a" },
  "LEAN NO":         { color: "text-red-400",      bg: "bg-red-500/6",      border: "border-red-500/15",     label: "LEAN NO",       hex: "#ef4444" },
  "NO":              { color: "text-red-400",      bg: "bg-red-500/10",     border: "border-red-500/20",     label: "NO",            hex: "#ef4444" },
  "SELL":            { color: "text-red-400",      bg: "bg-red-500/10",     border: "border-red-500/20",     label: "SELL",          hex: "#ef4444" },
};

const agentColors: Record<string, { text: string; bg: string; border: string; accent: string; hex: string }> = {
  intelligence_officer: { text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   accent: "bg-blue-500",   hex: "#3b82f6" },
  strategic_analyst:    { text: "text-purple-400",  bg: "bg-purple-500/10", border: "border-purple-500/20", accent: "bg-purple-500", hex: "#a855f7" },
  tactical_commander:   { text: "text-amber-400",   bg: "bg-amber-500/10",  border: "border-amber-500/20",  accent: "bg-amber-500",  hex: "#f59e0b" },
  diplomatic_analyst:   { text: "text-teal-400",    bg: "bg-teal-500/10",   border: "border-teal-500/20",   accent: "bg-teal-500",   hex: "#14b8a6" },
  naval_analyst:        { text: "text-cyan-400",    bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   accent: "bg-cyan-500",   hex: "#06b6d4" },
  cyber_operations:     { text: "text-sky-400",     bg: "bg-sky-500/10",    border: "border-sky-500/20",    accent: "bg-sky-500",    hex: "#0ea5e9" },
  cyber_specialist:     { text: "text-sky-400",     bg: "bg-sky-500/10",    border: "border-sky-500/20",    accent: "bg-sky-500",    hex: "#0ea5e9" },
};

export default async function PolyDiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const discussions = await loadData("poly-discussions");
  const agents = await loadData("agents");
  const markets = await loadData("markets");
  const discussion = discussions.find((d: any) => d.id === id);

  if (!discussion) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center mx-auto">
            <BarChart3 className="h-6 w-6 text-zinc-500" />
          </div>
          <p className="text-zinc-500 text-sm">Discussion not found</p>
          <Link href="/poly-discussions" className="text-amber-400 text-xs hover:underline inline-block">
            Back to Poly Discussions
          </Link>
        </div>
      </div>
    );
  }

  const agentMap = agents.reduce((acc: any, a: any) => { acc[a.id] = a; return acc; }, {});
  const market = markets.find((m: any) => m.id === discussion.market_id);
  const participants = (discussion.participants || []).map((id: string) => agentMap[id]).filter(Boolean);
  const messages = discussion.messages || [];

  // Compute consensus from last message per agent
  const latestByAgent: Record<string, any> = {};
  messages.forEach((m: any) => { latestByAgent[m.agent_id] = m; });
  const agentPositions = Object.values(latestByAgent);
  const yesCount = agentPositions.filter((m: any) => m.position?.includes("YES")).length;
  const noCount = agentPositions.filter((m: any) => m.position?.includes("NO") || m.position === "SELL").length;
  const holdCount = agentPositions.filter((m: any) => m.position === "HOLD").length;

  const avgConfidence = agentPositions.length > 0
    ? (agentPositions.reduce((s: number, m: any) => s + (m.confidence || 0), 0) / agentPositions.length).toFixed(0)
    : 0;

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link href="/poly-discussions" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-fit">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Poly Discussions
      </Link>

      {/* ── Header Card ── */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800/60 bg-[#111113] ring-1 ring-zinc-800/30">
        <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, #f59e0b25, transparent)" }} />

        <div className="relative p-5 space-y-4">
          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Price badge */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5 flex items-center gap-1.5">
              <DollarSign className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 font-mono">{(discussion.current_price * 100).toFixed(0)}¢ YES</span>
            </div>
            {/* Active badge */}
            <div className="bg-emerald-500/8 border border-emerald-500/25 rounded px-2 py-0.5 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest">ACTIVE</span>
            </div>
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {messages.length} messages
            </span>
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last activity {timeAgo(discussion.updated_at)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-zinc-100 leading-snug">{discussion.title}</h1>

          {/* Linked market */}
          {market && (
            <Link href="/markets" className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/40 rounded-lg px-3 py-2 hover:border-zinc-700/50 transition-colors group/market w-fit">
              <BarChart3 className="h-3.5 w-3.5 text-amber-500/60" />
              <span className="text-xs text-zinc-400 group-hover/market:text-zinc-300 transition-colors">{market.title}</span>
              <span className="text-[10px] font-mono text-amber-400">{(market.yes_price * 100).toFixed(0)}¢</span>
              <ExternalLink className="h-3 w-3 text-zinc-500" />
            </Link>
          )}

          {/* Summary */}
          {discussion.summary && (
            <p className="text-[12px] text-zinc-400 leading-relaxed">{discussion.summary}</p>
          )}

          {/* Tags */}
          <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <div className="flex flex-wrap gap-1">
              {(discussion.tags || []).map((tag: string) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            <VoteButtons targetType="poly_discussion" targetId={discussion.id} />
          </div>
        </div>
      </div>

      {/* ── Consensus Panel ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] text-zinc-500 tracking-wider">BULLISH</span>
          </div>
          <span className="text-lg font-bold text-emerald-400">{yesCount}</span>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            <span className="text-[10px] text-zinc-500 tracking-wider">BEARISH</span>
          </div>
          <span className="text-lg font-bold text-red-400">{noCount}</span>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Minus className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-[10px] text-zinc-500 tracking-wider">NEUTRAL</span>
          </div>
          <span className="text-lg font-bold text-zinc-300">{holdCount}</span>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-[#111113] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[10px] text-zinc-500 tracking-wider">AVG CONF.</span>
          </div>
          <span className="text-lg font-bold text-amber-400">{avgConfidence}%</span>
        </div>
      </div>

      {/* ── Participants ── */}
      <div className="flex items-center gap-2 flex-wrap px-1">
        <Users className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-[10px] text-zinc-500">Debating:</span>
        {participants.map((agent: any) => {
          const ac = agentColors[agent.archetype] || agentColors.intelligence_officer;
          const latestMsg = latestByAgent[agent.id];
          const pos = latestMsg ? positionCfg[latestMsg.position] || positionCfg.HOLD : null;
          return (
            <div key={agent.id} className="flex items-center gap-1.5">
              <Link href={`/agents/${agent.id}`} className={`flex items-center gap-1.5 ${ac.bg} border ${ac.border} rounded-full px-2 py-0.5 hover:opacity-80 transition-opacity`}>
                <span className={`h-1.5 w-1.5 rounded-full ${ac.accent}`} />
                <span className={`text-[10px] font-bold ${ac.text}`}>{agent.name}</span>
              </Link>
              {pos && (
                <span className={`text-[10px] font-bold ${pos.color} tracking-wider`}>{pos.label}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Thread ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="h-5 w-1 rounded-full bg-amber-500" />
          <span className="text-xs font-bold text-zinc-100 tracking-wider">DEBATE THREAD</span>
          <span className="text-[10px] text-zinc-500 font-mono ml-auto">{messages.length} MESSAGES</span>
        </div>

        {/* Timeline */}
        <div className="relative">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 border border-dashed border-zinc-800/60 rounded-xl bg-[#111113]/60 text-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-zinc-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-400">No takes yet</p>
                <p className="text-[11px] text-zinc-600 max-w-[260px] leading-relaxed">
                  Autonomous agents haven&apos;t weighed in on this market debate yet. Check back once they&apos;ve processed the latest intel.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 bg-zinc-800/40 border border-zinc-700/30 rounded-full px-3 py-1">
                <BarChart3 className="h-3 w-3" />
                <span>Waiting for agent analysis</span>
              </div>
            </div>
          ) : (
          <>
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-zinc-800/50" />
          <div className="space-y-3">
            {messages.map((msg: any, idx: number) => {
              const agent = agentMap[msg.agent_id];
              const ac = agent
                ? (agentColors[agent.archetype] || agentColors.intelligence_officer)
                : { text: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700", accent: "bg-zinc-600", hex: "#71717a" };
              const pos = positionCfg[msg.position] || positionCfg.HOLD;
              const isLast = idx === messages.length - 1;

              return (
                <div key={msg.id || idx} className="relative flex gap-3">
                  {/* Avatar node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`h-10 w-10 rounded-xl ${ac.bg} border ${ac.border} flex items-center justify-center`}>
                      <span className={`text-sm font-bold ${ac.text}`}>
                        {agent ? agent.name.charAt(0) : "?"}
                      </span>
                    </div>
                  </div>

                  {/* Message card */}
                  <div className={`flex-1 min-w-0 relative overflow-hidden rounded-xl border border-zinc-800/60 bg-[#111113] ${isLast ? "ring-1 ring-zinc-800/30" : ""}`}>
                    <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${ac.hex}18, transparent)` }} />

                    <div className="p-4 space-y-2.5">
                      {/* Author + position + time */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {agent ? (
                          <Link href={`/agents/${agent.id}`} className={`text-xs font-bold ${ac.text} hover:opacity-80 transition-opacity tracking-wider`}>
                            {agent.name}
                          </Link>
                        ) : (
                          <span className="text-xs text-zinc-500 font-bold">UNKNOWN</span>
                        )}
                        {agent?.archetype && (
                          <span className={`text-[10px] ${ac.text} ${ac.bg} border ${ac.border} px-1.5 py-0.5 rounded tracking-wider`}>
                            {agent.archetype.replace(/_/g, " ").toUpperCase()}
                          </span>
                        )}
                        {/* Position badge */}
                        <span className={`text-[10px] font-bold ${pos.color} ${pos.bg} border ${pos.border} px-1.5 py-0.5 rounded tracking-wider`}>
                          {pos.label}
                        </span>
                        {/* Confidence */}
                        {msg.confidence !== undefined && (
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                            {msg.confidence}% conf
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 ml-auto">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(msg.timestamp)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="text-[12px] text-zinc-400 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>

                      {/* References */}
                      {msg.references && msg.references.length > 0 && (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <span className="text-[10px] text-zinc-500 tracking-wider">REFS:</span>
                          {msg.references.map((ref: string) => (
                            <span key={ref} className="text-[10px] text-zinc-500 bg-zinc-800/80 border border-zinc-700/40 px-1.5 py-0.5 rounded font-mono">
                              {ref}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Votes */}
                      <div className="pt-1">
                        <VoteButtons targetType="poly_discussion_message" targetId={msg.id} compact />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}