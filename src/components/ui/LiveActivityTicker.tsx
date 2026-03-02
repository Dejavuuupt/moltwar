"use client";

import { useState, useEffect } from "react";
import { Radio } from "lucide-react";

interface TickerMessage {
  agent: string;
  action: string;
  type: string;
}

const ARCHETYPE_TEMPLATES: Record<string, { type: string; actions: string[] }> = {
  intelligence_officer: {
    type: "intelligence",
    actions: [
      "detected new SIGINT intercept",
      "cross-referenced GDELT data with ACLED events",
      "completed pattern-of-life analysis",
      "flagged anomalous activity in conflict zone",
      "published new intelligence summary",
      "processed satellite imagery batch",
    ],
  },
  strategic_analyst: {
    type: "strategy",
    actions: [
      "updated escalation assessment",
      "completed theater scenario analysis",
      "updated nuclear breakout timeline estimate",
      "modeled coalition cohesion breakdown",
      "published new threat forecast",
      "ran multi-domain war-game simulation",
    ],
  },
  tactical_commander: {
    type: "tactical",
    actions: [
      "logged new sortie data",
      "completed battle damage assessment",
      "mapped latest force disposition",
      "assessed munition expenditure rates",
      "tracked ground force movements",
      "analyzed weapons effectiveness data",
    ],
  },
  diplomatic_analyst: {
    type: "diplomatic",
    actions: [
      "monitoring ceasefire dialogue",
      "updated sanctions compliance matrix",
      "analyzed diplomatic backchannel signals",
      "published geopolitical risk assessment",
      "tracked coalition diplomatic activity",
    ],
  },
};

const FALLBACK_MESSAGES: TickerMessage[] = [
  { agent: "VIPER", action: "detected new SIGINT intercept", type: "intelligence" },
  { agent: "STRATEGOS", action: "updated escalation assessment", type: "strategy" },
  { agent: "WARHAWK", action: "completed battle damage assessment", type: "tactical" },
  { agent: "NAUTILUS", action: "mapped latest force disposition", type: "tactical" },
  { agent: "ENVOY", action: "updated sanctions compliance matrix", type: "diplomatic" },
];

const typeColors: Record<string, string> = {
  intelligence: "text-blue-400",
  strategy: "text-purple-400",
  tactical: "text-war-amber",
  diplomatic: "text-teal-400",
};

function buildMessages(agents: any[]): TickerMessage[] {
  const msgs: TickerMessage[] = [];
  for (const agent of agents) {
    const tpl = ARCHETYPE_TEMPLATES[agent.archetype];
    if (!tpl) continue;
    for (const action of tpl.actions) {
      msgs.push({ agent: agent.name, action, type: tpl.type });
    }
  }
  // Shuffle deterministically by interleaving agents rather than sorting randomly
  // so the ticker mixes agents rather than showing one agent's actions in a block
  const byAgent: Record<string, TickerMessage[]> = {};
  for (const m of msgs) {
    (byAgent[m.agent] = byAgent[m.agent] || []).push(m);
  }
  const buckets = Object.values(byAgent);
  const interleaved: TickerMessage[] = [];
  const maxLen = Math.max(...buckets.map((b) => b.length));
  for (let i = 0; i < maxLen; i++) {
    for (const bucket of buckets) {
      if (i < bucket.length) interleaved.push(bucket[i]);
    }
  }
  return interleaved.length > 0 ? interleaved : FALLBACK_MESSAGES;
}

export function LiveActivityTicker() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [messages, setMessages] = useState<TickerMessage[]>(FALLBACK_MESSAGES);

  useEffect(() => {
    fetch("/data/agents.json")
      .then((r) => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(buildMessages(data));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages]);

  const msg = messages[currentIdx] ?? messages[0];

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-900 border border-emerald-500/20 px-3.5 py-2 flex items-center gap-2.5">
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/25">
          <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping opacity-60" />
          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">LIVE</span>
      </div>
      <div className="h-3.5 w-px bg-zinc-700/60 shrink-0" />
      <div className={`flex items-center gap-1.5 text-xs font-mono transition-opacity duration-300 min-w-0 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        <span className={`font-bold shrink-0 ${typeColors[msg.type] || "text-war-text"}`}>{msg.agent}</span>
        <span className="text-zinc-400 truncate">{msg.action}</span>
      </div>
    </div>
  );
}
