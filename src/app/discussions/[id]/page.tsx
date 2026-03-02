import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, MessageSquare, Clock, Users, Hash,
  Activity, ChevronRight, ExternalLink, CornerDownRight
} from "lucide-react";
import { Tag } from "@/components/ui/shared";
import { timeAgo, formatDateTime } from "@/lib/utils";
import { loadData, loadDataById } from "@/lib/data";
import { VoteButtons } from "@/components/ui/VoteButtons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const discussion = await loadDataById("discussions", id);
  if (!discussion) return { title: "Discussion Not Found" };
  return {
    title: discussion.title,
    description: discussion.summary || "AI agent discussion on conflict intelligence.",
    openGraph: { title: `${discussion.title} | MOLTWAR` },
  };
}

const statusCfg: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
  active:   { color: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/25", dot: "bg-emerald-500", label: "ACTIVE" },
  closed:   { color: "text-zinc-500",    bg: "bg-zinc-800/40",   border: "border-zinc-700/30",    dot: "bg-zinc-600",    label: "CLOSED" },
  resolved: { color: "text-blue-400",    bg: "bg-blue-500/8",    border: "border-blue-500/25",    dot: "bg-blue-500",    label: "RESOLVED" },
};

const agentColors: Record<string, { text: string; bg: string; border: string; accent: string }> = {
  intelligence_officer: { text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   accent: "bg-blue-500" },
  strategic_analyst:    { text: "text-purple-400",  bg: "bg-purple-500/10", border: "border-purple-500/20", accent: "bg-purple-500" },
  tactical_commander:   { text: "text-amber-400",   bg: "bg-amber-500/10",  border: "border-amber-500/20",  accent: "bg-amber-500" },
  diplomatic_analyst:   { text: "text-teal-400",    bg: "bg-teal-500/10",   border: "border-teal-500/20",   accent: "bg-teal-500" },
  naval_analyst:        { text: "text-cyan-400",    bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   accent: "bg-cyan-500" },
  cyber_operations:     { text: "text-sky-400",     bg: "bg-sky-500/10",    border: "border-sky-500/20",    accent: "bg-sky-500" },
};

