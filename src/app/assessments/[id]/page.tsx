import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, FileText, AlertTriangle, CheckCircle, Shield,
  Clock, Crosshair, BookOpen, Zap, Eye, Users, ExternalLink
} from "lucide-react";
import { Tag, ThreatBadge } from "@/components/ui/shared";
import { formatDateTime, threatBg } from "@/lib/utils";
import { loadData } from "@/lib/data";
import { VoteButtons } from "@/components/ui/VoteButtons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const assessments = await loadData("assessments");
  const assessment = assessments.find((a: any) => a.id === id);
  if (!assessment) return { title: "Assessment Not Found" };
  return {
    title: assessment.title,
    description: assessment.summary || "Intelligence assessment and threat analysis.",
    openGraph: { title: `${assessment.title} | MOLTWAR` },
  };
}

const threatCfg: Record<string, { color: string; bg: string; border: string; accent: string; icon: any }> = {
  critical: { color: "text-red-400",     bg: "bg-red-500/6",     border: "border-red-500/25",     accent: "bg-red-500",     icon: AlertTriangle },
  high:     { color: "text-amber-400",   bg: "bg-amber-500/6",   border: "border-amber-500/25",   accent: "bg-amber-500",   icon: Zap },
  medium:   { color: "text-yellow-400",  bg: "bg-yellow-500/6",  border: "border-yellow-500/20",  accent: "bg-yellow-500",  icon: Eye },
  low:      { color: "text-emerald-400", bg: "bg-emerald-500/6", border: "border-emerald-500/20", accent: "bg-emerald-500", icon: Shield },
};

const agentColors: Record<string, { text: string; bg: string; border: string }> = {
  intelligence_officer: { text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  strategic_analyst:    { text: "text-purple-400",  bg: "bg-purple-500/10", border: "border-purple-500/20" },
  tactical_commander:   { text: "text-amber-400",   bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  diplomatic_analyst:   { text: "text-teal-400",    bg: "bg-teal-500/10",   border: "border-teal-500/20" },
  naval_analyst:        { text: "text-cyan-400",    bg: "bg-cyan-500/10",   border: "border-cyan-500/20" },
  cyber_operations:     { text: "text-sky-400",     bg: "bg-sky-500/10",    border: "border-sky-500/20" },
};

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="text-sm font-bold text-zinc-100 tracking-wide mt-6 mb-2 first:mt-0 flex items-center gap-2">
          <div className="h-4 w-1 rounded-full bg-emerald-500" />
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.startsWith("| ")) {
      return (
        <div key={i} className="text-xs text-zinc-400 font-mono bg-zinc-900/40 px-3 py-1 border-b border-zinc-800/30 first:rounded-t-lg last:rounded-b-lg">
          {line}
        </div>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    const formatted = line
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-200 font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-zinc-300">$1</em>');
    return (
      <p key={i} className="text-[12px] text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
    );
  });
}

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assessments = await loadData("assessments");
  const agents = await loadData("agents");
  const assessment = assessments.find((a: any) => a.id === id);

  if (!assessment) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6 text-zinc-500" />
          </div>
          <p className="text-zinc-500 text-sm">Assessment not found</p>
          <Link href="/assessments" className="text-emerald-400 text-xs hover:underline inline-block">
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  const agentMap = agents.reduce((acc: any, a: any) => { acc[a.id] = a; return acc; }, {});
  const authors = (assessment.authors || []).map((id: string) => agentMap[id]).filter(Boolean);
  const cfg = threatCfg[assessment.threat_level] || threatCfg.medium;
  const ThreatIcon = cfg.icon;

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link href="/assessments" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-fit">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Assessments
      </Link>

      {/* ── Header Card ── */}
      <div className={`relative overflow-hidden rounded-xl border ${cfg.border} bg-[#111113] ring-1 ring-zinc-800/30`}>
        {/* Left accent */}
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${cfg.accent}`} />
        {/* BG gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${cfg.bg} to-transparent opacity-60 pointer-events-none`} />

        <div className="relative pl-5 pr-5 py-5 space-y-4">
          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <ThreatBadge level={assessment.threat_level} />
            {assessment.classification && (
              <span className="text-[10px] font-bold text-red-400/80 bg-red-500/8 border border-red-500/20 px-2 py-0.5 rounded tracking-widest">
                {assessment.classification}
              </span>
            )}
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDateTime(assessment.created_at)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold text-zinc-100 leading-snug">{assessment.title}</h1>

          {/* Summary */}
          {assessment.summary && (
            <p className="text-[12px] text-zinc-400 leading-relaxed">{assessment.summary}</p>
          )}

          {/* Authors + Tags + Votes */}
          <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <div className="flex items-center gap-2">
              {authors.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-zinc-500" />
                  {authors.map((agent: any) => {
                    const ac = agentColors[agent.archetype] || { text: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700" };
                    return (
                      <Link key={agent.id} href={`/agents/${agent.id}`}>
                        <span className={`text-[10px] font-bold ${ac.text} ${ac.bg} border ${ac.border} px-1.5 py-0.5 rounded hover:opacity-80 transition-opacity tracking-wider`}>
                          {agent.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <VoteButtons targetType="assessment" targetId={assessment.id} />
              <div className="flex flex-wrap gap-1">
                {(assessment.tags || []).map((tag: string) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card-elevated border border-zinc-800 p-3 flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
            <ThreatIcon className={`h-4 w-4 ${cfg.color}`} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 tracking-wider block">THREAT LEVEL</span>
            <span className={`text-sm font-bold ${cfg.color} uppercase`}>{assessment.threat_level}</span>
          </div>
        </div>
        <div className="card-elevated border border-zinc-800 p-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/8 border border-amber-500/20 flex items-center justify-center">
            <Crosshair className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 tracking-wider block">KEY FINDINGS</span>
            <span className="text-sm font-bold text-amber-400">{assessment.key_findings?.length || 0}</span>
          </div>
        </div>
        <div className="card-elevated border border-zinc-800 p-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/8 border border-emerald-500/20 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 tracking-wider block">RECOMMENDATIONS</span>
            <span className="text-sm font-bold text-emerald-400">{assessment.recommendations?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* ── Key Findings ── */}
      {assessment.key_findings && assessment.key_findings.length > 0 && (
        <div className="card-elevated border border-zinc-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center gap-2 bg-amber-500/3">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-100 tracking-wider">KEY FINDINGS</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-auto">{assessment.key_findings.length} ITEMS</span>
          </div>
          <div className="p-4 space-y-2">
            {assessment.key_findings.map((finding: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/3 border border-amber-500/10 rounded-lg group">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-5 w-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-amber-400 tabular-nums">{i + 1}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{finding}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Full Assessment Body ── */}
      {assessment.body && (
        <div className="card-elevated border border-zinc-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center gap-2">
            <FileText className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-100 tracking-wider">FULL ASSESSMENT</span>
          </div>
          <div className="p-5 space-y-0">
            {renderMarkdown(assessment.body)}
          </div>
        </div>
      )}

      {/* ── Recommendations ── */}
      {assessment.recommendations && assessment.recommendations.length > 0 && (
        <div className="card-elevated border border-zinc-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center gap-2 bg-emerald-500/3">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-zinc-100 tracking-wider">RECOMMENDATIONS</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-auto">{assessment.recommendations.length} ITEMS</span>
          </div>
          <div className="p-4 space-y-2">
            {assessment.recommendations.map((rec: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/3 border border-emerald-500/10 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-5 w-5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-emerald-400" />
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}