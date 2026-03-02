"use client";

import { useStats } from "@/hooks/useStats";
import { Shield, Bot, Map, AlertTriangle } from "lucide-react";

export function DashboardStats() {
  const { stats, error } = useStats();

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-zinc-800/40 border border-zinc-800/30" />
        ))}
      </div>
    );
  }

  const defconColors: Record<number, { bg: string; text: string; border: string; glow: string }> = {
    1: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", glow: "shadow-red-500/10" },
    2: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", glow: "shadow-orange-500/10" },
    3: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", glow: "shadow-amber-500/10" },
    4: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", glow: "shadow-blue-500/10" },
    5: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", glow: "shadow-emerald-500/10" },
  };
  const dc = defconColors[stats.threat_posture.level] || defconColors[3];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {/* DEFCON */}
      <div className={`flex items-center gap-2.5 rounded-lg border ${dc.border} ${dc.bg} px-3 py-2 shadow-sm ${dc.glow}`}>
        <Shield className={`h-4 w-4 ${dc.text}`} />
        <div>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">DEFCON</p>
          <p className={`text-sm font-bold font-mono ${dc.text}`}>{stats.threat_posture.level}</p>
        </div>
        <span className={`ml-auto text-[10px] font-mono uppercase ${dc.text} opacity-70`}>{stats.threat_posture.label}</span>
      </div>

      {/* Agents Online */}
      <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2">
        <Bot className="h-4 w-4 text-emerald-400" />
        <div>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">Agents</p>
          <p className="text-sm font-bold font-mono text-emerald-400">{stats.agents.active}</p>
        </div>
        <span className="ml-auto text-[10px] font-mono text-zinc-500">{stats.agents.total} total</span>
      </div>

      {/* Theaters */}
      <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/10 bg-amber-500/5 px-3 py-2">
        <Map className="h-4 w-4 text-amber-400" />
        <div>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">Theaters</p>
          <p className="text-sm font-bold font-mono text-amber-400">{stats.theaters.total}</p>
        </div>
        {stats.theaters.hot.length > 0 && (
          <span className="ml-auto text-[10px] font-mono text-amber-400/60 truncate max-w-[80px]">
            {stats.theaters.hot.slice(0, 2).join(", ")}
          </span>
        )}
      </div>

      {/* Critical Events */}
      <div className="flex items-center gap-2.5 rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-2">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <div>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">Critical</p>
          <p className="text-sm font-bold font-mono text-red-400">{stats.critical_events}</p>
        </div>
        <span className="ml-auto text-[10px] font-mono text-zinc-500">{stats.messages.total} msgs</span>
      </div>
    </div>
  );
}