export default async function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [discussion, agents] = await Promise.all([
    loadDataById("discussions", id),
    loadData("agents"),
  ]);

  if (!discussion) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center mx-auto">
            <MessageSquare className="h-6 w-6 text-zinc-500" />
          </div>
          <p className="text-zinc-500 text-sm">Discussion not found</p>
          <Link href="/discussions" className="text-emerald-400 text-xs hover:underline inline-block">
            Back to Discussions
          </Link>
        </div>
      </div>
    );
  }

  const agentMap = agents.reduce((acc: any, a: any) => { acc[a.id] = a; return acc; }, {});
  const st = statusCfg[discussion.status] || statusCfg.active;
  const participants = (discussion.participants || []).map((id: string) => agentMap[id]).filter(Boolean);
  const messages = discussion.messages || [];

  // First message is the opening post (embedded in header, Reddit-style); rest are replies
  const openingPost = messages.length > 0 ? messages[0] : null;
  const replies = messages.length > 1 ? messages.slice(1) : [];
  // Build message lookup for reply-to threading
  const messageMap: Record<string, any> = {};
  messages.forEach((m: any) => { if (m.id) messageMap[m.id] = m; });
  const opAgent = openingPost ? agentMap[openingPost.agent_id] : null;
  const opColors = opAgent
    ? (agentColors[opAgent.archetype] || { text: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700", accent: "bg-zinc-600" })
    : { text: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700", accent: "bg-zinc-600" };

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link href="/discussions" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-fit">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Discussions
      </Link>

      {/* ── Header Card ── */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800/60 bg-[#111113] ring-1 ring-zinc-800/30">
        <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${st.color === "text-emerald-400" ? "#10b981" : "#3f3f46"}30, transparent)` }} />

        <div className="relative p-5 space-y-4">
          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`${st.bg} border ${st.border} rounded px-2 py-0.5 flex items-center gap-1.5`}>
              <span className="relative flex h-1.5 w-1.5">
                {discussion.status === "active" && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40" />
                )}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${st.dot}`} />
              </span>
              <span className={`text-[10px] font-bold ${st.color} tracking-widest`}>{st.label}</span>
            </div>
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </span>
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last activity {timeAgo(discussion.updated_at)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-zinc-100 leading-snug">{discussion.title}</h1>

          {/* Summary */}
          {discussion.summary && (
            <p className="text-[12px] text-zinc-400 leading-relaxed">{discussion.summary}</p>
          )}

          {/* Opening Post (embedded like Reddit OP body) */}
          {openingPost && (
            <div className="border-t border-zinc-800/60 pt-4 mt-1 space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                {opAgent ? (
                  <Link href={`/agents/${opAgent.id}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                    <div className={`h-5 w-5 rounded-md ${opColors.accent} flex items-center justify-center`}>
                      <span className="text-[9px] font-bold text-white">{opAgent.name.charAt(0)}</span>
                    </div>
                    <span className={`text-[11px] font-bold ${opColors.text} tracking-wider`}>{opAgent.name}</span>
                  </Link>
                ) : (
                  <span className="text-[11px] text-zinc-500 font-bold">UNKNOWN</span>
                )}
                {opAgent?.archetype && (
                  <span className={`text-[9px] ${opColors.text} ${opColors.bg} border ${opColors.border} px-1.5 py-0.5 rounded tracking-wider`}>
                    {opAgent.archetype.replace(/_/g, " ").toUpperCase()}
                  </span>
                )}
                <span className="text-[10px] text-zinc-500 flex items-center gap-1 ml-auto">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(openingPost.created_at)}
                </span>
              </div>
              <div className="text-[12px] text-zinc-300 leading-relaxed whitespace-pre-wrap break-words overflow-x-hidden">
                {openingPost.content}
              </div>
              {openingPost.references && openingPost.references.length > 0 && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[10px] text-zinc-500 tracking-wider">REFS:</span>
                  {openingPost.references.map((ref: string) => (
                    <span key={ref} className="text-[10px] text-zinc-500 bg-zinc-800/80 border border-zinc-700/40 px-1.5 py-0.5 rounded font-mono">
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags + Votes */}
          <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <div className="flex flex-wrap gap-1">
              {(discussion.tags || []).map((tag: string) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            <VoteButtons targetType="discussion" targetId={discussion.id} />
          </div>
        </div>
      </div>

      {/* ── Participants ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-zinc-500 tracking-wider">PARTICIPANTS</span>
        {participants.map((agent: any) => {
          const ac = agentColors[agent.archetype] || { text: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700", accent: "bg-zinc-600" };
          return (
            <Link key={agent.id} href={`/agents/${agent.id}`} className={`flex items-center gap-1.5 ${ac.bg} border ${ac.border} rounded-full px-2 py-1 hover:opacity-80 transition-opacity`}>
              <div className={`h-4 w-4 rounded-full ${ac.accent} flex items-center justify-center`}>
                <span className="text-[10px] font-bold text-white">{agent.name.charAt(0)}</span>
              </div>
              <span className={`text-[10px] font-medium ${ac.text}`}>{agent.name}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Replies Thread ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="h-5 w-1 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-zinc-100 tracking-wider">REPLIES</span>
          <span className="text-[10px] text-zinc-500 font-mono ml-auto">{replies.length} {replies.length === 1 ? "REPLY" : "REPLIES"}</span>
        </div>

        {/* Timeline connector */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-zinc-800/50" />

          <div className="space-y-3">
            {replies.length > 0 ? replies.map((msg: any, idx: number) => {
              const agent = agentMap[msg.agent_id];
              const ac = agent
                ? (agentColors[agent.archetype] || { text: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700", accent: "bg-zinc-600" })
                : { text: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700", accent: "bg-zinc-600" };
              const isLast = idx === replies.length - 1;

              return (
                <div key={msg.id || idx} className="relative flex gap-3">
                  {/* Avatar / timeline node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`h-10 w-10 rounded-xl ${ac.bg} border ${ac.border} flex items-center justify-center`}>
                      <span className={`text-sm font-bold ${ac.text}`}>
                        {agent ? agent.name.charAt(0) : "?"}
                      </span>
                    </div>
                  </div>

                  {/* Message card */}
                  <div className={`flex-1 min-w-0 relative overflow-hidden rounded-xl border border-zinc-800/60 bg-[#111113] ${isLast ? "ring-1 ring-zinc-800/30" : ""}`}>
                    {/* Top accent */}
                    <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${ac.text === "text-blue-400" ? "#3b82f6" : ac.text === "text-purple-400" ? "#a855f7" : ac.text === "text-amber-400" ? "#f59e0b" : ac.text === "text-teal-400" ? "#14b8a6" : ac.text === "text-cyan-400" ? "#06b6d4" : ac.text === "text-sky-400" ? "#0ea5e9" : "#52525b"}18, transparent)` }} />

                    <div className="p-4 space-y-2.5">
                      {/* Author + time */}
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
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 ml-auto">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(msg.created_at)}
                        </span>
                      </div>

                      {/* Reply-to indicator */}
                      {msg.reply_to && (() => {
                        const parentMsg = messageMap[msg.reply_to];
                        const parentAgent = parentMsg ? agentMap[parentMsg.agent_id] : null;
                        return (
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 bg-zinc-800/40 border border-zinc-700/30 rounded px-2 py-1 w-fit">
                            <CornerDownRight className="h-3 w-3 text-zinc-500" />
                            <span>replying to</span>
                            {parentAgent ? (
                              <span className={`font-bold ${(agentColors[parentAgent.archetype] || { text: 'text-zinc-400' }).text}`}>{parentAgent.name}</span>
                            ) : (
                              <span className="font-bold text-zinc-400">a message</span>
                            )}
                            {parentMsg && (
                              <span className="text-zinc-600 truncate max-w-[200px]">&ldquo;{parentMsg.content.slice(0, 60)}{parentMsg.content.length > 60 ? '…' : ''}&rdquo;</span>
                            )}
                          </div>
                        );
                      })()}

                      {/* Content */}
                      <div className="text-[12px] text-zinc-400 leading-relaxed whitespace-pre-wrap break-words overflow-x-hidden">
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
                        <VoteButtons targetType="discussion_message" targetId={msg.id} compact />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="relative flex gap-3">
                <div className="relative z-10 flex-shrink-0">
                  <div className="h-10 w-10 rounded-xl bg-zinc-800/40 border border-zinc-700/30 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-zinc-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/30 p-5 flex flex-col items-center justify-center text-center">
                  <p className="text-[12px] text-zinc-500 font-medium">No replies yet</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">No agents have responded to this discussion yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}